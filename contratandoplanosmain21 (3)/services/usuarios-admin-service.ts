import { supabaseClient as supabase } from "@/lib/supabase-client"
import bcrypt from "bcryptjs"

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  perfil: "master" | "secretaria" | "assistente"
  status: "ativo" | "inativo"
  permissoes?: Record<string, any>
  criado_em: string
  atualizado_em: string
  ultimo_acesso?: string
  criado_por?: string
}

export interface CriarUsuarioAdmin {
  nome: string
  email: string
  senha: string
  perfil: "master" | "secretaria" | "assistente"
  permissoes_customizadas?: Record<string, any>
}

export interface PermissaoModulo {
  modulo: string
  permissoes: Record<string, boolean>
}

// Buscar todos os usuários administrativos
export async function buscarUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  try {
    const { data, error } = await supabase
      .from("usuarios_admin")
      .select(`
        id,
        nome,
        email,
        perfil,
        status,
        permissoes,
        criado_em,
        atualizado_em,
        ultimo_acesso,
        criado_por
      `)
      .order("criado_em", { ascending: false })

    if (error) {
      console.error("Erro ao buscar usuários admin:", error)
      throw new Error("Erro ao buscar usuários administrativos")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar usuários admin:", error)
    throw error
  }
}

// Buscar usuário por email
export async function buscarUsuarioAdminPorEmail(email: string): Promise<UsuarioAdmin | null> {
  try {
    const { data, error } = await supabase
      .from("usuarios_admin")
      .select("*")
      .eq("email", email)
      .eq("status", "ativo")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar usuário por email:", error)
      throw new Error("Erro ao buscar usuário")
    }

    return data || null
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error)
    return null
  }
}

// Criar novo usuário administrativo
export async function criarUsuarioAdmin(dados: CriarUsuarioAdmin, criadorId: string): Promise<UsuarioAdmin> {
  try {
    // Verificar se email já existe
    const usuarioExistente = await buscarUsuarioAdminPorEmail(dados.email)
    if (usuarioExistente) {
      throw new Error("Este email já está cadastrado")
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 10)

    // Buscar permissões padrão do perfil
    const { data: permissoesPadrao, error: permissoesError } = await supabase
      .from("perfis_permissoes")
      .select("modulo, permissoes")
      .eq("perfil", dados.perfil)

    if (permissoesError) {
      console.error("Erro ao buscar permissões do perfil:", permissoesError)
    }

    // Montar objeto de permissões
    const permissoes: Record<string, any> = {}
    if (permissoesPadrao) {
      permissoesPadrao.forEach((p) => {
        permissoes[p.modulo] = p.permissoes
      })
    }

    // Aplicar permissões customizadas se fornecidas
    if (dados.permissoes_customizadas) {
      Object.assign(permissoes, dados.permissoes_customizadas)
    }

    const { data, error } = await supabase
      .from("usuarios_admin")
      .insert({
        nome: dados.nome,
        email: dados.email,
        senha_hash: senhaHash,
        perfil: dados.perfil,
        permissoes,
        criado_por: criadorId,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar usuário admin:", error)
      throw new Error("Erro ao criar usuário administrativo")
    }

    // Log da ação
    await registrarLogAcesso(criadorId, "criar_usuario", "usuarios", {
      usuario_criado: data.id,
      email: dados.email,
      perfil: dados.perfil,
    })

    return data
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error)
    throw error
  }
}

// Atualizar usuário administrativo
export async function atualizarUsuarioAdmin(
  id: string,
  dados: Partial<CriarUsuarioAdmin>,
  atualizadorId: string,
): Promise<UsuarioAdmin> {
  try {
    const dadosAtualizacao: any = {
      nome: dados.nome,
      email: dados.email,
      perfil: dados.perfil,
    }

    // Se senha foi fornecida, fazer hash
    if (dados.senha) {
      dadosAtualizacao.senha_hash = await bcrypt.hash(dados.senha, 10)
    }

    // Atualizar permissões se perfil mudou
    if (dados.perfil) {
      const { data: permissoesPadrao } = await supabase
        .from("perfis_permissoes")
        .select("modulo, permissoes")
        .eq("perfil", dados.perfil)

      const permissoes: Record<string, any> = {}
      if (permissoesPadrao) {
        permissoesPadrao.forEach((p) => {
          permissoes[p.modulo] = p.permissoes
        })
      }

      if (dados.permissoes_customizadas) {
        Object.assign(permissoes, dados.permissoes_customizadas)
      }

      dadosAtualizacao.permissoes = permissoes
    }

    const { data, error } = await supabase
      .from("usuarios_admin")
      .update(dadosAtualizacao)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar usuário admin:", error)
      throw new Error("Erro ao atualizar usuário administrativo")
    }

    // Log da ação
    await registrarLogAcesso(atualizadorId, "atualizar_usuario", "usuarios", {
      usuario_atualizado: id,
      alteracoes: Object.keys(dadosAtualizacao),
    })

    return data
  } catch (error) {
    console.error("Erro ao atualizar usuário admin:", error)
    throw error
  }
}

