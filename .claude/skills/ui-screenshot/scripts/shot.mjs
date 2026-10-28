// Captura pantallazos del frontend con playwright-core + Microsoft Edge (sin descargar navegadores).
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const require = createRequire(resolve('Frontend/package.json'))
let chromium
try {
  ;({ chromium } = require('playwright-core'))
} catch {
  ;({ chromium } = createRequire(resolve('package.json'))('playwright-core'))
}

const args = process.argv.slice(2)
const opt = { url: 'http://localhost:5173', clicks: [], mobile: false, full: false }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--url') opt.url = args[++i]
  else if (a === '--role') opt.role = args[++i]
  else if (a === '--nav') opt.nav = args[++i]
  else if (a === '--click') opt.clicks.push(args[++i])
  else if (a === '--out') opt.out = args[++i]
  else if (a === '--mobile') opt.mobile = true
  else if (a === '--full') opt.full = true
  else if (a === '--wait') opt.wait = Number(args[++i])
  else if (a === '--height') opt.height = Number(args[++i])
  else if (a === '--width') opt.width = Number(args[++i])
}

const nombresRol = {
  residente: 'Residente',
  porteria: 'Portería',
  mantenimiento: 'Mantenimiento',
  administrador: 'Administrador',
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({
  viewport: opt.mobile ? { width: 390, height: opt.height ?? 844 } : { width: opt.width ?? 1440, height: opt.height ?? 900 },
  deviceScaleFactor: opt.mobile ? 2 : 1,
})
const errores = []
page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
page.on('pageerror', (e) => errores.push(e.message))

try {
  await page.goto(opt.url, { waitUntil: 'networkidle' })
  if (opt.role) {
    await page.getByRole('button', { name: nombresRol[opt.role] ?? opt.role }).first().click()
  }
  if (opt.nav) {
    if (opt.mobile) await page.getByRole('button', { name: /menú|menu/i }).first().click().catch(() => {})
    await page.getByRole('button', { name: new RegExp('^' + opt.nav + '(\\s|$)') }).first().click()
  }
  for (const texto of opt.clicks) {
    await page.getByText(texto, { exact: true }).first().click()
  }
  await page.waitForTimeout(opt.wait ?? 600)
  const out =
    opt.out ??
    join(tmpdir(), `resigest-${opt.role ?? 'inicio'}-${opt.nav ?? 'home'}-${opt.mobile ? 'mobile' : 'desktop'}.png`.replace(/\s+/g, '_'))
  await page.screenshot({ path: out, fullPage: opt.full })
  console.log(out)
} finally {
  if (errores.length) console.log('Errores de consola:\n' + errores.join('\n'))
  await browser.close()
}
