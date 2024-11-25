'use client'

import { dateToInputFormat } from '@/lib/utils'
import { ArrowBigRight } from 'lucide-react'
import { FC, useEffect, useState } from 'react'

interface TableTimeRangeFilterProps {
	startDate: Date | undefined
	onStartDateChange: (date: Date) => void
	endDate: Date | undefined
	onEndDateChange: (date: Date) => void
}

export const TableTimeRangeFilter: FC<TableTimeRangeFilterProps> = ({
	startDate,
	endDate,
	onEndDateChange,
	onStartDateChange,
}) => {
	const [startDateValue, setStartDateValue] = useState<Date | undefined>(startDate)
	useEffect(() => {
		setStartDateValue(startDate)
	}, [startDate])

	const [endDateValue, setEndDateValue] = useState<Date | undefined>(endDate)
	useEffect(() => {
		setEndDateValue(endDate)
	}, [endDate])

	return (
		<div>
			<input
				type='date'
				max={endDateValue ? dateToInputFormat(endDateValue) : undefined}
				value={startDateValue ? dateToInputFormat(startDateValue) : undefined}
				onChange={(e) => onStartDateChange(new Date(e.target.value))}
				className='w-28 text-white bg-transparent border border-neutral-600 py-1 px-2 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring focus:ring-primary-500'
			/>
			<ArrowBigRight className='inline' />
			<input
				type='date'
				min={startDateValue ? dateToInputFormat(startDateValue) : undefined}
				value={endDateValue ? dateToInputFormat(endDateValue) : undefined}
				onChange={(e) => {
					onEndDateChange(new Date(e.target.value))
				}}
				className='w-28 text-white bg-transparent border border-neutral-600 py-1 px-2 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring focus:ring-primary-500'
			/>
		</div>
	)
}
