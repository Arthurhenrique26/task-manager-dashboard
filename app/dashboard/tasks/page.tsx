import { createClient } from '@/lib/supabase/server'
import { getTaskContext } from '@/lib/task-context'
import { AllTasksView } from '@/components/dashboard/all-tasks-view'

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // CORREÇÃO: Adicionado 'await' aqui
  // O contexto depende de cookies(), que agora é uma Promise
  const taskContext = await getTaskContext()

  let tasksQuery = supabase
    .from('tasks')
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .is('parent_id', null)
    .order('status', { ascending: true })
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (taskContext.type === 'team') {
    tasksQuery = tasksQuery.eq('team_id', taskContext.teamId)
  } else {
    tasksQuery = tasksQuery.eq('user_id', user.id).is('team_id', null)
  }

  const { data: tasks } = await tasksQuery

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return <AllTasksView tasks={tasks || []} categories={categories || []} />
}