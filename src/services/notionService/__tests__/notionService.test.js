const { Client } = require("@notionhq/client");
const NotionService = require("../notionService");

// Mock del cliente de Notion
jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => ({
    blocks: {
      children: {
        list: jest.fn(),
      },
    },
    pages: {
      create: jest.fn(),
    },
  })),
}));

describe("NotionService", () => {
  let notionService;
  const mockApiKey = "test-api-key";
  const mockDatabaseId = "test-database-id";
  const mockBlockId = "test-block-id";

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    notionService = new NotionService(mockApiKey);
  });

  describe("blocksToMarkdown", () => {
    it("debería convertir bloques de Notion a Markdown correctamente", async () => {
      const mockBlocks = {
        results: [
          {
            type: "heading_1",
            heading_1: {
              rich_text: [{ plain_text: "Título Principal" }],
            },
          },
          {
            type: "paragraph",
            paragraph: {
              rich_text: [{ plain_text: "Este es un párrafo" }],
            },
          },
          {
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [{ plain_text: "Elemento de lista" }],
            },
          },
          {
            type: "code",
            code: {
              rich_text: [{ plain_text: 'console.log("Hola")' }],
              language: "javascript",
            },
          },
        ],
      };

      Client.mock.instances[0].blocks.children.list.mockResolvedValue(
        mockBlocks
      );

      const markdown = await notionService.blocksToMarkdown(mockBlockId);

      expect(
        Client.mock.instances[0].blocks.children.list
      ).toHaveBeenCalledWith({ block_id: mockBlockId });
      expect(markdown).toContain("# Título Principal");
      expect(markdown).toContain("Este es un párrafo");
      expect(markdown).toContain("- Elemento de lista");
      expect(markdown).toContain('```javascript\nconsole.log("Hola")\n```');
    });

    it("debería manejar bloques vacíos", async () => {
      const mockBlocks = { results: [] };
      Client.mock.instances[0].blocks.children.list.mockResolvedValue(
        mockBlocks
      );

      const markdown = await notionService.blocksToMarkdown(mockBlockId);

      expect(markdown).toBe("");
    });

    it("debería manejar errores de la API", async () => {
      const error = new Error("API Error");
      Client.mock.instances[0].blocks.children.list.mockRejectedValue(error);

      await expect(notionService.blocksToMarkdown(mockBlockId)).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("createPageFromMarkdown", () => {
    const mockTitle = "Test Page";
    const mockMarkdown = `# Título
Este es un párrafo

- Elemento de lista

\`\`\`javascript
console.log("Hola");
\`\`\``;

    it("debería crear una página en Notion desde Markdown", async () => {
      const mockResponse = { url: "https://notion.so/test" };
      Client.mock.instances[0].pages.create.mockResolvedValue(mockResponse);

      const response = await notionService.createPageFromMarkdown(
        mockDatabaseId,
        mockTitle,
        mockMarkdown
      );

      expect(Client.mock.instances[0].pages.create).toHaveBeenCalledWith({
        parent: { database_id: mockDatabaseId },
        properties: {
          title: {
            title: [{ text: { content: mockTitle } }],
          },
        },
        children: expect.arrayContaining([
          expect.objectContaining({
            type: "heading_1",
            heading_1: expect.any(Object),
          }),
          expect.objectContaining({
            type: "paragraph",
            paragraph: expect.any(Object),
          }),
          expect.objectContaining({
            type: "bulleted_list_item",
            bulleted_list_item: expect.any(Object),
          }),
          expect.objectContaining({
            type: "code",
            code: expect.any(Object),
          }),
        ]),
      });

      expect(response).toBe(mockResponse);
    });

    it("debería manejar Markdown vacío", async () => {
      const mockResponse = { url: "https://notion.so/test" };
      Client.mock.instances[0].pages.create.mockResolvedValue(mockResponse);

      await notionService.createPageFromMarkdown(mockDatabaseId, mockTitle, "");

      expect(Client.mock.instances[0].pages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          children: [],
        })
      );
    });

    it("debería manejar errores de la API", async () => {
      const error = new Error("API Error");
      Client.mock.instances[0].pages.create.mockRejectedValue(error);

      await expect(
        notionService.createPageFromMarkdown(
          mockDatabaseId,
          mockTitle,
          mockMarkdown
        )
      ).rejects.toThrow("API Error");
    });
  });

  describe("Métodos privados de conversión", () => {
    describe("_paragraphToMarkdown", () => {
      it("debería convertir un párrafo a Markdown", () => {
        const paragraph = {
          rich_text: [
            { plain_text: "Texto " },
            { plain_text: "con " },
            { plain_text: "formato" },
          ],
        };

        const result = notionService._paragraphToMarkdown(paragraph);
        expect(result).toBe("Texto con formato");
      });
    });

    describe("_headingToMarkdown", () => {
      it("debería convertir un encabezado a Markdown", () => {
        const heading = {
          rich_text: [{ plain_text: "Título" }],
        };

        const result = notionService._headingToMarkdown(heading, 2);
        expect(result).toBe("## Título");
      });
    });

    describe("_listItemToMarkdown", () => {
      it("debería convertir un elemento de lista a Markdown", () => {
        const listItem = {
          rich_text: [{ plain_text: "Elemento de lista" }],
        };

        const result = notionService._listItemToMarkdown(listItem, "-");
        expect(result).toBe("- Elemento de lista");
      });
    });

    describe("_codeToMarkdown", () => {
      it("debería convertir un bloque de código a Markdown", () => {
        const code = {
          rich_text: [{ plain_text: 'console.log("Hola")' }],
          language: "javascript",
        };

        const result = notionService._codeToMarkdown(code);
        expect(result).toBe('```javascript\nconsole.log("Hola")\n```');
      });

      it("debería manejar código sin lenguaje especificado", () => {
        const code = {
          rich_text: [{ plain_text: 'console.log("Hola")' }],
        };

        const result = notionService._codeToMarkdown(code);
        expect(result).toBe('```\nconsole.log("Hola")\n```');
      });
    });
  });
});
