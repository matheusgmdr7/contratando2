export interface ProdutoCorretor {
  id: string | number
  nome: string
  operadora: string
  tipo: string
  comissao: string
  descricao?: string
  disponivel: boolean
  created_at?: string
  tabela_id?: string | number
  tabela_nome?: string
  tabelas_count?: number
}

export interface CorretorPerfil {
  id: string | number
  nome: string
  email: string
  telefone: string
  cpf: string
  cnpj?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  susep?: string
  aprovado: boolean
  created_at: string
  updated_at?: string
  avatar_url?: string
}

export interface CorretorComissao {
  id: string | number
  corretor_id: string | number
  produto_id: string | number
  comissao: number
  created_at: string
  updated_at?: string
  produto_nome?: string
  operadora?: string
}
