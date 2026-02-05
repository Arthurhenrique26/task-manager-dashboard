'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CheckSquare,
  Sun,
  ListTodo,
  Kanban,
  Calendar,
  Timer,
  BarChart3,
  Settings,
} from 'lucide-react'

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

const navigation = [
  { name: 'Hoje', href: '/dashboard', icon: Sun },
  { name: 'Tarefas', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Kanban', href: '/dashboard/kanban', icon: Kanban },
  { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Pomodoro', href: '/dashboard/pomodoro', icon: Timer },
  { name: 'Relatorios', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Configuracoes', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
