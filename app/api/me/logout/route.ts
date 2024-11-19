import { authorizeApiEndpoint } from '@/lib/api'
import { auth, signOut } from '@/lib/auth'
import {} from 'next-auth/react'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { NextResponse } from 'next/server'

export const POST = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request)
		await signOut({ redirect: false })
		return NextResponse.json({ message: 'Logout successful' }, { status: 200 })
	} catch (error) {
		if (isRedirectError(error)) throw error
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
