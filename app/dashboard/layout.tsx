import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider } from '@/components/dashboard/sidebar-context'
import { TaskContextProvider } from '@/components/dashboard/task-context'
import { getTaskContextValue } from '@/lib/task-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Buscando os times
  const { data: members } = await supabase
    .from('team_members')
    .select('team:teams(id, name)')
    .eq('user_id', user.id)

  // 1. CORREÇÃO DE TIPO:
  // Forçamos o tipo através de 'unknown' para resolver o erro de array aninhado.
  // O Supabase às vezes tipa joins como arrays, mesmo sendo objetos únicos.
  const teams = (members?.map((m) => m.team) ?? []).filter(Boolean) as unknown as {
    id: string
    name: string
  }[]

  // 2. CORREÇÃO DE COOKIES (Next.js 15):
  // Adicionado 'await' aqui. Certifique-se que a função getTaskContextValue
  // no arquivo lib/task-context.ts também seja 'async'.
  const taskContextValue = await getTaskContextValue()

  return (
    <SidebarProvider>
      <TaskContextProvider initialValue={taskContextValue} teams={teams}>
        <div className="min-h-screen bg-background relative">
          <DashboardSidebar user={user} profile={profile} />

          <div className="w-full transition-all duration-300">
            <DashboardHeader user={user} profile={profile} />
            <main className="p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </TaskContextProvider>
    </SidebarProvider>
  )
}