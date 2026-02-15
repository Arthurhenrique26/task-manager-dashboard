import { createClient } from '@/lib/supabase/server'
import { getTaskContext } from '@/lib/task-context'
import { ReportsView } from '@/components/dashboard/reports-view'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const taskContext = getTaskContext()

  // Get tasks stats
  let allTasksQuery = supabase
    .from('tasks')
    .select('*')
    .is('parent_id', null)

  if (taskContext.type === 'team') {
    allTasksQuery = allTasksQuery.eq('team_id', taskContext.teamId)
  } else {
    allTasksQuery = allTasksQuery.eq('user_id', user.id).is('team_id', null)
  }

  const { data: allTasks } = await allTasksQuery

  // Get last 7 days of completed tasks
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let completedTasksQuery = supabase
    .from('tasks')
    .select('*')
    .eq('status', 'done')
    .gte('completed_at', sevenDaysAgo.toISOString())

  if (taskContext.type === 'team') {
    completedTasksQuery = completedTasksQuery.eq('team_id', taskContext.teamId)
  } else {
    completedTasksQuery = completedTasksQuery.eq('user_id', user.id).is('team_id', null)
  }

  const { data: recentCompletedTasks } = await completedTasksQuery

  // Get last 7 days of pomodoro sessions
  const { data: recentSessions } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', sevenDaysAgo.toISOString())
    .order('completed_at', { ascending: true })

  // Get emotional check-ins
  const { data: recentCheckins } = await supabase
    .from('emotional_checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Get categories with task counts
  const { data: categories } = await supabase
    .from('categories')
    .select(
      `
      *,
      tasks(count)
    `,
    )
    .eq('user_id', user.id)

  return (
    <ReportsView
      allTasks={allTasks || []}
      recentCompletedTasks={recentCompletedTasks || []}
      recentSessions={recentSessions || []}
      recentCheckins={recentCheckins || []}
      categories={categories || []}
    />
  )
}
