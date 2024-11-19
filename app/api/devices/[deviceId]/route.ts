import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	deviceId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		await authorizeApiEndpoint(request)
		const { deviceId } = params as DynamicParams
		const device = await prisma.device.findUnique({
			where: { id: deviceId },
			select: {
				id: true,
				name: true,
				description: true,
				building: true,
				room: true,
				updatedAt: true,
				createdAt: true,
			},
		})
		return NextResponse.json(device, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

function parseBodyData(body: Record<string, string>) {
	const output: Record<string, string> = {}
	if ('name' in body) output.name = body.name
	if ('description' in body) output.name = body.description
	if ('building' in body) output.name = body.building
	if ('room' in body) output.name = body.room
	return output
}

export const PUT = auth(async function (request, { params }) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)
		const { deviceId } = params as DynamicParams
		const body = await parseJsonBody(request)
		const data = parseBodyData(body)

		if (Object.keys(data).length === 0)
			return NextResponse.json({ message: 'No data provided' }, { status: 400 })

		const updatedDevice = await prisma.device.update({
			where: { id: deviceId },
			data,
			select: {
				id: true,
				name: true,
				description: true,
				building: true,
				room: true,
				updatedAt: true,
				createdAt: true,
			},
		})
		if (updatedDevice != null) return NextResponse.json(updatedDevice, { status: 200 })
		else return NextResponse.json({ message: 'No Device found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		await authorizeApiEndpoint(request, Role.ADMIN)
		const { deviceId } = params as DynamicParams
		const deletedDevice = await prisma.device.delete({ where: { id: deviceId } })
		if (deletedDevice != null) return NextResponse.json({ message: 'Successful' }, { status: 200 })
		else return NextResponse.json({ message: 'No Device found with specified ID' }, { status: 400 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
