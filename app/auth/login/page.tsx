import { SignInForm } from '@/components/signInForm'
import Image from 'next/image'
import Link from 'next/link'

export default async function Page() {
	return (
		<div className='min-h-screen grid place-items-center py-6 px-4'>
			<div className='grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full md: justify-center'>
				<div className='flex flex-col gap-2 h-full max-w-lg md:ml-auto md:max-w-full'>
					<div className='flex flex-col md:flex-row'>
						<Image
							className='inline-block mr-4 self-center mb-4 md:mb-0 md:w-32 md:h-32'
							src='/logo.svg'
							alt='App logomark'
							width={96}
							height={96}
						/>
						<h2 className='lg:text-5xl text-4xl font-extrabold text-primary-600'>
							Zarządzanie aparaturą naukową
						</h2>
					</div>
					<p className='text-sm mt-6 text-gray-500'>
						Aplikacja stworzowa w celu ułatwienia zarzadzania aparaturą naukową.
					</p>
					<p className='text-sm mt-4 text-gray-500'>
						Nie posiadasz konta? <br />
						skontaktuj się z
						<a
							className='text-primary-600 font-semibold hover:underline ml-1'
							href='mailto:admin@example.com'
						>
							administatorem
						</a>
					</p>
					<p className='text-sm mt-4 text-gray-500'>
						Dostęp poprzez klucz API? <br />
						Sprawdź
						<Link
							className='text-primary-600 font-semibold hover:underline ml-1'
							href='/api'
						>
							dokumentację API
						</Link>
					</p>
				</div>
				<SignInForm />
			</div>
		</div>
	)
}
