'use client'

import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import { FC, useEffect, useRef, useState } from 'react'

interface TablePaginationNavProps {
	page: number
	onPageChange: (page: number) => void
}

export const TablePaginationNav: FC<TablePaginationNavProps> = ({ page, onPageChange }) => {
	const pageInputRef = useRef<HTMLInputElement>(null)
	const [pageValue, setPageValue] = useState(page)
	useEffect(() => {
		setPageValue(page)
	}, [page])

	return (
		<div className='flex justify-between p-4'>
			<button
				className='rounded-l-md border border-neutral-600 text-white p-1 hover:bg-neutral-700 transition-colors'
				onClick={() => onPageChange(Math.max(page - 1, 1))}
			>
				<LucideChevronLeft size={20} />
			</button>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onPageChange(Number(pageInputRef.current!.value))
				}}
			>
				<input
					ref={pageInputRef}
					type='number'
					value={pageValue}
					onChange={() => onPageChange(Number(pageInputRef.current!.value))}
					className='text-white bg-transparent border-b border-t border-neutral-600 py-1 px-2 text-sm max-w-12 text-center focus:outline-none'
				></input>
			</form>
			<button
				className='rounded-r-md border border-neutral-600 text-white p-1 hover:bg-neutral-700 transition-colors'
				onClick={() => onPageChange(page + 1)}
			>
				<LucideChevronRight size={20} />
			</button>
		</div>
	)
}
