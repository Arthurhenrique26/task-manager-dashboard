'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, Profile, PomodoroSession, PomodoroType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { updateTask } from '@/lib/actions/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Timer, Play, Pause, RotateCcw, Coffee, Zap, Target } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface PomodoroViewProps {
  tasks: Task[]
  profile: Profile | null
  todaySessions: PomodoroSession[]
}

type TimerState = 'idle' | 'running' | 'paused'

export function PomodoroView({ tasks, profile, todaySessions }: PomodoroViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  // Settings from profile or defaults
  const workDuration = (profile?.pomodoro_duration || 25) * 60
  const shortBreakDuration = (profile?.short_break || 5) * 60
  const longBreakDuration = (profile?.long_break || 15) * 60

  const [timerType, setTimerType] = useState<PomodoroType>('work')
  const [timeLeft, setTimeLeft] = useState(workDuration)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [sessionsCompleted, setSessionsCompleted] = useState(
    todaySessions.filter(s => s.type === 'work').length
  )

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  // Get duration based on timer type
  const getDuration = useCallback((type: PomodoroType) => {
    switch (type) {
      case 'work': return workDuration
      case 'short_break': return shortBreakDuration
      case 'long_break': return longBreakDuration
    }
  }, [workDuration, shortBreakDuration, longBreakDuration])

  // Reset timer when type changes
  useEffect(() => {
    setTimeLeft(getDuration(timerType))
    setTimerState('idle')
  }, [timerType, getDuration])

  // Timer countdown
  useEffect(() => {
    if (timerState !== 'running') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerState])

  async function handleTimerComplete() {
    setTimerState('idle')
    
    // Play sound
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {})

    // Save session
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('pomodoro_sessions').insert({
        user_id: user.id,
        task_id: selectedTaskId || null,
        duration_minutes: Math.round(getDuration(timerType) / 60),
        type: timerType,
      })
    }

    if (timerType === 'work') {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)

      // Update task actual_minutes
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId)
        if (task) {
          startTransition(async () => {
            await updateTask(selectedTaskId, {
              actual_minutes: (task.actual_minutes || 0) + (profile?.pomodoro_duration || 25)
            })
          })
        }
      }

      // Celebrate
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#10b981', '#f59e0b'],
      })

      toast.success('Pomodoro concluido!', {
        description: `${newCount} sessoes completas hoje`,
      })

      // Suggest break
      if (newCount % 4 === 0) {
        setTimerType('long_break')
        toast.info('Hora de uma pausa longa!', {
          description: 'Voce completou 4 pomodoros. Descanse um pouco.',
        })
      } else {
        setTimerType('short_break')
        toast.info('Hora de uma pausa curta!', {
          description: 'Levante, alongue-se, beba agua.',
        })
      }
    } else {
      toast.success('Pausa terminada!', {
        description: 'Pronto para mais um pomodoro?',
      })
      setTimerType('work')
    }

    router.refresh()
  }

  function handleStart() {
    setTimerState('running')
  }

  function handlePause() {
    setTimerState('paused')
  }

  function handleReset() {
    setTimerState('idle')
    setTimeLeft(getDuration(timerType))
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((getDuration(timerType) - timeLeft) / getDuration(timerType)) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Pomodoro
          </h1>
          <p className="text-muted-foreground">Mantenha o foco e aumente sua produtividade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            {/* Timer Type Selection */}
            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={timerType === 'work' ? 'default' : 'outline'}
                onClick={() => setTimerType('work')}
                disabled={timerState === 'running'}
              >
                <Zap className="w-4 h-4 mr-1" />
                Foco
              </Button>
              <Button
                variant={timerType === 'short_break' ? 'default' : 'outline'}
                onClick={() => setTimerType('short_break')}
                disabled={timerState === 'running'}
              >
                <Coffee className="w-4 h-4 mr-1" />
                Pausa Curta
              </Button>
              <Button
                variant={timerType === 'long_break' ? 'default' : 'outline'}
                onClick={() => setTimerType('long_break')}
                disabled={timerState === 'running'}
              >
                <Coffee className="w-4 h-4 mr-1" />
                Pausa Longa
              </Button>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className={cn(
                'text-8xl font-bold tabular-nums tracking-tight',
                timerType === 'work' ? 'text-primary' : 'text-accent'
              )}>
                {formatTime(timeLeft)}
              </div>
              <Progress 
                value={progress} 
                className="mt-4 h-2"
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {timerState === 'running' ? (
                <Button size="lg" variant="outline" onClick={handlePause}>
                  <Pause className="w-5 h-5 mr-2" />
                  Pausar
                </Button>
              ) : (
                <Button size="lg" onClick={handleStart}>
                  <Play className="w-5 h-5 mr-2" />
                  {timerState === 'paused' ? 'Continuar' : 'Iniciar'}
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Task Selection */}
            {timerType === 'work' && tasks.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Tarefa atual
                </label>
                <Select 
                  value={selectedTaskId || 'none'} 
                  onValueChange={setSelectedTaskId}
                  disabled={timerState === 'running'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tarefa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma tarefa</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTask && (
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <h4 className="font-medium text-foreground">{selectedTask.title}</h4>
                    {selectedTask.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTask.description}
                      </p>
                    )}
                    {selectedTask.estimated_minutes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Estimativa: {selectedTask.estimated_minutes}min | 
                        Tempo gasto: {selectedTask.actual_minutes || 0}min
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Sessoes Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {sessionsCompleted}
              </div>
              <p className="text-sm text-muted-foreground">
                pomodoros completos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Tempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {Math.round(sessionsCompleted * (profile?.pomodoro_duration || 25))}
              </div>
              <p className="text-sm text-muted-foreground">
                minutos focados hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Historico de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length > 0 ? (
                <div className="space-y-2">
                  {todaySessions.slice(0, 5).map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Badge variant={session.type === 'work' ? 'default' : 'secondary'}>
                        {session.type === 'work' ? 'Foco' : 'Pausa'}
                      </Badge>
                      <span className="text-muted-foreground">
                        {session.duration_minutes}min
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma sessao hoje ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
