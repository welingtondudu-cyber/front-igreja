-- ─── EVOLUÇÃO E MIGRAÇÃO DO BANCO DE DADOS (POSTGRESQL - SCHEMA: gestao) ───

-- 1. Criação das tabelas base caso não existam no banco
CREATE TABLE IF NOT EXISTS gestao.eventos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    observacoes TEXT,
    imagem_url TEXT
);

CREATE TABLE IF NOT EXISTS gestao.noticias (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    imagem_url TEXT,
    data_publicacao TIMESTAMP DEFAULT NOW()
);

-- 2. Alteração de tabelas existentes (Garantindo colunas de mídia e RG)
ALTER TABLE gestao.eventos ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE gestao.noticias ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE gestao.membros ADD COLUMN IF NOT EXISTS rg VARCHAR(50);

-- 3. Nova tabela de vínculo: Cargos/Ministérios Solicitados por Evento
CREATE TABLE IF NOT EXISTS gestao.eventos_cargos_necessarios (
    evento_id BIGINT REFERENCES gestao.eventos(id) ON DELETE CASCADE,
    cargo_id BIGINT REFERENCES gestao.cargos(id) ON DELETE CASCADE,
    PRIMARY KEY (evento_id, cargo_id)
);

-- 4. Ajuste e criação da tabela de Escalas de Voluntários
CREATE TABLE IF NOT EXISTS gestao.escalas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    evento_id BIGINT REFERENCES gestao.eventos(id) ON DELETE CASCADE,
    membro_id BIGINT REFERENCES gestao.membros(id) ON DELETE CASCADE,
    grupo_id BIGINT REFERENCES gestao.grupos(id) ON DELETE SET NULL,
    funcao_especifica VARCHAR(255),
    status_confirmacao VARCHAR(50) DEFAULT 'PENDENTE'
);

-- 5. Novas tabelas para o Portal de Conteúdos e Trilhas
CREATE TABLE IF NOT EXISTS gestao.trilhas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('MINI_CURSO', 'TRILHA', 'DEVOCIONAL')),
    imagem_url TEXT
);

CREATE TABLE IF NOT EXISTS gestao.trilha_conteudos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    trilha_id BIGINT REFERENCES gestao.trilhas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    resumo TEXT,
    texto_completo TEXT,
    video_url TEXT,
    ordem INT NOT NULL,
    data_cadastro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gestao.trilha_progresso (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    membro_id BIGINT REFERENCES gestao.membros(id) ON DELETE CASCADE,
    conteudo_id BIGINT REFERENCES gestao.trilha_conteudos(id) ON DELETE CASCADE,
    concluido BOOLEAN DEFAULT FALSE,
    data_conclusao TIMESTAMP,
    CONSTRAINT unique_membro_conteudo UNIQUE (membro_id, conteudo_id)
);

-- 6. Nova tabela para Auditoria de Histórico de Alterações de Membros
CREATE TABLE IF NOT EXISTS gestao.membros_historico (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    membro_id BIGINT REFERENCES gestao.membros(id) ON DELETE CASCADE,
    campo_alterado VARCHAR(100) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    data_alteracao TIMESTAMP DEFAULT NOW(),
    usuario_id BIGINT
);

-- Adição de idade_limite para Eleições
ALTER TABLE gestao.votacoes ADD COLUMN IF NOT EXISTS idade_limite INT DEFAULT 18;

-- 7. Atualização do Módulo de Estudos & Pregações
ALTER TABLE gestao.trilhas DROP CONSTRAINT IF EXISTS trilhas_tipo_check;
ALTER TABLE gestao.trilhas ADD CONSTRAINT trilhas_tipo_check CHECK (tipo IN ('MINI_CURSO', 'TRILHA', 'DEVOCIONAL', 'PREGACAO'));

ALTER TABLE gestao.trilha_conteudos ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);

CREATE TABLE IF NOT EXISTS gestao.trilha_status (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    membro_id BIGINT NOT NULL REFERENCES gestao.membros(id) ON DELETE CASCADE,
    trilha_id BIGINT REFERENCES gestao.trilhas(id) ON DELETE CASCADE,
    conteudo_id BIGINT REFERENCES gestao.trilha_conteudos(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO', -- 'EM_ANDAMENTO', 'PARALISADO', 'CONCLUIDO'
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_membro_trilha_status UNIQUE (membro_id, trilha_id),
    CONSTRAINT unique_membro_conteudo_status UNIQUE (membro_id, conteudo_id)
);

-- 8. Relacionamento com Membros (Ator) e Tags de Sociedades Internas
ALTER TABLE gestao.trilhas ADD COLUMN IF NOT EXISTS ator_id BIGINT REFERENCES gestao.membros(id) ON DELETE SET NULL;
ALTER TABLE gestao.trilha_conteudos ADD COLUMN IF NOT EXISTS ator_id BIGINT REFERENCES gestao.membros(id) ON DELETE SET NULL;
ALTER TABLE gestao.noticias ADD COLUMN IF NOT EXISTS sociedade VARCHAR(50) DEFAULT 'TODA_IGREJA';
