import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { changeUserNameSchema } from '@/lib/zod'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

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
		return RESPONSES.SUCCESS.AUTH.SELF_USER_DATA_RETRIEVED(userData)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const PUT = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const body = await parseJsonBody(request)
		const { name } = changeUserNameSchema.parse(body)
		const updatedUser = await prisma.user.update({
			where: { id: auth.id },
			data: { name },
			select: {
				id: true,
				name: true,
				email: true,
			},
		})
		return RESPONSES.SUCCESS.RESOURCE.UPDATED('user', updatedUser)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
