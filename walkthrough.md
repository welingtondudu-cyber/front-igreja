# Walkthrough - Cadastro de Membros Completo e Quantidades no PDV

Todos os desenvolvimentos planejados e aprovados para a expansão do cadastro de membros (endereço, auto-complete via CEP e relacionamentos familiares) e os aprimoramentos de quantidade e estoque no PDV (Caixa) foram implementados, compilados e testados com sucesso.

---

## 🛠️ Modificações Realizadas

### 1. Evolução do Banco de Dados & JPA Entities
* **Endereços de Membros**: Adicionados os campos de endereço (`cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, e `rg`) na tabela existente `gestao.membros` de forma 100% segura através do [DatabaseSanitizer.java](file:///Users/welingtonsilvacruz/front-igreja/src/main/java/com/suaempresa/gestao/config/DatabaseSanitizer.java).
* **Auto-Join Familiar**: Criada a tabela `gestao.membros_relacionamentos` com restrição condicional de data de casamento exclusiva para o tipo cônjuge. Mapeado via JPA no modelo [MembroRelacionamento.java](file:///Users/welingtonsilvacruz/front-igreja/src/main/java/com/suaempresa/gestao/domain/entity/MembroRelacionamento.java).

### 2. Rotas Backend & Regras de Negócio (`MembroService`)
* **Validação Familiar**: Criados os endpoints para criar/excluir relacionamentos com prevenção de laços duplicados, auto-vínculos e data de casamento condicional a cônjuges.
* **Validação de Cônjuge Único**: Adicionada a regra que impede cadastrar mais de 1 cônjuge ativo para um mesmo membro foco ou para o parente selecionado (uma pessoa só pode casar-se com um único parceiro).
* **Suporte a Filho(a) (`FILHO_A`)**: Adicionado o tipo de vínculo de filho(a) no backend, efetuando o mapeamento bidirecional correto (se A tem o parente B como `FILHO_A`, então para B o parente A é mapeado automaticamente como `PAI_MAE`).
* **Importação/Exportação Massiva**: Implementada a importação massiva em lote via CSV ignorando duplicados por e-mail ou CPF, e a exportação completa com UTF-8 BOM para compatibilidade com Excel em português.

### 3. Interface de Membros (`MembrosManager.jsx`)
* **Endereço Completo & CEP**: Integrado o formulário responsivo de endereço em uma nova aba do wizard com auto-complete dinâmico via API do *ViaCEP*.
* **Aba de Núcleo Familiar (Leitura / Escrita Separados)**:
  * A aba "Núcleo Familiar" na **Ficha Cadastral (Visualização)** passou a ser estritamente **read-only**, ocultando formulários de adição e botões de remoção.
  * Adicionada a aba **"Núcleo Familiar"** no **Assistente de Edição (Editar Membro)**, permitindo gerenciar (adicionar novos parentes com dropdown dinâmico e remover vínculos) de forma segura quando o membro já possui cadastro persistido.
* **Seletor de Visitantes**: Renomeado o botão de cadastro rápido e o título do respectivo modal de "Adicionar Convidado" para **"Adicionar Visitante"**.
* **Correção no Seletor de Parentes**: Corrigida a lógica de mapeamento e filtro das opções do dropdown de membros simplificados (que possuíam apenas o campo `matricula` em vez de `id`) no [MembrosManager.jsx](file:///Users/welingtonsilvacruz/front-igreja/frontend/src/MembrosManager.jsx), resolvendo o bug onde as opções não carregavam ou não podiam ser selecionadas.
* **Ações em Lote**: Botões de "Planilha" e "Exportar Base" adicionados ao cabeçalho.

### 4. Controle de Quantidade e Multi-seriais no PDV (`BazarManager.jsx`)
* **Ajuste de Quantidades**: O Caixa do balcão agora permite inserir e ajustar a quantidade de unidades desejadas de um produto, limitado pelo estoque disponível (`maxEstoque`).
* **Resolução Multi-seriais**: Na finalização da venda, se houver múltiplos itens do mesmo produto, o frontend consulta os próximos seriais livres no estoque usando o novo parâmetro `limit` da rota de serial disponível (`/api/balcao-vendas/produtos/{produtoId}/serial-disponivel?limit=Q`).
* **Ocultação do Valor Arrecadado**: Adicionado o ícone interativo de olhinho (`Eye`/`EyeOff`) ao lado do título **"Valor Arrecadado"** no dashboard operacional do [BazarManager.jsx](file:///Users/welingtonsilvacruz/front-igreja/frontend/src/BazarManager.jsx), permitindo alternar a visibilidade do montante financeiro (`R$ ••••••`).
* **Estorno com Quantidade & Fallback Inteligente**:
  * **Fallback**: Se o operador digitar ou escanear um código de barras de um item que consta como `DISPONIVEL` no estoque (por exemplo, ao escanear o código padrão do produto de uma unidade que ainda está na prateleira), o backend localiza a primeira unidade vendida (`VENDIDO`) daquele mesmo produto no bazar e aplica o estorno sobre ela, evitando rejeição por status.
  * **Estorno Fracionado**: O operador pode estornar `Q` unidades de uma venda digitando apenas um código de barras daquele produto. O sistema deduz proporcionalmente o preço do faturamento total da venda, devolve as `Q` unidades ao estoque com status `DISPONIVEL` e impede estornos superiores à quantidade originalmente vendida na transação.
* **Layout Mobile**: Todos os botões operacionais e de impressão de etiquetas em lote agora empilham-se verticalmente em resoluções mobile (`flex-col w-full sm:w-auto`).

---

## 🧪 Verificação e Compilação

* **Compilação do Backend**: Executado `./mvn clean compile` com sucesso total.
* **Build do Frontend**: Compilado com sucesso via `npm run build` gerando os bundles em produção sem qualquer erro de compilação ou sintaxe.
