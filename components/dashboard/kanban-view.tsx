'use client'

import React from "react"

import { useState, useTransition } from 'react'
import type { Task, Category, TaskStatus } from '@/lib/types'
import { updateTask } from '@/lib/actions/tasks'
import { TaskEditDialog } from './task-edit-dialog'
import { QuickAddTask } from './quick-add-task'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Kanban, Clock, Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { deleteTask } from '@/lib/actions/tasks'
import confetti from 'canvas-confetti'

interface KanbanViewProps {
  tasks: Task[]
  categories: Category[]
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'A Fazer', color: 'bg-muted' },
  { id: 'in_progress', title: 'Em Andamento', color: 'bg-primary/10' },
  { id: 'done', title: 'Concluido', color: 'bg-accent/10' },
]

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-destructive/10 text-destructive',
}

export function KanbanView({ tasks, categories }: KanbanViewProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  function handleDragStart(e: React.DragEvent, task: Task) {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, newStatus: TaskStatus) {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    startTransition(async () => {
      const result = await updateTask(draggedTask.id, { status: newStatus })
      
      if (result.error) {
        toast.error('Erro ao mover tarefa')
        return
      }

      if (newStatus === 'done') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0ea5e9', '#10b981', '#f59e0b'],
        })
        toast.success('Tarefa concluida!')
      } else {
        toast.success('Tarefa movida!')
      }
      
      setDraggedTask(null)
    })
  }

  function handleDeleteTask(taskId: string) {
    startTransition(async () => {
      const result = await deleteTask(taskId)
      if (result.error) {
        toast.error('Erro ao excluir tarefa')
        return
      }
      toast.success('Tarefa excluida')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Kanban className="w-6 h-6 text-primary" />
            Kanban
          </h1>
          <p className="text-muted-foreground">Arraste as tarefas entre as colunas</p>
        </div>
      </div>

      <QuickAddTask categories={categories} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)

          return (
            <div
              key={column.id}
              className={cn(
                'rounded-lg p-4 min-h-[500px]',
                column.color
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={cn(
                      'cursor-grab active:cursor-grabbing transition-all',
                      isPending && draggedTask?.id === task.id && 'opacity-50',
                      'hover:shadow-md'
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          'font-medium text-sm text-foreground',
                          task.status === 'done' && 'line-through text-muted-foreground'
                        )}>
                          {task.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingTask(task)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary" className={cn('text-xs', priorityColors[task.priority])}>
                          {task.priority === 'low' && 'Baixa'}
                          {task.priority === 'medium' && 'Media'}
                          {task.priority === 'high' && 'Alta'}
                          {task.priority === 'urgent' && 'Urgente'}
                        </Badge>

                        {task.category && (
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: task.category.color, color: task.category.color }}
                          >
                            {task.category.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {task.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimated_minutes}min
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Arraste tarefas aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
