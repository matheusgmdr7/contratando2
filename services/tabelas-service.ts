import { supabaseClient } from "@/lib/supabase-client"
import type { TabelaPreco, TabelaPrecoFaixa, TabelaPrecoDetalhada } from "@/types/tabelas"
import { supabase } from "@/lib/supabase"

/**
 * Busca todas as tabelas de preços
 */
export async function buscarTabelasPrecos(): Promise<TabelaPreco[]> {
  try {
    const { data, error } = await supabaseClient.from("tabelas_precos").select("*").order("titulo", { ascending: true })

    if (error) {
      console.error("Erro ao buscar tabelas de preços:", error)
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar tabelas de preços:", error)
    throw error
  }
}

/**
 * Busca uma tabela de preços específica com suas faixas etárias
 * Suporta tanto IDs UUID quanto índices numéricos
 */
export async function buscarTabelaPrecoDetalhada(id: string | number): Promise<TabelaPrecoDetalhada> {
  try {
    let tabela
    let tabelaError

    // Primeiro, tenta buscar diretamente pelo ID (caso seja um UUID válido)
    try {
      const result = await supabaseClient.from("tabelas_precos").select("*").eq("id", id).single()

      tabela = result.data
      tabelaError = result.error
    } catch (error) {
      console.log("Erro na primeira tentativa:", error)
      tabelaError = error
    }

    // Se falhar e o ID for numérico, busca todas as tabelas e encontra pelo índice
    if (tabelaError && !isNaN(Number(id))) {
      console.log("Tentando buscar tabela pelo índice numérico:", id)

      // Buscar todas as tabelas
      const { data: todasTabelas, error: errorTodasTabelas } = await supabaseClient
        .from("tabelas_precos")
        .select("*")
        .order("created_at", { ascending: true })

      if (errorTodasTabelas) {
        console.error("Erro ao buscar todas as tabelas:", errorTodasTabelas)
        throw new Error(errorTodasTabelas.message)
      }

      // Encontrar a tabela pelo índice (posição no array + 1)
      const indice = Number(id) - 1
      if (todasTabelas && indice >= 0 && indice < todasTabelas.length) {
        tabela = todasTabelas[indice]
        console.log("Tabela encontrada pelo índice:", tabela)
      } else {
        throw new Error(`Tabela com índice ${id} não encontrada`)
      }
    }

    if (!tabela) {
      throw new Error(`Tabela com ID ${id} não encontrada`)
    }

    // Buscar faixas etárias da tabela
    const { data: faixas, error: faixasError } = await supabaseClient
      .from("tabelas_precos_faixas")
      .select("*")
      .eq("tabela_id", tabela.id)
      .order("faixa_etaria", { ascending: true })

    if (faixasError) {
      console.error(`Erro ao buscar faixas etárias da tabela ${id}:`, faixasError)
      throw new Error(faixasError.message)
    }

    return {
      tabela,
      faixas: faixas || [],
    }
  } catch (error) {
    console.error(`Erro ao buscar tabela detalhada ${id}:`, error)
    throw error
  }
}

// Corrigir a função buscarTabelasPrecosPorProduto para usar o nome correto da tabela:

export async function buscarTabelasPrecosPorProduto(produtoId: string) {
  try {
    // Buscar as relações entre produtos e tabelas
    // Corrigindo o nome da tabela para "produto_tabela_relacao" (singular)
    const { data: relacoes, error: relacoesError } = await supabase
      .from("produto_tabela_relacao")
      .select(`
        id,
        segmentacao,
        descricao,
        tabela_id,
        tabelas_precos (
          titulo
        )
      `)
      .eq("produto_id", produtoId)
      .order("segmentacao", { ascending: true })

    if (relacoesError) {
      console.error(`Erro ao buscar relações para o produto ${produtoId}:`, relacoesError)
      throw relacoesError
    }

    if (!relacoes || relacoes.length === 0) {
      return []
    }

    // Formatar os dados para retorno
    return relacoes.map((relacao) => ({
      relacao_id: relacao.id,
      tabela_id: relacao.tabela_id,
      tabela_titulo: relacao.tabelas_precos?.titulo || "Tabela sem título",
      segmentacao: relacao.segmentacao || "Padrão",
      descricao: relacao.descricao || "",
    }))
  } catch (error) {
    console.error("Erro ao buscar tabelas de preços por produto:", error)
    throw error
  }
}

/**
 * Vincula uma tabela de preços a um produto
 */
export async function vincularTabelaProduto(
  produtoId: string | number,
  tabelaId: string | number,
  segmentacao: string,
  descricao = "",
): Promise<{ id: string | number }> {
  try {
    console.log("Vinculando tabela:", { produtoId, tabelaId, segmentacao, descricao })

    // Inserir nova relação
    const { data, error } = await supabaseClient
      .from("produto_tabela_relacao")
      .insert({
        produto_id: produtoId,
        tabela_id: tabelaId,
        segmentacao,
        descricao,
      })
      .select("id")
      .single()

    if (error) {
      console.error(`Erro ao vincular tabela ${tabelaId} ao produto ${produtoId}:`, error)
      throw new Error(error.message)
    }

    return { id: data.id }
  } catch (error) {
    console.error(`Erro ao vincular tabela ${tabelaId} ao produto ${produtoId}:`, error)
    throw error
  }
}

/**
 * Desvincula uma tabela de um produto
 */
export async function desvincularTabelaProduto(relacaoId: string | number): Promise<void> {
  try {
    // Excluir a relação
    const { error } = await supabaseClient.from("produto_tabela_relacao").delete().eq("id", relacaoId)

    if (error) {
      console.error(`Erro ao desvincular tabela ${relacaoId}:`, error)
      throw new Error(error.message)
    }
  } catch (error) {
    console.error(`Erro ao desvincular tabela ${relacaoId}:`, error)
    throw error
  }
}

/**
 * Cria uma nova tabela de preços
 */
export async function criarTabelaPreco(tabela: Omit<TabelaPreco, "id" | "created_at">): Promise<TabelaPreco> {
  try {
    const { data, error } = await supabaseClient.from("tabelas_precos").insert(tabela).select().single()

    if (error) {
      console.error("Erro ao criar tabela de preços:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Erro ao criar tabela de preços:", error)
    throw error
  }
}

/**
 * Atualiza uma tabela de preços existente
 */
export async function atualizarTabelaPreco(
  id: string | number,
  tabela: Partial<Omit<TabelaPreco, "id" | "created_at">>,
): Promise<TabelaPreco> {
  try {
    const { data, error } = await supabaseClient
      .from("tabelas_precos")
      .update({ ...tabela, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar tabela ${id}:`, error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error(`Erro ao atualizar tabela ${id}:`, error)
    throw error
  }
}

/**
 * Adiciona uma faixa etária a uma tabela de preços
 */
export async function adicionarFaixaEtaria(
  faixa: Omit<TabelaPrecoFaixa, "id" | "created_at">,
): Promise<TabelaPrecoFaixa> {
  try {
    const { data, error } = await supabaseClient.from("tabelas_precos_faixas").insert(faixa).select().single()

    if (error) {
      console.error("Erro ao adicionar faixa etária:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Erro ao adicionar faixa etária:", error)
    throw error
  }
}

/**
 * Atualiza uma faixa etária existente
 */
export async function atualizarFaixaEtaria(
  id: string | number,
  faixa: Partial<Omit<TabelaPrecoFaixa, "id" | "created_at">>,
): Promise<TabelaPrecoFaixa> {
  try {
    const { data, error } = await supabaseClient
      .from("tabelas_precos_faixas")
      .update(faixa)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar faixa etária ${id}:`, error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error(`Erro ao atualizar faixa etária ${id}:`, error)
    throw error
  }
}

/**
 * Remove uma faixa etária
 */
export async function removerFaixaEtaria(id: string | number): Promise<void> {
  try {
    const { error } = await supabaseClient.from("tabelas_precos_faixas").delete().eq("id", id)

    if (error) {
      console.error(`Erro ao remover faixa etária ${id}:`, error)
      throw new Error(error.message)
    }
  } catch (error) {
    console.error(`Erro ao remover faixa etária ${id}:`, error)
    throw error
  }
}

/**
 * Obtém o valor de uma tabela para uma determinada idade
 */
export async function obterValorPorIdade(tabelaId: string | number, idade: number): Promise<number> {
  try {
    const { data: faixas, error } = await supabaseClient
      .from("tabelas_precos_faixas")
      .select("faixa_etaria, valor")
      .eq("tabela_id", tabelaId)

    if (error) {
      console.error(`Erro ao buscar faixas etárias da tabela ${tabelaId}:`, error)
      throw new Error(error.message)
    }

    if (!faixas || faixas.length === 0) {
      return 0
    }

    // Encontrar a faixa etária correspondente
    let valorEncontrado = 0

    for (const faixa of faixas) {
      // Verificar se é uma faixa com formato "min-max"
      if (faixa.faixa_etaria.includes("-")) {
        const [minStr, maxStr] = faixa.faixa_etaria.split("-")
        const min = Number.parseInt(minStr, 10)
        const max = Number.parseInt(maxStr, 10)

        if (idade >= min && idade <= max) {
          valorEncontrado = faixa.valor
          break
        }
      }
      // Verificar se é uma faixa com formato "min+" (idade mínima)
      else if (faixa.faixa_etaria.endsWith("+")) {
        const min = Number.parseInt(faixa.faixa_etaria.replace("+", ""), 10)
        if (idade >= min) {
          valorEncontrado = faixa.valor
          break
        }
      }
      // Verificar se é uma idade específica
      else {
        const idadeExata = Number.parseInt(faixa.faixa_etaria, 10)
        if (idade === idadeExata) {
          valorEncontrado = faixa.valor
          break
        }
      }
    }

    return valorEncontrado
  } catch (error) {
    console.error(`Erro ao obter valor para idade ${idade} na tabela ${tabelaId}:`, error)
    throw error
  }
}

export async function buscarFaixasEtariasPorTabela(tabelaId: string) {
  try {
    const { data, error } = await supabase
      .from("tabelas_precos_faixas")
      .select("*")
      .eq("tabela_id", tabelaId)
      .order("faixa_etaria", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Erro ao buscar faixas etárias:", error)
    throw error
  }
}
