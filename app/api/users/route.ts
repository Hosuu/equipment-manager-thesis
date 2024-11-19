import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Role } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { hashSync } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const query = request.nextUrl.searchParams.get('query') ?? undefined
		const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10)
		const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10)
		const offset = (page - 1) * limit
		const totalCount = await prisma.user.count()
		const totalPages = Math.ceil(totalCount / limit)

		const users = await prisma.user.findMany({
			skip: offset,
			take: limit,
			where: { email: { contains: query } },
			select: { id: true, email: true },
		})

		return NextResponse.json(
			{
				users,
				meta: {
					page,
					limit,
					totalPages,
					totalCount,
				},
			},
			{ status: 200 }
		)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

const requestDataSchema = z.object({
	email: z
		.string({ required_error: "'email' is required" })
		.endsWith('pwr.edu.pl', 'This app only allows emails from @pwr.edu.pl domain')
		.email('Invalid email'),
	password: z
		.string({ required_error: "'password' is required" })
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
	role: z.nativeEnum(Role).optional(),
	name: z.string().optional(),
})

export const POST = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)

		const body = await parseJsonBody(request)
		const { email, password, role, name } = requestDataSchema.parse(body)
		const hashedPassword = hashSync(password)
		const createdUser = await prisma.user.create({
			data: { email, hashedPassword, role, name },
			select: { id: true, email: true, name: true, role: true },
		})

		return NextResponse.json(createdUser, { status: 201 })
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
			return NextResponse.json(
				{ message: 'User with provided email address alredy exists' },
				{ status: 400 }
			)
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
