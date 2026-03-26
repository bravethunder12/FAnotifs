const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveFile") {
    const { text, filename } = message;
    try {
      const blob = new Blob([text], { type: "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      api.downloads.download({
        url: blobUrl,
        filename: filename,
        saveAs: false,
        conflictAction: "uniquify"
      }, () => {
        if (api.runtime.lastError) {
          console.error("Download error:", api.runtime.lastError);
        } else {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        }
      });
    } catch (err) {
      console.error("saveFile error:", err);
    }
  }
});
