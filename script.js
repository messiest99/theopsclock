function updateClocks() {
  const now = new Date();

  const utc = now.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour12: false
  });

  const ny = now.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour12: false
  });

  document.getElementById("utc").textContent = utc;
  document.getElementById("ny").textContent = ny;
}

setInterval(updateClocks, 1000);
updateClocks();
