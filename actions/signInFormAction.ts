'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { z, ZodError } from 'zod'

const signInSchema = z.object({
	email: z
		.string({ required_error: 'Adres email jest wymagany' })
		.endsWith('pwr.edu.pl', 'Adres pochodzi z nieobsługiwanej domeny')
		.email('Niepoprawny adres email'),
	password: z.string({ required_error: 'Hasło jest wymagane' }),
})

export async function signInFormAction(prevState: unknown, formData: FormData) {
	const email = formData.get('email')
	const password = formData.get('password')

	try {
		signInSchema.parse({ email, password })
		await signIn('credentials', { email, password, redirectTo: '/' })
	} catch (error) {
		if (isRedirectError(error)) throw error

		if (error instanceof AuthError && error.type === 'CredentialsSignin')
			return [{ message: 'Błędne hasło!', path: ['password'] }]

		if (error instanceof ZodError)
			return error.issues.map((i) => ({ message: i.message, path: i.path }))

		if (error instanceof Error) console.log(error.message)
		return [{ message: 'Wystąpił nieoczekiwany błąd', path: ['general'] }]
	}

	revalidatePath('/')
}
