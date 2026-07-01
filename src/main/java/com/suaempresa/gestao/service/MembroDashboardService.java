package com.suaempresa.gestao.service;

import com.suaempresa.gestao.domain.dto.*;
import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MembroDashboardService {

    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;
    private final GrupoRepository grupoRepository;
    private final MembroGrupoRepository membroGrupoRepository;
    private final EscalaRepository escalaRepository;

    @Transactional(readOnly = true)
    public MembroDashboardDTO obterDashboardConsolidado() {
        // 1. Membros Ativos
        List<Membro> ativos = membroRepository.findAllAtivosWithCargoAndLider();
        long totalMembrosAtivos = ativos.size();

        // 2. Contagem de Diáconos e Presbíteros baseada nos IDs de cargos correspondentes
        List<Cargo> cargos = cargoRepository.findAll();
        Long diaconoCargoId = cargos.stream()
                .filter(c -> c.getTitulo().equalsIgnoreCase("Diácono") || c.getTitulo().toLowerCase().contains("diacono"))
                .map(Cargo::getId)
                .findFirst()
                .orElse(null);

        Long presbiteroCargoId = cargos.stream()
                .filter(c -> c.getTitulo().equalsIgnoreCase("Presbítero") || c.getTitulo().toLowerCase().contains("presbitero"))
                .map(Cargo::getId)
                .findFirst()
                .orElse(null);

        long totalDiaconos = 0;
        long totalPresbiteros = 0;

        for (Membro m : ativos) {
            if (m.getCargo() != null) {
                Long cid = m.getCargo().getId();
                if (diaconoCargoId != null && cid.equals(diaconoCargoId)) {
                    totalDiaconos++;
                } else if (presbiteroCargoId != null && cid.equals(presbiteroCargoId)) {
                    totalPresbiteros++;
                }
            }
        }

        // 3. Percentual de Sociedades Internas e Ministérios
        List<Long> membroIdsSociedade = membroGrupoRepository.findMembroIdsAtivosPorTipoGrupo(TipoGrupo.SOCIEDADE_INTERNA);
        List<Long> membroIdsMinisterio = membroGrupoRepository.findMembroIdsAtivosPorTipoGrupo(TipoGrupo.MINISTERIO);

        double percentualSociedadeInterna = totalMembrosAtivos > 0
                ? (membroIdsSociedade.size() * 100.0) / totalMembrosAtivos
                : 0.0;

        double percentualMinisterio = totalMembrosAtivos > 0
                ? (membroIdsMinisterio.size() * 100.0) / totalMembrosAtivos
                : 0.0;

        // 4. Índice de Atividade por Ministério (Regra Crítica dos 3 Meses)
        List<Grupo> ministerios = grupoRepository.findAllByTipoFetchLider(TipoGrupo.MINISTERIO);
        List<AtividadeMinisterioDTO> atividadeMinisterios = new ArrayList<>();
        LocalDateTime dataLimiteEscalas = LocalDateTime.now().minusDays(90);

        for (Grupo g : ministerios) {
            List<MembroGrupo> membrosGrupo = membroGrupoRepository.findByGrupoIdWithMembro(g.getId());
            int totalMembros = membrosGrupo.size();
            int membrosAtivosNoPeriodo = 0;
            double indiceAtividade = 0.0;

            if (totalMembros > 0) {
                List<Long> membroIds = membrosGrupo.stream().map(mg -> mg.getMembro().getId()).toList();
                List<Long> ativosNaEscala = escalaRepository.findMembrosAtivosNaEscalaNosUltimos90Dias(g.getId(), membroIds, dataLimiteEscalas);
                membrosAtivosNoPeriodo = ativosNaEscala.size();
                indiceAtividade = (membrosAtivosNoPeriodo * 100.0) / totalMembros;
            }

            atividadeMinisterios.add(new AtividadeMinisterioDTO(
                g.getId(),
                g.getNomeGrupo(),
                totalMembros,
                membrosAtivosNoPeriodo,
                indiceAtividade
            ));
        }

        // 5. Distribuição por Faixa Etária
        long faixa0a12 = 0;
        long faixa13a17 = 0;
        long faixa18a35 = 0;
        long faixa36a59 = 0;
        long faixa60mais = 0;
        long totalComIdade = 0;

        LocalDate hoje = LocalDate.now();
        for (Membro m : ativos) {
            if (m.getDataNascimento() != null) {
                int idade = Period.between(m.getDataNascimento(), hoje).getYears();
                totalComIdade++;
                if (idade <= 12) {
                    faixa0a12++;
                } else if (idade <= 17) {
                    faixa13a17++;
                } else if (idade <= 35) {
                    faixa18a35++;
                } else if (idade <= 59) {
                    faixa36a59++;
                } else {
                    faixa60mais++;
                }
            }
        }

        List<FaixaEtariaDTO> distribuicaoFaixaEtaria = List.of(
            new FaixaEtariaDTO("0-12 anos", faixa0a12, totalComIdade > 0 ? (faixa0a12 * 100.0) / totalComIdade : 0.0),
            new FaixaEtariaDTO("13-17 anos", faixa13a17, totalComIdade > 0 ? (faixa13a17 * 100.0) / totalComIdade : 0.0),
            new FaixaEtariaDTO("18-35 anos", faixa18a35, totalComIdade > 0 ? (faixa18a35 * 100.0) / totalComIdade : 0.0),
            new FaixaEtariaDTO("36-59 anos", faixa36a59, totalComIdade > 0 ? (faixa36a59 * 100.0) / totalComIdade : 0.0),
            new FaixaEtariaDTO("60+ anos", faixa60mais, totalComIdade > 0 ? (faixa60mais * 100.0) / totalComIdade : 0.0)
        );

        // 6. Histórico Comparativo de Admissões (Últimos 3 anos, corrente inclusive)
        int anoCorrente = hoje.getYear();
        LocalDate dataInicioBusca = LocalDate.of(anoCorrente - 2, 1, 1);
        List<LocalDate> datasAdesao = membroRepository.findDatasAdesaoDesde(dataInicioBusca);

        Map<String, Long> admissoesMap = new HashMap<>();
        for (LocalDate d : datasAdesao) {
            String key = d.getYear() + "-" + d.getMonthValue();
            admissoesMap.put(key, admissoesMap.getOrDefault(key, 0L) + 1);
        }

        List<HistoricoAdmissaoDTO> historicoAdmissoes = new ArrayList<>();
        String[] nomesMeses = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

        for (int ano = anoCorrente - 2; ano <= anoCorrente; ano++) {
            for (int mes = 1; mes <= 12; mes++) {
                String key = ano + "-" + mes;
                long qtd = admissoesMap.getOrDefault(key, 0L);
                historicoAdmissoes.add(new HistoricoAdmissaoDTO(ano, mes, nomesMeses[mes - 1], qtd));
            }
        }

        // 7. Aniversariantes do Mês
        List<AniversarianteDTO> aniversariantesMes = new ArrayList<>();
        int mesCorrente = hoje.getMonthValue();
        int diaCorrente = hoje.getDayOfMonth();

        for (Membro m : ativos) {
            if (m.getDataNascimento() != null && m.getDataNascimento().getMonthValue() == mesCorrente) {
                boolean isNiverHoje = m.getDataNascimento().getDayOfMonth() == diaCorrente;
                aniversariantesMes.add(new AniversarianteDTO(
                    m.getId(),
                    m.getNomeCompleto(),
                    m.getFotoPerfilUrl(),
                    m.getDataNascimento().getDayOfMonth(),
                    isNiverHoje
                ));
            }
        }

        aniversariantesMes.sort((a, b) -> {
            if (a.isAniversarianteDoDia() && !b.isAniversarianteDoDia()) return -1;
            if (!a.isAniversarianteDoDia() && b.isAniversarianteDoDia()) return 1;
            return Integer.compare(a.dia(), b.dia());
        });

        return new MembroDashboardDTO(
            totalMembrosAtivos,
            totalDiaconos,
            totalPresbiteros,
            percentualSociedadeInterna,
            percentualMinisterio,
            atividadeMinisterios,
            distribuicaoFaixaEtaria,
            historicoAdmissoes,
            aniversariantesMes
        );
    }
}
