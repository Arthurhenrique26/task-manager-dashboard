'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Smile, Meh, Frown, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const moodOptions = [
  { value: 1, icon: Frown, label: 'Muito mal', color: 'text-destructive' },
  { value: 2, icon: Frown, label: 'Mal', color: 'text-orange-500' },
  { value: 3, icon: Meh, label: 'Neutro', color: 'text-muted-foreground' },
  { value: 4, icon: Smile, label: 'Bem', color: 'text-primary' },
  { value: 5, icon: Smile, label: 'Muito bem', color: 'text-accent' },
]

const energyOptions = [
  { value: 1, icon: BatteryLow, label: 'Muito baixa', color: 'text-destructive' },
  { value: 2, icon: BatteryLow, label: 'Baixa', color: 'text-orange-500' },
  { value: 3, icon: BatteryMedium, label: 'Media', color: 'text-muted-foreground' },
  { value: 4, icon: BatteryFull, label: 'Alta', color: 'text-primary' },
  { value: 5, icon: Zap, label: 'Muito alta', color: 'text-accent' },
]

export function EmotionalCheckinPrompt() {
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [isDismissed, setIsDismissed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  if (isDismissed) return null

  function handleSubmit() {
    if (!mood || !energy) {
      toast.error('Selecione seu humor e nivel de energia')
      return
    }

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuario nao autenticado')
        return
      }

      const { error } = await supabase
        .from('emotional_checkins')
        .insert({
          user_id: user.id,
          mood,
          energy,
          note: note.trim() || null,
        })

      if (error) {
        toast.error('Erro ao salvar check-in')
        return
      }

      toast.success('Check-in realizado!', {
        description: getEncouragementMessage(mood, energy),
      })
      
      router.refresh()
    })
  }

  function getEncouragementMessage(mood: number, energy: number): string {
    if (mood <= 2 || energy <= 2) {
      return 'Foque em tarefas pequenas hoje. Voce consegue!'
    }
    if (mood >= 4 && energy >= 4) {
      return 'Otimo dia para grandes conquistas!'
    }
    return 'Um passo de cada vez. Voce esta indo bem!'
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Como voce esta hoje?</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Humor</p>
          <div className="flex gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={mood === option.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'flex-1 flex-col h-auto py-2',
                  mood === option.value && 'ring-2 ring-primary'
                )}
                onClick={() => setMood(option.value)}
              >
                <option.icon className={cn('h-5 w-5', mood !== option.value && option.color)} />
                <span className="text-xs mt-1">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Energy Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Energia</p>
          <div className="flex gap-2">
            {energyOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={energy === option.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'flex-1 flex-col h-auto py-2',
                  energy === option.value && 'ring-2 ring-primary'
                )}
                onClick={() => setEnergy(option.value)}
              >
                <option.icon className={cn('h-5 w-5', energy !== option.value && option.color)} />
                <span className="text-xs mt-1">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Nota (opcional)</p>
          <Textarea
            placeholder="Como voce esta se sentindo?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!mood || !energy || isPending}
          className="w-full"
        >
          Salvar check-in
        </Button>
      </CardContent>
    </Card>
  )
}
