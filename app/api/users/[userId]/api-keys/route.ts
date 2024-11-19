import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	generateApiKeyHash,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const apikeys = await prisma.apiKey.findMany({
			where: { userId },
			select: { id: true, name: true, hits: true, lastUsed: true, createdAt: true },
		})
		return NextResponse.json(apikeys, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

const requestDataSchema = z.object({
	name: z.string({ required_error: "'name' is required" }),
})

export const POST = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const body = parseJsonBody(request)
		const { name } = requestDataSchema.parse(body)
		const key = randomBytes(48).toString('base64')
		const keyHash = generateApiKeyHash(key)

		const apiKey = await prisma.apiKey.create({
			data: { keyHash, name, userId },
			select: { name: true },
		})
		return NextResponse.json({ key, ...apiKey }, { status: 201 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
