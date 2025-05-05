const { Client } = require("@notionhq/client");

class NotionService {
  constructor(apiKey) {
    this.notion = new Client({ auth: apiKey });
  }

  // Convertir bloques de Notion a Markdown
  async blocksToMarkdown(blockId) {
    const blocks = await this.notion.blocks.children.list({
      block_id: blockId,
    });

    let markdown = "";

    for (const block of blocks.results) {
      switch (block.type) {
        case "paragraph":
          markdown += this._paragraphToMarkdown(block.paragraph) + "\n\n";
          break;
        case "heading_1":
          markdown += this._headingToMarkdown(block.heading_1, 1) + "\n\n";
          break;
        case "heading_2":
          markdown += this._headingToMarkdown(block.heading_2, 2) + "\n\n";
          break;
        case "heading_3":
          markdown += this._headingToMarkdown(block.heading_3, 3) + "\n\n";
          break;
        case "bulleted_list_item":
          markdown +=
            this._listItemToMarkdown(block.bulleted_list_item, "-") + "\n";
          break;
        case "numbered_list_item":
          markdown +=
            this._listItemToMarkdown(block.numbered_list_item, "1.") + "\n";
          break;
        case "code":
          markdown += this._codeToMarkdown(block.code) + "\n\n";
          break;
      }
    }

    return markdown;
  }

  // Crear una página en Notion desde Markdown
  async createPageFromMarkdown(databaseId, title, markdownContent) {
    const blocks = this._markdownToBlocks(markdownContent);

    const response = await this.notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: blocks,
    });

    return response;
  }

  // Métodos privados de conversión
  _paragraphToMarkdown(paragraph) {
    return paragraph.rich_text.map((text) => text.plain_text).join("");
  }

  _headingToMarkdown(heading, level) {
    const content = heading.rich_text.map((text) => text.plain_text).join("");
    return "#".repeat(level) + " " + content;
  }

  _listItemToMarkdown(listItem, prefix) {
    const content = listItem.rich_text.map((text) => text.plain_text).join("");
    return `${prefix} ${content}`;
  }

  _codeToMarkdown(code) {
    const content = code.rich_text.map((text) => text.plain_text).join("");
    return "```" + (code.language || "") + "\n" + content + "\n```";
  }

  _markdownToBlocks(markdown) {
    const lines = markdown.split("\n");
    const blocks = [];
    let currentListItems = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = "";

    for (let line of lines) {
      // Manejar bloques de código
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        } else {
          inCodeBlock = false;
          blocks.push({
            object: "block",
            type: "code",
            code: {
              rich_text: [
                { type: "text", text: { content: codeContent.join("\n") } },
              ],
              language: codeLanguage,
            },
          });
          codeContent = [];
          continue;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Manejar encabezados
      if (line.startsWith("#")) {
        const level = line.match(/^#+/)[0].length;
        const content = line.replace(/^#+\s*/, "");
        blocks.push({
          object: "block",
          type: `heading_${level}`,
          [`heading_${level}`]: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      // Manejar listas
      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s/, "");
        currentListItems.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, "");
        currentListItems.push({
          object: "block",
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      // Si hay elementos de lista pendientes, agregarlos
      if (currentListItems.length > 0 && line.trim() === "") {
        blocks.push(...currentListItems);
        currentListItems = [];
        continue;
      }

      // Párrafos normales
      if (line.trim() !== "") {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: line } }],
          },
        });
      }
    }

    // Agregar cualquier elemento de lista pendiente
    if (currentListItems.length > 0) {
      blocks.push(...currentListItems);
    }

    return blocks;
  }
}

module.exports = NotionService;
