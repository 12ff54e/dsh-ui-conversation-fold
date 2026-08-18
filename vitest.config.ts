import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { standardDecoratorPlugin } from '../../vitest.shared.ts'

const pathsPlugin = (): ReturnType<typeof tsconfigPaths> => tsconfigPaths({
  // The harness root's tsconfig.base.json maps @deepseek-ai/* to workspace
  // source; paths must win over package exports so built lib/ never loads.
  projects: [fileURLToPath(new URL('../../tsconfig.base.json', import.meta.url))],
})

export default defineConfig({
  plugins: [pathsPlugin(), standardDecoratorPlugin()],
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
    environment: 'jsdom',
  },
})
