'use client'

import { ReactNode, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	closeBtn?: boolean
	closeWithBgClick?: boolean
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	closeBtn = false,
	closeWithBgClick = false,
}) => {
	const modalRoot = window.document.querySelector('body')!
	const bgRef = useRef(null)

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onClose])

	if (!isOpen) return null

	const modalContent = (
		<div
			ref={bgRef}
			className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'
			onClick={(e) => {
				if (!closeWithBgClick) return
				if (e.target === bgRef.current) e.stopPropagation()
				onClose()
			}}
		>
			<div className='relative bg-neutral-900 rounded-lg p-6 shadow-lg'>
				{closeBtn && (
					<button
						className='absolute top-2 right-2 text-primary-500 hover:text-red-500'
						onClick={(e) => {
							e.stopPropagation()
							onClose()
						}}
					>
						&times;
					</button>
				)}
				{children}
			</div>
		</div>
	)

	return ReactDOM.createPortal(modalContent, modalRoot)
}

export default Modal
