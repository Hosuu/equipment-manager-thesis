import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'
import { string, z, ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)

		const { userId } = params as DynamicParams
		if (auth.role !== 'ADMIN' || userId !== auth.id)
			return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 })

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
		return NextResponse.json(user, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

const endpointSchema = z.object({ name: string({ required_error: "'name' is required" }) })

export const PUST = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)

		const { userId } = params as DynamicParams
		if (auth.role !== 'ADMIN' || userId !== auth.id)
			return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 })

		const body = await parseJsonBody(request)
		const { name } = endpointSchema.parse(body)

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
		if (updatedUser != null) return NextResponse.json(updatedUser, { status: 200 })
		else return NextResponse.json({ message: 'No User found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)

		const { userId } = params as DynamicParams
		if (auth.role !== 'ADMIN' || userId !== auth.id)
			return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 })

		const deletedUser = await prisma.user.delete({ where: { id: userId } })
		if (deletedUser != null) return NextResponse.json({ message: 'Successful' }, { status: 200 })
		else return NextResponse.json({ message: 'No User found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
