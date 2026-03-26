const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveFile") {
    const { text, filename } = message;
    try {
      const blob = new Blob([text], { type: "text/plain" });
      const reader = new FileReader();
      reader.onload = function () {
        api.downloads.download({
          url: reader.result,
          filename: filename,
          saveAs: false,
          conflictAction: "uniquify"
        }, (downloadId) => {
          if (api.runtime.lastError) {
            console.error("Download error:", api.runtime.lastError);
          } else {
            console.log("Download started:", downloadId);
          }
        });
      };
      reader.onerror = function (err) {
        console.error("FileReader error:", err);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("saveFile error:", err);
    }
  }
  return true;
});
