# Jogo na Caixa: design do sistema

**Data:** 14/09/2026
**Status:** aprovado, pronto para plano de implementação
**Escopo:** site de aluguel de jogos de tabuleiro para loja única

---

## 1. Objetivo

Colocar no ar o site do Jogo na Caixa, que precisa fazer três coisas:

1. **Expor o acervo.** Cada jogo tem uma página própria, com ficha técnica, fotos reais e preço visível.
2. **Permitir a reserva.** O cliente escolhe os jogos, informa quando quer retirar e deixa o contato, sem criar conta.
3. **Fechar no WhatsApp.** A reserva cai no painel e o cliente é levado ao WhatsApp com a mensagem já montada, onde o pagamento por PIX e a logística de entrega são combinados.

O negócio tem o acervo montado e ainda não realizou a primeira locação. O site é o lançamento da operação, não a digitalização de algo que já roda. Isso significa que o cadastro inicial do acervo é um evento concentrado, e o sistema precisa tornar esse cadastro rápido.

### O que caracteriza sucesso

- O acervo inteiro cadastrado sem digitação manual de ficha técnica.
- Uma reserva pode ser feita pelo celular em menos de um minuto, sem login.
- Marcar entrega e devolução de um jogo leva dois cliques no painel.
- Cada jogo do acervo tem uma página indexável pelo Google.

---

## 2. Pesquisa: o que aprendemos com o acervodejogos.com.br

O concorrente é uma plataforma SaaS multi-loja (Rails + Tailwind, tenant por subdomínio) com 5.518 jogos, 449 lojas e 163 cidades. Não precisamos da camada SaaS, mas o modelo de negócio dele está validado em escala e vale copiar.

A loja analisada em profundidade foi a `decasabgames.acervodejogos.com.br`, com 71 jogos.

### O fluxo de aluguel deles

> Clique em Alugar, checkout, reserva registrada, a loja chama no WhatsApp, pagamento via PIX, retirada ou entrega ou Uber, devolução em 3 ou 7 dias.

**Não existe pagamento online.** O checkout registra a reserva e não cobra nada. Toda a conversão acontece na conversa do WhatsApp. Essa constatação é o que permite tirar gateway de pagamento, antifraude e conciliação do escopo inteiro.

### O modelo de dados deles

Separam a ficha pública do jogo (importada do BoardGameGeek) dos dados da loja (preço, disponibilidade, tags). A ficha traz nome, descrição, capa, faixa de jogadores, duração, idade mínima, complexidade numérica com rótulo, designers, categorias, mecânicas, famílias, nomes alternativos e vídeo de regras.

### A precificação deles

Não precificam jogo a jogo. Usam faixas nomeadas (`Puxadinho`, `Casa de Palha`, `Casa de Madeira`, `Casa de Pedra`, `Padrão`), numa piada com os três porquinhos. Na prática só dois preços circulam no acervo observado: R$ 30 e R$ 40 por 7 dias, com opção de 3 dias mais barata.

### A interface deles

Card do catálogo: capa em 4:3, selo de disponibilidade, nome, pílulas de jogadores, duração e complexidade, preço em destaque e botão Alugar que posta direto no carrinho.

Filtros: ordenação (nome, mais alugados, novidades), número de jogadores de 1 a 8 ou mais com campo livre, toggle de só disponíveis, mecânica, designer, categorias de preço e famílias BGG.

Mobile é o canal principal: barra de abas fixa no rodapé e botão flutuante de WhatsApp em todas as páginas.

### O que faremos diferente

| Ponto | Concorrente | Jogo na Caixa |
|---|---|---|
| Fotos | Arte oficial da caixa, igual em toda loja | Fotos do exemplar real, montado na mesa |
| Conta de cliente | Cadastro com senha antes de reservar | Nenhuma conta, só nome e WhatsApp |
| Filtros | Mecânica e designer em destaque | Número de jogadores em destaque, mecânica recolhida |
| Indisponível | Selo genérico | Data prevista de retorno e lista de espera |

