import { authorizeApiEndpoint } from '@/lib/api'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { RESPONSES } from '@/lib/responses'

interface DynamicParams extends Record<string, string> {
	deviceId: string
}

export const GET = auth(async function (request, { params }) {
	try {
		authorizeApiEndpoint(request)
		const { deviceId } = (await params) as DynamicParams
		const startDateString = request.nextUrl.searchParams.get('startDate')
		const endDateString = request.nextUrl.searchParams.get('endDate')
		const startDate = startDateString ? new Date(startDateString) : new Date()
		const endDate = endDateString ? new Date(endDateString) : new Date()
		if (!endDateString) endDate.setDate(endDate.getDate() + 7)

		const bookings = await prisma.booking.findMany({
			where: {
				endTime: { gte: startDate },
				startTime: { lte: endDate },
				deviceId,
				isCanceled: false,
			},
			select: {
				startTime: true,
				endTime: true,
			},
		})

		const availableRanges = calculateAvailableRanges(startDate, endDate, bookings)

		return RESPONSES.SUCCESS.AVAILABILITY(availableRanges)
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
		return RESPONSES.ERROR.UNEXPECTED()
	}
})

interface TimeRange {
	startTime: Date
	endTime: Date
}

const calculateAvailableRanges = (
	startDate: Date,
	endDate: Date,
	bookings: TimeRange[]
): TimeRange[] => {
	const availableRanges: TimeRange[] = []
	const dayStartHour = 6
	const dayEndHour = 22

	// Iterate over each day in the range
	const currentDate = new Date(startDate)
	currentDate.setHours(0, 0, 0, 0) // Start at midnight of the current day

	while (currentDate <= endDate) {
		const dayStart = new Date(currentDate)
		dayStart.setHours(dayStartHour, 0, 0, 0)

		const dayEnd = new Date(currentDate)
		dayEnd.setHours(dayEndHour, 0, 0, 0)

		// Adjust start and end times if the current day is partially within the range
		const availableStart = new Date(Math.max(dayStart.getTime(), startDate.getTime()))
		const availableEnd = new Date(Math.min(dayEnd.getTime(), endDate.getTime()))

		// Filter reservations for the current day
		const dayBookings = bookings.filter(
			(booking) => booking.startTime >= dayStart && booking.startTime < dayEnd
		)

		let currentStart = availableStart

		// Process each reservation to find gaps
		for (const booking of dayBookings.sort(
			(a, b) => a.startTime.getTime() - b.startTime.getTime()
		)) {
			if (currentStart < booking.startTime) {
				availableRanges.push({
					startTime: currentStart,
					endTime: booking.startTime,
				})
			}
			currentStart = new Date(Math.max(currentStart.getTime(), booking.endTime.getTime()))
		}

		if (currentStart < availableEnd) {
			availableRanges.push({
				startTime: currentStart,
				endTime: availableEnd,
			})
		}
		currentDate.setDate(currentDate.getDate() + 1)
	}

	const adjustedRanges = availableRanges.filter((range) => range.endTime >= new Date())
	//ignore past
	if (adjustedRanges[0].startTime < new Date()) adjustedRanges[0].startTime = new Date()

	//clamp to queried time range
	const last = adjustedRanges.length - 1
	if (adjustedRanges[0].startTime < startDate) adjustedRanges[0].startTime = startDate
	if (adjustedRanges[last].endTime > endDate) adjustedRanges[last].startTime = endDate

	return adjustedRanges
	//return availableRanges.filter((range) => range.startTime > new Date())
}
