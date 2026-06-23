package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Membro;
import java.time.LocalDate;

public record MembroDetalhadoDTO(
        Long id,
        String nomeCompleto,
        String whatsapp,
        String email,
        String fotoPerfilUrl,
        String statusCadastro,
        LocalDate dataAdesao,
        LocalDate dataNascimento,
        String sexo,
        String cpf,
        String tituloCargo,
        String nomeLiderDireto
) {
    public static MembroDetalhadoDTO fromEntity(Membro m) {
        return new MembroDetalhadoDTO(
                m.getId(),
                m.getNomeCompleto(),
                m.getWhatsapp(),
                m.getEmail(),
                m.getFotoPerfilUrl(),
                m.getStatusCadastro(),
                m.getDataAdesao(),
                m.getDataNascimento(),
                m.getSexo(),
                m.getCpf(),
                m.getCargo() != null ? m.getCargo().getTitulo() : null,
                m.getLiderDireto() != null ? m.getLiderDireto().getNomeCompleto() : null
        );
    }
}
