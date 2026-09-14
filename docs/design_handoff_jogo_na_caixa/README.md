# Handoff: Jogo na Caixa — site público (rodada 1)

## Visão geral
Site de uma locadora de jogos de tabuleiro. O cliente escolhe jogos, reserva (nome, WhatsApp, data de retirada) e o restante — PIX, retirada ou entrega — é combinado no WhatsApp. **O site não processa pagamento, não tem login nem checkout.**

Esta rodada cobre 3 telas em 2 tamanhos (desktop 1440 / mobile 390) e a biblioteca de componentes:

1. Home
2. Acervo (catálogo com barra de filtros)
3. Ficha do jogo
4. Biblioteca: card de jogo (3 estados + compacto), pílulas, selos, botões, estilos

## Sobre os arquivos de design
Os arquivos `.dc.html` deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, não código de produção para copiar. A tarefa é **recriar estes desenhos no ambiente do projeto** (Next/React, Vue, Astro, etc.) usando os padrões e bibliotecas já existentes; se ainda não houver stack, escolher a mais adequada (recomendação: framework com SSR/SSG para SEO do acervo + rotas dinâmicas por jogo) e implementar lá.

Como ler os arquivos: `Jogo na Caixa - Mockups.dc.html` é o canvas com todos os artboards; `GameCard`, `SiteHeader`, `SiteFooter` e `TabBar` são componentes importados por ele. Todo o estilo está inline nos elementos, então as medidas exatas podem ser lidas direto do HTML.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos e estados são finais e devem ser reproduzidos com precisão. Exceções:
- **Fotos**: as áreas listradas são placeholders. Toda foto deve ser do exemplar real montado na mesa (proporção 4:3), nunca arte da caixa.
- **Marca**: o símbolo do header/rodapé é uma aproximação em blocos (laranja + petróleo + dado). Usar o arquivo oficial da logo.
- **Ícones**: os glifos das pílulas e da barra de abas são formas CSS simples. Podem ser trocados por um set de ícones de linha consistente (2px), mantendo tamanho e cor.

---

## Design tokens

### Cores (usar exatamente)
| Token | Hex | Uso |
|---|---|---|
| `laranja` | `#E0812F` | Botão primário, preços, elementos ativos, etiqueta "Destaque" |
| `laranja-hover` | `#C9711F` | Hover do botão primário |
| `petroleo` | `#2D6B7D` | Header, rodapé, títulos, ícones, botão secundário |
| `creme` | `#F1ECE3` | Fundo de toda a página; fundo das pílulas dentro de cards brancos |
| `branco` | `#FFFFFF` | Cards, campos, popover, folha inferior, barra de abas |
| `grafite` | `#454545` | Texto corrido |
| `grafite-70` | `rgba(69,69,69,.7)` | Texto secundário ("por 7 dias", contagens, notas) |
| `verde` | `#3E8E5A` | Selo Disponível, botão WhatsApp (hover `#357B4E`) |
| `ambar` | `#B87333` | Selo alugado "Volta DD/MM" |
| `cinza` | `#8A857E` | Selo "Em manutenção" |
| `borda` | `rgba(45,107,125,.12)` | Divisórias e bordas sutis |
| `borda-chip` | `rgba(45,107,125,.25)` | Borda dos chips de filtro e tiles |
| `sombra-card` | `0 1px 2px rgba(45,107,125,.05), 0 8px 24px rgba(45,107,125,.08)` | Cards brancos sobre o creme |
| `sombra-popover` | `0 12px 40px rgba(45,107,125,.18), 0 0 0 1px rgba(45,107,125,.08)` | Popover de filtro |
| `scrim` | `rgba(36,74,88,.55)` | Fundo atrás da folha inferior |

### Tipografia
- **Títulos e preços:** `Barlow Semi Condensed` 700/800 (Google Fonts). Títulos curtos em caixa alta, `letter-spacing: .01em`, `line-height: 1` (0.95 em títulos grandes).
- **Corpo e UI:** `Nunito Sans` 400/600/700/800 (Google Fonts), `line-height: 1.5–1.65`.
- Fallback: `sans-serif`.

