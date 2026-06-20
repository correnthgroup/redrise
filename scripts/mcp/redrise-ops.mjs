#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')
const serverName = 'redrise-ops'
const serverVersion = '0.1.0'
const maxOutput = 24_000
const productionUrl = process.env.APP_BASE_URL || 'http://localhost:5173'

const text = (value) => ({ content: [{ type: 'text', text: String(value) }] })

function truncate(value) {
  const output = String(value ?? '')
  if (output.length <= maxOutput) return output
  return `${output.slice(0, maxOutput)}\n\n[truncated ${output.length - maxOutput} chars]`
}

function shell(command, { timeoutMs = 600_000, cwd = projectRoot } = {}) {
  return new Promise((resolve) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
      cwd,
      env: {
        ...process.env,
        COMSPEC: process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe',
        ComSpec: process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe',
      },
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill()
      stderr += `\nCommand timed out after ${timeoutMs}ms.`
    }, timeoutMs)
    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout: truncate(stdout), stderr: truncate(stderr) })
    })
    child.on('error', (error) => {
      clearTimeout(timer)
      resolve({ code: 1, stdout: truncate(stdout), stderr: truncate(`${stderr}\n${error.message}`) })
    })
  })
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name)
    const destinationPath = join(destination, entry.name)
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath)
    else copyFileSync(sourcePath, destinationPath)
  }
}

function prepareVercelOutput() {
  const distDir = join(projectRoot, 'dist')
  if (!existsSync(distDir)) throw new Error('dist/ does not exist. Run build_frontend first.')
  const outputDir = join(projectRoot, '.vercel', 'output')
  const staticDir = join(outputDir, 'static')
  if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(staticDir, { recursive: true })
  copyDirectory(distDir, staticDir)
  writeFileSync(join(outputDir, 'config.json'), JSON.stringify({
    version: 3,
    routes: [
      { src: '/assets/(.*)', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' },
    ],
  }, null, 2))
  const files = []
  function collect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) collect(fullPath)
      else files.push(fullPath)
    }
  }
  collect(staticDir)
  const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0)
  return { files: files.length, bytes, outputDir: relative(projectRoot, outputDir) }
}

function prepareNonGitVercelDeployDir() {
  const sourceOutput = join(projectRoot, '.vercel', 'output')
  const sourceProject = join(projectRoot, '.vercel', 'project.json')
  if (!existsSync(join(sourceOutput, 'config.json'))) prepareVercelOutput()
  if (!existsSync(sourceProject)) throw new Error('.vercel/project.json does not exist. Run vercel link first.')

  const deployRoot = join(tmpdir(), 'opencode', 'redrise-vercel-prebuilt')
  if (existsSync(deployRoot)) rmSync(deployRoot, { recursive: true, force: true })
  mkdirSync(join(deployRoot, '.vercel'), { recursive: true })
  copyFileSync(sourceProject, join(deployRoot, '.vercel', 'project.json'))
  copyDirectory(sourceOutput, join(deployRoot, '.vercel', 'output'))
  return deployRoot
}

function appendMemory(fileName, heading, lines) {
  const allowed = new Set(['TASK_LOG.md', 'HANDOFF.md', 'DECISIONS.md', 'CONTEXT.md', 'TECHNICAL.md'])
  if (!allowed.has(fileName)) throw new Error(`Unsupported memory file: ${fileName}`)
  const filePath = join(projectRoot, 'memory', fileName)
  const body = Array.isArray(lines) ? lines : [String(lines)]
  const current = existsSync(filePath) ? readFileSync(filePath, 'utf8') : `# ${fileName.replace(/\.md$/i, '')}\n`
  const next = `${current.trimEnd()}\n\n## ${heading}\n\n${body.map((line) => `- ${line}`).join('\n')}\n`
  writeFileSync(filePath, next, 'utf8')
  return relative(projectRoot, filePath)
}

