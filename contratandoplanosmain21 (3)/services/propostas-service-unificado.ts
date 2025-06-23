import { supabase } from "@/lib/supabase"

/**
 * SERVIÇO DE PROPOSTAS UNIFICADO
 * =============================
 * Busca propostas de AMBAS as tabelas e unifica os resultados
 */

/**
 * Buscar propostas de AMBAS as tabelas (propostas + propostas_corretores)
 */
export async function buscarPropostas() {
  try {
    console.log("🔍 BUSCANDO PROPOSTAS DE AMBAS AS TABELAS")
    console.log("=".repeat(50))

    // 1. Buscar da tabela original "propostas" (clientes diretos)
    console.log("📋 Buscando da tabela: propostas")
    const { data: propostasOriginais, error: errorOriginais } = await supabase
      .from("propostas")
      .select("*")
      .order("created_at", { ascending: false })

    if (errorOriginais) {
      console.error("❌ Erro ao buscar propostas originais:", errorOriginais)
    } else {
      console.log("✅ Propostas originais encontradas:", propostasOriginais?.length || 0)
    }

    // 2. Buscar da tabela "propostas_corretores" (criadas por corretores)
    console.log("📋 Buscando da tabela: propostas_corretores")
    const { data: propostasCorretores, error: errorCorretores } = await supabase
      .from("propostas_corretores")
      .select(`
        *,
        corretor:corretores(nome, email)
      `)
      .order("created_at", { ascending: false })

    if (errorCorretores) {
      console.error("❌ Erro ao buscar propostas de corretores:", errorCorretores)
    } else {
      console.log("✅ Propostas de corretores encontradas:", propostasCorretores?.length || 0)
    }

    // 3. Unificar e normalizar os dados
    const todasPropostas = []

    // Adicionar propostas originais (normalizadas)
    if (propostasOriginais && propostasOriginais.length > 0) {
      propostasOriginais.forEach((proposta) => {
        todasPropostas.push({
          ...proposta,
          // Normalizar campos para compatibilidade
          nome_cliente: proposta.nome_cliente || proposta.nome,
          email: proposta.email,
          telefone: proposta.telefone || proposta.whatsapp,
          valor: proposta.valor || proposta.valor_plano,
          corretor_nome: proposta.corretor_nome || "Direto",
          corretor_email: proposta.corretor_email || "N/A",
          origem: "propostas", // Identificar origem
          tabela_origem: "propostas",
        })
      })
    }

    // Adicionar propostas de corretores (normalizadas)
    if (propostasCorretores && propostasCorretores.length > 0) {
      propostasCorretores.forEach((proposta) => {
        todasPropostas.push({
          ...proposta,
          // Normalizar campos para compatibilidade
          nome_cliente: proposta.cliente || proposta.nome_cliente,
          email: proposta.email_cliente || proposta.email,
          telefone: proposta.whatsapp_cliente || proposta.telefone,
          valor: proposta.valor_proposta || proposta.valor,
          corretor_nome: proposta.corretor?.nome || "Corretor",
          corretor_email: proposta.corretor?.email || "N/A",
          origem: "propostas_corretores", // Identificar origem
          tabela_origem: "propostas_corretores",
        })
      })
    }

    // 4. Ordenar por data de criação (mais recentes primeiro)
    todasPropostas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log("📊 RESUMO FINAL:")
    console.log(`   Total de propostas: ${todasPropostas.length}`)
    console.log(`   Propostas diretas: ${propostasOriginais?.length || 0}`)
    console.log(`   Propostas de corretores: ${propostasCorretores?.length || 0}`)

    // Distribuição por status
    const statusCount = {}
    todasPropostas.forEach((proposta) => {
      const status = proposta.status || "sem_status"
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    console.log("📈 Distribuição por Status:")
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} proposta(s)`)
    })

    return todasPropostas
  } catch (error) {
    console.error("❌ Erro geral ao buscar propostas:", error)
    throw error
  }
}

/**
 * Buscar proposta completa (detecta automaticamente a tabela)
 */
export async function buscarPropostaCompleta(propostaId: string) {
  try {
    console.log("🔍 BUSCANDO PROPOSTA COMPLETA - DETECÇÃO AUTOMÁTICA")
    console.log("=".repeat(50))
    console.log("📋 Proposta ID:", propostaId)

    let proposta = null
    let tabelaEncontrada = null

    // 1. Tentar buscar na tabela "propostas" primeiro
    console.log("🔍 Tentando buscar na tabela: propostas")
    const { data: propostaOriginal, error: errorOriginal } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", propostaId)
      .single()

    if (!errorOriginal && propostaOriginal) {
      console.log("✅ Proposta encontrada na tabela: propostas")
      proposta = {
        ...propostaOriginal,
        tabela_origem: "propostas",
        origem: "propostas",
      }
      tabelaEncontrada = "propostas"
    }

    // 2. Se não encontrou, tentar na tabela "propostas_corretores"
    if (!proposta) {
      console.log("🔍 Tentando buscar na tabela: propostas_corretores")
      const { data: propostaCorretor, error: errorCorretor } = await supabase
        .from("propostas_corretores")
        .select(`
          *,
          corretor:corretores(nome, email, telefone)
        `)
        .eq("id", propostaId)
        .single()

      if (!errorCorretor && propostaCorretor) {
        console.log("✅ Proposta encontrada na tabela: propostas_corretores")
        proposta = {
          ...propostaCorretor,
          // Normalizar campos
          nome_cliente: propostaCorretor.cliente || propostaCorretor.nome_cliente,
          email: propostaCorretor.email_cliente || propostaCorretor.email,
          telefone: propostaCorretor.whatsapp_cliente || propostaCorretor.telefone,
          valor: propostaCorretor.valor_proposta || propostaCorretor.valor,
          corretor_nome: propostaCorretor.corretor?.nome || "Corretor",
          corretor_email: propostaCorretor.corretor?.email || "N/A",
          tabela_origem: "propostas_corretores",
          origem: "propostas_corretores",
        }
        tabelaEncontrada = "propostas_corretores"
      }
    }

    if (!proposta) {
      console.error("❌ Proposta não encontrada em nenhuma tabela")
      throw new Error("Proposta não encontrada")
    }

    console.log(`🎯 PROPOSTA ENCONTRADA NA TABELA: ${tabelaEncontrada}`)
    console.log("   Nome:", proposta.nome_cliente)
    console.log("   Email:", proposta.email)
    console.log("   Status:", proposta.status)

    return proposta
  } catch (error) {
    console.error("❌ Erro ao buscar proposta completa:", error)
    throw error
  }
}

/**
 * Buscar dependentes (detecta automaticamente a tabela)
 */
export async function buscarDependentesProposta(propostaId: string) {
  try {
    console.log("👨‍👩‍👧‍👦 BUSCANDO DEPENDENTES - DETECÇÃO AUTOMÁTICA")
    console.log("📋 Proposta ID:", propostaId)

    // Primeiro, descobrir de qual tabela é a proposta
    const proposta = await buscarPropostaCompleta(propostaId)
    const tabelaOrigem = proposta.tabela_origem

    console.log(`📋 Proposta é da tabela: ${tabelaOrigem}`)

    let dependentesEncontrados = []
    let tabelaUsada = null

    // Definir tabelas de dependentes baseado na origem
    let tabelasDependentes = []
    if (tabelaOrigem === "propostas") {
      tabelasDependentes = ["dependentes", "dependentes_propostas", "proposta_dependentes"]
    } else if (tabelaOrigem === "propostas_corretores") {
      tabelasDependentes = ["dependentes_propostas_corretores", "dependentes"]
    }

    // Buscar dependentes nas tabelas apropriadas
    for (const tabela of tabelasDependentes) {
      try {
        console.log(`🔍 Tentando buscar dependentes na tabela: ${tabela}`)

        let query = supabase.from(tabela).select("*").order("created_at", { ascending: true })

        // Usar campo correto baseado na tabela
        if (tabela === "dependentes_propostas_corretores") {
          query = query.eq("proposta_corretor_id", propostaId)
        } else {
          query = query.eq("proposta_id", propostaId)
        }

        const { data, error } = await query

        if (error) {
          console.log(`⚠️ Erro na tabela ${tabela}:`, error.message)
          continue
        }

        if (data && data.length > 0) {
          console.log(`✅ Dependentes encontrados na tabela ${tabela}:`, data.length)
          dependentesEncontrados = data
          tabelaUsada = tabela
          break
        }
      } catch (err) {
        console.log(`❌ Erro ao acessar tabela ${tabela}:`, err.message)
        continue
      }
    }

    console.log(`🎯 DEPENDENTES: ${dependentesEncontrados.length} encontrados na tabela ${tabelaUsada || "nenhuma"}`)
    return dependentesEncontrados || []
  } catch (error) {
    console.error("❌ Erro ao buscar dependentes:", error)
    return []
  }
}

/**
 * Atualizar status (detecta automaticamente a tabela)
 */
export async function atualizarStatusProposta(id: string, status: string, motivo?: string) {
  try {
    console.log("🔄 ATUALIZANDO STATUS - DETECÇÃO AUTOMÁTICA")
    console.log(`📋 ID: ${id}`)
    console.log(`📊 Novo Status: ${status}`)

    // Descobrir de qual tabela é a proposta
    const proposta = await buscarPropostaCompleta(id)
    const tabelaOrigem = proposta.tabela_origem

    console.log(`📋 Atualizando na tabela: ${tabelaOrigem}`)

    const updateData: any = { status }
    if (motivo) {
      updateData.motivo_rejeicao = motivo
    }

    const { error } = await supabase.from(tabelaOrigem).update(updateData).eq("id", id)

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`)
    }

    console.log("✅ Status atualizado com sucesso!")
    return true
  } catch (error) {
    console.error("❌ Erro ao atualizar status:", error)
    throw error
  }
}

