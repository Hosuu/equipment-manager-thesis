'use client'

import { LoaderCircle } from 'lucide-react'
import { FC, FormEventHandler, useState } from 'react'

interface CreateUserFormProps {
	onClose: () => void
}

export const CreateUserForm: FC<CreateUserFormProps> = ({ onClose }) => {
	const [name, setName] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [role, setRole] = useState<string>('USER')

	const [isPending, setIsPending] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [didSuccess, setDidSuccess] = useState(false)

	const sendPostRequest = async (name: string, email: string, password: string, role: string) => {
		setIsPending(true)
		const response = await fetch(`/api/users`, {
			method: 'POST',
			body: JSON.stringify({ name, email, password, role }),
		})
		const data = await response.json()
		if (data.code === 'USER_CREATED') {
			setIsPending(false)
			setDidSuccess(true)
			setTimeout(onClose, 1500)
			window.dispatchEvent(new CustomEvent('newUser'))
		} else {
			if (data.code === 'INVALID_DATA') setErrorMessage(data.details[0].message)
			else setErrorMessage(data.message)
			setIsPending(false)
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()
		sendPostRequest(name, email, password, role)
	}

	if (didSuccess)
		return (
			<div className='max-w-sm w-screen '>
				<div className='bg-primary-600 px-3 py-2 mb-2 text-sm rounded-md border-primary-800 border-2'>
					Pomyślnie utworzono użytkownika!
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
						Nazwa użytkownika
					</label>
					<input
						onChange={(e) => setName(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={name}
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='desc' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Email
					</label>
					<input
						onChange={(e) => setEmail(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={email}
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Hasło
					</label>
					<input
						onChange={(e) => setPassword(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={password}
						type='password'
					/>
				</div>
				<div className='my-2'>
					<label htmlFor='name' className='block mb-2 text-sm font-mediumtext-gray-100'>
						Rola
					</label>
					<input
						onChange={(e) => setRole(e.target.value)}
						className='bg-gray-100 w-full text-sm text-gray-800 px-3 py-2 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
						value={role}
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
							<p>Utwórz</p>
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
