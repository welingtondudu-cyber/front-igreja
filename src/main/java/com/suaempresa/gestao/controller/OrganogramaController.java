package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.OrganogramaNodeDTO;
import com.suaempresa.gestao.service.OrganogramaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/organograma")
@RequiredArgsConstructor
@Tag(name = "Organograma", description = "API para visualização hierárquica da estrutura de liderança da igreja")
public class OrganogramaController {

    private final OrganogramaService organogramaService;

    @GetMapping
    @Operation(
            summary = "Obter estrutura do organograma com filtros opcionais", 
            description = "Retorna a estrutura de liderança da igreja em formato de árvore. Se filtros de busca forem passados, exibe apenas os membros correspondentes e, obrigatoriamente, seu líder direto e seus liderados imediatos."
    )
    public ResponseEntity<List<OrganogramaNodeDTO>> obterOrganograma(
            @Parameter(description = "Filtro por parte do nome completo (busca case-insensitive)")
            @RequestParam(required = false) String nome,
            @Parameter(description = "Filtro por CPF (parcial ou completo, ignora caracteres não numéricos)")
            @RequestParam(required = false) String cpf,
            @Parameter(description = "Filtro por ID do cargo")
            @RequestParam(required = false) Long cargoId,
            @Parameter(description = "Filtro por parte do título do cargo")
            @RequestParam(required = false) String tituloCargo,
            @Parameter(description = "Filtro por status do cadastro (ex: ATIVO, INATIVO)")
            @RequestParam(required = false) String statusCadastro,
            @Parameter(description = "Filtro por ID do líder direto")
            @RequestParam(required = false) Long liderDiretoId,
            @Parameter(description = "Filtro por data de nascimento inicial (período - yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoDe,
            @Parameter(description = "Filtro por data de nascimento final (período - yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nascimentoAte
    ) {
        return ResponseEntity.ok(organogramaService.obterOrganograma(
                nome, cpf, cargoId, tituloCargo, statusCadastro,
                liderDiretoId, nascimentoDe, nascimentoAte
        ));
    }
}
