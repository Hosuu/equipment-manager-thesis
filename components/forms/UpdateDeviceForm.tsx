'use client'

import { LoaderCircle } from 'lucide-react'
import { FC, FormEventHandler, useState } from 'react'

interface UpdateDeviceFormProps {
	onClose: () => void
}

export const UpdateDeviceForm: FC<UpdateDeviceFormProps> = ({ onClose }) => {
	//@ts-expect-error It will exist
	const deviceId = window.currentlyEditedDevice
	//@ts-expect-error It will exist
	const prevName = window.currentlyEditedName
	//@ts-expect-error It will exist
	const prevDesc = window.currentlyEditedDescription
	//@ts-expect-error It will exist
	const prevBuilding = window.currentlyEditedBuilding
	//@ts-expect-error It will exist
	const prevRoom = window.currentlyEditedRoom

	const [name, setName] = useState<string>(prevName)
	const [desc, setDesc] = useState<string>(prevDesc)
	const [building, setBuilding] = useState<string>(prevBuilding)
	const [room, setRoom] = useState<string>(prevRoom)

	const [isPending, setIsPending] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [didSuccess, setDidSuccess] = useState(false)

	const sendPostRequest = async (
		name: string,
		description: string,
		building: string,
		room: string
	) => {
		setIsPending(true)
		const response = await fetch(`/api/devices/${deviceId}`, {
			method: 'PUT',
			body: JSON.stringify({ name, description, building, room }),
		})
		const data = await response.json()
		if (data.code === 'DEVICE_UPDATED') {
			setIsPending(false)
			setDidSuccess(true)
			setTimeout(onClose, 1500)
			window.dispatchEvent(new CustomEvent('newDevice'))
		} else {
			if (data.code === 'INVALID_DATA') setErrorMessage(data.details[0].message)
			else setErrorMessage(data.message)
			setIsPending(false)
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()
		sendPostRequest(name, desc, building, room)
	}

	if (didSuccess)
		return (
			<div className='max-w-sm w-screen '>
				<div className='bg-primary-600 px-3 py-2 mb-2 text-sm rounded-md border-primary-800 border-2'>
					Pomyślnie zaktualizowano przyrząd!
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
				<div className='my-2'>
					<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Nazwa przyrządu
					</label>
					<input
						onChange={(e) => setName(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={name}
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='desc' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Opis przyrządu
					</label>
					<input
						onChange={(e) => setDesc(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={desc}
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Budynek
					</label>
					<input
						onChange={(e) => setBuilding(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={building}
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Sala
					</label>
					<input
						onChange={(e) => setRoom(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={room}
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
							<p>Aktualizuj</p>
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