Escala usada:
| Papel | Fonte | Tamanho / peso |
|---|---|---|
| H1 hero desktop | Barlow SC | 84px / 800, lh .95 |
| H1 hero mobile | Barlow SC | 54px / 800 |
| H1 página (Acervo) | Barlow SC | 56px desktop · 40px mobile / 800 |
| H1 ficha (nome do jogo) | Barlow SC | 60px desktop · 44px mobile / 800 |
| H2 seção | Barlow SC | 40px desktop · 32px mobile / 800 |
| H2 sub (Sobre, Ficha técnica, Tags) | Barlow SC | 32px desktop · 26px mobile / 800 |
| H3 passo / card ocasião | Barlow SC | 26–28px / 700–800 |
| Nome no card | Barlow SC | 22px / 700 (17px compacto) |
| Preço no card | Barlow SC | 28px / 800 (22px compacto), laranja |
| Preço na ficha | Barlow SC | 42px desktop · 34px mobile / 800, laranja |
| Rótulo de período ("7 DIAS") | Barlow SC | 14px / 700, caixa alta, `letter-spacing .1em` |
| Subtítulo hero | Nunito | 20px desktop · 16px mobile / 400 |
| Corpo | Nunito | 16–17px desktop · 15px mobile / 400 |
| Botão | Nunito | 15–16px / 800 (14px no card, 13px compacto) |
| Pílula | Nunito | 12–13px / 700 (11px compacta) |
| Selo | Nunito | 12–13px / 800 |
| Nav | Nunito | 15px / 700 |
| Legenda / nota | Nunito | 12–14px / 600 |

### Espaçamento e forma
- Container desktop: `max-width: 1200px`, centrado (margens de 120px em 1440).
- Padding lateral mobile: 16px (grades) / 20px (textos).
- Ritmo vertical entre seções: 72px desktop · 40px mobile.
- Raios: cards 16–18px · card do card-de-jogo 16px · painel da ficha 20px · botões 12–14px · popover/filtros 16px · folha inferior 24px no topo · chips e selos `999px`.
- Alvo de toque mínimo: 44px (chips mobile 44px, tiles 44–52px, botões 48–56px).

---

## Componentes

### Card de jogo (`GameCard.dc.html`)
Componente mais repetido do site. Card branco, raio 16, `overflow: hidden`, sombra-card, coluna flex com altura 100% (rodapé alinhado entre cards da mesma linha).

**Props:** `gameName`, `players` ("2–4"), `duration` ("45 min"), `complexity` (Leve | Média | Pesada), `price` ("40"), `period` ("7 dias" | "3 dias"), `status` (available | rented | maintenance), `returnDate` ("18/09"), `featured` (bool), `compact` (bool), foto.

**Estrutura (variante regular):**
1. Foto 4:3 (`aspect-ratio: 4/3`), `object-fit: cover`.
   - Selo no canto superior esquerdo (10px, 10px): padding 6px 10px, raio 999, texto branco 12px/800.
     - available → verde "Disponível"
     - rented → âmbar "Volta {DD/MM}"
     - maintenance → cinza "Em manutenção"
   - Se `featured`: etiqueta laranja "Destaque" no canto superior direito, mesmo estilo do selo.
2. Corpo: padding 14px 16px 16px, gap 10px.
   - Nome: Barlow SC 22px/700, caixa alta, petróleo, até 2 linhas.
   - Pílulas (flex, wrap, gap 6): fundo creme, texto grafite 12px/700, padding 6px 10px, raio 999, glifo petróleo de 8–11px à esquerda (jogadores, relógio, dado).
   - Rodapé (flex, `justify-content: space-between`, `align-items: flex-end`, `margin-top: auto`):
     - Preço: "R$ 40" Barlow SC 28px/800 laranja; abaixo "por 7 dias" 12px/600 grafite-70.
     - Botão: available → primário "Alugar" (40px alto, padding 0 18, raio 12); rented/maintenance → secundário "Avise-me" (contorno petróleo 1.5px).

**Variante compacta** (grade mobile de 2 colunas, ~175px): padding 10px 12px 12px, nome 17px, pílulas 11px sem glifo (padding 5px 8px, gap 4), preço 22px, botão 40px alto com padding 0 12 e fonte 13px.

