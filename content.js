const api = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
  const key = e.key.toLowerCase();
  if (key === "i") {
    toggleCheckboxes("watches[]");
    extractWatchData();
  } else if (key === "p") {
    toggleCheckboxes("favorites[]");
    extractFavoriteData();
  } else if (key === "o") {
    toggleCheckboxesBySelector("input[name^='comments']");
    extractCommentData();
  }
});

// =========================
// WATCHES
// =========================
function extractWatchData() {
  const listItems = Array.from(document.querySelectorAll("li")).filter(li =>
    li.querySelector("input[name='watches[]']") && li.querySelector(".info > span")
  );
  console.log("Found watch items:", listItems.length);
  const entries = [];
  listItems.forEach(li => {
    const checkbox = li.querySelector("input[name='watches[]']");
    const userLink = li.querySelector(".avatar a[href^='/user/']");
    const displayNameSpan = li.querySelector(".info > span");
    const dateSpan = li.querySelector(".popup_date");
    if (checkbox && userLink && displayNameSpan && dateSpan) {
      const value = checkbox.value;
      const usernameMatch = userLink.getAttribute("href").match(/\/user\/([^\/]+)\/?/);
      const username = usernameMatch ? usernameMatch[1] : "unknown";
      const displayName = displayNameSpan.textContent.trim();
      const date = dateSpan.textContent.trim();
      entries.push(`${value}\t${username}\t${displayName}\t${date}`);
    }
  });
  if (entries.length === 0) {
    console.warn("No watch entries were extracted. Check selectors.");
  }
  const blob = new Blob([entries.join("\n")], { type: "text/plain" });
  saveWithIncrement("watch_list.txt", blob, entries.length);
}

// =========================
// FAVORITES
// =========================
function extractFavoriteData() {
  const listItems = Array.from(document.querySelectorAll("li")).filter(li => 
    li.querySelector("input[type='checkbox']") && li.querySelector("a[href^='/user/']")
  );
  console.log("Found items:", listItems.length);
  const entries = [];
  listItems.forEach((li) => {
    const valueInput = li.querySelector("input[type='checkbox']");
    const userLink = li.querySelector("a[href^='/user/']");
    const displayNameSpan = li.querySelector(".c-usernameBlockSimple__displayName");
    const viewLink = li.querySelector("a[href^='/view/']");
    const dateSpan = li.querySelector(".popup_date");
    if (valueInput && userLink && displayNameSpan && viewLink && dateSpan) {
      const value = valueInput.value;
      const usernameMatch = userLink.getAttribute("href").match(/\/user\/([^\/]+)\/?/);
      const username = usernameMatch ? usernameMatch[1] : "unknown";
      const displayName = displayNameSpan.textContent.trim();
      const urlIDMatch = viewLink.getAttribute("href").match(/\/view\/([^\/]+)\/?/);
      const urlID = urlIDMatch ? urlIDMatch[1] : "unknown";
      const urlName = viewLink.textContent.trim();
      const popupDate = dateSpan.textContent.trim();
      const favoriteText = li.textContent.includes("faved") ? "faved" : "";
      entries.push(`${value}\t${username}\t${displayName}\t${favoriteText}\t${urlID}\t${urlName}\t${popupDate}`);
    }
  });
  if (entries.length === 0) {
    console.warn("No favorite entries were extracted. Check selectors.");
  }
  const blob = new Blob([entries.join("\n")], { type: "text/plain" });
  saveWithIncrement("favorite_list.txt", blob);
}

// =========================
// COMMENTS
// =========================
function extractCommentData() {
  const sections = Array.from(document.querySelectorAll("section[id^='messages-comments']"));
  const entries = [];
  sections.forEach(section => {
    const listItems = Array.from(section.querySelectorAll("ul.message-stream > li"));
    listItems.forEach(li => {
      // Username + URL
      const userLink = li.querySelector("a[href^='/user/']");
      if (!userLink) return;
      const userUrl = "https://www.furaffinity.net" + userLink.getAttribute("href");
      // Target link (journal/submission with comment ID)
      const targetLink = li.querySelector("a[href*='#cid:']");
      if (!targetLink) return;
      const targetUrl = "https://www.furaffinity.net" + targetLink.getAttribute("href");
      // Use full li text directly, normalize whitespace
      const text = li.innerText.trim().replace(/\s+/g, " ");
      if (text) {
        entries.push(`${text} | ${userUrl} | ${targetUrl}`);
      }
    });
  });
  console.log("Found comment items:", entries.length);
  if (entries.length === 0) {
    console.warn("No comment entries extracted.");
  }
  const blob = new Blob([entries.join("\n")], { type: "text/plain" });
  saveWithIncrement("comment_list.txt", blob, entries.length);
}

