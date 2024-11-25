import { authorizeApiEndpoint, ensureAdminOrCertainUser } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	userId: string
	keyId: string
}

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { keyId, userId } = (await params) as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const revokedKey = await prisma.apiKey.update({
			where: { id: keyId, userId },
			data: { isRevoked: true },
			select: { id: true },
		})

		if (revokedKey) return RESPONSES.SUCCESS.RESOURCE.DELETED<DeletedId>('API-key', revokedKey)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('API-key')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
