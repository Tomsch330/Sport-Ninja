// popup.js

const toggleEnabled   = document.getElementById("toggleEnabled");
const maxAgeDaysInput = document.getElementById("maxAgeDays");
const daysLabel       = document.getElementById("daysLabel");
const rangeValueEl    = document.getElementById("rangeValue");

// Slider-Wert 61 = kein Zeitlimit (wird als -1 in storage gespeichert)
const UNLIMITED_SLIDER = 61;
const UNLIMITED_VALUE  = -1;

// Einstellungen laden
chrome.storage.local.get(["enabled", "maxAgeDays"], (stored) => {
  if (stored.enabled !== undefined) {
    toggleEnabled.checked = stored.enabled;
  }
  if (stored.maxAgeDays !== undefined) {
    const sliderVal = stored.maxAgeDays === UNLIMITED_VALUE ? UNLIMITED_SLIDER : stored.maxAgeDays;
    maxAgeDaysInput.value = sliderVal;
    updateLabel(sliderVal);
  }
});

// Toggle: Schutz ein/aus
toggleEnabled.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggleEnabled.checked });
});

let storageTimeout; // Timer-Variable ganz oben oder vor dem Event-Listener

maxAgeDaysInput.addEventListener("input", () => {
  const sliderVal = parseInt(maxAgeDaysInput.value);
  
  // 1. UI sofort aktualisieren (kostet keine Performance)
  updateLabel(sliderVal);

  // 2. Laufenden Speicher-Timer abbrechen
  clearTimeout(storageTimeout);

  // 3. Erst nach 300ms Ruhezeit wirklich speichern
  storageTimeout = setTimeout(() => {
    const storageVal = sliderVal >= UNLIMITED_SLIDER ? UNLIMITED_VALUE : sliderVal;
    chrome.storage.local.set({ maxAgeDays: storageVal });
  }, 300); 
});

function updateLabel(sliderVal) {
  if (sliderVal >= UNLIMITED_SLIDER) {
    daysLabel.textContent = "∞";
    rangeValueEl.textContent = "All videos";
    rangeValueEl.classList.add("unlimited");
  } else {
    daysLabel.textContent = sliderVal;
    rangeValueEl.textContent = `${sliderVal} days`;
    rangeValueEl.classList.remove("unlimited");
  }
}
