'use client'

import React from 'react'

import { useState, useTransition } from 'react'
import type { Category, TaskPriority } from '@/lib/types'
import { createTask } from '@/lib/actions/tasks'
import { useTaskContext } from '@/components/dashboard/task-context'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Plus, CalendarIcon, Flag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface QuickAddTaskProps {
  categories: Category[]
  parentId?: string
}

export function QuickAddTask({ categories, parentId }: QuickAddTaskProps) {
  const { context } = useTaskContext()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [categoryId, setCategoryId] = useState<string>('none') // Updated default value
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [showOptions, setShowOptions] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) return

    const teamId = context.type === 'team' ? context.teamId : undefined
    const resolvedCategoryId = categoryId === 'none' ? undefined : categoryId

    startTransition(async () => {
      const result = await createTask({
        title: title.trim(),
        priority,
        category_id: resolvedCategoryId,
        team_id: teamId,
        due_date: dueDate?.toISOString(),
        parent_id: parentId,
      })

      if (result.error) {
        toast.error('Erro ao criar tarefa', {
          description: result.error,
        })
        return
      }

      toast.success('Tarefa criada!')
      setTitle('')
      setPriority('medium')
      setCategoryId('none') // Updated default value
      setDueDate(undefined)
      setShowOptions(false)
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Adicionar nova tarefa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setShowOptions(true)}
                disabled={isPending}
                className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
              />
            </div>
            <Button type="submit" size="sm" disabled={!title.trim() || isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Adicionar</span>
            </Button>
          </div>

          {showOptions && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              {/* Priority */}
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-[130px] h-8">
                  <Flag className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>

              {/* Category */}
              {categories.length > 0 && (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-[150px] h-8">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Due Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-8 justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {dueDate
                      ? format(dueDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
