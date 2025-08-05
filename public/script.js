// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  loadFiles();

  // Real-time Search
  document.getElementById("searchInput").addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    try {
      const res = await fetch("/api/files");
      const files = await res.json();
      const filtered = files.filter(f => f.name.toLowerCase().includes(query));
      displayFiles(filtered);
    } catch (err) {
      showError("Error loading search results.");
    }
  });
});

async function loadFiles() {
  try {
    const res = await fetch("/api/files");
    const files = await res.json();
    displayFiles(files);
  } catch (err) {
    showError("Failed to load files.");
    console.error(err);
  }
}

function displayFiles(files) {
  const container = document.getElementById("fileCards");
  container.innerHTML = "";

  if (!files.length) {
    container.innerHTML = "<p>No files found.</p>";
    return;
  }

  files.forEach(file => {
    const card = document.createElement("div");
    card.className = "card";

    card.setAttribute("data-filename", file.name);
    card.setAttribute("data-filesize", file.size);
    card.setAttribute("data-filetype", file.type);

    card.innerHTML = `
      <h3>${file.name}</h3>
      <p><strong>Type:</strong> ${file.type}</p>
      <p><strong>Size:</strong> ${file.size}</p>
      <p><strong>Uploaded:</strong> ${file.uploaded}</p>
      <div class="buttons">
        <button class="btn preview-btn" data-url="${file.url}" data-type="${file.type}">🔍 Preview</button>
        <a href="${file.url}" download class="btn">⬇ Download</a>
      </div>
    `;

    container.appendChild(card);
  });

  setupPreviewButtons();
}

function setupPreviewButtons() {
  const modal = document.getElementById("previewModal");
  const previewArea = document.getElementById("previewArea");
  const closeBtn = document.querySelector(".close-btn");

  document.querySelectorAll(".preview-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      const type = btn.dataset.type;

      previewArea.innerHTML = '<p style="color:#ccc;">Loading preview...</p>';

      if (type === "PDF") {
        previewArea.innerHTML = `<iframe src="${url}" width="100%" height="500px" loading="lazy"></iframe>`;
      } else if (type === "Image") {
        previewArea.innerHTML = `<img src="${url}" alt="Preview Image" loading="lazy"/>`;
      } else {
        previewArea.innerHTML = `<p>Preview not supported for this file type.</p>`;
      }

      modal.style.display = "block";
    });
  });

  closeBtn.onclick = () => modal.style.display = "none";

  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };
}

function showError(message) {
  const container = document.getElementById("fileCards");
  container.innerHTML = `<p style="color: red;">${message}</p>`;
}
