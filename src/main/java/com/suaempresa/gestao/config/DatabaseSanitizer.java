package com.suaempresa.gestao.config;

import com.suaempresa.gestao.domain.entity.Cargo;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.repository.CargoRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSanitizer implements CommandLineRunner {

    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DatabaseSanitizer(MembroRepository membroRepository, CargoRepository cargoRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.membroRepository = membroRepository;
        this.cargoRepository = cargoRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            System.out.println("--- ALTERING PICTURE COLUMNS TO TEXT TYPE ---");
            jdbcTemplate.execute("ALTER TABLE gestao.eventos ALTER COLUMN imagem_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE gestao.membros ALTER COLUMN foto_perfil_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE gestao.noticias ALTER COLUMN imagem_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE gestao.trilhas ALTER COLUMN imagem_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE gestao.trilha_conteudos ALTER COLUMN texto_completo TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE gestao.trilha_conteudos ALTER COLUMN pdf_url TYPE TEXT");
            System.out.println("--- PICTURE COLUMNS ALTERED SUCCESSFULLY ---");
        } catch (Exception ex) {
            System.err.println("Could not alter picture columns: " + ex.getMessage());
        }

        try {
            System.out.println("--- ENSURING VOTACAO SCHEMA HAS IDADE_LIMITE ---");
            jdbcTemplate.execute("ALTER TABLE gestao.votacoes ADD COLUMN IF NOT EXISTS idade_limite integer DEFAULT 0");
            jdbcTemplate.execute("UPDATE gestao.votacoes SET idade_limite = 0 WHERE idade_limite IS NULL");
            System.out.println("--- VOTACAO SCHEMA UPDATED SUCCESSFULLY ---");
        } catch (Exception ex) {
            System.err.println("Could not alter votacoes table: " + ex.getMessage());
        }

        try {
            System.out.println("--- ENSURING EVENTOS SCHEMA HAS STATUS ---");
            jdbcTemplate.execute("ALTER TABLE gestao.eventos ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'AGENDADO'");
            jdbcTemplate.execute("UPDATE gestao.eventos SET status = 'AGENDADO' WHERE status IS NULL");
            System.out.println("--- EVENTOS SCHEMA UPDATED SUCCESSFULLY ---");
        } catch (Exception ex) {
            System.err.println("Could not alter eventos table status: " + ex.getMessage());
        }

        try {
            System.out.println("--- ENSURING EVENTOS SCHEMA HAS GRUPO_CONVOCADO_ID ---");
            jdbcTemplate.execute("ALTER TABLE gestao.eventos ADD COLUMN IF NOT EXISTS grupo_convocado_id bigint");
            System.out.println("--- EVENTOS SCHEMA GRUPO_CONVOCADO_ID UPDATED SUCCESSFULLY ---");
        } catch (Exception ex) {
            System.err.println("Could not alter eventos table grupo_convocado_id: " + ex.getMessage());
        }

        try {
            System.out.println("--- CREATING BAZAR MODULE TABLES ---");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.bazar_periodos (" +
                    "id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, " +
                    "nome_bazar VARCHAR(100) NOT NULL, " +
                    "status VARCHAR(20) DEFAULT 'ATIVO', " +
                    "data_inicio TIMESTAMP DEFAULT NOW(), " +
                    "data_fechamento TIMESTAMP" +
                    ")");
            
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.bazar_responsaveis (" +
                    "id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, " +
                    "bazar_id BIGINT REFERENCES gestao.bazar_periodos(id) ON DELETE CASCADE, " +
                    "membro_id BIGINT REFERENCES gestao.membros(id) ON DELETE CASCADE, " +
                    "CONSTRAINT unique_bazar_responsavel UNIQUE (bazar_id, membro_id)" +
                    ")");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.bazar_produtos (" +
                    "id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, " +
                    "bazar_id BIGINT REFERENCES gestao.bazar_periodos(id) ON DELETE CASCADE, " +
                    "titulo VARCHAR(150) NOT NULL, " +
                    "descricao TEXT, " +
                    "preco NUMERIC(10,2) NOT NULL, " +
                    "foto_url TEXT" +
                    ")");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.bazar_vendas (" +
                    "id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, " +
                    "bazar_id BIGINT REFERENCES gestao.bazar_periodos(id) ON DELETE CASCADE, " +
                    "valor_total NUMERIC(10,2) NOT NULL, " +
                    "forma_pagamento VARCHAR(50) NOT NULL, " +
                    "data_venda TIMESTAMP DEFAULT NOW()" +
                    ")");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.bazar_itens_estoque (" +
                    "serial_number VARCHAR(50) PRIMARY KEY, " +
                    "produto_id BIGINT REFERENCES gestao.bazar_produtos(id) ON DELETE CASCADE, " +
                    "status_item VARCHAR(20) DEFAULT 'DISPONIVEL', " +
                    "venda_id BIGINT REFERENCES gestao.bazar_vendas(id) ON DELETE SET NULL, " +
                    "data_atualizacao TIMESTAMP DEFAULT NOW()" +
                    ")");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gestao.balcao_historico (" +
                    "id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, " +
                    "bazar_id BIGINT, " +
                    "membro_id BIGINT REFERENCES gestao.membros(id) ON DELETE SET NULL, " +
                    "acao VARCHAR(100) NOT NULL, " +
                    "descricao TEXT, " +
                    "data_acao TIMESTAMP DEFAULT NOW()" +
                    ")");

            System.out.println("--- BAZAR MODULE TABLES CREATED SUCCESSFULLY ---");
        } catch (Exception ex) {
            System.err.println("Could not create Bazar tables: " + ex.getMessage());
        }

        try {
            List<Membro> membros = membroRepository.findAll();
            boolean modified = false;

            // Load default cargo if needed (Cargo 3 represents "Membro")
            Cargo defaultCargo = cargoRepository.findById(3L).orElse(null);
            if (defaultCargo == null) {
                List<Cargo> allCargos = cargoRepository.findAll();
                if (!allCargos.isEmpty()) {
                    defaultCargo = allCargos.get(0);
                }
            }

            for (Membro m : membros) {
                boolean mModified = false;
                
                if (m.getCpf() == null || m.getCpf().trim().isEmpty()) {
                    // Generate a unique 11-digit CPF based on member ID
                    String generatedCpf = String.format("999%08d", m.getId());
                    m.setCpf(generatedCpf);
                    mModified = true;
                }
                
                if (m.getStatusCadastro() == null || m.getStatusCadastro().trim().isEmpty()) {
                    m.setStatusCadastro("Ativo");
                    mModified = true;
                }
                
                if (m.getDataNascimento() == null) {
                    m.setDataNascimento(LocalDate.of(2000, 1, 1));
                    mModified = true;
                }
                
                if (m.getDataAdesao() == null) {
                    m.setDataAdesao(LocalDate.of(2020, 1, 1));
                    mModified = true;
                }
                
                if (m.getSexo() == null || m.getSexo().trim().isEmpty()) {
                    m.setSexo("Masculino");
                    mModified = true;
                }
                
                if (m.getCargo() == null && defaultCargo != null) {
                    m.setCargo(defaultCargo);
                    mModified = true;
                }

                if (mModified) {
                    membroRepository.save(m);
                    modified = true;
                }
            }

            if (modified) {
                membroRepository.flush();
                System.out.println("--- MEMBERS SANITIZED AND NULL FIELDS POPULATED ---");
            } else {
                System.out.println("--- NO MEMBERS HAD NULL FIELDS TO SANITIZE ---");
            }
        } catch (Exception e) {
            System.err.println("Failed to sanitize members database: " + e.getMessage());
        }
    }
}
