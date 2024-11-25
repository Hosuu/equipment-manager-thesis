import { authorizeApiEndpoint, getPaginationParams, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { createDeviceSchema } from '@/lib/zod'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request)
		const query = request.nextUrl.searchParams.get('query') ?? undefined
		const includeDesc = Boolean(request.nextUrl.searchParams.get('includeDesc') ?? false)
		const { page, limit, offset } = getPaginationParams(request)
		const totalCount = await prisma.device.count({
			where: { name: { contains: query, mode: 'insensitive' } },
		})
		const totalPages = Math.ceil(totalCount / limit)
		const devices = await prisma.device.findMany({
			skip: offset,
			take: limit,
			where: { name: { contains: query, mode: 'insensitive' } },
			select: {
				id: true,
				name: true,
				building: true,
				room: true,
				description: includeDesc,
			},
		})
		return RESPONSES.SUCCESS.RESOURCE.MANY_RETRIEVED<BasicDevice[]>('device', devices, {
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
		const { name, building, room, description } = createDeviceSchema.parse(body)
		const createdDevice = await prisma.device.create({
			data: { name, description, building, room },
			select: {
				id: true,
				name: true,
				building: true,
				room: true,
				description: true,
				updatedAt: true,
				createdAt: true,
			},
		})
		return RESPONSES.SUCCESS.RESOURCE.CREATED<DetailedDevice>('device', createdDevice)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