---

## 3. Decisões tomadas

| Decisão | Escolha | Consequência |
|---|---|---|
| Estágio | Acervo pronto, sem locações ainda | Importação de ficha técnica é obrigatória, não opcional |
| Fluxo do cliente | Carrinho e reserva sem conta | Sem autenticação de cliente; histórico e métricas desde o dia 1 |
| Disponibilidade | Status manual com data de retorno | Back-end é catálogo com estado, não motor de agenda |
| Stack | Next.js e Supabase | Renderização no servidor para SEO local |
| Fonte de dados | Ludopedia, com BGG de reserva | Importador com fonte plugável |

---

## 4. Arquitetura

**Next.js 15** (App Router, TypeScript, Tailwind) com **Supabase** cumprindo três papéis: Postgres, Storage das fotos e Auth exclusivo do painel administrativo. Deploy na Vercel.

### Por que renderização no servidor importa aqui

O negócio é local. Quem busca "alugar jogo de tabuleiro" mais o nome da cidade precisa encontrar o site. Cada ficha de jogo vira uma página estática indexável. O concorrente tem milhares dessas páginas e é assim que ele capta tráfego orgânico.

### Divisão de responsabilidades

```
app/
  (site)/                 páginas públicas, Server Components
  (admin)/                painel, protegido por middleware
  api/
lib/
  supabase/               clientes: anon (leitura pública) e service (escrita)
  catalogo/               consultas e filtros do acervo
  reservas/               criação de reserva e montagem da mensagem
  importadores/           fonte plugável de ficha técnica
```

O importador é o único ponto com dependência externa e fica isolado atrás de uma interface, porque a fonte pode mudar.

### Segurança

RLS ligado em todas as tabelas. A chave anônima lê apenas jogos publicados, fotos, tiers e tags. Reservas e lista de espera são gravadas exclusivamente no servidor, com a chave de serviço, a partir de Server Actions. O cliente nunca escreve direto no banco.

Nenhum dado de pagamento trafega ou é armazenado pelo sistema.

---

## 5. Modelo de dados

O princípio central: separar **a ficha do jogo** (o que a fonte externa sabe) dos **dados da loja** (o que só o Jogo na Caixa sabe).

### `pricing_tiers`

Faixas de preço nomeadas. Mudar o preço da faixa muda o preço de todos os jogos dela.

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid pk | |
| `nome` | text | Caixa Pequena, Caixa Média, Caixa Grande |
| `preco_3_dias` | numeric(10,2) | |
| `preco_7_dias` | numeric(10,2) | |
| `ordem` | int | ordenação na interface |

### `games`

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid pk | |
| `slug` | text unique | usado na URL `/acervo/[slug]` |
| `nome` | text | nome da edição nacional |
| `descricao` | text | em português |
| `capa_url` | text | |
| `min_jogadores` / `max_jogadores` | int | |
| `duracao_min` / `duracao_max` | int | minutos |
| `idade_minima` | int | |
| `complexidade` | numeric(2,1) | 1.0 a 5.0 |
| `complexidade_label` | text | Leve, Médio-leve, Médio, Médio-pesado, Pesado |
| `designers` | text[] | |
| `categorias` | text[] | |
| `mecanicas` | text[] | |
| `ludopedia_id` / `bgg_id` | int | permite reimportar |
| `fonte` | text | `ludopedia`, `bgg` ou `manual` |
| `tier_id` | uuid fk | |
| `status` | text | `disponivel`, `alugado`, `manutencao`, `inativo` |
| `disponivel_em` | date null | data prevista de retorno quando alugado |
| `destaque` | bool | aparece na home |
| `publicado` | bool | controla visibilidade pública |

A disponibilidade mora aqui, em dois campos. O card do catálogo se resolve sozinho entre "Disponível" e "Volta 18/09".

### `game_photos`

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid pk | |
| `game_id` | uuid fk | |
| `url` | text | Supabase Storage |
| `ordem` | int | |
| `legenda` | text null | |

