import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { updateDeviceSchema } from '@/lib/zod'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

interface DynamicParams extends Record<string, string> {
	deviceId: string
}

export const GET = auth(async function GET(request, { params }) {
	try {
		await authorizeApiEndpoint(request)
		const { deivceId } = (await params) as DynamicParams

		const device = await prisma.device.findUnique({
			where: { id: deivceId },
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

		if (device) return RESPONSES.SUCCESS.RESOURCE.FOUND<DetailedDevice>('deivce', device)
		else return RESPONSES.ERROR.RESOURCE_NOT_FOUND('deivce')
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request, Role.ADMIN)
		const { deviceId } = (await params) as DynamicParams

		const device = await prisma.device.findUnique({
			where: { id: deviceId },
			select: { id: true, name: true, description: true, building: true, room: true },
		})
		if (!device) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('device')

		const body = await parseJsonBody(request)
		const data = updateDeviceSchema.parse(body)
		if (Object.keys(data).length === 0) return RESPONSES.ERROR.DATA.NOT_PROVIDED

		const newData = { ...device, ...data }

		const updatedDevice = await prisma.device.update({
			where: { id: deviceId },
			data: newData,
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
		if (updatedDevice != null) {
			console.log(`[UPDATED DEVICE] USER ${auth.email}\n                DEVICE ${device.id}\n                FROM [${device.name}, ${device.description}, ${device.building}, ${device.room}]\n                TO   [${updatedDevice.name}, ${updatedDevice.description}, ${updatedDevice.building}, ${updatedDevice.room}]`) //prettier-ignore
			return RESPONSES.SUCCESS.RESOURCE.UPDATED<DetailedDevice>('device', updatedDevice)
		}
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})

export const DELETE = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request, Role.ADMIN)
		const { deviceId } = (await params) as DynamicParams

		const device = await prisma.device.findUnique({
			where: { id: deviceId },
			select: { id: true },
		})
		if (!device) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('device')

		const deletedDevice = await prisma.device.delete({
			where: { id: deviceId },
			select: { id: true },
		})

		console.log(`[DELETED DEVICE] USER ${auth.email} => DEVICE ${deletedDevice.id}`) //prettier-ignore
		return RESPONSES.SUCCESS.RESOURCE.DELETED('device', deletedDevice)
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
