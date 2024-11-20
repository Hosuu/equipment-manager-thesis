import { authorizeApiEndpoint, getPaginationParams } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { NextResponse } from 'next/server'

export const GET = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { limit, offset, page } = getPaginationParams(request)
		const totalCount = await prisma.booking.count({ where: { userId: auth.id } })
		const totalPages = Math.ceil(totalCount / limit)
		const bookings = await prisma.booking.findMany({
			skip: offset,
			take: limit,
			where: { userId: auth.id },
			select: {
				id: true,
				device: { select: { id: true, name: true, building: true, room: true } },
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
