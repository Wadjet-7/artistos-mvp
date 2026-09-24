import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// After every production build, generate the static SEO pages, sitemap,
// robots.txt and llms.txt (scripts/seo-build.mjs). Done as a plugin so it
// runs no matter which build command Vercel uses.
const seoBuild = {
  name: 'artistos-seo-build',
  apply: 'build',
  closeBundle() {
    execSync('node scripts/seo-build.mjs', { stdio: 'inherit' })
  },
}

export default defineConfig({ plugins: [react(), seoBuild] })
