const fs = require("fs").promises;
const path = require("path");
const MarkdownUtils = require("../markdownUtils");

// Mock de fs.promises
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn(),
  },
}));

describe("MarkdownUtils", () => {
  const testDir = "./test-markdown";
  const testFile = path.join(testDir, "test.md");
  const testContent = "# Test\n\nThis is a test file.";

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  describe("readMarkdownFile", () => {
    it("debería leer correctamente un archivo Markdown", async () => {
      fs.readFile.mockResolvedValue(testContent);

      const content = await MarkdownUtils.readMarkdownFile(testFile);

      expect(fs.readFile).toHaveBeenCalledWith(testFile, "utf-8");
      expect(content).toBe(testContent);
    });

    it("debería lanzar un error si el archivo no existe", async () => {
      const error = new Error("File not found");
      fs.readFile.mockRejectedValue(error);

      await expect(MarkdownUtils.readMarkdownFile(testFile)).rejects.toThrow(
        "Error al leer el archivo Markdown: File not found"
      );
    });
  });

  describe("writeMarkdownFile", () => {
    it("debería escribir correctamente un archivo Markdown", async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      await MarkdownUtils.writeMarkdownFile(testFile, testContent);

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(testFile), {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(testFile, testContent, "utf-8");
    });

    it("debería lanzar un error si no se puede escribir el archivo", async () => {
      const error = new Error("Permission denied");
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockRejectedValue(error);

      await expect(
        MarkdownUtils.writeMarkdownFile(testFile, testContent)
      ).rejects.toThrow(
        "Error al escribir el archivo Markdown: Permission denied"
      );
    });
  });

  describe("listMarkdownFiles", () => {
    it("debería listar solo archivos Markdown", async () => {
      const files = ["test1.md", "test2.md", "test.txt", "test.js"];
      fs.readdir.mockResolvedValue(files);

      const markdownFiles = await MarkdownUtils.listMarkdownFiles(testDir);

      expect(fs.readdir).toHaveBeenCalledWith(testDir);
      expect(markdownFiles).toEqual(["test1.md", "test2.md"]);
    });

    it("debería devolver un array vacío si no hay archivos Markdown", async () => {
      const files = ["test.txt", "test.js"];
      fs.readdir.mockResolvedValue(files);

      const markdownFiles = await MarkdownUtils.listMarkdownFiles(testDir);

      expect(markdownFiles).toEqual([]);
    });

    it("debería lanzar un error si no se puede leer el directorio", async () => {
      const error = new Error("Directory not found");
      fs.readdir.mockRejectedValue(error);

      await expect(MarkdownUtils.listMarkdownFiles(testDir)).rejects.toThrow(
        "Error al listar archivos Markdown: Directory not found"
      );
    });
  });
});
