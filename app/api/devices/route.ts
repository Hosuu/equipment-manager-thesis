import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import { object, string, ZodError } from 'zod'

export const GET = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request)
		const devices = await prisma.device.findMany({
			select: {
				id: true,
				name: true,
				building: true,
				room: true,
			},
		})
		return NextResponse.json(devices, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
const requestDataSchema = object({
	name: string({ required_error: "'name' is required" }),
	description: string().optional(),
	building: string({ required_error: "'building' is required" }),
	room: string({ required_error: "'room' is required" }),
})

export const POST = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)
		const body = parseJsonBody(request)
		const { name, building, room, description } = requestDataSchema.parse(body)
		const createdDevice = await prisma.device.create({
			data: { name, description, building, room },
			select: { name: true },
		})
		return NextResponse.json(createdDevice, { status: 201 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
