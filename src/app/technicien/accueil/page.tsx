'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { StatusDot } from '@/components/ui/status-dot'
import LayoutDashboardSidebar from '@/components/LayoutDashboardSidebar'
import { Tabs } from '@/components/ui/tabs'
import StatsTechnicien from '@/components/StatsTechnicien'
import type { Intervention } from '../../types'

const STATUS_LABELS = {
  accepte: { label: 'Acceptée', variant: 'success' },
  refuse: { label: 'Refusée', variant: 'danger' },
  en_attente: { label: 'En attente', variant: 'warning' },
} as const

export default function TechnicienAccueil() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Aujourd’hui')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Erreur d’authentification.")
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error: dataError } = await supabase
        .from('interventions')
        .select('*, clients (nom)')
        .eq('technicien_id', user.id)
        .order('date_intervention', { ascending: true })

      if (dataError || !data) {
        setError('Erreur de chargement des interventions.')
      } else {
        setInterventions(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleValidation = async (id: string, action: 'accepte' | 'refuse') => {
    await supabase
      .from('interventions')
      .update({ validation_technicien: action })
      .eq('id', id)

    const { data } = await supabase
      .from('interventions')
      .select('*, clients (nom)')
      .eq('technicien_id', userId)
      .order('date_intervention', { ascending: true })

    setInterventions(data || [])
  }

  const today = new Date().toISOString().split('T')[0]

  const filteredInterventions = interventions.filter((intervention) => {
    const isTerminee = intervention.statut?.toLowerCase() === 'terminee'
    const isRefusee = intervention.validation_technicien === 'refuse'

    const matchFilter =
      (filter === 'Aujourd’hui' &&
        intervention.date_intervention === today &&
        !isTerminee &&
        !isRefusee) ||
      (filter === 'À venir' &&
        intervention.date_intervention > today &&
        !isRefusee) ||
      (filter === 'Terminées' &&
        isTerminee &&
        !isRefusee) ||
      (filter === 'En attente' &&
        intervention.validation_technicien === 'en_attente') ||
      (filter === 'Refusées' &&
        intervention.validation_technicien === 'refuse')

    const matchSearch =
      search.trim() === '' ||
      intervention.clients?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      intervention.motif?.toLowerCase().includes(search.toLowerCase()) ||
      intervention.date_intervention.includes(search)

    return matchFilter && matchSearch
  })

  return (
    <LayoutDashboardSidebar>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">👨‍🔧 Tableau de bord technicien</h1>

        <StatsTechnicien interventions={interventions} />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-6 mb-4">
          <Tabs
            tabs={['Aujourd’hui', 'À venir', 'Terminées', 'En attente', 'Refusées']}
            active={filter}
            onTabChange={setFilter}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Rechercher..."
            className="border px-3 py-2 rounded-md text-sm w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-red-600 font-semibold">❌ {error}</p>
        ) : filteredInterventions.length === 0 ? (
          <p className="text-muted-foreground mt-6">Aucune intervention à afficher.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredInterventions.map((intervention) => {
              const status =
                STATUS_LABELS[intervention.validation_technicien ?? 'en_attente']
              const isTerminee = intervention.statut?.toLowerCase() === 'terminee'

              return (
                <Card key={intervention.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Intervention chez {intervention.clients?.nom ?? 'Client inconnu'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 sm:p-6">
                    <p><strong>Date :</strong> {intervention.date_intervention}</p>
                    <p><strong>Heure :</strong> {intervention.heure_debut} ➔ {intervention.heure_fin}</p>
                    <p><strong>Motif :</strong> {intervention.motif ?? 'Non précisé'}</p>

                    <div className="flex items-center gap-2">
                      <StatusDot
                        status={
                          (intervention.validation_technicien ?? 'en_attente') as
                            | 'accepte'
                            | 'refuse'
                            | 'en_attente'
                        }
                      />
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    {intervention.validation_technicien === 'accepte' &&
                      !isTerminee &&
                      intervention.id && (
                        <Button
                          onClick={() =>
                            router.push(`/technicien/intervention/${intervention.id}`)
                          }
                          className="w-full mt-4"
                        >
                          Démarrer l’intervention →
                        </Button>
                      )}

                    {intervention.validation_technicien === 'en_attente' && intervention.id && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          onClick={() => handleValidation(intervention.id, 'accepte')}
                          className="w-full"
                        >
                          ✅ Accepter
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleValidation(intervention.id, 'refuse')}
                          className="w-full"
                        >
                          ❌ Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </LayoutDashboardSidebar>
  )
}
