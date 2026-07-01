package com.suaempresa.gestao.domain.dto;

import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.entity.MembroGrupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record MembroDetalhadoDTO(
        Long id,
        String matricula,
        String nomeCompleto,
        String whatsapp,
        String email,
        String fotoPerfilUrl,
        String statusCadastro,
        LocalDate dataAdesao,
        LocalDate dataNascimento,
        String sexo,
        String cpf,
        String rg,
        String tituloCargo,
        String nomeLiderDireto,
        List<String> ministerios,
        List<String> pequenosGrupos,
        Long cargoId,
        Long liderDiretoId,
        List<Long> ministeriosIds,
        List<Long> pequenosGruposIds,
        String observacao) {
    public static MembroDetalhadoDTO fromEntity(Membro m) {
        List<String> ministerios = new ArrayList<>();
        List<String> pequenosGrupos = new ArrayList<>();
        List<Long> ministeriosIds = new ArrayList<>();
        List<Long> pequenosGruposIds = new ArrayList<>();

        if (m.getMembrosGrupos() != null) {
            for (MembroGrupo mg : m.getMembrosGrupos()) {
                if (mg.getGrupo() != null) {
                    if (mg.getGrupo().getTipoGrupo() == TipoGrupo.MINISTERIO) {
                        ministerios.add(mg.getGrupo().getNomeGrupo());
                        ministeriosIds.add(mg.getGrupo().getId());
                    } else if (mg.getGrupo().getTipoGrupo() == TipoGrupo.PEQUENO_GRUPO
                            || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADE_INTERNA
                            || mg.getGrupo().getTipoGrupo() == TipoGrupo.SOCIEDADES_INTERNAS) {
                        pequenosGrupos.add(mg.getGrupo().getNomeGrupo());
                        pequenosGruposIds.add(mg.getGrupo().getId());
                    }
                }
            }
        }

        return new MembroDetalhadoDTO(
                m.getId(),
                m.getId() != null ? String.format("%04d", m.getId()) : null,
                m.getNomeCompleto(),
                m.getWhatsapp(),
                m.getEmail(),
                m.getFotoPerfilUrl(),
                m.getStatusCadastro(),
                m.getDataAdesao(),
                m.getDataNascimento(),
                m.getSexo(),
                m.getCpf(),
                m.getRg(),
                m.getCargo() != null ? m.getCargo().getTitulo() : null,
                m.getLiderDireto() != null ? m.getLiderDireto().getNomeCompleto() : null,
                ministerios,
                pequenosGrupos,
                m.getCargo() != null ? m.getCargo().getId() : null,
                m.getLiderDireto() != null ? m.getLiderDireto().getId() : null,
                ministeriosIds,
                pequenosGruposIds,
                m.getObservacao());
    }
}
