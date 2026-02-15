import { createClient } from '@/lib/supabase/server'
import { getTaskContext } from '@/lib/task-context'
import { CalendarView } from '@/components/dashboard/calendar-view'

export default async function CalendarPage() {
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
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

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

  return <CalendarView tasks={tasks || []} categories={categories || []} />
}
