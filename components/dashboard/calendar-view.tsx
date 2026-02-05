'use client'

import { useState } from 'react'
import type { Task, Category } from '@/lib/types'
import { TaskEditDialog } from './task-edit-dialog'
import { QuickAddTask } from './quick-add-task'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CalendarViewProps {
  tasks: Task[]
  categories: Category[]
}

const priorityColors = {
  low: 'bg-muted',
  medium: 'bg-primary',
  high: 'bg-orange-500',
  urgent: 'bg-destructive',
}

export function CalendarView({ tasks, categories }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR })
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  function getTasksForDay(date: Date) {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      return isSameDay(new Date(task.due_date), date)
    })
  }

  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Calendario
          </h1>
          <p className="text-muted-foreground">Visualize suas tarefas por data</p>
        </div>
      </div>

      <QuickAddTask categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayTasks = getTasksForDay(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[80px] p-2 rounded-lg text-left transition-colors',
                      !isSameMonth(day, currentMonth) && 'opacity-40',
                      isToday(day) && 'bg-primary/10',
                      isSelected && 'ring-2 ring-primary',
                      'hover:bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday(day) && 'text-primary'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'h-1.5 rounded-full',
                            priorityColors[task.priority],
                            task.status === 'done' && 'opacity-40'
                          )}
                          title={task.title}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Tasks */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-4">
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : 'Selecione um dia'}
            </h3>

            {selectedDate ? (
              selectedDayTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setEditingTask(task)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                            priorityColors[task.priority]
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              'font-medium text-sm text-foreground',
                              task.status === 'done' &&
                                'line-through text-muted-foreground'
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.category && (
                            <Badge
                              variant="outline"
                              className="text-xs mt-1"
                              style={{
                                borderColor: task.category.color,
                                color: task.category.color,
                              }}
                            >
                              {task.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nenhuma tarefa para este dia
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                Clique em um dia para ver as tarefas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskEditDialog
        task={editingTask}
        categories={categories}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </div>
  )
}
