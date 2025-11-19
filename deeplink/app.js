// Estado principal
const state = {
  template: createEmptyTemplate(),
  templates: loadTemplates(),
};
let currentStep = 1;

const INTERNAL_VARIABLES = [
  { key: "checkIn", label: "checkIn (ISO date)", formatHint: "YYYY-MM-DD" },
  { key: "checkOut", label: "checkOut (ISO date)", formatHint: "YYYY-MM-DD" },
  { key: "adults", label: "adults (integer)" },
  { key: "children", label: "children (integer)" },
  { key: "totalGuests", label: "totalGuests (adults+children)", formatHint: "integer" },
  { key: "nights", label: "nights (auto if missing)" },
  { key: "promoCode", label: "promoCode (text)" },
  { key: "currency", label: "currency (ISO 4217)" },
  { key: "hotelId", label: "hotelId (text)" },
];

const COMMON_TEMPLATES = {
  melia: {
    name: "Meliá Booking",
    exampleUrl:
      "https://www.melia.com/en/booking?hotelCode=1508&month=2&day=25&year=2026&nights=3&currency=EUR&utm_content=1508&rooms=1&idLang=en&adultsRoom1=2&childrenRoom1=0",
  },
  synxis: {
    name: "SynXis Demo",
    exampleUrl:
      "https://reservations.synxis.com/search?arrive=2025-12-05&depart=2025-12-08&adult=2&child=1&promo=HOTELTWIN&currency=EUR",
  },
  amadeus: {
    name: "Amadeus / TravelClick iHotelier",
    exampleUrl:
      "https://example-hotel.com/book?dateIn=2025-12-05&dateOut=2025-12-08&adults=2&children=1&rooms=1&rateplanID=BAR&roomTypeID=DLX&referID=TRACK123",
  },
  bookassist: {
    name: "Bookassist",
    exampleUrl:
      "https://bookassist.com/booking?date_in=2025-12-05&nn=3&adults=2&rms=1&price_group=SUMMER&vgo=1&utm_source=meta",
  },
  windsufrer: {
    name: "SHR Windsurfer",
    exampleUrl:
      "https://booking.myhotel.com/?sbe_startDate=2025-12-05&sbe_endDate=2025-12-08&sbe_adults=2&sbe_children=1&sbe_rooms=1&sbe_promoCode=TEST",
  },
  mews: {
    name: "Mews Distributor",
    exampleUrl:
      "https://myhotel.mews.li/distributor/dc?mewsStart=2025-12-05&mewsEnd=2025-12-08&mewsAdultCount=2&mewsChildCount=1&mewsRoom=DLX&mewsVoucherCode=PROMO",
  },
  planet: {
    name: "Planet / D-EDGE (HotSoft)",
    exampleUrl:
      "https://booking.planet.example/?Arrival=2025-12-05&Departure=2025-12-08&NroOfAdults=2&NroOfRooms=1&PromotionalCode=CODE123&PrimaryReport=PR1",
  },
  clock: {
    name: "Clock PMS+",
    exampleUrl:
      "https://wbe.clock-software.com/myhotel/reserve?arrival=2025-12-05&departure=2025-12-08&room_type_ids=DLX&rate_ids=BAR&bonus_code=CODE&submit=true",
  },
  cloudbeds: {
    name: "Cloudbeds",
    exampleUrl:
      "https://hotels.cloudbeds.com/reservation/abcd1234?checkin=2025-12-05&checkout=2025-12-08&adults=2&kids=1&promo=PROMO&rate_plan=BAR",
  },
  reservhotel: {
    name: "ReservHotel / Tambourine",
    exampleUrl:
      "https://reservhotel.com/booking?ADATE=2025-12-05&DDATE=2025-12-08&ADULTS=2&CHILD=1&ROOMS=1&PC=PROMO&AFF=AFFID",
  },
};

function createEmptyTemplate() {
  return {
    name: "",
    exampleUrl: "",
    exampleParsed: null,
    mappingRules: [],
  };
}

function loadTemplates() {
  try {
    const raw = localStorage.getItem("deeplinkTemplates");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo cargar templates", e);
    return [];
  }
}

function persistTemplates() {
  localStorage.setItem("deeplinkTemplates", JSON.stringify(state.templates));
}

