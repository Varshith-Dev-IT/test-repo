const markerReadout = document.getElementById("markerReadout");
const centerReadout = document.getElementById("centerReadout");
const zoomReadout = document.getElementById("zoomReadout");
const statusReadout = document.getElementById("statusReadout");
const latInput = document.getElementById("lat");
const lngInput = document.getElementById("lng");
const zoomInput = document.getElementById("zoom");
const flyBtn = document.getElementById("flyBtn");
const locateBtn = document.getElementById("locateBtn");
const clearBtn = document.getElementById("clearBtn");
const basemapSelect = document.getElementById("basemap");
const tryKathmandu = document.getElementById("tryKathmandu");
const tryReykjavik = document.getElementById("tryReykjavik");

const animToggle = document.getElementById("animToggle");
const planeCount = document.getElementById("planeCount");
const planeCountVal = document.getElementById("planeCountVal");
const planeSpeed = document.getElementById("planeSpeed");
const planeSpeedVal = document.getElementById("planeSpeedVal");
const planeLane = document.getElementById("planeLane");

const citySpeed = document.getElementById("citySpeed");
const citySpeedVal = document.getElementById("citySpeedVal");
const peopleCount = document.getElementById("peopleCount");
const peopleCountVal = document.getElementById("peopleCountVal");
const peopleSpeed = document.getElementById("peopleSpeed");
const peopleSpeedVal = document.getElementById("peopleSpeedVal");
const skyline = document.getElementById("skyline");
const peopleLane = document.getElementById("peopleLane");
const scrollBg = document.getElementById("scrollBg");
const sectionAtmosphere = document.getElementById("layers");
const sectionStratosphere = document.getElementById("stratosphere");
const sectionCity = document.getElementById("city");
const sectionExplore = document.getElementById("explore");

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const toFixedSmart = (n) => (Math.abs(n) >= 100 ? n.toFixed(3) : n.toFixed(5));
const fmtLatLng = (latlng) => `${toFixedSmart(latlng.lat)}, ${toFixedSmart(latlng.lng)}`;
const rand = (min, max) => Math.random() * (max - min) + min;
const clearChildren = (el) => {
    while (el && el.firstChild) el.removeChild(el.firstChild);
};

const map = L.map("map", { zoomControl: false, worldCopyJump: true }).setView([20, 0], 2);
L.control.zoom({ position: "bottomright" }).addTo(map);

const baseLayers = {
    osm: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }),
    sat: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
    })
};

let activeLayer = baseLayers.osm.addTo(map);
let marker = null;

const setStatus = (text, kind = "info") => {
    statusReadout.textContent = text;
    statusReadout.style.color = kind === "danger" ? "rgba(255,106,106,.92)" : "rgba(234,241,255,.72)";
};

const updateCenterReadouts = () => {
    const center = map.getCenter();
    centerReadout.textContent = fmtLatLng(center);
    zoomReadout.textContent = String(map.getZoom());
};

const setMarker = (latlng) => {
    if (!marker) {
        marker = L.marker(latlng, { keyboard: true }).addTo(map);
    } else {
        marker.setLatLng(latlng);
    }
    markerReadout.textContent = fmtLatLng(latlng);
};

const clearMarker = () => {
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
    markerReadout.textContent = "No marker yet";
};

const parseLatLngZoom = () => {
    const lat = Number(latInput.value);
    const lng = Number(lngInput.value);
    const zoom = zoomInput.value.trim() === "" ? map.getZoom() : Number(zoomInput.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) return null;
    return { lat: clamp(lat, -90, 90), lng: clamp(lng, -180, 180), zoom: clamp(Math.round(zoom), 1, 19) };
};

const flyToInputs = () => {
    const parsed = parseLatLngZoom();
    if (!parsed) {
        setStatus("Enter valid numbers for lat, lng, and zoom.", "danger");
        return;
    }
    map.flyTo([parsed.lat, parsed.lng], parsed.zoom, { duration: 1.2 });
    setMarker({ lat: parsed.lat, lng: parsed.lng });
    setStatus("Flying to coordinates.");
};

