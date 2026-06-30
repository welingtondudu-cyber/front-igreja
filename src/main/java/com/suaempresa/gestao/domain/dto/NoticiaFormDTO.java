package com.suaempresa.gestao.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record NoticiaFormDTO(
        @NotBlank(message = "O título é obrigatório")
        String titulo,
        
        @NotBlank(message = "O conteúdo é obrigatório")
        String conteudo,
        
        String imagemUrl,
        
        String sociedade
) {}
