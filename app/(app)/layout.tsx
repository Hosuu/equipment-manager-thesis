import { NavBar } from '@/components/navBar'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth()
	const views = [
		{ href: '/devices', label: 'Przyrządy' },
		{ href: `/users/${session?.user?.id}`, label: 'Mój profil' },
	]

	if (session?.user?.role === 'ADMIN') views.push({ href: '/admin', label: 'Admin' })

	return (
		<div className='max-w-screen-xl m-auto'>
			<div className='flex items-center justify-center p-2 bg-neutral-700'>
				<Image
					className='inline-block mr-4 self-center'
					src='/logo.svg'
					alt='App logomark'
					width={56}
					height={56}
				/>
				<h1 className=' text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-600'>
					Zarządzanie aparaturą naukową
				</h1>
			</div>
			<NavBar views={views} />
			<div className='min-h-[75vh]'>{children}</div>
			<footer className='text-center text-xs text-neutral-500 mb-2'>
				• <Link href={'/api-docs'}>Dokumentacja API</Link> •
			</footer>
		</div>
	)
}
