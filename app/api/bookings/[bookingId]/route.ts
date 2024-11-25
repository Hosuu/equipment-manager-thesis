import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	isDeviceAvailable,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import { getHoursFromTimeRange, getUserMonthSpanQuota } from '@/lib/bookings'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { updateBookingSchema } from '@/lib/zod'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	bookingId: string
}

export const GET = auth(async function GET(request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { bookingId } = (await params) as DynamicParams

		const bookingUserId = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { userId: true },
		})
		if (!bookingUserId) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('booking')
		await ensureAdminOrCertainUser(auth, bookingUserId.userId)

		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: {
				id: true,
				user: { select: { id: true, email: true, name: true } },
				device: { select: { id: true, name: true, building: true, room: true } },
				startTime: true,
				endTime: true,
				duration: true,
				createdAt: true,
				updatedAt: true,
				isCanceled: true,
			},
		})

		if (booking) return RESPONSES.SUCCESS.RESOURCE.FOUND<DetailedBooking>('booking', booking)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('booking')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { bookingId } = (await params) as DynamicParams

		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { startTime: true, endTime: true, userId: true, deviceId: true },
		})
		if (!booking) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('booking')
		await ensureAdminOrCertainUser(auth, booking.userId)

		if (booking.startTime < new Date()) return RESPONSES.ERROR.COMPLETED_BOOKING

		const body = await parseJsonBody(request)
		const data = updateBookingSchema.parse(body)
		if (Object.keys(data).length === 0) return RESPONSES.ERROR.DATA.NOT_PROVIDED

		const newData = { ...booking, ...data }
		const { deviceId, userId, endTime, startTime } = newData
		if (endTime <= startTime) return RESPONSES.ERROR.DATA.INVALID_TIME_RANGE

		const isAvailable = await isDeviceAvailable(deviceId, startTime, endTime, bookingId)
		if (!isAvailable) return RESPONSES.ERROR.DEVICE_UNAVAILABLE

		const user = await prisma.user.findUnique({ where: { id: userId }, select: { monthlyLimit: true }}) //prettier-ignore
		const userMonthSpanQuota = await getUserMonthSpanQuota(userId, startTime, endTime)
		const duration = getHoursFromTimeRange(startTime, endTime)
		const didExceededLimit = userMonthSpanQuota + duration > user!.monthlyLimit
		if (didExceededLimit) return RESPONSES.ERROR.MONTHLY_LIMIT_EXCEEDED

		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: newData,
			select: {
				id: true,
				user: { select: { id: true, email: true, name: true } },
				device: { select: { id: true, name: true, building: true, room: true } },
				startTime: true,
				endTime: true,
				duration: true,
				createdAt: true,
				updatedAt: true,
				isCanceled: true,
			},
		})
		if (updatedBooking != null)
			return RESPONSES.SUCCESS.RESOURCE.UPDATED<DetailedBooking>('booking', updatedBooking)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { bookingId } = (await params) as DynamicParams

		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: { userId: true, startTime: true },
		})
		if (!booking) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('booking')
		await ensureAdminOrCertainUser(auth, booking.userId)

		if (booking.startTime < new Date()) return RESPONSES.ERROR.COMPLETED_BOOKING

		const deletedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: { isCanceled: true },
			select: { id: true },
		})
		return RESPONSES.SUCCESS.RESOURCE.DELETED<DeletedId>('booking', deletedBooking)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
