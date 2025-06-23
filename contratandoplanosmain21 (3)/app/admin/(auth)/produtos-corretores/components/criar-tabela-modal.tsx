"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { criarTabelaPreco, adicionarFaixaEtaria } from "@/services/tabelas-service"
import type { TabelaPreco } from "@/types/tabelas"

interface CriarTabelaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tabela: TabelaPreco) => void
}

export default function CriarTabelaModal({ isOpen, onClose, onSuccess }: CriarTabelaModalProps) {
  const [activeTab, setActiveTab] = useState("informacoes")
  const [isLoading, setIsLoading] = useState(false)
  const [tabela, setTabela] = useState<Omit<TabelaPreco, "id" | "created_at">>({
    titulo: "",
    descricao: "",
    operadora: "",
    tipo_plano: "",
    ativo: true,
    updated_at: new Date().toISOString(),
  })
  const [faixas, setFaixas] = useState<Array<{ faixa_etaria: string; valor: number }>>([
    { faixa_etaria: "0-18", valor: 0 },
    { faixa_etaria: "19-23", valor: 0 },
    { faixa_etaria: "24-28", valor: 0 },
    { faixa_etaria: "29-33", valor: 0 },
    { faixa_etaria: "34-38", valor: 0 },
    { faixa_etaria: "39-43", valor: 0 },
    { faixa_etaria: "44-48", valor: 0 },
    { faixa_etaria: "49-53", valor: 0 },
    { faixa_etaria: "54-58", valor: 0 },
    { faixa_etaria: "59+", valor: 0 },
  ])

  const handleChange = (field: keyof typeof tabela, value: any) => {
    setTabela((prev) => ({ ...prev, [field]: value }))
  }

  const handleFaixaChange = (index: number, field: keyof (typeof faixas)[0], value: any) => {
    const novasFaixas = [...faixas]
    novasFaixas[index][field] = value
    setFaixas(novasFaixas)
  }

  const adicionarFaixa = () => {
    setFaixas([...faixas, { faixa_etaria: "", valor: 0 }])
  }

  const removerFaixa = (index: number) => {
    const novasFaixas = [...faixas]
    novasFaixas.splice(index, 1)
    setFaixas(novasFaixas)
  }

  const handleSubmit = async () => {
    // Validação básica
    if (!tabela.titulo) {
      toast.error("O título da tabela é obrigatório")
      return
    }

    if (faixas.length === 0) {
      toast.error("Adicione pelo menos uma faixa etária")
      return
    }

    for (const faixa of faixas) {
      if (!faixa.faixa_etaria) {
        toast.error("Todas as faixas etárias devem ter um valor")
        return
      }
    }

    try {
      setIsLoading(true)

      // Criar a tabela
      const novaTabelaResponse = await criarTabelaPreco(tabela)

      // Adicionar as faixas etárias
      for (const faixa of faixas) {
        await adicionarFaixaEtaria({
          tabela_id: novaTabelaResponse.id,
          faixa_etaria: faixa.faixa_etaria,
          valor: faixa.valor,
        })
      }

      toast.success("Tabela de preços criada com sucesso!")
      onSuccess(novaTabelaResponse)
      resetForm()
      onClose()
    } catch (error) {
      console.error("Erro ao criar tabela:", error)
      toast.error(`Erro ao criar tabela: ${error.message || "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTabela({
      titulo: "",
      descricao: "",
      operadora: "",
      tipo_plano: "",
      ativo: true,
      updated_at: new Date().toISOString(),
    })
    setFaixas([
      { faixa_etaria: "0-18", valor: 0 },
      { faixa_etaria: "19-23", valor: 0 },
      { faixa_etaria: "24-28", valor: 0 },
      { faixa_etaria: "29-33", valor: 0 },
      { faixa_etaria: "34-38", valor: 0 },
      { faixa_etaria: "39-43", valor: 0 },
      { faixa_etaria: "44-48", valor: 0 },
      { faixa_etaria: "49-53", valor: 0 },
      { faixa_etaria: "54-58", valor: 0 },
      { faixa_etaria: "59+", valor: 0 },
    ])
    setActiveTab("informacoes")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Tabela de Preços</DialogTitle>
          <DialogDescription>Preencha as informações abaixo para criar uma nova tabela de preços.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
            <TabsTrigger value="faixas">Faixas Etárias</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Tabela *</Label>
                <Input
                  id="titulo"
                  value={tabela.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  disabled={isLoading}
                  placeholder="Ex: Tabela Amil 2023"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operadora">Operadora</Label>
                <Input
                  id="operadora"
                  value={tabela.operadora}
                  onChange={(e) => handleChange("operadora", e.target.value)}
                  disabled={isLoading}
                  placeholder="Ex: Amil, Unimed, SulAmérica"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_plano">Tipo de Plano</Label>
                <Input
                  id="tipo_plano"
                  value={tabela.tipo_plano}
                  onChange={(e) => handleChange("tipo_plano", e.target.value)}
                  disabled={isLoading}
                  placeholder="Ex: Individual, Empresarial"
                />
              </div>
              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="ativo"
                    checked={tabela.ativo}
                    onCheckedChange={(checked) => handleChange("ativo", checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="ativo">Tabela ativa</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={tabela.descricao || ""}
                onChange={(e) => handleChange("descricao", e.target.value)}
                disabled={isLoading}
                placeholder="Descrição opcional da tabela de preços"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("faixas")} disabled={isLoading}>
                Próximo: Faixas Etárias
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="faixas" className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Faixas Etárias e Valores</h3>
              <Button variant="outline" size="sm" onClick={adicionarFaixa} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Faixa
              </Button>
            </div>

            <div className="space-y-2">
              {faixas.map((faixa, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={faixa.faixa_etaria}
                      onChange={(e) => handleFaixaChange(index, "faixa_etaria", e.target.value)}
                      disabled={isLoading}
                      placeholder="Ex: 0-18, 19-23, 59+"
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      type="number"
                      value={faixa.valor}
                      onChange={(e) => handleFaixaChange(index, "valor", Number.parseFloat(e.target.value) || 0)}
                      disabled={isLoading}
                      placeholder="Valor R$"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerFaixa(index)}
                      disabled={isLoading || faixas.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Tabela"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
