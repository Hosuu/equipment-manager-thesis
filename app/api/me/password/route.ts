import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth, hashPasword } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'
import { changePasswordSchema } from '@/lib/zod'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const PUT = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const body = await parseJsonBody(request)
		const { currentPassword, newPassword } = changePasswordSchema.parse(body)
		const { hashedPassword } = await prisma.user.findUniqueOrThrow({
			where: { id: auth.id },
			select: { hashedPassword: true },
		})

		const isPasswordCorrect = bcrypt.compareSync(currentPassword, hashedPassword)
		if (!isPasswordCorrect) return RESPONSES.ERROR.AUTH.INVALID_CURRENT_PASSWORD()

		await prisma.user.update({
			where: { id: auth.id },
			data: { hashedPassword: hashPasword(newPassword) },
		})
		return RESPONSES.SUCCESS.AUTH.PASSWORD_CHANGED()
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return RESPONSES.ERROR.DATA.INVALID(error)
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED()
	}
})
