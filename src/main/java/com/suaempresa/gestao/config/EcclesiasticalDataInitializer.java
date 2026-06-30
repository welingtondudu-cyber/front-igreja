package com.suaempresa.gestao.config;

import com.suaempresa.gestao.domain.entity.*;
import com.suaempresa.gestao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Configuration
@Order(4)
@RequiredArgsConstructor
public class EcclesiasticalDataInitializer implements CommandLineRunner {

    private final NoticiaRepository noticiaRepository;
    private final TrilhaRepository trilhaRepository;
    private final TrilhaConteudoRepository trilhaConteudoRepository;
    private final EventoRepository eventoRepository;
    private final EscalaRepository escalaRepository;
    private final MembroRepository membroRepository;
    private final CargoRepository cargoRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed de Notícias
        if (noticiaRepository.count() == 0) {
            List<Noticia> noticias = List.of(
                Noticia.builder()
                    .titulo("Mutirão de Reformas e Limpeza Institucional")
                    .conteudo("Neste sábado teremos nosso mutirão trimestral de manutenção e reformas do templo. Contamos com a participação voluntária de todas as famílias na limpeza, pintura das salas do kids e organização dos depósitos. O café da manhã comunitário será servido às 08h.")
                    .imagemUrl("https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800")
                    .sociedade("TODA_IGREJA")
                    .dataPublicacao(LocalDateTime.now().minusDays(2))
                    .build(),
                Noticia.builder()
                    .titulo("Convocação: Assembleia Geral Extraordinária")
                    .conteudo("O conselho da IP do Ipês convoca todos os membros comungantes ativos para a Assembleia Geral Extraordinária a realizar-se no dia 12 de Julho, após o culto matutino. A pauta única será a eleição dos novos diáconos e a homologação do relatório financeiro consolidado de 2026.")
                    .imagemUrl(null)
                    .sociedade("SAF")
                    .dataPublicacao(LocalDateTime.now().minusDays(1))
                    .build()
            );
            noticiaRepository.saveAll(noticias);
            System.out.println("--- ANÚNCIOS DO MURAL CADASTRADOS ---");
        }

