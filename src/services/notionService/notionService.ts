import { Client } from "@notionhq/client";
import {
  NotionBlock,
  NotionBlocksResponse,
  NotionPageResponse,
  NotionRichText,
} from "../../types/notion";

type BlockObjectRequest = Parameters<Client["blocks"]["children"]["append"]>[0]["children"][0];

export class NotionService {
  private notion: Client;

  constructor(apiKey: string) {
    this.notion = new Client({ auth: apiKey });
  }

  async blocksToMarkdown(blockId: string): Promise<string> {
    const blocks = await this.notion.blocks.children.list({
      block_id: blockId,
    });

    let markdown = "";

    for (const block of (blocks as NotionBlocksResponse).results) {
      switch (block.type) {
        case "paragraph":
          markdown += this._paragraphToMarkdown(block.paragraph!) + "\n\n";
          break;
        case "heading_1":
          markdown += this._headingToMarkdown(block.heading_1!, 1) + "\n\n";
          break;
        case "heading_2":
          markdown += this._headingToMarkdown(block.heading_2!, 2) + "\n\n";
          break;
        case "heading_3":
          markdown += this._headingToMarkdown(block.heading_3!, 3) + "\n\n";
          break;
        case "bulleted_list_item":
          markdown +=
            this._listItemToMarkdown(block.bulleted_list_item!, "-") + "\n";
          break;
        case "numbered_list_item":
          markdown +=
            this._listItemToMarkdown(block.numbered_list_item!, "1.") + "\n";
          break;
        case "code":
          markdown += this._codeToMarkdown(block.code!) + "\n\n";
          break;
      }
    }

    return markdown;
  }

  async createPageFromMarkdown(
    databaseId: string,
    title: string,
    markdownContent: string
  ): Promise<NotionPageResponse> {
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
      children: blocks as BlockObjectRequest[],
    });

    return response as NotionPageResponse;
  }

  private _paragraphToMarkdown(paragraph: { rich_text: NotionRichText[] }): string {
    return paragraph.rich_text.map((text) => text.text.content).join("");
  }

  private _headingToMarkdown(
    heading: { rich_text: NotionRichText[] },
    level: number
  ): string {
    const content = heading.rich_text.map((text) => text.text.content).join("");
    return "#".repeat(level) + " " + content;
  }

  private _listItemToMarkdown(
    listItem: { rich_text: NotionRichText[] },
    prefix: string
  ): string {
    const content = listItem.rich_text.map((text) => text.text.content).join("");
    return `${prefix} ${content}`;
  }

  private _codeToMarkdown(code: {
    rich_text: NotionRichText[];
    language?: string;
  }): string {
    const content = code.rich_text.map((text) => text.text.content).join("");
    return "```" + (code.language || "") + "\n" + content + "\n```";
  }

  private _markdownToBlocks(markdown: string): NotionBlock[] {
    const lines = markdown.split("\n");
    const blocks: NotionBlock[] = [];
    let currentListItems: NotionBlock[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = "";

    for (let line of lines) {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        } else {
          inCodeBlock = false;
          blocks.push({
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

      if (line.startsWith("#")) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, "");
        blocks.push({
          type: `heading_${level}` as "heading_1" | "heading_2" | "heading_3",
          [`heading_${level}`]: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s/, "");
        currentListItems.push({
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
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [{ type: "text", text: { content } }],
          },
        });
        continue;
      }

      if (currentListItems.length > 0 && line.trim() === "") {
        blocks.push(...currentListItems);
        currentListItems = [];
        continue;
      }

      if (line.trim() !== "") {
        blocks.push({
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: line } }],
          },
        });
      }
    }

    if (currentListItems.length > 0) {
      blocks.push(...currentListItems);
    }

    return blocks;
  }
} 