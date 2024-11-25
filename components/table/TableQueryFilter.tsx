'use client'

import { FC, useEffect, useState } from 'react'

interface TableQueryFilterProps {
	query: string | undefined
	onQueryChange: (query: string) => void
	labelOverride?: string
}

export const TableQueryFilter: FC<TableQueryFilterProps> = ({ onQueryChange, query, labelOverride }) => {
	const [queryValue, setQueryValue] = useState<string | undefined>(query)
	useEffect(() => {
		setQueryValue(query)
	}, [query])

	return (
		<div>
			<input
				placeholder={labelOverride ?? 'Wyszukaj po nazwie...'}
				value={queryValue}
				onChange={(e) => onQueryChange(e.target.value)}
				className='text-white bg-transparent border border-neutral-600 py-1 px-2 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring focus:ring-primary-500'
			/>
		</div>
	)
}
