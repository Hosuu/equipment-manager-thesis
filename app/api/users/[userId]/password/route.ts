import { authorizeApiEndpoint, ensureAdminOrCertainUser, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt, { hashSync } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

interface DynamicParams extends Record<string, string> {
	userId: string
}

const endpointSchema = z.object({
	currentPassword: z.string().optional(),
	newPassword: z
		.string({ required_error: "'newPassword' is required" })
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
})

export const PUT = auth(async function (request, { params }) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const { userId } = params as DynamicParams
		ensureAdminOrCertainUser(auth, userId)

		const body = await parseJsonBody(request)
		const { currentPassword, newPassword } = endpointSchema.parse(body)
		const { hashedPassword } = await prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: { hashedPassword: true },
		})

		//Check if provided current password is correct if user is not admin
		if (auth.role != 'ADMIN') {
			if (!currentPassword) return NextResponse.json({ message: "'currentPassword' is required" }, { status: 400 }) //prettier-ignore
			const isPasswordCorrect = bcrypt.compareSync(currentPassword, hashedPassword)
			if (!isPasswordCorrect) return NextResponse.json({ message: 'Wrong password' }, { status: 400 }) //prettier-ignore
		}

		await prisma.user.update({
			where: { id: userId },
			data: { hashedPassword: hashSync(newPassword) },
		})

		return NextResponse.json({ message: 'Successful' }, { status: 200 })
	} catch (error) {
		if (error instanceof NextResponse) return error
		if (error instanceof ZodError) return NextResponse.json({ message: error.issues[0].message }, { status: 400 }) //prettier-ignore
		if (error instanceof Error) console.error(error.message)
		return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 })
	}
})
