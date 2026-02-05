import { createClient } from '@/lib/supabase/server'
import { ReportsView } from '@/components/dashboard/reports-view'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get tasks stats
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null)

  // Get last 7 days of completed tasks
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentCompletedTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('completed_at', sevenDaysAgo.toISOString())

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
    .select(`
      *,
      tasks(count)
    `)
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
