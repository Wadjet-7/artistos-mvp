import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const src = readFileSync(join(root, "help", "how-to.md"), "utf-8")
const escaped = src.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")
const out = `export const KNOWLEDGE = \`${escaped}\`;\n`
writeFileSync(join(root, "supabase", "functions", "help-agent", "knowledge.ts"), out)
console.log("[gen-knowledge] wrote knowledge.ts")
