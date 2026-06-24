package com.suaempresa.gestao.repository;

import com.suaempresa.gestao.domain.entity.Membro;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class MembroSpecification {

    private MembroSpecification() {}

    public static Specification<Membro> comFiltros(
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            String statusCadastro,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte,
            Long grupoId
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join com cargo (left join para não excluir membros sem cargo)
            Join<Object, Object> cargo = root.join("cargo", JoinType.LEFT);
            // Join com liderDireto
            Join<Object, Object> lider = root.join("liderDireto", JoinType.LEFT);

            // Filtro por ID de grupo/ministério
            if (grupoId != null) {
                Join<Object, Object> membrosGruposJoin = root.join("membrosGrupos");
                predicates.add(cb.equal(membrosGruposJoin.get("grupo").get("id"), grupoId));
            }

            // Filtro por parte do nome (case-insensitive, sem acento não é necessário pois ILIKE já trata)
            if (nome != null && !nome.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("nomeCompleto")),
                        "%" + nome.trim().toLowerCase() + "%"
                ));
            }

            // Filtro por CPF (remove máscara antes de comparar)
            if (cpf != null && !cpf.isBlank()) {
                String cpfLimpo = cpf.replaceAll("\\D", "");
                predicates.add(cb.like(root.get("cpf"), "%" + cpfLimpo + "%"));
            }

            // Filtro por ID do cargo
            if (cargoId != null) {
                predicates.add(cb.equal(cargo.get("id"), cargoId));
            }

            // Filtro por título do cargo (parte do nome)
            if (tituloCargo != null && !tituloCargo.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(cargo.get("titulo")),
                        "%" + tituloCargo.trim().toLowerCase() + "%"
                ));
            }

            // Filtro por statusCadastro
            if (statusCadastro != null && !statusCadastro.isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("statusCadastro")),
                        statusCadastro.trim().toLowerCase()
                ));
            }

            // Filtro por líder direto (ID)
            if (liderDiretoId != null) {
                predicates.add(cb.equal(lider.get("id"), liderDiretoId));
            }

            // Filtro por período de nascimento
            if (nascimentoDe != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataNascimento"), nascimentoDe));
            }
            if (nascimentoAte != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataNascimento"), nascimentoAte));
            }

            // Distinct para evitar duplicatas por joins
            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
