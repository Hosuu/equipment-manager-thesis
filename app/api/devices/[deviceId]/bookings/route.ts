import { authorizeApiEndpoint, getPaginationParams } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	deviceId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		await authorizeApiEndpoint(request)
		const { deviceId } = (await params) as DynamicParams

		const userId = request.nextUrl.searchParams.get('userId') ?? undefined
		const startDate = request.nextUrl.searchParams.get('startDate') ?? undefined
		const endDate = request.nextUrl.searchParams.get('endDate') ?? undefined
		const { limit, offset, page } = getPaginationParams(request)
		const totalCount = await prisma.booking.count({
			where: {
				userId,
				deviceId,
				startTime: { lte: endDate },
				endTime: { gte: startDate },
			},
		})
		const totalPages = Math.ceil(totalCount / limit)
		const bookings = await prisma.booking.findMany({
			skip: offset,
			take: limit,
			where: {
				deviceId,
				userId,
				startTime: { lte: endDate },
				endTime: { gte: startDate },
			},
			select: {
				id: true,
				user: { select: { id: true, name: true, email: true } },
				device: { select: { id: true, name: true, building: true, room: true } },
				startTime: true,
				endTime: true,
				isCanceled: true,
			},
			orderBy: {
				startTime: 'asc',
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
		return RESPONSES.ERROR.UNEXPECTED()
	}
})
