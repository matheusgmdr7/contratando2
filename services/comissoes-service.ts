import { supabase } from "@/lib/supabase"
import type { Comissao, ResumoComissoes } from "@/types/corretores"

/**
 * Busca todas as comissões de um corretor específico
 * @param corretorId ID do corretor
 * @returns Array de comissões do corretor
 */
export async function buscarComissoesPorCorretor(corretorId: string): Promise<Comissao[]> {
  try {
    // Verificar se estamos em ambiente de desenvolvimento com corretor fictício
    if (
      corretorId === "dev-123" &&
      (process.env.NODE_ENV === "development" || window.location.hostname === "localhost")
    ) {
      console.log("Usando dados fictícios para comissões do corretor")

      // Retornar dados fictícios para desenvolvimento
      return gerarComissoesFicticias()
    }

    // Buscar comissões do corretor no banco de dados
    const { data, error } = await supabase
      .from("comissoes")
      .select(`
        *,
        corretores (*),
        propostas_corretores (*)
      `)
      .eq("corretor_id", corretorId)
      .order("data", { ascending: false })

    if (error) {
      console.error("Erro ao buscar comissões do corretor:", error)
      throw new Error(`Erro ao buscar comissões: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar comissões do corretor:", error)

    // Em ambiente de desenvolvimento, retornar dados fictícios em caso de erro
    if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
      console.log("Usando dados fictícios como fallback para comissões")
      return gerarComissoesFicticias()
    }

    throw error
  }
}

/**
 * Gera comissões fictícias para desenvolvimento
 * @returns Array de comissões fictícias
 */
function gerarComissoesFicticias(): Comissao[] {
  const statusOptions = ["pendente", "pago"]
  const descricoes = [
    "Comissão Plano de Saúde Individual",
    "Comissão Plano Familiar",
    "Comissão Plano Empresarial",
    "Comissão Plano Odontológico",
  ]

  return Array.from({ length: 20 }, (_, i) => ({
    id: `com-${i}`,
    corretor_id: "dev-123",
    proposta_id: `prop-${i}`,
    valor: Math.floor(100 + Math.random() * 500),
    percentual: `${Math.floor(5 + Math.random() * 15)}%`,
    data: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    status: statusOptions[i % statusOptions.length],
    data_pagamento:
      statusOptions[i % statusOptions.length] === "pago"
        ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    descricao: descricoes[i % descricoes.length],
    data_prevista: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

/**
 * Calcula o resumo das comissões de um corretor
 * @param comissoes Array de comissões do corretor
 * @returns Resumo das comissões
 */
export function calcularResumoComissoes(comissoes: Comissao[]): ResumoComissoes {
  const resumo: ResumoComissoes = {
    totalPendente: 0,
    totalPago: 0,
    porMes: {},
  }

  comissoes.forEach((comissao) => {
    const valor = Number(comissao.valor) || 0

    // Calcular totais por status
    if (comissao.status === "pendente") {
      resumo.totalPendente += valor
    } else if (comissao.status === "pago") {
      resumo.totalPago += valor
    }

    // Calcular totais por mês
    const data = new Date(comissao.data || comissao.created_at)
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`

    if (!resumo.porMes[mesAno]) {
      resumo.porMes[mesAno] = 0
    }

    resumo.porMes[mesAno] += valor
  })

  return resumo
}

/**
 * Busca uma comissão específica pelo ID
 * @param comissaoId ID da comissão
 * @returns Dados da comissão ou null se não encontrada
 */
export async function buscarComissaoPorId(comissaoId: string): Promise<Comissao | null> {
  try {
    // Verificar se estamos em ambiente de desenvolvimento com ID fictício
    if (
      comissaoId.startsWith("com-") &&
      (process.env.NODE_ENV === "development" || window.location.hostname === "localhost")
    ) {
      console.log("Usando dados fictícios para comissão específica")

      // Retornar uma comissão fictícia específica
      const index = Number.parseInt(comissaoId.replace("com-", ""))
      const comissoes = gerarComissoesFicticias()
      return comissoes[index % comissoes.length] || null
    }

    const { data, error } = await supabase
      .from("comissoes")
      .select(`
        *,
        corretores (*),
        propostas_corretores (*)
      `)
      .eq("id", comissaoId)
      .single()

    if (error) {
      console.error("Erro ao buscar comissão por ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar comissão por ID:", error)
    return null
  }
}

/**
 * Atualiza o status de uma comissão
 * @param comissaoId ID da comissão
 * @param status Novo status da comissão
 * @param dataPagamento Data de pagamento (opcional, apenas para status "pago")
 * @returns Dados da comissão atualizada
 */
export async function atualizarStatusComissao(
  comissaoId: string,
  status: string,
  dataPagamento?: string,
): Promise<Comissao | null> {
  try {
    const atualizacao: any = { status }

    if (status === "pago" && dataPagamento) {
      atualizacao.data_pagamento = dataPagamento
    }

    const { data, error } = await supabase.from("comissoes").update(atualizacao).eq("id", comissaoId).select().single()

    if (error) {
      console.error("Erro ao atualizar status da comissão:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao atualizar status da comissão:", error)
    return null
  }
}
