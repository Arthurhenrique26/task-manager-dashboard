'use client'

import { useState } from 'react'
import type { Task, Category, TaskStatus, TaskPriority } from '@/lib/types'
import { TaskList } from './task-list'
import { QuickAddTask } from './quick-add-task'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, ListTodo, X } from 'lucide-react'

interface AllTasksViewProps {
  tasks: Task[]
  categories: Category[]
}

export function AllTasksView({ tasks, categories }: AllTasksViewProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTasks = tasks.filter((task) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false
    }
    if (categoryFilter !== 'all' && task.category_id !== categoryFilter) {
      return false
    }
    return true
  })

  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" />
            Todas as Tarefas
          </h1>
          <p className="text-muted-foreground">{tasks.length} tarefas no total</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluida</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
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

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <QuickAddTask categories={categories} />

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} categories={categories} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ListTodo className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {hasFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
            </h3>
            <p className="text-muted-foreground">
              {hasFilters 
                ? 'Tente ajustar os filtros' 
                : 'Comece adicionando sua primeira tarefa'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
