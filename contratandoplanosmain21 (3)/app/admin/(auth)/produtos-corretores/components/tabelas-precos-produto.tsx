"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Link, Trash2, Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  buscarTabelasPrecos,
  buscarTabelasPrecosPorProduto,
  vincularTabelaProduto,
  desvincularTabelaProduto,
} from "@/services/tabelas-service"
import type { TabelaPreco, TabelaProduto } from "@/types/tabelas"
import { toast } from "sonner"
import CriarTabelaModal from "./criar-tabela-modal"

interface TabelasPrecosProdutoProps {
  produtoId: string | number
  produtoNome: string
}

export default function TabelasPrecosProduto({ produtoId, produtoNome }: TabelasPrecosProdutoProps) {
  const [tabelasVinculadas, setTabelasVinculadas] = useState<TabelaProduto[]>([])
  const [todasTabelas, setTodasTabelas] = useState<TabelaPreco[]>([])
  const [tabelaSelecionada, setTabelaSelecionada] = useState<string>("")
  const [segmentacao, setSegmentacao] = useState<string>("Padrão")
  const [descricao, setDescricao] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isCriarTabelaModalOpen, setIsCriarTabelaModalOpen] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar tabelas vinculadas ao produto
  const carregarTabelasVinculadas = async () => {
    try {
      setIsLoading(true)
      const tabelas = await buscarTabelasPrecosPorProduto(produtoId)
      setTabelasVinculadas(tabelas)
      setError(null)
    } catch (error) {
      console.error("Erro ao carregar tabelas vinculadas:", error)
      setError("Não foi possível carregar as tabelas vinculadas a este produto.")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar todas as tabelas disponíveis
  const carregarTodasTabelas = async () => {
    try {
      setIsLoading(true)
      const tabelas = await buscarTabelasPrecos()
      setTodasTabelas(tabelas)
      if (tabelas.length > 0) {
        setTabelaSelecionada(tabelas[0].id.toString())
      }
      setError(null)
    } catch (error) {
      console.error("Erro ao carregar tabelas:", error)
      setError("Não foi possível carregar as tabelas de preços.")
    } finally {
      setIsLoading(false)
    }
  }

  // Vincular uma tabela ao produto
  const handleVincularTabela = async () => {
    if (!tabelaSelecionada || !segmentacao) {
      toast.error("Selecione uma tabela e informe a segmentação")
      return
    }

    try {
      setIsLoading(true)

      const resultado = await vincularTabelaProduto(produtoId, tabelaSelecionada, segmentacao, descricao)

      toast.success("Tabela vinculada com sucesso!")
      setIsDialogOpen(false)
      await carregarTabelasVinculadas()

      // Resetar os campos do formulário
      setSegmentacao("Padrão")
      setDescricao("")
    } catch (error) {
      console.error("Erro ao vincular tabela:", error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Desvincular uma tabela do produto
  const handleDesvincularTabela = async (relacaoId: string | number) => {
    try {
      setIsLoading(true)
      await desvincularTabelaProduto(relacaoId)
      toast.success("Tabela desvinculada com sucesso!")
      await carregarTabelasVinculadas()
    } catch (error) {
      console.error("Erro ao desvincular tabela:", error)
      toast.error("Não foi possível desvincular a tabela do produto.")
    } finally {
      setIsLoading(false)
    }
  }

  // Lidar com a criação de uma nova tabela
  const handleNovaTabelaCriada = async (novaTabela: TabelaPreco) => {
    await carregarTodasTabelas()
    setTabelaSelecionada(novaTabela.id.toString())
    toast.success("Tabela criada e selecionada. Agora você pode vinculá-la ao produto.")
    setIsDialogOpen(true) // Abrir o modal de vinculação automaticamente
  }

  // Carregar dados iniciais
  useEffect(() => {
    carregarTabelasVinculadas()
    carregarTodasTabelas()
  }, [produtoId])

  // Função para abrir o modal de vinculação
  const abrirModalVinculacao = () => {
    setIsDialogOpen(true)
  }

  // Agrupar tabelas por segmentação para exibição
  const tabelasAgrupadasPorSegmentacao = tabelasVinculadas.reduce(
    (grupos, tabela) => {
      const grupo = grupos[tabela.segmentacao] || []
      grupo.push(tabela)
      grupos[tabela.segmentacao] = grupo
      return grupos
    },
    {} as Record<string, TabelaProduto[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tabelas de Preços - {produtoNome}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsCriarTabelaModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tabela
          </Button>
          <Button onClick={abrirModalVinculacao}>
            <Link className="mr-2 h-4 w-4" />
            Vincular Tabela
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && !error && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && tabelasVinculadas.length === 0 && !error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma tabela vinculada</AlertTitle>
          <AlertDescription>
            Este produto não possui tabelas de preços vinculadas. Clique em "Vincular Tabela" para adicionar uma tabela
            existente ou "Nova Tabela" para criar uma nova.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8">
          {Object.entries(tabelasAgrupadasPorSegmentacao).map(([segmentacao, tabelas]) => (
            <div key={segmentacao} className="space-y-4">
              <h3 className="text-xl font-semibold">Segmentação: {segmentacao}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabelas.map((tabela) => (
                  <Card key={tabela.relacao_id}>
                    <CardHeader>
                      <CardTitle>{tabela.tabela_titulo}</CardTitle>
                      {tabela.descricao && <CardDescription>{tabela.descricao}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Esta tabela será usada para calcular valores de propostas para a segmentação{" "}
                        {tabela.segmentacao}.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDesvincularTabela(tabela.relacao_id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Desvincular
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para vincular tabela */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Tabela de Preços</DialogTitle>
            <DialogDescription>
              Selecione uma tabela de preços para vincular ao produto {produtoNome}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tabela" className="text-right">
                Tabela
              </Label>
              <div className="col-span-3">
                {todasTabelas.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">Nenhuma tabela disponível.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setIsCriarTabelaModalOpen(true)
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Criar Tabela
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={tabelaSelecionada}
                    onValueChange={setTabelaSelecionada}
                    disabled={isLoading || todasTabelas.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tabela" />
                    </SelectTrigger>
                    <SelectContent>
                      {todasTabelas.map((tabela) => (
                        <SelectItem key={tabela.id} value={tabela.id.toString()}>
                          {tabela.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="segmentacao" className="text-right">
                Segmentação
              </Label>
              <Input
                id="segmentacao"
                value={segmentacao}
                onChange={(e) => setSegmentacao(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Individual, Familiar, Empresarial"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Tabela 2024, Tabela Promocional, etc."
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleVincularTabela}
              disabled={isLoading || !tabelaSelecionada || !segmentacao || todasTabelas.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                "Vincular Tabela"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para criar nova tabela */}
      <CriarTabelaModal
        isOpen={isCriarTabelaModalOpen}
        onClose={() => setIsCriarTabelaModalOpen(false)}
        onSuccess={handleNovaTabelaCriada}
      />
    </div>
  )
}
