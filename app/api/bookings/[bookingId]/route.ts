import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	isDeviceAvailable,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	bookingId: string
}

export const GET = auth(async function GET(request, { params }) {
	try {
		await authorizeApiEndpoint(request)
		const { bookingId } = params as DynamicParams
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: {
				id: true,
				device: { select: { id: true, name: true, building: true, room: true } },
				user: { select: { id: true, email: true } },
				startTime: true,
				endTime: true,
				duration: true,
				createdAt: true,
				updatedAt: true,
				isCanceled: true,
			},
		})
		if (booking) return NextResponse.json(booking, { status: 200 })
		else return NextResponse.json({ message: 'No Booking found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

function parseBodyData(body: Record<string, string>) {
	const output: Record<string, string> = {}
	if ('startTime' in body) output.name = body.name
	if ('endTime' in body) output.name = body.description
	return output
}

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { bookingId } = params as DynamicParams
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { startTime: true, endTime: true, userId: true, deviceId: true },
		})
		if (!booking) return NextResponse.json({ message: 'No Booking found with specified ID' }, { status: 400 }) //prettier-ignore
		await ensureAdminOrCertainUser(auth, booking.userId)

		const body = await parseJsonBody(request)
		const data = parseBodyData(body)

		if (Object.keys(data).length === 0) return NextResponse.json({ message: 'No data provided' }, { status: 400 }) //prettier-ignore

		const newData = { ...booking, ...data }
		const isAvailable = await isDeviceAvailable(newData.deviceId, newData.startTime, newData.endTime)
		if (!isAvailable) throw NextResponse.json({ message: 'Device already reserved in provided timespan' }, { status: 400 }) //prettier-ignore

		const seekDuration = 1000 * 60 * 60 * 24 * 15
		const startSearch = new Date(newData.startTime.getTime() - seekDuration)
		const endSearch = new Date(newData.endTime.getTime() + seekDuration)

		const userMonthSpanReservations = await prisma.booking.findMany({
			where: {
				id: { not: bookingId },
				endTime: { gte: startSearch },
				startTime: { lte: endSearch },
				userId: newData.userId,
			},
		})

		const userMonthSpanQuota = userMonthSpanReservations.reduce((sum, r) => (sum += r.duration), 0)
		const duration = Math.ceil((newData.endTime.getTime() - newData.startTime.getTime()) / 1000 / 60 / 60) //prettier-ignore

		const user = await prisma.user.findUnique({
			where: { id: newData.userId },
			select: { monthlyLimit: true },
		})
		const didExceededLimit = userMonthSpanQuota + duration > user!.monthlyLimit
		if (didExceededLimit)
			throw NextResponse.json({ message: 'User monthly limit exceeded' }, { status: 400 })

		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: newData,
			select: {
				id: true,
				device: { select: { id: true, name: true, building: true, room: true } },
				user: { select: { id: true, email: true } },
				startTime: true,
				endTime: true,
				duration: true,
				createdAt: true,
				updatedAt: true,
				isCanceled: true,
			},
		})
		if (updatedBooking != null) return NextResponse.json(updatedBooking, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { bookingId } = (await params) as DynamicParams
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { userId: true },
		})
		if (!booking) return NextResponse.json({ message: 'No Booking found with specified ID' }, { status: 400 }) //prettier-ignore
		await ensureAdminOrCertainUser(auth, booking.userId)
		await prisma.booking.update({ where: { id: bookingId }, data: { isCanceled: true } })
		return NextResponse.json({ message: 'Successful' }, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