const setBasemap = (key) => {
    const next = baseLayers[key] || baseLayers.osm;
    if (activeLayer === next) return;
    map.removeLayer(activeLayer);
    activeLayer = next.addTo(map);
    setStatus(`Basemap: ${basemapSelect.options[basemapSelect.selectedIndex].text}`);
};

flyBtn.addEventListener("click", flyToInputs);
basemapSelect.addEventListener("change", (e) => setBasemap(e.target.value));
clearBtn.addEventListener("click", () => {
    clearMarker();
    setStatus("Cleared marker.");
});

locateBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
        setStatus("Geolocation not supported in this browser.", "danger");
        return;
    }
    setStatus("Requesting location…");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.flyTo([lat, lng], 13, { duration: 1.2 });
            setMarker({ lat, lng });
            setStatus("Location found.");
        },
        () => setStatus("Location permission denied or unavailable.", "danger"),
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 15000 }
    );
});

tryKathmandu.addEventListener("click", () => {
    latInput.value = "27.7172";
    lngInput.value = "85.3240";
    zoomInput.value = "11";
    flyToInputs();
});
tryReykjavik.addEventListener("click", () => {
    latInput.value = "64.1466";
    lngInput.value = "-21.9426";
    zoomInput.value = "12";
    flyToInputs();
});

map.on("click", (e) => {
    setMarker(e.latlng);
    setStatus("Marker placed.");
});
map.on("move", updateCenterReadouts);

const setAnimationsEnabled = (enabled) => {
    document.documentElement.classList.toggle("animOff", !enabled);
};

const readNumberAttr = (el, name, fallback) => {
    if (!el) return fallback;
    const raw = el.getAttribute(name);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
};

const rebuildPlanes = () => {
    if (!planeLane) return;

    const countFromControls = planeCount ? Math.round(Number(planeCount.value)) : null;
    const durationFromControls = planeSpeed ? Math.round(Number(planeSpeed.value)) : null;

    const count = clamp(
        Number.isFinite(countFromControls) ? countFromControls : readNumberAttr(planeLane, "data-plane-count", 8),
        3,
        18
    );
    const baseDuration = clamp(
        Number.isFinite(durationFromControls)
            ? durationFromControls
            : readNumberAttr(planeLane, "data-plane-speed", 16),
        6,
        42
    );
    if (planeCountVal) planeCountVal.textContent = String(count);
    if (planeSpeedVal) planeSpeedVal.textContent = `${baseDuration}s`;

    clearChildren(planeLane);
    for (let i = 0; i < count; i++) {
        const plane = document.createElement("div");
        plane.className = "plane";
        plane.style.setProperty("--top", `${rand(18, 78).toFixed(2)}%`);
        plane.style.setProperty("--scale", rand(0.65, 1.15).toFixed(2));
        plane.style.setProperty("--alpha", rand(0.55, 0.95).toFixed(2));
        plane.style.setProperty("--duration", `${clamp(baseDuration + Math.round(rand(-3, 4)), 6, 42)}s`);
        plane.style.setProperty("--delay", `${(-rand(0, baseDuration)).toFixed(2)}s`);
        planeLane.appendChild(plane);
    }
};

const rebuildSkyline = () => {
    if (!skyline) return;

    clearChildren(skyline);
    const count = 26;
    for (let i = 0; i < count; i++) {
        const building = document.createElement("div");
        building.className = "building";
        building.style.setProperty("--w", `${Math.round(rand(28, 64))}px`);
        building.style.setProperty("--h", `${Math.round(rand(120, 280))}px`);
        building.style.setProperty("--lit", rand(0.08, 0.38).toFixed(2));
        skyline.appendChild(building);
    }
};

