// --- Default Zones ---
const defaultZones = [
  { label: "Zulu", tz: "UTC" },
  { label: "PST", tz: "America/Los_Angeles" },
  { label: "MST", tz: "America/Denver" },
  { label: "CT", tz: "America/Chicago" },
  { label: "EST", tz: "America/New_York" },
  { label: "London", tz: "Europe/London" }
];

// Load user zones from localStorage or use default
let userZones = JSON.parse(localStorage.getItem("opsclock-zones")) || defaultZones;

// DOM Elements
const container = document.getElementById("clock-container");
const timezoneSelect = document.getElementById("timezone-select");
const addBtn = document.getElementById("add-zone");
const convertInput = document.getElementById("converter-input");
const convertZoneSelect = document.getElementById("converter-zone");
const convertBtn = document.getElementById("convert-btn");
const convertResults = document.getElementById("converter-results");

// --- Save Zones to localStorage ---
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

// --- Update Clocks Every Second ---
function updateClocks() {
  const now = new Date();
  userZones.forEach((zone, index) => {
    const t = now.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    document.getElementById(`clock-${index}`).textContent = t;
  });
}

// --- Add Zone Button ---
addBtn.addEventListener("click", () => {
  const selectedTz = timezoneSelect.value;
  const selectedLabel = timezoneSelect.options[timezoneSelect.selectedIndex].text;

  if (!userZones.some(z => z.tz === selectedTz)) {
    userZones.push({ label: selectedLabel, tz: selectedTz });
    saveZones();
    renderClocks();
  }
});

// --- Time Converter with Dropdown (fixed) ---
function parseTimeInput(input, tzInput) {
  // Match HH:MM with optional AM/PM
  const match = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);
  if (!match) return null;

  let [, hours, minutes, ampm] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  // Handle AM/PM
  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  // Create Date in UTC equivalent of input zone
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}T${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:00`;
  
  // Build date as if in input time zone by using toLocaleString trick
  const date = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: tzInput }));
  
  return { date };
}

// --- Convert Button Event ---
convertBtn.addEventListener("click", () => {
  const inputTime = convertInput.value.trim();
  const tzInput = convertZoneSelect.value;

  const parsed = parseTimeInput(inputTime, tzInput);
  if (!parsed) {
    convertResults.innerHTML = "Invalid format. Use e.g., 14:00 or 5:30 PM";
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

// --- Initialize ---
renderClocks();
updateClocks();
setInterval(updateClocks, 1000);
