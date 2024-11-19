import { NavBar } from '@/components/navBar'
import Image from 'next/image'

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
				<h2 className=' text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-600'>
					Zarządzanie aparaturą naukową
				</h2>
			</div>
			<NavBar
				views={[
					{ href: '/home', label: 'Strona Główna' },
					{ href: '/devices', label: 'Przyrządy' },
					{ href: '/profile', label: 'Mój profil' },
				]}
			/>
			{children}
		</div>
	)
}