const rebuildWalkers = () => {
    if (!peopleLane) return;

    const countFromControls = peopleCount ? Math.round(Number(peopleCount.value)) : null;
    const durationFromControls = peopleSpeed ? Math.round(Number(peopleSpeed.value)) : null;
    const count = clamp(
        Number.isFinite(countFromControls) ? countFromControls : readNumberAttr(peopleLane, "data-people-count", 10),
        1,
        28
    );
    const duration = clamp(
        Number.isFinite(durationFromControls)
            ? durationFromControls
            : readNumberAttr(peopleLane, "data-people-speed", 13),
        5,
        50
    );
    if (peopleCountVal) peopleCountVal.textContent = String(count);
    if (peopleSpeedVal) peopleSpeedVal.textContent = `${duration}s`;

    peopleLane.style.setProperty("--walkDuration", `${duration}s`);
    clearChildren(peopleLane);
    for (let i = 0; i < count; i++) {
        const walker = document.createElement("div");
        walker.className = "walker";
        walker.style.setProperty("--scale", rand(0.75, 1.2).toFixed(2));
        walker.style.setProperty("--alpha", rand(0.55, 0.95).toFixed(2));
        walker.style.setProperty("--y", `${Math.round(rand(4, 20))}px`);
        walker.style.setProperty("--delay", `${(-rand(0, duration)).toFixed(2)}s`);
        peopleLane.appendChild(walker);
    }
};

const applyCitySpeed = () => {
    if (!skyline) return;
    const durationFromControls = citySpeed ? Math.round(Number(citySpeed.value)) : null;
    const duration = clamp(
        Number.isFinite(durationFromControls) ? durationFromControls : readNumberAttr(skyline, "data-city-speed", 18),
        0,
        60
    );
    if (citySpeedVal) citySpeedVal.textContent = duration === 0 ? "Off" : `${duration}s`;
    skyline.style.setProperty("--cityDuration", `${Math.max(duration, 1)}s`);
    skyline.classList.toggle("skyline--still", duration === 0);
};

if (animToggle) {
    setAnimationsEnabled(animToggle.checked);
    animToggle.addEventListener("change", (e) => setAnimationsEnabled(e.target.checked));
}
if (planeCount) planeCount.addEventListener("input", rebuildPlanes);
if (planeSpeed) planeSpeed.addEventListener("input", rebuildPlanes);
if (citySpeed) citySpeed.addEventListener("input", applyCitySpeed);
if (peopleCount) peopleCount.addEventListener("input", rebuildWalkers);
if (peopleSpeed) peopleSpeed.addEventListener("input", rebuildWalkers);

rebuildPlanes();
rebuildSkyline();
rebuildWalkers();
applyCitySpeed();

const setBgLayerVisibility = (el, amount) => {
    if (!el) return;
    const a = clamp(amount, 0, 1);
    el.style.opacity = a.toFixed(3);
    el.style.transform = `translate3d(0, ${(1 - a) * 18}px, 0)`;
};

const sectionWeight = (sectionEl) => {
    if (!sectionEl) return 0;
    const rect = sectionEl.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const d = Math.abs(mid - window.innerHeight * 0.52);
    return clamp(1 - d / (window.innerHeight * 0.9), 0, 1);
};

const cloudBands = scrollBg ? scrollBg.querySelectorAll(".cloudBand") : [];
let rafId = 0;
const tickScrollBg = () => {
    rafId = 0;
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollN = clamp(window.scrollY / scrollMax, 0, 1);
    document.documentElement.style.setProperty("--scrollN", scrollN.toFixed(4));

    const wStrato = sectionWeight(sectionStratosphere);
    const wCity = sectionWeight(sectionCity);
    const wClouds = sectionWeight(sectionExplore);

    setBgLayerVisibility(planeLane, wStrato);
    setBgLayerVisibility(skyline, wCity);
    setBgLayerVisibility(peopleLane, wCity);

    for (const band of cloudBands) {
        const base = band.classList.contains("cloudBand--bg2") ? 0.7 : 1;
        const a = clamp(wClouds * base, 0, 1);
        band.style.opacity = (0.16 + a * 0.42).toFixed(3);
        band.style.transform = `translate3d(0, ${(1 - a) * 16}px, 0)`;
    }
};

const requestTick = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(tickScrollBg);
};

if (scrollBg) {
    tickScrollBg();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
}

map.whenReady(() => {
    updateCenterReadouts();
    document.getElementById("year").textContent = `© ${new Date().getFullYear()} GeoDive`;
});
