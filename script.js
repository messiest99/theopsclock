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

// --- Converter: Build UTC Date from input time & input zone ---
function convertInputToUTC(inputTime, inputZone) {
  const match = inputTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);
  if (!match) return null;

  let [, hours, minutes, ampm] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  // Create a Date object for today at the given time in the input time zone
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Step 1: build ISO string as if in input time zone
  const localStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}T${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:00`;

  // Step 2: convert to UTC by using toLocaleString trick
  const utcDate = new Date(new Date(localStr).toLocaleString("en-US", { timeZone: "UTC", hour12: false }));
  
  // Step 3: calculate offset between input zone and UTC
  const tzOffsetDate = new Date(localStr);
  const tzOffset = tzOffsetDate.getTime() - utcDate.getTime();
  
  // Final UTC date
  return new Date(utcDate.getTime() - tzOffset);
}

// --- Convert Button ---
convertBtn.addEventListener("click", () => {
  const inputTime = convertInput.value.trim();
  const inputZone = convertZoneSelect.value;

  const utcDate = convertInputToUTC(inputTime, inputZone);
  if (!utcDate) {
    convertResults.innerHTML = "Invalid format. Use HH:MM or HH:MM AM/PM";
    return;
  }

  let resultsHtml = "";
  userZones.forEach(zone => {
    const t = utcDate.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    resultsHtml += `<div>${zone.label}: ${t}</div>`;
  });

  convertResults.innerHTML = resultsHtml;
});

// --- Initialize ---
renderClocks();
updateClocks();
setInterval(updateClocks, 1000);
