import { createClient } from '@/lib/supabase/server'
import { TodayView } from '@/components/dashboard/today-view'
import { EmotionalCheckinPrompt } from '@/components/dashboard/emotional-checkin-prompt'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get today's tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get all incomplete tasks and tasks with today's due date
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .is('parent_id', null)
    .order('status', { ascending: true })
    .order('priority', { ascending: false })

  // Check if user has done a check-in today
  const { data: todayCheckin } = await supabase
    .from('emotional_checkins')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .single()

  // Get categories for task creation
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Get profile for daily goal
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const completedToday = tasks?.filter(t => t.status === 'done').length || 0
  const dailyGoal = profile?.daily_goal || 5

  return (
    <div className="space-y-6">
      {!todayCheckin && <EmotionalCheckinPrompt />}
      
      <TodayView 
        tasks={tasks || []} 
        categories={categories || []}
        completedToday={completedToday}
        dailyGoal={dailyGoal}
      />
    </div>
  )
}
