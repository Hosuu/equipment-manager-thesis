import { authorizeApiEndpoint } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	deviceId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		authorizeApiEndpoint(request)
		const { deviceId } = params as DynamicParams
		const reservations = await prisma.booking.findMany({
			where: {
				endTime: { gt: new Date() },
				startTime: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
				deviceId,
				isCanceled: false,
			},
			select: {
				id: true,
				startTime: true,
				endTime: true,
				user: { select: { id: true, email: true, name: true } },
			},
		})

		const available = [{ day: Date.now(), ranges: [{ from: Date.now(), to: Date.now() }] }]

		return NextResponse.json(reservations, { status: 200 })
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
