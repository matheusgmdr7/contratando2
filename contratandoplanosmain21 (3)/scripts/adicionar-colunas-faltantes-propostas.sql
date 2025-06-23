-- Script para adicionar colunas faltantes na tabela propostas

-- Verificar se a tabela propostas existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'propostas') THEN
        RAISE EXCEPTION 'Tabela propostas não existe. Execute primeiro o script de criação da tabela.';
    END IF;
END $$;

-- Adicionar colunas faltantes uma por uma (com verificação se já existem)

-- Campos de produto
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'produto_id') THEN
        ALTER TABLE propostas ADD COLUMN produto_id UUID;
        RAISE NOTICE 'Coluna produto_id adicionada';
    ELSE
        RAISE NOTICE 'Coluna produto_id já existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'produto_nome') THEN
        ALTER TABLE propostas ADD COLUMN produto_nome VARCHAR(255);
        RAISE NOTICE 'Coluna produto_nome adicionada';
    ELSE
        RAISE NOTICE 'Coluna produto_nome já existe';
    END IF;
END $$;

-- Campos de endereço detalhado
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'numero') THEN
        ALTER TABLE propostas ADD COLUMN numero VARCHAR(20);
        RAISE NOTICE 'Coluna numero adicionada';
    ELSE
        RAISE NOTICE 'Coluna numero já existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'complemento') THEN
        ALTER TABLE propostas ADD COLUMN complemento VARCHAR(100);
        RAISE NOTICE 'Coluna complemento adicionada';
    ELSE
        RAISE NOTICE 'Coluna complemento já existe';
    END IF;
END $$;

-- Campos de documentação
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'orgao_emissor') THEN
        ALTER TABLE propostas ADD COLUMN orgao_emissor VARCHAR(20);
        RAISE NOTICE 'Coluna orgao_emissor adicionada';
    ELSE
        RAISE NOTICE 'Coluna orgao_emissor já existe';
    END IF;
END $$;

-- Campos pessoais
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'nome_mae') THEN
        ALTER TABLE propostas ADD COLUMN nome_mae VARCHAR(255);
        RAISE NOTICE 'Coluna nome_mae adicionada';
    ELSE
        RAISE NOTICE 'Coluna nome_mae já existe';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'sexo') THEN
        ALTER TABLE propostas ADD COLUMN sexo VARCHAR(1) CHECK (sexo IN ('M', 'F'));
        RAISE NOTICE 'Coluna sexo adicionada';
    ELSE
        RAISE NOTICE 'Coluna sexo já existe';
    END IF;
END $$;

-- Campo de observações
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'observacoes') THEN
        ALTER TABLE propostas ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe';
    END IF;
END $$;

-- Campo para título do template (para compatibilidade)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'template_titulo') THEN
        ALTER TABLE propostas ADD COLUMN template_titulo VARCHAR(255);
        RAISE NOTICE 'Coluna template_titulo adicionada';
    ELSE
        RAISE NOTICE 'Coluna template_titulo já existe';
    END IF;
END $$;

-- Campo para armazenar dados dos dependentes (JSON para compatibilidade)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'dependentes_dados') THEN
        ALTER TABLE propostas ADD COLUMN dependentes_dados JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Coluna dependentes_dados adicionada';
    ELSE
        RAISE NOTICE 'Coluna dependentes_dados já existe';
    END IF;
END $$;

-- Campo para WhatsApp (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'propostas' AND column_name = 'whatsapp') THEN
        ALTER TABLE propostas ADD COLUMN whatsapp VARCHAR(20);
        RAISE NOTICE 'Coluna whatsapp adicionada';
    ELSE
        RAISE NOTICE 'Coluna whatsapp já existe';
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_propostas_produto_id ON propostas(produto_id);
CREATE INDEX IF NOT EXISTS idx_propostas_template_titulo ON propostas(template_titulo);
CREATE INDEX IF NOT EXISTS idx_propostas_sexo ON propostas(sexo);

-- Atualizar comentários da tabela
COMMENT ON COLUMN propostas.produto_id IS 'ID do produto selecionado';
COMMENT ON COLUMN propostas.produto_nome IS 'Nome do produto selecionado';
COMMENT ON COLUMN propostas.numero IS 'Número do endereço';
COMMENT ON COLUMN propostas.complemento IS 'Complemento do endereço';
COMMENT ON COLUMN propostas.orgao_emissor IS 'Órgão emissor do RG';
COMMENT ON COLUMN propostas.nome_mae IS 'Nome da mãe do titular';
COMMENT ON COLUMN propostas.sexo IS 'Sexo do titular (M/F)';
COMMENT ON COLUMN propostas.observacoes IS 'Observações adicionais da proposta';
COMMENT ON COLUMN propostas.template_titulo IS 'Título do template usado';
COMMENT ON COLUMN propostas.dependentes_dados IS 'Dados dos dependentes em formato JSON';
COMMENT ON COLUMN propostas.whatsapp IS 'Número do WhatsApp do cliente';

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'propostas' 
ORDER BY ordinal_position;

RAISE NOTICE '✅ Script executado com sucesso! Todas as colunas necessárias foram adicionadas à tabela propostas.';
