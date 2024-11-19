import { authorizeApiEndpoint, parseJsonBody } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt, { hashSync } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

const endpointSchema = z.object({
	currentPassword: z.string({ required_error: 'currentPassword is required' }),
	newPassword: z
		.string({ required_error: 'newPassword is required' })
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
})

export const PUT = auth(async function (request) {
	try {
		const auth = await authorizeApiEndpoint(request)
		const body = await parseJsonBody(request)
		const { currentPassword, newPassword } = endpointSchema.parse(body)
		const { hashedPassword } = await prisma.user.findUniqueOrThrow({
			where: { id: auth.id },
			select: { hashedPassword: true },
		})

		const isPasswordCorrect = bcrypt.compareSync(currentPassword, hashedPassword)
		if (!isPasswordCorrect) return NextResponse.json({ message: 'Wrong password' }, { status: 400 })

		await prisma.user.update({
			where: { id: auth.id },
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
