import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("File Upload Endpoint", () => {
  it("should return file info when a valid file is uploaded", async () => {
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      filename: "test.txt",
      extension: "txt",
      mimeType: "text/plain",
    });
  });

  it("should handle files with different extensions", async () => {
    const file = new File(["image data"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      filename: "photo.jpg",
      extension: "jpg",
      mimeType: "image/jpeg",
    });
  });

  it("should handle files with multiple dots in filename", async () => {
    const file = new File(["pdf data"], "document.backup.pdf", {
      type: "application/pdf",
    });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      filename: "document.backup.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
    });
  });

  it("should return error when no file is uploaded", async () => {
    const formData = new FormData();

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({
      error: "No file uploaded",
    });
  });

  it("should return error when file field is missing", async () => {
    const formData = new FormData();
    formData.append("notfile", "some text");

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({
      error: "No file uploaded",
    });
  });

  it("should handle files without extension", async () => {
    const file = new File(["content"], "README", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/upload", {
      method: "POST",
      body: formData,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.filename).toBe("README");
    expect(data.extension).toBe("README");
    expect(data.mimeType).toBe("text/plain");
  });
});
