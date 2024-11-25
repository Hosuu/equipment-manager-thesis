import { signOutFormAction } from '@/actions/signOutFormAction'
import { FC } from 'react'

export const SignOutButton: FC = () => {
	return (
		<form action={signOutFormAction}>
			<button
				type='submit'
				className='px-4 py-1.5 my-1 rounded-lg bg-neutral-100 hover:bg-red-400 transition-colors text-sm leading-5 text-black'
			>
				Wyloguj
			</button>
		</form>
	)
}