Fotos do exemplar real. É o diferencial competitivo declarado na seção 2.

### `tags` e `game_tags`

Tags curatoriais da loja, separadas das categorias importadas: Festa, Para família, Cooperativo, Solo, Para 2, Rápido, Sem leitura.

### `rentals`

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid pk | |
| `codigo` | text unique | curto e legível, usado na URL de confirmação |
| `cliente_nome` | text | |
| `cliente_whatsapp` | text | |
| `data_retirada` | date | data desejada pelo cliente |
| `periodo_dias` | int | 3 ou 7 |
| `status` | text | `nova`, `confirmada`, `entregue`, `devolvida`, `cancelada` |
| `total` | numeric(10,2) | |
| `observacoes` | text null | |

### `rental_items`

| Coluna | Tipo | Nota |
|---|---|---|
| `rental_id` | uuid fk | |
| `game_id` | uuid fk | |
| `preco` | numeric(10,2) | congelado no momento da reserva |
| `game_nome` | text | snapshot, sobrevive a renomeação |

Preço e nome são copiados, não referenciados. Uma mudança de tier no futuro não pode reescrever o histórico.

### `waitlist`

| Coluna | Tipo | Nota |
|---|---|---|
| `game_id` | uuid fk | |
| `nome` / `whatsapp` | text | |
| `avisado_em` | timestamptz null | |

---

## 6. Telas públicas

| Rota | Conteúdo |
|---|---|
| `/` | Hero, jogos em destaque, como funciona em 3 passos, chamada para WhatsApp |
| `/acervo` | Catálogo com filtros |
| `/acervo/[slug]` | Ficha do jogo, galeria, preço, botão Alugar |
| `/carrinho` | Até 3 jogos, escolha do período (3 ou 7 dias), total |
| `/reserva` | Formulário curto: nome, WhatsApp, data de retirada |
| `/reserva/[codigo]` | Confirmação e botão de WhatsApp com resumo montado |
| `/como-funciona` | Regras, prazos, entrega, cuidados com o jogo |
| `/contato` | WhatsApp, Instagram, endereço |

### Filtros do acervo

Em destaque, na ordem de utilidade real para quem aluga:

1. **Quantos vão jogar.** É sempre a primeira pergunta de quem aluga.
2. Duração.
3. Complexidade.
4. Tags curatoriais.
5. Toggle de só disponíveis.

Recolhidos em "mais filtros": mecânica e designer. Servem ao entusiasta, não ao cliente que quer um jogo para a festa de família.

Ordenação: nome, novidades e mais alugados (esta última só aparece quando houver histórico).

### Comportamento mobile

Mobile primeiro, sem discussão. Barra de abas fixa no rodapé (Início, Acervo, Carrinho, Contato) e botão flutuante de WhatsApp em todas as páginas.

---

## 7. Painel administrativo

Rota `/admin`, protegida por Supabase Auth com um único usuário. Sem cadastro aberto.

| Tela | Função |
|---|---|
| Jogos | Lista com busca e controle de status inline. Dois cliques para marcar entrega e devolução. |
| Novo jogo | Busca por nome na fonte externa, traz ficha e capa prontas. Resta escolher o tier, subir fotos e publicar. |
| Reservas | Lista por status, com botão de WhatsApp do cliente em cada linha. Marcar como devolvida libera o jogo no catálogo. |
| Tiers | Editar preços das faixas. |
| Lista de espera | Quem aguarda qual jogo. |

### A regra que amarra tudo

Mudar o status de uma reserva move o estado dos jogos dela:

- `confirmada` para `entregue`: os jogos viram `alugado` e `disponivel_em` recebe a data de retirada mais o período.
- `entregue` para `devolvida`: os jogos voltam a `disponivel` e `disponivel_em` é limpo.

Isso evita que o operador tenha que atualizar reserva e jogo separadamente, que é onde o erro humano entra.

---

## 8. Fluxo de reserva, passo a passo

