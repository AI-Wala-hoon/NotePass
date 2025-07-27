const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DOCS_DIR = path.join(__dirname, "docs");
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".pdf": "application/pdf",
  ".js": "text/javascript",
  ".ico": "image/x-icon",
};

function serveFile(res, filepath, contentType, statusCode = 200) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("500 - Server Error");
    } else {
      res.writeHead(statusCode, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

function generateCardsHtml() {
  const files = fs.readdirSync(DOCS_DIR).filter(file => file.endsWith(".pdf"));

  return files
    .map(file => {
      const subject = file.replace("_Complete_Notes.pdf", "").replace(/_/g, " ");
      const fileUrl = `/docs/${encodeURIComponent(file)}`;
      return `
        <div class="card">
          <h2>${subject}</h2>
          <div class="card-buttons">
            <a href="${fileUrl}" target="_blank" class="btn preview">Preview</a>
            <a href="${fileUrl}" download class="btn download">Download</a>
          </div>
        </div>
      `;
    })
    .join("\n");
}

http
  .createServer((req, res) => {
    const url = req.url === "/" ? "/index.html" : req.url;
    const ext = path.extname(url);

    // Serve PDF files
    if (url.startsWith("/docs/")) {
      const filePath = path.join(DOCS_DIR, decodeURIComponent(url.replace("/docs/", "")));
      if (fs.existsSync(filePath)) {
        serveFile(res, filePath, mimeTypes[".pdf"]);
      } else {
        res.writeHead(404);
        res.end("404 - File Not Found");
      }
      return;
    }

    // Inject dynamic cards into index.html
    if (url === "/index.html") {
      const indexPath = path.join(PUBLIC_DIR, "index.html");
      fs.readFile(indexPath, "utf-8", (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end("500 - Error loading index.html");
        } else {
          const cards = generateCardsHtml();
          const updatedHtml = data.replace("<!-- __CARDS__ -->", cards);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(updatedHtml);
        }
      });
      return;
    }

    // Serve other static files
    const filePath = path.join(PUBLIC_DIR, url);
    if (fs.existsSync(filePath)) {
      serveFile(res, filePath, mimeTypes[ext] || "text/plain");
    } else {
      res.writeHead(404);
      res.end("404 - Not Found");
    }
  })
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
