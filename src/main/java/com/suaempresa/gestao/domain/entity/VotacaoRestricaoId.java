package com.suaempresa.gestao.domain.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class VotacaoRestricaoId implements Serializable {
    private Long votacaoId;
    private Long membroId;
}
