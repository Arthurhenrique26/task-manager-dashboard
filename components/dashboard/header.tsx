'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  CheckSquare,
  Menu,
  Sun,
  ListTodo,
  Kanban,
  Calendar,
  Timer,
  BarChart3,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DashboardHeaderProps {
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

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Erro ao sair')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">TaskFlow</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                  return (
                    <li key={item.name}>
                      <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium">
              {profile?.full_name || 'Usuario'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Configuracoes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