const tools = {
  validate_all: {
    description: 'Run lint, typecheck, unit tests, build, and optionally full Playwright E2E.',
    inputSchema: {
      type: 'object',
      properties: { e2e: { type: 'boolean', description: 'Run full Playwright E2E after build.', default: true } },
    },
    run: async ({ e2e = true } = {}) => {
      const commands = ['corepack yarn lint', 'corepack yarn typecheck', 'corepack yarn test', 'corepack yarn build']
      if (e2e) commands.push('corepack yarn test:e2e')
      const results = []
      for (const command of commands) {
        const result = await shell(command, { timeoutMs: command.includes('test:e2e') ? 900_000 : 300_000 })
        results.push({ command, ...result })
        if (result.code !== 0) break
      }
      return text(JSON.stringify(results, null, 2))
    },
  },
  build_frontend: {
    description: 'Run the production frontend build with Yarn/Corepack.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => text(JSON.stringify(await shell('corepack yarn build', { timeoutMs: 300_000 }), null, 2)),
  },
  prepare_vercel_prebuilt: {
    description: 'Create .vercel/output from dist/ for Vercel Build Output API deployment.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => text(JSON.stringify(prepareVercelOutput(), null, 2)),
  },
  deploy_frontend_prebuilt: {
    description: 'Deploy already built .vercel/output to Vercel production without remote npm install.',
    inputSchema: {
      type: 'object',
      properties: { force: { type: 'boolean', default: true } },
    },
    run: async ({ force = true } = {}) => {
      const deployRoot = prepareNonGitVercelDeployDir()
      const forceFlag = force ? ' --force' : ''
      return text(JSON.stringify(await shell(`vercel deploy --prebuilt --prod --yes${forceFlag}`, { timeoutMs: 900_000, cwd: deployRoot }), null, 2))
    },
  },
  check_vercel_status: {
    description: 'Inspect the configured production alias on Vercel.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => text(JSON.stringify(await shell(`vercel inspect ${productionUrl}`, { timeoutMs: 180_000 }), null, 2)),
  },
  deploy_supabase_function: {
    description: 'Deploy one allowlisted Supabase Edge Function.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', enum: ['invite-member'] } },
      required: ['name'],
    },
    run: async ({ name }) => text(JSON.stringify(await shell(`supabase functions deploy ${name}`, { timeoutMs: 300_000 }), null, 2)),
  },
  check_supabase_status: {
    description: 'List Supabase Edge Functions for the linked project.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => text(JSON.stringify(await shell('supabase functions list', { timeoutMs: 180_000 }), null, 2)),
  },
  graph_status: {
    description: 'Report whether graphify output exists for this project.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => text(JSON.stringify({ exists: existsSync(join(projectRoot, 'graphify-out', 'graph.json')) }, null, 2)),
  },
  append_memory_note: {
    description: 'Append a short bullet-list note to an allowlisted memory file.',
    inputSchema: {
      type: 'object',
      properties: {
        file: { type: 'string', enum: ['TASK_LOG.md', 'HANDOFF.md', 'DECISIONS.md', 'CONTEXT.md', 'TECHNICAL.md'] },
        heading: { type: 'string' },
        lines: { type: 'array', items: { type: 'string' } },
      },
      required: ['file', 'heading', 'lines'],
    },
    run: async ({ file, heading, lines }) => text(JSON.stringify({ updated: appendMemory(file, heading, lines) }, null, 2)),
  },
}

function toolList() {
  return Object.entries(tools).map(([name, tool]) => ({ name, description: tool.description, inputSchema: tool.inputSchema }))
}

async function handle(message) {
  if (message.method === 'initialize') {
    return {
      protocolVersion: message.params?.protocolVersion ?? '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: serverName, version: serverVersion },
    }
  }
  if (message.method === 'tools/list') return { tools: toolList() }
  if (message.method === 'tools/call') {
    const name = message.params?.name
    const tool = tools[name]
    if (!tool) throw new Error(`Unknown tool: ${name}`)
    return await tool.run(message.params?.arguments ?? {})
  }
  if (message.method === 'ping') return {}
  if (message.method === 'notifications/initialized') return undefined
  throw new Error(`Unsupported method: ${message.method}`)
}

function writeResponse(id, result, error) {
  if (id === undefined || id === null) return
  const payload = error
    ? { jsonrpc: '2.0', id, error: { code: -32000, message: error.message } }
    : { jsonrpc: '2.0', id, result }
  process.stdout.write(`${JSON.stringify(payload)}\n`)
}

async function processMessage(message) {
  try {
    const result = await handle(message)
    writeResponse(message.id, result)
  } catch (error) {
    writeResponse(message.id, null, error)
  }
}

function startServer() {
  let buffer = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    buffer += chunk
    while (buffer.length > 0) {
      if (buffer.startsWith('Content-Length:')) {
        const headerEnd = buffer.indexOf('\r\n\r\n') >= 0 ? buffer.indexOf('\r\n\r\n') : buffer.indexOf('\n\n')
        if (headerEnd < 0) return
        const separatorLength = buffer.indexOf('\r\n\r\n') >= 0 ? 4 : 2
        const header = buffer.slice(0, headerEnd)
        const match = header.match(/Content-Length:\s*(\d+)/i)
        if (!match) {
          buffer = buffer.slice(headerEnd + separatorLength)
          continue
        }
        const length = Number(match[1])
        const bodyStart = headerEnd + separatorLength
        if (buffer.length < bodyStart + length) return
        const body = buffer.slice(bodyStart, bodyStart + length)
        buffer = buffer.slice(bodyStart + length)
        try {
          void processMessage(JSON.parse(body))
        } catch (error) {
          writeResponse(null, null, error)
        }
        continue
      }

      const index = buffer.indexOf('\n')
      if (index < 0) return
      const line = buffer.slice(0, index).trim()
      buffer = buffer.slice(index + 1)
      if (!line || line === '{}') continue
      try {
        void processMessage(JSON.parse(line))
      } catch (error) {
        writeResponse(null, null, error)
      }
    }
  })
}

if (process.argv.includes('--self-test')) {
  console.log(JSON.stringify({ name: serverName, version: serverVersion, tools: toolList().map((tool) => tool.name) }, null, 2))
} else {
  startServer()
}
