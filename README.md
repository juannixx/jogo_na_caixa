# Jogo na Caixa

🇧🇷 [Leia em português](./README.pt-BR.md)

Board game rental website: public catalog, booking without creating an account, and checkout over WhatsApp.

## Status

Discovery is done. High-fidelity design and the implementation plan are ready; the application itself has not been written yet.

## Documentation (in Portuguese)

| Document | Contents |
|---|---|
| [System design](docs/superpowers/specs/2026-09-14-jogo-na-caixa-design.md) | Architecture, data model, screens, decisions and scope |
| [Design brief](docs/design/brief-claude-design.md) | Goal, brand, palette, screens and components, self-contained for prototyping |
| [Competitor research](docs/pesquisa/2026-09-14-acervo-de-jogos.md) | Findings from acervodejogos.com.br |
| [Design handoff](docs/design_handoff_jogo_na_caixa/README.md) | Tokens, components and high-fidelity screens |
| [Plan: foundation and catalog](docs/superpowers/plans/2026-09-14-fundacao-e-catalogo-publico.md) | 13 test-driven tasks, from the foundation to the three public screens |

## Design preview

The artboards are published to GitHub Pages on every push:

- main: https://juannixx.github.io/jogo_na_caixa/
- pull requests: `https://juannixx.github.io/jogo_na_caixa/pr-<number>/`, with the URL commented on the PR automatically

The preview covers Home, Catalog and Game details, on desktop (1440) and mobile (390), plus the component library. It is the design, not the application: once the site exists, app previews will come from Vercel, since GitHub Pages only serves static files and the site uses server-side rendering.

## How the product works

1. The customer browses the catalog and adds up to 3 games to the cart.
2. Chooses the rental period: 3 or 7 days.
3. Books with name, WhatsApp number and pickup date. No account needed.
4. The booking is saved and the customer is sent to WhatsApp with a prefilled message.
5. Payment (PIX) and logistics are handled in the chat, outside the system.

## Planned stack

Next.js 15 (App Router, TypeScript, Tailwind) and Supabase (Postgres, Storage, Auth for the admin panel). Deployed on Vercel.

## Contributing

Nothing goes straight to `main`. Every change goes through a branch and a pull request.

```bash
git switch -c docs/my-change
# edit
git commit -am "docs: describe the change"
git push -u origin docs/my-change
gh pr create
```

CI validates internal documentation links on every pull request. Once the application exists, the same CI will also run lint, tests and build.
