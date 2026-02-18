const defaultZones = [
  { label: "Zulu", tz: "UTC" },
  { label: "PST", tz: "America/Los_Angeles" },
  { label: "MST", tz: "America/Denver" },
  { label: "CT", tz: "America/Chicago" },
  { label: "EST", tz: "America/New_York" },
  { label: "London", tz: "Europe/London" }
];

let userZones = JSON.parse(localStorage.getItem("opsclock-zones")) || defaultZones;

const container = document.getElementById("clock-container");
const timezoneSelect = document.getElementById("timezone-select");
const addBtn = document.getElementById("add-zone");

function saveZones() {
  localStorage.setItem("opsclock-zones", JSON.stringify(userZones));
}

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
    
    clockDiv.appendChild(label);
    clockDiv.appendChild(time);
    container.appendChild(clockDiv);
  });
}

function updateClocks() {
  const now = new Date();
  userZones.forEach((zone, index) => {
    const t = now.toLocaleTimeString("en-US", { timeZone: zone.tz, hour12: false });
    document.getElementById(`clock-${index}`).textContent = t;
  });
}

addBtn.addEventListener("click", () => {
  const selectedTz = timezoneSelect.value;
  const selectedLabel = timezoneSelect.options[timezoneSelect.selectedIndex].text;
  
  // prevent duplicates
  if (!userZones.some(z => z.tz === selectedTz)) {
    userZones.push({ label: selectedLabel, tz: selectedTz });
    saveZones();
    renderClocks();
  }
});

renderClocks();
updateClocks();
setInterval(updateClocks, 1000);
