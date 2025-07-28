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

// ✅ Use PORT from environment variable (Render/Railway requirement)
const PORT = process.env.PORT || 3000;

const DOCS_DIR = path.join(__dirname, "docs");
const PUBLIC_DIR = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  const url = req.url;

  // Serve index.html
  if (url === "/" || url === "/index.html") {
    return serveFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html");
  }

  // Serve static assets (.css, .js)
  if (url.endsWith(".css") || url.endsWith(".js")) {
    const ext = path.extname(url);
    return serveFile(res, path.join(PUBLIC_DIR, url), mime[ext]);
  }

  // Serve docs
  if (url.startsWith("/docs/")) {
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    return serveFile(res, filePath, mime[ext] || "application/octet-stream");
  }

  // Serve assets like images
  const ext = path.extname(url);
  if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    return serveFile(res, path.join(PUBLIC_DIR, url), mime[ext]);
  }

  // API: Get files
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
          const fileExt = path.extname(file).toLowerCase();

          const sizeInBytes = stats.size || 0;
          const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

          let type = "File";
          if (fileExt === ".pdf") type = "PDF";
          else if ([".png", ".jpg", ".jpeg"].includes(fileExt)) type = "Image";
          else if (fileExt === ".txt") type = "Text";

          return {
            name: file,
            url: `/docs/${file}`,
            size: `${sizeMB} MB`,
            type: type,
            uploaded: stats.birthtime.toISOString().split("T")[0]
          };

        } catch (error) {
          return null;
        }
      }).filter(Boolean);

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
  console.log(`Server running on port ${PORT}`);
});
