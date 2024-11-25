import prisma from '@/lib/db'
import { NextAuthRequest } from '@/types'
import { Role } from '@prisma/client'
import { createHash } from 'crypto'
import { RESPONSES } from './responses'

const APIKEY_SALT = process.env.APIKEY_SALT
export function generateApiKeyHash(key: string) {
	return createHash('sha256')
		.update(APIKEY_SALT + key)
		.digest('base64')
}

export async function isDeviceAvailable(
	deviceId: string,
	startTime: Date,
	endTime: Date,
	excludeBookingId?: string
) {
	const deviceConcurentReservations = await prisma.booking.count({
		where: {
			id: { not: excludeBookingId },
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
		throw RESPONSES.ERROR.DATA.INVALID_JSON_BODY
	}
}

async function verifyApiKey(key: string) {
	const keyHash = generateApiKeyHash(key)
	const data = await prisma.apiKey.findUnique({
		where: { keyHash, isRevoked: false },
		select: { id: true, user: { select: { id: true, role: true } } },
	})

	if (data) return { apiKeyId: data.id, user: data.user }

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
	// try {
	// 	if (request.method === 'POST' || request.method === 'PUT') {
	// 		const body = await parseJsonBody(request)
	// 		if ('API_KEY' in body) return await verifyApiKey(body.API_KEY)
	// 	}
	// } catch (error) {
	// 	if (error instanceof Error) console.error(error.message)
	// }

	//4. Check sessionCookie
	try {
		if (request?.auth?.user) {
			const { id, role } = request.auth.user
			return { apiKeyId: null, user: { id: id!, role } }
		}
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
	}

	return null
}

export async function authorizeApiEndpoint(request: NextAuthRequest, requiredRole: Role = Role.USER) {
	const auth = await authenticateApiEndpoint(request)

	if (auth === null) throw RESPONSES.ERROR.AUTH.NOT_AUTHENTICATED
	if (requiredRole === 'ADMIN' && auth.user.role != 'ADMIN')
		throw RESPONSES.ERROR.AUTH.INSUFFICIENT_PERMISSIONS

	if (auth.apiKeyId)
		await prisma.apiKey.update({
			where: { id: auth.apiKeyId },
			data: { hits: { increment: 1 }, lastUsed: new Date() },
		})

	return auth.user
}

export async function ensureAdminOrCertainUser(auth: { role: Role; id: string }, userId: string) {
	if (auth.role !== 'ADMIN' || userId !== auth.id) throw RESPONSES.ERROR.AUTH.INSUFFICIENT_PERMISSIONS
}

export function getPaginationParams(request: NextAuthRequest) {
	const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10)
	const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10)
	const offset = (page - 1) * limit
	return { page, limit, offset }
}
