import { authorizeApiEndpoint } from '@/lib/api'
import { auth, signOut } from '@/lib/auth'
import { RESPONSES } from '@/lib/responses'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { NextResponse } from 'next/server'

export const POST = auth(async function (request) {
	try {
		await authorizeApiEndpoint(request)
		await signOut({ redirect: false })
		return RESPONSES.SUCCESS.AUTH.LOGOUT()
	} catch (error) {
		if (isRedirectError(error)) throw error
		if (error instanceof NextResponse) return error
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED()
	}
})
