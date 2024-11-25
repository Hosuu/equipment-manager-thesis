'use client'

import { Pagination } from '@/lib/responses'
import { Loader2 } from 'lucide-react'
import { FC, useCallback, useEffect, useState } from 'react'
import { RelativeTime } from '../RelativeTime'
import { StatusIcon } from '../StatusIcon'
import { Tooltip } from '../Tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'
import { TableBtn } from './TableBtn'
import { TablePaginationInfo } from './TablePaginationInfo'
import { TablePaginationLimit } from './TablePaginationLimit'
import { TablePaginationNav } from './TablePaginationNav'
import { TableQueryFilter } from './TableQueryFilter'

interface UserKeysTableProps {
	userId: string
}

export const UserKeysTable: FC<UserKeysTableProps> = ({ userId }) => {
	const [query, setQuery] = useState<string>('')
	const [limit, setLimit] = useState<number>(10)
	const [page, setPage] = useState<number>(1)
	const [response, setResponse] = useState<unknown>(null)

	const fetchData = useCallback(async () => {
		const queryParams = Object.entries({ query, limit, page })
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => `${k}=${v}`)
			.join('&')
		const response = await (await fetch(`/api/users/${userId}/api-keys?${queryParams}`)).json()
		setResponse(response)
	}, [userId, query, limit, page])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	useEffect(() => {
		setPage(1)
	}, [query])

	useEffect(() => {
		const handleNewApiKey = () => fetchData()
		window.addEventListener('newApiKey', handleNewApiKey)
		return () => window.removeEventListener('newApiKey', handleNewApiKey)
	}, [fetchData])

	if (response === null)
		return (
			<div className='grid place-items-center mt-16'>
				<Loader2 className='animate-spin' size={96} />
			</div>
		)

	const { data, pagination } = response as { data: ApiKey[]; pagination: Pagination }

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
						<TableHead scope='col'>Użyć</TableHead>
						<TableHead scope='col'>Ostatnie użycie</TableHead>
						<TableHead scope='col'>Utworzony</TableHead>
						<TableHead scope='col' className='text-center'>
							Akcja
						</TableHead>
					</tr>
				</TableHeader>
				<TableBody>
					{data.map((d) => (
						<TableRow key={d.id}>
							<TableCell>
								<Tooltip
									text={d.isRevoked ? 'Wycofany' : 'Aktywny'}
									className={`flex items-center gap-2 w-fit`}
								>
									<StatusIcon
										color={d.isRevoked ? 'red' : 'green'}
										doPulse={!d.isRevoked}
									/>
									<span
										className={`${d.isRevoked ? 'line-through brightness-50' : ''}`}
									>
										{d.name || 'Brak nazwy'}
									</span>
								</Tooltip>
							</TableCell>
							<TableCell>{d.hits}</TableCell>
							<TableCell>
								{new Date(d.lastUsed as string).getTime() === 0 ? (
									'Nigdy'
								) : (
									<RelativeTime
										timeStamp={new Date(d.lastUsed as string)}
									></RelativeTime>
								)}
							</TableCell>
							<TableCell>
								<RelativeTime timeStamp={new Date(d.createdAt)}></RelativeTime>
							</TableCell>

							<TableCell className='text-center'>
								{!d.isRevoked && (
									<TableBtn
										label='Wycofaj'
										onClick={async () => {
											const response = await fetch(
												`/api/users/${userId}/api-keys/${d.id}`,
												{ method: 'DELETE' }
											)
											if (response.ok) fetchData()
										}}
									/>
								)}
							</TableCell>
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
