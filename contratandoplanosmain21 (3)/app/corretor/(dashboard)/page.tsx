"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, Users } from "lucide-react"

interface DashboardStats {
  propostasEnviadas: number
  propostasAprovadas: number
  comissoesPendentes: number
  clientesAtivos: number
}

export default function CorretorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    propostasEnviadas: 6,
    propostasAprovadas: 0,
    comissoesPendentes: 0,
    clientesAtivos: 0,
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Simulando carregamento de dados
    const carregarDados = async () => {
      try {
        // Em uma implementação real, esses dados viriam de uma API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          propostasEnviadas: 6,
          propostasAprovadas: 8,
          comissoesPendentes: 1450.25,
          clientesAtivos: 8,
        })
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.propostasEnviadas}</div>
              <p className="text-xs text-gray-500">Propostas enviadas no total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Propostas Aprovadas</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.propostasAprovadas}</div>
              <p className="text-xs text-gray-500">Propostas aprovadas no total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.comissoesPendentes.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Comissões a receber</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clientesAtivos}</div>
              <p className="text-xs text-gray-500">Total de clientes ativos</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Propostas</CardTitle>
            <CardDescription>Propostas enviadas recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between py-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : stats.propostasEnviadas > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>João Silva</span>
                  <span className="text-[#168979]">Amil 400</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Maria Oliveira</span>
                  <span className="text-[#168979]">SulAmérica Prestige</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Carlos Santos</span>
                  <span className="text-[#168979]">Bradesco Saúde Top</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma proposta enviada ainda</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissões Recentes</CardTitle>
            <CardDescription>Últimas comissões recebidas</CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between py-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : stats.propostasAprovadas > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Amil 400 - João Silva</span>
                  <span className="text-green-600">R$ 450,00</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>SulAmérica - Maria Oliveira</span>
                  <span className="text-green-600">R$ 380,25</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Bradesco - Carlos Santos</span>
                  <span className="text-green-600">R$ 520,50</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma comissão recebida ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
