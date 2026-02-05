import { createClient } from '@/lib/supabase/server'
import { KanbanView } from '@/components/dashboard/kanban-view'

export default async function KanbanPage() {
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
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <KanbanView 
      tasks={tasks || []} 
      categories={categories || []}
    />
  )
}
