# Jogo na Caixa: brief de design

> Documento autocontido, escrito para alimentar uma ferramenta de design.
> Tudo que é necessário para desenhar as telas está aqui dentro.

---

## 1. O que é o Jogo na Caixa

Uma locadora de jogos de tabuleiro. A pessoa escolhe jogos no site, reserva informando nome, WhatsApp e a data em que quer retirar, e o combinado final (pagamento por PIX, retirada ou entrega) acontece na conversa do WhatsApp.

**O site não processa pagamento.** Ele expõe o acervo, deixa reservar e entrega a conversa pronta ao WhatsApp. Nenhuma tela de cartão, nenhum checkout de e-commerce tradicional.

## 2. O objetivo do site

Três trabalhos, em ordem de importância:

1. **Dar vontade de jogar.** A pessoa chega sem saber qual jogo quer. O site precisa fazer ela imaginar a mesa cheia, os amigos, a noite de sexta. Isso é trabalho visual, não de texto.
2. **Responder "serve pro meu grupo?".** Quantos jogam, quanto tempo dura, é difícil. Essas três respostas precisam estar visíveis antes de qualquer clique.
3. **Levar ao WhatsApp sem atrito.** Da vitrine à conversa em menos de um minuto, pelo celular, sem criar conta.

## 3. Quem usa

**Cliente final.** Adulto de 25 a 45 anos organizando um encontro: família no domingo, amigos no fim de semana, namorado ou namorada numa noite em casa. Na maioria das vezes **não é entusiasta de jogos**, não conhece nomes de designers nem mecânicas, e decide por foto, por número de jogadores e por "parece divertido". Chega pelo Instagram ou pelo Google, quase sempre pelo celular.

**O dono da loja.** Usa o painel administrativo no computador para cadastrar jogos, subir fotos e marcar entregas e devoluções. Precisa de velocidade, não de beleza.

## 4. Tom

Acolhedor e caseiro, não corporativo. A promessa é tempo de qualidade fora da tela, com gente de verdade em volta de uma mesa.

| Buscar | Evitar |
|---|---|
| Caloroso, convidativo, claro | Frio, técnico, corporativo |
| Fotos reais dos jogos na mesa | Renderizações e arte de catálogo genérica |
| Linguagem direta, português coloquial | Jargão de boardgamer, termos em inglês |
| Confiança tranquila | Urgência, contagem regressiva, promoção agressiva |

## 5. Marca

A logo é um dado branco de seis faces sobre uma caixa aberta, composta por um bloco laranja e um bloco azul petróleo que juntos formam as letras J e C. O lettering "JOGO NA CAIXA" é uma sans pesada, levemente condensada, em caixa alta, sobre fundo creme.

### Paleta

| Papel | Hex | Onde usar |
|---|---|---|
| Laranja (ação) | `#E0812F` | Botões Alugar, preços em destaque, elementos ativos |
| Azul petróleo (estrutura) | `#2D6B7D` | Header, títulos, rodapé, ícones |
| Creme (fundo) | `#F1ECE3` | Fundo de toda a página |
| Branco (superfície) | `#FFFFFF` | Cards, campos de formulário, modais |
| Grafite (texto) | `#454545` | Corpo de texto |
| Verde (disponível) | `#3E8E5A` | Selo de jogo disponível |
| Âmbar (indisponível) | `#B87333` | Selo de jogo alugado, com data de retorno |

O creme é o fundo, não o branco. É o que amarra o site à logo e dá o tom caseiro. Os cards são brancos e flutuam sobre o creme.

### Tipografia

- **Títulos:** sans pesada e levemente condensada, em caixa alta nos títulos curtos, acompanhando o lettering da logo.
- **Corpo:** sans neutra e legível, altura de linha generosa.
- **Preços:** mesma família dos títulos, peso máximo. O preço é informação principal, não detalhe.

### Elemento recorrente

O dado da logo é o motivo gráfico do site: indicador de carregamento, marcador de complexidade (um a cinco dados), marcador de lista, estado vazio.

---

## 6. Telas a desenhar

### 6.1 Home

Ordem vertical:

1. **Hero.** Título curto com a promessa, subtítulo de uma linha, busca e um botão para o acervo. Ao fundo, foto real de uma mesa com jogo montado e gente em volta.
2. **Jogos em destaque.** Carrossel horizontal de cards.
3. **Atalhos por ocasião.** Quatro blocos grandes e clicáveis: "2 jogadores", "Para a família", "Festa com a galera", "Rápido, até 30 min". Este bloco existe porque o cliente não sabe o nome do jogo, ele sabe a ocasião.
4. **Como funciona.** Três passos numerados: escolha, reserve, retire e jogue.
5. **Chamada de WhatsApp.** "Não sabe qual escolher? Fala com a gente."

### 6.2 Acervo (catálogo)

Topo com contagem ("71 jogos no acervo") e barra de filtros horizontal e rolável:

`Ordenar` · `Jogadores` · `Duração` · `Complexidade` · `Tags` · `Só disponíveis` · `Mais filtros`

