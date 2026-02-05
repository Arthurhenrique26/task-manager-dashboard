'use client'

import type { Task, PomodoroSession, EmotionalCheckin, Category } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, CheckCircle2, Clock, TrendingUp, Smile, Zap } from 'lucide-react'
import {
  format,
  subDays,
  startOfDay,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReportsViewProps {
  allTasks: Task[]
  recentCompletedTasks: Task[]
  recentSessions: PomodoroSession[]
  recentCheckins: EmotionalCheckin[]
  categories: (Category & { tasks: { count: number }[] })[]
}

export function ReportsView({
  allTasks,
  recentCompletedTasks,
  recentSessions,
  recentCheckins,
  categories,
}: ReportsViewProps) {
  // Calculate stats
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(t => t.status === 'done').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalPomodoroMinutes = recentSessions
    .filter(s => s.type === 'work')
    .reduce((sum, s) => sum + s.duration_minutes, 0)

  const avgMood = recentCheckins.length > 0
    ? (recentCheckins.reduce((sum, c) => sum + c.mood, 0) / recentCheckins.length).toFixed(1)
    : '-'

  const avgEnergy = recentCheckins.length > 0
    ? (recentCheckins.reduce((sum, c) => sum + c.energy, 0) / recentCheckins.length).toFixed(1)
    : '-'

  // Calculate daily stats for last 7 days
  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayStart = startOfDay(date)
    
    const tasksCompleted = recentCompletedTasks.filter(t => 
      t.completed_at && isSameDay(new Date(t.completed_at), dayStart)
    ).length

    const pomodoroMinutes = recentSessions
      .filter(s => s.type === 'work' && isSameDay(new Date(s.completed_at), dayStart))
      .reduce((sum, s) => sum + s.duration_minutes, 0)

    const checkin = recentCheckins.find(c => isSameDay(new Date(c.created_at), dayStart))

    return {
      date,
      label: format(date, 'EEE', { locale: ptBR }),
      tasksCompleted,
      pomodoroMinutes,
      mood: checkin?.mood,
      energy: checkin?.energy,
    }
  })

  const maxTasks = Math.max(...dailyStats.map(d => d.tasksCompleted), 1)
  const maxMinutes = Math.max(...dailyStats.map(d => d.pomodoroMinutes), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Relatorios
          </h1>
          <p className="text-muted-foreground">Acompanhe sua produtividade</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Taxa de Conclusao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {completedTasks} de {totalTasks} tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Focado (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {Math.floor(totalPomodoroMinutes / 60)}h {totalPomodoroMinutes % 60}m
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {recentSessions.filter(s => s.type === 'work').length} pomodoros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Humor Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgMood}</div>
            <p className="text-sm text-muted-foreground mt-1">
              de 5 (ultimos 7 dias)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energia Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgEnergy}</div>
            <p className="text-sm text-muted-foreground mt-1">
              de 5 (ultimos 7 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Completed Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tarefas Concluidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {dailyStats.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ 
                        height: `${(day.tasksCompleted / maxTasks) * 100}%`,
                        minHeight: day.tasksCompleted > 0 ? '8px' : '0'
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>Total: {recentCompletedTasks.length} tarefas</span>
              <span>Media: {(recentCompletedTasks.length / 7).toFixed(1)}/dia</span>
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro Minutes Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minutos Focados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {dailyStats.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-accent rounded-t transition-all"
                      style={{ 
                        height: `${(day.pomodoroMinutes / maxMinutes) * 100}%`,
                        minHeight: day.pomodoroMinutes > 0 ? '8px' : '0'
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>Total: {totalPomodoroMinutes}min</span>
              <span>Media: {Math.round(totalPomodoroMinutes / 7)}min/dia</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tarefas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const count = category.tasks?.[0]?.count || 0
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} tarefas ({percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      style={{ 
                        ['--progress-background' as string]: category.color 
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood & Energy Trend */}
      {recentCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Humor e Energia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dailyStats.map((day, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-muted-foreground capitalize mb-2">
                    {day.label}
                  </div>
                  {day.mood !== undefined ? (
                    <div className="space-y-1">
                      <div 
                        className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: getMoodColor(day.mood),
                          color: 'white'
                        }}
                      >
                        {day.mood}
                      </div>
                      <div 
                        className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: getEnergyColor(day.energy || 3),
                          color: 'white'
                        }}
                      >
                        {day.energy}
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 mx-auto rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      -
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <Smile className="w-4 h-4" /> Humor
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> Energia
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getMoodColor(mood: number): string {
  if (mood <= 2) return '#ef4444'
  if (mood === 3) return '#a3a3a3'
  return '#10b981'
}

function getEnergyColor(energy: number): string {
  if (energy <= 2) return '#f97316'
  if (energy === 3) return '#a3a3a3'
  return '#0ea5e9'
}
