import { authorizeApiEndpoint } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const userData = await prisma.user.findUniqueOrThrow({
			where: { id: auth.id },
			select: {
				id: true,
				name: true,
				email: true,
				monthlyLimit: true,
				createdAt: true,
				updatedAt: true,
				apiKeys: { select: { id: true, name: true } },
			},
		})
		return NextResponse.json(userData, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
