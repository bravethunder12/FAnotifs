const api = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
  const key = e.key.toLowerCase();
  if (key === "i") {
    toggleCheckboxes("watches[]");
    extractWatchData();
    const count = document.querySelectorAll("input[name='watches[]']:checked").length;
    showSuccessNotification(`Saved ${count} watch entries`);
  } else if (key === "p") {
    toggleCheckboxes("favorites[]");
    extractFavoriteData();
    const count = document.querySelectorAll("input[name='favorites[]']:checked").length;
    showSuccessNotification(`Saved ${count} favorite entries`);
  }
});

// Extract "Watch" notifications
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
  saveWithIncrement("watch_list.txt", blob);
}

// Extract "Favorite" notifications
function extractFavoriteData() {
  const listItems = Array.from(document.querySelectorAll("li")).filter(li => 
    li.querySelector("input[type='checkbox']") && li.querySelector("a[href^='/user/']")
  );

  console.log("Found items:", listItems.length); // debugging

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

function toggleCheckboxes(name) {
  const checkboxes = Array.from(document.querySelectorAll(`input[name='${name}']`));
  if (checkboxes.length === 0) {
    console.warn(`No checkboxes found for ${name}`);
    return;
  }
  // Determine if we should check or uncheck
  const allChecked = checkboxes.every(cb => cb.checked);
  const newState = !allChecked;
  checkboxes.forEach(cb => {
    cb.checked = newState;
    // Trigger change event (important for some sites)
    cb.dispatchEvent(new Event("change", { bubbles: true }));
  });
  console.log(`${newState ? "Checked" : "Unchecked"} ${checkboxes.length} items for ${name}`);
}

// Send the file to the background script for download
function saveWithIncrement(baseFilename, blob) {
  blob.text().then(text => {
    api.runtime.sendMessage({
      action: "saveFile",
      text: text,
      filename: baseFilename
    });
  });
}

// --- Overlay help text --- //
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
  press i to save watch_list  |  press p to save favorite_list
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

function showSuccessNotification(text) {
  const notif = document.createElement("div");

  notif.textContent = text;

  notif.style.cssText = `
    position: fixed;
    bottom: 40px; /* sits above your overlay */
    right: 0;
    z-index: 100000;

    background: rgba(0, 128, 0, 0.9);
    color: white;

    font-family: monospace;
    font-size: 12px;

    padding: 4px 8px;
    border-top-left-radius: 6px;

    text-shadow: 1px 1px 2px black;

    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  `;

  document.body.appendChild(notif);

  // Fade in
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
  });

  // Fade out + remove
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 200);
  }, 2000);
}