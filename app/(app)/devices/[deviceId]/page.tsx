import AvailabilityDisplay from '@/components/AvailabilityDisplay'
import { CreateBookingForm } from '@/components/forms/CreateBookingForm'
import { ModalFormOpenBtn } from '@/components/forms/ModalFormOpenBtn'
import { InfoLabel } from '@/components/InfoLabel'
import { PageSection } from '@/components/PageSection'
import { DeviceBookingsTable } from '@/components/table/DeviceBookingsTable'
import { UserBookingsTable } from '@/components/table/UserBookingsTable'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'

interface DynamicParams {
	deviceId: string
}

type Params = { params: Promise<DynamicParams> }

export default async function Home({ params }: Params) {
	const session = await auth()
	const isAdmin = session?.user?.role === 'ADMIN'

	const device = await prisma.device.findUnique({
		where: { id: (await params).deviceId },
		select: {
			name: true,
			building: true,
			room: true,
			description: true,
			id: true,
		},
	})

	if (device === null) notFound()

	return (
		<div>
			<PageSection
				label='Informacje'
				action={<ModalFormOpenBtn label='Zarezerwuj' FormComponent={CreateBookingForm} />}
			>
				<InfoLabel label='Nazwa' value={device.name} />
				<InfoLabel label='Opis' value={device.description} />
				<InfoLabel label='Budynek, Sala' value={device.building + ', ' + device.room} />
				<InfoLabel label='id' value={device.id} />
			</PageSection>

			<PageSection label='Dostępność'>
				<AvailabilityDisplay />
			</PageSection>

			<PageSection label='Moje rezerwacje'>
				<UserBookingsTable deviceId={(await params).deviceId} userId={session!.user!.id!} />
			</PageSection>

			{isAdmin && (
				<PageSection label='Wszystkie Rezerwacje [ADMIN]'>
					<DeviceBookingsTable deviceId={(await params).deviceId} isAdmin={isAdmin} />
				</PageSection>
			)}
		</div>
	)
}
