# Sport Ninja

**Block sports spoilers on YouTube – thumbnails, titles, scores, descriptions.**

Sport Ninja hides video thumbnails, titles, and descriptions on YouTube so you can watch your matches on your own schedule without seeing the result first.

---

## Features

- **Blurs thumbnails** on the homepage, search results, Shorts feed, Top News, and watch page recommendations
- **Blurs titles and descriptions** so scores and results stay hidden
- **Hover to preview** – hover over a thumbnail to peek at the video preview without committing
- **Click to reveal** – click the ninja icon on a thumbnail or "Unblur content" below the title to reveal a single card
- **Hides comments and video description** on watch pages to avoid result spoilers in plain sight
- **Hides the progress bar** so video length doesn't give away the score
- **Time window** – only protect videos from the last N days (configurable 1–60 days, or all videos). Older content is never hidden.
- Works across YouTube's homepage, search, Shorts, channel pages, and recommendations

---

## Installation

### From the Chrome Web Store
*Coming soon.*

### Manual (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Visit YouTube – Sport Ninja activates automatically

---

## How It Works

| Where | What's hidden |
|---|---|
| Homepage / Search | Thumbnail, title, description |
| Shorts feed | Thumbnail, title |
| Watch page | Thumbnail, title, description of recommendations; comments and description of the current video |
| Player | Progress bar |

Click **"Unblur content"** below any title to reveal that card's thumbnail, title, and description at once. Click **"Hide content"** to re-blur it.

---

## Settings

Open the extension popup by clicking the Sport Ninja icon in your browser toolbar.

- **Protection active** – toggle to disable/enable all protection instantly
- **Protect videos from the last N days** – set how far back Sport Ninja looks. Drag to the far right for no time limit.

---

## Permissions

- `storage` – saves your settings (on/off, time window) locally in your browser
- `host_permissions: youtube.com` – required to read and modify the YouTube page

No data is ever collected or transmitted. Everything runs locally in your browser.

---

## Privacy

Sport Ninja collects no data. It does not communicate with any external server. All processing happens locally on your device.

---

## License

MIT
