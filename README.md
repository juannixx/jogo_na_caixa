# Jogo na Caixa

Site de aluguel de jogos de tabuleiro: catálogo público, reserva sem cadastro e fechamento pelo WhatsApp.

## Estado

Fase de concepção. Ainda não há aplicação, apenas a documentação de design.

## Documentação

| Documento | Conteúdo |
|---|---|
| [Design do sistema](docs/superpowers/specs/2026-09-14-jogo-na-caixa-design.md) | Arquitetura, modelo de dados, telas, decisões e escopo |
| [Brief de design](docs/design/brief-claude-design.md) | Objetivo, marca, paleta, telas e componentes, autocontido para prototipação |
| [Pesquisa de concorrente](docs/pesquisa/2026-09-14-acervo-de-jogos.md) | O que foi levantado no acervodejogos.com.br |

## Como o produto funciona

1. O cliente navega o acervo e adiciona até 3 jogos ao carrinho.
2. Escolhe o período: 3 ou 7 dias.
3. Reserva informando nome, WhatsApp e data de retirada. Sem criar conta.
4. A reserva é registrada e o cliente vai ao WhatsApp com a mensagem pronta.
5. Pagamento por PIX e logística são combinados na conversa, fora do sistema.

## Stack prevista

Next.js 15 (App Router, TypeScript, Tailwind) e Supabase (Postgres, Storage, Auth do painel). Deploy na Vercel.

## Contribuição

Nada entra direto na `main`. Toda mudança passa por branch e pull request.

```bash
git switch -c docs/minha-mudanca
# edite
git commit -am "docs: descricao da mudanca"
git push -u origin docs/minha-mudanca
gh pr create
```

A CI valida os links internos da documentação a cada pull request. Quando a aplicação existir, a mesma CI passa a rodar lint, testes e build automaticamente.
