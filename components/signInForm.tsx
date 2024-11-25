'use client'
import { signInFormAction } from '@/actions/signInFormAction'
import { LoaderCircle } from 'lucide-react'
import { FC, InputHTMLAttributes, useActionState, useEffect, useState } from 'react'

export function SignInForm() {
	const [state, action, isPending] = useActionState(signInFormAction, undefined)
	const generalError = state?.find((e) => e.path.some((p) => p === 'general'))?.message
	return (
		<form action={action} className='max-w-lg md:ml-auto md:max-w-md w-full'>
			<h3 className='text-gray-900 dark:text-gray-100 text-3xl font-extrabold mb-8'>
				Zaloguj się
			</h3>

			<div className='space-y-4'>
				<FormField
					isPending={isPending}
					response={state}
					presist={true}
					label='Adres email'
					name='email'
					type='email'
					required
					placeholder='user@pwr.edu.pl'
				/>
				<FormField
					isPending={isPending}
					response={state}
					presist={false}
					label='Hasło'
					name='password'
					type='password'
					required
					placeholder='••••••••'
				/>
			</div>

			<div className='mt-8'>
				<LoginButton isPending={isPending} />
			</div>

			{generalError && (
				<div className='mt-2 bg-red-500 px-4 py-3 rounded-md text-sm font-bold'>
					{generalError}
				</div>
			)}
		</form>
	)
}

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	isPending: boolean
	presist: boolean
	label: string
	response:
		| {
				message: string
				path: (string | number)[]
		  }[]
		| undefined
}

const FormField: FC<FormFieldProps> = ({ isPending, presist, label, response, ...props }) => {
	const [errorMessage, setErrorMessage] = useState<string | undefined>()
	const displayError = !isPending && errorMessage

	const [value, setValue] = useState('')

	useEffect(() => {
		if (response) {
			const error = response.find((e) => e.path.some((p) => p === props.name))
			setErrorMessage(error?.message)
		}
	}, [props.name, response])

	return (
		<div>
			<label
				htmlFor={props.name}
				className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100'
			>
				{label}
			</label>
			<div className={displayError ? 'bg-red-500 ring-4 ring-red-500 rounded-md' : ''}>
				<input
					onChange={(e) => {
						setErrorMessage(undefined)
						setValue(e.target.value)
					}}
					className='bg-gray-100 w-full text-sm text-gray-800 px-4 py-3 rounded-md focus:outline-none ring ring-transparent focus:ring-primary-500'
					value={presist ? value : undefined}
					{...props}
				/>
				{displayError && <p className=' px-2 py-1 text-sm font-bold'>{errorMessage}</p>}
			</div>
		</div>
	)
}

const LoginButton: FC<{ isPending: boolean }> = ({ isPending }) => {
	return (
		<button
			type='submit'
			disabled={isPending}
			className='place-items-center w-full shadow-xl py-3 px-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700 focus:outline-none ring-2 ring-transparent focus:ring-primary-500'
		>
			{isPending ? (
				<LoaderCircle className='animate-spin' strokeWidth={2} size={20} />
			) : (
				<p>Zaloguj</p>
			)}
		</button>
	)
}
