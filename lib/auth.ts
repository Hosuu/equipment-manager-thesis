import bcrypt, { hashSync } from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from './db'
import { makeSureTimePassedSince } from './utils'

export const hashPasword = (password: string) => hashSync(password, 10)

export const { handlers, signIn, signOut, auth } = NextAuth({
	pages: {
		signIn: '/auth/login',
	},

	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id!
				token.role = user.role
			}

			return token
		},
		session({ session, token }) {
			session.user.id = token.id
			session.user.role = token.role

			return session
		},
		authorized: async ({ auth }) => !!auth,
	},

	providers: [
		Credentials({
			credentials: { email: {}, password: {} },
			authorize: async (credentials) => {
				if (!credentials || !credentials.email || !credentials.password) return null

				const email = credentials.email as string
				const startTimeStamp = performance.now()
				try {
					const user = await prisma.user.findUnique({
						where: { email },
						select: { id: true, email: true, hashedPassword: true, role: true },
					})

					if (user && bcrypt.compareSync(credentials.password as string, user.hashedPassword))
						return user

					await makeSureTimePassedSince(2000, startTimeStamp)
					return null
				} catch (error) {
					if (error instanceof Error) console.error(error.message)
					return null
				}
			},
		}),
	],
})