Regra de negócio: jogo alugado nunca desaparece da vitrine — mantém preço e oferece "Avise-me" (captura de interesse; o fluxo do aviso será desenhado depois).

### Pílula de atributo
`inline-flex`, gap 6–7px, fundo creme dentro de cards brancos e **branco quando sobre o creme** da página, texto grafite 12–13px/700, padding 6–8px 10–12px, raio 999. Tipos: jogadores (dois círculos), duração (relógio), complexidade (dado), idade (só texto, "8+").

### Selo de status
Padding 6–7px 10–12px, raio 999, texto branco 12–13px/800. Verde "Disponível" · âmbar "Volta DD/MM" · cinza "Em manutenção".

### Marcador de complexidade (1 a 5 dados)
Cinco quadrados de 18px (15px mobile), raio 5, gap 5. Preenchidos: fundo petróleo com pip branco central de 6px. Vazios: borda 1.5px `rgba(45,107,125,.3)`. Leve = 2, Média = 3, Pesada = 5. Usado na ficha técnica e na biblioteca.

### Botões
| Tipo | Fundo | Texto | Borda | Hover |
|---|---|---|---|---|
| Primário | `#E0812F` | branco 800 | — | `#C9711F` |
| Secundário | transparente | petróleo 800 | 1.5px petróleo | `rgba(45,107,125,.08)` |
| WhatsApp | `#3E8E5A` | branco 800 | — | `#357B4E` |

Alturas: 48px padrão · 40px dentro do card · 52px full-width mobile · 56px "Alugar" da ficha e CTAs do hero. Raio 12 (14 nos de 52–56px). Botão WhatsApp leva glifo de balão à esquerda (gap 10).

### Header (`SiteHeader.dc.html`)
- **Desktop:** faixa petróleo, 76px, container 1200. Esquerda: logo (tile creme 40px raio 10 com o símbolo + "JOGO NA CAIXA" Barlow SC 22px/800 branco, `letter-spacing .06em`). Centro: nav "Acervo · Como funciona · Contato" (15px/700 branco, gap 36); item ativo tem barra laranja 3px embaixo. Direita: botão-pílula "Carrinho" contorno branco 60% com contador laranja (26px, raio 999).
- **Mobile:** barra de status 44px (petróleo) + barra 56px com logo (tile 32px + lettering 18px) e pílula "Carrinho" 36px.

### Rodapé (`SiteFooter.dc.html`)
Petróleo, texto branco. Desktop: padding 56px 0 28px, marca + tagline à esquerda (max 380px), colunas "Navegar" / "Falar com a gente" / "Combinados" (rótulos Barlow SC 14px/700 caixa alta 65% branco; links 15px/600), linha final com © e frase. Mobile: padding 36px 20px **96px** (folga para o botão flutuante de WhatsApp), colunas em duas, © curto.

### Barra de abas (`TabBar.dc.html`, só mobile)
Branca, borda superior `borda`, 4 abas iguais (Início, Acervo, Carrinho, Contato), ícone 22px + rótulo 11px/700; ativa laranja, inativa petróleo; indicador home de 134×5. **Fixa ao rolar.** Acima dela, à direita (16px), botão flutuante WhatsApp: pílula verde 48px, "WhatsApp" 15px/800 com glifo, sombra `0 8px 20px rgba(62,142,90,.35)`. Na ficha ele sobe 88px para ficar acima da barra de Alugar.

### Chip de filtro
Altura 40px desktop · 44px mobile, padding 0 14–16px, raio 999, borda 1.5px `borda-chip`, texto petróleo 14px/700, seta "▾" 11px. Estado aberto/pressionado: fundo e borda petróleo, texto branco, seta "▴". "Só disponíveis" traz um switch (38×22, knob 16px). "Mais filtros" tem borda tracejada.

### Bloco de preço (duas opções)
Dois tiles lado a lado: borda 1.5px `rgba(45,107,125,.18)`, raio 16 (14 mobile), padding 16–18px. Dentro: rótulo "7 DIAS"/"3 DIAS" (Barlow SC 14px/700, `.1em`), preço laranja (42px desktop / 34px mobile), frase curta 12–13px grafite-70 ("Pega na sexta, devolve na outra sexta." / "Pra uma noite ou um fim de semana.").

