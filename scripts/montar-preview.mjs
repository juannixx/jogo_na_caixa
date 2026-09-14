#!/usr/bin/env node
// Monta o site estatico de preview a partir do handoff de design.
// O canvas de artboards vira a raiz; os componentes ficam ao lado porque
// o runtime do handoff os carrega por fetch relativo.

import { mkdir, readdir, copyFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ORIGEM = 'docs/design_handoff_jogo_na_caixa'
const DESTINO = '_site'
const CANVAS = 'Jogo na Caixa - Mockups.dc.html'

await rm(DESTINO, { recursive: true, force: true })
await mkdir(DESTINO, { recursive: true })

const arquivos = await readdir(ORIGEM)
const copiados = []

for (const arquivo of arquivos) {
  if (!/\.(dc\.html|js)$/.test(arquivo)) continue
  const alvo = arquivo === CANVAS ? 'index.html' : arquivo
  await copyFile(join(ORIGEM, arquivo), join(DESTINO, alvo))
  copiados.push(alvo)
}

if (!copiados.includes('index.html')) {
  console.error(`Canvas nao encontrado: ${join(ORIGEM, CANVAS)}`)
  process.exit(1)
}

// Evita que o Jekyll do GitHub Pages reprocesse os arquivos.
await writeFile(join(DESTINO, '.nojekyll'), '')

console.log(`Preview montado em ${DESTINO}/ com ${copiados.length} arquivos:`)
for (const a of copiados.sort()) console.log(`  ${a}`)
