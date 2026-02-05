import { createClient } from '@/lib/supabase/server'
import { SettingsView } from '@/components/dashboard/settings-view'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <SettingsView 
      user={user}
      profile={profile}
      categories={categories || []}
    />
  )
}
