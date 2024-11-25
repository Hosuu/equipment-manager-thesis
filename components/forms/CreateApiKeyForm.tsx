'use client'

import { LoaderCircle } from 'lucide-react'
import { FC, FormEventHandler, useState } from 'react'

interface CreateApiKeyFormProps {
	onClose: () => void
}

export const CreateApiKeyForm: FC<CreateApiKeyFormProps> = ({ onClose }) => {
	const [name, setName] = useState<string>('')
	const [isPending, setIsPending] = useState<boolean>(false)
	const [apiKey, setApiKey] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [didCopy, setDidCopy] = useState(false)
	const [didFailOnCopy, setDidFailOnCopy] = useState(false)

	const sendPostRequest = async (name: string) => {
		setIsPending(true)
		const response = await fetch('/api/me/api-keys', {
			method: 'POST',
			body: JSON.stringify({ name }),
		})

		const data = await response.json()
		if (data.code === 'API-KEY_CREATED') {
			setApiKey(data.data.key)
			setIsPending(false)
		} else {
			if (data.code === 'INVALID_DATA')
				setErrorMessage('Nazwa klucza nie może być krótsza niż 3 znaki')
			else setErrorMessage('Wystąpił nieoczekiwany błąd')
			setIsPending(false)
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()
		sendPostRequest(name)
	}

	if (apiKey !== null) {
		return (
			<div className='max-w-md w-screen flex flex-col items-center'>
				Twój klucz API
				<div className='bg-neutral-900 w-full text-center overflow-x-auto px-2 py-2 mt-2 text-xs rounded-md border-neutral-500 border-2'>
					{apiKey}
				</div>
				<div className='flex w-full justify-between'>
					<button
						onClick={(e) => {
							window.dispatchEvent(new CustomEvent('newApiKey'))
							e.stopPropagation()
							onClose()
						}}
						className=' shadow-xl w-40 py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700 focus:outline-none ring-2 ring-transparent focus:ring-primary-500'
					>
						Zamknij
					</button>
					<button
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(apiKey)
								setDidCopy(true)
							} catch (error) {
								if (error instanceof Error) console.error(error)
								setDidCopy(false)
								setDidFailOnCopy(true)
							}
						}}
						className=' shadow-xl w-40 py-2 px-3 mt-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700 focus:outline-none ring-2 ring-transparent focus:ring-primary-500'
					>
						{didCopy ? 'skopiowano' : didFailOnCopy ? 'ERROR' : 'Kopiuj'}
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='max-w-sm w-screen '>
			{errorMessage && (
				<div className='bg-red-500 px-3 py-2 mb-2 text-sm rounded-md border-red-800 border-2'>
					{errorMessage}
				</div>
			)}
			<form onSubmit={handleSubmit}>
				<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
					Nazwa klucza
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
