import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

const cappitalFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export interface Pagination {
	page: number
	limit: number
	totalPages: number
	totalCount: number
}

export const RESPONSES = {
	SUCCESS: {
		RESOURCE: {
			CREATED: <T>(resourceName: string, data: T) =>
				NextResponse.json(
					{
						message: `${cappitalFirst(resourceName)} created successfully.`,
						data,
						code: `${resourceName.toUpperCase()}_CREATED`,
					},
					{ status: 201 }
				),

			UPDATED: <T>(resourceName: string, data: T) =>
				NextResponse.json(
					{
						message: `${cappitalFirst(resourceName)} updated successfully.`,
						data,
						code: `${resourceName.toUpperCase()}_UPDATED`,
					},
					{ status: 200 }
				),

			DELETED: <T>(resourceName: string, data: T) =>
				NextResponse.json(
					{
						message: `${cappitalFirst(resourceName)} deleted successfully.`,
						data,
						code: `${resourceName.toUpperCase()}_DELETED`,
					},
					{ status: 200 }
				),

			FOUND: <T>(resourceName: string, data: T) =>
				NextResponse.json(
					{
						message: `${cappitalFirst(resourceName)} retrived successfully.`,
						data,
						code: `${resourceName.toUpperCase()}_FOUND`,
					},
					{ status: 200 }
				),

			MANY_RETRIEVED: <T>(resourceName: string, data: T, pagination: Pagination) =>
				NextResponse.json(
					{
						message: `${cappitalFirst(resourceName)}s retrieved successfully.`,
						data,
						code: `${resourceName.toUpperCase()}S_RETRIEVED`,
						pagination,
					},
					{ status: 200 }
				),
		},

		AUTH: {
			LOGIN: <T>(data: T) =>
				NextResponse.json(
					{
						message: 'Login successful.',
						data,
						code: 'LOGIN_SUCCESS',
					},
					{ status: 200 }
				),

			LOGOUT: NextResponse.json(
				{
					message: 'Logout successful. You have been logged out successfully.',
					code: 'LOGOUT_SUCCESS',
				},
				{ status: 200 }
			),

			PASSWORD_CHANGED: NextResponse.json(
				{
					message: 'Password changed successfully.',
					code: 'PASSWORD_CHANGED',
				},
				{ status: 200 }
			),

			SELF_USER_DATA_RETRIEVED: <T>(data: T) =>
				NextResponse.json(
					{
						message: 'User data retrieved successfully.',
						data,
						code: 'USER_DATA_RETRIEVED',
					},
					{ status: 200 }
				),
		},

		AVAILABILITY: (data: unknown) =>
			NextResponse.json(
				{
					message: `Availability time ranges retrieved successfully.`,
					data,
					code: `AVAILABILITY_TIME_RANGES_RETRIEVED`,
				},
				{ status: 200 }
			),
	},
	ERROR: {
		RESOURCE_NOT_FOUND: (resourceName: string) =>
			NextResponse.json(
				{
					error: 'Not Found',
					message: `No ${resourceName} found with the specified ID. Please verify the ID and try again.`,
					code: `${resourceName.toUpperCase()}_NOT_FOUND`,
				},
				{ status: 404 }
			),

		DEVICE_UNAVAILABLE: NextResponse.json(
			{
				error: 'Conflict',
				message: 'The selected device is already reserved during the specified time range. Please choose a different time or device.', //prettier-ignore
				code: 'DEVICE_UNAVAILABLE',
			},
			{ status: 409 }
		),

		MONTHLY_LIMIT_EXCEEDED: NextResponse.json(
			{
				error: 'Limit Exceeded',
				message:
					"The user's monthly usage limit has been reached. Please try booking on a different day or adjust the booking duration.",
				code: 'MONTHLY_LIMIT_EXCEEDED',
			},
			{ status: 403 }
		),

		COMPLETED_BOOKING: NextResponse.json(
			{
				error: 'Action Not Allowed',
				message:
					'The booking has already been completed and cannot be updated or deleted. Please contact support if you have further concerns.',
				code: 'COMPLETED_BOOKING_ERROR',
			},
			{ status: 400 }
		),

		AUTH: {
			INVALID_CREDENTIALS: NextResponse.json(
				{
					error: 'Unauthorized',
					message: 'Incorrect email or password. Please try again.',
					code: 'INVALID_CREDENTIALS',
				},
				{ status: 401 }
			),

			INVALID_CURRENT_PASSWORD: NextResponse.json(
				{
					error: 'Unauthorized',
					message:
						'The current password is incorrect. Please try again with the correct password.',
					code: 'INVALID_CURRENT_PASSWORD',
				},
				{ status: 401 }
			),

			NOT_AUTHENTICATED: NextResponse.json(
				{
					error: 'Unauthorized',
					message:
						'Authentication is required to access this resource. Please log in and try again.',
					code: 'USER_NOT_AUTHENTICATED',
				},
				{ status: 401 }
			),

			INSUFFICIENT_PERMISSIONS: NextResponse.json(
				{
					error: 'Forbidden',
					message: 'You do not have sufficient permissions to perform this action.',
					code: 'INSUFFICIENT_PERMISSIONS',
				},
				{ status: 403 }
			),

			EMAIL_ALREADY_REGISTERED: NextResponse.json(
				{
					error: 'Conflict',
					message: 'An account with this email address already exists.',
					code: 'EMAIL_ALREADY_REGISTERED',
				},
				{ status: 409 }
			),
		},

		DATA: {
			INVALID: (error: ZodError) => {
				return NextResponse.json(
					{
						error: 'Bad Request',
						message:
							'The request data is invalid or missing required fields. Please check the input and try again.',
						details: error.issues.map(({ path, message }) => ({ field: path[0], message })),
						code: 'INVALID_DATA',
					},
					{ status: 400 }
				)
			},

			NOT_PROVIDED: NextResponse.json(
				{
					error: 'Bad Request',
					message:
						'No data was provided in the request body. Please provide the necessary information and try again.',
					code: 'NO_DATA_PROVIDED',
				},
				{ status: 400 }
			),

			INVALID_TIME_RANGE: NextResponse.json(
				{
					error: 'Bad Request',
					message:
						'The provided time range is invalid. The end time must be later than the start time.',
					code: 'INVALID_TIME_RANGE',
				},
				{ status: 400 }
			),

			INVALID_JSON_BODY: NextResponse.json(
				{
					error: 'Bad Request',
					message:
						'The request body is not properly formatted as JSON. Please ensure the body is valid JSON.',
					code: 'INVALID_JSON_BODY',
				},
				{ status: 400 }
			),
		},

		UNEXPECTED: NextResponse.json(
			{
				error: 'Internal Server Error',
				message:
					'An unexpected error occurred. Please try again later or contact admin if the issue persists.',
				code: 'UNEXPECTED_ERROR',
			},
			{ status: 500 }
		),
	},
}
