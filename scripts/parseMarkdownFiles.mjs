import { promises as fs } from "fs"
import path from "path"
import { parse } from "markdownlint-rule-utils"

async function processMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory())
      await processMarkdownFiles(fullPath)
    else if (path.extname(entry.name) === ".md") {
      try {
        console.log(`Processing: ${fullPath}`)

        const outputPath = path.join(
          path.dirname(fullPath),
          `${path.basename(fullPath, ".md")}.json`
        )

        // Skip if the output file already exists
        try {
          await fs.access(outputPath)
          console.log(`Skipping existing: ${outputPath}`)
          continue
        }
        catch (err) {
          if (err.code !== "ENOENT")
            throw err
        }

        const content = await fs.readFile(fullPath, "utf8")

        const tokens = parse(content)

        await fs.writeFile(
          outputPath,
          JSON.stringify(
            tokens,
            (key, value) => {
            // avoid circular references
              if (key === "parent" && value)
                return `${value.type} from ${value.startLine}:${value.startColumn} to ${value.endLine}:${value.endColumn}`

              return value
            },
            2
          ),
          "utf8"
        )

        console.log(`Created: ${outputPath}`)
      }
      catch (error) { console.error(`Error processing ${fullPath}:`, error.message) }
    }
  }
}

processMarkdownFiles("test")
  .then(() => console.log("Processing completed"))
  .catch((err) => console.error("Error:", err.message))
