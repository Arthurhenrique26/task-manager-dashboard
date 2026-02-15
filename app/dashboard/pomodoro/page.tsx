import { createClient } from '@/lib/supabase/server'
import { getTaskContext } from '@/lib/task-context'
import { PomodoroView } from '@/components/dashboard/pomodoro-view'

export default async function PomodoroPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const taskContext = getTaskContext()

  // Get incomplete tasks for selection
  let tasksQuery = supabase
    .from('tasks')
    .select(
      `
      *,
      category:categories(*)
    `,
    )
    .neq('status', 'done')
    .is('parent_id', null)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (taskContext.type === 'team') {
    tasksQuery = tasksQuery.eq('team_id', taskContext.teamId)
  } else {
    tasksQuery = tasksQuery.eq('user_id', user.id).is('team_id', null)
  }

  const { data: tasks } = await tasksQuery

  // Get profile for pomodoro settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todaySessions } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', today.toISOString())
    .order('completed_at', { ascending: false })

  return (
    <PomodoroView tasks={tasks || []} profile={profile} todaySessions={todaySessions || []} />
  )
}
