import {
  Rocket, LayoutTemplate, GitCompare, Database, History, Trophy,
} from 'lucide-react'

// Shared navigation config used by both the desktop Sidebar and the mobile
// BottomNav so the two can never drift out of sync.
//
// `isNew` shows a "New" badge until the user visits that route; dismissal is
// persisted in localStorage under `${NEW_SEEN_PREFIX}${href}`.
export const NEW_SEEN_PREFIX = 'shipyard:nav-new-seen:'

export const NAV_ITEMS = [
  { href: '/deploy',    label: 'Deploy',    Icon: Rocket,         group: 'Build',   soon: false, isNew: false },
  { href: '/templates', label: 'Templates', Icon: LayoutTemplate, group: 'Build',   soon: false, isNew: false },
  { href: '/compare',   label: 'Compare',   Icon: GitCompare,     group: 'Build',   soon: false, isNew: false },
  { href: '/registry',  label: 'Registry',  Icon: Database,       group: 'Explore', soon: false, isNew: true  },
  { href: '/builders',  label: 'Builders',  Icon: Trophy,         group: 'Explore', soon: false, isNew: true  },
  { href: '/history',   label: 'History',   Icon: History,        group: 'Explore', soon: false, isNew: false },
] as const
