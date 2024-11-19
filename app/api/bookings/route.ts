import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	isDeviceAvailable,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const deviceId = request.nextUrl.searchParams.get('deviceId') ?? undefined
		const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10)
		const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10)
		const offset = (page - 1) * limit
		const totalCount = await prisma.booking.count()
		const totalPages = Math.ceil(totalCount / limit)

		const bookings = await prisma.booking.findMany({
			skip: offset,
			take: limit,
			where: { deviceId, isCanceled: false },
			select: {
				id: true,
				device: { select: { id: true, name: true, building: true, room: true } },
				user: { select: { id: true, email: true } },
				startTime: true,
				endTime: true,
			},
		})
		return NextResponse.json(
			{
				bookings,
				meta: {
					page,
					limit,
					totalPages,
					totalCount,
				},
			},
			{ status: 200 }
		)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

const requestDataSchema = z.object({
	userId: z.string({ required_error: "'userId' is required" }),
	deviceId: z.string({ required_error: "'deviceId' is required" }),
	startTime: z
		.date({ required_error: "'startTime' is required" })
		.min(new Date(), 'Date must be in future'),
	endTime: z
		.date({ required_error: "'startTime' is required" })
		.min(new Date(), 'Date must be in future'),
})

export const POST = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)

		const body = await parseJsonBody(request)
		const { userId, deviceId, startTime, endTime } = requestDataSchema.parse(body)
		ensureAdminOrCertainUser(auth, userId)

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { monthlyLimit: true },
		})
		if (user === null)
			throw NextResponse.json({ message: 'User with such an ID doesnt exist' }, { status: 400 })

		const device = await prisma.device.findUnique({ where: { id: deviceId }, select: { id: true } })
		if (device === null)
			throw NextResponse.json({ message: 'Device with such an ID doesnt exist' }, { status: 400 })

		const isAvailable = await isDeviceAvailable(deviceId, startTime, endTime)
		if (!isAvailable) throw NextResponse.json({ message: 'Device already reserved in provided timespan' }, { status: 400 }) //prettier-ignore

		const seekDuration = 1000 * 60 * 60 * 24 * 15
		const startSearch = new Date(startTime.getTime() - seekDuration)
		const endSearch = new Date(endTime.getTime() + seekDuration)

		const userMonthSpanReservations = await prisma.booking.findMany({
			where: {
				endTime: { gte: startSearch },
				startTime: { lte: endSearch },
				userId: userId,
			},
		})

		const userMonthSpanQuota = userMonthSpanReservations.reduce((sum, r) => (sum += r.duration), 0)
		const duration = Math.ceil((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60)

		const didExceededLimit = userMonthSpanQuota + duration > user.monthlyLimit
		if (didExceededLimit)
			throw NextResponse.json({ message: 'User monthly limit exceeded' }, { status: 400 })

		const createdBooking = await prisma.booking.create({
			data: { startTime, endTime, duration, deviceId, userId },
			select: { id: true },
		})

		return NextResponse.json(createdBooking, { status: 201 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
