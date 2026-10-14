import { createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Styles are authored in design pixels (the Figma frame is 1280px wide) and converted to rem,
 * so the whole UI scales with the root font-size. Hairlines (≤ 1px) are left as px.
 */
const pxToRem = {
  postcssPlugin: 'px-to-rem',
  Declaration(decl: { value: string }) {
    if (!decl.value.includes('px')) return
    decl.value = decl.value.replace(/(-?\d*\.?\d+)px\b/g, (m, n) =>
      Math.abs(Number(n)) <= 1 ? m : `${+(Number(n) / 16).toFixed(5)}rem`,
    )
  },
}

/**
 * Dev only: serves the Figma exports and the measuring script from /design at /__design/*,
 * for the design overlay (?overlay) and pixel checks. Nothing from /design reaches a build.
 */
const designReferences: Plugin = {
  name: 'design-references',
  apply: 'serve',
  configureServer(server) {
    const types: Record<string, string> = { svg: 'image/svg+xml', js: 'text/javascript' }
    server.middlewares.use('/__design', (req, res, next) => {
      const file = resolve('design', (req.url ?? '').replace(/^\/+/, '').split('?')[0])
      if (!file.startsWith(resolve('design')) || !existsSync(file)) return next()
      res.setHeader('Content-Type', types[file.split('.').pop() ?? ''] ?? 'application/octet-stream')
      createReadStream(file).pipe(res)
    })
  },
}

export default defineConfig({
  plugins: [react() as Plugin[], designReferences],
  css: { postcss: { plugins: [pxToRem] } },
  server: { port: 5174, strictPort: true },
})
