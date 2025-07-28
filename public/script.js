// public/script.js

async function loadFiles() {
  const res = await fetch("/api/files");
  const files = await res.json();
  displayFiles(files);
}

function displayFiles(files) {
  const container = document.getElementById("fileCards");
  container.innerHTML = "";

  files.forEach(file => {
    const card = document.createElement("div");
    card.className = "card";

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

// Preview modal logic
function setupPreviewButtons() {
  const modal = document.getElementById("previewModal");
  const previewArea = document.getElementById("previewArea");
  const closeBtn = document.querySelector(".close-btn");

  document.querySelectorAll(".preview-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      const type = btn.dataset.type;
      previewArea.innerHTML = "";

      if (type === "PDF") {
        previewArea.innerHTML = `<iframe src="${url}" width="100%" height="500px"></iframe>`;
      } else if (type === "Image") {
        previewArea.innerHTML = `<img src="${url}" alt="Preview Image" />`;
      } else {
        previewArea.innerHTML = `<p>Preview not supported for this file type.</p>`;
      }

      modal.style.display = "block";
    });
  });

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };
}

// 🔍 Real-time Search
document.getElementById("searchInput").addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase();
  const res = await fetch("/api/files");
  const files = await res.json();
  const filtered = files.filter(f => f.name.toLowerCase().includes(query));
  displayFiles(filtered);
});

loadFiles();
