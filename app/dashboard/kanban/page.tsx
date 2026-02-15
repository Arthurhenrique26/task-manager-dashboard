import { createClient } from '@/lib/supabase/server'
import { getTaskContext } from '@/lib/task-context'
import { KanbanView } from '@/components/dashboard/kanban-view'

export default async function KanbanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const taskContext = getTaskContext()

  let tasksQuery = supabase
    .from('tasks')
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .is('parent_id', null)
    .order('position', { ascending: true })
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

  return <KanbanView tasks={tasks || []} categories={categories || []} />
}
