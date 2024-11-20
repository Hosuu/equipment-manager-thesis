import {
	authorizeApiEndpoint,
	ensureAdminOrCertainUser,
	generateApiKeyHash,
	getPaginationParams,
	parseJsonBody,
} from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { createApiKeySchema } from '@/lib/zod'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const { limit, offset, page } = getPaginationParams(request)
		const totalCount = await prisma.apiKey.count({ where: { userId: auth.id } })
		const totalPages = Math.ceil(totalCount / limit)
		const apikeys = await prisma.apiKey.findMany({
			skip: offset,
			take: limit,
			where: { userId: auth.id },
			select: { id: true, name: true, hits: true, lastUsed: true, createdAt: true },
		})
		return RESPONSES.SUCCESS.RESOURCE.MANY_RETRIEVED('API-key', apikeys, {
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

export const POST = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const body = parseJsonBody(request)
		const { name } = createApiKeySchema.parse(body)
		const key = randomBytes(48).toString('base64')
		const keyHash = generateApiKeyHash(key)

		const apiKey = await prisma.apiKey.create({
			data: { keyHash, name, userId },
			select: { name: true },
		})
		return RESPONSES.SUCCESS.RESOURCE.CREATED('API-key', { key, ...apiKey })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
