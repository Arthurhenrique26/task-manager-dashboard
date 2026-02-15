'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { setTaskContext } from '@/lib/actions/context'
import {
  parseTaskContext,
  type TaskContext,
  type TaskContextValue,
} from '@/lib/task-context-shared'

type TeamOption = {
  id: string
  name: string
}

type TaskContextState = {
  value: TaskContextValue
  context: TaskContext
  teams: TeamOption[]
  isPending: boolean
  setValue: (value: TaskContextValue) => void
}

const TaskContext = React.createContext<TaskContextState | undefined>(undefined)

export function TaskContextProvider({
  children,
  initialValue = 'personal',
  teams = [],
}: {
  children: React.ReactNode
  initialValue?: TaskContextValue
  teams?: TeamOption[]
}) {
  const router = useRouter()
  const [value, setValueState] = React.useState<TaskContextValue>(initialValue)
  const [isPending, startTransition] = React.useTransition()

  const validValue = React.useMemo<TaskContextValue>(() => {
    if (value === 'personal') return value
    const teamId = value.slice(5)
    const exists = teams.some((team) => team.id === teamId)
    return exists ? value : 'personal'
  }, [value, teams])

  React.useEffect(() => {
    if (validValue !== value) {
      setValueState(validValue)
      startTransition(() => {
        void setTaskContext(validValue).then(() => router.refresh())
      })
    }
  }, [validValue, value, router])

  const setValue = React.useCallback(
    (nextValue: TaskContextValue) => {
      if (nextValue === value) return
      setValueState(nextValue)
      startTransition(() => {
        void setTaskContext(nextValue).then(() => router.refresh())
      })
    },
    [value, router],
  )

  const context = React.useMemo(() => parseTaskContext(validValue), [validValue])

  const state = React.useMemo(
    () => ({
      value: validValue,
      context,
      teams,
      isPending,
      setValue,
    }),
    [validValue, context, teams, isPending, setValue],
  )

  return <TaskContext.Provider value={state}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const context = React.useContext(TaskContext)

  if (!context) {
    throw new Error('useTaskContext must be used within a TaskContextProvider')
  }

  return context
}
