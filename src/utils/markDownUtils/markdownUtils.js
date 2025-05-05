const fs = require("fs").promises;
const path = require("path");

class MarkdownUtils {
  static async readMarkdownFile(filePath) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Error al leer el archivo Markdown: ${error.message}`);
    }
  }

  static async writeMarkdownFile(filePath, content) {
    try {
      // Asegurarse de que el directorio existe
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Error al escribir el archivo Markdown: ${error.message}`
      );
    }
  }

  static async listMarkdownFiles(directory) {
    try {
      const files = await fs.readdir(directory);
      return files.filter((file) => file.endsWith(".md"));
    } catch (error) {
      throw new Error(`Error al listar archivos Markdown: ${error.message}`);
    }
  }
}

module.exports = MarkdownUtils;