        // 2. Seed de Trilhas e Cursos
        if (trilhaRepository.count() == 0) {
            List<Membro> membros = membroRepository.findAll();
            Membro defaultAtor = membros.isEmpty() ? null : membros.get(0);

            Trilha t1 = Trilha.builder()
                .titulo("Fundamentos da Fé Reformada")
                .descricao("Entenda os pilares históricos, teológicos e bíblicos que estruturam a fé reformada cristã.")
                .tipo("TRILHA")
                .imagemUrl("https://images.unsplash.com/photo-1504052434569-70ad58565b90?w=800")
                .ator(defaultAtor)
                .build();

            Trilha t2 = Trilha.builder()
                .titulo("Pregação: Exposição Bíblica em Romanos")
                .descricao("Série de pregações expositivas ministradas pelo pastor sobre a doutrina da salvação e graça em Romanos.")
                .tipo("PREGACAO")
                .imagemUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800")
                .ator(defaultAtor)
                .build();

            Trilha t3 = Trilha.builder()
                .titulo("Passos no Deserto: Estudos nos Salmos")
                .descricao("Reflexões diárias e devocionais nos Salmos de confiança, louvor e aflição para fortalecer a caminhada.")
                .tipo("DEVOCIONAL")
                .imagemUrl("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800")
                .ator(defaultAtor)
                .build();

            trilhaRepository.saveAll(List.of(t1, t2, t3));

            // Salvar aulas para Trilha 1
            TrilhaConteudo c11 = TrilhaConteudo.builder()
                .trilha(t1)
                .titulo("Sola Scriptura: A Suficiência da Palavra")
                .resumo("Por que as Escrituras Sagradas são a única regra inerrante de fé, prática e revelação divina.")
                .textoCompleto("O princípio protestante da Sola Scriptura afirma que somente as Escrituras são a autoridade final para a fé cristã. Isso significa que concílios, tradições ou revelações humanas não possuem o mesmo peso inerrante do texto canônico.\n\n![A Bíblia Sagrada](https://images.unsplash.com/photo-1504052434569-70ad58565b90?w=600)\n\nNa liturgia reformada, a pregação bíblica ocupa o papel central do culto corporativo. Toda a estrutura de ensino deve derivar diretamente da fiel exposição do texto sagrado.")
                .videoUrl("https://www.youtube.com/watch?v=sola-scriptura")
                .ordem(1)
                .dataCadastro(LocalDateTime.now())
                .ator(defaultAtor)
                .build();

            TrilhaConteudo c12 = TrilhaConteudo.builder()
                .trilha(t1)
                .titulo("Sola Fide: Justificação Somente pela Fé")
                .resumo("A obra expiatória de Cristo como único mérito imputado gratuitamente ao pecador arrependido.")
                .textoCompleto("O pecador é declarado justo diante de Deus baseado puramente nos méritos perfeitos e substitutivos de Jesus Cristo, recebidos de forma passiva mediante a fé, e não por obras, ritos litúrgicos ou indulgências. A fé é o instrumento, e não a causa da salvação.")
                .videoUrl("https://www.youtube.com/watch?v=sola-fide")
                .ordem(2)
                .dataCadastro(LocalDateTime.now())
                .ator(defaultAtor)
                .build();

            // Devocional
            TrilhaConteudo c31 = TrilhaConteudo.builder()
                .trilha(t3)
                .titulo("Salmo 23: O Pastor que nos Guia")
                .resumo("O Senhor é o meu pastor; nada me faltará. Um convite ao descanso na soberania de Deus.")
                .textoCompleto("Ainda que andemos pelo vale da sombra da morte, a sua vara e o seu cajado nos consolam. Este salmo clássico aponta para Jesus, o Bom Pastor, que dá a vida pelas suas ovelhas.")
                .videoUrl(null)
                .ordem(1)
                .dataCadastro(LocalDateTime.now())
                .ator(defaultAtor)
                .build();

            // Conteúdo Solto / Avulso (sem trilha) com PDF e Imagem
            TrilhaConteudo cSolto = TrilhaConteudo.builder()
                .trilha(null)
                .titulo("Manual Prático de Ambientação Litúrgica")
                .resumo("Entenda o significado dos momentos de adoração, confissão e pregação no nosso culto público.")
                .textoCompleto("Nosso culto segue o modelo bíblico-reformado. Iniciamos com adoração focada na transcendência divina. Seguimos com a confissão de pecados e o anúncio do perdão gracioso. Oferecemos dízimos como gratidão e consagração.\n\nhttps://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500\n\nOuvimos a proclamação da Palavra e somos abençoados para o serviço no mundo.")
                .videoUrl(null)
                .pdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                .ordem(1)
                .dataCadastro(LocalDateTime.now())
                .ator(defaultAtor)
                .build();

            trilhaConteudoRepository.saveAll(List.of(c11, c12, c31, cSolto));
            System.out.println("--- CURSOS E DEVOCIONAIS CADASTRADOS ---");
        }

        // 3. Seed de Eventos e Escalas
        if (eventoRepository.count() == 0) {
            List<Cargo> cargosList = cargoRepository.findAll();
            if (cargosList.isEmpty()) {
                cargosList = List.of(
                    cargoRepository.save(Cargo.builder().titulo("Louvor & Adoração").pesoHierarquico(1).build()),
                    cargoRepository.save(Cargo.builder().titulo("Mídia & Sonoplastia").pesoHierarquico(2).build()),
                    cargoRepository.save(Cargo.builder().titulo("Recepção & Diaconato").pesoHierarquico(3).build())
                );
            }

            Evento ev1 = Evento.builder()
                .titulo("Culto de Celebração - Domingo Manhã")
                .data(LocalDate.now().plusDays(6))
                .hora(LocalTime.of(9, 0, 0))
                .observacoes("Chegada das equipes às 08:30 para oração.")
                .imagemUrl(null)
                .cargosNecessarios(cargosList)
                .build();

            Evento ev2 = Evento.builder()
                .titulo("Culto de Celebração - Domingo Noite")
                .data(LocalDate.now().plusDays(6))
                .hora(LocalTime.of(19, 0, 0))
                .observacoes("Passagem de som às 17:30. Portas abrem às 18:30.")
                .imagemUrl(null)
                .cargosNecessarios(List.of(cargosList.get(0), cargosList.get(1)))
                .build();

            eventoRepository.saveAll(List.of(ev1, ev2));

            // Alocar escalas fictícias se houver membros cadastrados
            List<Membro> membrosList = membroRepository.findAll();
            if (!membrosList.isEmpty()) {
                Membro m1 = membrosList.get(0);
                Escala esc1 = Escala.builder()
                    .evento(ev1)
                    .membro(m1)
                    .funcaoEspecifica("Recepção na Entrada")
                    .statusConfirmacao("PENDENTE")
                    .build();

                escalaRepository.save(esc1);
            }
            System.out.println("--- EVENTOS E ESCALAS CADASTRADOS ---");
        }
    }
}
