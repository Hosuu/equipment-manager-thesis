import prisma from '@/lib/db'
import { NextAuthRequest } from '@/types'
import { Role } from '@prisma/client'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

const APIKEY_SALT = process.env.APIKEY_SALT
export function generateApiKeyHash(key: string) {
	return createHash('sha256')
		.update(APIKEY_SALT + key)
		.digest('base64')
}

export async function isDeviceAvailable(deviceId: string, startTime: Date, endTime: Date) {
	const deviceConcurentReservations = await prisma.booking.count({
		where: {
			endTime: { gte: startTime },
			startTime: { lte: endTime },
			deviceId: deviceId,
		},
	})

	return deviceConcurentReservations === 0
}

export async function parseJsonBody(request: NextAuthRequest) {
	try {
		const body = await request.json()
		return body
	} catch (error) {
		if (error instanceof Error) console.error(error.message)

		throw NextResponse.json(
			{ message: 'The server could not understand the request due to incorrect syntax.' },
			{ status: 400 }
		)
	}
}

async function verifyApiKey(key: string) {
	console.log(key)
	const keyHash = generateApiKeyHash(key)
	console.log(keyHash)
	const apiKey = await prisma.apiKey.findUnique({
		where: { keyHash, isRevoked: false },
		select: { id: true, user: { select: { id: true, role: true } } },
	})

	if (apiKey) return apiKey

	throw null
}

async function authenticateApiEndpoint(request: NextAuthRequest) {
	// 1. Check for API_KEY in Headers
	try {
		if (request.headers.has('API_KEY')) return await verifyApiKey(request.headers.get('API_KEY')!)
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}

	// 2. Check for API_KEY in search params
	try {
		if (request.nextUrl.searchParams.has('API_KEY'))
			return await verifyApiKey(request.nextUrl.searchParams.get('API_KEY')!)
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}

	// 3. Check for API_KEY in request body
	try {
		if (request.method === 'POST' || request.method === 'PUT') {
			const body = await parseJsonBody(request)
			if ('API_KEY' in body) return await verifyApiKey(body.API_KEY)
		}
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}

	//4. Check sessionCookie
	try {
		if (request?.auth?.user) {
			const { id, role } = request.auth.user
			return { id: null, user: { id: id!, role } }
		}
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}

	return null
}

export async function authorizeApiEndpoint(request: NextAuthRequest, requiredRole: Role = Role.USER) {
	const apiKey = await authenticateApiEndpoint(request)

	if (apiKey === null) throw NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
	if (requiredRole === 'ADMIN' && apiKey.user.role != 'ADMIN')
		throw NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 })

	if (apiKey.id)
		await prisma.apiKey.update({
			where: { id: apiKey.id },
			data: { hits: { increment: 1 }, lastUsed: new Date() },
		})

	return apiKey.user
}

export async function ensureAdminOrCertainUser(auth: { role: Role; id: string }, userId: string) {
	if (auth.role !== 'ADMIN' || userId !== auth.id)
		throw NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 })
}
