package com.suaempresa.gestao.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SequenceFixer implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            entityManager.createNativeQuery("SELECT setval('gestao.votacoes_id_seq', COALESCE((SELECT MAX(id) FROM gestao.votacoes), 1))").getSingleResult();
            entityManager.createNativeQuery("SELECT setval('gestao.votacao_opcoes_id_seq', COALESCE((SELECT MAX(id) FROM gestao.votacao_opcoes), 1))").getSingleResult();
            System.out.println("--- SEQUENCES FIXED SUCCESSFULLY ---");
        } catch (Exception e) {
            System.err.println("Failed to fix sequences: " + e.getMessage());
        }
    }
}
