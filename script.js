// --- Default Zones ---
const defaultZones = [
  { label: "Zulu", tz: "UTC" },
  { label: "PST", tz: "America/Los_Angeles" },
  { label: "MST", tz: "America/Denver" },
  { label: "CT", tz: "America/Chicago" },
  { label: "EST", tz: "America/New_York" },
  { label: "London", tz: "Europe/London" }
];

let userZones = JSON.parse(localStorage.getItem("opsclock-zones")) || defaultZones;

// Map custom labels to IANA time zones for converter
const tzMap = {
  "ZULU": "UTC",
  "UTC": "UTC",
  "PST": "America/Los_Angeles",
  "MST": "America/Denver",
  "CT": "America/Chicago",
  "EST": "America/New_York",
  "LONDON": "Europe/London",
  "TOKYO": "Asia/Tokyo",
  "SYDNEY": "Australia/Sydney"
};

const container = document.getElementById("clock-container");
const timezoneSelect = document.getElementById("timezone-select");
const addBtn = document.getElementById("add-zone");
const convertInput = document.getElementById("converter-input");
const convertBtn = document.getElementById("convert-btn");
const convertResults = document.getElementById("converter-results");

// --- LocalStorage ---
function saveZones() {
  localStorage.setItem("opsclock-zones", JSON.stringify(userZones));
}

// --- Render Clocks ---
function renderClocks() {
  container.innerHTML = "";
  userZones.forEach((zone, index) => {
    const clockDiv = document.createElement("div");
    clockDiv.classList.add("clock");

    const label = document.createElement("div");
    label.classList.add("label");
    label.textContent = zone.label;

    const time = document.createElement("div");
    time.classList.add("time");
    time.id = `clock-${index}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      userZones.splice(index, 1);
      saveZones();
      renderClocks();
    });

    clockDiv.appendChild(removeBtn);
    clockDiv.appendChild(label);
    clockDiv.appendChild(time);
    container.appendChild(clockDiv);
  });
}

// --- Update Clocks ---
function updateClocks() {
  const now = new Date();
  userZones.forEach((zone, index) => {
    const t = now.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    document.getElementById(`clock-${index}`).textContent = t;
  });
}

// --- Add Zone ---
addBtn.addEventListener("click", () => {
  const selectedTz = timezoneSelect.value;
  const selectedLabel = timezoneSelect.options[timezoneSelect.selectedIndex].text;

  if (!userZones.some(z => z.tz === selectedTz)) {
    userZones.push({ label: selectedLabel, tz: selectedTz });
    saveZones();
    renderClocks();
  }
});

// --- Smart Time Converter with Dropdown ---
const convertInput = document.getElementById("converter-input");
const convertZoneSelect = document.getElementById("converter-zone");
const convertBtn = document.getElementById("convert-btn");
const convertResults = document.getElementById("converter-results");

function parseTimeInputWithDropdown(input, tzInput) {
  const match = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);
  if (!match) return null;

  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  const now = new Date();
  let date;
  try {
    date = new Date(now.toLocaleString("en-US", { timeZone: tzInput }));
    date.setHours(hours, minutes, 0, 0);
  } catch (e) {
    return null;
  }

  return { date };
}

convertBtn.addEventListener("click", () => {
  const inputTime = convertInput.value.trim();
  const tzInput = convertZoneSelect.value;

  const parsed = parseTimeInputWithDropdown(inputTime, tzInput);
  if (!parsed) {
    convertResults.innerHTML = "Invalid format. Use e.g., 17:00 or 5:30 PM";
    return;
  }

  const { date } = parsed;
  let resultsHtml = "";
  userZones.forEach(zone => {
    const t = date.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    resultsHtml += `<div>${zone.label}: ${t}</div>`;
  });

  convertResults.innerHTML = resultsHtml;
});


// Convert Button
convertBtn.addEventListener("click", () => {
  const parsed = parseTimeInput(convertInput.value.trim());
  if (!parsed) {
    convertResults.innerHTML = "Invalid format. Use e.g., MST 5:30 PM or Zulu 23:00";
    return;
  }

  const { date } = parsed;
  let resultsHtml = "";
  userZones.forEach(zone => {
    const t = date.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    resultsHtml += `<div>${zone.label}: ${t}</div>`;
  });

  convertResults.innerHTML = resultsHtml;
});

// --- Init ---
renderClocks();
updateClocks();
setInterval(updateClocks, 1000);
