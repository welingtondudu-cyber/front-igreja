package com.suaempresa.gestao.domain.dto;

import java.util.List;

public record MembroDashboardDTO(
    long totalMembrosAtivos,
    long totalDiaconos,
    long totalPresbiteros,
    double percentualSociedadeInterna,
    double percentualMinisterio,
    List<AtividadeMinisterioDTO> atividadeMinisterios,
    List<FaixaEtariaDTO> distribuicaoFaixaEtaria,
    List<HistoricoAdmissaoDTO> historicoAdmissoes,
    List<AniversarianteDTO> aniversariantesMes
) {}
