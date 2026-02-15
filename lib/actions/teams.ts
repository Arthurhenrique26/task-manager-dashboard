'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Definindo os campos possíveis para erro
type TeamField = 'name' | 'description' | 'code'

export type TeamActionState = {
  status: 'idle' | 'error' | 'success'
  message?: string
  fieldErrors?: Partial<Record<TeamField, string>>
}

const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome precisa ter pelo menos 3 caracteres.')
    .max(60, 'O nome pode ter no máximo 60 caracteres.'),
  description: z
    .string()
    .trim()
    .max(140, 'A descrição pode ter no máximo 140 caracteres.')
    .optional(),
})

const joinTeamSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'O código precisa ter 6 caracteres.')
    .regex(/^[A-Za-z0-9]+$/, 'Use apenas letras e números.')
    .transform((val) => val.toUpperCase()),
})

function getText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

// Helper para converter erros do Zod para nosso formato
function toFieldErrors(error: z.ZodError): Partial<Record<TeamField, string>> {
  const fieldErrors: Partial<Record<TeamField, string>> = {}
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as TeamField
    if (path) {
      fieldErrors[path] = issue.message
    }
  })
  
  return fieldErrors
}

export async function createTeam(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Você precisa estar logado.' }
  }

  // Validação
  const rawData = {
    name: getText(formData, 'name'),
    description: getText(formData, 'description'),
  }

  const result = createTeamSchema.safeParse(rawData)

  if (!result.success) {
    return {
      status: 'error',
      message: 'Verifique os campos abaixo.',
      fieldErrors: toFieldErrors(result.error),
    }
  }

  const { name, description } = result.data

  // 1. Criar Time
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      description: description || null,
      owner_id: user.id
    })
    .select('id')
    .single()

  if (teamError) {
    console.error('Erro ao criar time:', teamError)
    return { status: 'error', message: 'Erro ao criar equipe. Tente novamente.' }
  }

  // 2. Vincular Owner (A policy deve permitir isso agora)
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner'
    })

  if (memberError) {
    console.error('Erro ao vincular owner:', memberError)
    // Se falhar aqui, o time fica órfão. Ideal seria deletar, mas o RLS pode impedir.
    return { status: 'error', message: 'Equipe criada, mas houve erro ao vincular membro.' }
  }

  revalidatePath('/dashboard/teams')
  return { status: 'success', message: 'Equipe criada com sucesso!' }
}

export async function joinTeam(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Você precisa estar logado.' }
  }

  const rawCode = getText(formData, 'code')
  const result = joinTeamSchema.safeParse({ code: rawCode })

  if (!result.success) {
    return {
      status: 'error',
      message: 'Código inválido.',
      fieldErrors: toFieldErrors(result.error),
    }
  }

  const code = result.data.code

  // 1. Buscar time pelo código (RPC seguro)
  const { data: teamData, error: rpcError } = await supabase
    .rpc('get_team_by_code', { code_input: code })

  if (rpcError || !teamData) {
    return { status: 'error', message: 'Equipe não encontrada ou código inválido.' }
  }

  // O RPC pode retornar um array ou objeto dependendo da versão do driver/pg
  // Vamos garantir que temos um objeto com ID
  const team = Array.isArray(teamData) ? teamData[0] : teamData
  
  if (!team || !team.id) {
     return { status: 'error', message: 'Equipe inválida.' }
  }

  // 2. Entrar no time
  const { error: joinError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'member'
    })

  if (joinError) {
    if (joinError.code === '23505') { // Código Postgres para Unique Violation
      return { status: 'error', message: 'Você já faz parte desta equipe.' }
    }
    console.error('Erro ao entrar:', joinError)
    return { status: 'error', message: 'Erro ao entrar na equipe.' }
  }

  revalidatePath('/dashboard/teams')
  return { status: 'success', message: `Bem-vindo à equipe ${team.name}!` }
}