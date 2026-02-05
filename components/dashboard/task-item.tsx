'use client'

import { useState, useTransition } from 'react'
import type { Task } from '@/lib/types'
import { updateTask, deleteTask } from '@/lib/actions/tasks'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface TaskItemProps {
  task: Task
  onEdit: () => void
  showCompleted?: boolean
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-destructive/10 text-destructive',
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export function TaskItem({ task, onEdit, showCompleted }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const isCompleted = task.status === 'done'

  function handleToggleComplete() {
    startTransition(async () => {
      const newStatus = isCompleted ? 'todo' : 'done'
      const result = await updateTask(task.id, { status: newStatus })
      
      if (result.error) {
        toast.error('Erro ao atualizar tarefa')
        return
      }

      if (newStatus === 'done') {
        // Celebrate!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0ea5e9', '#10b981', '#f59e0b'],
        })
        toast.success('Tarefa concluida!', {
          description: 'Parabens! Continue assim!',
        })
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTask(task.id)
      if (result.error) {
        toast.error('Erro ao excluir tarefa')
        return
      }
      toast.success('Tarefa excluida')
    })
  }

  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = dueDate && dueDate < new Date() && !isCompleted

  return (
    <Card className={cn(
      'transition-all duration-200',
      isPending && 'opacity-50',
      showCompleted && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isPending}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={cn(
                  'font-medium text-foreground',
                  isCompleted && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={cn(
                    'text-sm text-muted-foreground mt-1 line-clamp-2',
                    isCompleted && 'line-through'
                  )}>
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>

                  {task.category && (
                    <Badge 
                      variant="outline"
                      style={{ borderColor: task.category.color, color: task.category.color }}
                    >
                      {task.category.name}
                    </Badge>
                  )}

                  {task.estimated_minutes && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimated_minutes}min
                    </span>
                  )}

                  {dueDate && (
                    <span className={cn(
                      'text-xs flex items-center gap-1',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      <Calendar className="w-3 h-3" />
                      {dueDate.toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acoes</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
