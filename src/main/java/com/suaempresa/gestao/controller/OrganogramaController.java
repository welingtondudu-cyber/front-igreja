package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.OrganogramaNodeDTO;
import com.suaempresa.gestao.service.OrganogramaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organograma")
@RequiredArgsConstructor
@Tag(name = "Organograma", description = "API para visualização hierárquica da estrutura de liderança da igreja")
public class OrganogramaController {

    private final OrganogramaService organogramaService;

    @GetMapping
    @Operation(summary = "Obter estrutura do organograma", description = "Retorna a estrutura completa de liderança e liderados da igreja em formato de árvore.")
    public ResponseEntity<List<OrganogramaNodeDTO>> obterOrganograma() {
        return ResponseEntity.ok(organogramaService.obterOrganograma());
    }
}