function parseExampleUrl(exampleUrl) {
  const url = new URL(exampleUrl);
  const pathSegments = url.pathname
    .split("/")
    .filter(Boolean)
    .map((value, index) => ({ segmentIndex: index, value, type: "path_segment" }));

  const querySlots = [];
  let pos = 0;
  for (const [name, value] of url.searchParams.entries()) {
    querySlots.push({ name, value, position: pos, type: "query_param" });
    pos += 1;
  }

  const fragmentSlots = [];
  if (url.hash && url.hash.length > 1) {
    const frag = url.hash.substring(1);
    if (frag.includes("=")) {
      const pairs = frag.split("&");
      pairs.forEach((pair, idx) => {
        const [name, value = ""] = pair.split("=");
        fragmentSlots.push({
          name,
          value: decodeURIComponent(value),
          position: idx,
          type: "fragment_param",
        });
      });
    } else {
      fragmentSlots.push({
        name: "fragment",
        value: frag,
        position: 0,
        type: "fragment_param",
      });
    }
  }

  return {
    origin: url.origin,
    host: url.host,
    scheme: url.protocol.replace(":", ""),
    pathSegments,
    querySlots,
    fragmentSlots,
  };
}

function slotId(slot) {
  if (slot.type === "path_segment") return `${slot.type}:${slot.segmentIndex}`;
  return `${slot.type}:${slot.name}:${slot.position}`;
}

function findRule(id) {
  return state.template.mappingRules.find((r) => r.id === id);
}

function upsertRule(slot, updates) {
  const id = slotId(slot);
  const existing = findRule(id);
  if (!updates || !updates.sourceVar) {
    state.template.mappingRules = state.template.mappingRules.filter((r) => r.id !== id);
    return;
  }

  const base = {
    id,
    targetType: slot.type,
    name: slot.name ?? null,
    position: slot.position ?? null,
    segmentIndex: slot.segmentIndex ?? null,
    sourceVar: updates.sourceVar,
    formatPattern: updates.formatPattern || "",
    uppercase: !!updates.uppercase,
  };

  if (existing) {
    Object.assign(existing, base, updates);
  } else {
    state.template.mappingRules.push({ ...base, ...updates });
  }
}

function renderParsedSlots() {
  const parsed = state.template.exampleParsed;
  const summary = document.getElementById("parsedSummary");
  const allSlotsEl = document.getElementById("allSlots");

  if (!parsed) {
    summary.textContent = "Paste a link and parse it to see available slots.";
    if (allSlotsEl) allSlotsEl.innerHTML = "";
    return;
  }

  summary.innerHTML = `
    <span class="tag">Host: ${parsed.host}</span>
    <span class="tag">Path segments: ${parsed.pathSegments.length}</span>
    <span class="tag">Query params: ${parsed.querySlots.length}</span>
    <span class="tag">Fragment params: ${parsed.fragmentSlots.length}</span>
  `;

  const allSlots = [...parsed.pathSegments, ...parsed.querySlots, ...parsed.fragmentSlots];
  if (allSlotsEl) allSlotsEl.innerHTML = buildTable(allSlots);

  attachMappingHandlers();
}

function buildTable(slots) {
  if (!slots || slots.length === 0) {
    return `<div class="row">No data</div>`;
  }
  const filter = (document.getElementById("slotFilter")?.value || "").toLowerCase();

  const header = `
    <div class="row header">
      <div>Slot</div>
      <div>Value</div>
      <div>Internal variable</div>
      <div>Format</div>
      <div>Preview</div>
    </div>
  `;

  const rows = slots
    .filter((slot) => {
      if (!filter) return true;
      const txt = `${slot.name || ""} ${slot.value || ""} ${slot.type}`.toLowerCase();
      return txt.includes(filter);
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.segmentIndex != null && b.segmentIndex != null) return a.segmentIndex - b.segmentIndex;
      return (a.position ?? 0) - (b.position ?? 0);
    })
    .map((slot) => {
      const id = slotId(slot);
      const rule = findRule(id) || {};
      const slotLabel =
        slot.type === "path_segment"
          ? `SEG ${slot.segmentIndex}`
          : `${slot.name || "?"} (#${slot.position ?? 0})`;

      const previewValue = computeSlotPreview(slot, rule);
      return `
      <div class="row" data-slot-id="${id}" role="row">
        <div role="cell">${slotLabel}</div>
        <div class="slot-value" role="cell">${slot.value}</div>
        <div role="cell">
          ${buildVariableSelect(id, rule.sourceVar, slotLabel)}
        </div>
        <div role="cell">
          ${renderFormatControls(id, rule.sourceVar, rule.formatPattern, rule.uppercase)}
        </div>
        <div class="slot-preview" role="cell">${previewValue}</div>
      </div>`;
    })
    .join("");

  return `<div class="table">${header}${rows}</div>`;
}

