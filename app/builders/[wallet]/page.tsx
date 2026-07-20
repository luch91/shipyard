import type { Metadata } from 'next'
import BuilderProfile from '@/components/builders/BuilderProfile'

export const metadata: Metadata = {
  title: 'Builder Profile',
  description: 'A GenLayer builder’s reputation and verified contract deployments on Shipyard.',
}

export default function BuilderProfilePage() {
  return <BuilderProfile />
}
