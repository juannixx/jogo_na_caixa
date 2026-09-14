# Fundação e Catálogo Público: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar no ar o catálogo público do Jogo na Caixa (Home, Acervo e Ficha do jogo) em alta fidelidade ao design handoff, com dados reais vindos do Supabase.

**Architecture:** Next.js 15 com App Router. As páginas do catálogo são Server Components que leem do Supabase com a chave anônima; os filtros e o carrinho são estado do cliente, espelhados na URL e no `localStorage`. Os componentes visuais são puros e testados isoladamente, sem acesso a dados, o que mantém o teste rápido e o design reproduzível.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, Supabase (Postgres + Storage), Vitest 3 com Testing Library, Playwright.

**Spec:** [`docs/superpowers/specs/2026-09-14-jogo-na-caixa-design.md`](../specs/2026-09-14-jogo-na-caixa-design.md)

**Design handoff:** [`docs/design_handoff_jogo_na_caixa/README.md`](../../design_handoff_jogo_na_caixa/README.md) (tokens, medidas e specs de componente; é a fonte de verdade visual)

---

## Escopo

**Neste plano:** fundação do projeto, tokens de design, esquema do banco com dados de exemplo, biblioteca de componentes, Home, Acervo com filtros e Ficha do jogo, mais o estado do carrinho (contador e limite de 3), sem a página do carrinho.

**Fora deste plano, porque o design ainda não existe:** páginas de Carrinho, Reserva, Confirmação e Como funciona (rodada 2 do design) e o painel administrativo com o importador de fichas (rodada 3). Enquanto o admin não existe, os jogos entram por `supabase/seed.sql`.

---

## Global Constraints

Valem para toda tarefa deste plano. Copiados literalmente da spec e do handoff.

- Português do Brasil em toda a interface. Tom caloroso e direto, sem jargão de boardgamer.
- Preços no formato `R$ 40`, sem centavos quando o valor for redondo.
- Datas no formato `DD/MM`.
- Períodos de aluguel: somente 3 ou 7 dias.
- Máximo de 3 jogos por reserva.
- Nenhuma tela de pagamento, cartão, login ou cadastro no site público.
- Alvo de toque mínimo de 44px.
- No celular, filtros abrem como folha inferior, nunca como modal central.
- Cores exatas: laranja `#E0812F`, laranja-hover `#C9711F`, petróleo `#2D6B7D`, creme `#F1ECE3`, branco `#FFFFFF`, grafite `#454545`, grafite-70 `rgba(69,69,69,.7)`, verde `#3E8E5A`, verde-hover `#357B4E`, âmbar `#B87333`, cinza `#8A857E`, borda `rgba(45,107,125,.12)`, borda-chip `rgba(45,107,125,.25)`, scrim `rgba(36,74,88,.55)`.
- Sombras: card `0 1px 2px rgba(45,107,125,.05), 0 8px 24px rgba(45,107,125,.08)`; popover `0 12px 40px rgba(45,107,125,.18), 0 0 0 1px rgba(45,107,125,.08)`.
- Fontes: `Barlow Semi Condensed` (600, 700, 800) para títulos e preços; `Nunito Sans` (400 a 800) para corpo e interface.
- Container desktop `max-width: 1200px`, centrado. Padding lateral mobile de 16px em grades e 20px em textos.
- Breakpoints: grade do acervo cai de 4 para 3 colunas em 1100px e para 2 em 720px; o hero empilha abaixo de 900px.
- O fundo da página é creme. Cards brancos flutuam sobre ele. Nunca usar branco como fundo de página.
- Jogo alugado nunca some da vitrine: mantém o preço e troca o botão para "Avise-me".

### Decisões de reconciliação entre spec e handoff

Estas divergências foram resolvidas aqui e valem para todas as tarefas.

| Ponto | Spec | Handoff | Decisão |
|---|---|---|---|
| Valores de status | `disponivel`, `alugado`, `manutencao` | `available`, `rented`, `maintenance` | Português em todo lugar, banco e código, sem camada de tradução |
| Faixas de preço | 3 faixas | 2 observadas | 3 faixas na tabela `pricing_tiers`, populadas por dado e não por código |
| Editora nacional | ausente | "Editora no Brasil: Galápagos Jogos" | Adicionar coluna `editora` em `games` |
| Premiações | ausente | "Premiado · Spiel des Jahres 2018" | Modelar como tag comum, sem campo próprio |

