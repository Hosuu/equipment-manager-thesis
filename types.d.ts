import { Role } from '@prisma/client'
import { Session } from 'next-auth'
import 'next-auth/jwt'
import { NextRequest } from 'next/server'

declare module 'next-auth' {
	interface User {
		role: Role
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		role: Role
	}
}

declare interface NextAuthRequest extends NextRequest {
	auth: Session | null
}