/**
 * Enviar email de validação (detecta automaticamente a tabela)
 */
export async function enviarValidacaoEmail(propostaId: string, emailCliente: string, nomeCliente: string) {
  try {
    console.log("📧 ENVIANDO EMAIL DE VALIDAÇÃO - DETECÇÃO AUTOMÁTICA")
    console.log(`📋 Proposta ID: ${propostaId}`)

    // Descobrir de qual tabela é a proposta
    const proposta = await buscarPropostaCompleta(propostaId)
    const tabelaOrigem = proposta.tabela_origem

    console.log(`📋 Enviando email para proposta da tabela: ${tabelaOrigem}`)

    // Validações
    if (!emailCliente || emailCliente.trim() === "") {
      throw new Error("Email do cliente não fornecido")
    }

    let nomeClienteFinal = nomeCliente
    if (!nomeCliente || nomeCliente.trim() === "") {
      nomeClienteFinal = proposta.nome_cliente || proposta.nome || "Cliente"
    }

    // Criar link de validação
    const linkValidacao = `${window.location.origin}/proposta-digital/completar/${propostaId}`

    // Enviar email
    const { enviarEmailPropostaCliente } = await import("./email-service")
    const sucesso = await enviarEmailPropostaCliente(
      emailCliente.trim(),
      nomeClienteFinal.trim(),
      linkValidacao,
      "Sistema ContratandoPlanos",
    )

    if (sucesso) {
      // Atualizar status na tabela correta
      const updateData = {
        status: "aguardando_cliente",
        email_enviado_em: new Date().toISOString(),
        email_validacao_enviado: true,
        link_validacao: linkValidacao,
      }

      await supabase.from(tabelaOrigem).update(updateData).eq("id", propostaId)

      console.log("✅ Email enviado e status atualizado!")
      return true
    } else {
      throw new Error("Falha no envio do email")
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error)
    throw error
  }
}

