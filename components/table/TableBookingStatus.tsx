import { FC } from 'react'

interface TableBookingStatusProps {
	isCanceled: boolean
	startTime: string
}

export const TableBookingStatus: FC<TableBookingStatusProps> = ({ isCanceled, startTime }) => {
	if (isCanceled)
		return <span className='bg-red-600 text-white px-2 py-1 rounded-md font-medium'>Odwołana</span>
	if (new Date(startTime) < new Date())
		return (
			<span className='bg-yellow-600 text-white px-2 py-1 rounded-md font-medium'>Zakończona</span>
		)
	return <span className='bg-green-600 text-white px-2 py-1 rounded-md font-medium'>Aktywna</span>
}
