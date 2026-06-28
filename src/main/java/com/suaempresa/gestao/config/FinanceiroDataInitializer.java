package com.suaempresa.gestao.config;

import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;

@Configuration
@Order(3)
public class FinanceiroDataInitializer implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.jpa.properties.hibernate.default_schema:gestao}")
    private String schema;

    public FinanceiroDataInitializer(
            CategoriaRepository categoriaRepository,
            JdbcTemplate jdbcTemplate) {
        this.categoriaRepository = categoriaRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Criação física de Constraints de FK para restaurar relacionamentos no DER
        criarConstraintsFisicasFk();

        // 2. Seed de Categorias padrão se tabela estiver vazia
        if (categoriaRepository.count() == 0) {
            List<Categoria> defaultCategorias = List.of(
                Categoria.builder().nome("Dízimos").tipoFluxo(TipoFluxo.ENTRADA).build(),
                Categoria.builder().nome("Ofertas").tipoFluxo(TipoFluxo.ENTRADA).build(),
                Categoria.builder().nome("Oferta Missionária").tipoFluxo(TipoFluxo.ENTRADA).build(),
                Categoria.builder().nome("Doações").tipoFluxo(TipoFluxo.ENTRADA).build(),
                Categoria.builder().nome("Eventos/Cantina").tipoFluxo(TipoFluxo.ENTRADA).build(),
                Categoria.builder().nome("Outras Entradas").tipoFluxo(TipoFluxo.ENTRADA).build(),

                Categoria.builder().nome("Pessoal (Salários/Encargos)").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Manutenção/Reformas").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Utilidades (Água, Luz, Internet)").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Missões").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Educação Cristã (EBD)").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Taxas Regimentais").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Material de Escritório").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Eventos").tipoFluxo(TipoFluxo.SAIDA).build(),
                Categoria.builder().nome("Outras Despesas").tipoFluxo(TipoFluxo.SAIDA).build()
            );
            categoriaRepository.saveAll(defaultCategorias);
            System.out.println("--- CATEGORIAS FINANCEIRAS PADRÕES CADASTRADAS ---");
        }
    }

    private void criarConstraintsFisicasFk() {
        try {
            System.out.println("--- VERIFICANDO CONSTRAINTS DE FK (SCHEMA: " + schema + ") ---");

            String plpgsql =
                "DO $$\n" +
                "BEGIN\n" +
                "    -- FK lancamentos -> categorias\n" +
                "    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints\n" +
                "                  WHERE constraint_name = 'fk_lancamento_categoria'\n" +
                "                  AND table_schema = '" + schema + "') THEN\n" +
                "        IF (SELECT COUNT(*) FROM " + schema + ".categorias) > 0 THEN\n" +
                "            -- Limpa referencias invalidas\n" +
                "            UPDATE " + schema + ".lancamentos\n" +
                "            SET categoria_id = (SELECT MIN(id) FROM " + schema + ".categorias)\n" +
                "            WHERE categoria_id IS NULL\n" +
                "               OR categoria_id NOT IN (SELECT id FROM " + schema + ".categorias);\n" +
                "            ALTER TABLE " + schema + ".lancamentos\n" +
                "            ADD CONSTRAINT fk_lancamento_categoria\n" +
                "            FOREIGN KEY (categoria_id) REFERENCES " + schema + ".categorias(id);\n" +
                "        END IF;\n" +
                "    END IF;\n" +
                "\n" +
                "    -- FK lancamentos -> membros (membro_id nullable)\n" +
                "    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints\n" +
                "                  WHERE constraint_name = 'fk_lancamento_membro'\n" +
                "                  AND table_schema = '" + schema + "') THEN\n" +
                "        IF (SELECT COUNT(*) FROM " + schema + ".membros) > 0 THEN\n" +
                "            -- Limpa referencias invalidas (nullable => NULL)\n" +
                "            UPDATE " + schema + ".lancamentos\n" +
                "            SET membro_id = NULL\n" +
                "            WHERE membro_id IS NOT NULL\n" +
                "              AND membro_id NOT IN (SELECT id FROM " + schema + ".membros);\n" +
                "            ALTER TABLE " + schema + ".lancamentos\n" +
                "            ADD CONSTRAINT fk_lancamento_membro\n" +
                "            FOREIGN KEY (membro_id) REFERENCES " + schema + ".membros(id);\n" +
                "        END IF;\n" +
                "    END IF;\n" +
                "\n" +
                "    -- FK fechamentos_mensais -> usuarios (usuario_id nullable update)\n" +
                "    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints\n" +
                "                  WHERE constraint_name = 'fk_fechamento_usuario'\n" +
                "                  AND table_schema = '" + schema + "') THEN\n" +
                "        IF (SELECT COUNT(*) FROM " + schema + ".usuarios) > 0 THEN\n" +
                "            UPDATE " + schema + ".fechamentos_mensais\n" +
                "            SET usuario_id = (SELECT MIN(id) FROM " + schema + ".usuarios)\n" +
                "            WHERE usuario_id IS NULL\n" +
                "               OR usuario_id NOT IN (SELECT id FROM " + schema + ".usuarios);\n" +
                "            ALTER TABLE " + schema + ".fechamentos_mensais\n" +
                "            ADD CONSTRAINT fk_fechamento_usuario\n" +
                "            FOREIGN KEY (usuario_id) REFERENCES " + schema + ".usuarios(id);\n" +
                "        END IF;\n" +
                "    END IF;\n" +
                "\n" +
                "    -- FK historico_reaberturas -> usuarios\n" +
                "    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints\n" +
                "                  WHERE constraint_name = 'fk_reabertura_usuario'\n" +
                "                  AND table_schema = '" + schema + "') THEN\n" +
                "        IF (SELECT COUNT(*) FROM " + schema + ".usuarios) > 0 THEN\n" +
                "            UPDATE " + schema + ".historico_reaberturas\n" +
                "            SET usuario_id = (SELECT MIN(id) FROM " + schema + ".usuarios)\n" +
                "            WHERE usuario_id IS NULL\n" +
                "               OR usuario_id NOT IN (SELECT id FROM " + schema + ".usuarios);\n" +
                "            ALTER TABLE " + schema + ".historico_reaberturas\n" +
                "            ADD CONSTRAINT fk_reabertura_usuario\n" +
                "            FOREIGN KEY (usuario_id) REFERENCES " + schema + ".usuarios(id);\n" +
                "        END IF;\n" +
                "    END IF;\n" +
                "END $$;";

            jdbcTemplate.execute(plpgsql);
            System.out.println("--- CONSTRAINTS DE FK VERIFICADAS COM SUCESSO ---");
        } catch (Exception e) {
            System.err.println("Aviso: Erro ao verificar constraints FK: " + e.getMessage());
        }
    }
}
