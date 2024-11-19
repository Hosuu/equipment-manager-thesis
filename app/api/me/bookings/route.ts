import { authorizeApiEndpoint } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const userData = await prisma.booking.findMany({
			where: { userId: auth.id },
			select: {
				id: true,
				device: { select: { id: true, name: true, building: true, room: true } },
				startTime: true,
				endTime: true,
			},
		})
		return NextResponse.json(userData, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