### Passo numerado
Card branco raio 18, padding 28 (18 mobile). Número em tile petróleo 52px raio 14 (44px/12 mobile), Barlow SC 26px/800 branco; título Barlow SC 26px/700 caixa alta petróleo; texto 16px/1.6.

---

## Telas

### 1. Home
**Desktop (1a)** — ordem vertical, fundo creme:
1. **Hero** 640px alto, fundo petróleo. Foto ocupa `left: 38%` até a direita; sobre tudo um gradiente horizontal `#2D6B7D 0–36% → rgba(45,107,125,.88) 47% → .35 64% → .08 100%`. Conteúdo no container 1200, centrado verticalmente, gap 26: H1 "MAIS MESA, MENOS TELA" (84px, max 640px), subtítulo 20px (max 540px) "Jogos de tabuleiro pra alugar por 3 ou 7 dias. Você escolhe, reserva sem cadastro e combina a retirada pelo WhatsApp.", linha com campo de busca (branco, 56px, raio 14, placeholder "Buscar pelo nome do jogo…", ícone lupa) + botão primário "Ver o acervo" (56px, padding 0 28), total 620px; linha de confiança com marcadores em forma de dado (12px brancos com pip petróleo): "Sem cadastro · Reserva em 1 minuto · PIX direto no WhatsApp".
2. **Em destaque** — H2 + "Os que mais saem por aqui."; à direita link sublinhado "Ver todo o acervo" e dois botões redondos 40px (‹ ›). Carrossel horizontal de cards de 268px, gap 20, sangrando até a borda direita da tela (mostra 4 cards inteiros + 1 parcial). Conteúdo: Azul (destaque), Catan (alugado, volta 18/09), Dixit, Ticket to Ride, 7 Wonders Duel, Codenames.
3. **Pra qual ocasião?** — sub "Você não precisa saber o nome do jogo. Só quem vai estar na mesa." Grade de 4 blocos 240px alto, raio 18, foto de fundo com gradiente petróleo de baixo (`transparent 42% → rgba(45,107,125,.92)`), rótulo Barlow SC 28px/800 branco + contagem 13px: "2 JOGADORES · 18 jogos", "PARA A FAMÍLIA · 24", "FESTA COM A GALERA · 15", "RÁPIDO, ATÉ 30 MIN · 22". Cada bloco leva ao Acervo com o filtro correspondente aplicado.
4. **Como funciona** — sub "Do sofá pra mesa em três passos." Três passos numerados: ESCOLHA ("Filtre por quantas pessoas vão jogar ou pela ocasião. Dá pra levar até 3 jogos de uma vez."), RESERVE ("Nome, WhatsApp e a data de retirada. Sem cadastro, sem cartão, sem senha."), RETIRE E JOGUE ("A gente combina o PIX e a retirada na conversa. Depois é só chamar a galera pra mesa.").
5. **Chamada de WhatsApp** — bloco petróleo raio 24, padding 56px 64px: H2 "NÃO SABE QUAL ESCOLHER?" 44px + texto 18px "Fala com a gente. Conta quantas pessoas vão jogar e a gente sugere um jogo que combina com a sua mesa." + botão WhatsApp 56px "Falar no WhatsApp" (abre `wa.me` com mensagem pré-preenchida).
6. Rodapé.

**Mobile (1b)** — mesma ordem: hero com foto no topo (370px) fundindo para petróleo, H1 54px, campo e botão full-width 52px; carrossel com cards de 250px, gap 12, padding 20 (mostra 1 card + parte do próximo); ocasiões em grade 2×2 de 150px (rótulo 20px); passos empilhados (número à esquerda); CTA WhatsApp em bloco raio 20; rodapé; barra de abas fixa (Início ativo) + WhatsApp flutuante.

