"use client"

import type React from "react"

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

interface Props {
  params: {
    id: string
  }
}

interface Proposta {
  id: string
  nome_cliente?: string
  nome?: string
  email: string
  telefone?: string
  status: string
  produto_nome?: string
  produto_descricao?: string
  valor_total?: number
  valor?: number
  origem?: string
  corretor_email?: string
  corretor_nome?: string
  created_at: string
}

// Componente de formulário inline (substituindo o import que não existe)
function PropostaForm({
  initialData,
  onFinish,
}: {
  initialData: Proposta
  onFinish: (data: any) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [assinatura, setAssinatura] = useState("")
  const [termos, setTermos] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termos) {
      toast.error("Você deve aceitar os termos e condições")
      return
    }

    if (!assinatura.trim()) {
      toast.error("A assinatura é obrigatória")
      return
    }

    setLoading(true)
    try {
      await onFinish({
        assinatura,
        termos_aceitos: true,
        data_assinatura: new Date().toISOString(),
      })
      toast.success("Proposta assinada com sucesso!")
    } catch (error) {
      console.error("Erro ao finalizar proposta:", error)
      toast.error("Erro ao finalizar proposta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Finalizar Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo da Proposta */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resumo da Proposta</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Cliente:</span>
                <span>{initialData.nome_cliente || initialData.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{initialData.email}</span>
              </div>
              {initialData.telefone && (
                <div className="flex justify-between">
                  <span className="font-medium">Telefone:</span>
                  <span>{initialData.telefone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Plano:</span>
                <span>{initialData.produto_nome}</span>
              </div>
              {initialData.produto_descricao && (
                <div className="flex justify-between">
                  <span className="font-medium">Descrição:</span>
                  <span className="text-sm text-gray-600">{initialData.produto_descricao}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Valor Total:</span>
                <span className="text-blue-600">
                  R$ {(initialData.valor_total || initialData.valor || 0).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>

          {/* Formulário de Assinatura */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assinatura Digital *</label>
              <input
                type="text"
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Digite seu nome completo como assinatura"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ao digitar seu nome, você está assinando digitalmente este documento
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="termos"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="termos" className="text-sm text-gray-700">
                Eu li e aceito os{" "}
                <a href="/termos" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">
                  termos e condições
                </a>{" "}
                e confirmo que todas as informações fornecidas são verdadeiras.
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={loading || !termos || !assinatura.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Finalizando...
                  </>
                ) : (
                  "Assinar e Finalizar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const PropostaPage = ({ params }: Props) => {
  const { id } = params
  const [proposta, setProposta] = useState<Proposta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      redirect("/proposta-digital")
      return
    }

    carregarProposta()
  }, [id])

  const carregarProposta = async () => {
    try {
      const supabase = createClient()

      // Buscar proposta no banco
      const { data, error } = await supabase.from("propostas").select("*").eq("id", id).single()

      if (error || !data) {
        console.error("Erro ao buscar proposta:", error)
        toast.error("Proposta não encontrada")
        redirect("/proposta-digital")
        return
      }

      setProposta(data)
    } catch (error) {
      console.error("Erro ao carregar proposta:", error)
      toast.error("Erro ao carregar proposta")
      redirect("/proposta-digital")
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (data: any) => {
    if (!proposta) return

    try {
      const supabase = createClient()

      // Atualizar proposta com dados da assinatura
      const { error } = await supabase
        .from("propostas")
        .update({
          ...data,
          status: "ASSINADO",
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposta.id)

      if (error) {
        throw error
      }

      // Após salvar a assinatura com sucesso
      try {
        // Se for proposta de corretor, notificar o corretor
        if (proposta.origem === "propostas_corretores" && proposta.corretor_email) {
          const { enviarEmailPropostaAssinada } = await import("@/services/email-service")

          await enviarEmailPropostaAssinada(
            proposta.corretor_email,
            proposta.corretor_nome || "Corretor",
            proposta.nome_cliente || proposta.nome || "",
            proposta.id,
            proposta.valor_total || proposta.valor || 0,
          )
          console.log("✅ Corretor notificado sobre assinatura")
        }
      } catch (emailError) {
        console.warn("⚠️ Erro ao notificar corretor:", emailError)
        // Não falhar o processo por causa do email
      }

      // Redirecionar para página de sucesso
      redirect("/proposta-digital/sucesso")
    } catch (error) {
      console.error("Erro ao finalizar proposta:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (!proposta) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Proposta não encontrada</h1>
          <Button onClick={() => redirect("/proposta-digital")} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <PropostaForm initialData={proposta} onFinish={onFinish} />
    </div>
  )
}

export default PropostaPage
