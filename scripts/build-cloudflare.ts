import { cp, mkdir, rm, writeFile } from "node:fs/promises"
import config from "../cloudflare.config.ts"

// cf beta's v0 Build Output lets static sites deploy without a build plugin.
const output = new URL("../.cloudflare/output/v0/", import.meta.url)
const worker = new URL("workers/default/", output)

await rm(output, { recursive: true, force: true })
await mkdir(worker, { recursive: true })
await cp(new URL("../dist/", import.meta.url), new URL("assets/", worker), {
  recursive: true,
})
await writeFile(
  new URL("config.json", output),
  JSON.stringify({ buildContext: { isPreview: false } })
)
await writeFile(
  new URL("worker.config.json", worker),
  JSON.stringify(config.worker)
)