### 2. Acervo
**Desktop (1c)**
- Título "ACERVO" 56px + "71 jogos no acervo" 18px; à direita nota 14px "Períodos de 3 ou 7 dias · Até 3 jogos por reserva". A contagem reflete o filtro aplicado (ex.: "38 jogos para 4 pessoas").
- **Barra de filtros**: card branco raio 16, padding 12, chips com gap 8: `Ordenar: Mais alugados ▾` · `Jogadores ▾` · `Duração ▾` · `Complexidade ▾` · `Tags ▾` · `Só disponíveis [switch]` · `Mais filtros` (tracejado). Cada chip abre um **popover** ancorado abaixo (12px), 352px, raio 16, padding 20, sombra-popover. Popover de Jogadores: título Barlow SC 20px "QUANTAS PESSOAS VÃO JOGAR?", 6 tiles 44px (1, 2, 3, 4, 5, 6+; selecionado = laranja com texto branco), nota "Mostramos só os jogos que aceitam esse número de pessoas.", rodapé com link "Limpar" e botão primário "Ver 38 jogos" (o rótulo mostra a contagem resultante). Regra: um jogo aparece se o número escolhido está dentro da faixa min–max de jogadores.
- **Grade**: 4 colunas, gap 24, cards regulares. Abaixo: "Mostrando 8 de 71 jogos" + botão secundário "Carregar mais jogos" (paginação incremental).

**Mobile (1d)**
- Título 40px + contagem 15px. Barra de filtros rolável horizontalmente (chips 44px) com o chip **Jogadores fixo à esquerda** e um divisor 1px; os demais rolam por baixo.
- Grade 2 colunas, gap 12, padding 16, cards **compactos**. "Carregar mais jogos" full-width 48px.
- Filtros abrem como **folha inferior** (segundo quadro de 1d), nunca modal central: scrim `rgba(36,74,88,.55)`, folha branca raio 24 no topo, alça 40×5, título 22px + link "Fechar", 6 tiles de 52px, nota, botões "Limpar" (secundário, flex 1) e "Ver 38 jogos" (primário, flex 1.4), 50px. Deslize para baixo ou toque no scrim fecha.

### 3. Ficha do jogo (exemplo: Azul)
**Desktop (1e)** — breadcrumb "Acervo › Azul" (14px). Grade `minmax(0,1fr) 440px`, gap 48.
- **Coluna esquerda**: foto principal 4:3, raio 20; 5 miniaturas 4:3 em grade (gap 12, raio 10; ativa com contorno 2.5px petróleo). Depois, com gap 56: "SOBRE O JOGO" (32px) com 2 parágrafos 17px/1.65 max 680px; "FICHA TÉCNICA" em card branco raio 18 (grade 200px | 1fr, linhas com padding 16 e divisória `borda`): Complexidade (marcador de dados + "Leve · dá pra aprender jogando"), Jogadores "2 a 4 pessoas", Duração "30 a 45 min", Idade "A partir de 8 anos", Designer "Michael Kiesling", Editora no Brasil "Galápagos Jogos", Categorias "Abstrato · Família", Mecânicas "Coleção de conjuntos · Escolha de peças · Montagem de padrões"; "TAGS": chips brancos com borda (40px, raio 999, petróleo 14px/700): Bonito na mesa, Fácil de ensinar, Bom pra casal, Pra jogar em família, Premiado · Spiel des Jahres 2018 (cada tag leva ao Acervo filtrado).
- **Coluna direita, `position: sticky; top: 24px`**: card branco raio 20, padding 28, gap 20: linha com selo "Disponível" + chip creme "Caixa Média" (quadradinho laranja 10px); H1 "AZUL" 60px; 4 pílulas 13px ("2 a 4 jogadores", "30 a 45 min", "8+", "Leve"); bloco de preço com dois tiles (7 DIAS R$ 40 / 3 DIAS R$ 30); botão primário "Alugar" 56px full-width; nota centralizada 13px "Vai pra sua caixa. Você escolhe o período na hora de reservar. / Até 3 jogos por reserva · Sem cadastro"; divisória e linha "Dúvida se serve pro seu grupo? **Fala com a gente no WhatsApp**" (link sublinhado).

**Mobile (1f)** — link "‹ Acervo" (14px/700 petróleo); foto principal 4:3 full-bleed; 5 miniaturas em linha (gap 8, raio 8); card de informações (margem 16, raio 18, padding 20) com selo + tier, H1 44px, pílulas 12px, tiles de preço lado a lado, nota; seções Sobre / Ficha técnica (grade 118px | 1fr) / Tags; rodapé. **Barra fixa no rodapé** ao rolar: branca, borda superior, sombra para cima, esquerda "R$ 40" 26px laranja + "por 7 dias" e "ou R$ 30 por 3 dias", direita botão primário "Alugar" 50px (min 150px). Acima dela a barra de abas (Acervo ativo) e o WhatsApp flutuante deslocado 88px.

