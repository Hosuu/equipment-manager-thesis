import { PageSection } from '@/components/PageSection'
import { DevicesTable } from '@/components/table/DeviceTable'

export default function Home() {
	return (
		<PageSection label='Lista przyrządów'>
			<DevicesTable />
		</PageSection>
	)
}