function buildVariableSelect(slotId, selected, slotLabel = "") {
  const options = ['<option value="">— Unassigned —</option>'].concat(
    INTERNAL_VARIABLES.map(
      (v) => `<option value="${v.key}" ${selected === v.key ? "selected" : ""}>${v.label}</option>`
    )
  );
  return `<select class="mapping-select" data-slot-id="${slotId}" aria-label="Map ${slotLabel || "slot"} to internal variable">${options.join("")}</select>`;
}

function attachMappingHandlers() {
  document.querySelectorAll(".mapping-select").forEach((el) => {
    el.addEventListener("change", (evt) => {
      const id = evt.target.dataset.slotId;
      const slot = findSlotById(id);
      const sourceVar = evt.target.value;
      if (!slot) return;
      upsertRule(slot, {
        sourceVar,
        formatPattern: defaultFormatForVar(sourceVar),
      });
      renderParsedSlots();
    });
  });

  document.querySelectorAll(".format-input").forEach((el) => {
    el.addEventListener("change", (evt) => {
      const id = evt.target.dataset.slotId;
      const slot = findSlotById(id);
      if (!slot) return;
      const rule = findRule(id);
      if (!rule) return;
      rule.formatPattern = evt.target.value;
    });
  });

  document.querySelectorAll(".uppercase-input").forEach((el) => {
    el.addEventListener("change", (evt) => {
      const id = evt.target.dataset.slotId;
      const slot = findSlotById(id);
      if (!slot) return;
      const rule = findRule(id);
      if (!rule) return;
      rule.uppercase = evt.target.checked;
    });
  });
}

function findSlotById(id) {
  const parsed = state.template.exampleParsed;
  if (!parsed) return null;
  const [type, key, pos] = id.split(":");

  if (type === "path_segment") {
    return parsed.pathSegments.find((s) => s.segmentIndex === Number(key));
  }
  if (type === "query_param") {
    return parsed.querySlots.find((s) => s.name === key && s.position === Number(pos));
  }
  if (type === "fragment_param") {
    return parsed.fragmentSlots.find((s) => s.name === key && s.position === Number(pos));
  }
  return null;
}

function defaultFormatForVar(sourceVar) {
  if (sourceVar === "checkIn" || sourceVar === "checkOut") return "YYYY-MM-DD";
  return "";
}

function renderFormatControls(id, sourceVar, formatPattern, uppercase) {
  const isDate = sourceVar === "checkIn" || sourceVar === "checkOut";
  if (isDate) {
    return `
      <input class="format-input" data-slot-id="${id}" type="text" placeholder="Eg: DDMMYYYY" value="${formatPattern ?? ""}">
      <div class="muted" style="font-size:12px;">Tokens: YYYY, MM, DD</div>
    `;
  }
  if (sourceVar === "nights") {
    return `<div class="muted" style="font-size:12px;">Auto-calculated as checkOut - checkIn if not provided</div>`;
  }
  return `<span class="muted">—</span>`;
}

function showStatus(targetId, message, ok = true) {
  const el = document.getElementById(targetId);
  el.textContent = message;
  el.style.color = ok ? "#22d3ee" : "#f87171";
}

function tryParseExample(showErrors = true) {
  const raw = document.getElementById("tplExampleUrl").value;
  let exampleUrl = sanitizeUrlInput(raw);
  if (!exampleUrl) {
    if (showErrors) showStatus("parseStatus", "Example link is missing", false);
    return false;
  }

  try {
    const parsed = parseExampleUrl(exampleUrl);
    state.template.exampleUrl = exampleUrl;
    state.template.exampleParsed = parsed;
    state.template.mappingRules = []; // limpio al reparsear
    autoSuggestMappings(parsed);
    showStatus("parseStatus", "Parsed correctly", true);
    renderParsedSlots();
    return true;
  } catch (e) {
    console.error(e);
    if (showErrors) showStatus("parseStatus", `Invalid URL (${e.message || e})`, false);
    if (showErrors) showToast(`Invalid URL (${e.message || e})`);
    return false;
  }
}

