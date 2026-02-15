'use client'

import { useState } from 'react'
import type { Task } from '@/lib/types'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

interface CalendarViewProps {
  tasks: Task[]
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Navegação
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  // Geração do Grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Filtrar tarefas do dia selecionado
  const selectedDayTasks = tasks.filter(
    (task) => selectedDate && task.due_date && isSameDay(new Date(task.due_date), selectedDate),
  )

  // Função auxiliar para mapear prioridade -> classe semântica (Visual Focus OS)
  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-brand-red shadow-[0_0_8px_var(--brand-red)]' // Vermelho (Urgência)
      case 'high':
        return 'bg-brand-orange shadow-[0_0_8px_var(--brand-orange)]' // Laranja (Atenção)
      case 'medium':
        return 'bg-brand-petrol shadow-[0_0_8px_var(--brand-petrol)]' // Azul (Rotina)
      case 'low':
        return 'bg-brand-cyan shadow-[0_0_8px_var(--brand-cyan)]' // Ciano (Suave)
      default:
        return 'bg-brand-emerald shadow-[0_0_8px_var(--brand-emerald)]' // Verde (Padrão)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6">
      {/* 1. O CALENDÁRIO VISUAL */}
      <div className="flex-1 bg-card/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-2xl flex flex-col">
        {/* Header do Calendário */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-brand-violet" />
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="mr-2 border-white/10 hover:bg-white/5">
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-white/10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de Dias */}
        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
          {calendarDays.map((day) => {
            // Tarefas deste dia específico
            const dayTasks = tasks.filter(
              (task) => task.due_date && isSameDay(new Date(task.due_date), day),
            )

            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-start justify-start group min-h-[80px] overflow-hidden',
                  // Estilo do dia (Mês atual vs Outro mês)
                  !isSameMonth(day, monthStart)
                    ? 'bg-black/20 border-transparent opacity-30 hover:opacity-50'
                    : 'bg-white/5 border-white/5 hover:border-brand-violet/50 hover:bg-white/10',
                  // Selecionado
                  isSameDay(day, selectedDate!) &&
                    'ring-2 ring-brand-violet ring-offset-2 ring-offset-background bg-brand-violet/10',
                  // Hoje
                  isToday(day) &&
                    !isSameDay(day, selectedDate!) &&
                    'border-brand-cyan/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]',
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors',
                    isToday(day)
                      ? 'bg-brand-cyan text-black shadow-neon-cyan'
                      : 'text-muted-foreground group-hover:text-white',
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Indicadores de Tarefa (Barras Semânticas) */}
                <div className="flex flex-col gap-1 w-full mt-1 px-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <HoverCard key={task.id} openDelay={200}>
                      <HoverCardTrigger asChild>
                        <div
                          className={cn(
                            'w-full h-1.5 rounded-full transition-all hover:h-2 hover:brightness-125 opacity-90',
                            getPriorityColorClass(task.priority),
                          )}
                        />
                      </HoverCardTrigger>
                      <HoverCardContent className="bg-popover/95 border-white/10 p-3 shadow-2xl z-50">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={cn('w-2 h-2 rounded-full', getPriorityColorClass(task.priority))}
                          />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {task.priority === 'urgent'
                              ? 'Urgente'
                              : task.priority === 'high'
                                ? 'Alta Prioridade'
                                : task.priority === 'medium'
                                  ? 'Rotina'
                                  : 'Baixa'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white line-clamp-2">{task.title}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {task.due_date ? format(new Date(task.due_date), 'HH:mm') : 'Dia todo'}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-muted-foreground pl-1 font-medium text-center block w-full">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. SIDEBAR DE DETALHES DO DIA (Agenda) */}
      <div className="w-full lg:w-80 bg-card/30 border-l border-white/5 p-6 flex flex-col backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 sticky top-0 bg-transparent">
          {selectedDate
            ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
            : 'Selecione um dia'}
        </h3>

        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 flex-1">
          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'group flex items-start gap-3 p-3 rounded-xl border border-white/5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                  'bg-card/70',
                  // Borda lateral colorida baseada na prioridade
                  task.priority === 'urgent'
                    ? 'border-l-2 border-l-brand-red'
                    : task.priority === 'high'
                      ? 'border-l-2 border-l-brand-orange'
                      : task.priority === 'medium'
                        ? 'border-l-2 border-l-brand-petrol'
                        : 'border-l-2 border-l-brand-cyan',
                )}
              >
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      'text-sm font-medium text-white truncate',
                      task.status === 'done' && 'line-through text-muted-foreground decoration-white/20',
                    )}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span
                      className={cn(
                        task.priority === 'urgent' && 'text-brand-red font-bold',
                        task.priority === 'high' && 'text-brand-orange',
                      )}
                    >
                      {task.due_date ? format(new Date(task.due_date), 'HH:mm') : 'Dia todo'}
                    </span>
                  </div>
                </div>

                {/* Checkbox Visual */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border border-white/20 flex items-center justify-center transition-colors',
                    task.status === 'done'
                      ? 'bg-brand-emerald border-none shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'group-hover:border-white/50',
                  )}
                >
                  {task.status === 'done' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-50 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Dia livre!<br />Aproveite para focar em você.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
