import { CreateDeviceForm } from '@/components/forms/CreateDeviceForm'
import { CreateUserForm } from '@/components/forms/CreateUserForm'
import { ModalFormOpenBtn } from '@/components/forms/ModalFormOpenBtn'
import { PageSection } from '@/components/PageSection'
import { AdminBookingsTable } from '@/components/table/AdminBookingsTable'
import { AdminDevicesTable } from '@/components/table/AdminDevicesTable'
import { AdminUsersTable } from '@/components/table/AdminUsersTable'

export default async function AdminPage() {
	return (
		<div>
			<PageSection
				label='Użytkownicy'
				action={<ModalFormOpenBtn label='Utwórz nowego' FormComponent={CreateUserForm} />}
			>
				<AdminUsersTable />
			</PageSection>

			<PageSection
				label='Przyrządy'
				action={<ModalFormOpenBtn label='Dodaj nowy' FormComponent={CreateDeviceForm} />}
			>
				<AdminDevicesTable />
			</PageSection>

			<PageSection label='Rezerwacje'>
				<AdminBookingsTable />
			</PageSection>
		</div>
	)
}
