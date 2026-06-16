import {
  Rocket, LayoutTemplate, GitCompare, Database, History,
} from 'lucide-react'

// Shared navigation config used by both the desktop Sidebar and the mobile
// BottomNav so the two can never drift out of sync.
export const NAV_ITEMS = [
  { href: '/deploy',    label: 'Deploy',    Icon: Rocket,         soon: false },
  { href: '/templates', label: 'Templates', Icon: LayoutTemplate, soon: false },
  { href: '/compare',   label: 'Compare',   Icon: GitCompare,     soon: false },
  { href: '/registry',  label: 'Registry',  Icon: Database,       soon: true  },
  { href: '/history',   label: 'History',   Icon: History,        soon: false },
] as const
