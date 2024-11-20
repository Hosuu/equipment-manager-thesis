import prisma from './db'

export function getHoursFromTimeRange(start: Date, end: Date) {
	return Math.ceil((end.getTime() - start.getTime()) / 1000 / 60 / 60)
}

export async function getUserMonthSpanBookings(userId: string, startTime: Date, endTime: Date) {
	const seekDuration = 1000 * 60 * 60 * 24 * 15
	const startSearch = new Date(startTime.getTime() - seekDuration)
	const endSearch = new Date(endTime.getTime() + seekDuration)

	return await prisma.booking.findMany({
		where: {
			endTime: { gte: startSearch },
			startTime: { lte: endSearch },
			userId: userId,
		},
	})
}

export async function getUserMonthSpanQuota(userId: string, startTime: Date, endTime: Date) {
	const userMonthSpanBookings = await getUserMonthSpanBookings(userId, startTime, endTime)
	return userMonthSpanBookings.reduce((sum, r) => (sum += r.duration), 0)
}
