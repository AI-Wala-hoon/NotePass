// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
};

const DOCS_DIR = path.join(__dirname, "docs");
const PUBLIC_DIR = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  const url = req.url;

  // Serve index.html
  if (url === "/" || url === "/index.html") {
    return serveFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html");
  }

  // Serve public assets
  if (url.startsWith("/style.css") || url.startsWith("/script.js")) {
    const ext = path.extname(url);
    return serveFile(res, path.join(PUBLIC_DIR, url), mime[ext]);
  }

  // Serve files from docs/
  if (url.startsWith("/docs/")) {
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    return serveFile(res, filePath, mime[ext] || "application/octet-stream");
  }

  // Serve images/icons if needed
  const ext = path.extname(url);
  if ([".png", ".jpg", ".jpeg", ".svg", ".ico"].includes(ext)) {
    return serveFile(res, path.join(PUBLIC_DIR, url), mime[ext] || "application/octet-stream");
  }

  // API: Get file list with metadata
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

          const sizeInBytes = stats.size || 0;
          const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

          let type = "File";
          if (ext === ".pdf") type = "PDF";
          else if ([".png", ".jpg", ".jpeg"].includes(ext)) type = "Image";
          else if (ext === ".txt") type = "Text";

          return {
            name: file,
            url: `/docs/${file}`,
            size: `${sizeMB} MB`,
            type,
            uploaded: stats.birthtime.toISOString().split("T")[0]
          };
        } catch (err) {
          return null;
        }
      }).filter(Boolean);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fileDetails));
    });

    return;
  }

  // 404 Fallback
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 - Not Found");
});

// Serve files with caching and headers
/*function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    } else {
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 24 hours
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
      });
      res.end(content);
    }
  });
}*/
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading file");
    } else {
      res.writeHead(200, {
        "Content-Type": contentType,
        // ✅ Add this header to allow PDF embedding
        "X-Frame-Options": "ALLOWALL"
      });
      res.end(data);
    }
  });
}


server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