/**
 * Função inteligente para obter documentos (compatível com ambas as estruturas)
 */
export function obterDocumentosInteligente(objeto: any, tipo: "titular" | "dependente" = "titular") {
  if (!objeto) return {}

  let documentos = {}

  // Prioridade 1: Campo JSON documentos_urls
  if (objeto.documentos_urls && typeof objeto.documentos_urls === "object") {
    documentos = { ...objeto.documentos_urls }
  }

  // Prioridade 2: Campos individuais (para propostas_corretores)
  if (tipo === "titular" && Object.keys(documentos).length === 0) {
    const camposIndividuais = {
      rg_frente: objeto.rg_frente_url,
      rg_verso: objeto.rg_verso_url,
      cpf: objeto.cpf_url,
      comprovante_residencia: objeto.comprovante_residencia_url,
      cns: objeto.cns_url,
    }

    Object.entries(camposIndividuais).forEach(([nome, url]) => {
      if (url && typeof url === "string" && url.trim() !== "") {
        documentos[nome] = url
      }
    })
  }

  // Validar URLs
  const documentosValidos = {}
  Object.entries(documentos).forEach(([tipo, url]) => {
    if (typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) {
      documentosValidos[tipo] = url
    }
  })

  return documentosValidos
}

/**
 * Buscar questionário de saúde (compatível com ambas as estruturas)
 */
export async function buscarQuestionarioSaude(propostaId: string, dependenteId?: string) {
  try {
    console.log("🏥 BUSCANDO QUESTIONÁRIO DE SAÚDE")

    const tabelasQuestionario = [
      "questionario_saude",
      "questionario_saude_propostas",
      "questionario_saude_corretores",
      "questionario_saude_propostas_corretores",
    ]

    for (const tabela of tabelasQuestionario) {
      try {
        let query = supabase.from(tabela).select("*").eq("proposta_id", propostaId)

        if (dependenteId) {
          query = query.eq("dependente_id", dependenteId)
        } else {
          query = query.or("dependente_id.is.null,dependente_id.eq.")
        }

        const { data, error } = await query.order("pergunta_id", { ascending: true })

        if (!error && data && data.length > 0) {
          console.log(`✅ Questionário encontrado na tabela ${tabela}:`, data.length, "respostas")
          return data
        }
      } catch (err) {
        continue
      }
    }

    return []
  } catch (error) {
    console.error("❌ Erro ao buscar questionário:", error)
    return []
  }
}

/**
 * Funções auxiliares para obter dados normalizados
 */
export function obterNomeCliente(proposta: any): string {
  return proposta.nome_cliente || proposta.cliente || proposta.nome || "Nome não informado"
}

export function obterEmailCliente(proposta: any): string {
  return proposta.email || proposta.email_cliente || "Email não informado"
}

export function obterTelefoneCliente(proposta: any): string {
  return proposta.telefone || proposta.whatsapp_cliente || proposta.whatsapp || "Telefone não informado"
}

export function obterValorProposta(proposta: any): number {
  return proposta.valor || proposta.valor_proposta || proposta.valor_plano || 0
}
