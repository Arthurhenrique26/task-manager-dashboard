import React from "react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckSquare, ListTodo, Timer, Calendar, Sparkles, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Comecar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Organize suas tarefas com
            <span className="text-primary"> produtividade</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            TaskFlow e o gerenciador de tarefas completo que ajuda voce a manter o foco, 
            aumentar a produtividade e celebrar cada conquista.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Comecar agora
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">
                Ja tenho conta
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="bg-card border-y border-border py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-card-foreground mb-12">
              Tudo que voce precisa para ser produtivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<ListTodo className="w-8 h-8" />}
                title="Gestao de Tarefas"
                description="Crie, organize e priorize suas tarefas com facilidade. Adicione subtarefas, tags e categorias."
              />
              <FeatureCard
                icon={<Calendar className="w-8 h-8" />}
                title="Multiplas Visualizacoes"
                description="Visualize suas tarefas em lista, kanban ou calendario. Escolha o que funciona melhor para voce."
              />
              <FeatureCard
                icon={<Timer className="w-8 h-8" />}
                title="Timer Pomodoro"
                description="Mantenha o foco com o timer Pomodoro integrado. Controle o tempo dedicado a cada tarefa."
              />
              <FeatureCard
                icon={<Sparkles className="w-8 h-8" />}
                title="Celebracoes"
                description="Celebre suas conquistas com feedback visual. Cada tarefa concluida e uma vitoria."
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Metricas de Produtividade"
                description="Acompanhe seu progresso com relatorios e metricas detalhadas sobre sua produtividade."
              />
              <FeatureCard
                icon={<CheckSquare className="w-8 h-8" />}
                title="Check-in Emocional"
                description="Registre como voce esta se sentindo e ajuste sua carga diaria de acordo."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para ser mais produtivo?
          </h2>
          <p className="text-muted-foreground mb-8">
            Comece gratuitamente e transforme sua maneira de trabalhar.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Criar conta gratuita
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>TaskFlow - Organize suas tarefas com produtividade</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
      <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