**Questão aberta para o dono:** o handoff registra os preços de 3 dias como "a confirmar". O seed usa R$ 20 (Pequena), R$ 30 (Média) e R$ 35 (Grande). Como são linhas de tabela, mudar depois é edição de dado, não de código.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` | Configuração do projeto |
| `app/globals.css` | Tokens de design como variáveis de tema do Tailwind v4 |
| `app/layout.tsx` | Fontes, `<html lang="pt-BR">`, fundo creme |
| `app/(site)/layout.tsx` | Header, rodapé, barra de abas, botão flutuante de WhatsApp |
| `app/(site)/page.tsx` | Home |
| `app/(site)/acervo/page.tsx` | Catálogo |
| `app/(site)/acervo/[slug]/page.tsx` | Ficha do jogo |
| `lib/types.ts` | Tipos do domínio, uma fonte só |
| `lib/format.ts` | Formatação de preço, data, jogadores, duração |
| `lib/supabase/server.ts` | Cliente de leitura pública |
| `lib/catalog/queries.ts` | Consultas ao banco |
| `lib/catalog/filters.ts` | Estado de filtro, serialização na URL e a regra de correspondência |
| `lib/cart/cart-store.ts` | Carrinho em `localStorage`, limite de 3 |
| `components/ui/*` | Primitivos: botão, pílula, selo, marcador de complexidade, bloco de preço |
| `components/game/GameCard.tsx` | Card de jogo, o componente mais repetido do site |
| `components/layout/*` | Header, rodapé, barra de abas, botão flutuante |
| `components/catalog/*` | Barra de filtros, popover e folha inferior |
| `supabase/migrations/*.sql` | Esquema |
| `supabase/seed.sql` | 8 jogos de exemplo |

---
### Task 1: Fundação do projeto e tokens de design

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`
- Create: `app/globals.css`, `app/layout.tsx`
- Test: `tests/design-tokens.test.ts`

**Interfaces:**
- Consumes: nada, é a primeira tarefa
- Produces: utilitários Tailwind `bg-petroleo`, `text-laranja`, `bg-creme`, `text-grafite`, `bg-verde`, `bg-ambar`, `bg-cinza`, `shadow-card`, `shadow-popover`, `font-display`, `font-corpo`. Scripts `npm run dev`, `npm run build`, `npm test`.

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "jogo-na-caixa",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

Run: `npm install`

- [ ] **Step 2: Criar a configuração**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}

export default config
```

`postcss.config.mjs`:

```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Escrever o teste que falha**

`tests/design-tokens.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync('app/globals.css', 'utf8')

const CORES = {
  '--color-laranja': '#E0812F',
  '--color-laranja-hover': '#C9711F',
  '--color-petroleo': '#2D6B7D',
  '--color-creme': '#F1ECE3',
  '--color-grafite': '#454545',
  '--color-verde': '#3E8E5A',
  '--color-verde-hover': '#357B4E',
  '--color-ambar': '#B87333',
  '--color-cinza': '#8A857E',
}

describe('tokens de design', () => {
  for (const [token, valor] of Object.entries(CORES)) {
    it(`define ${token} como ${valor}`, () => {
      expect(css).toContain(`${token}: ${valor}`)
    })
  }

  it('define as sombras de card e popover', () => {
    expect(css).toContain('--shadow-card:')
    expect(css).toContain('--shadow-popover:')
  })

  it('usa creme como fundo do body, nunca branco', () => {
    expect(css).toMatch(/body\s*\{[^}]*background:\s*var\(--color-creme\)/)
  })
})
```

- [ ] **Step 4: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/design-tokens.test.ts`
Expected: FAIL, porque `app/globals.css` ainda não existe (`ENOENT`).

- [ ] **Step 5: Criar `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-laranja: #E0812F;
  --color-laranja-hover: #C9711F;
  --color-petroleo: #2D6B7D;
  --color-creme: #F1ECE3;
  --color-grafite: #454545;
  --color-verde: #3E8E5A;
  --color-verde-hover: #357B4E;
  --color-ambar: #B87333;
  --color-cinza: #8A857E;

  --font-display: var(--fonte-display), sans-serif;
  --font-corpo: var(--fonte-corpo), sans-serif;

  --shadow-card: 0 1px 2px rgba(45, 107, 125, 0.05), 0 8px 24px rgba(45, 107, 125, 0.08);
  --shadow-popover: 0 12px 40px rgba(45, 107, 125, 0.18), 0 0 0 1px rgba(45, 107, 125, 0.08);
}

:root {
  --cor-grafite-70: rgba(69, 69, 69, 0.7);
  --cor-borda: rgba(45, 107, 125, 0.12);
  --cor-borda-chip: rgba(45, 107, 125, 0.25);
  --cor-scrim: rgba(36, 74, 88, 0.55);
  --container: 1200px;
}

body {
  background: var(--color-creme);
  color: var(--color-grafite);
  font-family: var(--font-corpo);
  -webkit-font-smoothing: antialiased;
}

.container-site {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: 20px;
}
```

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/design-tokens.test.ts`
Expected: PASS, 12 testes.

- [ ] **Step 7: Criar o layout raiz com as fontes**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Barlow_Semi_Condensed, Nunito_Sans } from 'next/font/google'
import './globals.css'

const display = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--fonte-display',
  display: 'swap',
})

const corpo = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--fonte-corpo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jogo na Caixa | Aluguel de jogos de tabuleiro',
  description:
    'Alugue jogos de tabuleiro por 3 ou 7 dias. Escolha, reserve sem cadastro e combine a retirada pelo WhatsApp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Criar também `app/page.tsx` provisório, só para o build ter uma rota:

```tsx
export default function Home() {
  return <main className="container-site py-20">Jogo na Caixa</main>
}
```

- [ ] **Step 8: Confirmar que o build passa**

Run: `npm run build`
Expected: build conclui sem erro, listando a rota `/`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs \
        vitest.config.ts vitest.setup.ts app/globals.css app/layout.tsx app/page.tsx \
        tests/design-tokens.test.ts
git commit -m "feat: fundacao do projeto com tokens de design do handoff"
```

---

### Task 2: Tipos do domínio e formatadores

Funções puras, sem dependência de React ou de banco. São a base de todo componente das tarefas seguintes, e é onde as regras de formatação da spec viram código testável.

**Files:**
- Create: `lib/types.ts`, `lib/format.ts`
- Test: `tests/format.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type StatusJogo = 'disponivel' | 'alugado' | 'manutencao'`
  - `type Complexidade = 'Leve' | 'Média' | 'Pesada'`
  - `type PeriodoDias = 3 | 7`
  - `interface Tier`, `interface Foto`, `interface Jogo`
  - `formatarPreco(valor: number): string`
  - `formatarDataCurta(iso: string): string`
  - `formatarJogadores(min: number, max: number): string`
  - `formatarJogadoresCurto(min: number, max: number): string`
  - `formatarDuracao(min: number, max: number): string`
  - `formatarDuracaoCurta(min: number, max: number): string`
  - `dadosPreenchidos(c: Complexidade): number`
  - `textoSelo(status: StatusJogo, disponivelEm: string | null): string`

- [ ] **Step 1: Escrever o teste que falha**

`tests/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  formatarPreco,
  formatarDataCurta,
  formatarJogadores,
  formatarJogadoresCurto,
  formatarDuracao,
  formatarDuracaoCurta,
  dadosPreenchidos,
  textoSelo,
} from '@/lib/format'

describe('formatarPreco', () => {
  it('omite centavos quando o valor e redondo', () => {
    expect(formatarPreco(40)).toBe('R$ 40')
    expect(formatarPreco(30)).toBe('R$ 30')
  })

  it('mostra centavos com virgula quando existem', () => {
    expect(formatarPreco(39.9)).toBe('R$ 39,90')
    expect(formatarPreco(22.5)).toBe('R$ 22,50')
  })

  it('trata zero como valor redondo', () => {
    expect(formatarPreco(0)).toBe('R$ 0')
  })
})

describe('formatarDataCurta', () => {
  it('converte ISO para DD/MM', () => {
    expect(formatarDataCurta('2026-09-18')).toBe('18/09')
    expect(formatarDataCurta('2026-01-05')).toBe('05/01')
  })

  it('ignora o fuso e nao volta um dia', () => {
    expect(formatarDataCurta('2026-03-01')).toBe('01/03')
  })
})

describe('formatarJogadores', () => {
  it('usa faixa quando min e max diferem', () => {
    expect(formatarJogadores(2, 4)).toBe('2 a 4 jogadores')
  })

  it('usa numero unico quando min e max sao iguais', () => {
    expect(formatarJogadores(2, 2)).toBe('2 jogadores')
  })

  it('usa singular para um jogador so', () => {
    expect(formatarJogadores(1, 1)).toBe('1 jogador')
  })
})

describe('formatarJogadoresCurto', () => {
  it('usa travessao curto para o card', () => {
    expect(formatarJogadoresCurto(2, 4)).toBe('2–4')
    expect(formatarJogadoresCurto(3, 3)).toBe('3')
  })
})

describe('formatarDuracao', () => {
  it('usa faixa quando min e max diferem', () => {
    expect(formatarDuracao(30, 45)).toBe('30 a 45 min')
  })

  it('usa valor unico quando sao iguais', () => {
    expect(formatarDuracao(45, 45)).toBe('45 min')
  })
})

describe('formatarDuracaoCurta', () => {
  it('mostra so o maximo, que e o que cabe no card', () => {
    expect(formatarDuracaoCurta(30, 45)).toBe('45 min')
    expect(formatarDuracaoCurta(90, 90)).toBe('90 min')
  })
})

describe('dadosPreenchidos', () => {
  it('mapeia a complexidade para a quantidade de dados cheios', () => {
    expect(dadosPreenchidos('Leve')).toBe(2)
    expect(dadosPreenchidos('Média')).toBe(3)
    expect(dadosPreenchidos('Pesada')).toBe(5)
  })
})

describe('textoSelo', () => {
  it('diz Disponivel quando o jogo esta livre', () => {
    expect(textoSelo('disponivel', null)).toBe('Disponível')
  })

  it('mostra a data de retorno quando esta alugado', () => {
    expect(textoSelo('alugado', '2026-09-18')).toBe('Volta 18/09')
  })

  it('cai para texto generico se estiver alugado sem data', () => {
    expect(textoSelo('alugado', null)).toBe('Alugado')
  })

  it('identifica manutencao', () => {
    expect(textoSelo('manutencao', null)).toBe('Em manutenção')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/format.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/format".

- [ ] **Step 3: Criar `lib/types.ts`**

```ts
export type StatusJogo = 'disponivel' | 'alugado' | 'manutencao'
export type Complexidade = 'Leve' | 'Média' | 'Pesada'
export type PeriodoDias = 3 | 7

export interface Tier {
  id: string
  nome: string
  preco3Dias: number
  preco7Dias: number
  ordem: number
}

export interface Foto {
  url: string
  legenda: string | null
}

export interface Jogo {
  id: string
  slug: string
  nome: string
  descricao: string
  capaUrl: string | null
  minJogadores: number
  maxJogadores: number
  duracaoMin: number
  duracaoMax: number
  idadeMinima: number
  complexidade: number
  complexidadeLabel: Complexidade
  designers: string[]
  editora: string | null
  categorias: string[]
  mecanicas: string[]
  tier: Tier
  status: StatusJogo
  disponivelEm: string | null
  destaque: boolean
  tags: string[]
  fotos: Foto[]
  criadoEm: string
}
```

- [ ] **Step 4: Criar `lib/format.ts`**

```ts
import type { Complexidade, StatusJogo } from './types'

export function formatarPreco(valor: number): string {
  const redondo = Number.isInteger(valor)
  return redondo
    ? `R$ ${valor}`
    : `R$ ${valor.toFixed(2).replace('.', ',')}`
}

export function formatarDataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

export function formatarJogadores(min: number, max: number): string {
  if (min === max) {
    return min === 1 ? '1 jogador' : `${min} jogadores`
  }
  return `${min} a ${max} jogadores`
}

export function formatarJogadoresCurto(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`
}

export function formatarDuracao(min: number, max: number): string {
  return min === max ? `${min} min` : `${min} a ${max} min`
}

export function formatarDuracaoCurta(min: number, max: number): string {
  return `${max} min`
}

const DADOS_POR_COMPLEXIDADE: Record<Complexidade, number> = {
  Leve: 2,
  'Média': 3,
  Pesada: 5,
}

export function dadosPreenchidos(c: Complexidade): number {
  return DADOS_POR_COMPLEXIDADE[c]
}

export function textoSelo(status: StatusJogo, disponivelEm: string | null): string {
  if (status === 'disponivel') return 'Disponível'
  if (status === 'manutencao') return 'Em manutenção'
  return disponivelEm ? `Volta ${formatarDataCurta(disponivelEm)}` : 'Alugado'
}
```

Nota sobre `formatarDataCurta`: a data é fatiada como texto, de propósito. Usar `new Date('2026-09-18')` interpreta como UTC e, em fuso brasileiro, volta um dia.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/format.test.ts`
Expected: PASS, 17 testes.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/format.ts tests/format.test.ts
git commit -m "feat: tipos do dominio e formatadores de preco, data, jogadores e duracao"
```

---
### Task 3: Esquema do banco, políticas de acesso e dados de exemplo

Enquanto o painel administrativo não existe (rodada 3 do design), os jogos entram pelo seed. O esquema já nasce com as políticas de leitura pública e as restrições de integridade, porque afrouxar isso depois é o tipo de dívida que não se paga.

**Files:**
- Create: `supabase/migrations/001_esquema_inicial.sql`
- Create: `supabase/seed.sql`
- Test: `tests/esquema.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: tabelas `pricing_tiers`, `games`, `game_photos`, `tags`, `game_tags`. Leitura anônima liberada só para jogos com `publicado = true`. Nenhuma política de escrita para a chave anônima.

- [ ] **Step 1: Escrever o teste que falha**

`tests/esquema.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const sql = readFileSync('supabase/migrations/001_esquema_inicial.sql', 'utf8')
const seed = readFileSync('supabase/seed.sql', 'utf8')

describe('esquema', () => {
  it('cria as cinco tabelas do catalogo', () => {
    for (const t of ['pricing_tiers', 'games', 'game_photos', 'tags', 'game_tags']) {
      expect(sql).toContain(`create table ${t}`)
    }
  })

  it('liga row level security em todas as tabelas', () => {
    for (const t of ['pricing_tiers', 'games', 'game_photos', 'tags', 'game_tags']) {
      expect(sql).toContain(`alter table ${t} enable row level security`)
    }
  })

  it('expoe publicamente apenas jogos publicados', () => {
    expect(sql).toMatch(/create policy[^;]*on games\s+for select\s+using \(publicado\)/)
  })

  it('nao concede nenhuma politica de escrita', () => {
    expect(sql).not.toMatch(/for (insert|update|delete)/)
  })

  it('restringe status aos tres valores em portugues', () => {
    expect(sql).toContain("status in ('disponivel', 'alugado', 'manutencao')")
  })

  it('so permite data de retorno quando o jogo esta alugado', () => {
    expect(sql).toContain('data_retorno_so_quando_alugado')
  })

  it('garante faixas coerentes de jogadores e duracao', () => {
    expect(sql).toContain('faixa_jogadores_valida')
    expect(sql).toContain('faixa_duracao_valida')
  })
})

describe('seed', () => {
  it('publica oito jogos', () => {
    const publicados = seed.match(/'jogo-publicado-marcador'/g) ?? []
    expect(publicados.length).toBe(0)
    expect(seed).toContain('Azul')
    expect(seed).toContain('Catan')
  })

  it('cria as tres faixas de preco', () => {
    for (const t of ['Caixa Pequena', 'Caixa Média', 'Caixa Grande']) {
      expect(seed).toContain(t)
    }
  })

  it('deixa um jogo alugado com data de retorno, para exercitar o selo ambar', () => {
    expect(seed).toContain("'alugado'")
    expect(seed).toContain('2026-09-18')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/esquema.test.ts`
Expected: FAIL, `ENOENT` em `supabase/migrations/001_esquema_inicial.sql`.

- [ ] **Step 3: Criar `supabase/migrations/001_esquema_inicial.sql`**

```sql
create extension if not exists "pgcrypto";

create table pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  preco_3_dias numeric(10,2) not null check (preco_3_dias >= 0),
  preco_7_dias numeric(10,2) not null check (preco_7_dias >= 0),
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null default '',
  capa_url text,
  min_jogadores int not null check (min_jogadores >= 1),
  max_jogadores int not null,
  duracao_min int not null check (duracao_min > 0),
  duracao_max int not null,
  idade_minima int not null default 0,
  complexidade numeric(2,1) not null check (complexidade between 1.0 and 5.0),
  complexidade_label text not null check (complexidade_label in ('Leve', 'Média', 'Pesada')),
  designers text[] not null default '{}',
  editora text,
  categorias text[] not null default '{}',
  mecanicas text[] not null default '{}',
  ludopedia_id int,
  bgg_id int,
  fonte text not null default 'manual' check (fonte in ('ludopedia', 'bgg', 'manual')),
  tier_id uuid not null references pricing_tiers(id),
  status text not null default 'disponivel' check (status in ('disponivel', 'alugado', 'manutencao')),
  disponivel_em date,
  destaque boolean not null default false,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faixa_jogadores_valida check (max_jogadores >= min_jogadores),
  constraint faixa_duracao_valida check (duracao_max >= duracao_min),
  constraint data_retorno_so_quando_alugado check (disponivel_em is null or status = 'alugado')
);

create index games_publicado_idx on games (publicado) where publicado;
create index games_status_idx on games (status);
create index games_jogadores_idx on games (min_jogadores, max_jogadores);

create table game_photos (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  url text not null,
  ordem int not null default 0,
  legenda text,
  created_at timestamptz not null default now()
);

create index game_photos_game_idx on game_photos (game_id, ordem);

create table tags (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  slug text not null unique
);

create table game_tags (
  game_id uuid not null references games(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (game_id, tag_id)
);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_updated_at
  before update on games
  for each row execute function set_updated_at();

alter table pricing_tiers enable row level security;
alter table games enable row level security;
alter table game_photos enable row level security;
alter table tags enable row level security;
alter table game_tags enable row level security;

create policy "leitura publica de tiers" on pricing_tiers
  for select using (true);

create policy "leitura publica de jogos publicados" on games
  for select using (publicado);

create policy "leitura publica de fotos" on game_photos
  for select using (exists (select 1 from games g where g.id = game_id and g.publicado));

create policy "leitura publica de tags" on tags
  for select using (true);

create policy "leitura publica de vinculos de tag" on game_tags
  for select using (exists (select 1 from games g where g.id = game_id and g.publicado));
```

Não há política de `insert`, `update` ou `delete`. A chave anônima lê e nada mais. Escrita acontecerá só no servidor, com a chave de serviço, quando o painel existir.

- [ ] **Step 4: Criar `supabase/seed.sql`**

```sql
insert into pricing_tiers (nome, preco_3_dias, preco_7_dias, ordem) values
  ('Caixa Pequena', 20, 30, 1),
  ('Caixa Média',   30, 40, 2),
  ('Caixa Grande',  35, 50, 3);

insert into tags (nome, slug) values
  ('Bonito na mesa', 'bonito-na-mesa'),
  ('Fácil de ensinar', 'facil-de-ensinar'),
  ('Bom pra casal', 'bom-pra-casal'),
  ('Pra jogar em família', 'pra-jogar-em-familia'),
  ('Premiado · Spiel des Jahres 2018', 'premiado-spiel-des-jahres-2018'),
  ('Cooperativo', 'cooperativo'),
  ('Festa com a galera', 'festa-com-a-galera'),
  ('Rápido, até 30 min', 'rapido-ate-30-min'),
  ('Bom pra 2', 'bom-pra-2');

insert into games (
  slug, nome, descricao, min_jogadores, max_jogadores, duracao_min, duracao_max,
  idade_minima, complexidade, complexidade_label, designers, editora,
  categorias, mecanicas, tier_id, status, disponivel_em, destaque, publicado
) values
  ('azul', 'Azul',
   'Azul convida você, um artista em assentamento de azulejos, a decorar as paredes do Palácio Real de Évora. A cada rodada você pega azulejos de uma fábrica e decide onde colocá-los, sabendo que peça errada no lugar errado vira ponto negativo.',
   2, 4, 30, 45, 8, 1.8, 'Leve', '{"Michael Kiesling"}', 'Galápagos Jogos',
   '{"Abstrato","Família"}', '{"Coleção de conjuntos","Escolha de peças","Montagem de padrões"}',
   (select id from pricing_tiers where nome = 'Caixa Média'), 'disponivel', null, true, true),

  ('catan', 'Catan',
   'Você é um colonizador numa ilha recém-descoberta. Colete madeira, tijolo, lã, trigo e minério, negocie com os outros jogadores e construa estradas e cidades antes que alguém chegue lá primeiro.',
   3, 4, 60, 90, 10, 2.3, 'Média', '{"Klaus Teuber"}', 'Devir',
   '{"Estratégia","Família"}', '{"Negociação","Rolagem de dados","Construção de rotas"}',
   (select id from pricing_tiers where nome = 'Caixa Média'), 'alugado', '2026-09-18', false, true),

  ('dixit', 'Dixit',
   'Um jogador descreve uma carta com uma frase, uma palavra ou um som. Os outros tentam adivinhar qual é. Difícil demais ninguém acerta, fácil demais todo mundo acerta, e nos dois casos você não pontua.',
   3, 6, 30, 30, 8, 1.2, 'Leve', '{"Jean-Louis Roubira"}', 'Galápagos Jogos',
   '{"Festa","Família"}', '{"Dedução","Votação"}',
   (select id from pricing_tiers where nome = 'Caixa Pequena'), 'disponivel', null, false, true),

  ('ticket-to-ride', 'Ticket to Ride',
   'Colecione cartas de vagão e reivindique rotas ferroviárias pelo mapa, ligando cidades distantes antes que outro jogador ocupe o trecho que você precisava.',
   2, 5, 30, 60, 8, 1.8, 'Leve', '{"Alan R. Moon"}', 'Galápagos Jogos',
   '{"Família","Estratégia"}', '{"Coleção de conjuntos","Construção de rotas"}',
   (select id from pricing_tiers where nome = 'Caixa Média'), 'disponivel', null, false, true),

  ('7-wonders-duel', '7 Wonders Duel',
   'Feito para exatamente duas pessoas. Você constrói uma civilização escolhendo cartas de uma pirâmide, e pode vencer por pontos, por supremacia militar ou por domínio científico.',
   2, 2, 30, 30, 10, 2.2, 'Média', '{"Antoine Bauza","Bruno Cathala"}', 'Galápagos Jogos',
   '{"Estratégia"}', '{"Escolha de cartas","Construção de motor"}',
   (select id from pricing_tiers where nome = 'Caixa Média'), 'disponivel', null, false, true),

  ('codenames', 'Codenames',
   'Dois times, uma grade de palavras e um chefe de espiões que só pode dar uma pista de uma palavra. O resto do time tenta descobrir quais palavras são dos seus agentes sem esbarrar no assassino.',
   2, 8, 15, 15, 10, 1.3, 'Leve', '{"Vlaada Chvátil"}', 'Devir',
   '{"Festa","Dedução"}', '{"Dedução","Jogo em times"}',
   (select id from pricing_tiers where nome = 'Caixa Pequena'), 'disponivel', null, false, true),

  ('pandemic', 'Pandemic',
   'Quatro doenças ameaçam o mundo e vocês jogam juntos contra o tabuleiro. Ou a equipe descobre as curas a tempo, ou todo mundo perde junto.',
   2, 4, 45, 45, 8, 2.4, 'Média', '{"Matt Leacock"}', 'Devir',
   '{"Cooperativo","Estratégia"}', '{"Jogo cooperativo","Gerenciamento de mão","Movimento ponto a ponto"}',
   (select id from pricing_tiers where nome = 'Caixa Média'), 'manutencao', null, false, true),

  ('carcassonne', 'Carcassonne',
   'Você vai montando o mapa peça por peça, colocando estradas, cidades e campos, e decide onde plantar seus seguidores para pontuar antes que o vizinho aproveite a sua construção.',
   2, 5, 30, 45, 7, 1.9, 'Leve', '{"Klaus-Jürgen Wrede"}', 'Devir',
   '{"Família","Estratégia"}', '{"Colocação de peças","Controle de área"}',
   (select id from pricing_tiers where nome = 'Caixa Pequena'), 'disponivel', null, false, true);

insert into game_tags (game_id, tag_id)
select g.id, t.id from games g, tags t where
  (g.slug = 'azul' and t.slug in ('bonito-na-mesa', 'facil-de-ensinar', 'bom-pra-casal', 'pra-jogar-em-familia', 'premiado-spiel-des-jahres-2018')) or
  (g.slug = 'catan' and t.slug in ('pra-jogar-em-familia')) or
  (g.slug = 'dixit' and t.slug in ('festa-com-a-galera', 'facil-de-ensinar', 'pra-jogar-em-familia')) or
  (g.slug = 'ticket-to-ride' and t.slug in ('pra-jogar-em-familia', 'facil-de-ensinar')) or
  (g.slug = '7-wonders-duel' and t.slug in ('bom-pra-2', 'bom-pra-casal')) or
  (g.slug = 'codenames' and t.slug in ('festa-com-a-galera', 'rapido-ate-30-min', 'facil-de-ensinar')) or
  (g.slug = 'pandemic' and t.slug in ('cooperativo')) or
  (g.slug = 'carcassonne' and t.slug in ('pra-jogar-em-familia', 'facil-de-ensinar'));
```

As capas ficam nulas de propósito. O handoff define que as fotos são do exemplar real e que as áreas listradas são placeholders, então o componente desenha o placeholder listrado quando `capaUrl` é nulo. Foto de verdade entra quando o dono fotografar o acervo.

O seed deixa um jogo alugado com data (Catan) e um em manutenção (Pandemic) de propósito, para que os três estados do selo apareçam na primeira vez que alguém abrir o site.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/esquema.test.ts`
Expected: PASS, 10 testes.

- [ ] **Step 6: Aplicar no Supabase e verificar de verdade**

Aplicar a migration e o seed, por uma das duas vias:

```bash
# via CLI, se o projeto estiver linkado
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

Ou pelo MCP do Supabase, com `apply_migration` para o arquivo de esquema e `execute_sql` para o seed.

Depois, conferir com a chave **anônima** (não a de serviço), que é o que o site usa:

```sql
select count(*) from games;              -- esperado: 8
select nome, status, disponivel_em from games where status <> 'disponivel';
-- esperado: Catan alugado 2026-09-18, Pandemic manutencao null
```

E confirmar que a escrita está barrada:

```sql
insert into games (slug, nome, min_jogadores, max_jogadores, duracao_min, duracao_max,
                   complexidade, complexidade_label, tier_id)
values ('teste', 'Teste', 1, 2, 10, 10, 1.0, 'Leve', (select id from pricing_tiers limit 1));
-- esperado: erro de row level security
```

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/001_esquema_inicial.sql supabase/seed.sql tests/esquema.test.ts
git commit -m "feat: esquema do catalogo com RLS de leitura publica e oito jogos de exemplo"
```

---

### Task 4: Leitura do Supabase e mapeamento para o domínio

Separa a forma do banco (`snake_case`, linhas aninhadas) da forma do domínio (`camelCase`, `Jogo`). O mapeamento é função pura, então é testado com linhas de exemplo e sem banco nenhum.

**Files:**
- Create: `lib/supabase/server.ts`, `lib/catalog/mapper.ts`, `lib/catalog/queries.ts`
- Create: `.env.example`
- Test: `tests/mapper.test.ts`

**Interfaces:**
- Consumes: `Jogo`, `Tier`, `StatusJogo` de `lib/types.ts` (Task 2)
- Produces:
  - `criarClienteLeitura(): SupabaseClient`
  - `type LinhaJogo` (a forma crua vinda do select)
  - `mapearJogo(linha: LinhaJogo): Jogo`
  - `listarJogos(): Promise<Jogo[]>`
  - `buscarJogoPorSlug(slug: string): Promise<Jogo | null>`
  - `listarDestaques(): Promise<Jogo[]>`

- [ ] **Step 1: Escrever o teste que falha**

`tests/mapper.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mapearJogo, type LinhaJogo } from '@/lib/catalog/mapper'

const linha: LinhaJogo = {
  id: 'abc',
  slug: 'azul',
  nome: 'Azul',
  descricao: 'Um jogo de azulejos.',
  capa_url: null,
  min_jogadores: 2,
  max_jogadores: 4,
  duracao_min: 30,
  duracao_max: 45,
  idade_minima: 8,
  complexidade: 1.8,
  complexidade_label: 'Leve',
  designers: ['Michael Kiesling'],
  editora: 'Galápagos Jogos',
  categorias: ['Abstrato'],
  mecanicas: ['Coleção de conjuntos'],
  status: 'disponivel',
  disponivel_em: null,
  destaque: true,
  created_at: '2026-01-15',
  pricing_tiers: {
    id: 'tier-1',
    nome: 'Caixa Média',
    preco_3_dias: 30,
    preco_7_dias: 40,
    ordem: 2,
  },
  game_photos: [
    { url: 'https://exemplo/2.jpg', ordem: 2, legenda: null },
    { url: 'https://exemplo/1.jpg', ordem: 1, legenda: 'Montado' },
  ],
  game_tags: [{ tags: { nome: 'Bonito na mesa' } }],
}

describe('mapearJogo', () => {
  it('converte snake_case do banco para camelCase do dominio', () => {
    const jogo = mapearJogo(linha)
    expect(jogo.minJogadores).toBe(2)
    expect(jogo.maxJogadores).toBe(4)
    expect(jogo.duracaoMin).toBe(30)
    expect(jogo.complexidadeLabel).toBe('Leve')
    expect(jogo.criadoEm).toBe('2026-01-15')
    expect(jogo.disponivelEm).toBeNull()
  })

  it('achata a faixa de preco aninhada', () => {
    const jogo = mapearJogo(linha)
    expect(jogo.tier.nome).toBe('Caixa Média')
    expect(jogo.tier.preco7Dias).toBe(40)
    expect(jogo.tier.preco3Dias).toBe(30)
  })

  it('ordena as fotos pelo campo ordem', () => {
    const jogo = mapearJogo(linha)
    expect(jogo.fotos.map((f) => f.url)).toEqual([
      'https://exemplo/1.jpg',
      'https://exemplo/2.jpg',
    ])
  })

  it('achata as tags para uma lista de nomes', () => {
    const jogo = mapearJogo(linha)
    expect(jogo.tags).toEqual(['Bonito na mesa'])
  })

  it('aceita jogo sem fotos e sem tags', () => {
    const jogo = mapearJogo({ ...linha, game_photos: [], game_tags: [] })
    expect(jogo.fotos).toEqual([])
    expect(jogo.tags).toEqual([])
  })

  it('preserva a data de retorno de um jogo alugado', () => {
    const jogo = mapearJogo({ ...linha, status: 'alugado', disponivel_em: '2026-09-18' })
    expect(jogo.status).toBe('alugado')
    expect(jogo.disponivelEm).toBe('2026-09-18')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/mapper.test.ts`
Expected: FAIL, "Failed to resolve import @/lib/catalog/mapper".

- [ ] **Step 3: Criar `lib/catalog/mapper.ts`**

```ts
import type { Complexidade, Jogo, StatusJogo } from '@/lib/types'

export interface LinhaJogo {
  id: string
  slug: string
  nome: string
  descricao: string
  capa_url: string | null
  min_jogadores: number
  max_jogadores: number
  duracao_min: number
  duracao_max: number
  idade_minima: number
  complexidade: number
  complexidade_label: Complexidade
  designers: string[]
  editora: string | null
  categorias: string[]
  mecanicas: string[]
  status: StatusJogo
  disponivel_em: string | null
  destaque: boolean
  created_at: string
  pricing_tiers: {
    id: string
    nome: string
    preco_3_dias: number
    preco_7_dias: number
    ordem: number
  }
  game_photos: { url: string; ordem: number; legenda: string | null }[]
  game_tags: { tags: { nome: string } }[]
}

export function mapearJogo(linha: LinhaJogo): Jogo {
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    descricao: linha.descricao,
    capaUrl: linha.capa_url,
    minJogadores: linha.min_jogadores,
    maxJogadores: linha.max_jogadores,
    duracaoMin: linha.duracao_min,
    duracaoMax: linha.duracao_max,
    idadeMinima: linha.idade_minima,
    complexidade: linha.complexidade,
    complexidadeLabel: linha.complexidade_label,
    designers: linha.designers,
    editora: linha.editora,
    categorias: linha.categorias,
    mecanicas: linha.mecanicas,
    status: linha.status,
    disponivelEm: linha.disponivel_em,
    destaque: linha.destaque,
    criadoEm: linha.created_at,
    tier: {
      id: linha.pricing_tiers.id,
      nome: linha.pricing_tiers.nome,
      preco3Dias: linha.pricing_tiers.preco_3_dias,
      preco7Dias: linha.pricing_tiers.preco_7_dias,
      ordem: linha.pricing_tiers.ordem,
    },
    fotos: [...linha.game_photos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => ({ url: f.url, legenda: f.legenda })),
    tags: linha.game_tags.map((vinculo) => vinculo.tags.nome),
  }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/mapper.test.ts`
Expected: PASS, 6 testes.

- [ ] **Step 5: Criar o cliente e as consultas**

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP=55XXXXXXXXXXX
```

`lib/supabase/server.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

export function criarClienteLeitura() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !chave) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Copie .env.example para .env.local.',
    )
  }

  return createClient(url, chave, { auth: { persistSession: false } })
}
```

`lib/catalog/queries.ts`:

```ts
import { criarClienteLeitura } from '@/lib/supabase/server'
import { mapearJogo, type LinhaJogo } from './mapper'
import type { Jogo } from '@/lib/types'

const CAMPOS = `
  id, slug, nome, descricao, capa_url,
  min_jogadores, max_jogadores, duracao_min, duracao_max, idade_minima,
  complexidade, complexidade_label, designers, editora, categorias, mecanicas,
  status, disponivel_em, destaque, created_at,
  pricing_tiers ( id, nome, preco_3_dias, preco_7_dias, ordem ),
  game_photos ( url, ordem, legenda ),
  game_tags ( tags ( nome ) )
`

export async function listarJogos(): Promise<Jogo[]> {
  const { data, error } = await criarClienteLeitura()
    .from('games')
    .select(CAMPOS)
    .order('nome')

  if (error) throw new Error(`Falha ao listar jogos: ${error.message}`)
  return (data as unknown as LinhaJogo[]).map(mapearJogo)
}

export async function buscarJogoPorSlug(slug: string): Promise<Jogo | null> {
  const { data, error } = await criarClienteLeitura()
    .from('games')
    .select(CAMPOS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`Falha ao buscar o jogo ${slug}: ${error.message}`)
  return data ? mapearJogo(data as unknown as LinhaJogo) : null
}

export async function listarDestaques(): Promise<Jogo[]> {
  const jogos = await listarJogos()
  const destaques = jogos.filter((j) => j.destaque)
  const resto = jogos.filter((j) => !j.destaque)
  return [...destaques, ...resto].slice(0, 6)
}
```

A política de RLS já filtra por `publicado`, então nenhuma consulta precisa repetir esse filtro. Se alguém desligar a política, os testes da Task 3 quebram.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS em todos os arquivos de teste.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/server.ts lib/catalog/mapper.ts lib/catalog/queries.ts \
        .env.example tests/mapper.test.ts
git commit -m "feat: leitura do supabase e mapeamento de linha para o dominio"
```

---
### Task 5: Primitivos de interface

Os cinco componentes que todas as telas reusam. Puros, sem dados, sem estado.

**Files:**
- Create: `components/ui/Botao.tsx`, `components/ui/Pilula.tsx`, `components/ui/SeloStatus.tsx`, `components/ui/MarcadorComplexidade.tsx`, `components/ui/BlocoPreco.tsx`
- Test: `tests/ui-primitivos.test.tsx`

**Interfaces:**
- Consumes: `textoSelo`, `dadosPreenchidos`, `formatarPreco` de `lib/format.ts`; `StatusJogo`, `Complexidade`, `Tier` de `lib/types.ts`
- Produces:
  - `<Botao variante="primario" | "secundario" | "whatsapp" tamanho="card" | "padrao" | "grande" />`
  - `<Pilula compacta?>{texto}</Pilula>`
  - `<SeloStatus status={StatusJogo} disponivelEm={string | null} />`
  - `<MarcadorComplexidade complexidade={Complexidade} />`
  - `<BlocoPreco tier={Tier} compacto? />`

- [ ] **Step 1: Escrever o teste que falha**

`tests/ui-primitivos.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Botao } from '@/components/ui/Botao'
import { Pilula } from '@/components/ui/Pilula'
import { SeloStatus } from '@/components/ui/SeloStatus'
import { MarcadorComplexidade } from '@/components/ui/MarcadorComplexidade'
import { BlocoPreco } from '@/components/ui/BlocoPreco'
import type { Tier } from '@/lib/types'

const tier: Tier = {
  id: 't1',
  nome: 'Caixa Média',
  preco3Dias: 30,
  preco7Dias: 40,
  ordem: 2,
}

describe('Botao', () => {
  it('mostra o texto e usa laranja no primario', () => {
    render(<Botao variante="primario">Alugar</Botao>)
    const botao = screen.getByRole('button', { name: 'Alugar' })
    expect(botao.className).toContain('bg-laranja')
  })

  it('usa contorno petroleo no secundario', () => {
    render(<Botao variante="secundario">Avise-me</Botao>)
    expect(screen.getByRole('button').className).toContain('border-petroleo')
  })

  it('usa verde no botao de WhatsApp', () => {
    render(<Botao variante="whatsapp">Falar no WhatsApp</Botao>)
    expect(screen.getByRole('button').className).toContain('bg-verde')
  })

  it('respeita o estado desabilitado', () => {
    render(<Botao variante="primario" disabled>Alugar</Botao>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('usa altura de 40px dentro do card e 48px no padrao', () => {
    const { rerender } = render(<Botao variante="primario" tamanho="card">A</Botao>)
    expect(screen.getByRole('button').className).toContain('h-10')
    rerender(<Botao variante="primario" tamanho="padrao">A</Botao>)
    expect(screen.getByRole('button').className).toContain('h-12')
  })
})

describe('SeloStatus', () => {
  it('mostra Disponivel em verde', () => {
    render(<SeloStatus status="disponivel" disponivelEm={null} />)
    const selo = screen.getByText('Disponível')
    expect(selo.className).toContain('bg-verde')
  })

  it('mostra a data de retorno em ambar', () => {
    render(<SeloStatus status="alugado" disponivelEm="2026-09-18" />)
    const selo = screen.getByText('Volta 18/09')
    expect(selo.className).toContain('bg-ambar')
  })

  it('mostra manutencao em cinza', () => {
    render(<SeloStatus status="manutencao" disponivelEm={null} />)
    expect(screen.getByText('Em manutenção').className).toContain('bg-cinza')
  })
})

describe('MarcadorComplexidade', () => {
  it('desenha sempre cinco dados', () => {
    render(<MarcadorComplexidade complexidade="Leve" />)
    expect(screen.getAllByTestId('dado')).toHaveLength(5)
  })

  it('preenche dois dados para Leve e cinco para Pesada', () => {
    const { rerender } = render(<MarcadorComplexidade complexidade="Leve" />)
    expect(screen.getAllByTestId('dado-cheio')).toHaveLength(2)
    rerender(<MarcadorComplexidade complexidade="Pesada" />)
    expect(screen.getAllByTestId('dado-cheio')).toHaveLength(5)
  })

  it('descreve a complexidade para leitor de tela', () => {
    render(<MarcadorComplexidade complexidade="Média" />)
    expect(screen.getByLabelText('Complexidade: Média')).toBeInTheDocument()
  })
})

describe('BlocoPreco', () => {
  it('mostra as duas opcoes de periodo com os precos da faixa', () => {
    render(<BlocoPreco tier={tier} />)
    expect(screen.getByText('7 DIAS')).toBeInTheDocument()
    expect(screen.getByText('R$ 40')).toBeInTheDocument()
    expect(screen.getByText('3 DIAS')).toBeInTheDocument()
    expect(screen.getByText('R$ 30')).toBeInTheDocument()
  })

  it('mostra as frases de apoio de cada periodo', () => {
    render(<BlocoPreco tier={tier} />)
    expect(screen.getByText(/devolve na outra sexta/i)).toBeInTheDocument()
    expect(screen.getByText(/uma noite ou um fim de semana/i)).toBeInTheDocument()
  })
})

describe('Pilula', () => {
  it('mostra o conteudo', () => {
    render(<Pilula>2–4</Pilula>)
    expect(screen.getByText('2–4')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/ui-primitivos.test.tsx`
Expected: FAIL, não resolve `@/components/ui/Botao`.

- [ ] **Step 3: Criar os cinco componentes**

`components/ui/Botao.tsx`:

```tsx
import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'whatsapp'
type Tamanho = 'card' | 'padrao' | 'grande'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-laranja text-white hover:bg-laranja-hover',
  secundario:
    'bg-transparent text-petroleo border-[1.5px] border-petroleo hover:bg-[rgba(45,107,125,.08)]',
  whatsapp: 'bg-verde text-white hover:bg-verde-hover',
}

const TAMANHOS: Record<Tamanho, string> = {
  card: 'h-10 px-[18px] text-sm rounded-xl',
  padrao: 'h-12 px-6 text-[15px] rounded-xl',
  grande: 'h-14 px-7 text-base rounded-[14px]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante: Variante
  tamanho?: Tamanho
}

export function Botao({ variante, tamanho = 'padrao', className = '', ...resto }: Props) {
  return (
    <button
      className={`font-corpo font-extrabold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    />
  )
}
```

`components/ui/Pilula.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Pilula({
  children,
  compacta = false,
}: {
  children: ReactNode
  compacta?: boolean
}) {
  const medidas = compacta
    ? 'px-2 py-[5px] text-[11px] gap-1'
    : 'px-[10px] py-1.5 text-xs gap-1.5'
  return (
    <span
      className={`inline-flex items-center rounded-full bg-creme font-corpo font-bold text-grafite ${medidas}`}
    >
      {children}
    </span>
  )
}
```

`components/ui/SeloStatus.tsx`:

```tsx
import { textoSelo } from '@/lib/format'
import type { StatusJogo } from '@/lib/types'

const CORES: Record<StatusJogo, string> = {
  disponivel: 'bg-verde',
  alugado: 'bg-ambar',
  manutencao: 'bg-cinza',
}

export function SeloStatus({
  status,
  disponivelEm,
}: {
  status: StatusJogo
  disponivelEm: string | null
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[10px] py-1.5 font-corpo text-xs font-extrabold text-white ${CORES[status]}`}
    >
      {textoSelo(status, disponivelEm)}
    </span>
  )
}
```

`components/ui/MarcadorComplexidade.tsx`:

```tsx
import { dadosPreenchidos } from '@/lib/format'
import type { Complexidade } from '@/lib/types'

export function MarcadorComplexidade({ complexidade }: { complexidade: Complexidade }) {
  const cheios = dadosPreenchidos(complexidade)

  return (
    <span className="inline-flex gap-[5px]" aria-label={`Complexidade: ${complexidade}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const cheio = i < cheios
        return (
          <span
            key={i}
            data-testid={cheio ? 'dado-cheio' : 'dado'}
            {...(cheio ? { 'data-cheio': 'true' } : {})}
            className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] ${
              cheio ? 'bg-petroleo' : 'border-[1.5px] border-[rgba(45,107,125,.3)]'
            }`}
          >
            {cheio && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
        )
      })}
    </span>
  )
}
```

Atenção: o teste conta `dado` e `dado-cheio` separadamente, então o marcador precisa expor os dois. Para `getAllByTestId('dado')` retornar 5, todos os quadrados recebem `data-testid="dado"` e os cheios recebem **também** um segundo marcador. Trocar a implementação acima por:

```tsx
          <span
            key={i}
            data-testid="dado"
            className={...}
          >
            {cheio && <span data-testid="dado-cheio" className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
```

`components/ui/BlocoPreco.tsx`:

```tsx
import { formatarPreco } from '@/lib/format'
import type { Tier } from '@/lib/types'

const TILES = [
  { rotulo: '7 DIAS', campo: 'preco7Dias', frase: 'Pega na sexta, devolve na outra sexta.' },
  { rotulo: '3 DIAS', campo: 'preco3Dias', frase: 'Pra uma noite ou um fim de semana.' },
] as const

export function BlocoPreco({ tier, compacto = false }: { tier: Tier; compacto?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TILES.map(({ rotulo, campo, frase }) => (
        <div
          key={rotulo}
          className="rounded-2xl border-[1.5px] border-[rgba(45,107,125,.18)] p-4 sm:p-[18px]"
        >
          <p className="font-display text-sm font-bold tracking-[.1em] text-petroleo">{rotulo}</p>
          <p
            className={`font-display font-extrabold text-laranja ${
              compacto ? 'text-[34px]' : 'text-[42px]'
            } leading-none`}
          >
            {formatarPreco(tier[campo])}
          </p>
          <p className="mt-1 font-corpo text-xs text-[color:var(--cor-grafite-70)]">{frase}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/ui-primitivos.test.tsx`
Expected: PASS, 14 testes.

- [ ] **Step 5: Commit**

```bash
git add components/ui tests/ui-primitivos.test.tsx
git commit -m "feat: primitivos de interface botao, pilula, selo, complexidade e bloco de preco"
```

---

### Task 6: Card de jogo

O componente mais repetido do site. Três estados e uma variante compacta para a grade de 2 colunas do celular.

**Files:**
- Create: `components/game/GameCard.tsx`
- Test: `tests/game-card.test.tsx`

**Interfaces:**
- Consumes: `Botao`, `Pilula`, `SeloStatus` (Task 5); `formatarPreco`, `formatarJogadoresCurto`, `formatarDuracaoCurta` (Task 2); `Jogo` (Task 2)
- Produces: `<GameCard jogo={Jogo} compacto? aoAlugar?={(jogo: Jogo) => void} />`

- [ ] **Step 1: Escrever o teste que falha**

`tests/game-card.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameCard } from '@/components/game/GameCard'
import type { Jogo } from '@/lib/types'

const base: Jogo = {
  id: '1',
  slug: 'azul',
  nome: 'Azul',
  descricao: '',
  capaUrl: null,
  minJogadores: 2,
  maxJogadores: 4,
  duracaoMin: 30,
  duracaoMax: 45,
  idadeMinima: 8,
  complexidade: 1.8,
  complexidadeLabel: 'Leve',
  designers: [],
  editora: null,
  categorias: [],
  mecanicas: [],
  tier: { id: 't', nome: 'Caixa Média', preco3Dias: 30, preco7Dias: 40, ordem: 2 },
  status: 'disponivel',
  disponivelEm: null,
  destaque: false,
  tags: [],
  fotos: [],
  criadoEm: '2026-01-15',
}

describe('GameCard', () => {
  it('mostra nome, jogadores, duracao e complexidade', () => {
    render(<GameCard jogo={base} />)
    expect(screen.getByText('Azul')).toBeInTheDocument()
    expect(screen.getByText('2–4')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('Leve')).toBeInTheDocument()
  })

  it('mostra o preco de 7 dias em destaque', () => {
    render(<GameCard jogo={base} />)
    expect(screen.getByText('R$ 40')).toBeInTheDocument()
    expect(screen.getByText('por 7 dias')).toBeInTheDocument()
  })

  it('leva para a ficha do jogo', () => {
    render(<GameCard jogo={base} />)
    expect(screen.getByRole('link', { name: /Azul/ })).toHaveAttribute('href', '/acervo/azul')
  })

  it('oferece Alugar quando o jogo esta disponivel', () => {
    render(<GameCard jogo={base} />)
    expect(screen.getByRole('button', { name: 'Alugar' })).toBeInTheDocument()
  })

  it('chama aoAlugar com o jogo ao clicar', async () => {
    const aoAlugar = vi.fn()
    render(<GameCard jogo={base} aoAlugar={aoAlugar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Alugar' }))
    expect(aoAlugar).toHaveBeenCalledWith(base)
  })

  it('troca para Avise-me quando esta alugado, sem esconder o preco', () => {
    render(<GameCard jogo={{ ...base, status: 'alugado', disponivelEm: '2026-09-18' }} />)
    expect(screen.getByRole('button', { name: 'Avise-me' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Alugar' })).not.toBeInTheDocument()
    expect(screen.getByText('Volta 18/09')).toBeInTheDocument()
    expect(screen.getByText('R$ 40')).toBeInTheDocument()
  })

  it('troca para Avise-me quando esta em manutencao', () => {
    render(<GameCard jogo={{ ...base, status: 'manutencao' }} />)
    expect(screen.getByRole('button', { name: 'Avise-me' })).toBeInTheDocument()
    expect(screen.getByText('Em manutenção')).toBeInTheDocument()
  })

  it('mostra a etiqueta Destaque so quando o jogo e destaque', () => {
    const { rerender } = render(<GameCard jogo={base} />)
    expect(screen.queryByText('Destaque')).not.toBeInTheDocument()
    rerender(<GameCard jogo={{ ...base, destaque: true }} />)
    expect(screen.getByText('Destaque')).toBeInTheDocument()
  })

  it('desenha o placeholder listrado quando nao ha foto', () => {
    render(<GameCard jogo={base} />)
    expect(screen.getByTestId('placeholder-foto')).toBeInTheDocument()
  })

  it('usa a foto real quando existe', () => {
    render(<GameCard jogo={{ ...base, capaUrl: 'https://exemplo/azul.jpg' }} />)
    expect(screen.getByRole('img', { name: 'Azul' })).toHaveAttribute(
      'src',
      'https://exemplo/azul.jpg',
    )
    expect(screen.queryByTestId('placeholder-foto')).not.toBeInTheDocument()
  })

  it('esconde a pilula de complexidade na variante compacta', () => {
    render(<GameCard jogo={base} compacto />)
    expect(screen.getByText('2–4')).toBeInTheDocument()
    expect(screen.queryByText('Leve')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/game-card.test.tsx`
Expected: FAIL, não resolve `@/components/game/GameCard`.

- [ ] **Step 3: Criar `components/game/GameCard.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Botao } from '@/components/ui/Botao'
import { Pilula } from '@/components/ui/Pilula'
import { SeloStatus } from '@/components/ui/SeloStatus'
import {
  formatarDuracaoCurta,
  formatarJogadoresCurto,
  formatarPreco,
} from '@/lib/format'
import type { Jogo } from '@/lib/types'

export function GameCard({
  jogo,
  compacto = false,
  aoAlugar,
}: {
  jogo: Jogo
  compacto?: boolean
  aoAlugar?: (jogo: Jogo) => void
}) {
  const disponivel = jogo.status === 'disponivel'

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
      <Link href={`/acervo/${jogo.slug}`} className="relative block aspect-[4/3]">
        {jogo.capaUrl ? (
          <img src={jogo.capaUrl} alt={jogo.nome} className="h-full w-full object-cover" />
        ) : (
          <div
            data-testid="placeholder-foto"
            className="h-full w-full bg-[repeating-linear-gradient(45deg,rgba(45,107,125,.08)_0_10px,rgba(45,107,125,.03)_10px_20px)]"
          />
        )}
        <span className="absolute left-2.5 top-2.5">
          <SeloStatus status={jogo.status} disponivelEm={jogo.disponivelEm} />
        </span>
        {jogo.destaque && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-laranja px-[10px] py-1.5 font-corpo text-xs font-extrabold text-white">
            Destaque
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col gap-2.5 ${compacto ? 'p-3' : 'px-4 pb-4 pt-3.5'}`}>
        <Link
          href={`/acervo/${jogo.slug}`}
          className={`font-display font-bold uppercase text-petroleo ${
            compacto ? 'text-[17px]' : 'text-[22px]'
          } leading-tight`}
        >
          {jogo.nome}
        </Link>

        <div className="flex flex-wrap gap-1.5">
          <Pilula compacta={compacto}>
            {formatarJogadoresCurto(jogo.minJogadores, jogo.maxJogadores)}
          </Pilula>
          <Pilula compacta={compacto}>
            {formatarDuracaoCurta(jogo.duracaoMin, jogo.duracaoMax)}
          </Pilula>
          {!compacto && <Pilula>{jogo.complexidadeLabel}</Pilula>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p
              className={`font-display font-extrabold leading-none text-laranja ${
                compacto ? 'text-[22px]' : 'text-[28px]'
              }`}
            >
              {formatarPreco(jogo.tier.preco7Dias)}
            </p>
            <p className="font-corpo text-xs font-semibold text-[color:var(--cor-grafite-70)]">
              por 7 dias
            </p>
          </div>

          <Botao
            variante={disponivel ? 'primario' : 'secundario'}
            tamanho="card"
            onClick={() => aoAlugar?.(jogo)}
          >
            {disponivel ? 'Alugar' : 'Avise-me'}
          </Botao>
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/game-card.test.tsx`
Expected: PASS, 11 testes.

- [ ] **Step 5: Commit**

```bash
git add components/game/GameCard.tsx tests/game-card.test.tsx
git commit -m "feat: card de jogo com tres estados e variante compacta"
```

---
### Task 7: Header, rodapé, barra de abas e botão flutuante

A moldura de todas as páginas. O contador do carrinho fica aqui, mas só lê o estado; quem escreve é a Task 12.

**Files:**
- Create: `components/layout/SiteHeader.tsx`, `components/layout/SiteFooter.tsx`, `components/layout/TabBar.tsx`, `components/layout/BotaoWhatsApp.tsx`
- Create: `app/(site)/layout.tsx`
- Modify: remover `app/page.tsx` provisório da Task 1
- Test: `tests/layout.test.tsx`

**Interfaces:**
- Consumes: nada além de `next/link`
- Produces:
  - `<SiteHeader itensNoCarrinho={number} />`
  - `<SiteFooter />`
  - `<TabBar itensNoCarrinho={number} />`
  - `<BotaoWhatsApp mensagem?={string} deslocado?={boolean} />`
  - `linkWhatsApp(mensagem: string): string` exportado de `components/layout/BotaoWhatsApp.tsx`

- [ ] **Step 1: Escrever o teste que falha**

`tests/layout.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { TabBar } from '@/components/layout/TabBar'
import { BotaoWhatsApp, linkWhatsApp } from '@/components/layout/BotaoWhatsApp'

describe('SiteHeader', () => {
  it('leva para as tres secoes do site', () => {
    render(<SiteHeader itensNoCarrinho={0} />)
    expect(screen.getByRole('link', { name: 'Acervo' })).toHaveAttribute('href', '/acervo')
    expect(screen.getByRole('link', { name: 'Como funciona' })).toHaveAttribute(
      'href',
      '/como-funciona',
    )
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute('href', '/contato')
  })

  it('esconde o contador quando o carrinho esta vazio', () => {
    render(<SiteHeader itensNoCarrinho={0} />)
    expect(screen.queryByTestId('contador-carrinho')).not.toBeInTheDocument()
  })

  it('mostra quantos jogos ha no carrinho', () => {
    render(<SiteHeader itensNoCarrinho={2} />)
    expect(screen.getByTestId('contador-carrinho')).toHaveTextContent('2')
  })
})

describe('TabBar', () => {
  it('tem as quatro abas na ordem do handoff', () => {
    render(<TabBar itensNoCarrinho={0} />)
    const abas = screen.getAllByRole('link')
    expect(abas.map((a) => a.textContent)).toEqual([
      'Início',
      'Acervo',
      'Carrinho',
      'Contato',
    ])
  })
})

describe('linkWhatsApp', () => {
  it('monta o link com o numero e a mensagem codificada', () => {
    process.env.NEXT_PUBLIC_WHATSAPP = '5548999999999'
    expect(linkWhatsApp('Olá! Quero alugar')).toBe(
      'https://wa.me/5548999999999?text=Ol%C3%A1!%20Quero%20alugar',
    )
  })
})

describe('BotaoWhatsApp', () => {
  it('abre em nova aba', () => {
    process.env.NEXT_PUBLIC_WHATSAPP = '5548999999999'
    render(<BotaoWhatsApp />)
    const link = screen.getByRole('link', { name: /WhatsApp/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})

describe('SiteFooter', () => {
  it('mostra a marca e o aviso de que nao ha pagamento no site', () => {
    render(<SiteFooter />)
    expect(screen.getByText(/JOGO NA CAIXA/i)).toBeInTheDocument()
    expect(screen.getByText(/PIX.*WhatsApp/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/layout.test.tsx`
Expected: FAIL, não resolve `@/components/layout/SiteHeader`.

- [ ] **Step 3: Criar os quatro componentes**

`components/layout/BotaoWhatsApp.tsx`:

```tsx
export function linkWhatsApp(mensagem: string): string {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP ?? ''
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

export function BotaoWhatsApp({
  mensagem = 'Olá! Vim pelo site e queria uma ajuda pra escolher um jogo.',
  deslocado = false,
}: {
  mensagem?: string
  deslocado?: boolean
}) {
  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-verde px-5 font-corpo text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(62,142,90,.35)] hover:bg-verde-hover ${
        deslocado ? 'bottom-[88px]' : 'bottom-[76px]'
      } md:bottom-6`}
    >
      WhatsApp
    </a>
  )
}
```

`components/layout/SiteHeader.tsx`:

```tsx
import Link from 'next/link'

const NAV = [
  { rotulo: 'Acervo', href: '/acervo' },
  { rotulo: 'Como funciona', href: '/como-funciona' },
  { rotulo: 'Contato', href: '/contato' },
]

export function SiteHeader({ itensNoCarrinho }: { itensNoCarrinho: number }) {
  return (
    <header className="bg-petroleo">
      <div className="container-site flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-creme font-display text-lg font-extrabold text-petroleo">
            JC
          </span>
          <span className="font-display text-[22px] font-extrabold tracking-[.06em] text-white">
            JOGO NA CAIXA
          </span>
        </Link>

        <nav className="hidden gap-9 md:flex">
          {NAV.map(({ rotulo, href }) => (
            <Link
              key={href}
              href={href}
              className="font-corpo text-[15px] font-bold text-white hover:text-laranja"
            >
              {rotulo}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrinho"
          className="inline-flex items-center gap-2 rounded-full border border-white/60 px-4 py-2 font-corpo text-[15px] font-bold text-white"
        >
          Carrinho
          {itensNoCarrinho > 0 && (
            <span
              data-testid="contador-carrinho"
              className="grid h-[26px] min-w-[26px] place-items-center rounded-full bg-laranja px-1.5 text-sm font-extrabold"
            >
              {itensNoCarrinho}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
```

`components/layout/TabBar.tsx`:

```tsx
import Link from 'next/link'

const ABAS = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Acervo', href: '/acervo' },
  { rotulo: 'Carrinho', href: '/carrinho' },
  { rotulo: 'Contato', href: '/contato' },
]

export function TabBar({ itensNoCarrinho }: { itensNoCarrinho: number }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[color:var(--cor-borda)] bg-white md:hidden">
      {ABAS.map(({ rotulo, href }) => (
        <Link
          key={href}
          href={href}
          className="relative grid min-h-[56px] flex-1 place-items-center font-corpo text-[11px] font-bold text-petroleo"
        >
          {rotulo}
          {rotulo === 'Carrinho' && itensNoCarrinho > 0 && (
            <span className="absolute right-1/4 top-2 h-2 w-2 rounded-full bg-laranja" />
          )}
        </Link>
      ))}
    </nav>
  )
}
```

`components/layout/SiteFooter.tsx`:

```tsx
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-petroleo text-white">
      <div className="container-site grid gap-10 py-14 pb-24 md:grid-cols-[1fr_auto_auto] md:pb-7">
        <div className="max-w-[380px]">
          <p className="font-display text-[22px] font-extrabold tracking-[.06em]">JOGO NA CAIXA</p>
          <p className="mt-3 font-corpo text-[15px] text-white/80">
            Aluguel de jogos de tabuleiro por 3 ou 7 dias. Mais mesa, menos tela.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white/65">
            Navegar
          </p>
          <ul className="mt-3 space-y-2 font-corpo text-[15px] font-semibold">
            <li><Link href="/acervo">Acervo</Link></li>
            <li><Link href="/como-funciona">Como funciona</Link></li>
            <li><Link href="/contato">Contato</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white/65">
            Combinados
          </p>
          <p className="mt-3 max-w-[260px] font-corpo text-[15px] text-white/80">
            Reserva sem cadastro. O pagamento é por PIX, combinado com a gente no WhatsApp.
          </p>
        </div>
      </div>

      <div className="container-site border-t border-white/15 py-6 font-corpo text-xs text-white/60">
        © {new Date().getFullYear()} Jogo na Caixa.
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Criar `app/(site)/layout.tsx` e remover a página provisória**

```tsx
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { TabBar } from '@/components/layout/TabBar'
import { BotaoWhatsApp } from '@/components/layout/BotaoWhatsApp'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader itensNoCarrinho={0} />
      <main className="pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <BotaoWhatsApp />
      <TabBar itensNoCarrinho={0} />
    </>
  )
}
```

O contador entra como zero por enquanto. A Task 12 troca por leitura real do carrinho.

Run: `rm app/page.tsx`

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/layout.test.tsx`
Expected: PASS, 7 testes.

- [ ] **Step 6: Commit**

```bash
git add components/layout "app/(site)/layout.tsx" tests/layout.test.tsx
git rm --cached app/page.tsx 2>/dev/null || true
git commit -m "feat: moldura do site com header, rodape, barra de abas e botao de whatsapp"
```

---

### Task 8: Lógica de filtros do acervo

Funções puras. É aqui que mora a regra de negócio da busca, longe de qualquer componente, e é por isso que dá para testar cada caso de borda sem renderizar nada.

**Files:**
- Create: `lib/catalog/filters.ts`
- Test: `tests/filters.test.ts`

**Interfaces:**
- Consumes: `Jogo`, `Complexidade` (Task 2)
- Produces:
  - `type FaixaDuracao = 'ate30' | 'ate60' | 'mais60'`
  - `type Ordenacao = 'nome' | 'novidades'`
  - `interface EstadoFiltros { jogadores, duracao, complexidade, tags, soDisponiveis, ordenar }`
  - `const FILTROS_PADRAO: EstadoFiltros`
  - `lerFiltrosDaUrl(params: URLSearchParams): EstadoFiltros`
  - `escreverFiltrosNaUrl(f: EstadoFiltros): string`
  - `aplicarFiltros(jogos: Jogo[], f: EstadoFiltros): Jogo[]`

- [ ] **Step 1: Escrever o teste que falha**

`tests/filters.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  FILTROS_PADRAO,
  aplicarFiltros,
  escreverFiltrosNaUrl,
  lerFiltrosDaUrl,
} from '@/lib/catalog/filters'
import type { Jogo } from '@/lib/types'

function jogo(parcial: Partial<Jogo>): Jogo {
  return {
    id: '1', slug: 's', nome: 'Jogo', descricao: '', capaUrl: null,
    minJogadores: 2, maxJogadores: 4, duracaoMin: 30, duracaoMax: 45,
    idadeMinima: 8, complexidade: 2, complexidadeLabel: 'Leve',
    designers: [], editora: null, categorias: [], mecanicas: [],
    tier: { id: 't', nome: 'Caixa Média', preco3Dias: 30, preco7Dias: 40, ordem: 2 },
    status: 'disponivel', disponivelEm: null, destaque: false,
    tags: [], fotos: [], criadoEm: '2026-01-01',
    ...parcial,
  }
}

describe('aplicarFiltros, jogadores', () => {
  const jogos = [
    jogo({ slug: 'duo', minJogadores: 2, maxJogadores: 2 }),
    jogo({ slug: 'familia', minJogadores: 2, maxJogadores: 4 }),
    jogo({ slug: 'festa', minJogadores: 4, maxJogadores: 8 }),
  ]

  it('mostra so os jogos que aceitam o numero escolhido', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, jogadores: 2 })
    expect(r.map((j) => j.slug).sort()).toEqual(['duo', 'familia'])
  })

  it('inclui o jogo quando o numero cai exatamente no limite', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, jogadores: 4 })
    expect(r.map((j) => j.slug).sort()).toEqual(['familia', 'festa'])
  })

  it('nao filtra nada quando jogadores e nulo', () => {
    expect(aplicarFiltros(jogos, FILTROS_PADRAO)).toHaveLength(3)
  })
})

describe('aplicarFiltros, duracao', () => {
  const jogos = [
    jogo({ slug: 'curto', duracaoMin: 15, duracaoMax: 15 }),
    jogo({ slug: 'medio', duracaoMin: 30, duracaoMax: 45 }),
    jogo({ slug: 'longo', duracaoMin: 60, duracaoMax: 90 }),
  ]

  it('ate30 pega so o que termina em 30 minutos ou menos', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, duracao: 'ate30' })
    expect(r.map((j) => j.slug)).toEqual(['curto'])
  })

  it('ate60 inclui os de ate uma hora', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, duracao: 'ate60' })
    expect(r.map((j) => j.slug).sort()).toEqual(['curto', 'medio'])
  })

  it('mais60 pega so os longos', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, duracao: 'mais60' })
    expect(r.map((j) => j.slug)).toEqual(['longo'])
  })
})

describe('aplicarFiltros, disponibilidade', () => {
  const jogos = [
    jogo({ slug: 'livre', status: 'disponivel' }),
    jogo({ slug: 'fora', status: 'alugado', disponivelEm: '2026-09-18' }),
    jogo({ slug: 'conserto', status: 'manutencao' }),
  ]

  it('mostra tudo por padrao, porque jogo alugado nao some da vitrine', () => {
    expect(aplicarFiltros(jogos, FILTROS_PADRAO)).toHaveLength(3)
  })

  it('filtra para so disponiveis quando pedido', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, soDisponiveis: true })
    expect(r.map((j) => j.slug)).toEqual(['livre'])
  })
})

describe('aplicarFiltros, tags', () => {
  const jogos = [
    jogo({ slug: 'a', tags: ['Cooperativo'] }),
    jogo({ slug: 'b', tags: ['Festa com a galera'] }),
    jogo({ slug: 'c', tags: ['Cooperativo', 'Festa com a galera'] }),
  ]

  it('aceita jogo que tenha qualquer uma das tags escolhidas', () => {
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, tags: ['Cooperativo'] })
    expect(r.map((j) => j.slug).sort()).toEqual(['a', 'c'])
  })

  it('duas tags ampliam o resultado, nao restringem', () => {
    const r = aplicarFiltros(jogos, {
      ...FILTROS_PADRAO,
      tags: ['Cooperativo', 'Festa com a galera'],
    })
    expect(r).toHaveLength(3)
  })
})

describe('aplicarFiltros, combinacao e ordenacao', () => {
  it('combina criterios com E entre categorias diferentes', () => {
    const jogos = [
      jogo({ slug: 'certo', minJogadores: 2, maxJogadores: 4, status: 'disponivel' }),
      jogo({ slug: 'alugado', minJogadores: 2, maxJogadores: 4, status: 'alugado', disponivelEm: '2026-09-18' }),
      jogo({ slug: 'muitos', minJogadores: 6, maxJogadores: 8, status: 'disponivel' }),
    ]
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, jogadores: 3, soDisponiveis: true })
    expect(r.map((j) => j.slug)).toEqual(['certo'])
  })

  it('ordena por nome sem se perder com acento', () => {
    const jogos = [jogo({ nome: 'Ética' }), jogo({ nome: 'Azul' }), jogo({ nome: 'Catan' })]
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, ordenar: 'nome' })
    expect(r.map((j) => j.nome)).toEqual(['Azul', 'Catan', 'Ética'])
  })

  it('ordena novidades do mais novo para o mais antigo', () => {
    const jogos = [
      jogo({ nome: 'Velho', criadoEm: '2026-01-01' }),
      jogo({ nome: 'Novo', criadoEm: '2026-09-01' }),
    ]
    const r = aplicarFiltros(jogos, { ...FILTROS_PADRAO, ordenar: 'novidades' })
    expect(r.map((j) => j.nome)).toEqual(['Novo', 'Velho'])
  })
})

describe('serializacao na URL', () => {
  it('le os filtros da querystring', () => {
    const f = lerFiltrosDaUrl(
      new URLSearchParams('jogadores=4&duracao=ate60&disponiveis=1&tags=Festa&tags=Solo'),
    )
    expect(f.jogadores).toBe(4)
    expect(f.duracao).toBe('ate60')
    expect(f.soDisponiveis).toBe(true)
    expect(f.tags).toEqual(['Festa', 'Solo'])
  })

  it('ignora valores invalidos em vez de quebrar', () => {
    const f = lerFiltrosDaUrl(new URLSearchParams('jogadores=abc&duracao=seila'))
    expect(f.jogadores).toBeNull()
    expect(f.duracao).toBeNull()
  })

  it('omite da URL tudo que estiver no padrao', () => {
    expect(escreverFiltrosNaUrl(FILTROS_PADRAO)).toBe('')
  })

  it('ida e volta preserva o estado', () => {
    const original = {
      ...FILTROS_PADRAO,
      jogadores: 4,
      duracao: 'ate30' as const,
      soDisponiveis: true,
      tags: ['Festa'],
    }
    expect(lerFiltrosDaUrl(new URLSearchParams(escreverFiltrosNaUrl(original)))).toEqual(original)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/filters.test.ts`
Expected: FAIL, não resolve `@/lib/catalog/filters`.

- [ ] **Step 3: Criar `lib/catalog/filters.ts`**

```ts
import type { Complexidade, Jogo } from '@/lib/types'

export type FaixaDuracao = 'ate30' | 'ate60' | 'mais60'
export type Ordenacao = 'nome' | 'novidades'

export interface EstadoFiltros {
  jogadores: number | null
  duracao: FaixaDuracao | null
  complexidade: Complexidade | null
  tags: string[]
  soDisponiveis: boolean
  ordenar: Ordenacao
}

export const FILTROS_PADRAO: EstadoFiltros = {
  jogadores: null,
  duracao: null,
  complexidade: null,
  tags: [],
  soDisponiveis: false,
  ordenar: 'nome',
}

const DURACOES: FaixaDuracao[] = ['ate30', 'ate60', 'mais60']
const COMPLEXIDADES: Complexidade[] = ['Leve', 'Média', 'Pesada']
const ORDENACOES: Ordenacao[] = ['nome', 'novidades']

function cabeNaDuracao(jogo: Jogo, faixa: FaixaDuracao): boolean {
  if (faixa === 'ate30') return jogo.duracaoMax <= 30
  if (faixa === 'ate60') return jogo.duracaoMax <= 60
  return jogo.duracaoMax > 60
}

export function aplicarFiltros(jogos: Jogo[], f: EstadoFiltros): Jogo[] {
  const filtrados = jogos.filter((jogo) => {
    if (f.jogadores !== null) {
      if (jogo.minJogadores > f.jogadores || jogo.maxJogadores < f.jogadores) return false
    }
    if (f.duracao !== null && !cabeNaDuracao(jogo, f.duracao)) return false
    if (f.complexidade !== null && jogo.complexidadeLabel !== f.complexidade) return false
    if (f.soDisponiveis && jogo.status !== 'disponivel') return false
    if (f.tags.length > 0 && !f.tags.some((t) => jogo.tags.includes(t))) return false
    return true
  })

  return [...filtrados].sort((a, b) =>
    f.ordenar === 'novidades'
      ? b.criadoEm.localeCompare(a.criadoEm)
      : a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}

export function lerFiltrosDaUrl(params: URLSearchParams): EstadoFiltros {
  const jogadoresBruto = Number(params.get('jogadores'))
  const duracao = params.get('duracao') as FaixaDuracao | null
  const complexidade = params.get('complexidade') as Complexidade | null
  const ordenar = params.get('ordenar') as Ordenacao | null

  return {
    jogadores: Number.isInteger(jogadoresBruto) && jogadoresBruto > 0 ? jogadoresBruto : null,
    duracao: duracao && DURACOES.includes(duracao) ? duracao : null,
    complexidade: complexidade && COMPLEXIDADES.includes(complexidade) ? complexidade : null,
    tags: params.getAll('tags'),
    soDisponiveis: params.get('disponiveis') === '1',
    ordenar: ordenar && ORDENACOES.includes(ordenar) ? ordenar : 'nome',
  }
}

export function escreverFiltrosNaUrl(f: EstadoFiltros): string {
  const params = new URLSearchParams()
  if (f.jogadores !== null) params.set('jogadores', String(f.jogadores))
  if (f.duracao !== null) params.set('duracao', f.duracao)
  if (f.complexidade !== null) params.set('complexidade', f.complexidade)
  if (f.soDisponiveis) params.set('disponiveis', '1')
  for (const tag of f.tags) params.append('tags', tag)
  if (f.ordenar !== 'nome') params.set('ordenar', f.ordenar)
  return params.toString()
}
```

Duas regras que merecem ser ditas em voz alta, porque são decisões e não detalhes:

- Entre **categorias diferentes** de filtro a combinação é E: quem pede 4 jogadores e só disponíveis recebe a interseção.
- Entre **tags** a combinação é OU: marcar Festa e Cooperativo amplia o resultado. Com um acervo pequeno, exigir todas as tags levaria a zero resultado quase sempre, o que treina a pessoa a não usar o filtro.

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/filters.test.ts`
Expected: PASS, 15 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/catalog/filters.ts tests/filters.test.ts
git commit -m "feat: regra de filtro do acervo com estado espelhado na url"
```

---
### Task 9: Página do Acervo

Página servidora que busca os jogos, e uma grade cliente que aplica os filtros da Task 8 sem ida ao servidor. O estado vive na URL, então um filtro aplicado é um link compartilhável, e é isso que faz os blocos de ocasião da Home funcionarem na Task 11.

**Files:**
- Create: `app/(site)/acervo/page.tsx`
- Create: `components/catalog/ChipFiltro.tsx`, `components/catalog/PainelJogadores.tsx`, `components/catalog/BarraDeFiltros.tsx`, `components/catalog/GradeAcervo.tsx`
- Test: `tests/acervo.test.tsx`

**Interfaces:**
- Consumes: `listarJogos` (Task 4); `aplicarFiltros`, `lerFiltrosDaUrl`, `escreverFiltrosNaUrl`, `FILTROS_PADRAO`, `EstadoFiltros` (Task 8); `GameCard` (Task 6); `Botao` (Task 5)
- Produces:
  - `<GradeAcervo jogos={Jogo[]} />`
  - `<BarraDeFiltros filtros={EstadoFiltros} aoMudar={(f: EstadoFiltros) => void} totalFiltrado={number} />`
  - `<ChipFiltro rotulo={string} ativo={boolean}>{conteudo}</ChipFiltro>`

- [ ] **Step 1: Escrever o teste que falha**

`tests/acervo.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GradeAcervo } from '@/components/catalog/GradeAcervo'
import type { Jogo } from '@/lib/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/acervo',
}))

function jogo(parcial: Partial<Jogo>): Jogo {
  return {
    id: Math.random().toString(), slug: parcial.nome?.toLowerCase() ?? 's',
    nome: 'Jogo', descricao: '', capaUrl: null,
    minJogadores: 2, maxJogadores: 4, duracaoMin: 30, duracaoMax: 45,
    idadeMinima: 8, complexidade: 2, complexidadeLabel: 'Leve',
    designers: [], editora: null, categorias: [], mecanicas: [],
    tier: { id: 't', nome: 'Caixa Média', preco3Dias: 30, preco7Dias: 40, ordem: 2 },
    status: 'disponivel', disponivelEm: null, destaque: false,
    tags: [], fotos: [], criadoEm: '2026-01-01',
    ...parcial,
  }
}

const jogos = [
  jogo({ nome: 'Azul', minJogadores: 2, maxJogadores: 4 }),
  jogo({ nome: 'Codenames', minJogadores: 2, maxJogadores: 8 }),
  jogo({ nome: 'Catan', minJogadores: 3, maxJogadores: 4, status: 'alugado', disponivelEm: '2026-09-18' }),
]

describe('GradeAcervo', () => {
  it('mostra todos os jogos e a contagem', () => {
    render(<GradeAcervo jogos={jogos} />)
    expect(screen.getByText('3 jogos no acervo')).toBeInTheDocument()
    expect(screen.getByText('Azul')).toBeInTheDocument()
    expect(screen.getByText('Catan')).toBeInTheDocument()
  })

  it('filtra por numero de jogadores e atualiza a contagem', async () => {
    render(<GradeAcervo jogos={jogos} />)
    await userEvent.click(screen.getByRole('button', { name: /Jogadores/ }))
    await userEvent.click(screen.getByRole('button', { name: '8' }))
    await userEvent.click(screen.getByRole('button', { name: /Ver 1 jogo/ }))

    expect(screen.getByText('Codenames')).toBeInTheDocument()
    expect(screen.queryByText('Azul')).not.toBeInTheDocument()
  })

  it('o botao do painel antecipa quantos jogos vao sobrar', async () => {
    render(<GradeAcervo jogos={jogos} />)
    await userEvent.click(screen.getByRole('button', { name: /Jogadores/ }))
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByRole('button', { name: 'Ver 3 jogos' })).toBeInTheDocument()
  })

  it('o toggle de disponiveis remove os alugados', async () => {
    render(<GradeAcervo jogos={jogos} />)
    await userEvent.click(screen.getByRole('switch', { name: /disponíveis/i }))
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(screen.getByText('Azul')).toBeInTheDocument()
  })

  it('mostra estado vazio quando nada corresponde', async () => {
    render(<GradeAcervo jogos={[jogo({ nome: 'Azul', minJogadores: 2, maxJogadores: 2 })]} />)
    await userEvent.click(screen.getByRole('button', { name: /Jogadores/ }))
    await userEvent.click(screen.getByRole('button', { name: '6+' }))
    await userEvent.click(screen.getByRole('button', { name: /Ver 0 jogos/ }))
    expect(screen.getByText(/Nenhum jogo com esses filtros/i)).toBeInTheDocument()
  })

  it('Limpar tudo devolve a lista inteira', async () => {
    render(<GradeAcervo jogos={jogos} />)
    await userEvent.click(screen.getByRole('switch', { name: /disponíveis/i }))
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Limpar tudo/ }))
    expect(screen.getByText('Catan')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/acervo.test.tsx`
Expected: FAIL, não resolve `@/components/catalog/GradeAcervo`.

- [ ] **Step 3: Criar `components/catalog/ChipFiltro.tsx`**

```tsx
'use client'

import { useState, type ReactNode } from 'react'

export function ChipFiltro({
  rotulo,
  ativo,
  children,
}: {
  rotulo: string
  ativo: boolean
  children: (fechar: () => void) => ReactNode
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={`inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 font-corpo text-sm font-bold transition-colors ${
          ativo || aberto
            ? 'border-petroleo bg-petroleo text-white'
            : 'border-[color:var(--cor-borda-chip)] text-petroleo'
        }`}
      >
        {rotulo}
        <span aria-hidden>{aberto ? '▴' : '▾'}</span>
      </button>

      {aberto && (
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-5 shadow-[var(--shadow-popover)] md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-[calc(100%+12px)] md:w-[352px] md:rounded-2xl">
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  )
}
```

No celular o painel é folha inferior (`fixed inset-x-0 bottom-0`), no desktop vira popover ancorado (`md:absolute`). É a mesma árvore, muda só o posicionamento, então não há duplicação de conteúdo.

- [ ] **Step 4: Criar `components/catalog/PainelJogadores.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Botao } from '@/components/ui/Botao'

const OPCOES = [1, 2, 3, 4, 5, 6] as const

export function PainelJogadores({
  valor,
  contar,
  aoAplicar,
  aoLimpar,
}: {
  valor: number | null
  contar: (jogadores: number | null) => number
  aoAplicar: (jogadores: number | null) => void
  aoLimpar: () => void
}) {
  const [escolha, setEscolha] = useState<number | null>(valor)
  const total = contar(escolha)

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-xl font-extrabold uppercase text-petroleo">
        Quantas pessoas vão jogar?
      </p>

      <div className="grid grid-cols-6 gap-2">
        {OPCOES.map((n) => {
          const rotulo = n === 6 ? '6+' : String(n)
          const ativo = escolha === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setEscolha(ativo ? null : n)}
              className={`h-11 rounded-xl font-corpo font-bold ${
                ativo
                  ? 'bg-laranja text-white'
                  : 'border-[1.5px] border-[color:var(--cor-borda-chip)] text-petroleo'
              }`}
            >
              {rotulo}
            </button>
          )
        })}
      </div>

      <p className="font-corpo text-xs text-[color:var(--cor-grafite-70)]">
        Mostramos só os jogos que aceitam esse número de pessoas.
      </p>

      <div className="flex items-center gap-3">
        <Botao variante="secundario" tamanho="padrao" className="flex-1" onClick={aoLimpar}>
          Limpar
        </Botao>
        <Botao
          variante="primario"
          tamanho="padrao"
          className="flex-[1.4]"
          onClick={() => aoAplicar(escolha)}
        >
          {total === 1 ? 'Ver 1 jogo' : `Ver ${total} jogos`}
        </Botao>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Criar `components/catalog/GradeAcervo.tsx`**

```tsx
'use client'

import { useMemo, useState } from 'react'
import { GameCard } from '@/components/game/GameCard'
import { Botao } from '@/components/ui/Botao'
import { ChipFiltro } from './ChipFiltro'
import { PainelJogadores } from './PainelJogadores'
import { FILTROS_PADRAO, aplicarFiltros, type EstadoFiltros } from '@/lib/catalog/filters'
import type { Jogo } from '@/lib/types'

export function GradeAcervo({ jogos }: { jogos: Jogo[] }) {
  const [filtros, setFiltros] = useState<EstadoFiltros>(FILTROS_PADRAO)

  const visiveis = useMemo(() => aplicarFiltros(jogos, filtros), [jogos, filtros])
  const contarCom = (jogadores: number | null) =>
    aplicarFiltros(jogos, { ...filtros, jogadores }).length

  const temFiltro =
    filtros.jogadores !== null || filtros.soDisponiveis || filtros.tags.length > 0

  return (
    <div className="container-site py-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase text-petroleo md:text-[56px]">
        Acervo
      </h1>
      <p className="mt-1 font-corpo text-[15px] text-[color:var(--cor-grafite-70)] md:text-lg">
        {visiveis.length === jogos.length
          ? `${jogos.length} jogos no acervo`
          : `${visiveis.length} de ${jogos.length} jogos`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]">
        <ChipFiltro rotulo="Jogadores" ativo={filtros.jogadores !== null}>
          {(fechar) => (
            <PainelJogadores
              valor={filtros.jogadores}
              contar={contarCom}
              aoAplicar={(jogadores) => {
                setFiltros((f) => ({ ...f, jogadores }))
                fechar()
              }}
              aoLimpar={() => {
                setFiltros((f) => ({ ...f, jogadores: null }))
                fechar()
              }}
            />
          )}
        </ChipFiltro>

        <label className="inline-flex h-11 items-center gap-2.5 rounded-full border-[1.5px] border-[color:var(--cor-borda-chip)] px-4 font-corpo text-sm font-bold text-petroleo">
          Só disponíveis
          <button
            type="button"
            role="switch"
            aria-checked={filtros.soDisponiveis}
            aria-label="Só disponíveis"
            onClick={() => setFiltros((f) => ({ ...f, soDisponiveis: !f.soDisponiveis }))}
            className={`relative h-[22px] w-[38px] rounded-full transition-colors ${
              filtros.soDisponiveis ? 'bg-laranja' : 'bg-[color:var(--cor-borda-chip)]'
            }`}
          >
            <span
              className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${
                filtros.soDisponiveis ? 'left-[19px]' : 'left-[3px]'
              }`}
            />
          </button>
        </label>

        {temFiltro && (
          <Botao
            variante="secundario"
            tamanho="card"
            onClick={() => setFiltros(FILTROS_PADRAO)}
          >
            Limpar tudo
          </Botao>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-2xl font-extrabold uppercase text-petroleo">
            Nenhum jogo com esses filtros
          </p>
          <p className="mt-2 font-corpo text-[15px] text-[color:var(--cor-grafite-70)]">
            Tente afrouxar um critério, ou fale com a gente no WhatsApp que a gente sugere.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visiveis.map((jogo) => (
            <GameCard key={jogo.id} jogo={jogo} compacto />
          ))}
        </div>
      )}
    </div>
  )
}
```

Nota sobre a variante: a grade usa `compacto` sempre, e o CSS decide o tamanho. Se o time preferir card regular no desktop, trocar para `compacto={false}` dentro de um `hidden md:grid` duplicaria markup. Manter um só componente e deixar as medidas responsivas no CSS do card é a escolha deste plano.

- [ ] **Step 6: Criar `app/(site)/acervo/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { GradeAcervo } from '@/components/catalog/GradeAcervo'
import { listarJogos } from '@/lib/catalog/queries'

export const metadata: Metadata = {
  title: 'Acervo | Jogo na Caixa',
  description:
    'Todos os jogos de tabuleiro disponíveis para aluguel. Filtre por quantas pessoas vão jogar e reserve sem cadastro.',
}

export const revalidate = 300

export default async function AcervoPage() {
  const jogos = await listarJogos()
  return <GradeAcervo jogos={jogos} />
}
```

- [ ] **Step 7: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/acervo.test.tsx`
Expected: PASS, 6 testes.

- [ ] **Step 8: Commit**

```bash
git add components/catalog "app/(site)/acervo/page.tsx" tests/acervo.test.tsx
git commit -m "feat: pagina do acervo com grade, filtro de jogadores e estado vazio"
```

---

### Task 10: Ficha do jogo

Uma rota por jogo, gerada estaticamente. É a página que traz tráfego de busca, então os metadados importam tanto quanto o visual.

**Files:**
- Create: `app/(site)/acervo/[slug]/page.tsx`
- Create: `components/game/FichaTecnica.tsx`, `components/game/Galeria.tsx`
- Test: `tests/ficha.test.tsx`

**Interfaces:**
- Consumes: `buscarJogoPorSlug`, `listarJogos` (Task 4); `BlocoPreco`, `SeloStatus`, `Pilula`, `MarcadorComplexidade`, `Botao` (Task 5); `formatarJogadores`, `formatarDuracao` (Task 2)
- Produces: `<FichaTecnica jogo={Jogo} />`, `<Galeria fotos={Foto[]} nome={string} />`

- [ ] **Step 1: Escrever o teste que falha**

`tests/ficha.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FichaTecnica } from '@/components/game/FichaTecnica'
import { Galeria } from '@/components/game/Galeria'
import type { Jogo } from '@/lib/types'

const azul: Jogo = {
  id: '1', slug: 'azul', nome: 'Azul', descricao: 'Azulejos.', capaUrl: null,
  minJogadores: 2, maxJogadores: 4, duracaoMin: 30, duracaoMax: 45,
  idadeMinima: 8, complexidade: 1.8, complexidadeLabel: 'Leve',
  designers: ['Michael Kiesling'], editora: 'Galápagos Jogos',
  categorias: ['Abstrato', 'Família'],
  mecanicas: ['Coleção de conjuntos', 'Montagem de padrões'],
  tier: { id: 't', nome: 'Caixa Média', preco3Dias: 30, preco7Dias: 40, ordem: 2 },
  status: 'disponivel', disponivelEm: null, destaque: true,
  tags: ['Bonito na mesa'], fotos: [], criadoEm: '2026-01-15',
}

describe('FichaTecnica', () => {
  it('mostra as linhas da ficha em portugues', () => {
    render(<FichaTecnica jogo={azul} />)
    expect(screen.getByText('2 a 4 pessoas')).toBeInTheDocument()
    expect(screen.getByText('30 a 45 min')).toBeInTheDocument()
    expect(screen.getByText('A partir de 8 anos')).toBeInTheDocument()
    expect(screen.getByText('Michael Kiesling')).toBeInTheDocument()
    expect(screen.getByText('Galápagos Jogos')).toBeInTheDocument()
  })

  it('junta categorias e mecanicas com separador', () => {
    render(<FichaTecnica jogo={azul} />)
    expect(screen.getByText('Abstrato · Família')).toBeInTheDocument()
    expect(screen.getByText('Coleção de conjuntos · Montagem de padrões')).toBeInTheDocument()
  })

  it('mostra o marcador de complexidade com o rotulo', () => {
    render(<FichaTecnica jogo={azul} />)
    expect(screen.getByLabelText('Complexidade: Leve')).toBeInTheDocument()
  })

  it('omite a linha de editora quando o dado nao existe', () => {
    render(<FichaTecnica jogo={{ ...azul, editora: null }} />)
    expect(screen.queryByText('Editora no Brasil')).not.toBeInTheDocument()
  })
})

describe('Galeria', () => {
  it('mostra placeholder quando nao ha foto', () => {
    render(<Galeria fotos={[]} nome="Azul" />)
    expect(screen.getByTestId('placeholder-foto')).toBeInTheDocument()
  })

  it('troca a foto principal ao clicar na miniatura', async () => {
    render(
      <Galeria
        nome="Azul"
        fotos={[
          { url: 'https://exemplo/1.jpg', legenda: null },
          { url: 'https://exemplo/2.jpg', legenda: null },
        ]}
      />,
    )
    expect(screen.getByTestId('foto-principal')).toHaveAttribute('src', 'https://exemplo/1.jpg')
    await userEvent.click(screen.getByRole('button', { name: 'Ver foto 2 de Azul' }))
    expect(screen.getByTestId('foto-principal')).toHaveAttribute('src', 'https://exemplo/2.jpg')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/ficha.test.tsx`
Expected: FAIL, não resolve `@/components/game/FichaTecnica`.

- [ ] **Step 3: Criar `components/game/FichaTecnica.tsx`**

```tsx
import { MarcadorComplexidade } from '@/components/ui/MarcadorComplexidade'
import { formatarDuracao } from '@/lib/format'
import type { Jogo } from '@/lib/types'

export function FichaTecnica({ jogo }: { jogo: Jogo }) {
  const linhas: { rotulo: string; valor: React.ReactNode }[] = [
    {
      rotulo: 'Complexidade',
      valor: (
        <span className="flex items-center gap-3">
          <MarcadorComplexidade complexidade={jogo.complexidadeLabel} />
          <span>{jogo.complexidadeLabel}</span>
        </span>
      ),
    },
    {
      rotulo: 'Jogadores',
      valor:
        jogo.minJogadores === jogo.maxJogadores
          ? `${jogo.minJogadores} pessoas`
          : `${jogo.minJogadores} a ${jogo.maxJogadores} pessoas`,
    },
    { rotulo: 'Duração', valor: formatarDuracao(jogo.duracaoMin, jogo.duracaoMax) },
    { rotulo: 'Idade', valor: `A partir de ${jogo.idadeMinima} anos` },
    ...(jogo.designers.length ? [{ rotulo: 'Designer', valor: jogo.designers.join(' · ') }] : []),
    ...(jogo.editora ? [{ rotulo: 'Editora no Brasil', valor: jogo.editora }] : []),
    ...(jogo.categorias.length ? [{ rotulo: 'Categorias', valor: jogo.categorias.join(' · ') }] : []),
    ...(jogo.mecanicas.length ? [{ rotulo: 'Mecânicas', valor: jogo.mecanicas.join(' · ') }] : []),
  ]

  return (
    <section>
      <h2 className="font-display text-[26px] font-extrabold uppercase text-petroleo md:text-[32px]">
        Ficha técnica
      </h2>
      <dl className="mt-4 rounded-[18px] bg-white p-1 shadow-[var(--shadow-card)]">
        {linhas.map(({ rotulo, valor }, i) => (
          <div
            key={rotulo}
            className={`grid gap-1 px-4 py-4 md:grid-cols-[200px_1fr] ${
              i > 0 ? 'border-t border-[color:var(--cor-borda)]' : ''
            }`}
          >
            <dt className="font-corpo text-sm font-bold text-[color:var(--cor-grafite-70)]">
              {rotulo}
            </dt>
            <dd className="font-corpo text-[15px]">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

- [ ] **Step 4: Criar `components/game/Galeria.tsx`**

```tsx
'use client'

import { useState } from 'react'
import type { Foto } from '@/lib/types'

export function Galeria({ fotos, nome }: { fotos: Foto[]; nome: string }) {
  const [ativa, setAtiva] = useState(0)

  if (fotos.length === 0) {
    return (
      <div
        data-testid="placeholder-foto"
        className="aspect-[4/3] w-full rounded-[20px] bg-[repeating-linear-gradient(45deg,rgba(45,107,125,.08)_0_10px,rgba(45,107,125,.03)_10px_20px)]"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <img
        data-testid="foto-principal"
        src={fotos[ativa].url}
        alt={fotos[ativa].legenda ?? nome}
        className="aspect-[4/3] w-full rounded-[20px] object-cover transition-opacity duration-200"
      />
      {fotos.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {fotos.map((foto, i) => (
            <button
              key={foto.url}
              type="button"
              aria-label={`Ver foto ${i + 1} de ${nome}`}
              onClick={() => setAtiva(i)}
              className={`aspect-[4/3] overflow-hidden rounded-[10px] ${
                i === ativa ? 'outline outline-[2.5px] outline-petroleo' : ''
              }`}
            >
              <img src={foto.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Criar `app/(site)/acervo/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Galeria } from '@/components/game/Galeria'
import { FichaTecnica } from '@/components/game/FichaTecnica'
import { BlocoPreco } from '@/components/ui/BlocoPreco'
import { SeloStatus } from '@/components/ui/SeloStatus'
import { Pilula } from '@/components/ui/Pilula'
import { Botao } from '@/components/ui/Botao'
import { buscarJogoPorSlug, listarJogos } from '@/lib/catalog/queries'
import { formatarDuracao, formatarJogadores } from '@/lib/format'

export const revalidate = 300

export async function generateStaticParams() {
  const jogos = await listarJogos()
  return jogos.map((jogo) => ({ slug: jogo.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const jogo = await buscarJogoPorSlug(slug)
  if (!jogo) return { title: 'Jogo não encontrado | Jogo na Caixa' }

  return {
    title: `Alugar ${jogo.nome} | Jogo na Caixa`,
    description: `${jogo.nome} para alugar por 3 ou 7 dias. ${formatarJogadores(
      jogo.minJogadores,
      jogo.maxJogadores,
    )}, ${formatarDuracao(jogo.duracaoMin, jogo.duracaoMax)}. Reserve sem cadastro.`,
  }
}

export default async function FichaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const jogo = await buscarJogoPorSlug(slug)
  if (!jogo) notFound()

  const disponivel = jogo.status === 'disponivel'

  return (
    <div className="container-site py-8">
      <Link href="/acervo" className="font-corpo text-sm font-bold text-petroleo">
        ‹ Acervo
      </Link>

      <div className="mt-5 grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex flex-col gap-14">
          <Galeria fotos={jogo.fotos} nome={jogo.nome} />

          <section>
            <h2 className="font-display text-[26px] font-extrabold uppercase text-petroleo md:text-[32px]">
              Sobre o jogo
            </h2>
            <p className="mt-4 max-w-[680px] font-corpo text-[15px] leading-[1.65] md:text-[17px]">
              {jogo.descricao}
            </p>
          </section>

          <FichaTecnica jogo={jogo} />

          {jogo.tags.length > 0 && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold uppercase text-petroleo md:text-[32px]">
                Tags
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {jogo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-10 items-center rounded-full border border-[color:var(--cor-borda-chip)] bg-white px-4 font-corpo text-sm font-bold text-petroleo"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-5 rounded-[20px] bg-white p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <SeloStatus status={jogo.status} disponivelEm={jogo.disponivelEm} />
              <span className="inline-flex items-center gap-2 rounded-full bg-creme px-3 py-1.5 font-corpo text-xs font-bold text-grafite">
                <span className="h-2.5 w-2.5 rounded-sm bg-laranja" />
                {jogo.tier.nome}
              </span>
            </div>

            <h1 className="font-display text-[44px] font-extrabold uppercase leading-none text-petroleo md:text-[60px]">
              {jogo.nome}
            </h1>

            <div className="flex flex-wrap gap-2">
              <Pilula>{formatarJogadores(jogo.minJogadores, jogo.maxJogadores)}</Pilula>
              <Pilula>{formatarDuracao(jogo.duracaoMin, jogo.duracaoMax)}</Pilula>
              <Pilula>{jogo.idadeMinima}+</Pilula>
              <Pilula>{jogo.complexidadeLabel}</Pilula>
            </div>

            <BlocoPreco tier={jogo.tier} />

            <Botao variante={disponivel ? 'primario' : 'secundario'} tamanho="grande">
              {disponivel ? 'Alugar' : 'Avise-me'}
            </Botao>

            <p className="text-center font-corpo text-[13px] text-[color:var(--cor-grafite-70)]">
              Você escolhe o período na hora de reservar.
              <br />
              Até 3 jogos por reserva · Sem cadastro
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/ficha.test.tsx`
Expected: PASS, 6 testes.

- [ ] **Step 7: Commit**

```bash
git add components/game/FichaTecnica.tsx components/game/Galeria.tsx \
        "app/(site)/acervo/[slug]/page.tsx" tests/ficha.test.tsx
git commit -m "feat: ficha do jogo com galeria, ficha tecnica e metadados de busca"
```

---
### Task 11: Home

Cinco blocos na ordem do handoff. O bloco de ocasiões é o que mais importa para o negócio: o cliente não sabe o nome do jogo, ele sabe quem vai estar na mesa. Cada bloco é um link para o acervo já filtrado, o que só funciona porque a Task 8 colocou o estado na URL.

**Files:**
- Create: `app/(site)/page.tsx`
- Create: `components/home/Hero.tsx`, `components/home/Ocasioes.tsx`, `components/home/ComoFunciona.tsx`, `components/home/ChamadaWhatsApp.tsx`
- Test: `tests/home.test.tsx`

**Interfaces:**
- Consumes: `listarDestaques` (Task 4); `GameCard` (Task 6); `Botao` (Task 5); `linkWhatsApp` (Task 7)
- Produces: `<Hero />`, `<Ocasioes />`, `<ComoFunciona />`, `<ChamadaWhatsApp />`

- [ ] **Step 1: Escrever o teste que falha**

`tests/home.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/home/Hero'
import { Ocasioes } from '@/components/home/Ocasioes'
import { ComoFunciona } from '@/components/home/ComoFunciona'
import { ChamadaWhatsApp } from '@/components/home/ChamadaWhatsApp'

describe('Hero', () => {
  it('traz a promessa e o caminho para o acervo', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /MAIS MESA, MENOS TELA/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver o acervo/i })).toHaveAttribute('href', '/acervo')
  })

  it('diz de cara que nao precisa cadastro', () => {
    render(<Hero />)
    expect(screen.getByText(/Sem cadastro/i)).toBeInTheDocument()
  })
})

describe('Ocasioes', () => {
  it('oferece as quatro ocasioes', () => {
    render(<Ocasioes />)
    for (const rotulo of ['2 JOGADORES', 'PARA A FAMÍLIA', 'FESTA COM A GALERA', 'RÁPIDO, ATÉ 30 MIN']) {
      expect(screen.getByText(rotulo)).toBeInTheDocument()
    }
  })

  it('cada ocasiao leva ao acervo ja filtrado', () => {
    render(<Ocasioes />)
    expect(screen.getByRole('link', { name: /2 JOGADORES/ })).toHaveAttribute(
      'href',
      '/acervo?jogadores=2',
    )
    expect(screen.getByRole('link', { name: /RÁPIDO/ })).toHaveAttribute(
      'href',
      '/acervo?duracao=ate30',
    )
    expect(screen.getByRole('link', { name: /FESTA/ })).toHaveAttribute(
      'href',
      '/acervo?jogadores=6',
    )
  })
})

describe('ComoFunciona', () => {
  it('mostra os tres passos na ordem', () => {
    render(<ComoFunciona />)
    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['ESCOLHA', 'RESERVE', 'RETIRE E JOGUE'])
  })

  it('deixa claro que nao ha cartao nem senha', () => {
    render(<ComoFunciona />)
    expect(screen.getByText(/sem cadastro, sem cartão, sem senha/i)).toBeInTheDocument()
  })
})

describe('ChamadaWhatsApp', () => {
  it('leva para o whatsapp em nova aba', () => {
    process.env.NEXT_PUBLIC_WHATSAPP = '5548999999999'
    render(<ChamadaWhatsApp />)
    const link = screen.getByRole('link', { name: /Falar no WhatsApp/i })
    expect(link.getAttribute('href')).toContain('wa.me/5548999999999')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/home.test.tsx`
Expected: FAIL, não resolve `@/components/home/Hero`.

- [ ] **Step 3: Criar os quatro blocos**

`components/home/Hero.tsx`:

```tsx
import Link from 'next/link'

const CONFIANCA = ['Sem cadastro', 'Reserva em 1 minuto', 'PIX direto no WhatsApp']

export function Hero() {
  return (
    <section className="bg-petroleo py-16 md:py-24">
      <div className="container-site flex max-w-[640px] flex-col gap-6 md:max-w-none">
        <h1 className="max-w-[640px] font-display text-[54px] font-extrabold uppercase leading-[.95] text-white md:text-[84px]">
          Mais mesa, menos tela
        </h1>
        <p className="max-w-[540px] font-corpo text-base text-white/85 md:text-xl">
          Jogos de tabuleiro pra alugar por 3 ou 7 dias. Você escolhe, reserva sem cadastro e
          combina a retirada pelo WhatsApp.
        </p>
        <Link
          href="/acervo"
          className="inline-flex h-14 w-full items-center justify-center rounded-[14px] bg-laranja px-7 font-corpo text-base font-extrabold text-white hover:bg-laranja-hover md:w-auto md:self-start"
        >
          Ver o acervo
        </Link>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 font-corpo text-sm font-semibold text-white/80">
          {CONFIANCA.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-white" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

`components/home/Ocasioes.tsx`:

```tsx
import Link from 'next/link'

const OCASIOES = [
  { rotulo: '2 JOGADORES', href: '/acervo?jogadores=2' },
  { rotulo: 'PARA A FAMÍLIA', href: '/acervo?tags=Pra+jogar+em+fam%C3%ADlia' },
  { rotulo: 'FESTA COM A GALERA', href: '/acervo?jogadores=6' },
  { rotulo: 'RÁPIDO, ATÉ 30 MIN', href: '/acervo?duracao=ate30' },
]

export function Ocasioes() {
  return (
    <section className="container-site py-10 md:py-[72px]">
      <h2 className="font-display text-[32px] font-extrabold uppercase text-petroleo md:text-[40px]">
        Pra qual ocasião?
      </h2>
      <p className="mt-2 font-corpo text-[15px] text-[color:var(--cor-grafite-70)] md:text-[17px]">
        Você não precisa saber o nome do jogo. Só quem vai estar na mesa.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {OCASIOES.map(({ rotulo, href }) => (
          <Link
            key={rotulo}
            href={href}
            className="flex min-h-[150px] items-end rounded-[18px] bg-petroleo p-5 font-display text-xl font-extrabold uppercase leading-tight text-white transition-transform hover:-translate-y-0.5 md:min-h-[240px] md:text-[28px]"
          >
            {rotulo}
          </Link>
        ))}
      </div>
    </section>
  )
}
```

`components/home/ComoFunciona.tsx`:

```tsx
const PASSOS = [
  {
    titulo: 'ESCOLHA',
    texto: 'Filtre por quantas pessoas vão jogar ou pela ocasião. Dá pra levar até 3 jogos de uma vez.',
  },
  {
    titulo: 'RESERVE',
    texto: 'Nome, WhatsApp e a data de retirada. Sem cadastro, sem cartão, sem senha.',
  },
  {
    titulo: 'RETIRE E JOGUE',
    texto: 'A gente combina o PIX e a retirada na conversa. Depois é só chamar a galera pra mesa.',
  },
]

export function ComoFunciona() {
  return (
    <section className="container-site py-10 md:py-[72px]">
      <h2 className="font-display text-[32px] font-extrabold uppercase text-petroleo md:text-[40px]">
        Como funciona
      </h2>
      <p className="mt-2 font-corpo text-[15px] text-[color:var(--cor-grafite-70)] md:text-[17px]">
        Do sofá pra mesa em três passos.
      </p>

      <ol className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
        {PASSOS.map(({ titulo, texto }, i) => (
          <li key={titulo} className="rounded-[18px] bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-petroleo font-display text-[22px] font-extrabold text-white md:h-13 md:w-13">
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-[22px] font-bold uppercase text-petroleo md:text-[26px]">
              {titulo}
            </h3>
            <p className="mt-2 font-corpo text-[15px] leading-relaxed md:text-base">{texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

`components/home/ChamadaWhatsApp.tsx`:

```tsx
import { linkWhatsApp } from '@/components/layout/BotaoWhatsApp'

export function ChamadaWhatsApp() {
  const mensagem =
    'Olá! Vim pelo site. Pode me ajudar a escolher um jogo? Vou jogar com ___ pessoas.'

  return (
    <section className="container-site pb-10 md:pb-[72px]">
      <div className="rounded-3xl bg-petroleo p-8 md:p-14">
        <h2 className="font-display text-[32px] font-extrabold uppercase leading-none text-white md:text-[44px]">
          Não sabe qual escolher?
        </h2>
        <p className="mt-4 max-w-[560px] font-corpo text-base text-white/85 md:text-lg">
          Fala com a gente. Conta quantas pessoas vão jogar e a gente sugere um jogo que combina
          com a sua mesa.
        </p>
        <a
          href={linkWhatsApp(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-14 items-center rounded-[14px] bg-verde px-7 font-corpo text-base font-extrabold text-white hover:bg-verde-hover"
        >
          Falar no WhatsApp
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Criar `app/(site)/page.tsx`**

```tsx
import { Hero } from '@/components/home/Hero'
import { Ocasioes } from '@/components/home/Ocasioes'
import { ComoFunciona } from '@/components/home/ComoFunciona'
import { ChamadaWhatsApp } from '@/components/home/ChamadaWhatsApp'
import { GameCard } from '@/components/game/GameCard'
import { listarDestaques } from '@/lib/catalog/queries'

export const revalidate = 300

export default async function HomePage() {
  const destaques = await listarDestaques()

  return (
    <>
      <Hero />

      <section className="container-site py-10 md:py-[72px]">
        <h2 className="font-display text-[32px] font-extrabold uppercase text-petroleo md:text-[40px]">
          Em destaque
        </h2>
        <p className="mt-2 font-corpo text-[15px] text-[color:var(--cor-grafite-70)] md:text-[17px]">
          Os que mais saem por aqui.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {destaques.map((jogo) => (
            <GameCard key={jogo.id} jogo={jogo} compacto />
          ))}
        </div>
      </section>

      <Ocasioes />
      <ComoFunciona />
      <ChamadaWhatsApp />
    </>
  )
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npm test -- tests/home.test.tsx`
Expected: PASS, 7 testes.

- [ ] **Step 6: Commit**

```bash
git add components/home "app/(site)/page.tsx" tests/home.test.tsx
git commit -m "feat: home com hero, destaques, ocasioes e como funciona"
```

---

### Task 12: Estado do carrinho

O carrinho guarda no máximo 3 jogos e sobrevive a recarregar a página. Não há página de carrinho neste plano, só o estado e o contador, porque a tela ainda não foi desenhada.

**Files:**
- Create: `lib/cart/cart-store.ts`, `components/cart/CarrinhoProvider.tsx`
- Modify: `app/(site)/layout.tsx` (ler o contador real), `components/game/GameCard.tsx` (ligar o botão)
- Test: `tests/carrinho.test.tsx`

**Interfaces:**
- Consumes: `Jogo`, `PeriodoDias` (Task 2)
- Produces:
  - `const LIMITE_DE_JOGOS = 3`
  - `interface Carrinho { itens: Jogo[]; periodo: PeriodoDias }`
  - `adicionar(carrinho: Carrinho, jogo: Jogo): Carrinho`
  - `remover(carrinho: Carrinho, id: string): Carrinho`
  - `total(carrinho: Carrinho): number`
  - `<CarrinhoProvider>` e o hook `useCarrinho()` devolvendo `{ carrinho, adicionar, remover, cheio }`

- [ ] **Step 1: Escrever o teste que falha**

`tests/carrinho.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { LIMITE_DE_JOGOS, adicionar, remover, total, type Carrinho } from '@/lib/cart/cart-store'
import type { Jogo } from '@/lib/types'

function jogo(id: string, preco7: number, preco3 = 20): Jogo {
  return {
    id, slug: id, nome: id, descricao: '', capaUrl: null,
    minJogadores: 2, maxJogadores: 4, duracaoMin: 30, duracaoMax: 45,
    idadeMinima: 8, complexidade: 2, complexidadeLabel: 'Leve',
    designers: [], editora: null, categorias: [], mecanicas: [],
    tier: { id: 't', nome: 'Caixa', preco3Dias: preco3, preco7Dias: preco7, ordem: 1 },
    status: 'disponivel', disponivelEm: null, destaque: false,
    tags: [], fotos: [], criadoEm: '2026-01-01',
  }
}

const vazio: Carrinho = { itens: [], periodo: 7 }

describe('carrinho', () => {
  it('adiciona um jogo', () => {
    expect(adicionar(vazio, jogo('azul', 40)).itens).toHaveLength(1)
  })

  it('nao adiciona o mesmo jogo duas vezes', () => {
    const c = adicionar(adicionar(vazio, jogo('azul', 40)), jogo('azul', 40))
    expect(c.itens).toHaveLength(1)
  })

  it('para no limite de tres jogos', () => {
    expect(LIMITE_DE_JOGOS).toBe(3)
    let c = vazio
    for (const id of ['a', 'b', 'c', 'd']) c = adicionar(c, jogo(id, 40))
    expect(c.itens).toHaveLength(3)
    expect(c.itens.map((j) => j.id)).toEqual(['a', 'b', 'c'])
  })

  it('remove por id', () => {
    const c = adicionar(adicionar(vazio, jogo('a', 40)), jogo('b', 30))
    expect(remover(c, 'a').itens.map((j) => j.id)).toEqual(['b'])
  })

  it('ignorar remocao de id inexistente nao quebra', () => {
    expect(remover(vazio, 'x').itens).toEqual([])
  })

  it('soma o total pelo periodo escolhido', () => {
    let c = adicionar(adicionar(vazio, jogo('a', 40, 30)), jogo('b', 30, 20))
    expect(total(c)).toBe(70)
    c = { ...c, periodo: 3 }
    expect(total(c)).toBe(50)
  })

  it('carrinho vazio soma zero', () => {
    expect(total(vazio)).toBe(0)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- tests/carrinho.test.tsx`
Expected: FAIL, não resolve `@/lib/cart/cart-store`.

- [ ] **Step 3: Criar `lib/cart/cart-store.ts`**

```ts
import type { Jogo, PeriodoDias } from '@/lib/types'

export const LIMITE_DE_JOGOS = 3

export interface Carrinho {
  itens: Jogo[]
  periodo: PeriodoDias
}

export const CARRINHO_VAZIO: Carrinho = { itens: [], periodo: 7 }

export function adicionar(carrinho: Carrinho, jogo: Jogo): Carrinho {
  const jaTem = carrinho.itens.some((item) => item.id === jogo.id)
  if (jaTem || carrinho.itens.length >= LIMITE_DE_JOGOS) return carrinho
  return { ...carrinho, itens: [...carrinho.itens, jogo] }
}

export function remover(carrinho: Carrinho, id: string): Carrinho {
  return { ...carrinho, itens: carrinho.itens.filter((item) => item.id !== id) }
}

export function total(carrinho: Carrinho): number {
  return carrinho.itens.reduce(
    (soma, item) =>
      soma + (carrinho.periodo === 7 ? item.tier.preco7Dias : item.tier.preco3Dias),
    0,
  )
}
```

- [ ] **Step 4: Criar `components/cart/CarrinhoProvider.tsx`**

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  CARRINHO_VAZIO,
  LIMITE_DE_JOGOS,
  adicionar as adicionarItem,
  remover as removerItem,
  type Carrinho,
} from '@/lib/cart/cart-store'
import type { Jogo } from '@/lib/types'

const CHAVE = 'jogo-na-caixa:carrinho'

interface Contexto {
  carrinho: Carrinho
  adicionar: (jogo: Jogo) => void
  remover: (id: string) => void
  cheio: boolean
}

const CarrinhoContexto = createContext<Contexto | null>(null)

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<Carrinho>(CARRINHO_VAZIO)

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE)
      if (salvo) setCarrinho(JSON.parse(salvo) as Carrinho)
    } catch {
      // localStorage indisponivel ou conteudo corrompido: segue com carrinho vazio
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(carrinho))
    } catch {
      // sem persistencia nesta sessao, o carrinho ainda funciona em memoria
    }
  }, [carrinho])

  return (
    <CarrinhoContexto.Provider
      value={{
        carrinho,
        adicionar: (jogo) => setCarrinho((c) => adicionarItem(c, jogo)),
        remover: (id) => setCarrinho((c) => removerItem(c, id)),
        cheio: carrinho.itens.length >= LIMITE_DE_JOGOS,
      }}
    >
      {children}
    </CarrinhoContexto.Provider>
  )
}

export function useCarrinho(): Contexto {
  const contexto = useContext(CarrinhoContexto)
  if (!contexto) throw new Error('useCarrinho precisa estar dentro de CarrinhoProvider')
  return contexto
}
```

O carregamento acontece em `useEffect` de propósito. Ler `localStorage` durante a renderização quebraria a hidratação, porque o servidor não tem como saber o que há no navegador.

- [ ] **Step 5: Ligar no layout e no card**

Em `app/(site)/layout.tsx`, envolver tudo com `CarrinhoProvider` e trocar o contador fixo. Como header e barra de abas passam a ler contexto, extrair um componente cliente:

`components/layout/MolduraCliente.tsx`:

```tsx
'use client'

import { SiteHeader } from './SiteHeader'
import { TabBar } from './TabBar'
import { useCarrinho } from '@/components/cart/CarrinhoProvider'

export function CabecalhoComCarrinho() {
  return <SiteHeader itensNoCarrinho={useCarrinho().carrinho.itens.length} />
}

export function AbasComCarrinho() {
  return <TabBar itensNoCarrinho={useCarrinho().carrinho.itens.length} />
}
```

`app/(site)/layout.tsx` passa a ser:

```tsx
import { CarrinhoProvider } from '@/components/cart/CarrinhoProvider'
import { CabecalhoComCarrinho, AbasComCarrinho } from '@/components/layout/MolduraCliente'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { BotaoWhatsApp } from '@/components/layout/BotaoWhatsApp'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CarrinhoProvider>
      <CabecalhoComCarrinho />
      <main className="pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <BotaoWhatsApp />
      <AbasComCarrinho />
    </CarrinhoProvider>
  )
}
```

Em `components/game/GameCard.tsx`, trocar o `aoAlugar` opcional por uso direto do contexto quando ele não for passado:

```tsx
import { useCarrinho } from '@/components/cart/CarrinhoProvider'

// dentro do componente, antes do return:
const { adicionar, cheio } = useCarrinho()
const aoClicar = () => (aoAlugar ? aoAlugar(jogo) : adicionar(jogo))

// no botao:
<Botao
  variante={disponivel ? 'primario' : 'secundario'}
  tamanho="card"
  disabled={disponivel && cheio}
  title={disponivel && cheio ? 'Sua caixa já tem 3 jogos' : undefined}
  onClick={aoClicar}
>
```

Os testes das Tasks 6 e 9 já passam `aoAlugar` ou renderizam dentro do provider. Para os que não passam, envolver o `render` com `<CarrinhoProvider>` no arquivo de teste.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS em todos os arquivos. Se `tests/game-card.test.tsx` ou `tests/acervo.test.tsx` falharem com "useCarrinho precisa estar dentro de CarrinhoProvider", envolver o `render` daquele teste com o provider.

- [ ] **Step 7: Commit**

```bash
git add lib/cart components/cart components/layout/MolduraCliente.tsx \
        "app/(site)/layout.tsx" components/game/GameCard.tsx tests/carrinho.test.tsx
git commit -m "feat: carrinho com limite de tres jogos e contador no header"
```

---

### Task 13: Testes de ponta a ponta e preview do pull request

Fecha o ciclo: a CI passa a construir a aplicação, rodar os testes de navegador e publicar um preview por pull request.

**Files:**
- Create: `playwright.config.ts`, `e2e/catalogo.spec.ts`
- Modify: `.github/workflows/ci.yml`
- Create: `vercel.json`

**Interfaces:**
- Consumes: todas as páginas das Tasks 9 a 11
- Produces: comando `npm run e2e`; job de e2e na CI; URL de preview comentada em cada PR

- [ ] **Step 1: Criar `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

- [ ] **Step 2: Escrever o teste de ponta a ponta**

`e2e/catalogo.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('da home ao acervo e ate a ficha do jogo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /MAIS MESA, MENOS TELA/i })).toBeVisible()

  await page.getByRole('link', { name: /Ver o acervo/i }).click()
  await expect(page).toHaveURL(/\/acervo$/)
  await expect(page.getByText(/jogos no acervo/)).toBeVisible()

  await page.getByRole('link', { name: 'Azul' }).first().click()
  await expect(page).toHaveURL(/\/acervo\/azul$/)
  await expect(page.getByRole('heading', { name: 'AZUL', level: 1 })).toBeVisible()
  await expect(page.getByText('R$ 40')).toBeVisible()
})

test('bloco de ocasiao leva ao acervo ja filtrado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /2 JOGADORES/ }).click()
  await expect(page).toHaveURL(/jogadores=2/)
})

test('o botao alugar incrementa o contador do carrinho', async ({ page }) => {
  await page.goto('/acervo')
  await page.getByRole('button', { name: 'Alugar' }).first().click()
  await expect(page.getByTestId('contador-carrinho')).toHaveText('1')
})

test('jogo alugado mostra a data de retorno e nao oferece alugar', async ({ page }) => {
  await page.goto('/acervo/catan')
  await expect(page.getByText('Volta 18/09')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Avise-me' })).toBeVisible()
})
```

- [ ] **Step 3: Rodar localmente**

Run: `npx playwright install --with-deps chromium && npm run e2e`
Expected: 8 testes passando (4 cenários em 2 perfis). Requer `.env.local` preenchido com as chaves do Supabase.

- [ ] **Step 4: Estender a CI**

Em `.github/workflows/ci.yml`, o job `aplicacao` já detecta `package.json` e roda lint, testes e build. Acrescentar o job de navegador depois dele:

```yaml
  e2e:
    name: Navegador
    runs-on: ubuntu-latest
    needs: aplicacao
    steps:
      - uses: actions/checkout@v4

      - name: Detectar aplicacao
        id: detectar
        run: |
          if [ -f playwright.config.ts ]; then
            echo "existe=true" >> "$GITHUB_OUTPUT"
          else
            echo "existe=false" >> "$GITHUB_OUTPUT"
          fi

      - uses: actions/setup-node@v4
        if: steps.detectar.outputs.existe == 'true'
        with:
          node-version: '22'

      - name: Instalar
        if: steps.detectar.outputs.existe == 'true'
        run: npm ci

      - name: Instalar navegador
        if: steps.detectar.outputs.existe == 'true'
        run: npx playwright install --with-deps chromium

      - name: Rodar e2e
        if: steps.detectar.outputs.existe == 'true'
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_WHATSAPP: ${{ secrets.NEXT_PUBLIC_WHATSAPP }}
        run: npm run e2e
```

Cadastrar os três segredos em Settings, Secrets and variables, Actions. A chave anônima do Supabase é pública por natureza (vai para o navegador de qualquer visitante), então guardá-la como segredo é organização, não sigilo.

- [ ] **Step 5: Ligar o preview por pull request**

O site usa Server Components e, na sequência, Server Actions para a reserva. Isso exige servidor, então **GitHub Pages não serve para prever a aplicação**: Pages só entrega arquivos estáticos. O preview por PR fica na Vercel, que é nativa para Next.js e comenta a URL em cada pull request.

Passos, feitos uma vez:

1. Importar o repositório em vercel.com, escolhendo o framework Next.js.
2. Cadastrar as três variáveis de ambiente nos três escopos (Production, Preview, Development).
3. Confirmar que Preview Deployments está ligado para pull requests.

`vercel.json`:

```json
{
  "framework": "nextjs",
  "regions": ["gru1"],
  "github": { "silent": false }
}
```

A região `gru1` é São Paulo, que é onde está o público.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e vercel.json .github/workflows/ci.yml package.json
git commit -m "feat: testes de ponta a ponta e preview por pull request na vercel"
```

---

## Autoavaliação do plano

**Cobertura da spec.** Cada requisito da spec que cabe neste escopo tem tarefa: modelo de dados (Task 3), leitura pública com RLS (Tasks 3 e 4), Home, Acervo e Ficha (Tasks 9 a 11), filtros com destaque para número de jogadores (Tasks 8 e 9), disponibilidade com data de retorno (Tasks 2, 5 e 6), carrinho com limite de 3 (Task 12), mobile com barra de abas e WhatsApp flutuante (Task 7), SEO por rota de jogo (Task 10). Ficam descobertos, por decisão declarada no início: páginas de Carrinho, Reserva, Confirmação e Como funciona, painel administrativo, importador Ludopedia e lista de espera. As rotas `/como-funciona`, `/contato` e `/carrinho` são linkadas pelo header e pela barra de abas e ainda não existem, então retornarão 404 até a rodada 2. Isso é intencional e está registrado aqui para não virar surpresa.

**Placeholders.** Nenhum "TBD" ou "implementar depois". Todos os passos de código trazem o código.

**Consistência de tipos.** `Jogo` ganhou `criadoEm` na Task 2, mapeado de `created_at` na Task 4, consumido na ordenação por novidades da Task 8 e presente em todos os fixtures de teste. `StatusJogo` usa os três valores em português do banco até o componente, sem tradução no meio. `aplicarFiltros`, `lerFiltrosDaUrl` e `escreverFiltrosNaUrl` têm o mesmo nome em definição e uso.

**Questão aberta que depende do dono:** os preços de 3 dias das três faixas. O seed assume R$ 20, R$ 30 e R$ 35. Como são linhas de `pricing_tiers`, corrigir é editar dado.