// =========================
// TOGGLE HELPERS
// =========================
function toggleCheckboxes(name) {
  const checkboxes = Array.from(document.querySelectorAll(`input[name='${name}']`));
  if (checkboxes.length === 0) {
    console.warn(`No checkboxes found for ${name}`);
    return;
  }
  const allChecked = checkboxes.every(cb => cb.checked);
  const newState = !allChecked;
  checkboxes.forEach(cb => {
    cb.checked = newState;
    cb.dispatchEvent(new Event("change", { bubbles: true }));
  });
  console.log(`${newState ? "Checked" : "Unchecked"} ${checkboxes.length} items for ${name}`);
}

function toggleCheckboxesBySelector(selector) {
  const checkboxes = Array.from(document.querySelectorAll(selector));
  if (checkboxes.length === 0) {
    console.warn(`No checkboxes found for selector: ${selector}`);
    return;
  }
  const allChecked = checkboxes.every(cb => cb.checked);
  const newState = !allChecked;
  checkboxes.forEach(cb => {
    cb.checked = newState;
    cb.dispatchEvent(new Event("change", { bubbles: true }));
  });
  console.log(`${newState ? "Checked" : "Unchecked"} ${checkboxes.length} items`);
}

// =========================
// SAVE
// =========================
function saveWithIncrement(baseFilename, blob, count = null) {
  blob.text().then(text => {
    api.runtime.sendMessage({
      action: "saveFile",
      text: text,
      filename: baseFilename
    });
    // Show success popup
    if (count !== null) {
      showSuccessPopup(`Saved ${count} entries → ${baseFilename}`);
    } else {
      showSuccessPopup(`Saved → ${baseFilename}`);
    }
  });
}

function showSuccessPopup(message) {
  // Remove existing popup if present
  const existing = document.getElementById("fa-notif-success-popup");
  if (existing) existing.remove();
  const popup = document.createElement("div");
  popup.id = "fa-notif-success-popup";
  popup.style.cssText = `
    font-family: monospace;
    font-size: 12px;
    color: #d4ffd4;
    background: rgba(0, 80, 0, 0.9);
    position: fixed;
    bottom: 28px; /* sits just above your overlay */
    right: 0;
    z-index: 100000;
    padding: 4px 8px;
    border-top-left-radius: 6px;
    white-space: nowrap;
    text-shadow: 1px 1px 2px black;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  `;
  popup.textContent = message;
  document.body.appendChild(popup);
  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = "1";
  });
  // Fade out + remove
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 200);
  }, 2000);
}

// =========================
// OVERLAY
// =========================
function createHelpOverlay() {
  if (!location.href.startsWith("https://www.furaffinity.net/msg/others/")) return;
  if (document.getElementById("fa-notif-help-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "fa-notif-help-overlay";
  overlay.style.cssText = `
    font-family: monospace;
    font-size: 12px;
    line-height: 1.1;
    color: white;
    background: rgba(0,0,0,0.7);
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 99999;
    padding: 2px 4px;
    border-top-left-radius: 6px;
    user-select: none;
    pointer-events: none;
    white-space: pre;
    text-shadow: 1px 1px 2px black;
  `;
  overlay.innerHTML = `
  press i = watch_list
  press p = favorite_list
  press o = comment_list
    <br>NOTE: ensure you do not have fuzzy timestamps!
    <br>(FA Settings > Account Settings > Site Settings)
    <br>also found at this url:
    <a href="https://www.furaffinity.net/controls/site-settings/" target="_blank" style="color:#8cf; pointer-events:auto;">
      https://www.furaffinity.net/controls/site-settings/
    </a>
  `;
  document.body.appendChild(overlay);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createHelpOverlay);
} else {
  createHelpOverlay();
}
