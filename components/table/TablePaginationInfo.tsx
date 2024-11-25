'use client'

import { Pagination } from '@/lib/responses'
import { FC } from 'react'

interface TablePaginationInfoProps {
	pagination: Pagination
}

export const TablePaginationInfo: FC<TablePaginationInfoProps> = ({ pagination }) => {
	if (pagination === null)
		return <div className='items-center py-4 text-neutral-400 text-sm'>Wczytywanie...</div>

	const { limit, page, totalCount } = pagination
	return (
		<div className='items-center py-4 text-neutral-400 text-sm'>
			{pagination && (
				<>
					Wyniki od <span className='text-white'>{(page - 1) * limit + 1}</span> do{' '}
					<span className='text-white'>{page * limit}</span> (
					<span className='text-white'>{totalCount}</span> wszysktich wyników)
				</>
			)}
		</div>
	)
}
