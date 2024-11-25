import { authorizeApiEndpoint, getPaginationParams, parseJsonBody } from '@/lib/api'
import { auth, hashPasword } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { createUserSchema } from '@/lib/zod'
import { Role } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const query = request.nextUrl.searchParams.get('query') ?? undefined
		const includeRole = Boolean(request.nextUrl.searchParams.get('includeRole') ?? false)
		const { page, limit, offset } = getPaginationParams(request)
		const totalCount = await prisma.user.count({
			where: { name: { contains: query, mode: 'insensitive' } },
		})
		const totalPages = Math.ceil(totalCount / limit)
		const users = await prisma.user.findMany({
			skip: offset,
			take: limit,
			where: { name: { contains: query, mode: 'insensitive' } },
			select: { id: true, email: true, name: true, role: includeRole },
		})

		return RESPONSES.SUCCESS.RESOURCE.MANY_RETRIEVED<BasicUser[]>('user', users, {
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

export const POST = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const body = await parseJsonBody(request)
		const { email, password, role, name } = createUserSchema.parse(body)
		const hashedPassword = hashPasword(password)
		const createdUser = await prisma.user.create({
			data: { email, hashedPassword, role, name },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				monthlyLimit: true,
			},
		})

		return RESPONSES.SUCCESS.RESOURCE.CREATED<DetailedUser>('user', createdUser)
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
			return RESPONSES.ERROR.AUTH.EMAIL_ALREADY_REGISTERED
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
