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

        // 读取Markdown内容
        const content = await fs.readFile(fullPath, "utf8")

        // 使用markdownlint-rule-utils解析
        const tokens = parse(content)

        // 生成输出路径（同目录下.json文件）
        const outputPath = path.join(
          path.dirname(fullPath),
          `${path.basename(fullPath, ".md")}.json`
        )

        // 写入JSON文件
        await fs.writeFile(
          outputPath,
          JSON.stringify(tokens, (key, value) => {
            // 移除循环引用的parent属性
            if (key === "parent")
              return "Circular"

            return value
          }, 2),
          "utf8"
        )

        console.log(`Created: ${outputPath}`)
      }
      catch (error) { console.error(`Error processing ${fullPath}:`, error.message) }
    }
  }
}

// 从test目录开始处理
processMarkdownFiles("test")
  .then(() => console.log("Processing completed"))
  .catch((err) => console.error("Error:", err.message))
