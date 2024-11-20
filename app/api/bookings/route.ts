import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	getPaginationParams,
	isDeviceAvailable,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import { getHoursFromTimeRange, getUserMonthSpanQuota } from '@/lib/bookings'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { createBookingSchema } from '@/lib/zod'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const deviceId = request.nextUrl.searchParams.get('deviceId') ?? undefined
		const { page, limit, offset } = getPaginationParams(request)
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

		return RESPONSES.SUCCESS.RESOURCE.MANY_RETRIEVED('booking', bookings, {
			limit,
			page,
			totalCount,
			totalPages,
		})
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const POST = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const body = await parseJsonBody(request)
		const { userId, deviceId, startTime, endTime } = createBookingSchema.parse(body)
		ensureAdminOrCertainUser(auth, userId)

		const user = await prisma.user.findUnique({where: { id: userId }, select: { monthlyLimit: true }}) //prettier-ignore
		if (user === null) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')

		const device = await prisma.device.findUnique({ where: { id: deviceId }, select: { id: true } })
		if (device === null) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('device')

		const isAvailable = await isDeviceAvailable(deviceId, startTime, endTime)
		if (!isAvailable) return RESPONSES.ERROR.DEVICE_UNAVAILABLE

		const duration = getHoursFromTimeRange(startTime, endTime)
		const userMonthSpanQuota = await getUserMonthSpanQuota(userId, startTime, endTime)
		const didExceededLimit = userMonthSpanQuota + duration > user.monthlyLimit
		if (didExceededLimit) return RESPONSES.ERROR.MONTHLY_LIMIT_EXCEEDED

		const createdBooking = await prisma.booking.create({
			data: { startTime, endTime, duration, deviceId, userId },
			select: { id: true },
		})

		return RESPONSES.SUCCESS.RESOURCE.CREATED('booking', createdBooking)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
