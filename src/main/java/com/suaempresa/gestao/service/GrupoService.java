package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.GrupoDTO;
import com.suaempresa.gestao.domain.dto.GrupoFormDTO;
import com.suaempresa.gestao.domain.dto.MembroGrupoDTO;
import com.suaempresa.gestao.domain.entity.Grupo;
import com.suaempresa.gestao.domain.entity.Membro;
import com.suaempresa.gestao.domain.entity.MembroGrupo;
import com.suaempresa.gestao.domain.entity.TipoGrupo;
import com.suaempresa.gestao.exception.RegraNegocioException;
import com.suaempresa.gestao.repository.GrupoRepository;
import com.suaempresa.gestao.repository.MembroGrupoRepository;
import com.suaempresa.gestao.repository.MembroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final MembroRepository membroRepository;
    private final MembroGrupoRepository membroGrupoRepository;

    @Transactional(readOnly = true)
    public List<GrupoDTO> listarGrupos(TipoGrupo tipo) {
        List<Grupo> grupos = grupoRepository.findAllByTipoFetchLider(tipo);
        return grupos.stream()
                .map(GrupoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public GrupoDTO criarGrupo(GrupoFormDTO dto) {
        if (dto.nomeGrupo() == null || dto.nomeGrupo().isBlank()) {
            throw new RegraNegocioException("O nome do grupo é obrigatório");
        }
        if (dto.tipoGrupo() == null) {
            throw new RegraNegocioException("O tipo do grupo é obrigatório");
        }

        Membro lider = null;
        if (dto.liderId() != null) {
            lider = membroRepository.findById(dto.liderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Líder não encontrado"));
        }

        Grupo grupo = Grupo.builder()
                .nomeGrupo(dto.nomeGrupo())
                .lider(lider)
                .tipoGrupo(dto.tipoGrupo())
                .build();

        grupo = grupoRepository.save(grupo);
        return GrupoDTO.fromEntity(grupo);
    }

    @Transactional
    public GrupoDTO atualizarGrupo(Long id, GrupoFormDTO dto) {
        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo não encontrado"));

        if (dto.nomeGrupo() != null && !dto.nomeGrupo().isBlank()) {
            grupo.setNomeGrupo(dto.nomeGrupo());
        }
        if (dto.tipoGrupo() != null) {
            grupo.setTipoGrupo(dto.tipoGrupo());
        }
        if (dto.liderId() != null) {
            Membro lider = membroRepository.findById(dto.liderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Líder não encontrado"));
            grupo.setLider(lider);
        }

        grupo = grupoRepository.save(grupo);
        return GrupoDTO.fromEntity(grupo);
    }

    @Transactional
    public void vincularMembro(Long grupoId, Long membroId) {
        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo não encontrado"));

        Membro membro = membroRepository.findById(membroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        if (membroGrupoRepository.existsByGrupoIdAndMembroId(grupoId, membroId)) {
            throw new RegraNegocioException("Membro já está vinculado a este grupo.");
        }

        MembroGrupo vinculo = MembroGrupo.builder()
                .grupo(grupo)
                .membro(membro)
                .dataEntrada(LocalDate.now())
                .build();

        membroGrupoRepository.save(vinculo);
    }

    @Transactional
    public void desvincularMembro(Long grupoId, Long membroId) {
        MembroGrupo vinculo = membroGrupoRepository.findByGrupoIdAndMembroId(grupoId, membroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo não encontrado"));

        membroGrupoRepository.delete(vinculo);
    }

    @Transactional(readOnly = true)
    public List<MembroGrupoDTO> listarGruposDoMembro(Long membroId) {
        if (!membroRepository.existsById(membroId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado");
        }
        List<Grupo> grupos = membroGrupoRepository.findGruposByMembroId(membroId);
        return grupos.stream()
                .map(MembroGrupoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarMembrosDoGrupo(Long grupoId) {
        if (!grupoRepository.existsById(grupoId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Grupo não encontrado");
        }
        return membroGrupoRepository.findByGrupoIdWithMembro(grupoId).stream()
                .filter(mg -> mg.getMembro() != null)
                .map(mg -> {
                    Map<String, Object> item = new java.util.LinkedHashMap<>();
                    item.put("id", mg.getMembro().getId());
                    item.put("nomeCompleto", mg.getMembro().getNomeCompleto());
                    item.put("tituloCargo", mg.getMembro().getCargo() != null ? mg.getMembro().getCargo().getTitulo() : "Membro");
                    item.put("cargoId", mg.getMembro().getCargo() != null ? mg.getMembro().getCargo().getId() : null);
                    return item;
                })
                .collect(Collectors.toList());
    }
}
