import { parseJsonBody } from '@/lib/api'
import { auth, signIn } from '@/lib/auth'
import prisma from '@/lib/db'
import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

const loginRequestSchema = z.object({
	email: z.string({ required_error: "'email' is required" }),
	password: z.string({ required_error: "'password' is required" }),
})

export const POST = auth(async function (request) {
	try {
		const body = await parseJsonBody(request)
		const { email, password } = loginRequestSchema.parse(body)
		await signIn('credentials', { email, password, redirect: false })
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, name: true },
		})
		return NextResponse.json({ message: 'Login successful', user }, { status: 200 })
	} catch (error) {
		if (isRedirectError(error)) throw error

		if (error instanceof ZodError)
			return NextResponse.json({ message: error.issues[0].message }, { status: 400 })

		if (error instanceof AuthError && error.type === 'CredentialsSignin')
			return NextResponse.json({ message: 'Wrong password' }, { status: 400 })

		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
