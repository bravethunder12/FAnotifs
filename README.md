# FAnotifs
small browser extension to archive your FurAffinity notifications

* Press `i` to save **watch notifications**
* Press `p` to save **favorite notifications**
* Automatically downloads results as `.txt` files
* Toggles all relevant checkboxes so you can press the Remove button

** IMPORTANT!:
  Disable fuzzy timestamps first:
  
  * Go to: https://www.furaffinity.net/controls/site-settings/
  * Set the Date Format to Full (NOT Fuzzy) 

* Works while on this page:
  https://www.furaffinity.net/msg/others/

## Installation (Temporary)

### Firefox

1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json`

### Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension folder

## Usage steps

0. Disable fuzzy timestamps first:
  * Go to: https://www.furaffinity.net/controls/site-settings/
  * Set the Date Format to Full (NOT Fuzzy) 
1. Go to this page:
   https://www.furaffinity.net/msg/others/
2. Press:
   * `i` for watches
   * `p` for favorites
3. File will download automatically
   (stored in the browser default download location)
4. Click the 'Remove' button in Global Selection
   (if you are not storing both watches and favs at the same time, you can click the relevant non-Global 'Remove' button instead)

## Notes

* This extension depends on the current FurAffinity page structure in Modern style, as of March 2026
* It may break if the site layout changes
