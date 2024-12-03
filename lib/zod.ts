import { Role } from '@prisma/client'
import { z } from 'zod'

const dateTimeSchema = z
	.string({
		required_error: 'A valid DateTime string is required.',
		invalid_type_error: 'Input must be a string.',
	})
	.refine((val) => !isNaN(Date.parse(val)), {
		message: 'Invalid DateTime format. Please provide a valid ISO 8601 string.',
	})
	.transform((val) => new Date(val))

export const loginSchema = z.object({
	email: z.string({ required_error: "'email' is required and must be a valid string." }),
	password: z.string({ required_error: "'password' is required and must be a valid string." }),
})

export const updateBookingSchema = z.object({
	startTime: dateTimeSchema
		.refine((date) => date.getTime() > Date.now(), {
			message: "'startTime' must be a future date.",
		})
		.refine((date) => date.getUTCHours() > 4, {
			message: "'startTime' must be after 6:00.",
		})
		.refine((date) => date.getUTCHours() < 22, {
			message: "'startTime' must be before 22:00.",
		})
		.optional(),

	endTime: dateTimeSchema
		.refine((date) => date.getTime() > Date.now(), {
			message: "'endTime' must be a future date.",
		})
		.refine((date) => date.getUTCHours() > 4, {
			message: "'endTime' must be after 6:00.",
		})
		.refine((date) => date.getUTCHours() < 22, {
			message: "'endTime' must be before 22:00.",
		})
		.optional(),
})

export const createBookingSchema = z
	.object({
		userId: z.string({ required_error: "'userId' is required and must be a valid string." }),
		deviceId: z.string({ required_error: "'deviceId' is required and must be a valid string." }),
		startTime: dateTimeSchema
			.refine((date) => date.getTime() > Date.now(), {
				message: "'startTime' must be a future date.",
			})
			.refine((date) => date.getUTCHours() > 4, {
				message: "'startTime' must be after 6:00.",
			})
			.refine((date) => date.getUTCHours() < 22, {
				message: "'startTime' must be before 22:00.",
			}),
		endTime: dateTimeSchema
			.refine((date) => date.getTime() > Date.now(), {
				message: "'endTime' must be a future date.",
			})
			.refine((date) => date.getUTCHours() > 4, {
				message: "'endTime' must be after 6:00.",
			})
			.refine((date) => date.getUTCHours() < 22, {
				message: "'endTime' must be before 22:00.",
			}),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "'endTime' must be later than 'startTime'.",
		path: ['endTime'],
	})

export const createApiKeySchema = z.object({
	name: z
		.string({ required_error: "'name' is required and must be a valid string." })
		.min(3, 'Name must contain 3 or more characters'),
})

export const changePasswordSchema = z.object({
	currentPassword: z.string({
		required_error: "'currentPassword' is required and must be a valid string.",
	}),
	newPassword: z
		.string({ required_error: "'newPassword' is required and must be a valid string." })
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
})

export const changeUserNameSchema = z.object({
	name: z.string({ required_error: "'name' is required and must be a valid string." }),
})

export const updateUserSchema = z.object({
	name: z.string({ required_error: "'name' is required and must be a valid string." }),
	monthlyLimit: z.number(),
})

export const createUserSchema = z.object({
	email: z
		.string({ required_error: "'email' is required and must be a valid emial." })
		.endsWith('pwr.edu.pl', 'Only email adresses from @pwr.edu.pl domain are allowed.')
		.email('Invalid email'),
	password: z
		.string({ required_error: "'password' is required and must be a valid string." })
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
	role: z.nativeEnum(Role).optional(),
	name: z.string(),
	monthlyLimit: z.number().default(40).optional(),
})

export const createDeviceSchema = z.object({
	name: z.string({ required_error: "'email' is required and must be a valid emial." }),
	description: z.string().optional(),
	building: z
		.string({ required_error: "'building' is required and must be a valid string." })
		.max(32, 'Building name be less than 32 characters'),
	room: z
		.string({ required_error: "'room' is required and must be a valid string." })
		.max(32, 'Room name be less than 32 characters'),
})

export const updateDeviceSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	building: z.string().max(32, 'Building name be less than 32 characters').optional(),
	room: z.string().max(32, 'Room name be less than 32 characters').optional(),
})
