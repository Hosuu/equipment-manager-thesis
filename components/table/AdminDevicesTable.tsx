'use client'

import { Pagination } from '@/lib/responses'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ModalFormOpenBtn } from '../forms/ModalFormOpenBtn'
import { UpdateDeviceForm } from '../forms/UpdateDeviceForm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'
import { TableBtn } from './TableBtn'
import { TablePaginationInfo } from './TablePaginationInfo'
import { TablePaginationLimit } from './TablePaginationLimit'
import { TablePaginationNav } from './TablePaginationNav'
import { TableQueryFilter } from './TableQueryFilter'

export const AdminDevicesTable = () => {
	const [query, setQuery] = useState<string>('')
	const [limit, setLimit] = useState<number>(10)
	const [page, setPage] = useState<number>(1)
	const [response, setResponse] = useState<unknown>(null)
	const includeDesc = true

	const fetchData = useCallback(async () => {
		const queryParams = Object.entries({ query, limit, page, includeDesc })
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => `${k}=${v}`)
			.join('&')
		const response = await (await fetch('/api/devices?' + queryParams)).json()
		setResponse(response)
	}, [query, limit, page, includeDesc])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	useEffect(() => {
		setPage(1)
	}, [query])

	useEffect(() => {
		const handleNewBooking = () => fetchData()
		window.addEventListener('newDevice', handleNewBooking)
		return () => window.removeEventListener('newDevice', handleNewBooking)
	}, [fetchData])

	if (response === null)
		return (
			<div className='grid place-items-center mt-16'>
				<Loader2 className='animate-spin' size={96} />
			</div>
		)

	const { data, pagination } = response as { data: DetailedDevice[]; pagination: Pagination }

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
						<TableHead scope='col'>Id</TableHead>
						<TableHead scope='col' className='text-center'>
							Akcja
						</TableHead>
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
							<TableCell>{d.id}</TableCell>
							<TableCell className='flex gap-2 justify-center'>
								<ModalFormOpenBtn
									label='Edytuj'
									FormComponent={UpdateDeviceForm}
									isTableEdit
									onClick={() => {
										//@ts-expect-error required in form
										window.currentlyEditedDevice = d.id
										//@ts-expect-error required in form
										window.currentlyEditedName = d.name
										//@ts-expect-error required in form
										window.currentlyEditedDescription = d.description
										//@ts-expect-error required in form
										window.currentlyEditedBuilding = d.building
										//@ts-expect-error required in form
										window.currentlyEditedRoom = d.room
									}}
								/>

								<TableBtn
									label='Usuń'
									onClick={async () => {
										const response = await fetch(`/api/devices/${d.id}`, { method: 'DELETE' }) //prettier-ignore
										if (response.ok) fetchData()
									}}
								/>
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
