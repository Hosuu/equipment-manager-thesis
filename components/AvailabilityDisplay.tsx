'use client'

import { isoToHHMM } from '@/lib/utils'
import { ArrowBigRight, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const getWeekDates = (startDate: Date): string[] => {
	const startOfWeek = new Date(startDate)
	startOfWeek.setDate(startDate.getDate() - startDate.getDay() + 1) // Poniedziałek

	return Array.from({ length: 7 }).map((_, i) => {
		const date = new Date(startOfWeek)
		date.setDate(startOfWeek.getDate() + i)
		return date.toISOString().split('T')[0]
	})
}

const AvailabilityDisplay = () => {
	const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
	const [availability, setAvailability] = useState<Partial<
		Record<
			string,
			{
				startTime: string
				endTime: string
			}[]
		>
	> | null>(null)
	const weekDates = getWeekDates(currentWeek)
	const { deviceId } = useParams()

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getData = async () => {
		const startDate = new Date(weekDates[0])
		const endDate = new Date(weekDates[0])
		endDate.setDate(startDate.getDate() + 7)
		const response = await fetch(
			`/api/devices/${deviceId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
		)
		const data = await response.json()
		if (data.code === 'AVAILABILITY_TIME_RANGES_RETRIEVED') {
			const timeRanges = data.data as { startTime: string; endTime: string }[]
			const grouped = Object.groupBy(timeRanges, ({ startTime }) => startTime.split('T')[0])
			setAvailability(grouped)
		}
	}

	const handleWeekChange = (direction: 'prev' | 'next') => {
		const newDate = new Date(currentWeek)
		newDate.setDate(currentWeek.getDate() + (direction === 'prev' ? -7 : 7))
		setAvailability(null)
		setCurrentWeek(newDate)
	}

	useEffect(() => {
		getData()
	}, [currentWeek])

	useEffect(() => {
		const handleNewBooking = () => getData()
		window.addEventListener('newBooking', handleNewBooking)
		return () => window.removeEventListener('newBooking', handleNewBooking)
	}, [getData])

	return (
		<div className='p-4 rounded-md shadow-md space-y-4'>
			<div className='flex flex-row justify-between items-center gap-4'>
				<button
					onClick={() => handleWeekChange('prev')}
					className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700'
				>
					Poprzedni
				</button>
				<h1 className='text-lg sm:text-xl font-semibold text-white text-center'>
					{weekDates[0]} <ArrowBigRight className='inline' /> {weekDates[6]}
				</h1>
				<button
					onClick={() => handleWeekChange('next')}
					className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700'
				>
					Następny
				</button>
			</div>

			{availability == null && (
				<div className='grid place-items-center mt-16'>
					<Loader2 className='animate-spin' size={96} />
				</div>
			)}

			{availability && (
				<div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-sm'>
					{weekDates.map((date) => {
						const dayAvailability = availability[date]
						const isSameYear = new Date(date).getFullYear() === new Date().getFullYear()
						const isSameMonth = new Date(date).getMonth() === new Date().getMonth()
						const isSameDay = new Date(date).getDate() === new Date().getDate()
						const isToday = isSameYear && isSameMonth && isSameDay
						return (
							<div
								key={date}
								className={`p-2 bg-neutral-900 border ${
									isToday ? 'border-primary-500' : 'border-neutral-700'
								} rounded-md shadow-sm flex flex-col`}
							>
								<span className='font-medium text-gray-100'>
									{new Date(date).toLocaleDateString('pl-PL', {
										weekday: 'short',
										day: '2-digit',
										month: 'short',
									})}
								</span>
								{dayAvailability && dayAvailability.length ? (
									<ul className='mt-1 space-y-1'>
										{dayAvailability.map(({ startTime, endTime }, index) => (
											<li
												key={index}
												className='px-2 py-1 bg-primary-900 text-green-50 rounded-full border border-green-700'
											>
												{isoToHHMM(startTime)} - {isoToHHMM(endTime)}
											</li>
										))}
									</ul>
								) : (
									<p className='mt-2 text-gray-500 italic text-xs'>Brak dostępności</p>
								)}
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default AvailabilityDisplay
