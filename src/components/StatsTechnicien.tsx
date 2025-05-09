'use client'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Intervention } from '../app/types'

interface StatsTechnicienProps {
  interventions: Intervention[]
}

export default function StatsTechnicien({ interventions }: StatsTechnicienProps) {
  if (!interventions) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  // ❌ Exclure les interventions refusées
  const validInterventions = interventions.filter(
    (i) => i.validation_technicien !== 'refuse'
  )

  // ✅ Exclure les refusées du total
  const total = validInterventions.length

  // ✅ Aujourd'hui (hors refusées)
  const todayCount = validInterventions.filter(
    (i) =>
      i.date_intervention === today &&
      i.statut?.toLowerCase() !== 'terminee'
  ).length
  

  // ✅ À venir (hors refusées)
  const upcoming = validInterventions.filter(
    (i) => i.date_intervention > today
  ).length

  // ✅ Terminées (hors refusées)
  const done = validInterventions.filter(
    (i) => i.statut?.toLowerCase() === 'terminee'
  ).length

  // ✅ Productivité sur base des interventions acceptées ou en cours/terminées
  const productivity = total > 0 ? Math.round((done / total) * 100) : 0

  const stats = [
    { title: 'Aujourd’hui', value: todayCount },
    { title: 'À venir', value: upcoming },
    { title: 'Terminées', value: done },
    {
      title: 'Productivité',
      value: `${productivity}%`,
      color:
        productivity >= 75
          ? 'text-green-600'
          : productivity >= 40
          ? 'text-yellow-600'
          : 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <Card key={i} className="text-center shadow-sm">
          <CardContent className="py-4 space-y-1">
            <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
            <p className={`text-2xl font-bold ${stat.color ?? ''}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
