'use client'

import { useState } from 'react'
import type { Task, Category } from '@/lib/types'
import { TaskItem } from './task-item'
import { TaskEditDialog } from './task-edit-dialog'

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  showCompleted?: boolean
}

export function TaskList({ tasks, categories, showCompleted }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={() => setEditingTask(task)}
            showCompleted={showCompleted}
          />
        ))}
      </div>

      <TaskEditDialog
        task={editingTask}
        categories={categories}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </>
  )
}
