package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.OrganogramaNodeDTO;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.repository.MembroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganogramaService {

    private final MembroRepository membroRepository;

    @Transactional(readOnly = true)
    public List<OrganogramaNodeDTO> obterOrganograma(
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            String statusCadastro,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte
    ) {
        List<Membro> todosMembros = membroRepository.findAllWithCargoAndLider();

        // Determinar o status de cadastro padrão (ATIVO) caso não seja informado
        final String statusFiltro = (statusCadastro != null && !statusCadastro.isBlank()) 
                ? statusCadastro.trim().toLowerCase() 
                : "ativo";

        // 1. Identificar quais membros batem diretamente com os filtros de busca
        java.util.Set<Long> matchingIds = new java.util.HashSet<>();
        boolean temFiltroBusca = temFiltroAtivo(nome, cpf, cargoId, tituloCargo, liderDiretoId, nascimentoDe, nascimentoAte);

        for (Membro m : todosMembros) {
            if (!temFiltroBusca) {
                // Sem filtros de busca, apenas filtra pelo statusCadastro (ex: ATIVO por padrão)
                if (m.getStatusCadastro() != null && m.getStatusCadastro().equalsIgnoreCase(statusFiltro)) {
                    matchingIds.add(m.getId());
                }
            } else {
                // Com filtros de busca, avalia todos os critérios informados
                if (matchesFilter(m, nome, cpf, cargoId, tituloCargo, statusCadastro, liderDiretoId, nascimentoDe, nascimentoAte)) {
                    matchingIds.add(m.getId());
                }
            }
        }

        // 2. Construir o conjunto de IDs a serem exibidos (membro + líder direto + liderados diretos)
        java.util.Set<Long> targetIds = new java.util.HashSet<>();
        if (temFiltroBusca) {
            for (Membro m : todosMembros) {
                if (matchingIds.contains(m.getId())) {
                    targetIds.add(m.getId());
                    // Sempre inclui o líder direto (se houver)
                    if (m.getLiderDireto() != null) {
                        targetIds.add(m.getLiderDireto().getId());
                    }
                    // Sempre inclui todos os liderados diretos (subordinados)
                    for (Membro sub : todosMembros) {
                        if (sub.getLiderDireto() != null && sub.getLiderDireto().getId().equals(m.getId())) {
                            targetIds.add(sub.getId());
                        }
                    }
                }
            }
        } else {
            // Sem filtros de busca, exibe todos os que deram matching
            targetIds.addAll(matchingIds);
        }

        // 3. Filtrar a lista de membros final
        List<Membro> membrosExibidos = todosMembros.stream()
                .filter(m -> targetIds.contains(m.getId()))
                .collect(Collectors.toList());

        // 4. Criar os nós DTO na memória e armazená-los em um Map indexados por ID
        Map<Long, OrganogramaNodeDTO> nodeMap = membrosExibidos.stream()
                .collect(Collectors.toMap(
                        Membro::getId,
                        m -> new OrganogramaNodeDTO(
                                m.getId(),
                                m.getNomeCompleto(),
                                m.getFotoPerfilUrl(),
                                m.getCargo() != null ? m.getCargo().getTitulo() : null,
                                m.getCargo() != null ? m.getCargo().getPesoHierarquico() : null,
                                new ArrayList<>()
                        )
                ));

        List<OrganogramaNodeDTO> roots = new ArrayList<>();

        // 5. Associar cada subordinado (liderado) ao seu líder direto
        for (Membro m : membrosExibidos) {
            OrganogramaNodeDTO node = nodeMap.get(m.getId());
            Membro lider = m.getLiderDireto();

            if (lider != null && nodeMap.containsKey(lider.getId())) {
                OrganogramaNodeDTO liderNode = nodeMap.get(lider.getId());
                liderNode.liderados().add(node);
            } else {
                // Se o líder não estiver no conjunto exibido, este nó vira raiz no gráfico filtrado
                roots.add(node);
            }
        }

        // 6. Ordenar os nós (peso hierárquico e depois nome alfabético)
        Comparator<OrganogramaNodeDTO> nodeComparator = Comparator.comparing(
                OrganogramaNodeDTO::pesoHierarquico,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).thenComparing(OrganogramaNodeDTO::nomeCompleto);

        roots.sort(nodeComparator);
        nodeMap.values().forEach(node -> node.liderados().sort(nodeComparator));

        return roots;
    }

    private boolean temFiltroAtivo(
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte
    ) {
        return (nome != null && !nome.isBlank())
                || (cpf != null && !cpf.isBlank())
                || cargoId != null
                || (tituloCargo != null && !tituloCargo.isBlank())
                || liderDiretoId != null
                || nascimentoDe != null
                || nascimentoAte != null;
    }

    private boolean matchesFilter(
            Membro m,
            String nome,
            String cpf,
            Long cargoId,
            String tituloCargo,
            String statusCadastro,
            Long liderDiretoId,
            LocalDate nascimentoDe,
            LocalDate nascimentoAte
    ) {
        if (nome != null && !nome.isBlank()) {
            if (m.getNomeCompleto() == null || !m.getNomeCompleto().toLowerCase().contains(nome.trim().toLowerCase())) {
                return false;
            }
        }
        if (cpf != null && !cpf.isBlank()) {
            String cleanCpfParam = cpf.replaceAll("\\D", "");
            String cleanMembroCpf = m.getCpf() != null ? m.getCpf().replaceAll("\\D", "") : "";
            if (!cleanMembroCpf.contains(cleanCpfParam)) {
                return false;
            }
        }
        if (cargoId != null) {
            if (m.getCargo() == null || !m.getCargo().getId().equals(cargoId)) {
                return false;
            }
        }
        if (tituloCargo != null && !tituloCargo.isBlank()) {
            if (m.getCargo() == null || m.getCargo().getTitulo() == null 
                    || !m.getCargo().getTitulo().toLowerCase().contains(tituloCargo.trim().toLowerCase())) {
                return false;
            }
        }
        if (statusCadastro != null && !statusCadastro.isBlank()) {
            if (m.getStatusCadastro() == null 
                    || !m.getStatusCadastro().equalsIgnoreCase(statusCadastro.trim())) {
                return false;
            }
        } else {
            // Filtro padrão: apenas ATIVO se nenhum status for informado
            if (m.getStatusCadastro() == null || !m.getStatusCadastro().equalsIgnoreCase("ativo")) {
                return false;
            }
        }
        if (liderDiretoId != null) {
            if (m.getLiderDireto() == null || !m.getLiderDireto().getId().equals(liderDiretoId)) {
                return false;
            }
        }
        if (nascimentoDe != null) {
            if (m.getDataNascimento() == null || m.getDataNascimento().isBefore(nascimentoDe)) {
                return false;
            }
        }
        if (nascimentoAte != null) {
            if (m.getDataNascimento() == null || m.getDataNascimento().isAfter(nascimentoAte)) {
                return false;
            }
        }
        return true;
    }
}