function sanitizeUrlInput(raw) {
  if (!raw) return "";
  let cleaned = String(raw).trim();
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  cleaned = cleaned.replace(/\s+/g, "");
  if (!cleaned) return "";
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  document.getElementById("tplExampleUrl").value = cleaned;
  return cleaned;
}

function handleSaveTemplate() {
  const name = document.getElementById("tplName").value.trim();
  const exampleUrl = document.getElementById("tplExampleUrl").value.trim();

  if (!name || !exampleUrl || !state.template.exampleParsed) {
    showStatus("parseStatus", "Add a name and parse the link before saving", false);
    return;
  }

  state.template.name = name;
  state.template.exampleUrl = exampleUrl;

  const existingIdx = state.templates.findIndex((t) => t.name === name);
  if (existingIdx >= 0) {
    state.templates[existingIdx] = JSON.parse(JSON.stringify(state.template));
  } else {
    state.templates.push(JSON.parse(JSON.stringify(state.template)));
  }
  persistTemplates();
  renderSavedTemplates();
  showStatus("parseStatus", "Template saved", true);
}

function renderSavedTemplates() {
  const container = document.getElementById("savedTemplates");
  if (!state.templates.length) {
    container.textContent = "No templates saved yet.";
    return;
  }

  container.innerHTML = state.templates
    .map(
      (t) => `
      <div class="saved-card">
        <h4>${t.name}</h4>
        <div class="saved-meta">${t.exampleUrl}</div>
        <button data-template="${t.name}" class="secondary load-template">Load</button>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".load-template").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.template;
      const tpl = state.templates.find((t) => t.name === name);
      if (!tpl) return;
      state.template = JSON.parse(JSON.stringify(tpl));
      document.getElementById("tplName").value = state.template.name;
      document.getElementById("tplExampleUrl").value = state.template.exampleUrl;
      renderParsedSlots();
      showStatus("parseStatus", `Template "${name}" loaded`, true);
    });
  });
}

function handleClearTemplate() {
  state.template = createEmptyTemplate();
  document.getElementById("tplName").value = "";
  document.getElementById("tplExampleUrl").value = "";
  renderParsedSlots();
  showStatus("parseStatus", "New template started", true);
}

function readBookingFromPreview() {
  return {
    checkIn: document.getElementById("pvCheckIn").value.trim(),
    checkOut: document.getElementById("pvCheckOut").value.trim(),
    adults: Number(document.getElementById("pvAdults").value || 0),
    children: Number(document.getElementById("pvChildren").value || 0),
    promoCode: document.getElementById("pvPromo").value.trim(),
    currency: document.getElementById("pvCurrency").value.trim(),
    hotelId: document.getElementById("pvHotelId").value.trim(),
    nights: Number(document.getElementById("pvNights").value || 0),
  };
}

function formatDate(value, pattern) {
  if (!value) return value;
  const [yyyy, mm, dd] = value.split("-");
  if (!yyyy || !mm || !dd) return value;
  return pattern
    .replace("YYYY", yyyy)
    .replace("MM", mm)
    .replace("DD", dd);
}

function applyTransform(value, rule, booking) {
  if (rule.sourceVar === "totalGuests") {
    value = Number(booking.adults || 0) + Number(booking.children || 0);
  }

  if (rule.formatPattern && (rule.sourceVar === "checkIn" || rule.sourceVar === "checkOut")) {
    value = formatDate(value, rule.formatPattern);
  }

  if (rule.uppercase && typeof value === "string") {
    value = value.toUpperCase();
  }

  return value;
}

function computeSlotPreview(slot, rule) {
  if (!rule || !rule.sourceVar) return `<span class="muted">—</span>`;
  const booking = readBookingFromPreview();
  let value = booking[rule.sourceVar];
  if (rule.sourceVar === "totalGuests") {
    value = Number(booking.adults || 0) + Number(booking.children || 0);
  }
  if (rule.sourceVar === "nights") {
    const computed = computeNights(booking.checkIn, booking.checkOut);
    if ((value === undefined || value === null || value === "" || Number(value) === 0) && computed !== null) {
      value = computed;
    }
  }
  if (value === undefined || value === null || value === "") return `<span class="muted">—</span>`;
  const preview = applyTransform(value, rule, booking);
  return preview ?? `<span class="muted">—</span>`;
}

function computeNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) return null;
  const diffMs = co.getTime() - ci.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return nights >= 0 ? nights : null;
}

function generateDeepLink(template, booking) {
  const parsed = template.exampleParsed;
  if (!parsed) return { error: "No hay enlace de ejemplo parseado" };

  const url = new URL(template.exampleUrl);

  const pathSegments = parsed.pathSegments.map((s) => ({ ...s }));
  const querySlots = parsed.querySlots.map((s) => ({ ...s }));
  const fragmentSlots = parsed.fragmentSlots.map((s) => ({ ...s }));
  const issues = [];

  for (const rule of template.mappingRules) {
    const slot =
      rule.targetType === "path_segment"
        ? pathSegments.find((s) => s.segmentIndex === rule.segmentIndex)
        : rule.targetType === "query_param"
        ? querySlots.find((s) => s.name === rule.name && s.position === rule.position)
        : fragmentSlots.find((s) => s.name === rule.name && s.position === rule.position);

    if (!slot) {
      issues.push(`No se encontró el slot para la regla ${rule.id}`);
      continue;
    }

    let value = booking[rule.sourceVar];
    if (rule.sourceVar === "totalGuests") {
      value = Number(booking.adults || 0) + Number(booking.children || 0);
    }

    if (rule.sourceVar === "nights") {
      const computed = computeNights(booking.checkIn, booking.checkOut);
      if ((value === undefined || value === null || value === "" || Number(value) === 0) && computed !== null) {
        value = computed;
      }
    }

    if (value === undefined || value === null || value === "") {
      continue; // opcional sin valor
    }

    value = applyTransform(value, rule, booking);
    slot.value = value;
  }

  // reconstruir path
  url.pathname = "/" + pathSegments.map((s) => encodeURIComponent(s.value || "")).join("/");

  // reconstruir query respetando orden
  const q = new URLSearchParams();
  querySlots.forEach((s) => q.append(s.name, s.value ?? ""));
  url.search = q.toString() ? `?${q.toString()}` : "";

  // reconstruir fragmento
  if (fragmentSlots.length) {
    const frag = fragmentSlots
      .map((s) => `${s.name}=${encodeURIComponent(s.value ?? "")}`)
      .join("&");
    url.hash = frag;
  } else {
    url.hash = "";
  }

  return { url: url.toString(), issues };
}

function handleGeneratePreview() {
  const booking = readBookingFromPreview();
  const res = generateDeepLink(state.template, booking);
  const preview = document.getElementById("previewResult");

  if (res.error) {
    showStatus("previewStatus", res.error, false);
    preview.textContent = "";
    return;
  }

  if (res.issues && res.issues.length) {
    showStatus("previewStatus", res.issues.join(" · "), false);
  } else {
    showStatus("previewStatus", "Deep link generated correctly", true);
  }
  preview.textContent = res.url || "";
}

function initFormBindings() {
  document.getElementById("saveTemplate").addEventListener("click", handleSaveTemplate);
  document.getElementById("clearCurrent").addEventListener("click", handleClearTemplate);
  document.getElementById("generatePreview").addEventListener("click", handleGeneratePreview);
  document.addEventListener("keydown", handleShortcuts);
  document.querySelectorAll("[data-next-step]").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.nextStep)));
  });
  document.querySelectorAll("[data-prev-step]").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.prevStep)));
  });
  document.querySelectorAll(".step-btn").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
  });
  document.getElementById("quickTemplate").addEventListener("change", handleQuickTemplate);
  document.getElementById("slotFilter").addEventListener("input", renderParsedSlots);
}

function bootstrap() {
  initFormBindings();
  renderSavedTemplates();
  renderParsedSlots();
  applyPreviewDefaults();
  goToStep(1);
}

bootstrap();

function applyPreviewDefaults() {
  const setIfEmpty = (id, value) => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = value;
  };

  const now = new Date();
  const addDays = (d) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    return dt;
  };
  const formatISO = (dt) => dt.toISOString().slice(0, 10);

  setIfEmpty("pvCheckIn", formatISO(addDays(14)));
  setIfEmpty("pvCheckOut", formatISO(addDays(17)));
  setIfEmpty("pvAdults", "2");
  setIfEmpty("pvChildren", "0");
  setIfEmpty("pvPromo", "HOTELTWIN");
  setIfEmpty("pvCurrency", "EUR");
  setIfEmpty("pvHotelId", "DEMO-HOTEL");
  setIfEmpty("pvNights", "3");
}

function handleShortcuts(evt) {
  const isInput =
    evt.target.tagName === "INPUT" ||
    evt.target.tagName === "SELECT" ||
    evt.target.tagName === "TEXTAREA";
  const cmdOrCtrl = evt.metaKey || evt.ctrlKey;
  if (cmdOrCtrl && evt.key.toLowerCase() === "s") {
    evt.preventDefault();
    handleSaveTemplate();
  }
  if (cmdOrCtrl && evt.key === "Enter") {
    evt.preventDefault();
    goToStep(Math.min(currentStep + 1, 3));
  }
  if (!isInput && evt.key === "/") {
    const filter = document.getElementById("slotFilter");
    if (filter) {
      evt.preventDefault();
      filter.focus();
    }
  }
}

function showToast(message, timeout = 2500) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), timeout);
}

function goToStep(step) {
  if (step === 2) {
    const ok = state.template.exampleParsed ? true : tryParseExample(true);
    if (!ok) return; // permanece en el paso actual si falla parseo
  }
  currentStep = step;
  document.querySelectorAll(".step").forEach((section) => {
    section.style.display = section.classList.contains(`step-${step}`) ? "" : "none";
  });
  document.querySelectorAll(".step-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.step) === step);
  });
}

function handleQuickTemplate(evt) {
  const key = evt.target.value;
  if (!key || !COMMON_TEMPLATES[key]) return;
  const tpl = COMMON_TEMPLATES[key];
  document.getElementById("tplName").value = tpl.name;
  document.getElementById("tplExampleUrl").value = tpl.exampleUrl;
  tryParseExample(false);
}

function autoSuggestMappings(parsed) {
  if (!parsed) return;
  const guessDateFormat = (value) => {
    if (!value) return "";
    if (value.includes("-")) return "YYYY-MM-DD";
    if (/^\d{8}$/.test(value)) return "DDMMYYYY";
    return "";
  };
  const lowerName = (name) => (name || "").toLowerCase();

  const candidates = [...parsed.querySlots, ...parsed.pathSegments, ...parsed.fragmentSlots];
  candidates.forEach((slot) => {
    const name = lowerName(slot.name);
    const value = slot.value || "";
    if (["checkin", "ci", "arrive", "from", "fechaentrada"].some((k) => name.includes(k))) {
      upsertRule(slot, { sourceVar: "checkIn", formatPattern: guessDateFormat(value) });
    }
    if (["checkout", "co", "depart", "to", "fechasalida"].some((k) => name.includes(k))) {
      upsertRule(slot, { sourceVar: "checkOut", formatPattern: guessDateFormat(value) });
    }
    if (["month", "day", "year"].includes(name) && value) {
      upsertRule(slot, { sourceVar: "checkIn", formatPattern: name === "month" ? "MM" : name === "day" ? "DD" : "YYYY" });
    }
    if (["adult", "adults"].some((k) => name.includes(k))) {
      upsertRule(slot, { sourceVar: "adults" });
    }
    if (["child", "children"].some((k) => name.includes(k))) {
      upsertRule(slot, { sourceVar: "children" });
    }
    if (name === "currency" || name === "curr") {
      upsertRule(slot, { sourceVar: "currency" });
    }
    if (name === "promo" || name === "promocode" || name === "code") {
      upsertRule(slot, { sourceVar: "promoCode", uppercase: true });
    }
    if (name.includes("hotelcode") || name.includes("hotelid")) {
      upsertRule(slot, { sourceVar: "hotelId" });
    }
    if (name === "nights") {
      upsertRule(slot, { sourceVar: "nights" });
    }
  });
}
