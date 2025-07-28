const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf"
};

const PORT = 3000;
const DOCS_DIR = path.join(__dirname, "docs");
const PUBLIC_DIR = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  const url = req.url;

  // Serve static files from public/
  if (url === "/" || url === "/index.html") {
    return serveFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html");
  }

  if (url.endsWith(".css") || url.endsWith(".js")) {
    const ext = path.extname(url);
    return serveFile(res, path.join(PUBLIC_DIR, url), mime[ext]);
  }

  // Serve files from docs/
  if (url.startsWith("/docs/")) {
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    return serveFile(res, filePath, mime[ext] || "application/octet-stream");
  }

  // API: return list of files with metadata
if (url === "/api/files") {
  fs.readdir(DOCS_DIR, (err, files) => {
    if (err) {
      res.writeHead(500);
      return res.end("Unable to read docs folder");
    }

    const fileDetails = files.map(file => {
      try {
        const filePath = path.join(DOCS_DIR, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();

        // Defensive check: avoid NaN
        const sizeInBytes = stats.size || 0;
        const sizeKB = (sizeInBytes / 1024).toFixed(2);
        const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

        let type = "File";
        if (ext === ".pdf") type = "PDF";
        else if ([".png", ".jpg", ".jpeg"].includes(ext)) type = "Image";
        else if (ext === ".txt") type = "Text";

        return {
          name: file,
          url: `/docs/${file}`,
          size: `${sizeMB} MB`,  // You can also switch to KB if files are small
          type: type,
          uploaded: stats.birthtime.toISOString().split("T")[0]
        };

      } catch (error) {
        // In case of file access error, skip this file
        return null;
      }
    }).filter(Boolean); // Remove nulls caused by error

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(fileDetails));
  });

  return;
}


  // 404 fallback
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 - Not Found");
});

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading file");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