1. Cliente navega o acervo e clica em Alugar. O jogo entra no carrinho (limite de 3).
2. No carrinho escolhe o período: 3 ou 7 dias. O total é recalculado.
3. Em `/reserva` informa nome, WhatsApp e data desejada de retirada.
4. A Server Action valida, grava `rentals` e `rental_items` com status `nova` e gera o código.
5. O cliente vai para `/reserva/[codigo]`, que confirma e oferece o botão de WhatsApp.
6. O link abre a conversa com a mensagem pronta:

```
Olá! Quero reservar pelo site:

• Azul (R$ 40)
• Catan (R$ 40)
• Dixit (R$ 30)

Período: 7 dias, a partir de 20/09/2026
Total: R$ 110
Código: JNC-4F2A
```

7. O restante (pagamento por PIX, retirada ou entrega) acontece na conversa, fora do sistema.

A reserva não bloqueia o jogo automaticamente. O bloqueio acontece quando o operador confirma no painel, porque antes disso não há compromisso real do cliente.

---

## 9. Importador de ficha técnica

Interface única, implementações trocáveis:

```ts
interface FonteDeFicha {
  buscar(termo: string): Promise<ResultadoBusca[]>
  detalhar(id: string): Promise<FichaTecnica>
}
```

Implementações previstas: `LudopediaSource` (principal), `BggSource` (reserva), `ManualSource` (sempre disponível como saída).

**Ludopedia** é a base brasileira: descrição já em português, nome da edição nacional, capa da caixa que existe no mercado local. Exige solicitar um token de aplicação.

**BGG** tem API XML pública sem autenticação e cobertura praticamente total, mas o texto vem em inglês e precisa de revisão editorial antes de publicar.

---

## 10. Identidade visual

Derivada da logo (dado branco sobre caixa laranja e azul petróleo, sobre fundo creme).

| Cor | Hex | Uso |
|---|---|---|
| Laranja | `#E0812F` | Ação: botões Alugar, preço em destaque |
| Azul petróleo | `#2D6B7D` | Estrutura: header, títulos, rodapé |
| Creme | `#F1ECE3` | Fundo da página |
| Grafite | `#454545` | Texto |

Tipografia display pesada e levemente condensada nos títulos, acompanhando o lettering de "JOGO NA CAIXA", e uma sans neutra no corpo.

O dado da logo vira elemento recorrente: indicador de carregamento, marcador de complexidade, marcador de lista.

O detalhamento visual para prototipação está em [brief-claude-design.md](../../design/brief-claude-design.md).

---

## 11. Fora de escopo

Nenhum destes é ruim; todos são cedo demais para quem ainda não fez a primeira locação.

| Item | Por que fica de fora |
|---|---|
| Pagamento online | O PIX pelo WhatsApp já fecha a venda, e o gateway traz antifraude e conciliação junto |
| Conta de cliente | Cria atrito exatamente no momento da conversão |
| Calendário com bloqueio automático | Exige motor de conflito e regra de buffer; o volume não justifica |
| Multi-loja | Não é o negócio |
| Quiz de recomendação | Candidato a fase 2 |
| Avaliações e histórico público | Precisa de volume para significar algo |

Primeiros candidatos à fase 2: quiz de recomendação e disparo automático da lista de espera.

---

## 12. Riscos e dependências

| Risco | Mitigação |
|---|---|
| Token da API Ludopedia depende de aprovação de terceiro | Fonte plugável desde o início; BGG e cadastro manual cobrem o intervalo |
| Status manual pode divergir da realidade | Mudança de status da reserva move o jogo automaticamente; operador nunca atualiza os dois |
| Acervo grande e cadastro concentrado no lançamento | Importador reduz cada cadastro a escolher tier, subir fotos e publicar |
| Repositório público expõe estratégia de preços | Decisão do dono; trocar para privado é reversível a qualquer momento |

---

## 13. Próximo passo

Plano de implementação detalhado, via skill `superpowers:writing-plans`.