Cada filtro abre um popover no desktop e uma folha inferior no celular. O filtro de jogadores é o mais importante e fica sempre à vista.

Grade de cards: 4 colunas no desktop, 2 no celular.

### 6.3 Card de jogo

O componente mais repetido do site, precisa ser resolvido com cuidado.

```
+----------------------------+
| [Disponivel]               |   selo no canto superior esquerdo
|                            |
|        capa 4:3            |
|                            |
+----------------------------+
| Azul                       |   nome, ate 2 linhas
|                            |
| (2-4)  (45min)  (Leve)     |   pilulas: jogadores, duracao, complexidade
|                            |
| R$ 40 /7 dias    [Alugar]  |   preco a esquerda, acao a direita
+----------------------------+
```

Quando o jogo está alugado, o selo vira âmbar e diz "Volta 18/09", e o botão vira "Avise-me". A pessoa que pode esperar não deve ser perdida.

### 6.4 Ficha do jogo

Duas colunas no desktop, empilhadas no celular.

**Coluna esquerda:** galeria de fotos reais, com miniaturas. A foto principal deve ser do exemplar de verdade, montado, não da arte da caixa.

**Coluna direita, fixa ao rolar:**
- Nome do jogo e faixa de preço (Caixa Média)
- Pílulas: jogadores, duração, idade, complexidade
- Bloco de preço com as duas opções: R$ 40 por 7 dias, R$ 30 por 3 dias
- Botão Alugar, grande e laranja
- Selo de disponibilidade

**Abaixo:** "Sobre o jogo" (descrição em português), ficha técnica (complexidade com barra, designer, categorias, mecânicas) e tags curatoriais.

### 6.5 Carrinho

Lista compacta dos jogos escolhidos (máximo 3), com miniatura, nome, preço e botão de remover.

Seletor de período em destaque, como duas opções grandes lado a lado:

```
+---------------+  +---------------+
|   3 DIAS      |  |   7 DIAS      |
|   R$ 90       |  |   R$ 110      |
+---------------+  +---------------+
```

Total no rodapé e botão "Reservar".

### 6.6 Reserva

Formulário curto, três campos e nada mais: **nome**, **WhatsApp** e **data de retirada**. Resumo do pedido ao lado ou acima. Um botão: "Confirmar reserva".

Sem senha, sem e-mail, sem endereço, sem CPF. Cada campo a mais aqui derruba a conversão.

### 6.7 Confirmação

Tela de sucesso com o código da reserva em destaque, o resumo do que foi reservado, e um botão verde grande de WhatsApp: "Falar no WhatsApp para combinar". Abaixo, em texto menor, os próximos passos: a loja responde, o pagamento é por PIX, e a retirada é combinada na conversa.

### 6.8 Como funciona

Página de texto com os três passos ampliados, prazos (3 ou 7 dias), formas de retirada, e os cuidados esperados com o jogo.

### 6.9 Painel administrativo

Estética diferente do site público: densa, funcional, sem creme, sem fotos grandes. Prioridade é velocidade de operação.

**Lista de jogos.** Tabela com miniatura, nome, tier, e o controle de status editável na própria linha. Marcar entrega ou devolução precisa custar dois cliques.

**Novo jogo.** Campo de busca por nome que consulta a base externa e traz a ficha pronta. O que resta ao operador: escolher a faixa de preço, subir as fotos reais e publicar.

**Reservas.** Lista agrupada por status (nova, confirmada, entregue, devolvida), com botão de WhatsApp do cliente em cada linha.

---

## 7. Comportamento mobile

O celular é o canal principal, então o desenho começa por ele.

- Barra de abas fixa no rodapé: **Início**, **Acervo**, **Carrinho**, **Contato**.
- Botão flutuante de WhatsApp acima da barra de abas, em todas as páginas.
- Filtros abrem como folha inferior, nunca como modal central.
- Alvos de toque de no mínimo 44 pixels.
- O botão Alugar da ficha do jogo gruda no rodapé ao rolar.

---

## 8. Inventário de componentes

Para montar como biblioteca reutilizável:

| Componente | Variações |
|---|---|
| Card de jogo | disponível, alugado, em destaque |
| Selo de status | disponível (verde), volta em (âmbar), manutenção (cinza) |
| Pílula de atributo | jogadores, duração, complexidade, idade |
| Botão | primário (laranja), secundário (contorno), WhatsApp (verde) |
| Bloco de preço | duas opções de período |
| Barra de filtros | popover no desktop, folha inferior no celular |
| Passo numerado | usado em "como funciona" |
| Campo de formulário | texto, telefone, data |
| Estado vazio | sem resultado no filtro, carrinho vazio |
| Barra de abas | só celular |

---

## 9. Restrições

- Português do Brasil em toda a interface.
- Preços em reais, no formato `R$ 40`, sem centavos quando redondo.
- Datas no formato `DD/MM`.
- Períodos de aluguel: somente 3 ou 7 dias.
- Máximo de 3 jogos por reserva.
- Nenhuma tela de pagamento, cartão ou cobrança.
- Nenhuma tela de login, cadastro ou conta para o cliente final.
