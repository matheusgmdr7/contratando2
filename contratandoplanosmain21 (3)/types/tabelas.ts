export interface TabelaPreco {
  id: string | number
  titulo: string
  descricao?: string
  operadora?: string
  tipo_plano?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface TabelaPrecoFaixa {
  id: string | number
  tabela_id: string | number
  faixa_etaria: string
  valor: number
  created_at: string
}

export interface TabelaPrecoDetalhada {
  tabela: TabelaPreco
  faixas: TabelaPrecoFaixa[]
}

export interface TabelaProduto {
  relacao_id: string | number
  tabela_id: string | number
  tabela_titulo: string
  segmentacao: string
  descricao?: string
}
