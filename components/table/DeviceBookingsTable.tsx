'use client'

import { Pagination } from '@/lib/responses'
import { isoToHHMM } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { FC, useCallback, useEffect, useState } from 'react'
import { RelativeTime } from '../RelativeTime'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'
import { TableBookingStatus } from './TableBookingStatus'
import { TableBtn } from './TableBtn'
import { TablePaginationInfo } from './TablePaginationInfo'
import { TablePaginationLimit } from './TablePaginationLimit'
import { TablePaginationNav } from './TablePaginationNav'
import { TableTimeRangeFilter } from './TableTimeRangeFilter'

interface DeviceBookingsTableProps {
	deviceId: string
	isAdmin: boolean
}

export const DeviceBookingsTable: FC<DeviceBookingsTableProps> = ({ deviceId, isAdmin }) => {
	const [startDate, setStartDate] = useState<Date | undefined>(new Date())
	const [endDate, setEndDate] = useState<Date | undefined>(undefined)
	const [limit, setLimit] = useState<number>(10)
	const [page, setPage] = useState<number>(1)
	const [response, setResponse] = useState<unknown>(null)

	const fetchData = useCallback(async () => {
		const queryParams = Object.entries({ startDate, endDate, limit, page })
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => `${k}=${v instanceof Date ? v.toISOString() : v}`)
			.join('&')
		const response = await (await fetch(`/api/devices/${deviceId}/bookings?${queryParams}`)).json()
		setResponse(response)
	}, [deviceId, startDate, endDate, limit, page])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	useEffect(() => {
		setPage(1)
	}, [startDate, endDate])

	useEffect(() => {
		const handleNewBooking = () => fetchData()
		window.addEventListener('newBooking', handleNewBooking)
		return () => window.removeEventListener('newBooking', handleNewBooking)
	}, [fetchData])

	if (response === null)
		return (
			<div className='grid place-items-center mt-16'>
				<Loader2 className='animate-spin' size={96} />
			</div>
		)

	const { data, pagination } = response as { data: BasicBooking[]; pagination: Pagination }

	return (
		<div>
			<div className='flex justify-between p-4'>
				<TableTimeRangeFilter
					startDate={startDate}
					onStartDateChange={setStartDate}
					endDate={endDate}
					onEndDateChange={setEndDate}
				/>
				<TablePaginationLimit limit={limit} onLimitChange={setLimit} />
			</div>

			<Table>
				<TableHeader>
					<tr>
						<TableHead scope='col'>Status</TableHead>
						<TableHead scope='col'>Użytkownik</TableHead>
						<TableHead scope='col'>email</TableHead>
						<TableHead scope='col'>Kiedy</TableHead>
						<TableHead scope='col'>Od</TableHead>
						<TableHead scope='col'>Do</TableHead>
						{isAdmin && (
							<TableHead scope='col' className='text-center'>
								Akcja
							</TableHead>
						)}
					</tr>
				</TableHeader>
				<TableBody>
					{data.map((d) => (
						<TableRow key={d.id}>
							<TableCell>
								<TableBookingStatus
									isCanceled={d.isCanceled}
									startTime={d.startTime as string}
								/>
							</TableCell>
							<TableHead>
								<Link
									href={`/devices/${d.user.id}`}
									className='font-medium bg-primary-600 text-white px-2 py-1 rounded-md hover:underline'
								>
									{d.user.name}
								</Link>
							</TableHead>
							<TableCell>{d.user.email}</TableCell>
							<TableCell>
								<RelativeTime timeStamp={new Date(d.startTime)} />
							</TableCell>
							<TableCell>{isoToHHMM(d.startTime as string)}</TableCell>
							<TableCell>{isoToHHMM(d.endTime as string)}</TableCell>
							{isAdmin && (
								<TableCell className='text-center'>
									{!d.isCanceled && new Date(d.startTime) > new Date() && (
										<TableBtn
											label='Odwołaj'
											onClick={async () => {
												const response = await fetch(`/api/bookings/${d.id}`, {
													method: 'DELETE',
												})
												if (response.ok) fetchData()
											}}
										/>
									)}
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className='flex justify-between items-center px-4 '>
				<TablePaginationInfo pagination={pagination} />
				<TablePaginationNav page={page} onPageChange={setPage} />
			</div>
		</div>
	)
}
