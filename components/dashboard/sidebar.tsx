'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import type { TaskContextValue } from '@/lib/task-context-shared'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/dashboard/sidebar-context'
import { useTaskContext } from '@/components/dashboard/task-context'
import {
  useAppearance,
  backgroundThemes,
  surfaceThemes,
} from '@/components/appearance-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LayoutDashboard,
  CheckSquare,
  Network,
  Map,
  CalendarRange,
  Target,
  Settings,
  Zap,
  Columns,
  Timer,
  X,
  Users,
  Flame,
  Layers,
  Palette,
  Loader2,
} from 'lucide-react'

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

const navigation = [
  { name: 'Timeline', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Equipes', href: '/dashboard/teams', icon: Users },
  { name: 'Calendário Master', href: '/dashboard/calendar', icon: CalendarRange },
  { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
  { name: 'Árvore de Projetos', href: '/dashboard/projects', icon: Network },
  { name: 'Quadro Kanban', href: '/dashboard/kanban', icon: Columns },
  { name: 'Minhas Tarefas', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Modo Foco', href: '/dashboard/pomodoro', icon: Timer },
  { name: 'Performance', href: '/dashboard/reports', icon: Target },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()
  const {
    value: taskContextValue,
    setValue: setTaskContextValue,
    teams,
    isPending: isContextPending,
  } = useTaskContext()
  const { background, surface, setBackground, setSurface } = useAppearance()
  const [isHovered, setIsHovered] = useState(false)

  // CORREÇÃO DE HIDRATAÇÃO: Estado para controlar Mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const updateIsMobile = () => setIsMobile(media.matches)

    updateIsMobile()
    media.addEventListener('change', updateIsMobile)

    return () => media.removeEventListener('change', updateIsMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsHovered(false)
    }
  }, [isMobile])

  // Abre se estiver clicado (isOpen) OU se o mouse estiver em cima (isHovered e não for mobile)
  // No mobile, hover não existe/não deve abrir sozinho
  const isVisible = isOpen || (!isMobile && isHovered)
  const hasTeams = teams.length > 0

  return (
    <>
      {/* 1. ZONA DE GATILHO (HOVER) - Apenas Desktop */}
      {!isMobile && (
        <div
          className="fixed inset-y-0 left-0 w-6 z-40 bg-transparent"
          onMouseEnter={() => setIsHovered(true)}
        />
      )}

      {/* 2. OVERLAY ESCURO (Apenas Mobile quando aberto) */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}

      {/* 3. A SIDEBAR FLUTUANTE */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-background/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col h-[100dvh]',
          isVisible ? 'translate-x-0' : '-translate-x-full',
        )}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        aria-label="Menu lateral"
      >
        {/* Header da Sidebar */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-violet rounded-lg flex items-center justify-center shadow-neon-violet">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Focus OS</span>
          </div>
          {/* Botão fechar (visível apenas se aberto via clique) */}
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="lg:hidden text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Scroll Area Principal */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Widget Streak */}
          <div className="mb-6 bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-medium text-white">12 dias</span>
            </div>
            <span className="text-xs text-muted-foreground">Sequência</span>
          </div>

          <div className="mb-6 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Contexto
                </span>
                {isContextPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : (
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="mt-3">
                <Select
                  value={taskContextValue}
                  onValueChange={(value) =>
                    setTaskContextValue(value as TaskContextValue)
                  }
                  disabled={isContextPending}
                >
                  <SelectTrigger className="w-full bg-black/20 border-white/10">
                    <SelectValue placeholder="Selecione o contexto" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 border-white/10">
                    <SelectItem value="personal">Minhas tarefas</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={`team:${team.id}`}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasTeams && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Você ainda não participa de equipes.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Aparência
                </span>
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    Fundo do sistema
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {backgroundThemes.map((theme) => {
                      const isActive = theme.value === background
                      return (
                        <button
                          key={theme.value}
                          type="button"
                          aria-label={theme.label}
                          title={theme.label}
                          aria-pressed={isActive}
                          onClick={() => setBackground(theme.value)}
                          className={cn(
                            'h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet',
                            theme.className,
                            isActive
                              ? 'ring-2 ring-brand-violet border-white/40'
                              : 'border-white/10 hover:border-white/30',
                          )}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    Componentes
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {surfaceThemes.map((theme) => {
                      const isActive = theme.value === surface
                      return (
                        <button
                          key={theme.value}
                          type="button"
                          aria-label={theme.label}
                          title={theme.label}
                          aria-pressed={isActive}
                          onClick={() => setSurface(theme.value)}
                          className={cn(
                            'h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet',
                            theme.className,
                            isActive
                              ? 'ring-2 ring-brand-violet border-white/40'
                              : 'border-white/10 hover:border-white/30',
                          )}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col space-y-1" aria-label="Navegação principal">
            {navigation.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) close()
                  }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-sm font-medium mb-1 transition-all',
                      isActive
                        ? 'bg-brand-violet/10 text-brand-violet border-l-2 border-brand-violet rounded-l-none'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5',
                    )}
                  >
                    <item.icon
                      className={cn('mr-3 h-5 w-5', isActive && 'text-brand-violet')}
                    />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Fixo */}
        <div className="p-4 border-t border-white/5 bg-background/95">
          <Link
            href="/dashboard/settings"
            onClick={() => {
              if (isMobile) close()
            }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-white"
            >
              <Settings className="mr-3 h-5 w-5" />
              Ajustes
            </Button>
          </Link>
        </div>
      </aside>
    </>
  )
}
