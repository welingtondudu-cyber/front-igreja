package com.suaempresa.gestao.controller;

import com.suaempresa.gestao.domain.dto.OrganogramaNodeDTO;
import com.suaempresa.gestao.service.OrganogramaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organograma")
@RequiredArgsConstructor
public class OrganogramaController {

    private final OrganogramaService organogramaService;

    @GetMapping
    public ResponseEntity<List<OrganogramaNodeDTO>> obterOrganograma() {
        return ResponseEntity.ok(organogramaService.obterOrganograma());
    }
}
