'use client'

import { LoaderCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FC, FormEventHandler, useState } from 'react'

interface UpdateUserNameFormProps {
	onClose: () => void
}

export const UpdateUserNameForm: FC<UpdateUserNameFormProps> = ({ onClose }) => {
	const router = useRouter()
	const [name, setName] = useState<string>('')
	const { userId } = useParams()

	const [isPending, setIsPending] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [didSuccess, setDidSuccess] = useState(false)

	const sendPostRequest = async (name: string) => {
		setIsPending(true)
		const response = await fetch(`/api/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify({ name }),
		})
		const data = await response.json()
		if (data.code === 'USER_UPDATED') {
			setIsPending(false)
			setDidSuccess(true)
			router.refresh()
			setTimeout(onClose, 1500)
		} else {
			if (data.code === 'INVALID_DATA') setErrorMessage(data.details[0].message)
			else setErrorMessage(data.message)
			setIsPending(false)
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()
		sendPostRequest(name)
	}

	if (didSuccess)
		return (
			<div className='max-w-sm w-screen '>
				<div className='bg-primary-600 px-3 py-2 mb-2 text-sm rounded-md border-primary-800 border-2'>
					Pomyślnie zaktualizowano nazwę!
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
				<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
					Nazwa użytkownika
				</label>
				<input
					onChange={(e) => setName(e.target.value)}
					className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
					value={name}
				/>
				<div className='flex justify-between'>
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation()
							onClose()
						}}
						className='place-items-center w-32  shadow-xl py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-red-500 hover:bg-red-700 disabled:bg-red-600 focus:outline-none ring-2 ring-transparent focus:ring-red-400'
					>
						Anuluj
					</button>

					<button
						type='submit'
						disabled={isPending}
						className='place-items-center w-32  shadow-xl py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700 focus:outline-none ring-2 ring-transparent focus:ring-primary-500'
					>
						{isPending ? (
							<LoaderCircle className='animate-spin' strokeWidth={2} size={20} />
						) : (
							<p>Utwórz</p>
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
