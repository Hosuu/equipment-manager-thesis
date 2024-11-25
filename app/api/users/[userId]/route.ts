import { authorizeApiEndpoint, ensureAdminOrCertainUser, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { changeUserNameSchema } from '@/lib/zod'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = (await params) as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				monthlyLimit: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		if (user) return RESPONSES.SUCCESS.RESOURCE.FOUND<DetailedUser>('user', user)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = (await params) as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const body = await parseJsonBody(request)
		const { name } = changeUserNameSchema.parse(body)

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { name },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				monthlyLimit: true,
				createdAt: true,
				updatedAt: true,
			},
		})
		if (updatedUser != null)
			return RESPONSES.SUCCESS.RESOURCE.UPDATED<DetailedUser>('user', updatedUser)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = (await params) as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const deletedUser = await prisma.user.delete({ where: { id: userId }, select: { id: true } })
		if (deletedUser != null)
			return RESPONSES.SUCCESS.RESOURCE.DELETED<DeletedId>('user', deletedUser)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
