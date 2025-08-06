// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  loadFiles();

  document.getElementById("searchInput").addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const res = await fetch("/api/files");
    const files = await res.json();
    const filtered = files.filter(f => f.name.toLowerCase().includes(query));
    displayFiles(filtered);
  });
});

async function loadFiles() {
  try {
    const res = await fetch("/api/files");
    const files = await res.json();
    displayFiles(files);
  } catch (err) {
    console.error("Failed to load files:", err);
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

    card.innerHTML = `
      <h3>${file.name}</h3>
      <p><strong>Type:</strong> ${file.type}</p>
      <p><strong>Size:</strong> ${file.size}</p>
      <p><strong>Uploaded:</strong> ${file.uploaded}</p>
      <div class="buttons">
        <button class="btn preview-btn" data-url="${file.url}" data-type="${file.type}" data-name="${file.name}">🔍 Preview</button>
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
      const fileName = btn.dataset.name;

      // Show loading state
      previewArea.innerHTML = `
        <p style="margin-bottom: 10px;"><strong>${fileName}</strong></p>
        <div class="loader"></div>
      `;
      modal.style.display = "block";

      setTimeout(() => {
        if (type === "PDF") {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const loader = `<p style="margin-top: 20px;">📄 Loading preview...</p>`;

  previewArea.innerHTML = loader;

  setTimeout(() => {
    previewArea.innerHTML = isMobile
      ? `<iframe src="https://docs.google.com/gview?url=${location.origin}${url}&embedded=true" width="100%" height="500px" style="border: none;"></iframe>`
      : `<embed src="${url}" type="application/pdf" width="100%" height="500px" />`;
  }, 300); // Small delay to show loader
}
 else if (type === "Image") {
          previewArea.innerHTML = `<img src="${url}" alt="Preview Image" style="max-height:75vh; border-radius: 10px;" />`;
        } else {
          previewArea.innerHTML = `<p>Preview not supported for this file type.</p>`;
        }
      }, 500); // slight delay to simulate loading
    });
  });

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };
}
