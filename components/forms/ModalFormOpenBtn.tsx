'use client'

import { FC, useState } from 'react'
import Modal from '../Modal'

interface ModalFormOpenBtnProps {
	label: string
	FormComponent: FC<{ onClose: () => void }>
	onClick?: () => void
	isTableEdit?: boolean
}

export const ModalFormOpenBtn: FC<ModalFormOpenBtnProps> = ({
	label,
	FormComponent,
	onClick,
	isTableEdit,
}) => {
	const [isPopupOpen, setPopupOpen] = useState(false)
	const handleOpen = () => setPopupOpen(true)
	const handleClose = () => setPopupOpen(false)
	const defaultClassName =
		'flex cursor-pointer gap-2 place-items-center shadow-xl px-4 text-sm font-semibold rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-700'
	const TableEditClassName =
		'focus:outline-none text-white bg-yellow-500 hover:bg-yellow-600 active:scale-95 shadow-sm font-medium rounded-lg text-sm px-3 py-1 cursor-pointer'

	return (
		<div
			onClick={() => {
				onClick?.()
				handleOpen()
			}}
			className={isTableEdit ? TableEditClassName : defaultClassName}
		>
			{label}
			<Modal isOpen={isPopupOpen} onClose={handleClose} closeBtn={false}>
				<FormComponent onClose={handleClose} />
			</Modal>
		</div>
	)
}
