# Pesquisa: acervodejogos.com.br

**Data da coleta:** 14/09/2026
**Método:** requisições HTTP diretas e renderização com Playwright, respeitando o `robots.txt` de ambos os domínios. Nenhuma rota proibida foi acessada.

---

## Panorama da plataforma

`acervodejogos.com.br` é um SaaS multi-loja para locadoras de jogos de tabuleiro. Cada loja recebe um subdomínio próprio.

| Métrica | Valor |
|---|---|
| Jogos no catálogo central | 5.518 |
| Lojas cadastradas | 449 |
| Cidades atendidas | 163 |

Stack observada: Rails (cookie de sessão `_jumpstart_app_session`), Tailwind, Active Storage para imagens, Caddy e Cloudflare na borda.

Posicionamento declarado na home: *"O melhor jeito de experimentar um jogo antes de comprar."*

## Loja analisada

`decasabgames.acervodejogos.com.br`, de Florianópolis, com 71 jogos no acervo.

### Rotas, extraídas do robots.txt

```
/boardgames              catálogo público
/boardgames/:slug        ficha do jogo
/sugestao-de-jogos       quiz de 6 perguntas
/cart                    carrinho
/store_front_checkout    checkout
/clients/sign_in         login do cliente
/clients/sign_up         cadastro
/clients/account         conta
/clients/orders          pedidos
/clients/address         endereço
/contract                contrato de locação
/admin                   painel da loja
```

As rotas de `/admin`, `/cart`, `/clients/*`, `/store_front_checkout` e `/contract` são proibidas pelo `robots.txt` e não foram acessadas. O mapa acima vem da leitura do próprio arquivo.

## Fluxo de aluguel

Texto publicado na home da loja, resumido:

1. Solicitar pelo WhatsApp os horários disponíveis, com no mínimo 1 hora de antecedência.
2. Aluguéis de 3 ou 7 dias.
3. Clicar em Alugar nos jogos escolhidos e finalizar na tela de checkout.
4. A reserva é confirmada e a loja entra em contato pelo WhatsApp.
5. Pagamento via PIX, combinado na conversa.
6. Retirada no endereço, entrega agendada ou delivery por Uber.

**Constatação central:** não existe pagamento online. O checkout registra a reserva sem cobrar. Toda a conversão acontece no WhatsApp.

## Modelo de dados observado

A ficha do jogo é claramente importada do BoardGameGeek e separada dos dados comerciais da loja.

**Ficha pública:** nome, slug, descrição em português, capa, galeria, faixa de jogadores, duração, idade mínima, complexidade numérica com rótulo, designers, categorias BGG, mecânicas, famílias, nomes alternativos em vários idiomas, vídeo de regras.

**Dados da loja:** faixa de preço, preço por 3 e por 7 dias, disponibilidade, tags próprias.

## Precificação

Não precificam jogo a jogo. Usam faixas nomeadas, numa piada com os três porquinhos:

`Puxadinho` · `Casa de Palha` · `Casa de Madeira` · `Casa de Pedra` · `Padrão`

No acervo observado, só dois preços circulam de fato:

| Preço por 7 dias | Jogos |
|---|---|
| R$ 40 | 17 |
| R$ 30 | 13 |

A opção de 3 dias é sempre mais barata (exemplo: R$ 30 por 7 dias, R$ 20 por 3 dias).

## Interface

**Card do catálogo:** capa em proporção 4:3, selo de disponibilidade no canto, nome com até duas linhas, pílulas de jogadores, duração e complexidade, preço em destaque e botão Alugar que posta direto no carrinho.

**Filtros disponíveis:** ordenação (nome, mais alugados, novidades), número de jogadores de 1 a 8 ou mais com campo livre, toggle de só disponíveis, mecânica (lista completa do BGG), designer, categorias de preço e famílias BGG.

**Ficha do jogo:** galeria com miniaturas, bloco de preço com as duas opções de período, botão Alugar, descrição, ficha técnica com barra de complexidade, e tags curatoriais.

**Mobile:** barra de abas fixa no rodapé (Home, Acervo, Carrinho, Sugestão, Login) e botão flutuante de WhatsApp em todas as páginas.

## Aprendizados aplicados ao Jogo na Caixa

| Aprendizado | Aplicação |
|---|---|
| Pagamento fora do site funciona em escala | Nenhum gateway no escopo |
| Ficha importada economiza o cadastro | Importador com fonte plugável, Ludopedia primeiro |
| Faixas de preço nomeadas evitam inconsistência | Caixa Pequena, Caixa Média, Caixa Grande |
| Cada jogo vira página indexável | Renderização no servidor, uma rota por jogo |
| Mobile é o canal real | Desenho começa pelo celular |

## Onde vamos divergir

| Ponto | Eles | Nós |
|---|---|---|
| Fotos | Arte oficial da caixa | Exemplar real, montado na mesa |
| Conta de cliente | Senha antes de reservar | Só nome e WhatsApp |
| Filtro em destaque | Mecânica e designer | Número de jogadores |
| Jogo indisponível | Selo genérico | Data de retorno e lista de espera |
