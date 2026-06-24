package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record MembroFormDTO(
        String nomeCompleto,
        String whatsapp,
        String email,
        String fotoPerfilUrl,
        String statusCadastro,
        LocalDate dataAdesao,
        LocalDate dataNascimento,
        String sexo,
        String cpf,
        Long cargoId,
        Long liderDiretoId,
        java.util.List<Long> ministeriosIds,
        java.util.List<Long> pequenosGruposIds,
        String observacao
) {
}
