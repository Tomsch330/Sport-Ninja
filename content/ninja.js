// ninja.js
// Haupt-Logic: Beobachtet die YouTube-Seite und schützt vor Spoilern

const Ninja = (() => {

  // --- State ---
  let settings = {
    enabled: true,
    maxAgeDays: 14,
  };
  // --- Selektoren für YouTube-Elemente ---
  const SEL = {
    videoCard:       "ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, yt-lockup-view-model",
    thumbnail:       "#thumbnail, a#thumbnail",
    thumbnailImg:    "#img, img.yt-core-image",
    title:           "#video-title, #title-wrapper yt-formatted-string",
    duration:        "span.ytd-thumbnail-overlay-time-status-renderer, ytd-thumbnail-overlay-time-status-renderer",
    progressBar:     ".ytp-play-progress, .ytp-load-progress",
    progressBarWrap: ".ytp-progress-bar-container",
    comments:        "ytd-comments#comments",
    description:     "#description-inner, ytd-expander#description",
    relatedVideos:   "ytd-watch-next-secondary-results-renderer",
  };

  // --- Hilfsfunktionen ---

  function isRecentVideo(videoEl) {
    if (settings.maxAgeDays === -1) return true; // Kein Zeitlimit: immer schützen
    // Versucht das Alter über den metadata-line-Text zu ermitteln
    const meta = videoEl.querySelector("ytd-video-meta-block, #metadata-line");
    if (!meta) return true; // Im Zweifel schützen
    const text = meta.textContent.toLowerCase();
    // YouTube zeigt: "vor 2 Stunden", "vor 3 Tagen", "vor 1 Woche" etc.
    if (text.includes("stunde") || text.includes("minute") || text.includes("sekunde")) return true;
    if (text.includes("hour") || text.includes("minute") || text.includes("second")) return true;
    const dayMatch = text.match(/vor\s+(\d+)\s+tag/);
    if (dayMatch && parseInt(dayMatch[1]) <= settings.maxAgeDays) return true;
    const daysMatch = text.match(/(\d+)\s+day/);
    if (daysMatch && parseInt(daysMatch[1]) <= settings.maxAgeDays) return true;
    const weekMatch = text.match(/vor\s+(\d+)\s+woche/);
    if (weekMatch && parseInt(weekMatch[1]) * 7 <= settings.maxAgeDays) return true;
    const weeksMatch = text.match(/(\d+)\s+week/);
    if (weeksMatch && parseInt(weeksMatch[1]) * 7 <= settings.maxAgeDays) return true;
    return false;
  }

  // --- Thumbnail schützen ---

  function protectThumbnail(cardEl) {
    const thumb = cardEl.querySelector(SEL.thumbnail);
    if (!thumb || thumb.dataset.ninjaProtected) return;

    // Klasse auf ytd-thumbnail setzen, damit auch ytd-moving-thumbnail-renderer
    // (Hover-Preview) vom Blur und vom Reveal erfasst wird
    const ytdThumb = thumb.closest("ytd-thumbnail, yt-thumbnail-view-model") || thumb;

    thumb.dataset.ninjaProtected = "true";
    ytdThumb.style.position = "relative";
    ytdThumb.classList.remove("ninja-revealed");

    // Ninja-Overlay erstellen
    const overlay = document.createElement("div");
    overlay.className = "ninja-overlay";
    overlay.innerHTML = `<span class="ninja-icon" title="Spoiler versteckt – klicken zum Enthüllen">🥷</span>`;
    thumb.appendChild(overlay);

    // Reveal-Logik: Klick enthüllt
    overlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      ytdThumb.classList.add("ninja-revealed");
      overlay.remove();
    });
  }

  // --- Titel schützen ---

  function protectTitle(cardEl) {
    const titleEl = cardEl.querySelector(SEL.title);
    if (!titleEl || titleEl.dataset.ninjaProtected) return;

    const originalTitle = titleEl.textContent.trim();
    if (!originalTitle) return;

    titleEl.dataset.ninjaProtected = "true";
    titleEl.classList.add("ninja-title-blurred");

    const safe = document.createElement("div");
    safe.className = "ninja-title-safe";
    safe.textContent = "Show title";
    safe.title = "Klicken zum Enthüllen";
    titleEl.after(safe);

    safe.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      titleEl.classList.remove("ninja-title-blurred");
      safe.remove();
    });
  }

  // --- Videolänge verstecken ---

  function protectDuration(cardEl) {
    const dur = cardEl.querySelector(SEL.duration);
    if (!dur || dur.dataset.ninjaProtected) return;
    dur.dataset.ninjaProtected = "true";
    dur.classList.add("ninja-hidden");
  }

  // --- Fortschrittsbalken im Player verstecken ---

  function protectProgressBar() {
    const bar = document.querySelector(SEL.progressBarWrap);
    if (bar && !bar.dataset.ninjaProtected) {
      bar.dataset.ninjaProtected = "true";
      bar.classList.add("ninja-hidden");
    }
  }

  // --- Kommentare einklappen ---

  function protectComments() {
    const comments = document.querySelector(SEL.comments);
    if (comments && !comments.dataset.ninjaProtected) {
      comments.dataset.ninjaProtected = "true";
      comments.classList.add("ninja-collapsed");

      const banner = document.createElement("div");
      banner.className = "ninja-comments-banner";
      banner.innerHTML = `🥷 Kommentare sind versteckt – <button class="ninja-reveal-btn">Enthüllen</button>`;
      comments.before(banner);

      banner.querySelector(".ninja-reveal-btn").addEventListener("click", () => {
        comments.classList.remove("ninja-collapsed");
        banner.remove();
      });
    }
  }

  // --- Beschreibung sperren ---

  function protectDescription() {
    const desc = document.querySelector(SEL.description);
    if (desc && !desc.dataset.ninjaProtected) {
      desc.dataset.ninjaProtected = "true";
      desc.classList.add("ninja-collapsed");

      const banner = document.createElement("div");
      banner.className = "ninja-comments-banner";
      banner.innerHTML = `🥷 Beschreibung ist versteckt – <button class="ninja-reveal-btn">Enthüllen</button>`;
      desc.before(banner);

      banner.querySelector(".ninja-reveal-btn").addEventListener("click", () => {
        desc.classList.remove("ninja-collapsed");
        banner.remove();
      });
    }
  }

  // --- Eine Video-Karte vollständig schützen ---

  function protectCard(cardEl) {
    if (!settings.enabled) return;
    if (cardEl.dataset.ninjaProcessed) return;

    if (isRecentVideo(cardEl)) {
      // Volles Schutzpaket für Videos im Zeitfenster
      protectThumbnail(cardEl);
      protectTitle(cardEl);
      protectDuration(cardEl);
      // Erst als verarbeitet markieren wenn Thumbnail gefunden wurde,
      // sonst beim nächsten Observer-Aufruf erneut versuchen
      if (cardEl.querySelector(SEL.thumbnail)) {
        cardEl.dataset.ninjaProcessed = "true";
      }
    } else {
      // Altes Video: CSS-Pre-Blur explizit aufheben
      const thumb = cardEl.querySelector(SEL.thumbnail);
      if (thumb) {
        const ytdThumb = thumb.closest("ytd-thumbnail, yt-thumbnail-view-model") || thumb;
        ytdThumb.classList.add("ninja-revealed");
      }
    }
  }

  // --- Alle Ninja-Änderungen rückgängig machen und neu verarbeiten ---

  function resetAndReprocess() {
    document.querySelectorAll("[data-ninja-protected]").forEach(el => {
      el.removeAttribute("data-ninja-protected");
      el.classList.remove("ninja-title-blurred", "ninja-desc-blurred", "ninja-hidden");
      el.style.position = "";
    });
    document.querySelectorAll(".ninja-title-safe, .ninja-overlay").forEach(el => el.remove());
    document.querySelectorAll(".ninja-revealed").forEach(el => el.classList.remove("ninja-revealed"));
    document.querySelectorAll("[data-ninja-processed]").forEach(el => el.removeAttribute("data-ninja-processed"));
    processAllCards();
    processWatchPage();
  }

  // --- Beschreibungen schützen (separater Pass, da sie später geladen werden) ---

  function protectDescriptions() {
    if (!settings.enabled) return;
    document.querySelectorAll(".metadata-snippet-container, yt-formatted-string.metadata-snippet-text, #description-text").forEach(el => {
      if (el.dataset.ninjaProtected) return;
      const card = el.closest(SEL.videoCard);
      if (card && !isRecentVideo(card)) return;
      el.dataset.ninjaProtected = "true";
      el.classList.add("ninja-desc-blurred");
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.classList.remove("ninja-desc-blurred");
      }, { once: true });
    });
  }

  // --- Alle sichtbaren Karten verarbeiten ---

  function processAllCards() {
    document.querySelectorAll(SEL.videoCard).forEach(protectCard);
    protectDescriptions();
  }

  // --- Watchpage-spezifische Elemente ---

  function processWatchPage() {
    if (!window.location.pathname.startsWith("/watch")) return;
    protectComments();
    protectDescription();
  }

  // --- MutationObserver: fängt dynamisch geladene Inhalte ab ---

  const observer = new MutationObserver((mutations) => {
    let needsProcessing = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        needsProcessing = true;
        break;
      }
    }
    if (needsProcessing) {
      processAllCards();
      processWatchPage();
    }
  });

  // --- Init ---

  function init() {
    chrome.storage.local.get(["enabled", "maxAgeDays"], (stored) => {
      if (stored.enabled !== undefined) settings.enabled = stored.enabled;
      if (stored.maxAgeDays !== undefined) settings.maxAgeDays = stored.maxAgeDays;

      processAllCards();
      processWatchPage();

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  // Einstellungsänderungen aus dem Popup sofort übernehmen
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled !== undefined) settings.enabled = changes.enabled.newValue;
    if (changes.maxAgeDays !== undefined) {
      settings.maxAgeDays = changes.maxAgeDays.newValue;
      resetAndReprocess();
    }
  });

  // Auf YouTube-Navigation (SPA) reagieren
  window.addEventListener("yt-navigate-finish", () => {
    processAllCards();
    processWatchPage();
  });

  return { init };

})();

Ninja.init();
