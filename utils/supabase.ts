import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getFieldMapping() {
  return null
}

export async function uploadFile(file: File, bucket = "documentos_propostas", path: string) {
  try {
    // Validar o arquivo
    if (!file) {
      throw new Error("Arquivo não fornecido")
    }

    // Validar o tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > maxSize) {
      throw new Error("O arquivo excede o tamanho máximo permitido de 5MB")
    }

    // Validar o tipo do arquivo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido. Use PDF, JPEG ou PNG")
    }

    // Usar um nome de arquivo extremamente simples
    const fileName = path.split("/").pop() || path

    console.log(`Tentando upload para ${bucket}/${fileName}`)

    // Upload do arquivo diretamente na raiz do bucket
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("Erro detalhado no upload:", {
        message: error.message,
        name: error.name,
        bucket: bucket,
      })
      throw new Error(`Erro no upload do arquivo: ${error.message}`)
    }

    if (!data) {
      throw new Error("Upload falhou: nenhum dado retornado")
    }

    // Obter URL pública
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName)

    if (!publicUrl?.publicUrl) {
      throw new Error("Não foi possível obter a URL pública do arquivo")
    }

    console.log(`Upload concluído com sucesso: ${publicUrl.publicUrl}`)
    return publicUrl.publicUrl
  } catch (error) {
    console.error("Erro detalhado no upload:", error)
    throw error
  }
}

export async function saveProposta(propostaData: any) {
  try {
    const { data: proposta, error: propostaError } = await supabase
      .from("propostas")
      .insert([propostaData])
      .select()
      .single()

    if (propostaError) {
      console.error("Erro ao salvar proposta:", propostaError)
      throw new Error("Erro ao salvar proposta: " + propostaError.message)
    }

    if (!proposta) {
      throw new Error("Proposta não foi salva corretamente")
    }

    return proposta
  } catch (error) {
    console.error("Erro ao salvar proposta:", error)
    throw error
  }
}

export async function saveDependente(dependenteData: any) {
  try {
    const { data: dependente, error: dependenteError } = await supabase
      .from("dependentes")
      .insert([dependenteData])
      .select()
      .single()

    if (dependenteError) {
      console.error("Erro ao salvar dependente:", dependenteError)
      throw new Error("Erro ao salvar dependente: " + dependenteError.message)
    }

    if (!dependente) {
      throw new Error("Dependente não foi salvo corretamente")
    }

    return dependente
  } catch (error) {
    console.error("Erro ao salvar dependente:", error)
    throw error
  }
}

export async function saveDocumento(documentoData: any) {
  try {
    const { data: documento, error: documentoError } = await supabase
      .from("documentos")
      .insert([documentoData])
      .select()
      .single()

    if (documentoError) {
      console.error("Erro ao salvar documento:", documentoError)
      throw new Error("Erro ao salvar documento: " + documentoError.message)
    }

    if (!documento) {
      throw new Error("Documento não foi salvo corretamente")
    }

    return documento
  } catch (error) {
    console.error("Erro ao salvar documento:", error)
    throw error
  }
}

export async function saveQuestionario(questionarioData: any) {
  try {
    const { data: questionario, error: questionarioError } = await supabase
      .from("questionario_saude")
      .insert([questionarioData])
      .select()
      .single()

    if (questionarioError) {
      console.error("Erro ao salvar questionário:", questionarioError)
      throw new Error("Erro ao salvar questionário: " + questionarioError.message)
    }

    if (!questionario) {
      throw new Error("Questionário não foi salvo corretamente")
    }

    return questionario
  } catch (error) {
    console.error("Erro ao salvar questionário:", error)
    throw error
  }
}

export async function getPropostas() {
  const { data: propostas, error } = await supabase
    .from("propostas")
    .select(`
      *,
      documentos (
        tipo,
        arquivo_url,
        arquivo_nome
      ),
      dependentes (
        *
      ),
      questionario_saude (
        *
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar propostas:", error)
    throw error
  }

  return propostas
}

export async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error("Erro ao fazer download:", error)
    throw error
  }
}

export async function exportToExcel(propostas: any[]) {
  try {
    // Preparar os dados para o Excel
    const data = propostas.map((proposta) => {
      const dependentes = proposta.dependentes?.map((dep: any) => `${dep.nome} (${dep.parentesco})`).join(", ") || ""

      const documentos = proposta.documentos?.map((doc: any) => doc.tipo).join(", ") || ""

      return {
        Nome: proposta.nome,
        CPF: proposta.cpf,
        Email: proposta.email,
        Telefone: proposta.telefone,
        Endereço: proposta.endereco,
        "Data de Nascimento": proposta.data_nascimento,
        Dependentes: dependentes,
        Documentos: documentos,
        "Data de Criação": new Date(proposta.created_at).toLocaleDateString(),
      }
    })

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Propostas")

    // Gerar arquivo
    XLSX.writeFile(wb, "propostas.xlsx")
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error)
    throw error
  }
}
