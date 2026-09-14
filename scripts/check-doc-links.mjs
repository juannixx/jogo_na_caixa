#!/usr/bin/env node
// Verifica se todo link relativo entre arquivos markdown aponta para um alvo existente.
// Sem dependencias e sem rede: roda igual na CI e na maquina local.

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve, relative, extname } from 'node:path'

const RAIZ = process.cwd()
const IGNORAR = new Set(['node_modules', '.git', '.next', 'dist', 'build'])
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

async function listarMarkdown(dir) {
  const encontrados = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue
    const caminho = join(dir, item.name)
    if (item.isDirectory()) encontrados.push(...(await listarMarkdown(caminho)))
    else if (extname(item.name) === '.md') encontrados.push(caminho)
  }
  return encontrados
}

function ehExterno(alvo) {
  return /^(https?:|mailto:|tel:|#)/.test(alvo)
}

const arquivos = await listarMarkdown(RAIZ)
const quebrados = []

for (const arquivo of arquivos) {
  const conteudo = await readFile(arquivo, 'utf8')
  for (const [, alvo] of conteudo.matchAll(LINK)) {
    if (ehExterno(alvo)) continue
    const semAncora = alvo.split('#')[0]
    if (!semAncora) continue
    const destino = semAncora.startsWith('/')
      ? join(RAIZ, semAncora)
      : resolve(dirname(arquivo), semAncora)
    if (!existsSync(destino)) {
      quebrados.push({ arquivo: relative(RAIZ, arquivo), alvo })
    }
  }
}

console.log(`Arquivos markdown verificados: ${arquivos.length}`)

if (quebrados.length > 0) {
  console.error(`\nLinks quebrados (${quebrados.length}):`)
  for (const { arquivo, alvo } of quebrados) console.error(`  ${arquivo} -> ${alvo}`)
  process.exit(1)
}

console.log('Todos os links relativos apontam para alvos existentes.')
