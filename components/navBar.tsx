'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { SignOutButton } from './signOutButton'

interface NavBarProps {
	views: NavElementProps[]
}

export const NavBar: FC<NavBarProps> = ({ views }) => {
	return (
		<div className='bg-neutral-900 flex px-2 gap-4'>
			<div className=' flex px-2 gap-6 text-white hover:text-neutral-300 w-full'>
				{views.map((props) => (
					<NavElement {...props} key={props.href} />
				))}
			</div>
			<div className='py-1 ml-auto'>
				<SignOutButton />
			</div>
		</div>
	)
}

interface NavElementProps {
	href: string
	label: string
}

const NavElement: FC<NavElementProps> = ({ href, label }) => {
	const isActive = usePathname().startsWith(href)
	return (
		<Link href={href} className='flex flex-col justify-center overflow-hidden relative'>
			<p className={`text-lg hover:text-white`}>{label}</p>
			{isActive && (
				<div className='absolute bottom-0 w-3/4 left-1/2 h-2 bg-primary-500 rounded-3xl translate-y-[50%] -translate-x-1/2'></div>
			)}
		</Link>
	)
}
