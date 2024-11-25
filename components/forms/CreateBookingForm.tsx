'use client'

import { datetimeToInputFormat } from '@/lib/utils'
import { ArrowBigRight, LoaderCircle } from 'lucide-react'
import { getSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { FC, FormEventHandler, useState } from 'react'

interface CreateBookingFormProps {
	onClose: () => void
}

export const CreateBookingForm: FC<CreateBookingFormProps> = ({ onClose }) => {
	const maxDate = new Date()
	maxDate.setDate(maxDate.getDate() + 30)
	const { deviceId } = useParams()
	const [startDate, setStartDate] = useState<Date>(new Date())
	const [endDate, setEndDate] = useState<Date | undefined>(undefined)
	const [isPending, setIsPending] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [didSuccess, setDidSuccess] = useState(false)

	const sendPostRequest = async (startTime: Date, endTime: Date) => {
		setIsPending(true)
		const userId = (await getSession())?.user?.id
		const response = await fetch('/api/bookings', {
			method: 'POST',
			body: JSON.stringify({ deviceId, userId, startTime, endTime }),
		})
		const data = await response.json()
		if (data.code === 'BOOKING_CREATED') {
			setIsPending(false)
			setDidSuccess(true)
			setTimeout(onClose, 1000)
			window.dispatchEvent(new CustomEvent('newBooking'))
		} else {
			if (data.code === 'INVALID_DATA') setErrorMessage(data.details[0].message)
			else setErrorMessage(data.message)
			setIsPending(false)
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()
		sendPostRequest(startDate, endDate!)
	}

	if (didSuccess)
		return (
			<div className='max-w-sm w-screen '>
				<div className='bg-primary-600 px-3 py-2 mb-2 text-sm rounded-md border-primary-800 border-2'>
					Pomyślnie dodano rezerwacje!
				</div>
			</div>
		)

	return (
		<div className='max-w-sm w-screen '>
			{errorMessage && (
				<div className='bg-red-500 px-3 py-2 mb-2 text-sm rounded-md border-red-800 border-2'>
					{errorMessage}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className='flex justify-around items-center gap-4'>
					<input
						type='datetime-local'
						min={datetimeToInputFormat(new Date())}
						max={endDate ? datetimeToInputFormat(endDate) : undefined}
						value={startDate ? datetimeToInputFormat(startDate) : undefined}
						onChange={(e) => setStartDate(new Date(e.target.value))}
						className='w-40 text-white bg-transparent border border-neutral-600 py-1 px-2 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring focus:ring-primary-500'
					/>
					<ArrowBigRight className='inline' />
					<input
						type='datetime-local'
						min={
							startDate
								? datetimeToInputFormat(startDate)
								: datetimeToInputFormat(new Date())
						}
						max={datetimeToInputFormat(maxDate)}
						value={
							endDate ? datetimeToInputFormat(endDate) : datetimeToInputFormat(startDate)
						}
						onChange={(e) => setEndDate(new Date(e.target.value))}
						className='w-40 text-white bg-transparent border border-neutral-600 py-1 px-2 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring focus:ring-primary-500'
					/>
				</div>

				<div className='flex justify-between'>
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation()
							onClose()
						}}
						className='place-items-center w-40  shadow-xl py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-red-500 hover:bg-red-700 disabled:bg-red-600 focus:outline-none ring-2 ring-transparent focus:ring-red-400'
					>
						Anuluj
					</button>

					<button
						type='submit'
						disabled={isPending}
						className='place-items-center w-40  shadow-xl py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700 focus:outline-none ring-2 ring-transparent focus:ring-primary-500'
					>
						{isPending ? (
							<LoaderCircle className='animate-spin' strokeWidth={2} size={20} />
						) : (
							<p>Zarezerwuj</p>
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