---

## Interações e comportamento
- **Alugar** (card ou ficha) adiciona o jogo ao carrinho (máximo 3; ao atingir 3 o botão fica desabilitado com aviso "Sua caixa já tem 3 jogos"). Contador do header/aba Carrinho atualiza.
- **Avise-me** (jogo alugado/manutenção) abre captura de WhatsApp para aviso quando o jogo voltar — fluxo a desenhar.
- **Filtros**: multi-critério, refletidos na URL (`?jogadores=4&duracao=ate60`), contagem atualizada em tempo real no botão "Ver N jogos". "Limpar" zera só aquele filtro. Popover fecha com Esc/clique fora; folha inferior fecha por arrasto ou scrim.
- **Blocos de ocasião** → Acervo com filtro pré-aplicado (2 jogadores = `jogadores=2`; Família = tag; Festa = `jogadores=6+`; Rápido = `duracao=ate30`).
- **Galeria**: clicar na miniatura troca a foto principal (transição de opacidade 200ms); no mobile, swipe horizontal.
- **Busca**: filtra por nome; sem resultado → estado vazio com o dado da marca (a desenhar).
- **Coluna da ficha** sticky no desktop; no mobile, a barra de preço + Alugar fixa no rodapé.
- **Hover**: botões escurecem conforme a tabela; links ganham cor laranja; cards podem elevar sombra sutilmente (opcional, 150ms ease-out).
- **Carregando**: usar o dado da marca como indicador (motivo recorrente do brief).
- **Responsivo**: desenhado em 1440 e 390; entre eles, a grade do Acervo cai para 3 e 2 colunas (breakpoints sugeridos 1100 e 720), o hero empilha abaixo de 900.

## Estado
- `cart: { items: Game[] (≤3), period: 3 | 7 }` — persistido em `localStorage`.
- `filters: { jogadores, duracao, complexidade, tags[], soDisponiveis, ordenar }` — espelhados na URL.
- `game.status: 'available' | 'rented' | 'maintenance'`, `game.returnDate` (DD/MM) vindo do painel administrativo.
- `game.tier: 'Pequena' | 'Média'` → preços por 7 dias (R$ 30 / R$ 40) e 3 dias (R$ 20 / R$ 30, a confirmar com o dono).

## Formatos e restrições (do brief)
- Português do Brasil em toda a interface; tom caloroso e direto, sem jargão.
- Preços "R$ 40" (sem centavos quando redondo); datas "DD/MM"; períodos só 3 ou 7 dias; máximo 3 jogos por reserva.
- Sem pagamento, cartão, login ou cadastro.
- Alvo de toque mínimo 44px; folha inferior (não modal) no celular.

## Assets
- Fontes: Google Fonts — `Barlow Semi Condensed` (600, 700, 800) e `Nunito Sans` (400–800).
- Logo: fornecer o arquivo oficial (dado branco sobre caixa aberta laranja + petróleo, lettering "JOGO NA CAIXA"). No header ela fica sobre um tile creme.
- Fotos: reais, do exemplar montado na mesa, 4:3; hero com mesa e pessoas; blocos de ocasião com cenas (casal, família, galera, partida rápida).
- Ícones: nenhum set externo usado; glifos em CSS que podem ser substituídos por ícones de linha 2px.

## Arquivos neste pacote
- `Jogo na Caixa - Mockups.dc.html` — canvas com os artboards 1a–1g (Home, Acervo, Ficha × desktop/mobile; Biblioteca).
- `GameCard.dc.html` — card de jogo (props e variantes acima).
- `SiteHeader.dc.html`, `SiteFooter.dc.html`, `TabBar.dc.html` — header, rodapé e barra de abas.
- `image-slot.js`, `support.js` — runtime do protótipo (placeholders de foto e renderização); não portar.
- `brief-claude-design.md` — brief original com telas ainda não desenhadas (Carrinho, Reserva, Confirmação, Como funciona, Painel administrativo).
