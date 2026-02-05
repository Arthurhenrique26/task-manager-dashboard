import { createClient } from '@/lib/supabase/server'
import { AllTasksView } from '@/components/dashboard/all-tasks-view'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

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
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <AllTasksView 
      tasks={tasks || []} 
      categories={categories || []}
    />
  )
}
