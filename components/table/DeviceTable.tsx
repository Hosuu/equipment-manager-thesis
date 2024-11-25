'use client'

import { Pagination } from '@/lib/responses'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'
import { TablePaginationInfo } from './TablePaginationInfo'
import { TablePaginationLimit } from './TablePaginationLimit'
import { TablePaginationNav } from './TablePaginationNav'
import { TableQueryFilter } from './TableQueryFilter'

export const DevicesTable = () => {
	const [query, setQuery] = useState<string>('')
	const [limit, setLimit] = useState<number>(10)
	const [page, setPage] = useState<number>(1)
	const [response, setResponse] = useState<unknown>(null)

	const fetchData = useCallback(async () => {
		const queryParams = Object.entries({ query, limit, page })
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => `${k}=${v}`)
			.join('&')
		const response = await (await fetch('/api/devices?' + queryParams)).json()
		setResponse(response)
	}, [query, limit, page])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	useEffect(() => {
		setPage(1)
	}, [query])

	if (response === null)
		return (
			<div className='grid place-items-center mt-16'>
				<Loader2 className='animate-spin' size={96} />
			</div>
		)

	const { data, pagination } = response as { data: BasicDevice[]; pagination: Pagination }

	return (
		<div>
			<div className='flex justify-between p-4'>
				<TableQueryFilter query={query} onQueryChange={setQuery} />
				<TablePaginationLimit limit={limit} onLimitChange={setLimit} />
			</div>
			<Table>
				<TableHeader>
					<tr>
						<TableHead scope='col'>Nazwa</TableHead>
						<TableHead scope='col'>Budynek</TableHead>
						<TableHead scope='col'>Sala</TableHead>
					</tr>
				</TableHeader>
				<TableBody>
					{data.map((d) => (
						<TableRow key={d.id}>
							<TableHead>
								<Link
									href={`/devices/${d.id}`}
									className='font-medium bg-primary-600 text-white px-2 py-1 rounded-md hover:underline'
								>
									{d.name}
								</Link>
							</TableHead>
							<TableCell>{d.building}</TableCell>
							<TableCell>{d.room}</TableCell>
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
