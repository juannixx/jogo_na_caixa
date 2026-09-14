# Jogo na Caixa

Site de aluguel de jogos de tabuleiro: catálogo público, reserva sem cadastro e fechamento pelo WhatsApp.

## Estado

Concepção concluída. Design em alta fidelidade e plano de implementação prontos; a aplicação ainda não foi escrita.

## Documentação

| Documento | Conteúdo |
|---|---|
| [Design do sistema](docs/superpowers/specs/2026-09-14-jogo-na-caixa-design.md) | Arquitetura, modelo de dados, telas, decisões e escopo |
| [Brief de design](docs/design/brief-claude-design.md) | Objetivo, marca, paleta, telas e componentes, autocontido para prototipação |
| [Pesquisa de concorrente](docs/pesquisa/2026-09-14-acervo-de-jogos.md) | O que foi levantado no acervodejogos.com.br |
| [Handoff de design](docs/design_handoff_jogo_na_caixa/README.md) | Tokens, componentes e telas em alta fidelidade |
| [Plano: fundação e catálogo](docs/superpowers/plans/2026-09-14-fundacao-e-catalogo-publico.md) | 13 tarefas com testes, da fundação às três telas públicas |

## Preview do design

Os artboards são publicados no GitHub Pages a cada push:

- `main`: https://juannixx.github.io/jogo_na_caixa/
- pull request: `https://juannixx.github.io/jogo_na_caixa/pr-<número>/`, com a URL comentada automaticamente no PR

O preview cobre Home, Acervo e Ficha do jogo, em desktop 1440 e mobile 390, mais a biblioteca de componentes. É o design, não a aplicação: quando o site existir, o preview da aplicação vem da Vercel, porque GitHub Pages só serve arquivos estáticos e o site usa renderização no servidor.

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
