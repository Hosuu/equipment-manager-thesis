import { authorizeApiEndpoint, ensureAdminOrCertainUser, parseJsonBody } from '@/lib/api'
import { auth, hashPasword } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { changePasswordSchema } from '@/lib/zod'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

const adminVariant = changePasswordSchema.extend({
	currnetPassword: changePasswordSchema.shape.currentPassword.optional(),
})

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = (await params) as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const body = await parseJsonBody(request)
		const { currentPassword, newPassword } = (auth.role === 'ADMIN' ? adminVariant : changePasswordSchema).parse(body) //prettier-ignore
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { hashedPassword: true },
		})

		if (!user) return RESPONSES.ERROR.RESOURCE_NOT_FOUND('user')
		if (auth.role != 'ADMIN') {
			const isPasswordCorrect = bcrypt.compareSync(currentPassword, user.hashedPassword)
			if (!isPasswordCorrect) return RESPONSES.ERROR.AUTH.INVALID_CURRENT_PASSWORD()
		}

		const hashedPassword = hashPasword(newPassword)
		await prisma.user.update({
			where: { id: auth.id },
			data: { hashedPassword },
		})

		return RESPONSES.SUCCESS.AUTH.PASSWORD_CHANGED()
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED()
	}
})
