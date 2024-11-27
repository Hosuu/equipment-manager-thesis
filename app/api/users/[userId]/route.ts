import { authorizeApiEndpoint, ensureAdminOrCertainUser, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { changeUserNameSchema, updateUserSchema } from '@/lib/zod'
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
		//@ts-expect-error it works
		const { name, monthlyLimit = undefined } = (
			auth.role == 'ADMIN' && body.monthlyLimit ? updateUserSchema : changeUserNameSchema
		).parse(body)

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (!user) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { name, monthlyLimit },
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
		if (updatedUser != null) {
			if(monthlyLimit)
			console.log(`[UPDATED LIMIT] USER ${auth.email} => FOR ${updatedUser.email} FROM ${user.monthlyLimit} TO ${updatedUser.monthlyLimit}`) //prettier-ignore
			return RESPONSES.SUCCESS.RESOURCE.UPDATED<DetailedUser>('user', updatedUser)
		} else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
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
		if (deletedUser != null) {
			console.log(`[DELETED USER] USER ${auth.email} => USER ${deletedUser.id}`) //prettier-ignore
			return RESPONSES.SUCCESS.RESOURCE.DELETED<DeletedId>('user', deletedUser)
		} else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