// Alterar status do usuário
export async function alterarStatusUsuarioAdmin(
  id: string,
  status: "ativo" | "inativo",
  atualizadorId: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("usuarios_admin").update({ status }).eq("id", id)

    if (error) {
      console.error("Erro ao alterar status do usuário:", error)
      throw new Error("Erro ao alterar status do usuário")
    }

    // Log da ação
    await registrarLogAcesso(atualizadorId, "alterar_status_usuario", "usuarios", {
      usuario_id: id,
      novo_status: status,
    })
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error)
    throw error
  }
}

// Excluir usuário administrativo
export async function excluirUsuarioAdmin(id: string, exclusorId: string): Promise<void> {
  try {
    // Verificar se não é o próprio usuário
    if (id === exclusorId) {
      throw new Error("Você não pode excluir sua própria conta")
    }

    // Buscar dados do usuário antes de excluir para log
    const { data: usuario } = await supabase.from("usuarios_admin").select("email, perfil").eq("id", id).single()

    const { error } = await supabase.from("usuarios_admin").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir usuário admin:", error)
      throw new Error("Erro ao excluir usuário administrativo")
    }

    // Log da ação
    await registrarLogAcesso(exclusorId, "excluir_usuario", "usuarios", {
      usuario_excluido: id,
      email: usuario?.email,
      perfil: usuario?.perfil,
    })
  } catch (error) {
    console.error("Erro ao excluir usuário admin:", error)
    throw error
  }
}

// Buscar permissões de um perfil
export async function buscarPermissoesPerfil(perfil: string): Promise<PermissaoModulo[]> {
  try {
    const { data, error } = await supabase
      .from("perfis_permissoes")
      .select("modulo, permissoes")
      .eq("perfil", perfil)
      .order("modulo")

    if (error) {
      console.error("Erro ao buscar permissões do perfil:", error)
      throw new Error("Erro ao buscar permissões")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar permissões do perfil:", error)
    throw error
  }
}

// Verificar se usuário tem permissão
export async function verificarPermissao(usuarioId: string, modulo: string, acao: string): Promise<boolean> {
  try {
    const { data: usuario, error } = await supabase
      .from("usuarios_admin")
      .select("permissoes, perfil")
      .eq("id", usuarioId)
      .eq("status", "ativo")
      .single()

    if (error || !usuario) {
      return false
    }

    // Master sempre tem acesso
    if (usuario.perfil === "master") {
      return true
    }

    // Verificar permissões específicas
    const permissoesModulo = usuario.permissoes?.[modulo]
    return permissoesModulo?.[acao] === true
  } catch (error) {
    console.error("Erro ao verificar permissão:", error)
    return false
  }
}

// Registrar log de acesso
export async function registrarLogAcesso(
  usuarioId: string,
  acao: string,
  modulo?: string,
  detalhes?: any,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    await supabase.from("logs_acesso_admin").insert({
      usuario_id: usuarioId,
      acao,
      modulo,
      detalhes,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error("Erro ao registrar log de acesso:", error)
    // Não propagar erro de log para não afetar funcionalidade principal
  }
}

// Atualizar último acesso
export async function atualizarUltimoAcesso(usuarioId: string): Promise<void> {
  try {
    await supabase.from("usuarios_admin").update({ ultimo_acesso: new Date().toISOString() }).eq("id", usuarioId)
  } catch (error) {
    console.error("Erro ao atualizar último acesso:", error)
  }
}

// Validar senha
export async function validarSenhaUsuarioAdmin(email: string, senha: string): Promise<UsuarioAdmin | null> {
  try {
    const { data: usuario, error } = await supabase
      .from("usuarios_admin")
      .select("*")
      .eq("email", email)
      .eq("status", "ativo")
      .single()

    if (error || !usuario) {
      return null
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
    if (!senhaValida) {
      return null
    }

    // Atualizar último acesso
    await atualizarUltimoAcesso(usuario.id)

    // Registrar log de login
    await registrarLogAcesso(usuario.id, "login", "auth")

    return usuario
  } catch (error) {
    console.error("Erro ao validar senha:", error)
    return null
  }
}
