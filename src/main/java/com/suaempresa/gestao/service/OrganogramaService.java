package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.OrganogramaNodeDTO;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.repository.MembroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<OrganogramaNodeDTO> obterOrganograma() {
        List<Membro> membros = membroRepository.findAllAtivosWithCargoAndLider();

        // 1. Criar os nós DTO na memória e armazená-los em um Map indexados por ID do membro
        Map<Long, OrganogramaNodeDTO> nodeMap = membros.stream()
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

        // 2. Associar cada subordinado (liderado) ao seu líder direto
        for (Membro m : membros) {
            OrganogramaNodeDTO node = nodeMap.get(m.getId());
            Membro lider = m.getLiderDireto();

            if (lider != null && nodeMap.containsKey(lider.getId())) {
                OrganogramaNodeDTO liderNode = nodeMap.get(lider.getId());
                liderNode.liderados().add(node);
            } else {
                // Se o líder direto for nulo ou não estiver ativo, este nó é uma raiz da hierarquia
                roots.add(node);
            }
        }

        // 3. Definir comparador para ordenar os nós:
        // Primeiro por pesoHierarquico ascendente (menor peso = maior cargo, ex: Pastor com peso 1 no topo, Presbitero com peso 2 abaixo)
        // Valores nulos ou 0 de peso hierárquico vão por último
        // Segundo critério por nomeCompleto (ordem alfabética)
        Comparator<OrganogramaNodeDTO> nodeComparator = Comparator.comparing(
                OrganogramaNodeDTO::pesoHierarquico,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).thenComparing(OrganogramaNodeDTO::nomeCompleto);

        // Ordenar as raízes
        roots.sort(nodeComparator);

        // Ordenar os liderados de cada nó recursivamente
        nodeMap.values().forEach(node -> node.liderados().sort(nodeComparator));

        return roots;
    }
}
