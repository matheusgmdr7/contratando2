import { supabase } from "@/lib/supabase"

/**
 * Faz upload de um arquivo para o storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param path Caminho dentro do bucket
 * @param file Arquivo a ser enviado
 * @param contentType Tipo de conteúdo do arquivo (opcional)
 * @returns URL pública do arquivo ou null em caso de erro
 */
export async function uploadFile(bucket, path, file, contentType = null) {
  try {
    console.log(`Iniciando upload para ${bucket}/${path}`)

    // Se não for um File ou Blob, rejeita
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("O arquivo fornecido não é válido (deve ser File ou Blob)")
    }

    // Especificar o tipo de conteúdo, se fornecido
    const options = contentType ? { contentType, upsert: true } : { upsert: true }

    // Upload do arquivo
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options)

    if (error) {
      throw error
    }

    // Obter a URL pública do arquivo
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    console.log(`Upload concluído com sucesso: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error)
    throw error
  }
}

/**
 * Obtém a URL pública de um arquivo no storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param path Caminho dentro do bucket
 * @returns URL pública do arquivo ou null em caso de erro
 */
export async function getPublicUrl(bucket, path) {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    console.error("Erro ao obter URL pública:", error)
    return null
  }
}

/**
 * Verifica se um arquivo existe no storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param path Caminho dentro do bucket
 * @returns true se o arquivo existir, false caso contrário
 */
export async function fileExists(bucket, path) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path.split("/").slice(0, -1).join("/"), {
      limit: 1,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
      search: path.split("/").pop(),
    })

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error("Erro ao verificar existência de arquivo:", error)
    return false
  }
}

/**
 * Exclui um arquivo do storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param path Caminho dentro do bucket
 * @returns true se a exclusão foi bem-sucedida, false caso contrário
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error)
    return false
  }
}

/**
 * Baixa um arquivo do storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param path Caminho dentro do bucket
 * @returns Blob do arquivo ou null em caso de erro
 */
export async function downloadFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error)
    return null
  }
}

/**
 * Copia um arquivo dentro do storage do Supabase
 * @param bucket Nome do bucket de storage
 * @param sourcePath Caminho de origem
 * @param destPath Caminho de destino
 * @returns true se a cópia foi bem-sucedida, false caso contrário
 */
export async function copyFile(bucket, sourcePath, destPath) {
  try {
    // Primeiro, baixa o arquivo
    const fileBlob = await downloadFile(bucket, sourcePath)

    if (!fileBlob) {
      throw new Error("Não foi possível baixar o arquivo de origem")
    }

    // Em seguida, faz o upload para o novo caminho
    await uploadFile(bucket, destPath, fileBlob)

    return true
  } catch (error) {
    console.error("Erro ao copiar arquivo:", error)
    return false
  }
}

/**
 * Obtém a URL do avatar de um corretor
 * @param corretorId ID do corretor
 * @returns URL do avatar ou null se não existir
 */
export async function obterUrlAvatar(corretorId: string): Promise<string | null> {
  try {
    const avatarPath = `avatars/${corretorId}`

    // Verificar se o arquivo existe
    const exists = await fileExists("avatars", avatarPath)

    if (!exists) {
      return null
    }

    // Retornar a URL pública
    return await getPublicUrl("avatars", avatarPath)
  } catch (error) {
    console.error("Erro ao obter URL do avatar:", error)
    return null
  }
}

/**
 * Faz upload de um documento para o storage do Supabase
 * @param file Arquivo a ser enviado
 * @param path Caminho onde o arquivo será salvo
 * @returns Objeto com url e error
 */
export async function fazerUploadDocumento(file: File, path: string): Promise<{ url?: string; error?: any }> {
  try {
    console.log(`Iniciando upload do documento para: ${path}`)

    // Validar se é um arquivo válido
    if (!(file instanceof File)) {
      throw new Error("O arquivo fornecido não é válido")
    }

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from("documentos_propostas").upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("Erro no upload:", error)
      return { error }
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage.from("documentos_propostas").getPublicUrl(path)

    console.log(`Upload concluído com sucesso: ${urlData.publicUrl}`)
    return { url: urlData.publicUrl }
  } catch (error) {
    console.error("Erro ao fazer upload do documento:", error)
    return { error }
  }
}
