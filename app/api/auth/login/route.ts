import { parseJsonBody } from '@/lib/api'
import { auth, signIn } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { loginSchema } from '@/lib/zod'
import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { ZodError } from 'zod'

export const POST = auth(async function (request) {
	try {
		const body = await parseJsonBody(request)
		const { email, password } = loginSchema.parse(body)

		await signIn('credentials', { email, password, redirect: false })

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, name: true },
		})
		return RESPONSES.SUCCESS.AUTH.LOGIN(user)
	} catch (error) {
		if (isRedirectError(error)) throw error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof AuthError && error.type === 'CredentialsSignin')
			return RESPONSES.ERROR.AUTH.INVALID_CREDENTIALS
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED
	}
})
