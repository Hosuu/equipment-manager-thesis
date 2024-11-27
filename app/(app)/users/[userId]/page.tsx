import { CreateApiKeyForm } from '@/components/forms/CreateApiKeyForm'
import { ModalFormOpenBtn } from '@/components/forms/ModalFormOpenBtn'
import { UpdatePasswordForm } from '@/components/forms/UpdatePasswordForm'
import { UpdateUserNameForm } from '@/components/forms/UpdateUserForm'
import { InfoLabel } from '@/components/InfoLabel'
import { PageSection } from '@/components/PageSection'
import { RelativeTime } from '@/components/RelativeTime'
import { UserBookingsTable } from '@/components/table/UserBookingsTable'
import { UserKeysTable } from '@/components/table/UserKeysTable'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'

interface DynamicParams {
	userId: string
}

type Params = { params: Promise<DynamicParams> }

export default async function UserPage({ params }: Params) {
	const session = await auth()

	const user = await prisma.user.findUnique({
		where: { id: (await params).userId },
		select: {
			name: true,
			email: true,
			createdAt: true,
			id: true,
		},
	})

	if (user === null) notFound()

	const isSelf = session?.user?.id === (await params).userId
	const selfOrAdmin = session?.user?.role === 'ADMIN' || isSelf

	return (
		<div>
			<PageSection
				label='Informacje'
				action={
					isSelf && (
						<div className='flex gap-4'>
							<ModalFormOpenBtn label='Zmień hasło' FormComponent={UpdatePasswordForm} />
							<ModalFormOpenBtn label='Edytuj nazwę' FormComponent={UpdateUserNameForm} />
						</div>
					)
				}
			>
				<InfoLabel label='Nazwa' value={user.name} />
				<InfoLabel label='Adres Email' value={user.email} />
				<InfoLabel
					label='Data utworzenia konta'
					value={<RelativeTime timeStamp={user.createdAt} />}
				/>
				<InfoLabel label='id' value={user.id} />
			</PageSection>

			{selfOrAdmin && (
				<>
					<PageSection label='Rezerwacje'>
						<UserBookingsTable userId={(await params).userId} />
					</PageSection>

					<PageSection
						label='Klucze API'
						action={
							<ModalFormOpenBtn label='Utwórz nowy' FormComponent={CreateApiKeyForm} />
						}
					>
						<UserKeysTable userId={(await params).userId} />
					</PageSection>
				</>
			)}
		</div>
	)
}
