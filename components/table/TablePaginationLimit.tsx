'use client'

import { FC, useEffect, useState } from 'react'

interface TablePaginationLimitProps {
	limit: number
	onLimitChange: (page: number) => void
}

export const TablePaginationLimit: FC<TablePaginationLimitProps> = ({ limit, onLimitChange }) => {
	const [limitValue, setLimitValue] = useState(limit)
	useEffect(() => {
		setLimitValue(limit)
	}, [limit])

	return (
		<div className='flex'>
			<p className='text-neutral-400 bg-transparent border border-neutral-600 rounded-l-md px-2 py-1 text-sm border-r-0 italic'>
				Wyników na stronie
			</p>
			<select
				onChange={(e) => onLimitChange(Number(e.target.value))}
				value={String(limitValue)}
				className='text-white  border border-neutral-600 p-1 rounded-r-md text-sm focus:outline-none bg-neutral-950'
			>
				<option value='10'>10</option>
				<option value='15'>15</option>
				<option value='25'>25</option>
				<option value='50'>50</option>
			</select>
		</div>
	)
}
