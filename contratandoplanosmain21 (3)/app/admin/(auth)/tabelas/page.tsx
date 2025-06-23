"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Edit, Plus, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { buscarTabelasPrecos } from "@/services/tabelas-service"
import type { TabelaPreco } from "@/types/tabelas"
import CriarTabelaModal from "../produtos-corretores/components/criar-tabela-modal"

export default function TabelasPage() {
  const router = useRouter()
  const [tabelas, setTabelas] = useState<TabelaPreco[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isCriarTabelaModalOpen, setIsCriarTabelaModalOpen] = useState<boolean>(false)

  // Carregar tabelas
  const carregarTabelas = async () => {
    try {
      setIsLoading(true)
      const data = await buscarTabelasPrecos()
      setTabelas(data)
      setError(null)
    } catch (error) {
      console.error("Erro ao carregar tabelas:", error)
      setError(`Não foi possível carregar as tabelas: ${error.message || "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Lidar com a criação de uma nova tabela
  const handleNovaTabelaCriada = async (novaTabela: TabelaPreco) => {
    await carregarTabelas()
    toast.success("Tabela criada com sucesso!")
  }

  // Editar tabela
  const handleEditarTabela = (id: string | number) => {
    router.push(`/admin/tabelas/${id}`)
  }

  // Visualizar tabela
  const handleVisualizarTabela = (id: string | number) => {
    router.push(`/admin/tabelas/${id}/visualizar`)
  }

  // Carregar dados iniciais
  useEffect(() => {
    carregarTabelas()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tabelas de Preços</h1>
        <Button onClick={() => setIsCriarTabelaModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tabela
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tabelas</CardTitle>
          <CardDescription>Gerencie as tabelas de preços disponíveis para os produtos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && tabelas.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : tabelas.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nenhuma tabela encontrada</AlertTitle>
              <AlertDescription>Não há tabelas cadastradas. Clique em "Nova Tabela" para adicionar.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabelas.map((tabela) => (
                  <TableRow key={tabela.id}>
                    <TableCell className="font-medium">{tabela.titulo}</TableCell>
                    <TableCell>{tabela.descricao || "-"}</TableCell>
                    <TableCell>
                      {tabela.ativo ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                          Inativa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {tabela.updated_at ? new Date(tabela.updated_at).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleVisualizarTabela(tabela.id)}
                          title="Visualizar tabela"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditarTabela(tabela.id)}
                          title="Editar tabela"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para criar nova tabela */}
      <CriarTabelaModal
        isOpen={isCriarTabelaModalOpen}
        onClose={() => setIsCriarTabelaModalOpen(false)}
        onSuccess={handleNovaTabelaCriada}
      />
    </div>
  )
}
