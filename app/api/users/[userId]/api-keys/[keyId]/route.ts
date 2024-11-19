import { authorizeApiEndpoint, ensureAdminOrCertainUser } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	userId: string
	keyId: string
}

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { keyId, userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const revokedKey = await prisma.apiKey.update({
			where: { id: keyId, userId },
			data: { isRevoked: true },
		})
		if (revokedKey) return NextResponse.json({ message: 'Successful' }, { status: 200 })
		else return NextResponse.json({ message: 'No API-key found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
