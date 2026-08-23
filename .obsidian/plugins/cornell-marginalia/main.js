var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  CORNELL_VIEW_TYPE: () => CORNELL_VIEW_TYPE,
  CornellNotesView: () => CornellNotesView,
  CornellSettingTab: () => CornellSettingTab,
  OmniCaptureManager: () => OmniCaptureManager,
  OmniDragManager: () => OmniDragManager,
  RhizomeView: () => RhizomeView,
  TagSuggester: () => TagSuggester,
  default: () => CornellMarginalia,
  sanitizeAnkiDeckName: () => sanitizeAnkiDeckName,
  sanitizeFileName: () => sanitizeFileName,
  sanitizeForTemplater: () => sanitizeForTemplater
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");
var import_state = require("@codemirror/state");
var import_language = require("@codemirror/language");
var import_view = require("@codemirror/view");

// addons/CornellAddon.ts
var CornellAddon = class {
  // Para qué sirve
  // Le pasamos el plugin principal para que pueda acceder a todo
  constructor(plugin) {
    this.plugin = plugin;
  }
};

// addons/GamificationAddon.ts
var import_obsidian = require("obsidian");
var GamificationAddon = class extends CornellAddon {
  constructor() {
    super(...arguments);
    this.id = "gamification-profile";
    this.name = "User Profile & Stats";
    this.description = "A\xF1ade un perfil, experiencia y estad\xEDsticas al explorador.";
  }
  load() {
    console.log("\u{1F3AE} Addon de Gamificaci\xF3n Encendido!");
  }
  unload() {
    console.log("\u{1F3AE} Addon de Gamificaci\xF3n Apagado!");
  }
  // Esta función la usaremos más adelante para darle puntos al usuario
  addXp() {
    const stats = this.plugin.settings.userStats;
    stats.marginaliasCreated += 1;
    stats.xp += 10;
    const nextLevelThreshold = stats.level * 100;
    if (stats.xp >= nextLevelThreshold) {
      stats.level += 1;
      new import_obsidian.Notice(`\u{1F389} \xA1Felicidades! Has alcanzado el Nivel ${stats.level} en Cornell Marginalia`);
    }
    this.plugin.saveSettings();
  }
};

// addons/CustomBackgroundAddon.ts
var CustomBackgroundAddon = class extends CornellAddon {
  constructor() {
    super(...arguments);
    this.id = "custom-background";
    this.name = "Explorer Background";
    this.description = "A\xF1ade un fondo personalizado al explorador con efectos de blur.";
  }
  load() {
    this.applyStyles();
  }
  unload() {
    this.removeStyles();
  }
  applyStyles() {
    const stats = this.plugin.settings.userStats;
    if (!stats.customBackground) return;
    document.body.style.setProperty("--cornell-sidebar-bg", `url("${stats.customBackground}")`);
    document.body.style.setProperty("--cornell-sidebar-blur", `${stats.bgBlur}px`);
    document.body.style.setProperty("--cornell-sidebar-opacity", `${stats.bgOpacity}`);
  }
  removeStyles() {
    document.body.style.removeProperty("--cornell-sidebar-bg");
    document.body.style.removeProperty("--cornell-sidebar-blur");
    document.body.style.removeProperty("--cornell-sidebar-opacity");
  }
};

// addons/RhizomeAddon.ts
var RHIZOME_VIEW_TYPE = "rhizome-time-machine-view";
var RhizomeAddon = class extends CornellAddon {
  constructor() {
    super(...arguments);
    this.id = "rhizome-time-machine";
    this.name = "Time Machine & Rhizome";
    this.description = "A full-screen chronological graph to explore and review your marginaliae.";
    this.ribbonIconEl = null;
  }
  load() {
    console.log("\u{1F570}\uFE0F Time Machine Addon Loaded");
    this.ribbonIconEl = this.plugin.addRibbonIcon("git-commit-vertical", "Open Rhizome Time Machine", (evt) => {
      this.activateView();
    });
    this.ribbonIconEl.addClass("cornell-rhizome-ribbon-class");
  }
  unload() {
    console.log("\u{1F570}\uFE0F Time Machine Addon Unloaded");
    if (this.ribbonIconEl) {
      this.ribbonIconEl.remove();
      this.ribbonIconEl = null;
    }
    this.plugin.app.workspace.detachLeavesOfType(RHIZOME_VIEW_TYPE);
  }
  // Función para abrir la vista en el centro de Obsidian
  async activateView() {
    const { workspace } = this.plugin.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(RHIZOME_VIEW_TYPE);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: RHIZOME_VIEW_TYPE, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }
};

// addons/PdfDoodleAddon.ts
var import_obsidian2 = require("obsidian");
var PdfDoodleAddon = class extends CornellAddon {
  constructor() {
    super(...arguments);
    this.id = "pdf-doodle";
    this.name = "Doodle y Cosecha en PDF";
    this.description = "Draw temporarily on PDFs and harvest marginalia with one click.";
    this.activeBox = null;
  }
  load() {
    this.plugin.addCommand({
      id: "activate-pdf-doodle",
      name: "Cornell: Start Drawing in PDF",
      checkCallback: (checking) => {
        const pdfLeaf = this.plugin.app.workspace.getLeavesOfType("pdf")[0];
        if (pdfLeaf) {
          if (!checking) this.activateDoodleMode(pdfLeaf);
          return true;
        }
        return false;
      }
    });
  }
  unload() {
    if (this.activeBox) this.activeBox.destroy();
  }
  activateDoodleMode(leaf) {
    const container = leaf.view.containerEl;
    const pages = Array.from(container.querySelectorAll(".page, .pdf-page"));
    const visiblePage = pages.find((p) => {
      const rect = p.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (!visiblePage) {
      new import_obsidian2.Notice("\u274C I don't see any pages loaded. Scroll down a bit.");
      return;
    }
    if (this.activeBox) this.activeBox.destroy();
    this.activeBox = new PdfDoodleCanvas(visiblePage, this.plugin);
  }
};
var PdfDoodleCanvas = class {
  constructor(parent, plugin) {
    this.parent = parent;
    this.plugin = plugin;
    this.isDrawing = false;
    this.container = document.createElement("div");
    this.container.addClass("cornell-pdf-overlay");
    this.canvas = document.createElement("canvas");
    const rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = "round";
    }
    this.button = document.createElement("div");
    this.button.innerHTML = "\u26A1";
    this.button.addClass("cornell-harvest-btn");
    this.button.style.display = "none";
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.button);
    this.parent.appendChild(this.container);
    this.initEvents();
    new import_obsidian2.Notice("\u270F\uFE0F Draw. Double-click to freeze and select text");
  }
  initEvents() {
    this.boundMouseDown = (e) => {
      var _a, _b;
      this.isDrawing = true;
      const r = this.canvas.getBoundingClientRect();
      (_a = this.ctx) == null ? void 0 : _a.beginPath();
      (_b = this.ctx) == null ? void 0 : _b.moveTo(e.clientX - r.left, e.clientY - r.top);
    };
    this.boundMouseMove = (e) => {
      var _a, _b;
      if (!this.isDrawing) return;
      const r = this.canvas.getBoundingClientRect();
      (_a = this.ctx) == null ? void 0 : _a.lineTo(e.clientX - r.left, e.clientY - r.top);
      (_b = this.ctx) == null ? void 0 : _b.stroke();
    };
    this.boundMouseUp = () => {
      this.isDrawing = false;
    };
    this.boundDblClick = () => {
      this.enterRestMode();
    };
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("dblclick", this.boundDblClick);
    this.button.addEventListener("click", async (e) => {
      e.stopPropagation();
      await this.harvest();
    });
  }
  enterRestMode() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("dblclick", this.boundDblClick);
    this.container.addClass("is-resting");
    this.canvas.style.cursor = "default";
    this.button.style.display = "flex";
    new import_obsidian2.Notice("\u23F8\uFE0F Select (and copy) the text, then press \u26A1");
  }
  async harvest() {
    var _a, _b, _c;
    let clipboardText = "";
    try {
      clipboardText = await navigator.clipboard.readText() || "";
    } catch (e) {
      console.error("The clipboard could not be read.");
    }
    const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      this.destroy();
      return;
    }
    const arrayBuffer = await blob.arrayBuffer();
    const dateStr = window.moment().format("YYYYMMDD_HHmmss");
    const fileName = `doodle_${dateStr}.png`;
    const folder = ((_a = this.plugin.settings.doodleFolder) == null ? void 0 : _a.trim()) || "";
    let attachmentPath = folder ? `${folder}/${fileName}` : fileName;
    await this.plugin.app.vault.createBinary(attachmentPath, arrayBuffer);
    const actualFileName = attachmentPath.split("/").pop();
    const textToInject = clipboardText.trim() ? clipboardText.trim() : "";
    const finalSyntax = `${textToInject}%%> img:[[${actualFileName}]]%%`;
    const finalMd = `
${finalSyntax}

---
`;
    const destInput = document.querySelector(".cornell-qc-dest");
    let cleanDestName = (destInput ? destInput.value : this.plugin.settings.lastOmniDestination) || "Marginalia Inbox";
    cleanDestName = cleanDestName.replace(/^\d{12,14}\s*-\s*/, "").trim();
    let finalDestName = cleanDestName;
    if (this.plugin.settings.zkMode) {
      const zkId = window.moment().format("YYYYMMDDHHmmss");
      finalDestName = cleanDestName !== "Marginalia Inbox" ? `${zkId} - ${cleanDestName}` : zkId;
    }
    let file = this.plugin.app.metadataCache.getFirstLinkpathDest(finalDestName, "");
    if (file instanceof import_obsidian2.TFile) {
      await this.plugin.app.vault.append(file, finalMd);
    } else {
      let newFileName = finalDestName.endsWith(".md") ? finalDestName : `${finalDestName}.md`;
      let folderPath = this.plugin.settings.zkMode ? (_b = this.plugin.settings.zkFolder) == null ? void 0 : _b.trim() : (_c = this.plugin.settings.omniCaptureFolder) == null ? void 0 : _c.trim();
      if (folderPath) {
        newFileName = `${folderPath}/${newFileName}`;
      }
      const header = this.plugin.settings.zkMode ? `# \u{1F5C3}\uFE0F ${finalDestName}
` : `# \u{1F4E5} ${finalDestName}
`;
      await this.plugin.app.vault.create(newFileName, header + finalMd);
    }
    new import_obsidian2.Notice(`\u26A1 Harvest stored correctly.`);
    this.destroy();
  }
  destroy() {
    window.removeEventListener("mouseup", this.boundMouseUp);
    this.container.remove();
  }
};

// addons/super-doodle.ts
var import_obsidian3 = require("obsidian");
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
function getHybridCroppedCanvas(originalCanvas, bounds, padding = 20) {
  if (bounds.minX === Infinity) return originalCanvas;
  const ctx = originalCanvas.getContext("2d");
  if (!ctx) return originalCanvas;
  let startX = Math.max(0, Math.floor(bounds.minX) - padding);
  let startY = Math.max(0, Math.floor(bounds.minY) - padding);
  let endX = Math.min(originalCanvas.width, Math.ceil(bounds.maxX) + padding);
  let endY = Math.min(originalCanvas.height, Math.ceil(bounds.maxY) + padding);
  const scanW = endX - startX;
  const scanH = endY - startY;
  if (scanW <= 0 || scanH <= 0) return originalCanvas;
  const imageData = ctx.getImageData(startX, startY, scanW, scanH);
  const data = imageData.data;
  let minX = scanW, minY = scanH, maxX = 0, maxY = 0;
  let hasContent = false;
  for (let y = 0; y < scanH; y++) {
    for (let x = 0; x < scanW; x++) {
      const alpha = data[(y * scanW + x) * 4 + 3];
      if (alpha > 0) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!hasContent) return originalCanvas;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(scanW, maxX + padding);
  maxY = Math.min(scanH, maxY + padding);
  const croppedWidth = maxX - minX;
  const croppedHeight = maxY - minY;
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;
  const croppedCtx = croppedCanvas.getContext("2d");
  if (croppedCtx) {
    croppedCtx.drawImage(
      originalCanvas,
      startX + minX,
      startY + minY,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );
  }
  return croppedCanvas;
}
var CornellAddon2 = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
};
var SuperDoodleAddon = class extends CornellAddon2 {
  constructor() {
    super(...arguments);
    this.id = "super-doodle";
    this.name = "Super Doodle \u{1F3A8}";
    this.description = "Transform Zen Doodle into an adjustable-size canvas with panoramic navigation, colors, and an advanced selection tool.";
    this.originalRenderZenDoodle = null;
  }
  load() {
    this.originalRenderZenDoodle = CornellNotesView.prototype.renderZenDoodle;
    const addonInstance = this;
    CornellNotesView.prototype.renderZenDoodle = function(container) {
      const view = this;
      if (!view.zenCanvasEl) {
        let currentTool = "pen";
        let currentColor = "#000000";
        let currentSize = 4;
        let isDragging = false;
        let isTempPanning = false;
        let isTempErasing = false;
        let startX = 0, startY = 0;
        let scrollLeftStart = 0, scrollTopStart = 0;
        let selectionPhase = "none";
        let selX = 0, selY = 0, selW = 0, selH = 0;
        let floatingCanvas = null;
        let floatDragStartX = 0, floatDragStartY = 0;
        let strokePoints = [];
        let lastOverlayBounds = { x: 0, y: 0, w: 0, h: 0 };
        let drawnBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        let isDrawingFrameScheduled = false;
        let lastDrawnIndex = 1;
        const updateBounds = (x, y, r) => {
          if (x - r < drawnBounds.minX) drawnBounds.minX = x - r;
          if (y - r < drawnBounds.minY) drawnBounds.minY = y - r;
          if (x + r > drawnBounds.maxX) drawnBounds.maxX = x + r;
          if (y + r > drawnBounds.maxY) drawnBounds.maxY = y + r;
        };
        view.zenCanvasEl = document.createElement("canvas");
        view.zenCanvasEl.width = 3200;
        view.zenCanvasEl.height = 4800;
        view.zenCtx = view.zenCanvasEl.getContext("2d");
        view.zenCanvasEl.style.backgroundColor = "#ffffff";
        view.zenCanvasEl.style.display = "block";
        view.zenCanvasEl.style.touchAction = "none";
        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = view.zenCanvasEl.width;
        overlayCanvas.height = view.zenCanvasEl.height;
        overlayCanvas.style.position = "absolute";
        overlayCanvas.style.top = "0";
        overlayCanvas.style.left = "0";
        overlayCanvas.style.pointerEvents = "none";
        const overlayCtx = overlayCanvas.getContext("2d");
        const commitFloatingSelection = () => {
          if (selectionPhase === "floating" && floatingCanvas && view.zenCtx && overlayCtx) {
            view.zenCtx.globalCompositeOperation = "source-over";
            view.zenCtx.drawImage(floatingCanvas, selX, selY);
            updateBounds(selX, selY, 0);
            updateBounds(selX + floatingCanvas.width, selY + floatingCanvas.height, 0);
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            selectionPhase = "none";
            floatingCanvas = null;
          }
        };
        const forceStopAllActions = () => {
          var _a;
          if (!view.zenCtx || !view.zenCanvasEl || !overlayCtx || !overlayCanvas) return;
          if (view.zenIsDrawing) {
            if (strokePoints.length > lastDrawnIndex) {
              view.zenCtx.beginPath();
              const p1_start = strokePoints[lastDrawnIndex - 1];
              const p2_start = strokePoints[lastDrawnIndex];
              const mid_start = { x: (p1_start.x + p2_start.x) / 2, y: (p1_start.y + p2_start.y) / 2 };
              view.zenCtx.moveTo(mid_start.x, mid_start.y);
              for (let i = lastDrawnIndex + 1; i < strokePoints.length; i++) {
                const p2 = strokePoints[i - 1];
                const p3 = strokePoints[i];
                const mid_next = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
                view.zenCtx.quadraticCurveTo(p2.x, p2.y, mid_next.x, mid_next.y);
              }
              view.zenCtx.stroke();
            }
            if (strokePoints.length >= 2) {
              const p1 = strokePoints[strokePoints.length - 2];
              const p2 = strokePoints[strokePoints.length - 1];
              const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
              view.zenCtx.beginPath();
              view.zenCtx.moveTo(mid.x, mid.y);
              view.zenCtx.lineTo(p2.x, p2.y);
              view.zenCtx.stroke();
            }
            view.zenIsDrawing = false;
            strokePoints = [];
            lastDrawnIndex = 1;
          }
          if (currentTool === "select" && selectionPhase === "selecting") {
            const rx = selW < 0 ? selX + selW : selX;
            const ry = selH < 0 ? selY + selH : selY;
            const rw = Math.abs(selW);
            const rh = Math.abs(selH);
            selX = rx;
            selY = ry;
            selW = rw;
            selH = rh;
            if (rw > 5 && rh > 5) {
              selectionPhase = "floating";
              const imageData = view.zenCtx.getImageData(selX, selY, selW, selH);
              view.zenCtx.clearRect(selX, selY, selW, selH);
              floatingCanvas = document.createElement("canvas");
              floatingCanvas.width = selW;
              floatingCanvas.height = selH;
              (_a = floatingCanvas.getContext("2d")) == null ? void 0 : _a.putImageData(imageData, 0, 0);
              overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
              overlayCtx.drawImage(floatingCanvas, selX, selY);
              overlayCtx.setLineDash([5, 5]);
              overlayCtx.strokeStyle = "rgba(100, 150, 255, 0.8)";
              overlayCtx.strokeRect(selX, selY, selW, selH);
              lastOverlayBounds = { x: selX, y: selY, w: selW, h: selH };
            } else {
              selectionPhase = "none";
              overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
              lastOverlayBounds = { x: 0, y: 0, w: 0, h: 0 };
            }
          }
          isDragging = false;
          isTempPanning = false;
          isTempErasing = false;
          if (currentTool === "hand") view.zenCanvasEl.style.cursor = "grab";
          else if (currentTool === "select") view.zenCanvasEl.style.cursor = "cell";
          else view.zenCanvasEl.style.cursor = "crosshair";
        };
        view.doodleAPI = {
          setTool: (t) => {
            forceStopAllActions();
            commitFloatingSelection();
            currentTool = t;
          },
          getTool: () => currentTool,
          setColor: (c) => {
            forceStopAllActions();
            commitFloatingSelection();
            currentColor = c;
          },
          getColor: () => currentColor,
          setSize: (s) => {
            currentSize = s;
          },
          getSize: () => currentSize,
          commitSelection: commitFloatingSelection,
          getOverlay: () => overlayCanvas,
          getBounds: () => drawnBounds,
          forceUpdateBounds: updateBounds,
          getSelectionPhase: () => selectionPhase,
          getFloatingCanvas: () => floatingCanvas,
          getSelectionRect: () => ({ x: selX, y: selY, w: selW, h: selH }),
          clearSelection: () => {
            selectionPhase = "none";
            floatingCanvas = null;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          },
          fillWhiteRect: (x, y, w, h) => {
            view.zenCtx.fillStyle = "#ffffff";
            view.zenCtx.fillRect(x, y, w, h);
          },
          resize: (newW, newH) => {
            var _a;
            commitFloatingSelection();
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = view.zenCanvasEl.width;
            tempCanvas.height = view.zenCanvasEl.height;
            (_a = tempCanvas.getContext("2d")) == null ? void 0 : _a.drawImage(view.zenCanvasEl, 0, 0);
            view.zenCanvasEl.width = newW;
            view.zenCanvasEl.height = newH;
            overlayCanvas.width = newW;
            overlayCanvas.height = newH;
            view.zenCtx.drawImage(tempCanvas, 0, 0);
          },
          clear: () => {
            view.zenCtx.clearRect(0, 0, view.zenCanvasEl.width, view.zenCanvasEl.height);
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            selectionPhase = "none";
            drawnBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
          }
        };
        const getScrollWrapper = () => view.zenCanvasEl.parentElement;
        const getPointerPos = (e) => {
          const rect = view.zenCanvasEl.getBoundingClientRect();
          return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        view.zenCanvasEl.addEventListener("contextmenu", (e) => e.preventDefault());
        view.zenCanvasEl.addEventListener("pointerdown", (e) => {
          view.zenCanvasEl.setPointerCapture(e.pointerId);
          isTempPanning = e.ctrlKey || e.metaKey;
          isTempErasing = e.shiftKey && !isTempPanning;
          if (currentTool === "hand" || isTempPanning) {
            isDragging = true;
            view.zenCanvasEl.style.cursor = "grabbing";
            startX = e.clientX;
            startY = e.clientY;
            const sw = getScrollWrapper();
            if (sw) {
              scrollLeftStart = sw.scrollLeft;
              scrollTopStart = sw.scrollTop;
            }
            return;
          }
          const pos = getPointerPos(e);
          if (currentTool === "select") {
            if (selectionPhase === "floating") {
              if (pos.x >= selX && pos.x <= selX + selW && pos.y >= selY && pos.y <= selY + selH) {
                isDragging = true;
                floatDragStartX = pos.x;
                floatDragStartY = pos.y;
              } else {
                commitFloatingSelection();
                selectionPhase = "selecting";
                selX = pos.x;
                selY = pos.y;
                selW = 0;
                selH = 0;
              }
            } else {
              selectionPhase = "selecting";
              selX = pos.x;
              selY = pos.y;
              selW = 0;
              selH = 0;
            }
            return;
          }
          commitFloatingSelection();
          view.zenIsDrawing = true;
          const isEraserActive = currentTool === "eraser" || isTempErasing;
          const activeSize = isEraserActive ? currentSize * 3 : currentSize;
          view.zenCtx.lineWidth = activeSize;
          view.zenCtx.lineCap = "round";
          view.zenCtx.lineJoin = "round";
          if (isEraserActive) {
            view.zenCtx.globalCompositeOperation = "destination-out";
            view.zenCtx.strokeStyle = "rgba(0,0,0,1)";
          } else {
            view.zenCtx.globalCompositeOperation = "source-over";
            view.zenCtx.strokeStyle = currentColor;
          }
          view.zenCtx.fillStyle = view.zenCtx.strokeStyle;
          strokePoints = [pos, pos];
          lastDrawnIndex = 1;
          updateBounds(pos.x, pos.y, activeSize);
          view.zenCtx.beginPath();
          view.zenCtx.arc(pos.x, pos.y, activeSize / 2, 0, Math.PI * 2);
          view.zenCtx.fill();
        });
        window.addEventListener("blur", forceStopAllActions);
        document.addEventListener("pointerup", (e) => {
          if (e.target !== view.zenCanvasEl) forceStopAllActions();
        });
        view.zenCanvasEl.addEventListener("pointermove", (e) => {
          if (!view.zenIsDrawing && !isDragging) {
            if (e.ctrlKey || e.metaKey) view.zenCanvasEl.style.cursor = "grab";
            else if (e.shiftKey) view.zenCanvasEl.style.cursor = "cell";
            else if (currentTool === "hand") view.zenCanvasEl.style.cursor = "grab";
            else if (currentTool === "select") view.zenCanvasEl.style.cursor = "cell";
            else view.zenCanvasEl.style.cursor = "crosshair";
          }
          if ((currentTool === "hand" || isTempPanning) && isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const sw = getScrollWrapper();
            if (sw) {
              sw.scrollLeft = scrollLeftStart - dx;
              sw.scrollTop = scrollTopStart - dy;
            }
            return;
          }
          if (currentTool === "select") {
            const pos = getPointerPos(e);
            overlayCtx.clearRect(lastOverlayBounds.x - 10, lastOverlayBounds.y - 10, lastOverlayBounds.w + 20, lastOverlayBounds.h + 20);
            if (selectionPhase === "selecting") {
              selW = pos.x - selX;
              selH = pos.y - selY;
              overlayCtx.setLineDash([5, 5]);
              overlayCtx.strokeStyle = "var(--interactive-accent)";
              overlayCtx.lineWidth = 2;
              overlayCtx.strokeRect(selX, selY, selW, selH);
              lastOverlayBounds = { x: selX, y: selY, w: selW, h: selH };
            } else if (selectionPhase === "floating" && isDragging && floatingCanvas) {
              const dx = pos.x - floatDragStartX;
              const dy = pos.y - floatDragStartY;
              selX += dx;
              selY += dy;
              floatDragStartX = pos.x;
              floatDragStartY = pos.y;
              overlayCtx.drawImage(floatingCanvas, selX, selY);
              overlayCtx.setLineDash([5, 5]);
              overlayCtx.strokeStyle = "rgba(100, 150, 255, 0.8)";
              overlayCtx.strokeRect(selX, selY, floatingCanvas.width, floatingCanvas.height);
              lastOverlayBounds = { x: selX, y: selY, w: floatingCanvas.width, h: floatingCanvas.height };
            }
            return;
          }
          if (view.zenIsDrawing) {
            const isEraserActive = currentTool === "eraser" || isTempErasing;
            const activeSize = isEraserActive ? currentSize * 3 : currentSize;
            const coalescedEvents = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
            for (const coalescedEvent of coalescedEvents) {
              const pos = getPointerPos(coalescedEvent);
              strokePoints.push(pos);
              updateBounds(pos.x, pos.y, activeSize);
            }
            if (!isDrawingFrameScheduled) {
              isDrawingFrameScheduled = true;
              requestAnimationFrame(() => {
                isDrawingFrameScheduled = false;
                if (view.zenIsDrawing && strokePoints.length > lastDrawnIndex) {
                  view.zenCtx.beginPath();
                  const p1_start = strokePoints[lastDrawnIndex - 1];
                  const p2_start = strokePoints[lastDrawnIndex];
                  const mid_start = { x: (p1_start.x + p2_start.x) / 2, y: (p1_start.y + p2_start.y) / 2 };
                  view.zenCtx.moveTo(mid_start.x, mid_start.y);
                  for (let i = lastDrawnIndex + 1; i < strokePoints.length; i++) {
                    const p2 = strokePoints[i - 1];
                    const p3 = strokePoints[i];
                    const mid_next = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
                    view.zenCtx.quadraticCurveTo(p2.x, p2.y, mid_next.x, mid_next.y);
                  }
                  view.zenCtx.stroke();
                  lastDrawnIndex = strokePoints.length - 1;
                }
              });
            }
          }
        });
        view.zenCanvasEl.addEventListener("pointerup", (e) => {
          view.zenCanvasEl.releasePointerCapture(e.pointerId);
          forceStopAllActions();
        });
      }
      const api = view.doodleAPI;
      const zenContainer = container.createDiv({ cls: "cornell-zen-container" });
      zenContainer.style.display = "flex";
      zenContainer.style.flexDirection = "column";
      zenContainer.style.height = "100%";
      zenContainer.style.gap = "15px";
      zenContainer.style.padding = "10px 0";
      const topBar = zenContainer.createDiv();
      topBar.style.display = "flex";
      topBar.style.justifyContent = "space-between";
      topBar.style.alignItems = "center";
      topBar.style.flexWrap = "wrap";
      topBar.style.gap = "10px";
      const leftGrp = topBar.createDiv({ attr: { style: "display:flex; gap:6px; align-items:center;" } });
      const cancelBtn = leftGrp.createEl("button", { title: "Return to Board" });
      (0, import_obsidian3.setIcon)(cancelBtn, "arrow-left");
      cancelBtn.style.boxShadow = "none";
      cancelBtn.onclick = () => {
        view.isZenMode = false;
        view.applyFiltersAndRender();
      };
      const handBtn = leftGrp.createEl("button", { title: "Hand Tool (Pan)" });
      (0, import_obsidian3.setIcon)(handBtn, "hand");
      const penBtn = leftGrp.createEl("button", { cls: "mod-cta", title: "Pen" });
      (0, import_obsidian3.setIcon)(penBtn, "pencil");
      const eraserBtn = leftGrp.createEl("button", { title: "Eraser" });
      (0, import_obsidian3.setIcon)(eraserBtn, "eraser");
      const selectBtn = leftGrp.createEl("button", { title: "Lasso / Select Tool" });
      (0, import_obsidian3.setIcon)(selectBtn, "box-select");
      const centerGrp = topBar.createDiv({ attr: { style: "display:flex; gap:10px; align-items:center;" } });
      const canvasSizeSelect = centerGrp.createEl("select", { title: "Canvas Resolution" });
      canvasSizeSelect.style.background = "transparent";
      canvasSizeSelect.style.color = "var(--text-normal)";
      canvasSizeSelect.style.border = "1px solid var(--background-modifier-border)";
      canvasSizeSelect.style.borderRadius = "4px";
      canvasSizeSelect.add(new Option("Size: 1x (Normal)", "800x1200"));
      canvasSizeSelect.add(new Option("Size: 2x (Large)", "1600x2400"));
      canvasSizeSelect.add(new Option("Size: 4x (Massive)", "3200x4800", true, true));
      canvasSizeSelect.add(new Option("Size: 8x (Insane)", "6400x9600"));
      canvasSizeSelect.onchange = (e) => {
        const [newW, newH] = e.target.value.split("x").map(Number);
        api.resize(newW, newH);
        new import_obsidian3.Notice(`\u{1F4D0} Canvas resized to ${newW}x${newH}`);
      };
      const sizeSlider = centerGrp.createEl("input", { type: "range" });
      sizeSlider.min = "1";
      sizeSlider.max = "50";
      sizeSlider.value = api.getSize().toString();
      sizeSlider.style.width = "80px";
      sizeSlider.oninput = (e) => {
        api.setSize(parseInt(e.target.value));
      };
      const colors = ["#000000", "#ff4d4d", "#3366ff", "#00cc66"];
      const colorBtns = [];
      colors.forEach((c) => {
        const cBtn = centerGrp.createDiv();
        cBtn.style.width = "20px";
        cBtn.style.height = "20px";
        cBtn.style.borderRadius = "50%";
        cBtn.style.backgroundColor = c;
        cBtn.style.cursor = "pointer";
        cBtn.style.border = c === api.getColor() ? "2px solid var(--text-normal)" : "2px solid transparent";
        cBtn.onclick = () => {
          api.setColor(c);
          api.setTool("pen");
          updateToolUI();
        };
        colorBtns.push(cBtn);
      });
      view.containerEl.addEventListener("cornell-force-red-pen", () => {
        api.setColor("#ff4d4d");
        api.setTool("pen");
        updateToolUI();
      });
      const rightGrp = topBar.createDiv({ attr: { style: "display:flex; gap:10px;" } });
      const clearBtn = rightGrp.createEl("button", { title: "Clear Canvas" });
      (0, import_obsidian3.setIcon)(clearBtn, "trash-2");
      clearBtn.style.boxShadow = "none";
      clearBtn.onclick = () => {
        api.clear();
      };
      const attachBtn = rightGrp.createEl("button", { text: "\u{1F4CC} Attach to Board", title: "Save and add to Pinboard" });
      attachBtn.onclick = async () => {
        api.commitSelection();
        attachBtn.innerText = "\u23F3...";
        const croppedCanvas = getHybridCroppedCanvas(view.zenCanvasEl, api.getBounds());
        const dataUrl = croppedCanvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const arrayBuffer = base64ToArrayBuffer(base64Data);
        const dateStr = window.moment().format("YYYYMMDD_HHmmss");
        const fileName = `superdoodle_${dateStr}.png`;
        const folder = addonInstance.plugin.settings.doodleFolder.trim();
        let attachmentPath = fileName;
        if (folder) {
          await addonInstance.plugin.ensureFolderExists(folder);
          attachmentPath = `${folder}/${fileName}`;
        } else {
          try {
            attachmentPath = await view.app.fileManager.getAvailablePathForAttachment(fileName, "");
          } catch (e) {
            attachmentPath = fileName;
          }
        }
        await view.app.vault.createBinary(attachmentPath, arrayBuffer);
        const actualFileName = attachmentPath.split("/").pop();
        view.pinboardItems.push({
          text: `![[${actualFileName}]]`,
          rawText: `![[${actualFileName}]]`,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isCustom: true,
          indentLevel: 0
        });
        new import_obsidian3.Notice("\u{1F3A8} Super Doodle attached to Board!");
        view.isZenMode = false;
        api.clear();
        view.applyFiltersAndRender();
      };
      const zapBtn = rightGrp.createEl("button", { text: "\u26A1 Omni-Capture", cls: "mod-cta", title: "Save instantly to Omni-Capture Destination" });
      zapBtn.style.backgroundColor = "var(--interactive-accent)";
      zapBtn.style.color = "var(--text-on-accent)";
      zapBtn.onclick = async () => {
        api.commitSelection();
        zapBtn.innerText = "\u23F3 Saving...";
        const croppedCanvas = getHybridCroppedCanvas(view.zenCanvasEl, api.getBounds());
        const dataUrl = croppedCanvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const arrayBuffer = base64ToArrayBuffer(base64Data);
        const payload = {
          thought: "",
          destination: view.plugin.settings.lastOmniDestination || "Marginalia Inbox",
          doodleData: arrayBuffer
        };
        try {
          await view.plugin.captureManager.saveCapture(payload);
          if (view.plugin.settings.addons && view.plugin.settings.addons["gamification-profile"]) {
            view.plugin.gamificationAddon.addXp();
            view.renderUI();
          }
          view.isZenMode = false;
          api.clear();
          view.applyFiltersAndRender();
        } catch (error) {
          console.error(error);
          zapBtn.innerText = "\u26A1 Omni-Capture";
          new import_obsidian3.Notice("Error guardando el Doodle. Revisa la consola.");
        }
      };
      const updateToolUI = () => {
        handBtn.removeClass("mod-cta");
        penBtn.removeClass("mod-cta");
        eraserBtn.removeClass("mod-cta");
        selectBtn.removeClass("mod-cta");
        if (view.zenCanvasEl) view.zenCanvasEl.style.cursor = "crosshair";
        const currentTool = api.getTool();
        if (currentTool === "hand") {
          handBtn.addClass("mod-cta");
          if (view.zenCanvasEl) view.zenCanvasEl.style.cursor = "grab";
        } else if (currentTool === "pen") {
          penBtn.addClass("mod-cta");
        } else if (currentTool === "eraser") {
          eraserBtn.addClass("mod-cta");
        } else if (currentTool === "select") {
          selectBtn.addClass("mod-cta");
          if (view.zenCanvasEl) view.zenCanvasEl.style.cursor = "cell";
        }
        const currentColor = api.getColor();
        colorBtns.forEach((btn) => btn.style.border = "2px solid transparent");
        const activeColorBtn = colorBtns.find((b) => b.style.backgroundColor === currentColor || b.style.backgroundColor === `rgb(${parseInt(currentColor.slice(1, 3), 16)}, ${parseInt(currentColor.slice(3, 5), 16)}, ${parseInt(currentColor.slice(5, 7), 16)})`);
        if (activeColorBtn) activeColorBtn.style.border = "2px solid var(--text-normal)";
      };
      handBtn.onclick = () => {
        api.setTool("hand");
        updateToolUI();
      };
      selectBtn.onclick = () => {
        api.setTool("select");
        updateToolUI();
      };
      penBtn.onclick = () => {
        api.setTool("pen");
        updateToolUI();
      };
      eraserBtn.onclick = () => {
        api.setTool("eraser");
        updateToolUI();
      };
      const scrollWrapper = zenContainer.createDiv();
      scrollWrapper.style.flexGrow = "1";
      scrollWrapper.style.overflow = "auto";
      scrollWrapper.style.border = "2px dashed var(--background-modifier-border)";
      scrollWrapper.style.borderRadius = "8px";
      scrollWrapper.style.backgroundColor = "var(--background-secondary-alt)";
      scrollWrapper.style.position = "relative";
      scrollWrapper.appendChild(view.zenCanvasEl);
      scrollWrapper.appendChild(api.getOverlay());
      updateToolUI();
      setTimeout(() => {
        if (scrollWrapper.scrollLeft === 0 && scrollWrapper.scrollTop === 0) {
          scrollWrapper.scrollLeft = (view.zenCanvasEl.width - scrollWrapper.clientWidth) / 2;
          scrollWrapper.scrollTop = (view.zenCanvasEl.height - scrollWrapper.clientHeight) / 2;
        }
      }, 10);
    };
  }
  unload() {
    if (this.originalRenderZenDoodle) {
      CornellNotesView.prototype.renderZenDoodle = this.originalRenderZenDoodle;
    }
  }
};

// addons/BlurtingAddon.ts
var import_obsidian4 = require("obsidian");
var BlurtingAddon = class extends CornellAddon {
  constructor(plugin) {
    super(plugin);
    this.plugin = plugin;
    this.id = "blurting-mode";
    this.name = "\u{1F9E0} Blurting Mode (1-3-7)";
    this.description = "Turn your Marginalia Explorer into a Spaced Repetition study deck.";
  }
  load() {
    console.log("\u{1F9E0} Blurting Mode Addon enabled");
  }
  unload() {
    console.log("\u{1F6D1} Blurting Mode Addon disabled");
  }
};
var BlurtingSetupModal = class extends import_obsidian4.Modal {
  // 👈 Añadimos 'view' como segundo parámetro en el constructor
  constructor(app, view, deck) {
    super(app);
    this.view = view;
    this.deck = deck;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u{1F9E0} Start Blurting Session" });
    contentEl.createEl("p", {
      text: `You are about to test your memory on a deck of ${this.deck.length} marginalias. Choose your output format:`,
      attr: { style: "color: var(--text-muted); margin-bottom: 20px;" }
    });
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; gap: 15px; justify-content: center;" } });
    const visualBtn = btnContainer.createEl("button", { text: "\u{1F3A8} Visual (ZenCanvas)", cls: "mod-cta" });
    visualBtn.style.backgroundColor = "var(--color-purple)";
    visualBtn.onclick = () => this.startSession("visual");
    const textBtn = btnContainer.createEl("button", { text: "\u{1F4DD} Textual (ZK Note)", cls: "mod-cta" });
    textBtn.style.backgroundColor = "var(--interactive-accent)";
    textBtn.onclick = () => this.startSession("textual");
  }
  startSession(format) {
    new import_obsidian4.Notice(`Starting ${format} blurting session! \u{1F680}`);
    this.view.startBlurtingSession(this.deck, format);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// addons/margidoro.ts
var import_obsidian5 = require("obsidian");
var MargidoroAddon = class {
  constructor(plugin) {
    this.id = "margidoro";
    this.name = "Margidoro \u{1F345}";
    this.description = "Knowledge-aware Pomodoro timer.";
    this.statusBarItem = null;
    // 🎛️ Sub-elementos de la UI
    this.mainToggleEl = null;
    this.addBtnEl = null;
    this.skipBtnEl = null;
    this.timerInterval = null;
    this.reminderInterval = null;
    this.lastRemindedDate = "";
    this.isRunning = false;
    this.timeLeft = 0;
    this.mode = "work";
    this.sessionStartTime = 0;
    this.completedSessions = 0;
    this.sessionObjective = "";
    // 📸 NUEVO: Memoria temporal para el Snapshot del Pomodoro
    this.initialMarginalias = /* @__PURE__ */ new Set();
    this.plugin = plugin;
  }
  load() {
    this.statusBarItem = this.plugin.addStatusBarItem();
    if (this.statusBarItem) {
      this.statusBarItem.addClass("cornell-margidoro-status");
      this.statusBarItem.style.cursor = "pointer";
      this.statusBarItem.style.display = "flex";
      this.statusBarItem.style.alignItems = "center";
      this.statusBarItem.style.gap = "6px";
      this.mainToggleEl = this.statusBarItem.createSpan();
      this.mainToggleEl.onclick = (e) => {
        e.stopPropagation();
        if (this.isRunning) this.pauseTimer();
        else this.startTimer();
      };
      this.addBtnEl = this.statusBarItem.createSpan({ text: "+5m", title: "Add 5 minutes" });
      this.addBtnEl.style.fontSize = "0.85em";
      this.addBtnEl.style.color = "var(--text-muted)";
      this.addBtnEl.style.padding = "2px 4px";
      this.addBtnEl.style.borderRadius = "4px";
      this.addBtnEl.onmouseenter = () => {
        if (this.addBtnEl) {
          this.addBtnEl.style.backgroundColor = "var(--background-modifier-hover)";
          this.addBtnEl.style.color = "var(--text-normal)";
        }
      };
      this.addBtnEl.onmouseleave = () => {
        if (this.addBtnEl) {
          this.addBtnEl.style.backgroundColor = "transparent";
          this.addBtnEl.style.color = "var(--text-muted)";
        }
      };
      this.addBtnEl.onclick = (e) => {
        e.stopPropagation();
        this.timeLeft += 5 * 60;
        this.updateDisplay();
        new import_obsidian5.Notice("\u23F1\uFE0F Added 5 minutes!");
      };
      this.skipBtnEl = this.statusBarItem.createSpan({ text: "\u23ED", title: "Skip phase" });
      this.skipBtnEl.style.fontSize = "0.9em";
      this.skipBtnEl.style.color = "var(--text-muted)";
      this.skipBtnEl.style.padding = "2px 4px";
      this.skipBtnEl.style.borderRadius = "4px";
      this.skipBtnEl.onmouseenter = () => {
        if (this.skipBtnEl) {
          this.skipBtnEl.style.backgroundColor = "var(--background-modifier-hover)";
          this.skipBtnEl.style.color = "var(--text-normal)";
        }
      };
      this.skipBtnEl.onmouseleave = () => {
        if (this.skipBtnEl) {
          this.skipBtnEl.style.backgroundColor = "transparent";
          this.skipBtnEl.style.color = "var(--text-muted)";
        }
      };
      this.skipBtnEl.onclick = (e) => {
        e.stopPropagation();
        this.handleSessionEnd();
      };
    }
    this.resetTimer();
    this.updateDisplay();
    this.startReminderDaemon();
  }
  unload() {
    this.pauseTimer();
    if (this.reminderInterval) window.clearInterval(this.reminderInterval);
    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }
  startReminderDaemon() {
    this.reminderInterval = window.setInterval(() => {
      var _a;
      const now = window.moment().format("HH:mm");
      const today = window.moment().format("YYYY-MM-DD");
      if (now === this.plugin.settings.margidoro.reviewReminderTime && this.lastRemindedDate !== today) {
        const pendingCount = ((_a = this.plugin.settings.userStats.margidoroPending) == null ? void 0 : _a.length) || 0;
        if (pendingCount > 0) {
          new import_obsidian5.Notice(`\u{1F514} REMINDER: You have ${pendingCount} pending Hard Marginalias! Open the Rhizome to review them.`, 1e4);
          this.lastRemindedDate = today;
        }
      }
    }, 3e4);
  }
  // 📸 NUEVO: Función de Captura Rápida de Bóveda
  async takeSnapshot() {
    const snapshot = /* @__PURE__ */ new Set();
    const files = this.plugin.app.vault.getMarkdownFiles();
    for (const file of files) {
      const content = await this.plugin.app.vault.cachedRead(file);
      if (!content.includes("%%>") && !content.includes("%%<")) continue;
      const regex = /%%[><](.*?)%%/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const cleanMatch = match[0].replace(/\^([a-zA-Z0-9]+)\s*$/, "").trim();
        snapshot.add(`${file.path}::${cleanMatch}`);
      }
    }
    this.initialMarginalias = snapshot;
  }
  startTimer() {
    if (!this.isRunning) {
      if (this.mode === "work" && this.timeLeft === (this.plugin.settings.margidoro.workTime || 25) * 60 && !this.sessionObjective) {
        new MargidoroObjectiveModal(this.plugin.app, this, (objective) => {
          this.sessionObjective = objective;
          this.executeStartTimer();
        }).open();
      } else {
        this.executeStartTimer();
      }
    }
  }
  async executeStartTimer() {
    this.isRunning = true;
    if (this.mode === "work" && this.timeLeft === (this.plugin.settings.margidoro.workTime || 25) * 60) {
      this.sessionStartTime = Date.now();
      new import_obsidian5.Notice(this.sessionObjective ? `\u{1F3AF} Focus: ${this.sessionObjective}` : "\u{1F345} Margidoro started! Focus on your Marginalias.");
      this.takeSnapshot();
      if (!this.plugin.settings.dashboardData.trackerHistory) {
        this.plugin.settings.dashboardData.trackerHistory = [];
      }
      this.plugin.settings.dashboardData.trackerHistory.push({
        timestamp: this.sessionStartTime,
        objective: this.sessionObjective
      });
      await this.plugin.saveSettings();
    }
    this.timerInterval = window.setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        this.handleSessionEnd();
      }
    }, 1e3);
    this.updateDisplay();
  }
  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.updateDisplay();
  }
  resetTimer() {
    this.pauseTimer();
    if (this.mode === "work") this.timeLeft = (this.plugin.settings.margidoro.workTime || 25) * 60;
    else if (this.mode === "shortBreak") this.timeLeft = (this.plugin.settings.margidoro.shortBreak || 5) * 60;
    else this.timeLeft = (this.plugin.settings.margidoro.longBreak || 15) * 60;
    this.updateDisplay();
  }
  updateDisplay() {
    if (!this.mainToggleEl) return;
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    let icon = this.mode === "work" ? "\u{1F345}" : this.mode === "longBreak" ? "\u{1F6CC}" : "\u2615";
    let state = this.isRunning ? "\u23F8" : "\u25B6";
    const targetCycles = this.plugin.settings.margidoro.cyclesBeforeLongBreak || 4;
    let cycle = this.mode === "work" ? ` [${this.completedSessions % targetCycles + 1}/${targetCycles}]` : "";
    this.mainToggleEl.innerText = `${icon}${cycle} ${timeStr} ${state}`;
    this.mainToggleEl.style.fontWeight = this.isRunning ? "bold" : "normal";
    this.mainToggleEl.style.color = this.isRunning ? "var(--interactive-accent)" : "inherit";
  }
  handleSessionEnd() {
    var _a;
    this.pauseTimer();
    if (this.mode === "work") {
      const actualDurationMs = Date.now() - this.sessionStartTime;
      const actualDurationMins = Math.floor(actualDurationMs / 6e4);
      const history = (_a = this.plugin.settings.dashboardData) == null ? void 0 : _a.trackerHistory;
      if (history && history.length > 0) {
        const currentSession = history.find((s) => s.timestamp === this.sessionStartTime);
        if (currentSession) {
          currentSession.durationMinutes = actualDurationMins;
          this.plugin.saveSettings();
        }
      }
    }
    const targetCycles = this.plugin.settings.margidoro.cyclesBeforeLongBreak || 4;
    if (this.mode === "work") {
      this.completedSessions++;
      if (this.completedSessions > 0 && this.completedSessions % targetCycles === 0) {
        new import_obsidian5.Notice(`\u{1F389} ${targetCycles} Pomodoros completed! Time for a Long Break. Preparing Review...`);
        this.mode = "longBreak";
      } else {
        new import_obsidian5.Notice("\u23F0 Work session finished! Preparing Review...");
        this.mode = "shortBreak";
      }
      new MargidoroReviewModal(this.plugin.app, this.plugin, this.sessionStartTime, this.sessionObjective, this).open();
    } else {
      new import_obsidian5.Notice("\u{1F345} Break over. Back to work!");
      this.mode = "work";
    }
    this.resetTimer();
  }
};
var MargidoroObjectiveModal = class extends import_obsidian5.Modal {
  constructor(app, addon, onSubmit) {
    super(app);
    this.addon = addon;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u{1F3AF} Set Session Objective" });
    const input = contentEl.createEl("input", { type: "text", placeholder: "What do you want to accomplish?" });
    input.style.width = "100%";
    input.style.marginBottom = "15px";
    const btnRow = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px;" } });
    const skipBtn = btnRow.createEl("button", { text: "Skip" });
    skipBtn.onclick = () => {
      this.onSubmit("");
      this.close();
    };
    const startBtn = btnRow.createEl("button", { text: "\u25B6 Start Focus", cls: "mod-cta" });
    startBtn.style.backgroundColor = "var(--interactive-accent)";
    startBtn.style.color = "var(--text-on-accent)";
    startBtn.onclick = () => {
      this.onSubmit(input.value.trim());
      this.close();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onSubmit(input.value.trim());
        this.close();
      }
    });
    setTimeout(() => input.focus(), 50);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var MargidoroReviewModal = class extends import_obsidian5.Modal {
  constructor(app, plugin, sessionStartTime, sessionObjective, addon) {
    super(app);
    this.notesCreated = [];
    this.plugin = plugin;
    this.sessionStartTime = sessionStartTime;
    this.sessionObjective = sessionObjective;
    this.addon = addon;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "70vw";
    this.modalEl.style.maxWidth = "800px";
    contentEl.createEl("h2", { text: "\u{1F345} Session Complete! Let's Review." });
    if (this.sessionObjective) {
      contentEl.createEl("p", { text: `\u{1F3AF} Goal: ${this.sessionObjective}`, attr: { style: "font-weight: bold; color: var(--interactive-accent);" } });
    }
    contentEl.createEl("p", {
      text: "Here are the marginalias you created or edited during this focus block.",
      cls: "text-muted"
    });
    await this.scanSessionNotes();
    if (this.notesCreated.length === 0) {
      contentEl.createEl("h3", { text: "No new or edited marginalias found for this session.", attr: { style: "text-align: center; color: var(--text-muted); margin-top: 20px;" } });
      const btnRow = contentEl.createDiv({ attr: { style: "display: flex; justify-content: center; margin-top: 20px;" } });
      const closeBtn = btnRow.createEl("button", { text: "Close & Start Break" });
      closeBtn.onclick = () => {
        this.addon.sessionObjective = "";
        this.close();
      };
      return;
    }
    const listContainer = contentEl.createDiv({ attr: { style: "max-height: 400px; overflow-y: auto; overflow-x: hidden; margin-top: 15px; border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 10px;" } });
    this.notesCreated.forEach((note) => {
      const itemRow = listContainer.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: flex-start; padding: 10px; border-bottom: 1px solid var(--background-modifier-border);" } });
      const textCol = itemRow.createDiv({ attr: { style: "flex-grow: 1; margin-right: 15px; overflow: hidden;" } });
      textCol.createDiv({ text: note.file.basename, attr: { style: "font-size: 0.8em; color: var(--text-muted); margin-bottom: 4px;" } });
      let cleanText = note.text.replace(/%%[><](.*?)%%/g, "$1").trim();
      cleanText = cleanText.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim();
      const imgRegex = /!\[\[(.*?(?:\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.svg))\|?(.*?)\]\]/gi;
      cleanText = cleanText.replace(imgRegex, (match, filename) => {
        const trimmedFilename = filename.trim();
        const file = this.plugin.app.metadataCache.getFirstLinkpathDest(trimmedFilename, note.file.path);
        if (file) {
          const resourcePath = this.plugin.app.vault.getResourcePath(file);
          return `<img src="${resourcePath}" style="max-height: 130px; width: auto; object-fit: contain; border-radius: 6px; display: block; margin: 8px 0;" />`;
        }
        return match;
      });
      const contentDiv = textCol.createDiv({ attr: { style: "font-weight: 500; max-height: 150px; overflow-y: auto;" } });
      import_obsidian5.MarkdownRenderer.renderMarkdown(cleanText, contentDiv, note.file.path, this.plugin);
      const evalCol = itemRow.createDiv({ attr: { style: "display: flex; gap: 8px; flex-shrink: 0; padding-top: 20px;" } });
      const easyBtn = evalCol.createEl("button", { text: "\u2705 Easy" });
      const reviewBtn = evalCol.createEl("button", { text: "\u{1F914} Review" });
      const hardBtn = evalCol.createEl("button", { text: "\u274C Hard" });
      if (note.isHardAutoTagged) {
        note.status = "hard";
        hardBtn.style.backgroundColor = "var(--color-red)";
        hardBtn.style.color = "white";
      }
      const resetButtons = () => {
        easyBtn.style.backgroundColor = "";
        easyBtn.style.color = "";
        reviewBtn.style.backgroundColor = "";
        reviewBtn.style.color = "";
        hardBtn.style.backgroundColor = "";
        hardBtn.style.color = "";
      };
      easyBtn.onclick = () => {
        resetButtons();
        easyBtn.style.backgroundColor = "var(--color-green)";
        easyBtn.style.color = "white";
        note.status = "easy";
      };
      reviewBtn.onclick = () => {
        resetButtons();
        reviewBtn.style.backgroundColor = "var(--color-orange)";
        reviewBtn.style.color = "white";
        note.status = "review";
      };
      hardBtn.onclick = () => {
        resetButtons();
        hardBtn.style.backgroundColor = "var(--color-red)";
        hardBtn.style.color = "white";
        note.status = "hard";
      };
    });
    const actionRow = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; margin-top: 20px;" } });
    const saveBtn = actionRow.createEl("button", { text: "\u{1F4BE} Save Session Log", cls: "mod-cta" });
    saveBtn.style.backgroundColor = "var(--interactive-accent)";
    saveBtn.style.color = "var(--text-on-accent)";
    saveBtn.onclick = async () => {
      await this.saveSessionLog();
      this.addon.sessionObjective = "";
      this.close();
      new import_obsidian5.Notice("\u{1F345} Session Log saved! Enjoy your break.");
    };
  }
  async scanSessionNotes() {
    var _a;
    const files = this.plugin.app.vault.getMarkdownFiles();
    const hardPrefix = ((_a = this.plugin.settings.margidoro) == null ? void 0 : _a.hardPrefix) || "?";
    for (const file of files) {
      if (file.stat.mtime >= this.sessionStartTime || file.stat.ctime >= this.sessionStartTime) {
        const content = await this.plugin.app.vault.cachedRead(file);
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const regex = /%%[><](.*?)%%/g;
          let match;
          while ((match = regex.exec(line)) !== null) {
            const fullMatch = match[0];
            const cleanMatchForSnapshot = fullMatch.replace(/\^([a-zA-Z0-9]+)\s*$/, "").trim();
            const snapshotKey = `${file.path}::${cleanMatchForSnapshot}`;
            if (this.addon.initialMarginalias.has(snapshotKey)) {
              continue;
            }
            const noteContent = match[1].trim();
            if (!noteContent) continue;
            let isHard = false;
            if (noteContent.startsWith(hardPrefix)) {
              isHard = true;
            }
            const blockIdMatch = line.match(/\^([a-zA-Z0-9]+)\s*$/);
            const blockId = blockIdMatch ? blockIdMatch[1] : null;
            const rhizomeId = blockId ? blockId : `${file.basename}-L${i}`;
            if (!this.notesCreated.some((n) => n.text === fullMatch && n.file.path === file.path)) {
              this.notesCreated.push({
                file,
                text: fullMatch,
                id: rhizomeId,
                isHardAutoTagged: isHard,
                status: isHard ? "hard" : "unrated"
              });
            }
          }
        }
      }
    }
  }
  async saveSessionLog() {
    var _a;
    const dateStr = window.moment().format("YYYY-MM-DD");
    const timeStr = window.moment().format("HH:mm");
    const folder = ((_a = this.plugin.settings.margidoro) == null ? void 0 : _a.logFolder) || "Margidoro Logs";
    await this.plugin.ensureFolderExists(folder);
    const fileName = `${folder}/Pomodoro_Log_${dateStr}.md`;
    let logContent = `
## Session at ${timeStr}
`;
    if (this.sessionObjective) {
      logContent += `**\u{1F3AF} Objective:** ${this.sessionObjective}

`;
    } else {
      logContent += `
`;
    }
    const easyNotes = this.notesCreated.filter((n) => n.status === "easy");
    const reviewNotes = this.notesCreated.filter((n) => n.status === "review");
    const hardNotes = this.notesCreated.filter((n) => n.status === "hard");
    const pending = [...reviewNotes, ...hardNotes];
    for (const note of pending) {
      if (!note.text.match(/\^([a-zA-Z0-9]+)\s*$/)) {
        const newId = Math.random().toString(36).substring(2, 8);
        await this.plugin.app.vault.process(note.file, (data) => {
          return data.replace(note.text, `${note.text} ^${newId}`);
        });
        note.id = newId;
        note.text = `${note.text} ^${newId}`;
      }
    }
    if (!this.plugin.settings.userStats.margidoroPending) {
      this.plugin.settings.userStats.margidoroPending = [];
    }
    pending.forEach((n) => {
      if (!this.plugin.settings.userStats.margidoroPending.includes(n.id)) {
        this.plugin.settings.userStats.margidoroPending.push(n.id);
      }
    });
    await this.plugin.saveSettings();
    if (hardNotes.length > 0) {
      logContent += `### \u274C Needs Urgent Review
`;
      hardNotes.forEach((n) => logContent += `- [[${n.file.basename}]] : ${n.text}
`);
      logContent += `
`;
    }
    if (reviewNotes.length > 0) {
      logContent += `### \u{1F914} Need to Process
`;
      reviewNotes.forEach((n) => logContent += `- [[${n.file.basename}]] : ${n.text}
`);
      logContent += `
`;
    }
    if (easyNotes.length > 0) {
      logContent += `### \u2705 Mastered Concepts
`;
      easyNotes.forEach((n) => logContent += `- [[${n.file.basename}]] : ${n.text}
`);
      logContent += `
`;
    }
    logContent += `---
`;
    const file = this.plugin.app.vault.getAbstractFileByPath(fileName);
    if (file instanceof import_obsidian5.TFile) {
      await this.plugin.app.vault.append(file, logContent);
    } else {
      const header = `# \u{1F345} Margidoro Daily Log: ${dateStr}

`;
      await this.plugin.app.vault.create(fileName, header + logContent);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// addons/AnkiSyncAddon.ts
var import_obsidian6 = require("obsidian");
var AnkiSyncAddon = class extends CornellAddon {
  constructor() {
    super(...arguments);
    this.id = "anki-sync";
    this.name = "Anki Advanced Sync";
    this.description = "Syncs marginalias to Anki with bidirectional support, native images, and PDF++ crops.";
    this.recentDecks = [];
  }
  load() {
    this.plugin.addCommand({
      id: "sync-cornell-to-anki",
      name: "Sync Flashcards to Anki (Current Note)",
      callback: () => this.startSyncProcess()
    });
    this.plugin.addCommand({
      id: "sync-vault-to-anki",
      name: "Sync ALL Vault Flashcards to Anki (Tag-Mapped)",
      callback: () => this.syncAllVaultCards()
    });
  }
  unload() {
  }
  async invokeAnki(action, params = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e3);
      const response = await fetch("http://localhost:8765", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version: 6, params }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.error) throw new Error(`Anki API Error: ${data.error}`);
      return data.result;
    } catch (error) {
      console.error("AnkiConnect connection failed:", error);
      throw new import_obsidian6.Notice("\u26A0\uFE0F Could not connect to Anki. Is Anki open with AnkiConnect installed?");
    }
  }
  async startSyncProcess() {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian6.Notice("\u26A0\uFE0F Open a note first.");
      return;
    }
    new AnkiDeckModal(this.plugin.app, this, activeFile).open();
  }
  async syncAllVaultCards() {
    const mappings = this.plugin.settings.ankiTagToDeck;
    if (!mappings || Object.keys(mappings).length === 0) {
      new import_obsidian6.Notice("\u26A0\uFE0F No routes configured. Go to plugin settings and map tags to Anki decks.");
      return;
    }
    new import_obsidian6.Notice("\u{1F680} Scanning the entire vault... This may take a few seconds.");
    const files = this.plugin.app.vault.getMarkdownFiles();
    let totalAdded = 0;
    let totalUpdated = 0;
    let processedFiles = 0;
    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      if (!cache) continue;
      const tags = (0, import_obsidian6.getAllTags)(cache) || [];
      let targetDeck = null;
      for (const tag of tags) {
        if (mappings[tag]) {
          targetDeck = mappings[tag];
          break;
        }
      }
      if (targetDeck) {
        try {
          const result = await this.syncSingleFileCore(file, targetDeck);
          if (result.added > 0 || result.updated > 0) {
            totalAdded += result.added;
            totalUpdated += result.updated;
            processedFiles++;
          }
        } catch (e) {
          console.error(`Error sincronizando ${file.basename}:`, e);
        }
      }
    }
    new import_obsidian6.Notice(`\u2705 Bulk Sync Completed!
\u{1F4C4} Notes processed: ${processedFiles}
\u2728 New Cards: ${totalAdded}
\u{1F504} Updated: ${totalUpdated}`);
  }
  async extractPdfRegionAsBase64(pdfFilename, pageNum, rect) {
    try {
      const pdfFile = this.plugin.app.metadataCache.getFirstLinkpathDest(pdfFilename, "");
      if (!pdfFile) return null;
      const arrayBuffer = await this.plugin.app.vault.readBinary(pdfFile);
      const bufferClone = arrayBuffer.slice(0);
      const pdf = await window.pdfjsLib.getDocument({ data: bufferClone }).promise;
      const page = await pdf.getPage(pageNum);
      const scale = 2;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle(rect);
      const x = Math.min(vx1, vx2);
      const y = Math.min(vy1, vy2);
      const w = Math.abs(vx2 - vx1);
      const h = Math.abs(vy2 - vy1);
      const padding = 10;
      const finalX = Math.max(0, x - padding);
      const finalY = Math.max(0, y - padding);
      const finalW = Math.min(canvas.width - finalX, w + padding * 2);
      const finalH = Math.min(canvas.height - finalY, h + padding * 2);
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = finalW;
      cropCanvas.height = finalH;
      const cropCtx = cropCanvas.getContext("2d");
      if (cropCtx) {
        cropCtx.fillStyle = "#ffffff";
        cropCtx.fillRect(0, 0, finalW, finalH);
        cropCtx.drawImage(canvas, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);
      }
      const dataUrl = cropCanvas.toDataURL("image/png");
      return dataUrl.replace(/^data:image\/png;base64,/, "");
    } catch (e) {
      console.error("Error procesando PDF++:", e);
      return null;
    }
  }
  async processMediaInText(text) {
    let processedText = text;
    const pdfRegex = /!\[\[([\s\S]*?\.pdf)#page=(\d+)&rect=([\d.,\s]+).*?\]\]/gis;
    let pdfMatch;
    while ((pdfMatch = pdfRegex.exec(processedText)) !== null) {
      const filename = pdfMatch[1].replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
      const page = parseInt(pdfMatch[2]);
      const cleanRectStr = pdfMatch[3].replace(/\s+/g, "");
      const rect = cleanRectStr.split(",").map(Number);
      const base64Data = await this.extractPdfRegionAsBase64(filename, page, rect);
      if (base64Data) {
        const ankiFilename = `pdf_extract_${Date.now()}.png`;
        await this.invokeAnki("storeMediaFile", { filename: ankiFilename, data: base64Data });
        processedText = processedText.replace(pdfMatch[0], `<img src="${ankiFilename}">`);
      }
    }
    const imgRegex = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|svg))\]\]/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(processedText)) !== null) {
      const filenameRaw = imgMatch[1].trim();
      const filename = filenameRaw.replace(/^\/+/, "");
      const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename, "");
      if (file) {
        const arrayBuffer = await this.plugin.app.vault.readBinary(file);
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        await this.invokeAnki("storeMediaFile", { filename, data: base64Data });
        processedText = processedText.replace(imgMatch[0], `<img src="${filename}">`);
      }
    }
    return processedText;
  }
  /**
   * Resuelve enlaces de bloques e incorpora un pipeline estricto de limpieza
   * para remover la sintaxis de metadatos generada por Zotflow.
   */
  async resolveBlockEmbeds(text, sourceFile) {
    var _a, _b;
    const blockEmbedRegex = /!\[\[([^#\]|]+)#\^([a-zA-Z0-9-]+)\]\]/g;
    let processedText = text;
    const matches = Array.from(text.matchAll(blockEmbedRegex));
    for (const match of matches) {
      const [fullMatch, linkPath, blockId] = match;
      let targetFile = this.plugin.app.metadataCache.getFirstLinkpathDest(linkPath.trim(), sourceFile.path);
      if (!targetFile) {
        const cleanPath = linkPath.trim();
        targetFile = this.plugin.app.vault.getAbstractFileByPath(cleanPath) || this.plugin.app.vault.getAbstractFileByPath(cleanPath + ".md");
      }
      if (targetFile instanceof import_obsidian6.TFile) {
        const cache = this.plugin.app.metadataCache.getFileCache(targetFile);
        const blockData = ((_a = cache == null ? void 0 : cache.blocks) == null ? void 0 : _a[blockId.toLowerCase()]) || ((_b = cache == null ? void 0 : cache.blocks) == null ? void 0 : _b[blockId]);
        let extractedText = "";
        if (blockData) {
          const content = await this.plugin.app.vault.read(targetFile);
          extractedText = content.substring(blockData.position.start.offset, blockData.position.end.offset);
        } else {
          const content = await this.plugin.app.vault.read(targetFile);
          const lines = content.split("\n");
          const targetLine = lines.find((l) => l.includes(`^${blockId}`));
          if (targetLine) extractedText = targetLine;
        }
        if (extractedText) {
          let cleanText = extractedText.replace(new RegExp(`\\^${blockId}`, "gi"), "");
          cleanText = cleanText.replace(/\[!zotflow-[^\]]+\]/gi, "");
          cleanText = cleanText.replace(/(?<!!)\[\[.*?\]\]/g, "");
          cleanText = cleanText.replace(/>/g, "").trim();
          processedText = processedText.replace(fullMatch, cleanText);
        }
      } else {
        console.warn(`AnkiSync: No se pudo encontrar el archivo de cita: ${linkPath}`);
      }
    }
    return processedText;
  }
  async processAndSendCards(file, deckName) {
    new import_obsidian6.Notice(`\u23F3 Syncing ${file.basename} with Anki...`);
    try {
      const result = await this.syncSingleFileCore(file, deckName);
      if (result.added === 0 && result.updated === 0) {
        new import_obsidian6.Notice("\u26A0\uFE0F No flashcards found.");
      } else {
        new import_obsidian6.Notice(`\u2705 Anki Sync: ${result.added} created, ${result.updated} updated in "${deckName}".`);
      }
    } catch (error) {
      new import_obsidian6.Notice(`\u274C Anki Error: ${error.message}`);
    }
  }
  async syncSingleFileCore(file, deckName) {
    var _a;
    const decks = await this.invokeAnki("deckNames");
    if (!decks.includes(deckName)) {
      await this.invokeAnki("createDeck", { deck: deckName });
    }
    const models = await this.invokeAnki("modelNames");
    let modelName = "Basic";
    if (!models.includes("Basic")) {
      if (models.includes("B\xE1sico")) modelName = "B\xE1sico";
      else modelName = models[0];
    }
    const modelFields = await this.invokeAnki("modelFieldNames", { modelName });
    if (modelFields.length < 2) throw new Error(`The Anki model "${modelName}" doesn't have enough fields.`);
    const frontField = modelFields[0];
    const backField = modelFields[1];
    let content = await this.plugin.app.vault.read(file);
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const noteTags = cache ? ((_a = (0, import_obsidian6.getAllTags)(cache)) == null ? void 0 : _a.map((t) => t.replace("#", ""))) || [] : [];
    const flashcardRegex = /%%([><])\s*([\s\S]*?)\s*; Nano\s*([\s\S]*?)%%/g;
    const standardRegex = /%%([><])\s*([\s\S]*?)\s*;;\s*([\s\S]*?)%%/g;
    const activeRegex = content.match(standardRegex) ? standardRegex : flashcardRegex;
    let match;
    let added = 0, updated = 0;
    const replacements = [];
    while ((match = activeRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const direction = match[1];
      const questionRaw = match[2].trim();
      const trailingData = match[3] || "";
      const ankiIdMatch = trailingData.match(/[\^~]anki-(\d+)/);
      const existingAnkiId = ankiIdMatch ? ankiIdMatch[1] : null;
      let blockStart = content.lastIndexOf("\n\n", match.index);
      blockStart = blockStart === -1 ? 0 : blockStart + 2;
      let blockEnd = content.indexOf("\n\n", match.index + fullMatch.length);
      blockEnd = blockEnd === -1 ? content.length : blockEnd;
      const fullBlock = content.substring(blockStart, blockEnd);
      let answerRaw = fullBlock.replace(fullMatch, "");
      answerRaw = await this.resolveBlockEmbeds(answerRaw, file);
      const questionHtml = await this.processMediaInText(questionRaw);
      const answerHtml = await this.processMediaInText(answerRaw);
      let finalAnswer = answerHtml.replace(/^---[\s\S]*?---\s*/, "").replace(/(?<!#)[\^~“][a-zA-Z0-9-]{5,}/g, "").trim();
      const noteParams = {
        deckName,
        modelName,
        fields: { [frontField]: questionHtml, [backField]: finalAnswer },
        options: { allowDuplicate: false },
        tags: noteTags
      };
      let finalAnkiId = existingAnkiId;
      if (existingAnkiId) {
        try {
          await this.invokeAnki("updateNoteFields", {
            note: { id: parseInt(existingAnkiId, 10), fields: noteParams.fields }
          });
          updated++;
        } catch (e) {
          finalAnkiId = await this.invokeAnki("addNote", { note: noteParams });
          added++;
        }
      } else {
        try {
          finalAnkiId = await this.invokeAnki("addNote", { note: noteParams });
          added++;
        } catch (e) {
          if (e.message && e.message.includes("duplicate")) {
            const safeQuery = questionHtml.replace(/"/g, '\\"');
            const foundIds = await this.invokeAnki("findNotes", { query: `"${frontField}:${safeQuery}"` });
            if (foundIds && foundIds.length > 0) {
              finalAnkiId = foundIds[0].toString();
              await this.invokeAnki("updateNoteFields", {
                note: { id: parseInt(finalAnkiId, 10), fields: noteParams.fields }
              });
              updated++;
            }
          } else {
            throw e;
          }
        }
      }
      if (finalAnkiId) {
        let newTrailingData = trailingData;
        if (existingAnkiId) {
          newTrailingData = newTrailingData.replace(/[\^~]anki-\d+/, `^anki-${finalAnkiId}`);
        } else {
          newTrailingData = `^anki-${finalAnkiId} ` + newTrailingData;
        }
        const updatedMatch = activeRegex === standardRegex ? `%%${direction} ${questionRaw} ;; ${newTrailingData.trim()} %%` : `%%${direction} ${questionRaw} ; ${newTrailingData.trim()} %%`;
        replacements.push({
          start: match.index,
          end: match.index + fullMatch.length,
          text: updatedMatch
        });
      }
    }
    if (replacements.length > 0) {
      replacements.sort((a, b) => b.start - a.start);
      for (const rep of replacements) {
        content = content.substring(0, rep.start) + rep.text + content.substring(rep.end);
      }
      await this.plugin.app.vault.modify(file, content);
    }
    return { added, updated };
  }
};
var AnkiDeckModal = class extends import_obsidian6.Modal {
  constructor(app, addon, file) {
    super(app);
    this.addon = addon;
    this.file = file;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: "\u{1F9E0} Sync with Anki" });
    const inputDiv = contentEl.createDiv({ attr: { style: "margin-bottom: 15px;" } });
    inputDiv.createEl("label", { text: "Deck Name (e.g. Med::Cardio): ", attr: { style: "display:block; margin-bottom:5px;" } });
    this.deckInput = inputDiv.createEl("input", { type: "text", placeholder: "Deck::Subdeck" });
    this.deckInput.style.width = "100%";
    if (this.addon.recentDecks && this.addon.recentDecks.length > 0) {
      this.deckInput.value = this.addon.recentDecks[0];
    }
    if (this.addon.recentDecks && this.addon.recentDecks.length > 0) {
      const historyDiv = contentEl.createDiv({ attr: { style: "margin-bottom: 20px; display: flex; gap: 5px; flex-wrap: wrap;" } });
      historyDiv.createEl("span", { text: "Recientes:", attr: { style: "font-size: 0.85em; color: var(--text-muted); align-self: center;" } });
      this.addon.recentDecks.forEach((deck) => {
        const pill = historyDiv.createEl("button", { text: deck });
        pill.style.padding = "2px 8px";
        pill.style.fontSize = "0.8em";
        pill.onclick = () => {
          this.deckInput.value = deck;
        };
      });
    }
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px;" } });
    const cancelBtn = btnContainer.createEl("button", { text: "Cancelar" });
    cancelBtn.onclick = () => this.close();
    const syncBtn = btnContainer.createEl("button", { text: "\u{1F680} Sync", cls: "mod-cta" });
    syncBtn.onclick = async () => {
      const rawDeckName = this.deckInput.value;
      const safeDeckName = sanitizeAnkiDeckName(rawDeckName);
      if (!safeDeckName) {
        new import_obsidian6.Notice("\u26A0\uFE0F Invalid deck name.");
        return;
      }
      if (!this.addon.recentDecks) this.addon.recentDecks = [];
      this.addon.recentDecks = [safeDeckName, ...this.addon.recentDecks.filter((d) => d !== safeDeckName)].slice(0, 5);
      this.close();
      await this.addon.processAndSendCards(this.file, safeDeckName);
    };
    this.deckInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") syncBtn.click();
    });
    setTimeout(() => this.deckInput.focus(), 50);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// addons/ZoomDoodleAddon.ts
var CornellAddon3 = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
};
var ZoomDoodleAddon = class extends CornellAddon3 {
  constructor() {
    super(...arguments);
    this.id = "zoom-doodle";
    this.name = "\u{1F50D} Zoom & Pan Doodles";
    this.description = "Haz clic en cualquier imagen o doodle en tus marginalias para expandirla a pantalla completa con controles de zoom y paneo.";
    // Definimos el manejador como una Arrow Function para conservar el contexto 'this'
    this.clickHandler = (e) => {
      const target = e.target;
      if (target.tagName === "IMG") {
        const isInsideMarginalia = target.closest(".cm-cornell-margin") || target.closest(".cornell-sidebar-item") || target.closest(".cornell-pinboard-item");
        if (isInsideMarginalia) {
          e.preventDefault();
          e.stopPropagation();
          this.openLightbox(target);
        }
      }
    };
  }
  load() {
    document.body.addEventListener("click", this.clickHandler);
  }
  unload() {
    document.body.removeEventListener("click", this.clickHandler);
  }
  // --- 🖼️ MOTOR DE PANTALLA COMPLETA (LIGHTBOX) ---
  openLightbox(imgEl) {
    const imgSrc = imgEl.src;
    const overlay = document.body.createDiv({ cls: "cornell-lightbox-overlay" });
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.overflow = "hidden";
    const imgContainer = overlay.createDiv();
    imgContainer.style.transition = "transform 0.1s ease-out";
    imgContainer.style.cursor = "grab";
    const bigImg = imgContainer.createEl("img", { attr: { src: imgSrc, draggable: "false" } });
    bigImg.style.backgroundColor = "white";
    bigImg.style.padding = "15px";
    bigImg.style.borderRadius = "8px";
    bigImg.style.maxHeight = "90vh";
    bigImg.style.maxWidth = "90vw";
    bigImg.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    if (document.body.classList.contains("theme-dark") && imgSrc.includes("doodle_")) {
      bigImg.style.filter = "invert(1)";
      bigImg.style.opacity = "0.9";
    }
    let scale = 1;
    let isDraggingImg = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    const updateTransform = () => {
      imgContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };
    overlay.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY < 0) scale = Math.min(scale + 0.15, 5);
      else scale = Math.max(scale - 0.15, 0.5);
      updateTransform();
    });
    imgContainer.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isDraggingImg = true;
      imgContainer.style.cursor = "grabbing";
      imgContainer.style.transition = "none";
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDraggingImg) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });
    window.addEventListener("mouseup", () => {
      if (isDraggingImg) {
        isDraggingImg = false;
        imgContainer.style.cursor = "grab";
        imgContainer.style.transition = "transform 0.1s ease-out";
      }
    });
    const closeLightbox = () => {
      overlay.remove();
      document.removeEventListener("keydown", escListener);
    };
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) closeLightbox();
    });
    const escListener = (evKey) => {
      if (evKey.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", escListener);
  }
};

// addons/DashboardView.ts
var import_obsidian7 = require("obsidian");
var DASHBOARD_VIEW_TYPE = "cornell-dashboard-view";
var CornellDashboardView = class extends import_obsidian7.ItemView {
  // Memoria del nivel de energía de hoy
  constructor(leaf, plugin) {
    super(leaf);
    this.currentDayMode = "optimal";
    this.plugin = plugin;
    this.plugin.registerEvent(
      this.plugin.app.vault.on("rename", async (file, oldPath) => {
        const data = this.plugin.settings.dashboardData;
        let changed = false;
        const oldName = oldPath.split("/").pop() || oldPath;
        if (data.subjects) {
          data.subjects.forEach((subj) => {
            if (subj.syllabus) {
              subj.syllabus.forEach((topic) => {
                if (topic.attachedNotes) {
                  const idx = topic.attachedNotes.indexOf(oldPath);
                  const nameIdx = topic.attachedNotes.indexOf(oldName);
                  if (idx !== -1) {
                    topic.attachedNotes[idx] = file.path;
                    changed = true;
                  } else if (nameIdx !== -1) {
                    topic.attachedNotes[nameIdx] = file.name;
                    changed = true;
                  }
                }
                if (topic.taskNoteId && (topic.taskNoteId === oldPath || topic.taskNoteId === oldName.replace(".md", ""))) {
                  topic.taskNoteId = file.path;
                  changed = true;
                }
              });
            }
          });
        }
        if (changed) {
          await this.plugin.saveSettings();
          this.onOpen();
        }
      })
    );
  }
  // copiar el puerto de tasknote 
  async getTaskNotesConfig() {
    try {
      const appInstance = this.plugin ? this.plugin.app : this.app;
      const configStr = await appInstance.vault.adapter.read(".obsidian/plugins/tasknotes/data.json");
      const config = JSON.parse(configStr);
      return {
        port: config.apiPort || 8080,
        token: config.apiAuthToken || ""
        // Rescatamos el token si existe
      };
    } catch (e) {
      return { port: 8080, token: "" };
    }
  }
  //  HASTA AQUÍ 
  getViewType() {
    return DASHBOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "Smart study";
  }
  async calculateSubjectStats(subject, container) {
    var _a, _b, _c, _d;
    container.empty();
    const files = this.plugin.app.vault.getMarkdownFiles();
    const sources = subject.sources || [];
    const allAttachedNotes = [];
    if (subject.syllabus) {
      subject.syllabus.forEach((t) => {
        if (t.attachedNotes) allAttachedNotes.push(...t.attachedNotes);
      });
    }
    const validFiles = files.filter((f) => {
      const isSource = sources.some((src) => f.path.startsWith(src) || f.path === src || f.name === src);
      const isAttached = allAttachedNotes.some((n) => f.path === n || f.name === n || f.name === `${n}.md`);
      return isSource || isAttached;
    });
    let totalFlashcards = 0;
    let newFlashcards = 0;
    let learningFlashcards = 0;
    let matureFlashcards = 0;
    let activeNotesCount = 0;
    let totalConfidenceSum = 0;
    let reviewedNotesCount = 0;
    for (const file of validFiles) {
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split("\n");
      let hasMarginalia = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/%%[><](.*?)%%/)) {
          hasMarginalia = true;
          if (lines[i].includes(";;")) {
            totalFlashcards++;
            const blockIdMatch = lines[i].match(/\^([a-zA-Z0-9]+)\s*$/);
            const blockId = blockIdMatch ? blockIdMatch[1] : `${file.basename}-L${i}`;
            const reviewData = (_b = (_a = this.plugin.settings.userStats) == null ? void 0 : _a.rhizomeReviews) == null ? void 0 : _b[blockId];
            if (!reviewData || reviewData.lastReviewed === 0) {
              newFlashcards++;
            } else if (reviewData.interval >= 21) {
              matureFlashcards++;
            } else {
              learningFlashcards++;
            }
          }
        }
      }
      const isAttached = allAttachedNotes.some((n) => file.path === n || file.name === n || file.name === `${n}.md`);
      if (hasMarginalia || isAttached) {
        activeNotesCount++;
        const readingData = (_d = (_c = this.plugin.settings.userStats) == null ? void 0 : _c.activeReading) == null ? void 0 : _d[file.path];
        if (readingData && readingData.confidence) {
          reviewedNotesCount++;
          totalConfidenceSum += readingData.confidence;
        }
      }
    }
    if (activeNotesCount === 0 && totalFlashcards === 0) {
      container.createDiv({ text: "No active notes or flashcards found.", cls: "text-muted", attr: { style: "font-size: 0.8em; margin-top: 10px;" } });
      return;
    }
    container.createDiv({ attr: { style: "display: flex; gap: 15px; margin-bottom: 10px; font-size: 0.9em; background: var(--background-secondary-alt); padding: 8px; border-radius: 6px;" } }).innerHTML = `
            <div title="Notas completas evaluables">\u{1F4C4} <b>${activeNotesCount}</b> Notas</div>
            <div title="Tarjetas estrictas (Pregunta ;; Respuesta)">\u{1F5C2}\uFE0F <b>${totalFlashcards}</b> Flashcards</div>
        `;
    if (totalFlashcards > 0) {
      const reviewedFlashcards = totalFlashcards - newFlashcards;
      const progressPct = Math.round(reviewedFlashcards / totalFlashcards * 100);
      const masteryRow = container.createDiv({ attr: { style: "display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-muted); align-items: center; margin-top: 5px;" } });
      masteryRow.createSpan({ text: `Mastery (SRS): ${progressPct}%`, attr: { style: "font-weight: bold; color: var(--text-normal);" } });
      const badges = masteryRow.createSpan({ attr: { style: "display: flex; gap: 8px; font-family: monospace; font-size: 0.9em;" } });
      if (newFlashcards > 0) badges.createSpan({ text: `\u{1F331} ${newFlashcards}`, title: "New/Unseen" });
      if (learningFlashcards > 0) badges.createSpan({ text: `\u{1F525} ${learningFlashcards}`, title: "Learning" });
      if (matureFlashcards > 0) badges.createSpan({ text: `\u{1F333} ${matureFlashcards}`, title: "Mature (21+ days)" });
      const barWrapper = container.createDiv({ attr: { style: "width: 100%; height: 6px; background: var(--background-modifier-border); border-radius: 4px; margin: 4px 0 10px 0; overflow: hidden; display: flex;" } });
      if (learningFlashcards > 0) {
        const lPct = learningFlashcards / totalFlashcards * 100;
        barWrapper.createDiv({ attr: { style: `height: 100%; width: ${lPct}%; background: var(--color-orange);` } });
      }
      if (matureFlashcards > 0) {
        const mPct = matureFlashcards / totalFlashcards * 100;
        barWrapper.createDiv({ attr: { style: `height: 100%; width: ${mPct}%; background: var(--color-green);` } });
      }
    } else {
      container.createDiv({ text: "Sin Flashcards SRS configuradas.", cls: "text-muted", attr: { style: "font-size: 0.8em; margin-bottom: 10px;" } });
    }
    if (activeNotesCount > 0) {
      const avgConfidence = reviewedNotesCount > 0 ? (totalConfidenceSum / reviewedNotesCount).toFixed(1) : "0.0";
      const confPct = reviewedNotesCount > 0 ? Math.round(totalConfidenceSum / reviewedNotesCount / 10 * 100) : 0;
      let confColor = "var(--color-red)";
      if (confPct >= 50) confColor = "var(--color-orange)";
      if (confPct >= 80) confColor = "var(--color-green)";
      const confRow = container.createDiv({ attr: { style: "display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-muted); align-items: center;" } });
      confRow.createSpan({ text: `Confidence (Reading): ${avgConfidence}/10`, attr: { style: "font-weight: bold; color: var(--text-normal);" } });
      confRow.createSpan({ text: `\u{1F4DD} ${reviewedNotesCount}/${activeNotesCount} notes`, attr: { style: "font-size: 0.9em;" } });
      const confBarWrapper = container.createDiv({ attr: { style: "width: 100%; height: 6px; background: var(--background-modifier-border); border-radius: 4px; margin: 4px 0 6px 0; overflow: hidden; display: flex;" } });
      if (confPct > 0) {
        confBarWrapper.createDiv({ attr: { style: `height: 100%; width: ${confPct}%; background: ${confColor};` } });
      }
    }
  }
  renderTimeline(container) {
    var _a, _b;
    container.empty();
    container.createEl("h2", { text: "\u23F3 Exam Timeline" });
    const subjects = ((_a = this.plugin.settings.dashboardData) == null ? void 0 : _a.subjects) || [];
    const validExams = subjects.filter((s) => s.examDate).sort((a, b) => a.examDate - b.examDate);
    if (validExams.length === 0) {
      container.createEl("p", { text: "No exams scheduled. Add an exam date to your subjects to see the timeline.", cls: "text-muted", attr: { style: "font-style: italic; font-size: 0.9em;" } });
      return;
    }
    if (!document.getElementById("cornell-timeline-styles")) {
      const style = document.createElement("style");
      style.id = "cornell-timeline-styles";
      style.innerHTML = `
                @keyframes growTimelineBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                .timeline-scroll-area::-webkit-scrollbar { height: 6px; }
                .timeline-scroll-area::-webkit-scrollbar-thumb { background: var(--background-modifier-border); border-radius: 3px; }
            `;
      document.head.appendChild(style);
    }
    const scrollArea = container.createDiv({ cls: "timeline-scroll-area", attr: { style: "overflow-x: auto; padding-bottom: 15px; margin-top: 15px; width: 100%;" } });
    const now = /* @__PURE__ */ new Date();
    const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const msInDay = 1e3 * 60 * 60 * 24;
    const pxPerDay = 14;
    const pastDaysToShow = 20;
    const futureBufferDays = 30;
    const maxExamMs = validExams[validExams.length - 1].examDate;
    let daysToMax = Math.ceil((maxExamMs - todayMs) / msInDay);
    if (daysToMax < 15) daysToMax = 15;
    const trackWidth = (pastDaysToShow + daysToMax + futureBufferDays) * pxPerDay;
    const todayX = pastDaysToShow * pxPerDay;
    const trackHeight = Math.max(100, validExams.length * 40 + 60);
    const track = scrollArea.createDiv({ attr: { style: `position: relative; width: ${trackWidth}px; height: ${trackHeight}px; min-width: 100%;` } });
    const dbData = this.plugin.settings.dashboardData || {};
    const history = dbData.trackerHistory || [];
    const studyHeatmap = /* @__PURE__ */ new Map();
    history.forEach((session) => {
      if (!session.timestamp || !session.durationMinutes) return;
      const d = new Date(session.timestamp);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const currentMins = studyHeatmap.get(dateKey) || 0;
      studyHeatmap.set(dateKey, currentMins + session.durationMinutes);
    });
    const axisY = trackHeight - 20;
    track.createDiv({ attr: { style: `position: absolute; top: ${axisY}px; left: 0; right: 0; height: 2px; background: var(--background-modifier-border);` } });
    for (let i = -pastDaysToShow; i <= daysToMax + futureBufferDays; i++) {
      const tickDate = new Date(todayMs + i * msInDay);
      const dateKey = `${tickDate.getFullYear()}-${tickDate.getMonth() + 1}-${tickDate.getDate()}`;
      const totalMins = studyHeatmap.get(dateKey) || 0;
      if (totalMins > 0) {
        const tickX = todayX + i * pxPerDay;
        let heatColor = "rgba(0, 200, 100, 0.2)";
        if (totalMins >= 120) heatColor = "rgba(0, 200, 100, 1.0)";
        else if (totalMins >= 60) heatColor = "rgba(0, 200, 100, 0.7)";
        else if (totalMins >= 30) heatColor = "rgba(0, 200, 100, 0.4)";
        const heatBlock = track.createDiv({ attr: { style: `position: absolute; left: ${tickX + 1}px; top: ${axisY - 12}px; width: ${pxPerDay - 2}px; height: 10px; background: ${heatColor}; border-radius: 2px; cursor: help; transition: transform 0.2s ease; z-index: 1;` } });
        heatBlock.setAttribute("aria-label", `${tickDate.toLocaleDateString()}\\n\u{1F4DA} Estudiado: ${Math.round(totalMins)} mins`);
        heatBlock.setAttribute("data-tooltip-position", "top");
        heatBlock.onmouseenter = () => heatBlock.style.transform = "scale(1.3) translateY(-2px)";
        heatBlock.onmouseleave = () => heatBlock.style.transform = "scale(1) translateY(0)";
      }
    }
    for (let i = -pastDaysToShow; i <= daysToMax + futureBufferDays; i += 7) {
      if (i === 0) continue;
      const tickX = todayX + i * pxPerDay;
      const dateStr = new Date(todayMs + i * msInDay).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      track.createDiv({ attr: { style: `position: absolute; left: ${tickX}px; top: ${axisY - 5}px; width: 1px; height: 10px; background: var(--text-muted); pointer-events: none; z-index: 0;` } });
      track.createDiv({ text: dateStr, attr: { style: `position: absolute; left: ${tickX - 15}px; top: ${axisY + 10}px; font-size: 0.65em; color: var(--text-muted); pointer-events: none;` } });
    }
    const todayLine = track.createDiv({ attr: { style: `position: absolute; left: ${todayX}px; top: 10px; height: ${trackHeight - 20}px; border-left: 2px dashed var(--interactive-accent); z-index: 0; pointer-events: none;` } });
    todayLine.createDiv({ text: "Hoy", attr: { style: "position: absolute; top: -15px; left: -10px; font-size: 0.75em; color: var(--interactive-accent); font-weight: bold; background: var(--background-primary); padding: 0 4px;" } });
    const tlLayout = ((_b = dbData.workspaces) == null ? void 0 : _b[dbData.activeWorkspaceIndex || 0]) || dbData.layout || {};
    if (tlLayout.timelineTaskNotes) {
      (async () => {
        var _a2, _b2, _c;
        try {
          const config = await this.getTaskNotesConfig();
          const reqHeaders = { "Content-Type": "application/json" };
          if (config.token) reqHeaders["Authorization"] = `Bearer ${config.token}`;
          const timelineTasksRes = await (0, import_obsidian7.requestUrl)({
            url: `http://127.0.0.1:${config.port}/api/tasks/query`,
            method: "POST",
            headers: reqHeaders,
            // 👈 Cabeceras seguras
            body: JSON.stringify({
              type: "group",
              id: "root",
              conjunction: "and",
              children: [{ type: "condition", id: "c1", property: "status", operator: "is", value: "open" }]
            })
          });
          if (timelineTasksRes.status === 200 && ((_a2 = timelineTasksRes.json) == null ? void 0 : _a2.success) && ((_c = (_b2 = timelineTasksRes.json) == null ? void 0 : _b2.data) == null ? void 0 : _c.tasks)) {
            const tasksByDay = /* @__PURE__ */ new Map();
            timelineTasksRes.json.data.tasks.forEach((task) => {
              if (!task.due) return;
              if (tlLayout.timelineCornellOnly) {
                if (!task.tags || !task.tags.some((t) => t.toLowerCase() === "cornell")) return;
              }
              const taskTimeMs = new Date(task.due).getTime();
              const daysFromToday = Math.ceil((taskTimeMs - todayMs) / msInDay);
              if (daysFromToday >= -pastDaysToShow && daysFromToday <= daysToMax + futureBufferDays) {
                if (!tasksByDay.has(daysFromToday)) tasksByDay.set(daysFromToday, []);
                tasksByDay.get(daysFromToday).push(task);
              }
            });
            tasksByDay.forEach((tasks, daysFromToday) => {
              const taskX = todayX + daysFromToday * pxPerDay;
              const groupMarker = track.createDiv({
                attr: { style: `position: absolute; left: ${taskX}px; top: ${trackHeight - 40}px; width: 10px; height: 10px; z-index: 3; display: flex; justify-content: center;` }
              });
              if (tasks.length > 1) {
                groupMarker.createDiv({
                  text: `${tasks.length}`,
                  attr: { style: `position: absolute; top: -14px; left: 6px; font-size: 0.65em; background: var(--color-red); color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-weight: bold; pointer-events: none; z-index: 20; box-shadow: 0 1px 2px rgba(0,0,0,0.4);` }
                });
              }
              tasks.forEach((task, index) => {
                const diamondContainer = groupMarker.createDiv({
                  attr: { style: `position: absolute; bottom: 0; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0s; z-index: ${3 + index};` }
                });
                const bgBase = index === 0 ? "var(--color-blue)" : "var(--color-cyan)";
                const diamond = diamondContainer.createDiv({
                  attr: { style: `width: 10px; height: 10px; background: ${bgBase}; transform: rotate(45deg); transition: all 0.2s ease; box-shadow: 0 0 4px rgba(0,0,0,0.5); border: 1px solid var(--background-primary);` }
                });
                diamondContainer.setAttribute("aria-label", `\u{1F4DD} ${task.title}
Vence: ${task.due}`);
                diamondContainer.setAttribute("data-tooltip-position", "top");
                groupMarker.addEventListener("mouseenter", () => {
                  diamondContainer.style.bottom = `${index * 16}px`;
                  diamondContainer.style.zIndex = `${10 + index}`;
                });
                groupMarker.addEventListener("mouseleave", () => {
                  diamondContainer.style.bottom = `0px`;
                  diamondContainer.style.zIndex = `${3 + index}`;
                });
                diamondContainer.onmouseenter = () => {
                  diamond.style.transform = "rotate(45deg) scale(1.6)";
                  diamond.style.background = "var(--interactive-accent)";
                };
                diamondContainer.onmouseleave = () => {
                  diamond.style.transform = "rotate(45deg) scale(1)";
                  diamond.style.background = bgBase;
                };
                diamondContainer.onclick = async (e) => {
                  e.stopPropagation();
                  if (task.path) {
                    const file = this.plugin.app.vault.getAbstractFileByPath(task.path);
                    if (file && file instanceof import_obsidian7.TFile) {
                      await this.plugin.app.workspace.getLeaf(false).openFile(file);
                    } else {
                      new import_obsidian7.Notice("\u26A0\uFE0F No se pudo encontrar el archivo f\xEDsico de la tarea.");
                    }
                  }
                };
              });
            });
          }
        } catch (e) {
        }
      })();
    }
    validExams.forEach((exam, index) => {
      const examDaysFromToday = Math.ceil((exam.examDate - todayMs) / msInDay);
      const examX = todayX + examDaysFromToday * pxPerDay;
      const yPos = index * 40 + 20;
      const color = exam.color || "var(--interactive-accent)";
      const isPast = examDaysFromToday < 0;
      if (!isPast) {
        const barWidth = examDaysFromToday * pxPerDay;
        track.createDiv({ attr: { style: `position: absolute; left: ${todayX}px; top: ${yPos + 6}px; width: ${barWidth}px; height: 8px; border-radius: 4px; background: ${color}; opacity: 0.3; transform-origin: left; animation: growTimelineBar 0.8s ease-out forwards;` } });
      }
      const marker = track.createDiv({ attr: { style: `position: absolute; left: ${examX}px; top: ${yPos}px; display: flex; align-items: center; gap: 8px; z-index: 1;` } });
      marker.createDiv({ attr: { style: `width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid var(--background-primary); box-shadow: 0 0 0 1px ${color}; opacity: ${isPast ? "0.5" : "1"};` } });
      const label = marker.createDiv({
        attr: { style: `font-size: 0.85em; font-weight: bold; color: var(--text-normal); white-space: nowrap; opacity: ${isPast ? "0.5" : "1"}; cursor: pointer; transition: all 0.2s ease; padding: 2px 6px; border-radius: 4px;` }
      });
      label.innerText = `${exam.name} (${examDaysFromToday === 0 ? "Today!" : Math.abs(examDaysFromToday) + (isPast ? " d. ago" : " d. left")})`;
      label.onclick = async () => {
        const safeSubjectName = exam.name.replace(/[\\/:*?"<>|]/g, "");
        const projectFileName = `${safeSubjectName}.md`;
        let file = this.plugin.app.metadataCache.getFirstLinkpathDest(projectFileName, "");
        if (!file) file = this.plugin.app.vault.getAbstractFileByPath(projectFileName);
        if (file && file instanceof import_obsidian7.TFile) {
          await this.plugin.app.workspace.getLeaf(false).openFile(file);
        } else {
          new import_obsidian7.Notice(`\u26A0\uFE0F No se encontr\xF3 la nota del proyecto: ${projectFileName}`);
        }
      };
      (async () => {
        var _a2, _b2, _c, _d;
        const vaultFiles = this.plugin.app.vault.getMarkdownFiles();
        const sources = exam.sources || [];
        const allAttachedNotes = [];
        if (exam.syllabus) {
          exam.syllabus.forEach((t) => {
            if (t.attachedNotes) allAttachedNotes.push(...t.attachedNotes);
          });
        }
        const validFiles = vaultFiles.filter((f) => {
          const isSource = sources.some((src) => f.path.startsWith(src) || f.path === src || f.name === src);
          const isAttached = allAttachedNotes.some((n) => f.path === n || f.name === n || f.name === `${n}.md`);
          return isSource || isAttached;
        });
        let totalFlashcards = 0;
        let newFlashcards = 0;
        let activeNotesCount = 0;
        let totalConfidenceSum = 0;
        let reviewedNotesCount = 0;
        for (const file of validFiles) {
          const content = await this.plugin.app.vault.cachedRead(file);
          const lines = content.split("\n");
          let hasMarginalia = false;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/%%[><](.*?)%%/)) {
              hasMarginalia = true;
              if (lines[i].includes(";;")) {
                totalFlashcards++;
                const blockIdMatch = lines[i].match(/\^([a-zA-Z0-9]+)\s*$/);
                const blockId = blockIdMatch ? blockIdMatch[1] : `${file.basename}-L${i}`;
                const reviewData = (_b2 = (_a2 = this.plugin.settings.userStats) == null ? void 0 : _a2.rhizomeReviews) == null ? void 0 : _b2[blockId];
                if (!reviewData || reviewData.lastReviewed === 0) {
                  newFlashcards++;
                }
              }
            }
          }
          const isAttached = allAttachedNotes.some((n) => file.path === n || file.name === n || file.name === `${n}.md`);
          if (hasMarginalia || isAttached) {
            activeNotesCount++;
            const readingData = (_d = (_c = this.plugin.settings.userStats) == null ? void 0 : _c.activeReading) == null ? void 0 : _d[file.path];
            if (readingData && readingData.confidence) {
              reviewedNotesCount++;
              totalConfidenceSum += readingData.confidence;
            }
          }
        }
        let displayPct = 0;
        let displayLabel = "";
        if (totalFlashcards > 0) {
          const reviewedNotes = totalFlashcards - newFlashcards;
          displayPct = Math.round(reviewedNotes / totalFlashcards * 100);
          displayLabel = `\u{1F4CA} Mastery: ${displayPct}%
\u{1F5C2}\uFE0F Flashcards: ${reviewedNotes}/${totalFlashcards}`;
        } else if (activeNotesCount > 0) {
          displayPct = reviewedNotesCount > 0 ? Math.round(totalConfidenceSum / reviewedNotesCount / 10 * 100) : 0;
          displayLabel = `\u{1F4D6} Confidence: ${displayPct}%
\u{1F4DD} Notes: ${reviewedNotesCount}/${activeNotesCount}`;
        } else {
          displayLabel = `Sin contenido para evaluar`;
        }
        if (totalFlashcards > 0 || activeNotesCount > 0) {
          let masteryColor = "var(--color-red)";
          if (displayPct >= 30) masteryColor = "var(--color-orange)";
          if (displayPct >= 50) masteryColor = "var(--color-yellow)";
          if (displayPct >= 75) masteryColor = "var(--color-green)";
          if (displayPct >= 90) masteryColor = "var(--color-cyan)";
          label.style.color = masteryColor;
          label.setAttribute("aria-label", displayLabel);
          label.setAttribute("data-tooltip-position", "top");
          label.onmouseenter = () => {
            label.style.textShadow = `0 0 10px ${masteryColor}`;
            label.style.transform = "scale(1.05) translateX(5px)";
            label.style.background = "var(--background-secondary-alt)";
          };
          label.onmouseleave = () => {
            label.style.textShadow = "none";
            label.style.transform = "scale(1) translateX(0)";
            label.style.background = "transparent";
          };
        } else {
          label.setAttribute("aria-label", displayLabel);
          label.setAttribute("data-tooltip-position", "top");
          label.onmouseenter = () => {
            label.style.transform = "scale(1.05) translateX(5px)";
            label.style.color = color;
          };
          label.onmouseleave = () => {
            label.style.transform = "scale(1) translateX(0)";
            label.style.color = "var(--text-normal)";
          };
        }
      })();
    });
  }
  async onOpen() {
    var _a, _b, _c, _d, _e;
    const container = this.containerEl.children[1];
    container.empty();
    const dbData = this.plugin.settings.dashboardData || {};
    if (!dbData.workspaces || !Array.isArray(dbData.workspaces)) {
      dbData.workspaces = [];
      let legacyLayout = dbData.layout || {
        timeline: true,
        planner: true,
        subjects: true,
        tracker: true,
        dailyNote: false,
        colOrder: ["planner", "subjects", "tracker"],
        timelinePos: "top",
        timelineStart: 0,
        timelineSpan: 3,
        editMode: false,
        // OPCIONES DE TASKNOTES (por defecto apagadas)
        plannerTaskNotes: false,
        timelineTaskNotes: false,
        subjectsTaskNotes: false
      };
      dbData.workspaces.push(legacyLayout);
      dbData.activeWorkspaceIndex = 0;
    }
    if (dbData.activeWorkspaceIndex === void 0 || dbData.activeWorkspaceIndex >= dbData.workspaces.length) {
      dbData.activeWorkspaceIndex = 0;
    }
    let layout = dbData.workspaces[dbData.activeWorkspaceIndex];
    dbData.layout = layout;
    const headerSection = container.createDiv({ attr: { style: "display: flex; flex-direction: column; margin-bottom: 10px;" } });
    const workspaceBar = headerSection.createDiv({
      attr: { style: "display: flex; gap: 6px; padding: 4px 6px; background: var(--background-secondary-alt); border: 1px solid var(--background-modifier-border); border-radius: 6px; width: fit-content; align-self: flex-start; margin-bottom: 8px;" }
    });
    dbData.workspaces.forEach((wsLayout, index) => {
      const wsBtn = workspaceBar.createEl("button", { text: `${index + 1}` });
      wsBtn.title = `Workspace ${index + 1}
Click Izquierdo: Cargar
Click Derecho: Eliminar`;
      wsBtn.style.padding = "2px 10px";
      wsBtn.style.border = "none";
      wsBtn.style.cursor = "pointer";
      wsBtn.style.borderRadius = "4px";
      wsBtn.style.fontFamily = "monospace";
      wsBtn.style.fontWeight = "bold";
      wsBtn.style.fontSize = "0.9em";
      if (index === dbData.activeWorkspaceIndex) {
        wsBtn.style.background = "var(--interactive-accent)";
        wsBtn.style.color = "var(--text-on-accent)";
        wsBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      } else {
        wsBtn.style.background = "transparent";
        wsBtn.style.color = "var(--text-muted)";
        wsBtn.onmouseenter = () => wsBtn.style.background = "var(--background-modifier-hover)";
        wsBtn.onmouseleave = () => wsBtn.style.background = "transparent";
      }
      wsBtn.onclick = async () => {
        dbData.activeWorkspaceIndex = index;
        await this.plugin.saveSettings();
        this.onOpen();
      };
      wsBtn.oncontextmenu = async (e) => {
        e.preventDefault();
        if (dbData.workspaces.length === 1) {
          new import_obsidian7.Notice("No puedes eliminar el \xFAltimo workspace.");
          return;
        }
        dbData.workspaces.splice(index, 1);
        if (dbData.activeWorkspaceIndex >= dbData.workspaces.length) {
          dbData.activeWorkspaceIndex = Math.max(0, dbData.workspaces.length - 1);
        }
        await this.plugin.saveSettings();
        this.onOpen();
      };
    });
    const addWsBtn = workspaceBar.createEl("button", { title: "Duplicar dise\xF1o actual como nuevo Workspace" });
    (0, import_obsidian7.setIcon)(addWsBtn, "plus");
    addWsBtn.style.padding = "2px 6px";
    addWsBtn.style.border = "none";
    addWsBtn.style.background = "transparent";
    addWsBtn.style.color = "var(--text-muted)";
    addWsBtn.style.cursor = "pointer";
    addWsBtn.onmouseenter = () => addWsBtn.style.color = "var(--interactive-accent)";
    addWsBtn.onmouseleave = () => addWsBtn.style.color = "var(--text-muted)";
    addWsBtn.onclick = async () => {
      const newLayout = JSON.parse(JSON.stringify(layout));
      dbData.workspaces.push(newLayout);
      dbData.activeWorkspaceIndex = dbData.workspaces.length - 1;
      await this.plugin.saveSettings();
      this.onOpen();
      new import_obsidian7.Notice(`Workspace ${dbData.workspaces.length} creado!`);
    };
    const toolbarRow = headerSection.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; padding-right: 10px;" } });
    toolbarRow.createEl("h1", { text: "Smart study", attr: { style: "margin: 0; font-size: 1.2em; color: var(--text-muted);" } });
    const toolbar = toolbarRow.createDiv({ attr: { style: "display: flex; gap: 8px;" } });
    const createToggle = (key, icon, tooltip, isCol = true) => {
      const btn = toolbar.createEl("button", { title: tooltip, attr: { style: "background: transparent; box-shadow: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px;" } });
      (0, import_obsidian7.setIcon)(btn, icon);
      btn.style.opacity = layout[key] ? "1" : "0.3";
      btn.style.color = layout[key] ? "var(--interactive-accent)" : "var(--text-muted)";
      btn.onclick = async () => {
        if (!layout[key]) {
          if (isCol && layout.colOrder.length >= 3) {
            new import_obsidian7.Notice("\u26A0\uFE0F Maximum 3 column widgets allowed. Deactivate one first.");
            return;
          }
          layout[key] = true;
          if (isCol) layout.colOrder.push(key);
        } else {
          layout[key] = false;
          if (isCol) layout.colOrder = layout.colOrder.filter((k) => k !== key);
        }
        await this.plugin.saveSettings();
        this.onOpen();
      };
    };
    createToggle("timeline", "git-commit", "Toggle Timeline", false);
    createToggle("planner", "calendar", "Toggle Daily Planner");
    createToggle("subjects", "library", "Toggle Subjects");
    createToggle("tracker", "bar-chart-2", "Toggle Tracker");
    createToggle("dailyNote", "file-edit", "Toggle Daily Note");
    const editBtn = toolbar.createEl("button", { title: "Edit Layout", attr: { style: "margin-left: 10px; background: transparent; box-shadow: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px;" } });
    (0, import_obsidian7.setIcon)(editBtn, "layout");
    editBtn.style.color = layout.editMode ? "var(--color-orange)" : "var(--text-muted)";
    editBtn.onclick = async () => {
      layout.editMode = !layout.editMode;
      await this.plugin.saveSettings();
      this.onOpen();
    };
    const dashboardMain = container.createEl("div", { cls: "cornell-ultimate-dashboard" });
    dashboardMain.style.display = "grid";
    dashboardMain.style.gridTemplateColumns = "repeat(3, 1fr)";
    dashboardMain.style.gridTemplateRows = layout.timelinePos === "top" ? "auto 1fr" : "1fr auto";
    const activeCols = layout.colOrder.filter((id) => layout[id] && id !== "timeline");
    const widgetCoords = {};
    if (activeCols.length >= 3) {
      widgetCoords[activeCols[0]] = { colStart: 1, colEnd: 2, rowStart: 0, rowEnd: 0 };
      widgetCoords[activeCols[1]] = { colStart: 2, colEnd: 3, rowStart: 0, rowEnd: 0 };
      widgetCoords[activeCols[2]] = { colStart: 3, colEnd: 4, rowStart: 0, rowEnd: 0 };
    } else if (activeCols.length === 2) {
      widgetCoords[activeCols[0]] = { colStart: 1, colEnd: 3, rowStart: 0, rowEnd: 0 };
      widgetCoords[activeCols[1]] = { colStart: 3, colEnd: 4, rowStart: 0, rowEnd: 0 };
    } else if (activeCols.length === 1) {
      widgetCoords[activeCols[0]] = { colStart: 1, colEnd: 4, rowStart: 0, rowEnd: 0 };
    }
    const timelineRow = layout.timelinePos === "top" ? 1 : 2;
    const widgetsBaseRow = layout.timelinePos === "top" ? 2 : 1;
    const tStart = layout.timelineStart + 1;
    const tEnd = tStart + layout.timelineSpan;
    for (const widgetId of activeCols) {
      const coords = widgetCoords[widgetId];
      coords.rowStart = widgetsBaseRow;
      coords.rowEnd = widgetsBaseRow + 1;
      const overlapsWithTimeline = layout.timeline && (coords.colStart < tEnd && coords.colEnd > tStart);
      if (!overlapsWithTimeline) {
        if (layout.timelinePos === "top") {
          coords.rowStart = 1;
        } else {
          coords.rowEnd = 3;
        }
      }
    }
    const timelineContainer = dashboardMain.createEl("div", { cls: "dashboard-timeline-container" });
    if (!layout.timeline) {
      timelineContainer.style.display = "none";
    } else {
      timelineContainer.style.gridColumn = `${tStart} / ${tEnd}`;
      timelineContainer.style.gridRow = `${timelineRow} / ${timelineRow + 1}`;
      timelineContainer.style.minWidth = "0";
    }
    if (layout.editMode && layout.timeline) {
      const tlControls = timelineContainer.createEl("div", {
        attr: { style: "display: flex; gap: 5px; margin-bottom: 5px; background: var(--background-secondary-alt); padding: 4px; border-radius: 4px; align-self: flex-start;" }
      });
      const upBtn = tlControls.createEl("button", { cls: "layout-control-btn", title: "Move Top / Bottom" });
      (0, import_obsidian7.setIcon)(upBtn, "arrow-up-down");
      upBtn.onclick = async () => {
        layout.timelinePos = layout.timelinePos === "top" ? "bottom" : "top";
        await this.plugin.saveSettings();
        this.onOpen();
      };
      tlControls.createEl("span", { attr: { style: "width: 1px; background: var(--background-modifier-border); margin: 0 4px;" } });
      const leftBtn = tlControls.createEl("button", { cls: "layout-control-btn", title: "Hacia la Izquierda" });
      (0, import_obsidian7.setIcon)(leftBtn, "arrow-left");
      leftBtn.disabled = layout.timelineStart === 0 && layout.timelineSpan === 1;
      leftBtn.onclick = async () => {
        if (layout.timelineStart === 2 && layout.timelineSpan === 1) {
          layout.timelineStart = 1;
          layout.timelineSpan = 2;
        } else if (layout.timelineStart === 1 && layout.timelineSpan === 2) {
          layout.timelineStart = 0;
          layout.timelineSpan = 3;
        } else if (layout.timelineStart === 0 && layout.timelineSpan === 3) {
          layout.timelineStart = 0;
          layout.timelineSpan = 2;
        } else if (layout.timelineStart === 0 && layout.timelineSpan === 2) {
          layout.timelineStart = 0;
          layout.timelineSpan = 1;
        }
        await this.plugin.saveSettings();
        this.onOpen();
      };
      const rightBtn = tlControls.createEl("button", { cls: "layout-control-btn", title: "Hacia la Derecha" });
      (0, import_obsidian7.setIcon)(rightBtn, "arrow-right");
      rightBtn.disabled = layout.timelineStart === 2 && layout.timelineSpan === 1;
      rightBtn.onclick = async () => {
        if (layout.timelineStart === 0 && layout.timelineSpan === 1) {
          layout.timelineStart = 0;
          layout.timelineSpan = 2;
        } else if (layout.timelineStart === 0 && layout.timelineSpan === 2) {
          layout.timelineStart = 0;
          layout.timelineSpan = 3;
        } else if (layout.timelineStart === 0 && layout.timelineSpan === 3) {
          layout.timelineStart = 1;
          layout.timelineSpan = 2;
        } else if (layout.timelineStart === 1 && layout.timelineSpan === 2) {
          layout.timelineStart = 2;
          layout.timelineSpan = 1;
        }
        await this.plugin.saveSettings();
        this.onOpen();
      };
      tlControls.createEl("span", { attr: { style: "width: 1px; background: var(--background-modifier-border); margin: 0 4px;" } });
      const tnToggle = tlControls.createEl("button", {
        cls: "layout-control-btn",
        title: "Toggle TaskNotes Integration",
        text: layout.timelineTaskNotes ? "\u2705 TaskNotes" : "\u274C TaskNotes",
        attr: { style: layout.timelineTaskNotes ? "color: var(--color-green);" : "color: var(--text-muted);" }
      });
      tnToggle.onclick = async () => {
        layout.timelineTaskNotes = !layout.timelineTaskNotes;
        await this.plugin.saveSettings();
        this.onOpen();
      };
      tlControls.createEl("span", { attr: { style: "width: 1px; background: var(--background-modifier-border); margin: 0 4px;" } });
      const cornellToggle = tlControls.createEl("button", {
        cls: "layout-control-btn",
        title: "Mostrar SOLO tareas con el tag #cornell",
        text: layout.timelineCornellOnly ? "\u{1F393} Solo Cornell" : "\u{1F310} Todas las Tareas",
        attr: { style: layout.timelineCornellOnly ? "color: var(--color-purple);" : "color: var(--text-muted);" }
      });
      cornellToggle.onclick = async () => {
        layout.timelineCornellOnly = !layout.timelineCornellOnly;
        await this.plugin.saveSettings();
        this.onOpen();
      };
    }
    const timelineCanvas = timelineContainer.createEl("div", { attr: { style: "width: 100%; min-height: 0;" } });
    this.renderTimeline(timelineCanvas);
    const createWidgetCol = (id, clsName) => {
      const col = dashboardMain.createEl("div", { cls: `dashboard-col ${clsName}` });
      if (!layout[id]) {
        col.style.display = "none";
      } else if (widgetCoords[id]) {
        const coords = widgetCoords[id];
        col.style.gridColumn = `${coords.colStart} / ${coords.colEnd}`;
        col.style.gridRow = `${coords.rowStart} / ${coords.rowEnd}`;
      }
      if (layout.editMode && layout[id]) {
        const swapCols = async (idxA, idxB) => {
          const temp = layout.colOrder[idxA];
          layout.colOrder[idxA] = layout.colOrder[idxB];
          layout.colOrder[idxB] = temp;
          await this.plugin.saveSettings();
          this.onOpen();
        };
        const ctrlRow = col.createDiv({ attr: { style: "display: flex; justify-content: space-between; gap: 5px; margin-bottom: 5px; background: var(--background-secondary-alt); padding: 4px; border-radius: 4px;" } });
        const integrationZone = ctrlRow.createDiv({ attr: { style: "display: flex; gap: 5px;" } });
        if (id === "planner" || id === "subjects") {
          const tnKey = id + "TaskNotes";
          const tnToggle = integrationZone.createEl("button", {
            cls: "layout-control-btn",
            title: "Enable/Disable TaskNotes",
            text: layout[tnKey] ? "\u2705 TaskNotes" : "\u274C TaskNotes",
            attr: { style: layout[tnKey] ? "color: var(--color-green); font-size: 0.8em;" : "color: var(--text-muted); font-size: 0.8em;" }
          });
          tnToggle.onclick = async () => {
            layout[tnKey] = !layout[tnKey];
            await this.plugin.saveSettings();
            this.onOpen();
          };
        }
        const moveZone = ctrlRow.createDiv({ attr: { style: "display: flex; gap: 5px;" } });
        const idx = layout.colOrder.indexOf(id);
        if (idx > 0) {
          const lBtn = moveZone.createEl("button", { cls: "layout-control-btn", title: "Move Left" });
          (0, import_obsidian7.setIcon)(lBtn, "arrow-left");
          lBtn.onclick = () => swapCols(idx, idx - 1);
        }
        if (idx < layout.colOrder.length - 1) {
          const rBtn = moveZone.createEl("button", { cls: "layout-control-btn", title: "Move Right" });
          (0, import_obsidian7.setIcon)(rBtn, "arrow-right");
          rBtn.onclick = () => swapCols(idx, idx + 1);
        }
      }
      return col;
    };
    const plannerCol = createWidgetCol("planner", "dashboard-planner");
    const subjectsCol = createWidgetCol("subjects", "dashboard-subjects");
    const trackerCol = createWidgetCol("tracker", "dashboard-tracker");
    const dailyNoteCol = createWidgetCol("dailyNote", "dashboard-dailyNote");
    if (layout.planner) {
      const dailyHeader = plannerCol.createDiv({ cls: "daily-planner-header" });
      dailyHeader.createEl("h2", { text: "Today's Plan" });
      const openWeeklyBtn = dailyHeader.createEl("button", { title: "Open Weekly Schedule", cls: "cornell-action-btn" });
      (0, import_obsidian7.setIcon)(openWeeklyBtn, "calendar-days");
      openWeeklyBtn.onclick = () => {
        new WeeklyPlannerModal(this.plugin.app, this.plugin, () => {
          this.onOpen();
        }).open();
      };
      const modeSelector = plannerCol.createDiv({ attr: { style: "display: flex; gap: 5px; margin-bottom: 15px; background: var(--background-secondary-alt); padding: 4px; border-radius: 8px;" } });
      const createModeBtn = (id, iconName, label) => {
        const btn = modeSelector.createEl("button", { attr: { style: "flex-grow: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 0; border-radius: 6px; box-shadow: none; border: none; cursor: pointer;" } });
        const iconSpan = btn.createSpan();
        (0, import_obsidian7.setIcon)(iconSpan, iconName);
        btn.createSpan({ text: label, attr: { style: "font-size: 0.85em; font-weight: bold;" } });
        if (this.currentDayMode === id) {
          btn.style.background = "var(--interactive-accent)";
          btn.style.color = "var(--text-on-accent)";
        } else {
          btn.style.background = "transparent";
          btn.style.color = "var(--text-muted)";
          btn.onmouseenter = () => btn.style.background = "var(--background-modifier-hover)";
          btn.onmouseleave = () => btn.style.background = "transparent";
        }
        btn.onclick = () => {
          this.currentDayMode = id;
          this.onOpen();
        };
      };
      createModeBtn("optimal", "battery-full", "Optimal");
      createModeBtn("regular", "battery-medium", "Regular");
      createModeBtn("survival", "battery-low", "Survival");
      createModeBtn("custom", "sliders", "Custom");
      const dailyTimelineContainer = plannerCol.createDiv({ cls: "daily-timeline-container" });
      const todayDate = /* @__PURE__ */ new Date();
      const todayDayOfWeek = todayDate.getDay();
      const todayKey = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
      const allBlocks = dbData.routineBlocks || [];
      if (!dbData.customDays) dbData.customDays = {};
      let todaysBlocks = [];
      if (this.currentDayMode === "custom") todaysBlocks = dbData.customDays[todayKey] || [];
      else todaysBlocks = allBlocks.filter((b) => b.dayOfWeek === todayDayOfWeek && (b.mode === this.currentDayMode || !b.mode && this.currentDayMode === "optimal"));
      const activeSubjects = dbData.subjects || [];
      const vaultFiles = this.plugin.app.vault.getMarkdownFiles();
      const nowMs = Date.now();
      const dynamicBlocks = [];
      for (const subject of activeSubjects) {
        const sources = subject.sources || [];
        const validFiles = vaultFiles.filter((f) => sources.some((src) => f.path.startsWith(src) || f.path === src || f.name === src));
        let overdueCount = 0;
        for (const file of validFiles) {
          const content = await this.plugin.app.vault.cachedRead(file);
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/%%[><](.*?)%%/)) {
              const blockIdMatch = lines[i].match(/\^([a-zA-Z0-9]+)\s*$/);
              const blockId = blockIdMatch ? blockIdMatch[1] : `${file.basename}-L${i}`;
              const reviewData = (_a = this.plugin.settings.userStats.rhizomeReviews) == null ? void 0 : _a[blockId];
              if (!reviewData || reviewData.lastReviewed === 0) overdueCount++;
              else if (nowMs >= reviewData.lastReviewed + reviewData.interval * 24 * 60 * 60 * 1e3) overdueCount++;
            }
          }
        }
        if (overdueCount > 0) dynamicBlocks.push({ id: `auto-${subject.id}`, dayOfWeek: todayDayOfWeek, startTime: "AUTO", endTime: "SRS", type: "review", title: `\u{1F525} Review: ${subject.name}`, subtitle: `${overdueCount} pending cards`, isAuto: true, subject });
      }
      if (layout.plannerTaskNotes) {
        try {
          const config = await this.getTaskNotesConfig();
          const reqHeaders = { "Content-Type": "application/json" };
          if (config.token) reqHeaders["Authorization"] = `Bearer ${config.token}`;
          const tasksResponse = await (0, import_obsidian7.requestUrl)({
            url: `http://127.0.0.1:${config.port}/api/tasks/query`,
            method: "POST",
            headers: reqHeaders,
            // 👈 Cabeceras seguras
            body: JSON.stringify({
              type: "group",
              id: "root",
              conjunction: "and",
              children: [{ type: "condition", id: "c1", property: "status", operator: "is", value: "open" }]
            })
          });
          if (tasksResponse.status === 200 && ((_b = tasksResponse.json) == null ? void 0 : _b.success) && ((_d = (_c = tasksResponse.json) == null ? void 0 : _c.data) == null ? void 0 : _d.tasks)) {
            const externalTasks = tasksResponse.json.data.tasks;
            const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            externalTasks.forEach((task) => {
              const isToday = task.due && task.due.startsWith(todayStr) || task.scheduled && task.scheduled.startsWith(todayStr);
              if (isToday) {
                let start = "AUTO";
                let end = "TASK";
                let isAuto = true;
                const timeMatch = (task.scheduled || task.due || "").match(/T(\d{2}:\d{2})/);
                if (timeMatch) {
                  start = timeMatch[1];
                  const [h, m] = start.split(":").map(Number);
                  const durationMins = task.timeEstimate ? parseInt(task.timeEstimate, 10) : 60;
                  const totalEndMins = h * 60 + m + durationMins;
                  const endH = Math.floor(totalEndMins / 60) % 24;
                  const endM = totalEndMins % 60;
                  end = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
                  isAuto = false;
                }
                dynamicBlocks.push({
                  id: `tasknote-${task.id || Math.random()}`,
                  dayOfWeek: todayDayOfWeek,
                  startTime: start,
                  endTime: end,
                  type: "study",
                  title: `\u{1F4DD} ${task.title}`,
                  subtitle: "TaskNotes",
                  isAuto,
                  isTaskNote: true,
                  // 
                  subject: null,
                  path: task.path
                });
              }
            });
          }
        } catch (error) {
          console.debug("[Cornell Marginalia] Fall\xF3 lectura de API TaskNotes para el Planner.");
        }
      }
      todaysBlocks = [...dynamicBlocks, ...todaysBlocks].sort((a, b) => (a.isAuto ? "00:00" : a.startTime).localeCompare(b.isAuto ? "00:00" : b.startTime));
      if (todaysBlocks.length === 0) {
        dailyTimelineContainer.createEl("p", { text: "No tasks scheduled for today.", cls: "text-muted", attr: { style: "text-align: center; margin-top: 20px; font-style: italic;" } });
        const demoBtn = dailyTimelineContainer.createEl("button", { text: "\u{1F9EA} Inject Demo Routine", cls: "mod-cta" });
        demoBtn.onclick = async () => {
          dbData.routineBlocks = [
            { id: "1", dayOfWeek: todayDayOfWeek, startTime: "08:00", endTime: "10:00", type: "class", title: "Anatomy Lecture" },
            { id: "4", dayOfWeek: todayDayOfWeek, startTime: "18:00", endTime: "19:00", type: "review", title: "Flashcards SRS" }
          ];
          await this.plugin.saveSettings();
          this.onOpen();
        };
      } else {
        todaysBlocks.forEach((block) => {
          const blockEl = dailyTimelineContainer.createDiv({ cls: `daily-block type-${block.type}` });
          if (block.isAuto) {
            blockEl.dataset.startMins = "0";
            blockEl.dataset.endMins = "0";
            blockEl.classList.add("is-current");
            blockEl.style.border = "1px solid var(--color-orange)";
          } else {
            const [startH, startM] = block.startTime.split(":").map(Number);
            const [endH, endM] = block.endTime.split(":").map(Number);
            blockEl.dataset.startMins = (startH * 60 + startM).toString();
            blockEl.dataset.endMins = (endH * 60 + endM).toString();
          }
          if (block.path) {
            blockEl.style.cursor = "pointer";
            blockEl.onclick = async () => {
              const file = this.plugin.app.vault.getAbstractFileByPath(block.path);
              if (file && file instanceof import_obsidian7.TFile) {
                await this.plugin.app.workspace.getLeaf(false).openFile(file);
              }
            };
          } else if (block.isAuto) {
            blockEl.style.cursor = "pointer";
            blockEl.onclick = () => {
              new ReviewSessionManager(this.plugin, block.subject, false).start();
            };
          }
          let blockColor = "var(--interactive-accent)";
          if (block.type === "study") blockColor = "var(--color-blue)";
          if (block.type === "review") blockColor = "var(--color-orange)";
          if (block.type === "class") blockColor = "var(--color-purple)";
          if (block.type === "break") blockColor = "var(--color-green)";
          blockEl.style.setProperty("--block-color", blockColor);
          const timeCol = blockEl.createDiv({ cls: "daily-block-time" });
          timeCol.createDiv({ text: block.startTime, cls: "time-start", attr: { style: block.isAuto ? "color: var(--color-orange); font-weight: bold;" : "" } });
          timeCol.createDiv({ text: block.endTime, cls: "time-end" });
          if (this.currentDayMode === "custom" && !block.isAuto) {
            const delBtn = timeCol.createDiv({ text: "\xD7", attr: { style: "color: var(--text-error); cursor: pointer; font-size: 1.2em; text-align: right; margin-top: 5px;" } });
            delBtn.onclick = async (e) => {
              e.stopPropagation();
              dbData.customDays[todayKey] = dbData.customDays[todayKey].filter((b) => b.id !== block.id);
              await this.plugin.saveSettings();
              this.onOpen();
            };
          }
          const nodeCol = blockEl.createDiv({ cls: "daily-block-node" });
          const iconContainer = nodeCol.createDiv({ cls: "daily-block-icon" });
          if (block.isTaskNote && !block.isAuto) {
            blockEl.style.borderLeft = "2px dashed var(--color-blue)";
            blockEl.style.background = "var(--background-primary)";
            blockEl.style.boxShadow = "none";
            iconContainer.style.width = "20px";
            iconContainer.style.height = "20px";
            iconContainer.style.minWidth = "20px";
            iconContainer.style.padding = "3px";
            blockEl.classList.add("is-sub-task");
          }
          let iconName = "check-square";
          if (block.type === "study") iconName = "book-open";
          if (block.type === "review") iconName = "refresh-cw";
          if (block.type === "class") iconName = "graduation-cap";
          if (block.type === "break") iconName = "coffee";
          if (block.isTaskNote) iconName = "check-circle";
          if (block.isAuto && !block.isTaskNote) iconName = "zap";
          if (block.type === "study") iconName = "book-open";
          if (block.type === "review") iconName = "refresh-cw";
          if (block.type === "class") iconName = "graduation-cap";
          if (block.type === "break") iconName = "coffee";
          if (block.isAuto) iconName = "zap";
          (0, import_obsidian7.setIcon)(iconContainer, iconName);
          const contentCol = blockEl.createDiv({ cls: "daily-block-content" });
          contentCol.createDiv({ text: block.title, cls: "daily-block-title" });
          contentCol.createDiv({ text: block.subtitle ? block.subtitle : block.type.charAt(0).toUpperCase() + block.type.slice(1) + " Session", cls: "daily-block-subtitle" });
        });
        const updateTimeline = () => {
          if (!document.body.contains(dailyTimelineContainer)) return;
          const d = /* @__PURE__ */ new Date();
          const currentMins = d.getHours() * 60 + d.getMinutes();
          dailyTimelineContainer.querySelectorAll(".daily-block").forEach((node) => {
            const el = node;
            const startTotal = parseInt(el.dataset.startMins || "0");
            const endTotal = parseInt(el.dataset.endMins || "0");
            let progress = 0;
            if (currentMins >= endTotal) {
              progress = 100;
              el.classList.add("is-past");
              el.classList.remove("is-current", "is-future");
            } else if (currentMins < startTotal) {
              progress = 0;
              el.classList.add("is-future");
              el.classList.remove("is-past", "is-current");
            } else {
              progress = (currentMins - startTotal) / (endTotal - startTotal) * 100;
              el.classList.add("is-current");
              el.classList.remove("is-past", "is-future");
            }
            el.style.setProperty("--progress", `${progress}%`);
          });
        };
        updateTimeline();
        this.plugin.registerInterval(window.setInterval(updateTimeline, 6e4));
      }
      if (this.currentDayMode === "custom") {
        const customActions = dailyTimelineContainer.createDiv({ attr: { style: "display: flex; gap: 10px; margin-top: 15px; justify-content: center;" } });
        if (todaysBlocks.filter((b) => !b.isAuto).length === 0) {
          const cloneBtn = customActions.createEl("button", { text: "Clone Optimal Plan" });
          cloneBtn.onclick = async () => {
            const optimalBlocks = allBlocks.filter((b) => b.dayOfWeek === todayDayOfWeek && (b.mode === "optimal" || !b.mode));
            dbData.customDays[todayKey] = JSON.parse(JSON.stringify(optimalBlocks)).map((b) => ({ ...b, id: Math.random().toString(36).substring(2, 9) }));
            await this.plugin.saveSettings();
            this.onOpen();
          };
        }
        const addBtn = customActions.createEl("button", { text: "Add Custom Block", cls: "mod-cta" });
        addBtn.onclick = () => {
          new CustomBlockModal(this.plugin.app, this.plugin, todayKey, () => this.onOpen()).open();
        };
      }
    }
    if (layout.subjects) {
      const midHeader = subjectsCol.createDiv({ cls: "daily-planner-header" });
      midHeader.createEl("h2", { text: "\u{1F4DA} Subjects & Resources" });
      const addSubjectBtn = midHeader.createEl("button", { title: "Add Subject", cls: "cornell-action-btn" });
      (0, import_obsidian7.setIcon)(addSubjectBtn, "plus-circle");
      addSubjectBtn.onclick = () => {
        new SubjectEditorModal(this.plugin.app, this.plugin, null, () => this.onOpen()).open();
      };
      const subjectsContainer = subjectsCol.createDiv({ cls: "subjects-container" });
      const subjectsList = dbData.subjects || [];
      if (subjectsList.length === 0) {
        subjectsContainer.createEl("p", { text: "No subjects yet.", cls: "text-muted", attr: { style: "text-align: center; font-style: italic; margin-top: 20px;" } });
      } else {
        subjectsList.forEach((subject) => {
          const subjCard = subjectsContainer.createDiv({ cls: "subject-card" });
          subjCard.style.borderLeft = `4px solid ${subject.color || "var(--interactive-accent)"}`;
          const subjHeader = subjCard.createDiv({ cls: "subject-header" });
          subjHeader.createDiv({ cls: "subject-title", text: subject.name });
          const subjActions = subjHeader.createDiv({ cls: "subject-actions" });
          const sEditBtn = subjActions.createSpan({ cls: "subject-action-icon", title: "Edit" });
          (0, import_obsidian7.setIcon)(sEditBtn, "edit");
          sEditBtn.onclick = () => new SubjectEditorModal(this.plugin.app, this.plugin, subject, () => this.onOpen()).open();
          const delBtn = subjActions.createSpan({ cls: "subject-action-icon", title: "Delete" });
          (0, import_obsidian7.setIcon)(delBtn, "trash");
          delBtn.onclick = async () => {
            dbData.subjects = subjectsList.filter((s) => s.id !== subject.id);
            await this.plugin.saveSettings();
            this.onOpen();
          };
          const daysLeft = Math.ceil((subject.examDate - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
          const countdownEl = subjCard.createDiv({ cls: "subject-countdown", text: daysLeft > 0 ? `\u23F3 ${daysLeft} days until exam` : daysLeft === 0 ? "\u{1F525} Exam is TODAY!" : "\u2705 Exam passed" });
          if (daysLeft <= 7 && daysLeft > 0) countdownEl.style.color = "var(--color-red)";
          const foldersDiv = subjCard.createDiv({ cls: "subject-folders" });
          const sourcesArray = [...subject.sources || subject.resourceFolders || []].sort((a, b) => {
            const getWeight = (path) => {
              const lowerPath = path.toLowerCase();
              if (lowerPath.endsWith(".pdf")) return 1;
              if (lowerPath.endsWith(".canvas")) return 2;
              if (lowerPath.endsWith(".excalidraw") || lowerPath.endsWith(".excalidraw.md")) return 3;
              if (lowerPath.endsWith(".md")) return 4;
              return 0;
            };
            const weightA = getWeight(a);
            const weightB = getWeight(b);
            return weightA !== weightB ? weightA - weightB : a.localeCompare(b);
          });
          sourcesArray.forEach((src) => {
            let iconName = "folder";
            let isFile = false;
            const lowerSrc = src.toLowerCase();
            if (lowerSrc.endsWith(".pdf")) {
              iconName = "file-text";
              isFile = true;
            } else if (lowerSrc.endsWith(".canvas")) {
              iconName = "layout-dashboard";
              isFile = true;
            } else if (lowerSrc.endsWith(".excalidraw") || lowerSrc.endsWith(".excalidraw.md")) {
              iconName = "pen-tool";
              isFile = true;
            } else if (lowerSrc.endsWith(".md")) {
              iconName = "file";
              isFile = true;
            }
            const chip = foldersDiv.createSpan({ cls: "folder-chip", attr: { style: "display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px;" } });
            const iconSpan = chip.createSpan({ attr: { style: "display: flex;" } });
            (0, import_obsidian7.setIcon)(iconSpan, iconName);
            const svg = iconSpan.querySelector("svg");
            if (svg) {
              svg.style.width = "14px";
              svg.style.height = "14px";
            }
            chip.createSpan({ text: src.split("/").pop() || src });
            if (isFile) {
              chip.classList.add("is-clickable");
              chip.title = "Click to open file";
              chip.onclick = () => {
                const file = this.plugin.app.metadataCache.getFirstLinkpathDest(src, "");
                if (file) this.plugin.app.workspace.getLeaf(false).openFile(file);
                else new import_obsidian7.Notice(`\u26A0\uFE0F File not found: ${src}`);
              };
            }
          });
          const statsDiv = subjCard.createDiv({ cls: "subject-stats-container" });
          this.calculateSubjectStats(subject, statsDiv);
          const studyActions = subjCard.createDiv({ cls: "subject-study-actions" });
          const reviewBtn = studyActions.createEl("button", { cls: "mod-cta", title: "Start study session" });
          reviewBtn.style.backgroundColor = subject.color || "var(--interactive-accent)";
          reviewBtn.style.color = "#ffffff";
          const reviewIcon = reviewBtn.createSpan();
          (0, import_obsidian7.setIcon)(reviewIcon, "play");
          reviewIcon.style.marginRight = "6px";
          reviewBtn.createSpan({ text: "Review" });
          reviewBtn.onclick = (event) => {
            const menu = new import_obsidian7.Menu();
            menu.addItem((item) => {
              item.setTitle("\u{1F4D6} Active Reading (Holistic)").setIcon("book-open").onClick(() => {
                new ReviewSessionManager(this.plugin, subject, false, null, "reading").start();
              });
            });
            menu.addItem((item) => {
              item.setTitle("\u26A1 Flashcards SRS (Strict)").setIcon("zap").onClick(() => {
                new ReviewSessionManager(this.plugin, subject, false, null, "srs").start();
              });
            });
            menu.showAtMouseEvent(event);
          };
          const cramBtn = studyActions.createEl("button", { title: "Cram Mode (Study regardless of schedule)" });
          const cramIcon = cramBtn.createSpan();
          (0, import_obsidian7.setIcon)(cramIcon, "zap");
          cramIcon.style.marginRight = "6px";
          cramBtn.createSpan({ text: "Cram" });
          cramBtn.onclick = (event) => {
            const menu = new import_obsidian7.Menu();
            menu.addItem((item) => {
              item.setTitle("\u{1F4D6} Active Reading (Cram All)").setIcon("book-open").onClick(() => {
                new ReviewSessionManager(this.plugin, subject, true, null, "reading").start();
              });
            });
            menu.addItem((item) => {
              item.setTitle("\u26A1 Flashcards SRS (Cram All)").setIcon("zap").onClick(() => {
                new ReviewSessionManager(this.plugin, subject, true, null, "srs").start();
              });
            });
            menu.showAtMouseEvent(event);
          };
          if (subject.syllabus && subject.syllabus.length > 0) {
            const syllabusContainer = subjCard.createDiv({ cls: "subject-syllabus-container", attr: { style: "margin-top: 15px; border-top: 1px solid var(--background-modifier-border); padding-top: 10px;" } });
            const syllabusHeader = syllabusContainer.createDiv({ attr: { style: "display: flex; justify-content: space-between; cursor: pointer; align-items: center;" } });
            syllabusHeader.createSpan({ text: `\u{1F4D1} Topics (${subject.syllabus.length})`, attr: { style: "font-weight: bold; font-size: 0.9em; color: var(--text-muted);" } });
            const toggleIcon = syllabusHeader.createSpan({ text: "\u25BC", attr: { style: "font-size: 0.8em; color: var(--text-muted);" } });
            const topicsList = syllabusContainer.createDiv({ cls: "syllabus-topics-list", attr: { style: "display: none; flex-direction: column; gap: 8px; margin-top: 10px;" } });
            syllabusHeader.onclick = () => {
              const isHidden = topicsList.style.display === "none";
              topicsList.style.display = isHidden ? "flex" : "none";
              toggleIcon.innerText = isHidden ? "\u25B2" : "\u25BC";
            };
            subject.syllabus.forEach((topic) => {
              const topicRow = topicsList.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; background: var(--background-secondary-alt); padding: 6px 10px; border-radius: 6px; border: 1px solid var(--background-modifier-border);" } });
              const topicInfo = topicRow.createDiv({ attr: { style: "display: flex; flex-direction: column;" } });
              topicInfo.createSpan({ text: topic.name, attr: { style: "font-size: 0.9em; font-weight: bold; color: var(--text-normal);" } });
              const ruleSpan = topicInfo.createSpan({ text: `Rule: ${topic.rule} (Scanning...)`, attr: { style: "font-size: 0.75em; color: var(--interactive-accent); font-family: monospace;" } });
              const attachmentsDiv = topicInfo.createDiv({ attr: { style: "display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; align-items: center;" } });
              if (topic.taskNoteId && topic.taskNoteId !== "synced") {
                const tnChip = attachmentsDiv.createSpan({ cls: "folder-chip", attr: { style: "display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; font-size: 0.75em; background: var(--color-blue); color: white; border-radius: 4px; cursor: pointer; border: 1px solid var(--background-modifier-border); transition: background 0.3s;" } });
                const iconSpan = tnChip.createSpan();
                (0, import_obsidian7.setIcon)(iconSpan, "check-circle");
                const textSpan = tnChip.createSpan({ text: "TaskNote" });
                (async () => {
                  let pathToOpen = topic.taskNoteId.endsWith(".md") ? topic.taskNoteId : `${topic.taskNoteId}.md`;
                  const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pathToOpen, "");
                  if (file && file instanceof import_obsidian7.TFile) {
                    const content = await this.plugin.app.vault.cachedRead(file);
                    if (/- \[[xX]\]/.test(content) || /status:\s*done/i.test(content) || /status:\s*completed/i.test(content)) {
                      tnChip.style.background = "var(--color-green)";
                      textSpan.innerText = "Done";
                    }
                  }
                })();
                tnChip.onclick = (e) => {
                  e.stopPropagation();
                  let pathToOpen = topic.taskNoteId.endsWith(".md") ? topic.taskNoteId : `${topic.taskNoteId}.md`;
                  const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pathToOpen, "");
                  if (file) this.plugin.app.workspace.getLeaf(false).openFile(file);
                  else new import_obsidian7.Notice("\u26A0\uFE0F No se pudo encontrar el archivo de TaskNote.");
                };
              }
              if (topic.attachedNotes && topic.attachedNotes.length > 0) {
                topic.attachedNotes.forEach((notePath, idx) => {
                  const nChip = attachmentsDiv.createSpan({ cls: "folder-chip", attr: { style: "display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; font-size: 0.75em; border-radius: 4px; cursor: pointer; background: var(--background-secondary);" } });
                  (0, import_obsidian7.setIcon)(nChip.createSpan(), "file-text");
                  nChip.createSpan({ text: notePath.split("/").pop() || notePath });
                  const delBtn2 = nChip.createSpan({ text: "\xD7", attr: { style: "color: var(--text-error); margin-left: 2px; padding: 0 2px;" } });
                  delBtn2.onclick = async (e) => {
                    e.stopPropagation();
                    topic.attachedNotes.splice(idx, 1);
                    await this.plugin.saveSettings();
                    this.onOpen();
                  };
                  nChip.onclick = (e) => {
                    e.stopPropagation();
                    const file = this.plugin.app.metadataCache.getFirstLinkpathDest(notePath, "");
                    if (file) this.plugin.app.workspace.getLeaf(false).openFile(file);
                    else new import_obsidian7.Notice(`\u26A0\uFE0F Nota no encontrada: ${notePath}`);
                  };
                });
              }
              const addBtn = attachmentsDiv.createSpan({ attr: { style: "cursor: pointer; padding: 2px; color: var(--text-muted); display: flex; align-items: center;" } });
              (0, import_obsidian7.setIcon)(addBtn, "plus");
              addBtn.title = "Adjuntar nota a este tema";
              addBtn.onclick = (e) => {
                e.stopPropagation();
                new AttachNoteModal(this.plugin.app, this.plugin, topic, async (noteName) => {
                  if (!topic.attachedNotes) topic.attachedNotes = [];
                  topic.attachedNotes.push(noteName);
                  await this.plugin.saveSettings();
                  this.onOpen();
                }).open();
              };
              (async () => {
                var _a2;
                const validFiles = this.plugin.app.vault.getMarkdownFiles();
                let matchCount = 0;
                const ruleLower = topic.rule ? topic.rule.toLowerCase() : "";
                for (const file of validFiles) {
                  const isAttached = (_a2 = topic.attachedNotes) == null ? void 0 : _a2.some((n) => file.path === n || file.name === n || file.name === `${n}.md`);
                  const content = await this.plugin.app.vault.cachedRead(file);
                  const lines = content.split("\n");
                  for (const line of lines) {
                    const match = line.match(/%%[><](.*?)%%/);
                    if (match) {
                      if (isAttached || ruleLower && match[1].toLowerCase().includes(ruleLower)) {
                        matchCount++;
                      }
                    }
                  }
                }
                ruleSpan.innerText = `Rule: ${topic.rule} \u{1F3AF} ${matchCount} notas`;
                if (matchCount === 0) ruleSpan.style.color = "var(--color-red)";
                else ruleSpan.style.color = "var(--color-green)";
              })();
              const playSubBtn = topicRow.createEl("button", { title: `Cram ${topic.name}`, attr: { style: "padding: 4px 8px; height: auto;" } });
              (0, import_obsidian7.setIcon)(playSubBtn, "zap");
              playSubBtn.onclick = (e) => {
                e.stopPropagation();
                new ReviewSessionManager(this.plugin, subject, true, topic).start();
              };
            });
          }
        });
      }
    }
    if (layout.tracker) {
      trackerCol.createEl("h2", { text: "\u23F3 Daily Tracker" });
      const koreanTracker = trackerCol.createEl("div", { cls: "korean-tracker" });
      const history = dbData.trackerHistory || [];
      const rightNow = /* @__PURE__ */ new Date();
      const startOfDay = new Date(rightNow.getFullYear(), rightNow.getMonth(), rightNow.getDate()).getTime();
      const todaysSessions = history.filter((s) => s.timestamp >= startOfDay);
      const totalMinutes = todaysSessions.length * 25;
      const hours = Math.floor(totalMinutes / 60);
      koreanTracker.createEl("h3", { text: `Total Hoy: ${hours}h ${totalMinutes % 60}m`, cls: "tracker-total" });
      const gridEl = koreanTracker.createEl("div", { cls: "korean-grid" });
      for (let h = 0; h <= 23; h++) {
        const row = gridEl.createEl("div", { cls: "korean-grid-row" });
        row.createEl("div", { cls: "korean-hour", text: `${h}:00` });
        const blocks = row.createEl("div", { cls: "korean-blocks" });
        const sessionsThisHour = todaysSessions.filter((s) => new Date(s.timestamp).getHours() === h);
        for (let m = 0; m < 6; m++) {
          const blockEl = blocks.createEl("div", { cls: "korean-block" });
          const isStudied = sessionsThisHour.some((s) => {
            if (s.durationMinutes === void 0 || s.durationMinutes < 5) return false;
            const startMin = new Date(s.timestamp).getMinutes();
            const startBlock = Math.floor(startMin / 10);
            const blocksToPaint = Math.max(1, Math.ceil(s.durationMinutes / 10));
            return m >= startBlock && m <= startBlock + blocksToPaint - 1;
          });
          if (isStudied) blockEl.addClass("studied");
        }
        const objectiveEl = row.createEl("div", { cls: "korean-objective" });
        if (sessionsThisHour.length > 0) {
          const objectives = sessionsThisHour.map((s) => s.objective).filter(Boolean);
          objectiveEl.innerText = objectives.length > 0 ? `\u{1F3AF} ${objectives.join(" / ")}` : `\u{1F3AF} Focus Session`;
        }
      }
      trackerCol.createEl("h2", { text: "\u{1F9E0} Needs Review", attr: { style: "margin-top: 20px;" } });
      const reviewList = trackerCol.createEl("div", { cls: "margidoro-review-list" });
      const pendingIds = ((_e = this.plugin.settings.userStats) == null ? void 0 : _e.margidoroPending) || [];
      if (pendingIds.length === 0) {
        reviewList.createEl("p", { text: "Everything's up to date. Great job! \u{1F389}", cls: "text-muted" });
      } else {
        const renderPendingItems = async () => {
          const files = this.plugin.app.vault.getMarkdownFiles();
          for (const id of pendingIds) {
            let foundItem = null;
            for (const file of files) {
              const content = await this.plugin.app.vault.cachedRead(file);
              const lines = content.split("\n");
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`^${id}`)) {
                  const match = /%%[><](.*?)%%/.exec(lines[i]);
                  if (match) {
                    let rawText = match[1].trim();
                    let color = "var(--color-red)";
                    for (const tag of this.plugin.settings.tags) {
                      if (rawText.startsWith(tag.prefix)) {
                        color = tag.color;
                        rawText = rawText.substring(tag.prefix.length).trim();
                        break;
                      }
                    }
                    foundItem = { id, text: rawText, color, file, line: i };
                  }
                  break;
                }
              }
              if (foundItem) break;
            }
            if (!foundItem) continue;
            const itemDiv = reviewList.createDiv({ cls: "cornell-sidebar-item" });
            itemDiv.style.borderLeftColor = foundItem.color;
            const textRow = itemDiv.createDiv({ cls: "cornell-sidebar-item-text", attr: { style: "display: flex; justify-content: space-between; align-items: flex-start;" } });
            const textSpan = textRow.createSpan({ attr: { style: "word-break: break-word; flex-grow: 1; margin-right: 10px;" } });
            let cleanText = foundItem.text;
            const imagesToRender = [];
            const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
            Array.from(cleanText.matchAll(imgRegex)).forEach((m) => imagesToRender.push(m[1]));
            cleanText = cleanText.replace(imgRegex, "").trim();
            textSpan.innerText = cleanText.length > 130 ? cleanText.substring(0, 130) + "..." : cleanText;
            if (imagesToRender.length > 0) {
              const imgContainer = textSpan.createDiv({ attr: { style: "margin-top: 5px;" } });
              imagesToRender.forEach((imgName) => {
                const cleanName = imgName.split("|")[0];
                const imgFile = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, foundItem.file.path);
                if (imgFile) {
                  imgContainer.createEl("img", { attr: { src: this.plugin.app.vault.getResourcePath(imgFile), style: "max-height: 40px; width: auto; object-fit: contain; border-radius: 3px; display: inline-block;" } });
                }
              });
            }
            const actionsSpan = textRow.createSpan({ attr: { style: "display: flex; gap: 10px; align-items: center;" } });
            const getExplorerView = () => {
              const leaves = this.plugin.app.workspace.getLeavesOfType("cornell-marginalia-view");
              return leaves.length > 0 ? leaves[0].view : null;
            };
            const explorerView = getExplorerView();
            let isAlreadyPinned = explorerView && explorerView.pinboardItems ? explorerView.pinboardItems.some((p) => p.rawText === foundItem.text && p.file.path === foundItem.file.path) : false;
            const pinBtn = actionsSpan.createEl("span", { text: isAlreadyPinned ? "\u25CF" : "\u25CB", title: "Send to Pinboard", attr: { style: `cursor: pointer; transition: opacity 0.2s ease, transform 0.2s ease; opacity: ${isAlreadyPinned ? "1" : "0"};` } });
            itemDiv.addEventListener("mouseenter", () => {
              if (!isAlreadyPinned) pinBtn.style.opacity = "0.5";
            });
            itemDiv.addEventListener("mouseleave", () => {
              if (!isAlreadyPinned) pinBtn.style.opacity = "0";
            });
            pinBtn.onmouseenter = () => {
              pinBtn.style.opacity = "1";
              pinBtn.style.transform = "scale(1.2)";
            };
            pinBtn.onmouseleave = () => {
              pinBtn.style.transform = "scale(1)";
              if (!isAlreadyPinned) pinBtn.style.opacity = "0.5";
            };
            pinBtn.onclick = (e) => {
              e.stopPropagation();
              const view = getExplorerView();
              if (!view) return new import_obsidian7.Notice("\u26A0\uFE0F Open the Marginalia Explorer first to use the Board.");
              if (isAlreadyPinned) {
                view.pinboardItems = view.pinboardItems.filter((p) => !(p.rawText === foundItem.text && p.file.path === foundItem.file.path));
                isAlreadyPinned = false;
                pinBtn.innerText = "\u25CB";
                pinBtn.style.opacity = "0.5";
                new import_obsidian7.Notice("Removed from Board.");
              } else {
                view.pinboardItems.push({
                  text: foundItem.text.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim(),
                  rawText: foundItem.text,
                  color: foundItem.color,
                  file: foundItem.file,
                  line: foundItem.line,
                  blockId: foundItem.id,
                  outgoingLinks: [],
                  indentLevel: 0
                });
                isAlreadyPinned = true;
                pinBtn.innerText = "\u25CF";
                pinBtn.style.opacity = "1";
                new import_obsidian7.Notice("\u{1F4CC} Pinned to Board!");
              }
              view.applyFiltersAndRender();
            };
            const resolveBtn = actionsSpan.createDiv({ attr: { style: "cursor: pointer; color: var(--text-muted); opacity: 0; transition: color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;" } });
            (0, import_obsidian7.setIcon)(resolveBtn, "check");
            resolveBtn.title = "Mark as Mastered";
            itemDiv.addEventListener("mouseenter", () => {
              resolveBtn.style.opacity = "0.7";
            });
            itemDiv.addEventListener("mouseleave", () => {
              resolveBtn.style.opacity = "0";
            });
            resolveBtn.onmouseenter = () => {
              resolveBtn.style.color = "var(--color-green)";
              resolveBtn.style.opacity = "1";
              resolveBtn.style.transform = "scale(1.2)";
            };
            resolveBtn.onmouseleave = () => {
              resolveBtn.style.color = "var(--text-muted)";
              resolveBtn.style.opacity = "0.7";
              resolveBtn.style.transform = "scale(1)";
            };
            resolveBtn.onclick = async (e) => {
              e.stopPropagation();
              document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
              itemDiv.style.opacity = "0";
              setTimeout(() => itemDiv.remove(), 200);
              const index = this.plugin.settings.userStats.margidoroPending.indexOf(id);
              if (index > -1) {
                this.plugin.settings.userStats.margidoroPending.splice(index, 1);
                await this.plugin.saveSettings();
              }
              if (this.plugin.settings.userStats.margidoroPending.length === 0) {
                reviewList.empty();
                reviewList.createEl("p", { text: "Everything's up to date. Great job! \u{1F389}", cls: "text-muted" });
              }
            };
            itemDiv.createDiv({ cls: "cornell-sidebar-item-meta", text: `${foundItem.file.basename} (L${foundItem.line + 1})` });
            itemDiv.onclick = async () => {
              await this.plugin.app.workspace.getLeaf(false).openFile(foundItem.file, { eState: { line: foundItem.line } });
            };
            let hoverTimeout = null;
            let tooltipEl = null;
            let isHovering = false;
            const removeTooltip = () => {
              isHovering = false;
              if (hoverTimeout) clearTimeout(hoverTimeout);
              if (tooltipEl) {
                tooltipEl.remove();
                tooltipEl = null;
              }
              document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
            };
            itemDiv.addEventListener("mouseenter", (e) => {
              isHovering = true;
              hoverTimeout = setTimeout(async () => {
                if (!isHovering || !document.body.contains(itemDiv)) return;
                const fileContent = await this.plugin.app.vault.cachedRead(foundItem.file);
                const fileLines = fileContent.split("\n");
                let startLine = foundItem.line;
                let endLine = foundItem.line;
                while (startLine > 0 && fileLines[startLine - 1].trim() !== "" && !fileLines[startLine - 1].startsWith("```")) startLine--;
                while (endLine < fileLines.length - 1 && fileLines[endLine + 1].trim() !== "" && !fileLines[endLine + 1].startsWith("```")) endLine++;
                removeTooltip();
                const pdfRegex = /!*\[\[(.*?\.(?:pdf).*?)\]\]/i;
                const mdPdfRegex = /\[.*?\]\((.*?\.(?:pdf).*?)\)/i;
                let pdfLinkText = null;
                let match = fileLines[foundItem.line].match(pdfRegex) || fileLines[foundItem.line].match(mdPdfRegex);
                if (match) pdfLinkText = match[1];
                if (!pdfLinkText && foundItem.line - 1 >= startLine) {
                  match = fileLines[foundItem.line - 1].match(pdfRegex) || fileLines[foundItem.line - 1].match(mdPdfRegex);
                  if (match) pdfLinkText = match[1];
                }
                if (!pdfLinkText && foundItem.line + 1 <= endLine) {
                  match = fileLines[foundItem.line + 1].match(pdfRegex) || fileLines[foundItem.line + 1].match(mdPdfRegex);
                  if (match) pdfLinkText = match[1];
                }
                if (pdfLinkText) {
                  const cleanLinkText = pdfLinkText.split("|")[0].trim();
                  this.plugin.app.workspace.trigger("hover-link", {
                    event: e,
                    source: "preview",
                    hoverParent: itemDiv,
                    targetEl: itemDiv,
                    linktext: cleanLinkText,
                    sourcePath: foundItem.file.path
                  });
                  return;
                }
                let rawBlock = "";
                let highlightApplied = false;
                for (let i = startLine; i <= endLine; i++) {
                  let cleanLine = fileLines[i].replace(/%%[><](.*?)%%/g, "").trim();
                  if (cleanLine.startsWith("```")) continue;
                  if (cleanLine) {
                    if ((i === foundItem.line || i >= foundItem.line && !highlightApplied) && !highlightApplied) {
                      rawBlock += `==${cleanLine}==
`;
                      highlightApplied = true;
                    } else rawBlock += `${cleanLine}
`;
                  }
                }
                tooltipEl = document.createElement("div");
                tooltipEl.className = "popover hover-popover cornell-hover-tooltip markdown-rendered markdown-preview-view";
                tooltipEl.style.cssText = "position: fixed; z-index: 99999; width: 450px; max-height: 350px; overflow-y: auto; background-color: var(--background-primary); border: 1px solid var(--background-modifier-border); box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;";
                tooltipEl.innerHTML = `<style>.cornell-hover-tooltip p { margin: 0 0 8px 0 !important; }</style><div class="cornell-hover-context"><span style="font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;">\u{1F4C4} ${foundItem.file.basename} (L${foundItem.line + 1})</span></div>`;
                const body = tooltipEl.createDiv({ attr: { style: "width: 100%;" } });
                document.body.appendChild(tooltipEl);
                const rect = itemDiv.getBoundingClientRect();
                let leftPos = rect.right + 20;
                if (leftPos + 450 > window.innerWidth) leftPos = rect.left - 470;
                if (leftPos < 10) leftPos = 10;
                let topPos = rect.top;
                if (topPos + 350 > window.innerHeight) topPos = window.innerHeight - 360;
                tooltipEl.style.left = `${leftPos}px`;
                tooltipEl.style.top = `${Math.max(10, topPos)}px`;
                rawBlock = rawBlock.replace(/!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg))\|?(.*?)\]\]/gi, (match2, filename) => {
                  const resolvedFile = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), foundItem.file.path);
                  return resolvedFile ? `<img src="${this.plugin.app.vault.getResourcePath(resolvedFile)}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">` : match2;
                });
                if (!rawBlock.trim()) rawBlock = "*No text context available.*";
                const { MarkdownRenderer: MarkdownRenderer5 } = require("obsidian");
                await MarkdownRenderer5.renderMarkdown(rawBlock, body, foundItem.file.path, this.plugin);
                requestAnimationFrame(() => {
                  if (tooltipEl) tooltipEl.addClass("is-visible");
                });
              }, 500);
            });
            itemDiv.addEventListener("mouseleave", removeTooltip);
          }
        };
        renderPendingItems();
      }
    }
    if (layout.dailyNote) {
      const dailyHeader = dailyNoteCol.createDiv({ cls: "daily-planner-header" });
      dailyHeader.createEl("h2", { text: "\u{1F4D3} Daily Note" });
      const dailyContainer = dailyNoteCol.createDiv({
        cls: "daily-note-widget-container",
        attr: { style: "background: var(--background-primary); border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 15px; margin-top: 10px; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;" }
      });
      let dailyFolder = "";
      let dailyFormat = "YYYY-MM-DD";
      let dailyTemplate = "";
      try {
        const configStr = await this.plugin.app.vault.adapter.read(".obsidian/daily-notes.json");
        const config = JSON.parse(configStr);
        if (config.folder) dailyFolder = config.folder;
        if (config.format) dailyFormat = config.format;
        if (config.template) dailyTemplate = config.template;
      } catch (e) {
      }
      const todayName = window.moment().format(dailyFormat);
      const dailyPath = dailyFolder ? `${dailyFolder}/${todayName}.md` : `${todayName}.md`;
      let file = this.plugin.app.vault.getAbstractFileByPath(dailyPath);
      if (file && file instanceof import_obsidian7.TFile) {
        const renderContainer = dailyContainer.createDiv({
          cls: "markdown-preview-view markdown-rendered",
          attr: { style: "flex-grow: 1; overflow-y: auto; padding-right: 5px; user-select: text;" }
        });
        const renderDaily = async () => {
          renderContainer.empty();
          const content = await this.plugin.app.vault.cachedRead(file);
          await import_obsidian7.MarkdownRenderer.renderMarkdown(content, renderContainer, file.path, this.plugin);
        };
        renderDaily();
        const modifyEvent = this.plugin.app.vault.on("modify", (changedFile) => {
          if (changedFile.path === (file == null ? void 0 : file.path)) renderDaily();
        });
        this.plugin.registerEvent(modifyEvent);
        const actionRow = dailyContainer.createDiv({
          attr: { style: "display: flex; gap: 8px; margin-top: 15px; border-top: 1px solid var(--background-modifier-border); padding-top: 10px;" }
        });
        const quickInput = actionRow.createEl("input", {
          type: "text",
          placeholder: "A\xF1adir a la nota r\xE1pida... (Enter)",
          attr: { style: "flex-grow: 1; background: var(--background-modifier-form-field); border: 1px solid var(--background-modifier-border); color: var(--text-normal); padding: 5px 10px; border-radius: 4px; font-size: 0.9em;" }
        });
        quickInput.addEventListener("keypress", async (e) => {
          if (e.key === "Enter" && quickInput.value.trim() !== "") {
            const textToAppend = `
- ${quickInput.value.trim()}`;
            await this.plugin.app.vault.append(file, textToAppend);
            quickInput.value = "";
          }
        });
        const editBtn2 = actionRow.createEl("button", { title: "Abrir Editor Completo", cls: "mod-cta", attr: { style: "padding: 5px 12px;" } });
        (0, import_obsidian7.setIcon)(editBtn2, "pencil");
        editBtn2.onclick = () => {
          const leaf = this.plugin.app.workspace.getLeaf("split", "vertical");
          leaf.openFile(file);
        };
      } else {
        dailyContainer.createEl("p", { text: `No existe la nota de hoy.`, cls: "text-muted", attr: { style: "text-align: center; margin-top: 20px;" } });
        dailyContainer.createEl("p", { text: `Ruta esperada: ${dailyPath}`, attr: { style: "text-align: center; font-size: 0.8em; color: var(--text-faint); word-break: break-all;" } });
        const createBtn = dailyContainer.createEl("button", { text: "Crear Daily Note", cls: "mod-cta", attr: { style: "width: 100%; margin-top: 15px;" } });
        createBtn.onclick = async () => {
          let initialContent = "";
          if (dailyTemplate) {
            const templatePath = dailyTemplate.endsWith(".md") ? dailyTemplate : `${dailyTemplate}.md`;
            const tplFile = this.plugin.app.vault.getAbstractFileByPath(templatePath);
            if (tplFile && tplFile instanceof import_obsidian7.TFile) {
              initialContent = await this.plugin.app.vault.read(tplFile);
              initialContent = initialContent.replace(/{{date}}/g, window.moment().format(dailyFormat));
              initialContent = initialContent.replace(/{{time}}/g, window.moment().format("HH:mm"));
              initialContent = initialContent.replace(/{{title}}/g, todayName);
            }
          }
          try {
            if (dailyFolder) {
              const folderExists = this.plugin.app.vault.getAbstractFileByPath(dailyFolder);
              if (!folderExists) await this.plugin.app.vault.createFolder(dailyFolder);
            }
            await this.plugin.app.vault.create(dailyPath, initialContent);
            this.onOpen();
          } catch (err) {
            new import_obsidian7.Notice(`Error creando la nota: ${err.message}`);
          }
        };
      }
    }
  }
};
var WeeklyPlannerModal = class extends import_obsidian7.Modal {
  // --- FIN NUEVO ---
  constructor(app, plugin, onCloseCallback) {
    super(app);
    this.currentModeView = "optimal";
    // Capa de energía actual en la vista
    this.copiedBlocks = null;
    // 📋 Portapapeles en memoria para copiar días enteros
    // --- INICIO NUEVO: Memoria temporal del formulario ---
    this.lastSelectedDay = null;
    this.lastEndTime = null;
    this.plugin = plugin;
    this.onCloseCallback = onCloseCallback;
  }
  onOpen() {
    this.renderUI();
  }
  // Usamos una función renderUI para poder recargar el modal al cambiar de pestaña
  renderUI() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "85vw";
    this.modalEl.style.maxWidth = "1000px";
    const headerContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 10px; margin-bottom: 15px;" } });
    const titleBox = headerContainer.createDiv();
    titleBox.createEl("h2", { text: "Weekly Routine Builder", attr: { style: "margin: 0;" } });
    titleBox.createEl("p", { text: "Dise\xF1a tu semana seg\xFAn tu nivel de energ\xEDa y contingencia.", cls: "text-muted", attr: { style: "margin: 5px 0 0 0; font-size: 0.9em;" } });
    const tabsBox = headerContainer.createDiv({ attr: { style: "display: flex; gap: 10px;" } });
    const createTab = (id, label) => {
      const btn = tabsBox.createEl("button", { text: label });
      if (this.currentModeView === id) {
        btn.addClass("mod-cta");
      } else {
        btn.style.background = "var(--background-secondary)";
      }
      btn.onclick = () => {
        this.currentModeView = id;
        this.renderUI();
      };
    };
    createTab("optimal", "Optimal (100%)");
    createTab("regular", "Regular (70%)");
    createTab("survival", "Survival (20%)");
    const formContainer = contentEl.createDiv({ cls: "weekly-planner-form" });
    const daySelect = formContainer.createEl("select");
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach((day, index) => {
      daySelect.createEl("option", { value: index.toString(), text: day });
    });
    daySelect.value = this.lastSelectedDay !== null ? this.lastSelectedDay : (/* @__PURE__ */ new Date()).getDay().toString();
    let defaultStart = this.lastEndTime || "08:00";
    let defaultEnd = "09:00";
    if (this.lastEndTime) {
      const [h, m] = this.lastEndTime.split(":").map(Number);
      const nextH = (h + 1) % 24;
      defaultEnd = `${nextH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    const startInput = formContainer.createEl("input", { type: "time", value: defaultStart });
    const endInput = formContainer.createEl("input", { type: "time", value: defaultEnd });
    const typeSelect = formContainer.createEl("select");
    typeSelect.createEl("option", { value: "study", text: "Study Session" });
    typeSelect.createEl("option", { value: "review", text: "Review / SRS" });
    typeSelect.createEl("option", { value: "class", text: "Class / Lecture" });
    typeSelect.createEl("option", { value: "break", text: "Break / Rest" });
    const titleInput = formContainer.createEl("input", { type: "text", placeholder: "Task name (e.g. Anatomy)" });
    titleInput.style.flexGrow = "1";
    const addBtn = formContainer.createEl("button", { text: "Add Block", cls: "mod-cta" });
    addBtn.onclick = async () => {
      if (!titleInput.value.trim()) {
        new import_obsidian7.Notice("Please enter a task name.");
        return;
      }
      if (startInput.value >= endInput.value) {
        new import_obsidian7.Notice("End time must be after start time.");
        return;
      }
      const newBlock = {
        id: Math.random().toString(36).substring(2, 9),
        dayOfWeek: parseInt(daySelect.value),
        startTime: startInput.value,
        endTime: endInput.value,
        type: typeSelect.value,
        title: titleInput.value.trim(),
        mode: this.currentModeView
        // GUARDADO INTELIGENTE: Hereda la capa en la que estás
      };
      if (!this.plugin.settings.dashboardData.routineBlocks) {
        this.plugin.settings.dashboardData.routineBlocks = [];
      }
      this.plugin.settings.dashboardData.routineBlocks.push(newBlock);
      await this.plugin.saveSettings();
      this.lastSelectedDay = daySelect.value;
      this.lastEndTime = endInput.value;
      titleInput.value = "";
      this.renderUI();
      new import_obsidian7.Notice("Block added to " + this.currentModeView + " plan!");
    };
    const gridContainer = contentEl.createDiv({ cls: "weekly-planner-grid" });
    this.renderWeekGrid(gridContainer);
  }
  renderWeekGrid(container) {
    container.empty();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const blocks = this.plugin.settings.dashboardData.routineBlocks || [];
    days.forEach((dayName, dayIndex) => {
      const dayCol = container.createDiv({ cls: "weekly-day-col" });
      const headerRow = dayCol.createDiv({ cls: "weekly-day-header", attr: { style: "display: flex; justify-content: space-between; align-items: center;" } });
      headerRow.createSpan({ text: dayName });
      const actionsSpan = headerRow.createSpan({ attr: { style: "display: flex; gap: 5px;" } });
      const copyBtn = actionsSpan.createEl("button", { title: "Copiar plan de este d\xEDa", attr: { style: "padding: 2px 6px; background: transparent; box-shadow: none; cursor: pointer;" } });
      (0, import_obsidian7.setIcon)(copyBtn, "copy");
      copyBtn.onclick = () => {
        const dayBlocksToCopy = blocks.filter((b) => b.dayOfWeek === dayIndex && (b.mode === this.currentModeView || !b.mode && this.currentModeView === "optimal"));
        if (dayBlocksToCopy.length === 0) {
          new import_obsidian7.Notice(`\u26A0\uFE0F No hay nada que copiar en ${dayName}.`);
          return;
        }
        this.copiedBlocks = JSON.parse(JSON.stringify(dayBlocksToCopy));
        new import_obsidian7.Notice(`\u{1F4CB} ${dayName} copiado!`);
        this.renderUI();
      };
      const pasteBtn = actionsSpan.createEl("button", { title: "Pegar bloques aqu\xED (Sobreescribe el d\xEDa)", attr: { style: "padding: 2px 6px; background: transparent; box-shadow: none; cursor: pointer; transition: color 0.2s;" } });
      (0, import_obsidian7.setIcon)(pasteBtn, "clipboard-paste");
      if (!this.copiedBlocks || this.copiedBlocks.length === 0) {
        pasteBtn.style.opacity = "0.3";
        pasteBtn.style.cursor = "not-allowed";
      } else {
        pasteBtn.style.color = "var(--interactive-accent)";
      }
      pasteBtn.onclick = async () => {
        if (!this.copiedBlocks || this.copiedBlocks.length === 0) {
          new import_obsidian7.Notice("\u26A0\uFE0F Primero copia el contenido de un d\xEDa.");
          return;
        }
        this.plugin.settings.dashboardData.routineBlocks = this.plugin.settings.dashboardData.routineBlocks.filter(
          (b) => !(b.dayOfWeek === dayIndex && (b.mode === this.currentModeView || !b.mode && this.currentModeView === "optimal"))
        );
        const newBlocks = this.copiedBlocks.map((b) => ({
          ...b,
          id: Math.random().toString(36).substring(2, 9),
          // ID fresco para que el Tracker no se confunda
          dayOfWeek: dayIndex
          // Lo asignamos a la columna donde acabamos de pegar
        }));
        this.plugin.settings.dashboardData.routineBlocks.push(...newBlocks);
        await this.plugin.saveSettings();
        new import_obsidian7.Notice(`\u2705 Plan pegado en ${dayName}.`);
        this.renderUI();
      };
      const dayBlocks = blocks.filter((b) => b.dayOfWeek === dayIndex && (b.mode === this.currentModeView || !b.mode && this.currentModeView === "optimal")).sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (dayBlocks.length === 0) {
        dayCol.createDiv({ cls: "weekly-empty", text: "Rest day" });
      } else {
        dayBlocks.forEach((block) => {
          const blockCard = dayCol.createDiv({ cls: `weekly-block-card type-${block.type}` });
          const timeRow = blockCard.createDiv({ cls: "weekly-block-time" });
          timeRow.createSpan({ text: `${block.startTime} - ${block.endTime}` });
          const delBtn = timeRow.createSpan({ text: "\xD7", cls: "weekly-block-del", title: "Delete" });
          delBtn.onclick = async () => {
            this.plugin.settings.dashboardData.routineBlocks = this.plugin.settings.dashboardData.routineBlocks.filter((b) => b.id !== block.id);
            await this.plugin.saveSettings();
            this.renderUI();
          };
          blockCard.createDiv({ cls: "weekly-block-title", text: block.title });
        });
      }
    });
  }
  onClose() {
    this.contentEl.empty();
    this.onCloseCallback();
  }
};
var SubjectEditorModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, subject, onSave) {
    super(app);
    this.plugin = plugin;
    this.subject = subject;
    this.onSave = onSave;
  }
  // FUNCIÓN LECTORA DE PUERTO 
  async getTaskNotesConfig() {
    try {
      const appInstance = this.plugin ? this.plugin.app : this.app;
      const configStr = await appInstance.vault.adapter.read(".obsidian/plugins/tasknotes/data.json");
      const config = JSON.parse(configStr);
      return {
        port: config.apiPort || 8080,
        token: config.apiAuthToken || ""
        // Rescatamos el token si existe
      };
    } catch (e) {
      return { port: 8080, token: "" };
    }
  }
  //  HASTA AQUÍ 
  async syncSyllabusToTaskNotes(subject) {
    var _a, _b, _c, _d;
    if (!subject.syllabus || subject.syllabus.length === 0) return;
    let createdCount = 0;
    const config = await this.getTaskNotesConfig();
    const reqHeaders = { "Content-Type": "application/json" };
    if (config.token) {
      reqHeaders["Authorization"] = `Bearer ${config.token}`;
    }
    const safeSubjectName = subject.name.replace(/[\\/:*?"<>|]/g, "");
    const projectFileName = `${safeSubjectName}.md`;
    const projectFile = this.app.vault.getAbstractFileByPath(projectFileName);
    if (!projectFile) {
      try {
        await this.app.vault.create(
          projectFileName,
          `---
tags:
  - project
---
# ${safeSubjectName}

Proyecto generado autom\xE1ticamente por Cornell Marginalia.`
        );
      } catch (e) {
      }
    }
    for (const topic of subject.syllabus) {
      if (topic.taskNoteId) continue;
      try {
        const response = await (0, import_obsidian7.requestUrl)({
          url: `http://127.0.0.1:${config.port}/api/tasks`,
          // 👈 Usamos config.port
          method: "POST",
          headers: reqHeaders,
          // 👈 Pasamos los headers seguros
          body: JSON.stringify({
            title: topic.name,
            details: `Syllabus rule: ${topic.rule}`,
            due: new Date(subject.examDate).toISOString().split("T")[0],
            tags: ["cornell"],
            contexts: [`@${safeSubjectName.replace(/\s+/g, "")}`],
            projects: [`[[${safeSubjectName}]]`]
          })
        });
        if (response.status === 201 || response.status === 200) {
          topic.taskNoteId = ((_b = (_a = response.json) == null ? void 0 : _a.data) == null ? void 0 : _b.id) || ((_d = (_c = response.json) == null ? void 0 : _c.data) == null ? void 0 : _d.path) || "synced";
          createdCount++;
        }
      } catch (error) {
        console.error(`[Cornell Marginalia] Error sincronizando con TaskNotes:`, error);
      }
    }
    if (createdCount > 0) {
      await this.plugin.saveSettings();
      new import_obsidian7.Notice(`\u{1F517} Sincronizadas ${createdCount} tareas (Secure Mode).`);
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.subject ? "\u270F\uFE0F Edit Subject" : "\u2795 New Subject" });
    const nameInput = contentEl.createEl("input", { type: "text", placeholder: "Subject Name (e.g. Biology)" });
    nameInput.style.width = "100%";
    nameInput.style.marginBottom = "10px";
    if (this.subject) nameInput.value = this.subject.name;
    contentEl.createEl("label", { text: "\u{1F3AF} Exam Date (Deadline):", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
    const dateInput = contentEl.createEl("input", { type: "date" });
    dateInput.style.width = "100%";
    dateInput.style.marginBottom = "10px";
    if (this.subject && this.subject.examDate) {
      const d = new Date(this.subject.examDate);
      dateInput.value = d.toISOString().split("T")[0];
    }
    contentEl.createEl("label", { text: "\u{1F4DA} Sources (Folders, Notes, PDFs):", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
    const inputRow = contentEl.createDiv({ attr: { style: "display: flex; gap: 8px; margin-bottom: 10px;" } });
    const sourceInput = inputRow.createEl("input", { type: "text", placeholder: "Type a folder or file name..." });
    sourceInput.style.flexGrow = "1";
    const datalistId = "subject-sources-list";
    let datalist = document.getElementById(datalistId);
    if (!datalist) datalist = document.body.createEl("datalist", { attr: { id: datalistId } });
    else datalist.empty();
    this.plugin.app.vault.getAllLoadedFiles().forEach((f) => {
      var _a;
      const ext = (_a = f.extension) == null ? void 0 : _a.toLowerCase();
      if (ext === void 0 || ext === "md" || ext === "pdf" || ext === "canvas" || ext === "excalidraw") {
        datalist.createEl("option", { value: f.path });
      }
    });
    sourceInput.setAttribute("list", datalistId);
    const addSourceBtn = inputRow.createEl("button", { text: "Add" });
    const chipsContainer = contentEl.createDiv({ cls: "subject-folders", attr: { style: "margin-bottom: 15px; min-height: 30px;" } });
    let currentSources = this.subject ? this.subject.sources || this.subject.resourceFolders || [] : [];
    const renderChips = () => {
      chipsContainer.empty();
      currentSources.forEach((src, idx) => {
        const chip = chipsContainer.createSpan({ cls: "folder-chip" });
        let iconStr = "\u{1F4C1}";
        if (src.endsWith(".pdf")) iconStr = "\u{1F4D5}";
        else if (src.endsWith(".md")) iconStr = "\u{1F4C4}";
        chip.innerText = `${iconStr} ${src}`;
        const delBtn = chip.createSpan({ text: " \xD7", attr: { style: "cursor: pointer; color: var(--text-error); margin-left: 4px; font-weight: bold;" } });
        delBtn.onclick = () => {
          currentSources.splice(idx, 1);
          renderChips();
        };
      });
    };
    renderChips();
    addSourceBtn.onclick = () => {
      const val = sourceInput.value.trim();
      if (val && !currentSources.includes(val)) {
        currentSources.push(val);
        sourceInput.value = "";
        renderChips();
      }
    };
    sourceInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSourceBtn.click();
      }
    });
    contentEl.createEl("label", { text: "\u{1F4D1} Smart Syllabus (Paste topics separated by lines or commas):", attr: { style: "display: block; margin-top: 15px; margin-bottom: 5px; font-weight: bold;" } });
    const bulkInputRow = contentEl.createDiv({ attr: { style: "display: flex; gap: 8px; margin-bottom: 10px;" } });
    const bulkInput = bulkInputRow.createEl("textarea", { placeholder: "1. Introducci\xF3n\n2. C\xE9lulas\n3. Tejidos..." });
    bulkInput.style.flexGrow = "1";
    bulkInput.style.height = "60px";
    const parseBtn = bulkInputRow.createEl("button", { text: "\u26A1 Parse" });
    parseBtn.style.height = "60px";
    const topicsContainer = contentEl.createDiv({ cls: "syllabus-topics-editor", attr: { style: "max-height: 200px; overflow-y: auto; background: var(--background-secondary-alt); padding: 10px; border-radius: 6px; border: 1px solid var(--background-modifier-border); margin-bottom: 15px;" } });
    let currentTopics = this.subject && this.subject.syllabus ? [...this.subject.syllabus] : [];
    const renderTopicsEditor = () => {
      topicsContainer.empty();
      if (currentTopics.length === 0) {
        topicsContainer.createEl("span", { text: "No topics yet. Paste a list and click Parse.", cls: "text-muted", attr: { style: "font-size: 0.85em; font-style: italic;" } });
        return;
      }
      currentTopics.forEach((topic, idx) => {
        const topicRow = topicsContainer.createDiv({ attr: { style: "display: flex; gap: 10px; align-items: center; margin-bottom: 8px;" } });
        const nameInp = topicRow.createEl("input", { type: "text", value: topic.name, attr: { title: "Topic Name" } });
        nameInp.style.flexGrow = "1";
        nameInp.onchange = () => topic.name = nameInp.value;
        const ruleInp = topicRow.createEl("input", { type: "text", value: topic.rule, placeholder: "Rule (e.g. #cells or tema::cells)", attr: { title: "Capture Rule (Tag or Property)" } });
        ruleInp.style.width = "180px";
        ruleInp.onchange = () => topic.rule = ruleInp.value;
        const delBtn = topicRow.createEl("span", { text: "\xD7", attr: { style: "cursor: pointer; color: var(--text-error); font-weight: bold; padding: 0 5px;", title: "Eliminar tema" } });
        delBtn.onclick = () => {
          const topicToDelete = currentTopics[idx];
          const performDeletion = () => {
            currentTopics.splice(idx, 1);
            renderTopicsEditor();
          };
          if (topicToDelete.taskNoteId && topicToDelete.taskNoteId !== "synced") {
            new ConfirmDeleteModal(
              this.plugin.app,
              "\u{1F5D1}\uFE0F Eliminar TaskNote",
              `\xBFQuieres enviar tambi\xE9n el archivo TaskNote "${topicToDelete.name}" a la papelera del sistema?`,
              async () => {
                let pathToOpen = topicToDelete.taskNoteId.endsWith(".md") ? topicToDelete.taskNoteId : `${topicToDelete.taskNoteId}.md`;
                const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pathToOpen, "");
                if (file) {
                  await this.plugin.app.vault.trash(file, true);
                  new import_obsidian7.Notice(`\u{1F5D1}\uFE0F TaskNote enviada a la papelera.`);
                }
                performDeletion();
              }
            ).open();
          } else {
            performDeletion();
          }
        };
      });
    };
    renderTopicsEditor();
    parseBtn.onclick = () => {
      const raw = bulkInput.value.trim();
      if (!raw) return;
      const parts = raw.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
      parts.forEach((p) => {
        const cleanTag = p.replace(/^[0-9.\-]+\s*/, "").replace(/\s+/g, "_").toLowerCase();
        currentTopics.push({ id: Math.random().toString(36).substring(2, 9), name: p, rule: `#${cleanTag}` });
      });
      bulkInput.value = "";
      renderTopicsEditor();
    };
    contentEl.createEl("label", { text: "\u{1F3A8} Subject Color:", attr: { style: "display: block; margin-bottom: 5px; font-weight: bold;" } });
    const colorInput = contentEl.createEl("input", { type: "color" });
    colorInput.style.marginBottom = "20px";
    colorInput.style.display = "block";
    colorInput.value = this.subject && this.subject.color ? this.subject.color : "#4a90e2";
    const saveBtn = contentEl.createEl("button", { text: "\u{1F4BE} Save Subject", cls: "mod-cta" });
    saveBtn.style.width = "100%";
    saveBtn.onclick = async () => {
      if (!nameInput.value.trim() || !dateInput.value) {
        new import_obsidian7.Notice("\u26A0\uFE0F Name and Exam Date are required.");
        return;
      }
      const inputDate = new Date(dateInput.value);
      const localDate = new Date(inputDate.getTime() + Math.abs(inputDate.getTimezoneOffset() * 6e4));
      const newSubject = {
        id: this.subject ? this.subject.id : Math.random().toString(36).substring(2, 9),
        name: nameInput.value.trim(),
        examDate: localDate.getTime(),
        sources: currentSources,
        // 👈 Guardamos el nuevo array
        syllabus: currentTopics,
        color: colorInput.value
      };
      const data = this.plugin.settings.dashboardData;
      if (!data.subjects) data.subjects = [];
      if (this.subject) {
        const idx = data.subjects.findIndex((s) => s.id === this.subject.id);
        if (idx > -1) data.subjects[idx] = newSubject;
      } else {
        data.subjects.push(newSubject);
      }
      await this.plugin.saveSettings();
      if (data.layout && data.layout.subjectsTaskNotes) {
        await this.syncSyllabusToTaskNotes(newSubject);
      }
      this.onSave();
      this.close();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ReviewSessionManager = class {
  constructor(plugin, subject, isCramMode, topic = null, sessionType = "srs") {
    this.deck = [];
    this.currentIndex = 0;
    this.floatingBar = null;
    this.plugin = plugin;
    this.subject = subject;
    this.isCramMode = isCramMode;
    this.topic = topic;
    this.sessionType = sessionType;
  }
  async start() {
    new import_obsidian7.Notice("\u23F3 Assembling Deck...");
    await this.buildDeck();
    if (this.deck.length === 0) {
      new import_obsidian7.Notice("\u{1F389} You're all caught up! No pending reviews for this subject today.");
      return;
    }
    if (this.sessionType === "srs" && !document.body.classList.contains("cornell-active-recall-on")) {
      this.plugin.toggleActiveRecall();
    }
    this.showCurrentCard();
  }
  async buildDeck() {
    var _a;
    const files = this.plugin.app.vault.getMarkdownFiles();
    const sources = this.subject.sources || [];
    const now = Date.now();
    const allAttachedNotes = [];
    if (!this.topic && this.subject.syllabus) {
      this.subject.syllabus.forEach((t) => {
        if (t.attachedNotes) allAttachedNotes.push(...t.attachedNotes);
      });
    }
    const targetFiles = this.topic ? files.filter((f) => {
      var _a2;
      const isSource = sources.some((src) => f.path.startsWith(src) || f.path === src || f.name === src);
      const isAttached = (_a2 = this.topic.attachedNotes) == null ? void 0 : _a2.some((n) => f.path === n || f.name === n || f.name === `${n}.md`);
      return isSource || isAttached;
    }) : files.filter((f) => {
      const isSource = sources.some((src) => f.path.startsWith(src) || f.path === src || f.name === src);
      const isAttached = allAttachedNotes.some((n) => f.path === n || f.name === n || f.name === `${n}.md`);
      return isSource || isAttached;
    });
    if (this.sessionType === "reading" && !this.plugin.settings.userStats.activeReading) {
      this.plugin.settings.userStats.activeReading = {};
    }
    for (const file of targetFiles) {
      const content = await this.plugin.app.vault.cachedRead(file);
      if (this.sessionType === "reading") {
        if (/%%[><](.*?)%%/.test(content)) {
          const noteData = this.plugin.settings.userStats.activeReading[file.path] || { nextReview: 0 };
          if (this.isCramMode || now >= noteData.nextReview) {
            this.deck.push({
              file,
              line: 0,
              // En lectura empezamos desde arriba
              reviewData: noteData
            });
          }
        }
      } else {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/%%[><](.*?)%%/);
          if (match) {
            const rawText = match[1].trim().toLowerCase();
            if (!rawText.includes(";;")) {
              continue;
            }
            const ruleLower = this.topic && this.topic.rule ? this.topic.rule.toLowerCase() : null;
            const isAttachedToTopic = this.topic && ((_a = this.topic.attachedNotes) == null ? void 0 : _a.some((n) => file.path === n || file.name === n || file.name === `${n}.md`));
            if (ruleLower && !isAttachedToTopic && !rawText.includes(ruleLower)) continue;
            const blockIdMatch = lines[i].match(/\^([a-zA-Z0-9]+)(?:\s*%%)?\s*$/);
            const blockId = blockIdMatch ? blockIdMatch[1] : `${file.basename}-L${i}`;
            const reviewData = this.plugin.settings.userStats.rhizomeReviews[blockId] || { lastReviewed: 0, interval: 0, ease: 2.5 };
            if (reviewData.interval === -1) continue;
            const msInDay = 24 * 60 * 60 * 1e3;
            const nextReviewDate = reviewData.lastReviewed + reviewData.interval * msInDay;
            if (this.isCramMode || now >= nextReviewDate) {
              this.deck.push({
                id: blockId,
                file,
                line: i,
                reviewData
              });
            }
          }
        }
      }
    }
    this.deck = this.deck.sort(() => Math.random() - 0.5);
  }
  async showCurrentCard() {
    if (this.currentIndex >= this.deck.length) {
      this.endSession();
      new import_obsidian7.Notice("\u{1F3C1} Session Complete! Awesome job.");
      return;
    }
    const card = this.deck[this.currentIndex];
    const openOptions = { active: true };
    if (this.sessionType === "srs") {
      openOptions.state = { mode: "preview" };
      openOptions.eState = { line: card.line };
    }
    const leaf = this.plugin.app.workspace.getLeaf(false);
    await leaf.openFile(card.file, openOptions);
    this.renderFloatingBar(card);
  }
  renderFloatingBar(card) {
    if (!this.floatingBar) {
      this.floatingBar = document.body.createDiv({ cls: "cornell-srs-floating-bar" });
      this.floatingBar.style.position = "fixed";
      this.floatingBar.style.bottom = "30px";
      this.floatingBar.style.left = "50%";
      this.floatingBar.style.transform = "translateX(-50%)";
      this.floatingBar.style.zIndex = "99999";
    }
    this.floatingBar.empty();
    this.floatingBar.style.borderTop = `4px solid ${this.subject.color || "var(--interactive-accent)"}`;
    const header = this.floatingBar.createDiv({ cls: "srs-floating-header" });
    const titleSpan = header.createSpan();
    const modeTxt = this.isCramMode ? "\u26A1 Cram" : "\u{1F504} Review";
    const typeTxt = this.sessionType === "reading" ? "\u{1F4D6} Reading" : "\u{1F5C2}\uFE0F Flashcards";
    titleSpan.innerHTML = `<strong>${this.subject.name}</strong> <span style="opacity: 0.6; margin-left: 8px;">${modeTxt} - ${typeTxt} (${this.currentIndex + 1}/${this.deck.length})</span>`;
    const toolsSpan = header.createSpan({ attr: { style: "display: flex; gap: 10px;" } });
    if (this.sessionType === "srs") {
      const blurBtn = toolsSpan.createEl("button", { title: "Toggle Blur (Active Recall)" });
      this.updateBlurIcon(blurBtn);
      blurBtn.onclick = () => {
        this.plugin.toggleActiveRecall();
        this.updateBlurIcon(blurBtn);
      };
    }
    const exitBtn = toolsSpan.createEl("button", { title: "End Session" });
    (0, import_obsidian7.setIcon)(exitBtn, "x");
    exitBtn.onclick = () => {
      this.endSession();
      new import_obsidian7.Notice("Session paused.");
    };
    const controls = this.floatingBar.createDiv({ cls: "srs-floating-controls" });
    if (this.sessionType === "srs") {
      const btnSuspend = controls.createEl("button", { text: "Suspend", cls: "srs-btn srs-suspend", title: "Ignore this card forever" });
      const btnHard = controls.createEl("button", { text: "Hard", cls: "srs-btn srs-hard" });
      const btnGood = controls.createEl("button", { text: "Good", cls: "srs-btn srs-good" });
      const btnEasy = controls.createEl("button", { text: "Easy", cls: "srs-btn srs-easy" });
      const processSRSRating = async (rating) => {
        const now = Date.now();
        if (!this.isCramMode) {
          let { interval, ease } = card.reviewData;
          if (rating === "suspend") {
            interval = -1;
          } else {
            if (rating === "hard") {
              interval = Math.max(1, interval * 0.5);
              ease = Math.max(1.3, ease - 0.2);
            } else if (rating === "good") {
              interval = interval === 0 ? 1 : interval * ease;
            } else if (rating === "easy") {
              interval = interval === 0 ? 4 : interval * ease * 1.3;
              ease += 0.15;
            }
            const msInDay = 1e3 * 60 * 60 * 24;
            const daysUntilExam = Math.max(1, (this.subject.examDate - now) / msInDay);
            if (interval >= daysUntilExam) {
              const compressionFactor = rating === "easy" ? 0.8 : rating === "good" ? 0.6 : 0.3;
              interval = Math.max(1, daysUntilExam * compressionFactor);
            }
            if (interval > 2) {
              const fuzzFactor = 0.05;
              const fuzzRange = interval * fuzzFactor;
              const fuzzOffset = Math.random() * 2 * fuzzRange - fuzzRange;
              interval = interval + fuzzOffset;
            }
          }
          this.plugin.settings.userStats.rhizomeReviews[card.id] = { lastReviewed: now, interval, ease };
          await this.plugin.saveSettings();
        }
        this.currentIndex++;
        this.showCurrentCard();
      };
      btnSuspend.onclick = () => processSRSRating("suspend");
      btnHard.onclick = () => processSRSRating("hard");
      btnGood.onclick = () => processSRSRating("good");
      btnEasy.onclick = () => processSRSRating("easy");
    } else {
      controls.style.display = "flex";
      controls.style.gap = "15px";
      controls.style.alignItems = "center";
      controls.style.width = "100%";
      controls.style.justifyContent = "space-between";
      const sliderContainer = controls.createDiv({ attr: { style: "display: flex; align-items: center; gap: 10px; flex-grow: 1;" } });
      sliderContainer.createSpan({ text: "Confidence:", attr: { style: "font-size: 0.9em; font-weight: bold; color: var(--text-muted);" } });
      const slider = sliderContainer.createEl("input", { type: "range", attr: { min: "1", max: "10", value: "5", style: "flex-grow: 1; cursor: pointer;" } });
      const valueDisplay = sliderContainer.createDiv({ text: "5/10", attr: { style: "font-size: 1.1em; font-weight: bold; min-width: 45px; text-align: center; color: var(--color-orange);" } });
      slider.oninput = () => {
        valueDisplay.innerText = `${slider.value}/10`;
        if (parseInt(slider.value) <= 3) valueDisplay.style.color = "var(--color-red)";
        else if (parseInt(slider.value) >= 8) valueDisplay.style.color = "var(--color-green)";
        else valueDisplay.style.color = "var(--color-orange)";
      };
      const actionsSpan = controls.createDiv({ attr: { style: "display: flex; gap: 10px;" } });
      const suspendBtn = actionsSpan.createEl("button", { text: "\u{1F6D1} Suspend", title: "Mastered, ignore forever" });
      const nextBtn = actionsSpan.createEl("button", { text: "Next \u27A1\uFE0F", cls: "mod-cta" });
      const processReadingReview = async (confidence, suspended) => {
        const now = Date.now();
        let daysLeft = 30;
        if (this.subject.examDate) {
          daysLeft = Math.ceil((this.subject.examDate - now) / (1e3 * 60 * 60 * 24));
          if (daysLeft <= 0) daysLeft = 14;
        }
        let nextIntervalDays = 1;
        if (suspended || confidence === 10) {
          nextIntervalDays = 9999;
        } else if (confidence <= 3) {
          nextIntervalDays = 1;
        } else {
          const factor = Math.pow((confidence - 1) / 9, 1.5);
          nextIntervalDays = Math.max(1, Math.floor(daysLeft * factor));
        }
        this.plugin.settings.userStats.activeReading[card.file.path] = {
          lastReview: now,
          confidence,
          nextReview: now + nextIntervalDays * 24 * 60 * 60 * 1e3
        };
        await this.plugin.saveSettings();
        this.currentIndex++;
        this.showCurrentCard();
      };
      suspendBtn.onclick = () => processReadingReview(10, true);
      nextBtn.onclick = () => processReadingReview(parseInt(slider.value), false);
    }
  }
  updateBlurIcon(btn) {
    btn.empty();
    if (document.body.classList.contains("cornell-active-recall-on")) {
      (0, import_obsidian7.setIcon)(btn, "eye-off");
      btn.style.color = "var(--interactive-accent)";
    } else {
      (0, import_obsidian7.setIcon)(btn, "eye");
      btn.style.color = "var(--text-muted)";
    }
  }
  endSession() {
    if (this.floatingBar) {
      this.floatingBar.remove();
      this.floatingBar = null;
    }
  }
};
var CustomBlockModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, todayKey, onSave) {
    super(app);
    this.plugin = plugin;
    this.todayKey = todayKey;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Add Block for Today Only" });
    const startInput = contentEl.createEl("input", { type: "time", value: "12:00" });
    startInput.style.marginRight = "10px";
    const endInput = contentEl.createEl("input", { type: "time", value: "13:00" });
    endInput.style.marginBottom = "10px";
    const typeSelect = contentEl.createEl("select");
    typeSelect.style.width = "100%";
    typeSelect.style.marginBottom = "10px";
    typeSelect.createEl("option", { value: "study", text: "Study Session" });
    typeSelect.createEl("option", { value: "review", text: "Review / SRS" });
    typeSelect.createEl("option", { value: "class", text: "Class / Lecture" });
    typeSelect.createEl("option", { value: "break", text: "Break / Rest" });
    const titleInput = contentEl.createEl("input", { type: "text", placeholder: "Task name..." });
    titleInput.style.width = "100%";
    titleInput.style.marginBottom = "20px";
    const saveBtn = contentEl.createEl("button", { text: "Save Override", cls: "mod-cta" });
    saveBtn.style.width = "100%";
    saveBtn.onclick = async () => {
      if (!titleInput.value.trim()) {
        new import_obsidian7.Notice("Title is required.");
        return;
      }
      const newBlock = {
        id: Math.random().toString(36).substring(2, 9),
        startTime: startInput.value,
        endTime: endInput.value,
        type: typeSelect.value,
        title: titleInput.value.trim(),
        mode: "custom"
      };
      const data = this.plugin.settings.dashboardData;
      if (!data.customDays) data.customDays = {};
      if (!data.customDays[this.todayKey]) data.customDays[this.todayKey] = [];
      data.customDays[this.todayKey].push(newBlock);
      await this.plugin.saveSettings();
      this.onSave();
      this.close();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var AttachNoteModal = class extends import_obsidian7.Modal {
  constructor(app, plugin, topic, onSave) {
    super(app);
    this.plugin = plugin;
    this.topic = topic;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u{1F4CE} Adjuntar Nota" });
    contentEl.createEl("p", { text: `A\xF1ade una nota al tema: ${this.topic.name}`, cls: "text-muted" });
    const inputRow = contentEl.createDiv({ attr: { style: "display: flex; gap: 8px; margin-bottom: 20px;" } });
    const noteInput = inputRow.createEl("input", { type: "text", placeholder: "Ej. Apuntes_Tema1.md" });
    noteInput.style.flexGrow = "1";
    const datalistId = `attach-list-${this.topic.id || Math.random()}`;
    let datalist = document.getElementById(datalistId);
    if (!datalist) datalist = document.body.createEl("datalist", { attr: { id: datalistId } });
    else datalist.empty();
    this.plugin.app.vault.getMarkdownFiles().forEach((f) => {
      datalist.createEl("option", { value: f.path });
    });
    noteInput.setAttribute("list", datalistId);
    const saveBtn = inputRow.createEl("button", { text: "A\xF1adir", cls: "mod-cta" });
    const submitAction = () => {
      const val = noteInput.value.trim();
      if (val) {
        this.onSave(val);
        this.close();
      } else {
        new import_obsidian7.Notice("\u26A0\uFE0F Escribe el nombre de una nota.");
      }
    };
    saveBtn.onclick = submitAction;
    noteInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitAction();
    });
    setTimeout(() => noteInput.focus(), 50);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConfirmDeleteModal = class extends import_obsidian7.Modal {
  constructor(app, title, message, onConfirm) {
    super(app);
    this.title = title;
    this.message = message;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;" } });
    const cancelBtn = btnContainer.createEl("button", { text: "Cancelar" });
    cancelBtn.onclick = () => this.close();
    const confirmBtn = btnContainer.createEl("button", { text: "Borrar", cls: "mod-warning" });
    confirmBtn.onclick = () => {
      this.onConfirm();
      this.close();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// addons/DashboardAddon.ts
var DashboardAddon = class extends CornellAddon {
  constructor(plugin) {
    super(plugin);
    this.id = "ultimate-dashboard";
    this.name = "Cornell Dashboard \u{1F680}";
    this.description = "El centro de comando definitivo: Calendario, Rutinas, Margidoro y Repaso Espaciado.";
  }
  load() {
    console.log(`Cargando addon: ${this.name}`);
    this.plugin.registerView(
      DASHBOARD_VIEW_TYPE,
      (leaf) => new CornellDashboardView(leaf, this.plugin)
    );
    this.plugin.addRibbonIcon("layout-dashboard", "Abrir Cornell Dashboard", () => {
      this.activateView();
    });
    this.plugin.addCommand({
      id: "open-cornell-dashboard",
      name: "Abrir Dashboard de Estudio",
      callback: () => this.activateView()
    });
  }
  unload() {
    console.log(`Descargando addon: ${this.name}`);
    this.plugin.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
  }
  /**
   * Lógica para abrir la vista del dashboard de manera segura.
   * Si ya está abierta, la enfoca. Si no, crea una nueva pestaña.
   */
  async activateView() {
    const { workspace } = this.plugin.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(true);
      if (leaf) {
        await leaf.setViewState({ type: DASHBOARD_VIEW_TYPE, active: true });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
};

// addons/PinboardView.ts
var import_obsidian8 = require("obsidian");
var import_obsidian9 = require("obsidian");
var StitchLabelModal = class extends import_obsidian9.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.result = "";
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "\u{1F517} Crear Conexi\xF3n Sem\xE1ntica" });
    new import_obsidian9.Setting(contentEl).setName("Etiqueta (opcional)").setDesc("\xBFCu\xE1l es la relaci\xF3n entre estas dos notas?").addText(
      (text) => text.setPlaceholder("Ej: miden lo mismo, contradice a...").onChange((value) => {
        this.result = value;
      }).inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.submitAndClose();
        }
      })
    );
    new import_obsidian9.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Conectar").setCta().onClick(() => {
        this.submitAndClose();
      })
    );
  }
  submitAndClose() {
    this.onSubmit(this.result);
    this.close();
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var PINBOARD_VIEW_TYPE = "cornell-pinboard-view";
var StitchStyleMenuModal = class extends import_obsidian9.Modal {
  // Necesitamos acceso a la vista para redibujar en vivo
  constructor(app, stitch, view) {
    super(app);
    this.stitch = stitch;
    this.view = view;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u{1F3A8} Personalizar Conexi\xF3n" });
    new import_obsidian9.Setting(contentEl).setName("Color de la l\xEDnea").addColorPicker((color) => {
      color.setValue(this.stitch.color || "#a277ff");
      color.onChange((value) => {
        this.stitch.color = value;
        this.view.redrawLines();
      });
    });
    new import_obsidian9.Setting(contentEl).setName("Grosor de l\xEDnea").addSlider((slider) => {
      slider.setLimits(1, 15, 1).setValue(this.stitch.thickness || 3).onChange((value) => {
        this.stitch.thickness = value;
        this.view.redrawLines();
      });
    });
    new import_obsidian9.Setting(contentEl).setName("Estilo de l\xEDnea").addDropdown((drop) => {
      drop.addOption("none", "Continua").addOption("5,5", "Punteada cl\xE1sica").addOption("10,10", "Rayas largas").addOption("15,5,5,5", "C\xF3digo Morse").setValue(this.stitch.dasharray || "5,5").onChange((value) => {
        this.stitch.dasharray = value;
        this.view.redrawLines();
      });
    });
    new import_obsidian9.Setting(contentEl).addButton((btn) => {
      btn.setButtonText("Romper Conexi\xF3n").setClass("mod-warning").onClick(() => {
        this.view.canvasData.stitches = this.view.canvasData.stitches.filter(
          (s) => s !== this.stitch
        );
        this.view.redrawLines();
        this.close();
      });
    });
    new import_obsidian9.Setting(contentEl).addButton((btn) => {
      btn.setButtonText("Listo").setCta().onClick(() => this.close());
    });
  }
  onClose() {
    this.view.requestSave();
    this.contentEl.empty();
  }
};
var CanvasFlashcardModal = class extends import_obsidian9.Modal {
  // 👈 NUEVO: Aquí guardaremos el componente vivo
  constructor(app, cards, view) {
    super(app);
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.cards = cards;
    this.view = view;
  }
  onOpen() {
    this.scope.register([], "Enter", (evt) => {
      evt.preventDefault();
      this.handleNextOrFlip();
    });
    this.scope.register([], " ", (evt) => {
      evt.preventDefault();
      this.handleNextOrFlip();
    });
    this.scope.register([], "ArrowRight", (evt) => {
      evt.preventDefault();
      this.handleNextOrFlip();
    });
    this.renderCard();
  }
  handleNextOrFlip() {
    if (!this.isFlipped) {
      this.isFlipped = true;
      this.renderCard();
    } else {
      if (this.currentIndex < this.cards.length - 1) {
        this.currentIndex++;
        this.isFlipped = false;
        this.renderCard();
      } else {
        new import_obsidian8.Notice("\u{1F389} \xA1Has terminado el repaso de este lienzo!");
        this.close();
      }
    }
  }
  renderCard() {
    this.contentEl.empty();
    const card = this.cards[this.currentIndex];
    this.contentEl.createEl("h3", { text: `\u{1F9E0} Repaso Activo (${this.currentIndex + 1} / ${this.cards.length})` });
    const cardEl = this.contentEl.createDiv();
    cardEl.style.minHeight = "200px";
    cardEl.style.display = "flex";
    cardEl.style.flexDirection = "column";
    cardEl.style.justifyContent = "center";
    cardEl.style.alignItems = "center";
    cardEl.style.background = "var(--background-secondary)";
    cardEl.style.border = "1px solid var(--background-modifier-border)";
    cardEl.style.borderRadius = "12px";
    cardEl.style.padding = "30px";
    cardEl.style.marginBottom = "20px";
    cardEl.style.textAlign = "center";
    cardEl.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
    const frontEl = cardEl.createDiv();
    frontEl.style.fontSize = "1.3em";
    frontEl.style.fontWeight = "bold";
    frontEl.style.color = "var(--text-normal)";
    import_obsidian8.MarkdownRenderer.render(this.app, card.front, frontEl, card.sourcePath, this.view);
    if (this.isFlipped) {
      const divider = cardEl.createEl("hr");
      divider.style.width = "80%";
      divider.style.borderColor = "var(--background-modifier-border)";
      divider.style.margin = "20px 0";
      const backEl = cardEl.createDiv();
      backEl.style.fontSize = "1.1em";
      backEl.style.color = "var(--text-muted)";
      import_obsidian8.MarkdownRenderer.render(this.app, card.back, backEl, card.sourcePath, this.view).then(() => {
        setTimeout(() => {
          backEl.querySelectorAll("img, .pdf-cropped-embed, .internal-embed").forEach((el) => {
            const htmlEl = el;
            htmlEl.style.maxWidth = "100%";
            htmlEl.style.height = "auto";
            htmlEl.style.borderRadius = "4px";
            htmlEl.style.display = "block";
            htmlEl.style.minHeight = "50px";
          });
        }, 100);
      });
    }
    const controlsEl = this.contentEl.createDiv();
    controlsEl.style.display = "flex";
    controlsEl.style.justifyContent = "space-between";
    controlsEl.style.gap = "10px";
    const prevBtn = controlsEl.createEl("button", { text: "\u2B05\uFE0F Anterior" });
    prevBtn.disabled = this.currentIndex === 0;
    prevBtn.onclick = () => {
      this.currentIndex--;
      this.isFlipped = false;
      this.renderCard();
    };
    const flipBtn = controlsEl.createEl("button", {
      text: this.isFlipped ? "Siguiente \u27A1\uFE0F" : "\u{1F441}\uFE0F Mostrar Respuesta (Espacio)",
      cls: "mod-cta"
    });
    flipBtn.style.flexGrow = "1";
    flipBtn.onclick = () => this.handleNextOrFlip();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConfirmClearModal = class extends import_obsidian9.Modal {
  constructor(app, onConfirm) {
    super(app);
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "\u{1F9F9} Limpiar Lienzo Espacial" });
    contentEl.createEl("p", {
      text: "\xBFEst\xE1s seguro de que quieres borrar TODAS las notas y conexiones de este lienzo? Esta acci\xF3n no eliminar\xE1 tus notas de Obsidian, pero s\xED destruir\xE1 este mapa visual. No se puede deshacer."
    });
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;" } });
    const cancelBtn = btnContainer.createEl("button", { text: "Cancelar" });
    cancelBtn.onclick = () => this.close();
    const confirmBtn = btnContainer.createEl("button", { text: "Borrar Todo", cls: "mod-warning" });
    confirmBtn.onclick = () => {
      this.onConfirm();
      this.close();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};
var PinboardView = class extends import_obsidian8.TextFileView {
  constructor(leaf, plugin) {
    super(leaf);
    // Variable a nivel de clase
    // 💾 MEMORIA DE ARCHIVO INDIVIDUAL (Reemplaza a los settings globales)
    this.canvasData = { nodes: {}, stitches: [] };
    // 🧵 Memoria de Costura (Stitching)
    this.isStitchingMode = false;
    this.sourceStitchId = null;
    // 🔍 MOTOR DE ZOOM
    this.zoomLevel = 1;
    this.currentTool = "hand";
    this.currentColor = "smart";
    // 🧠 Tinta Inteligente por defecto
    this.currentPenSize = 4;
    this.isDrawingMode = false;
    // Flag maestro para evitar cruces con Drag&Drop
    this.isDoodling = false;
    this.strokePoints = [];
    this.lastDrawnIndex = 1;
    this.isDrawingFrameScheduled = false;
    // 🗺️ MOTOR DE PANEO (NAVEGACIÓN)
    this.isPanning = false;
    this.isSpaceDown = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.scrollStartX = 0;
    this.scrollStartY = 0;
    this.isSelecting = false;
    this.selectStartX = 0;
    this.selectStartY = 0;
    this.selectedNodes = /* @__PURE__ */ new Set();
    // ======================================================
    // 🎨 MOTOR CORE DE DIBUJO Y GOMA (Acelerado por GPU + Cero Lag)
    // ======================================================
    this.saveDoodleTimeout = null;
    this.plugin = plugin;
  }
  getViewType() {
    return PINBOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "Lienzo Espacial";
  }
  getIcon() {
    return "map";
  }
  // 📥 Obsidian llama a esto cuando necesita guardar el archivo
  getViewData() {
    if (this.saveDoodleTimeout && this.doodleCanvasEl) {
      clearTimeout(this.saveDoodleTimeout);
      this.saveDoodleTimeout = null;
      this.canvasData.doodleDataUrl = this.doodleCanvasEl.toDataURL("image/png");
    }
    return JSON.stringify(this.canvasData, null, 2);
  }
  // 📤 Obsidian llama a esto al abrir un archivo para entregarte el texto
  // 📤 Obsidian llama a esto al abrir un archivo para entregarte el texto
  async setViewData(data, clear) {
    var _a;
    if (clear) {
      const htmlNodes = (_a = this.canvasEl) == null ? void 0 : _a.querySelectorAll(".cornell-pinboard-node");
      htmlNodes == null ? void 0 : htmlNodes.forEach((n) => n.remove());
      if (this.svgOverlay) this.svgOverlay.innerHTML = "";
      if (this.doodleCtx) this.doodleCtx.clearRect(0, 0, 5e3, 5e3);
    }
    try {
      this.canvasData = data ? JSON.parse(data) : { nodes: {}, stitches: [] };
      if (!this.canvasData.nodes) this.canvasData.nodes = {};
      if (!this.canvasData.stitches) this.canvasData.stitches = [];
    } catch (e) {
      console.error("Error cargando el archivo de lienzo:", e);
      this.canvasData = { nodes: {}, stitches: [] };
    }
    if (this.canvasData.doodleDataUrl && this.doodleCtx) {
      const img = new Image();
      img.onload = () => {
        this.doodleCtx.drawImage(img, 0, 0);
        this.applySmartInk();
      };
      img.src = this.canvasData.doodleDataUrl;
    }
    await this.renderSavedNodes();
    this.redrawLines();
  }
  // 🧹 MÉTODO OBLIGATORIO DE TextFileView (Cuando se cierra el archivo)
  clear() {
    this.canvasData = { nodes: {}, stitches: [], doodleDataUrl: "" };
    if (this.canvasEl) {
      const htmlNodes = this.canvasEl.querySelectorAll(".cornell-pinboard-node");
      htmlNodes.forEach((node) => node.remove());
    }
    if (this.svgOverlay) this.svgOverlay.innerHTML = "";
    if (this.doodleCtx) this.doodleCtx.clearRect(0, 0, 5e3, 5e3);
  }
  // 🚀 MOTOR DE GUARDADO SIN LAG (Segundo plano)
  saveCanvasInBg() {
    if (!this.doodleCanvasEl) return;
    this.doodleCanvasEl.toBlob((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        this.canvasData.doodleDataUrl = reader.result;
        this.requestSave();
      };
      reader.readAsDataURL(blob);
    }, "image/png");
  }
  // 🧹 NUEVO MOTOR DE LIMPIEZA TOTAL
  clearCanvas() {
    const htmlNodes = this.canvasEl.querySelectorAll(".cornell-pinboard-node");
    htmlNodes.forEach((node) => node.remove());
    if (this.svgOverlay) this.svgOverlay.innerHTML = "";
    this.canvasData = { nodes: {}, stitches: [] };
    this.requestSave();
    new import_obsidian8.Notice("\u2728 El lienzo ha quedado en blanco.");
  }
  async onOpen() {
    this.addAction("trash", "Limpiar todo el lienzo", () => {
      new ConfirmClearModal(this.plugin.app, () => {
        this.clearCanvas();
      }).open();
    });
    this.addAction("camera", "Exportar a Imagen (PNG)", () => {
      this.exportToImage();
    });
    this.addAction("brain-circuit", "Repasar Flashcards del Lienzo", () => {
      this.openFlashcardReview();
    });
    this.addAction("sticky-note", "A\xF1adir Tarjeta de Texto", () => {
      const rect = this.scrollWrapper.getBoundingClientRect();
      const centerX = (this.scrollWrapper.scrollLeft + rect.width / 2) / this.zoomLevel;
      const centerY = (this.scrollWrapper.scrollTop + rect.height / 2) / this.zoomLevel;
      this.addCustomTextNode(centerX - 150, centerY - 50);
    });
    const container = this.containerEl.children[1];
    container.empty();
    this.scrollWrapper = container.createDiv({ cls: "cornell-pinboard-viewport" });
    this.scrollWrapper.style.overflow = "auto";
    this.scrollWrapper.style.width = "100%";
    this.scrollWrapper.style.height = "100%";
    this.scrollWrapper.style.position = "relative";
    this.scrollWrapper.style.backgroundColor = "var(--background-primary-alt)";
    this.canvasEl = this.scrollWrapper.createDiv({ cls: "cornell-pinboard-canvas" });
    this.canvasEl.style.position = "absolute";
    this.canvasEl.style.width = "5000px";
    this.canvasEl.style.height = "5000px";
    this.canvasEl.style.backgroundImage = "radial-gradient(var(--background-modifier-border) 1px, transparent 1px)";
    this.canvasEl.style.backgroundSize = "20px 20px";
    this.canvasEl.style.transformOrigin = "0 0";
    this.canvasEl.style.transition = "transform 0.1s ease-out";
    this.scrollWrapper.addEventListener("wheel", this.handleZoom.bind(this), { passive: false });
    this.svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgOverlay.style.position = "absolute";
    this.svgOverlay.style.top = "0";
    this.svgOverlay.style.left = "0";
    this.svgOverlay.style.width = "100%";
    this.svgOverlay.style.height = "100%";
    this.svgOverlay.style.pointerEvents = "none";
    this.svgOverlay.style.zIndex = "0";
    this.canvasEl.appendChild(this.svgOverlay);
    this.selectionBoxEl = this.scrollWrapper.createDiv();
    this.selectionBoxEl.style.position = "absolute";
    this.selectionBoxEl.style.border = "1px dashed var(--interactive-accent)";
    this.selectionBoxEl.style.backgroundColor = "rgba(var(--text-accent), 0.1)";
    this.selectionBoxEl.style.zIndex = "999";
    this.selectionBoxEl.style.display = "none";
    this.selectionBoxEl.style.pointerEvents = "none";
    this.setupMarqueeSelection();
    this.setupKeyboardShortcuts();
    this.setupPanning();
    this.setupDropZone();
    setTimeout(() => {
      this.scrollWrapper.scrollLeft = 2500 - this.scrollWrapper.clientWidth / 2;
      this.scrollWrapper.scrollTop = 2500 - this.scrollWrapper.clientHeight / 2;
    }, 50);
    this.stitchBannerEl = container.createDiv({ cls: "cornell-focus-banner" });
    this.stitchBannerEl.style.position = "absolute";
    this.stitchBannerEl.style.top = "20px";
    this.stitchBannerEl.style.left = "50%";
    this.stitchBannerEl.style.transform = "translateX(-50%)";
    this.stitchBannerEl.style.zIndex = "1000";
    this.stitchBannerEl.style.display = "none";
    this.canvasEl.addEventListener("mousedown", (e) => {
      if (this.isStitchingMode && e.target === this.canvasEl) {
        this.cancelStitch();
        new import_obsidian8.Notice("Conexi\xF3n cancelada.");
      }
    });
    this.doodleCanvasEl = this.canvasEl.createEl("canvas");
    this.doodleCanvasEl.width = 5e3;
    this.doodleCanvasEl.height = 5e3;
    this.doodleCanvasEl.style.position = "absolute";
    this.doodleCanvasEl.style.top = "0";
    this.doodleCanvasEl.style.left = "0";
    this.doodleCanvasEl.style.zIndex = "5";
    this.doodleCanvasEl.style.pointerEvents = "none";
    this.doodleCtx = this.doodleCanvasEl.getContext("2d");
    this.doodleCtx.lineCap = "round";
    this.doodleCtx.lineJoin = "round";
    const toolbar = container.createDiv({ cls: "cornell-doodle-toolbar" });
    toolbar.style.position = "absolute";
    toolbar.style.bottom = "20px";
    toolbar.style.left = "50%";
    toolbar.style.transform = "translateX(-50%)";
    toolbar.style.zIndex = "2000";
    toolbar.style.display = "flex";
    toolbar.style.gap = "10px";
    toolbar.style.padding = "8px 12px";
    toolbar.style.backgroundColor = "var(--background-primary)";
    toolbar.style.border = "1px solid var(--background-modifier-border)";
    toolbar.style.borderRadius = "12px";
    toolbar.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
    const updateToolbarUI = () => {
      Array.from(toolbar.children).forEach((child) => child.classList.remove("is-active", "mod-cta"));
      if (this.currentTool === "hand") handBtn.classList.add("is-active", "mod-cta");
      if (this.currentTool === "pen") penBtn.classList.add("is-active", "mod-cta");
      if (this.currentTool === "eraser") eraserBtn.classList.add("is-active", "mod-cta");
      this.doodleCanvasEl.style.pointerEvents = this.currentTool !== "hand" ? "auto" : "none";
    };
    const handBtn = toolbar.createEl("button", { title: "Modo Mano (Arrastrar/Seleccionar)" });
    (0, import_obsidian8.setIcon)(handBtn, "hand");
    handBtn.onclick = () => {
      this.currentTool = "hand";
      this.isDrawingMode = false;
      updateToolbarUI();
    };
    const penBtn = toolbar.createEl("button", { title: "L\xE1piz" });
    (0, import_obsidian8.setIcon)(penBtn, "pencil");
    penBtn.onclick = () => {
      this.currentTool = "pen";
      this.isDrawingMode = true;
      updateToolbarUI();
    };
    const eraserBtn = toolbar.createEl("button", { title: "Goma de borrar" });
    (0, import_obsidian8.setIcon)(eraserBtn, "eraser");
    eraserBtn.onclick = () => {
      this.currentTool = "eraser";
      this.isDrawingMode = true;
      updateToolbarUI();
    };
    const colorGrp = toolbar.createDiv({ attr: { style: "display:flex; gap:8px; margin-left: 10px; border-left: 1px solid var(--background-modifier-border); padding-left: 12px; align-items: center;" } });
    const colors = ["smart", "#a277ff", "#ff4d4d", "#00cc66"];
    colors.forEach((c) => {
      const cBtn = colorGrp.createDiv();
      cBtn.style.width = "24px";
      cBtn.style.height = "24px";
      cBtn.style.borderRadius = "50%";
      cBtn.style.cursor = "pointer";
      if (c === "smart") {
        cBtn.style.background = "linear-gradient(135deg, #ffffff 50%, #000000 50%)";
        cBtn.style.border = "1px solid var(--background-modifier-border)";
        cBtn.title = "Tinta Inteligente (Se adapta al tema)";
      } else {
        cBtn.style.backgroundColor = c;
      }
      const highlightSelection = () => {
        Array.from(colorGrp.children).forEach((btn) => {
          if (btn.tagName.toLowerCase() !== "input") btn.style.boxShadow = "none";
        });
        cBtn.style.boxShadow = "0 0 0 2px var(--background-primary), 0 0 0 4px var(--text-normal)";
      };
      cBtn.onclick = () => {
        this.currentColor = c;
        this.currentTool = "pen";
        this.isDrawingMode = true;
        updateToolbarUI();
        highlightSelection();
      };
      if (c === this.currentColor) highlightSelection();
    });
    const sizeSlider = colorGrp.createEl("input", {
      type: "range",
      attr: { min: "1", max: "40", value: this.currentPenSize.toString() }
    });
    sizeSlider.style.width = "80px";
    sizeSlider.style.marginLeft = "10px";
    sizeSlider.style.cursor = "pointer";
    sizeSlider.title = "Grosor del trazo/goma";
    sizeSlider.oninput = (e) => {
      this.currentPenSize = parseInt(e.target.value);
    };
    updateToolbarUI();
    this.setupDoodleEngine();
    this.plugin.registerEvent(this.plugin.app.workspace.on("css-change", () => {
      this.applySmartInk();
    }));
  }
  // 🕸️ MOTOR DE GEOMETRÍA: Dibuja las líneas en vivo
  redrawLines() {
    if (!this.svgOverlay || !this.canvasData.stitches) return;
    this.svgOverlay.innerHTML = "";
    const stitches = this.canvasData.stitches || [];
    for (const stitch of stitches) {
      const sourceNode = document.getElementById(stitch.sourceId);
      const targetNode = document.getElementById(stitch.targetId);
      if (sourceNode && targetNode) {
        const sX = sourceNode.offsetLeft + sourceNode.offsetWidth / 2;
        const sY = sourceNode.offsetTop + sourceNode.offsetHeight / 2;
        const tX = targetNode.offsetLeft + targetNode.offsetWidth / 2;
        const tY = targetNode.offsetTop + targetNode.offsetHeight / 2;
        const distanceX = Math.abs(tX - sX);
        const controlPointOffset = Math.max(50, distanceX * 0.3);
        const pathData = `M ${sX} ${sY} C ${sX + controlPointOffset} ${sY}, ${tX - controlPointOffset} ${tY}, ${tX} ${tY}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "transparent");
        const strokeColor = stitch.color || "var(--interactive-accent)";
        const strokeWidth = stitch.thickness || 3;
        const dashArray = stitch.dasharray || "5,5";
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", strokeWidth.toString());
        if (dashArray !== "none") {
          path.setAttribute("stroke-dasharray", dashArray);
        }
        path.style.pointerEvents = "visibleStroke";
        path.style.cursor = "pointer";
        path.addEventListener("wheel", (e) => {
          e.preventDefault();
          e.stopPropagation();
          let newThickness = (stitch.thickness || 3) + (e.deltaY > 0 ? -1 : 1);
          newThickness = Math.max(1, Math.min(newThickness, 15));
          stitch.thickness = newThickness;
          path.setAttribute("stroke-width", newThickness.toString());
          this.requestSave();
        });
        path.addEventListener("click", (e) => {
          e.stopPropagation();
          new StitchStyleMenuModal(this.plugin.app, stitch, this).open();
        });
        this.svgOverlay.appendChild(path);
        if (stitch.label) {
          const midX = (sX + tX) / 2;
          const midY = (sY + tY) / 2;
          const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          textBg.setAttribute("x", (midX - 30).toString());
          textBg.setAttribute("y", (midY - 10).toString());
          textBg.setAttribute("width", "60");
          textBg.setAttribute("height", "20");
          textBg.setAttribute("fill", "var(--background-primary)");
          textBg.setAttribute("rx", "5");
          const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textNode.setAttribute("x", midX.toString());
          textNode.setAttribute("y", (midY + 4).toString());
          textNode.setAttribute("fill", "var(--text-muted)");
          textNode.setAttribute("font-size", "10px");
          textNode.setAttribute("text-anchor", "middle");
          textNode.textContent = stitch.label;
          this.svgOverlay.appendChild(textBg);
          this.svgOverlay.appendChild(textNode);
        }
      }
    }
  }
  // 🔍 LÓGICA DE ZOOM AL CURSOR
  handleZoom(e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const zoomSensitivity = 1e-3;
    const minZoom = 0.1;
    const maxZoom = 3;
    let zoomDelta = -e.deltaY * zoomSensitivity;
    let newZoom = this.zoomLevel * (1 + zoomDelta);
    newZoom = Math.min(Math.max(minZoom, newZoom), maxZoom);
    if (newZoom === this.zoomLevel) return;
    const rect = this.scrollWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const currentScrollX = this.scrollWrapper.scrollLeft;
    const currentScrollY = this.scrollWrapper.scrollTop;
    const canvasMouseX = (currentScrollX + mouseX) / this.zoomLevel;
    const canvasMouseY = (currentScrollY + mouseY) / this.zoomLevel;
    this.zoomLevel = newZoom;
    this.canvasEl.style.transform = `scale(${this.zoomLevel})`;
    this.scrollWrapper.scrollLeft = canvasMouseX * this.zoomLevel - mouseX;
    this.scrollWrapper.scrollTop = canvasMouseY * this.zoomLevel - mouseY;
  }
  // 🗺️ LÓGICA DE PANEO (ARRASTRAR EL LIENZO) - 🛡️ PARCHE DE FUGA DE MEMORIA
  setupPanning() {
    this.containerEl.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" && !this.isSpaceDown) {
        e.preventDefault();
        this.isSpaceDown = true;
        this.canvasEl.style.cursor = "grab";
      }
    });
    this.containerEl.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        this.isSpaceDown = false;
        if (!this.isPanning) this.canvasEl.style.cursor = "default";
      }
    });
    const onPanMove = (e) => {
      if (!this.isPanning) return;
      const dx = e.clientX - this.panStartX;
      const dy = e.clientY - this.panStartY;
      this.scrollWrapper.scrollLeft = this.scrollStartX - dx;
      this.scrollWrapper.scrollTop = this.scrollStartY - dy;
    };
    const onPanUp = (e) => {
      if (!this.isPanning) return;
      if (e.button === 1 || e.button === 0) {
        this.isPanning = false;
        this.canvasEl.style.cursor = this.isSpaceDown ? "grab" : "default";
        document.removeEventListener("mousemove", onPanMove);
        document.removeEventListener("mouseup", onPanUp);
      }
    };
    this.scrollWrapper.addEventListener("mousedown", (e) => {
      if (e.button === 1 || e.button === 0 && this.isSpaceDown) {
        e.preventDefault();
        this.isPanning = true;
        this.canvasEl.style.cursor = "grabbing";
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.scrollStartX = this.scrollWrapper.scrollLeft;
        this.scrollStartY = this.scrollWrapper.scrollTop;
        document.addEventListener("mousemove", onPanMove);
        document.addEventListener("mouseup", onPanUp);
      }
    });
  }
  // ✂️ MOTOR DE RECORTES (Protegido contra pérdida de GPU)
  extractDoodleToCard(box) {
    if (!this.doodleCtx || !this.doodleCanvasEl) return null;
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    if (width <= 0 || height <= 0) return null;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    tempCtx.drawImage(
      this.doodleCanvasEl,
      box.left,
      box.top,
      width,
      height,
      // Origen
      0,
      0,
      width,
      height
      // Destino
    );
    const imgData = tempCtx.getImageData(0, 0, width, height);
    let hasInk = false;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 0) {
        hasInk = true;
        break;
      }
    }
    if (!hasInk) return null;
    this.doodleCtx.clearRect(box.left, box.top, width, height);
    this.triggerSmartSave();
    const dataUrl = tempCanvas.toDataURL("image/png");
    const nodeId = `sticker-${Date.now()}`;
    const item = {
      text: ``,
      color: "transparent",
      file: null,
      isCustomText: false,
      isDoodleCut: true,
      doodleImg: dataUrl
    };
    this.saveNodeToSettings(nodeId, item, box.left, box.top);
    this.drawNode(nodeId, item, box.left, box.top);
    return nodeId;
  }
  // 🔲 LÓGICA DE DIBUJO DEL RECTÁNGULO DE SELECCIÓN
  setupMarqueeSelection() {
    this.canvasEl.addEventListener("mousedown", (e) => {
      if (e.target !== this.canvasEl && e.target !== this.svgOverlay) return;
      if (this.isSpaceDown || e.button === 1) return;
      if (e.button !== 0 || this.isStitchingMode) return;
      this.isSelecting = true;
      if (!e.shiftKey) this.clearSelection();
      const rect = this.scrollWrapper.getBoundingClientRect();
      this.selectStartX = (e.clientX - rect.left + this.scrollWrapper.scrollLeft) / this.zoomLevel;
      this.selectStartY = (e.clientY - rect.top + this.scrollWrapper.scrollTop) / this.zoomLevel;
      this.selectionBoxEl.style.left = `${this.selectStartX}px`;
      this.selectionBoxEl.style.top = `${this.selectStartY}px`;
      this.selectionBoxEl.style.width = "0px";
      this.selectionBoxEl.style.height = "0px";
      this.selectionBoxEl.style.display = "block";
    });
    this.canvasEl.addEventListener("mousemove", (e) => {
      if (!this.isSelecting) return;
      const rect = this.scrollWrapper.getBoundingClientRect();
      const currentX = (e.clientX - rect.left + this.scrollWrapper.scrollLeft) / this.zoomLevel;
      const currentY = (e.clientY - rect.top + this.scrollWrapper.scrollTop) / this.zoomLevel;
      const left = Math.min(this.selectStartX, currentX);
      const top = Math.min(this.selectStartY, currentY);
      const width = Math.abs(currentX - this.selectStartX);
      const height = Math.abs(currentY - this.selectStartY);
      this.selectionBoxEl.style.left = `${left}px`;
      this.selectionBoxEl.style.top = `${top}px`;
      this.selectionBoxEl.style.width = `${width}px`;
      this.selectionBoxEl.style.height = `${height}px`;
    });
    this.canvasEl.addEventListener("mouseup", () => {
      if (this.currentTool !== "hand" && this.doodleCanvasEl) {
        this.doodleCanvasEl.style.pointerEvents = "auto";
      }
      if (!this.isSelecting) return;
      this.isSelecting = false;
      this.selectionBoxEl.style.display = "none";
      if (parseFloat(this.selectionBoxEl.style.width) < 5) return;
      const box = {
        left: parseFloat(this.selectionBoxEl.style.left),
        top: parseFloat(this.selectionBoxEl.style.top),
        right: parseFloat(this.selectionBoxEl.style.left) + parseFloat(this.selectionBoxEl.style.width),
        bottom: parseFloat(this.selectionBoxEl.style.top) + parseFloat(this.selectionBoxEl.style.height)
      };
      const newStickerId = this.extractDoodleToCard(box);
      if (newStickerId) {
        const stickerEl = document.getElementById(newStickerId);
        if (stickerEl) this.selectNode(newStickerId, stickerEl);
      }
      const nodes = this.canvasEl.querySelectorAll(".cornell-pinboard-node");
      nodes.forEach((el) => {
        const node = el;
        if (node.id === newStickerId) return;
        const n = {
          left: node.offsetLeft,
          top: node.offsetTop,
          right: node.offsetLeft + node.offsetWidth,
          bottom: node.offsetTop + node.offsetHeight
        };
        if (!(box.right < n.left || box.left > n.right || box.bottom < n.top || box.top > n.bottom)) {
          this.selectNode(node.id, node);
        }
      });
    });
  }
  clearSelection() {
    this.selectedNodes.forEach((id) => {
      const el = document.getElementById(id);
      const nData = this.canvasData.nodes[id];
      if (nData && nData.isDoodleCut) {
        if (this.doodleCtx && this.doodleCanvasEl) {
          const img = new Image();
          img.onload = () => {
            this.doodleCtx.drawImage(img, nData.x, nData.y);
            if (el) el.remove();
            delete this.canvasData.nodes[id];
            this.triggerSmartSave();
            this.requestSave();
          };
          img.src = nData.doodleImg;
        }
      } else if (el) {
        el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
      }
    });
    this.selectedNodes.clear();
  }
  // ⌨️ MOTOR DE ATAJOS DE TECLADO
  setupKeyboardShortcuts() {
    this.containerEl.tabIndex = -1;
    this.canvasEl.addEventListener("mousedown", () => {
      this.containerEl.focus();
    });
    this.containerEl.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (this.selectedNodes.size === 0) return;
        e.preventDefault();
        e.stopPropagation();
        const count = this.selectedNodes.size;
        this.selectedNodes.forEach((nodeId) => {
          const nodeEl = document.getElementById(nodeId);
          if (nodeEl) nodeEl.remove();
          delete this.canvasData.nodes[nodeId];
          this.canvasData.stitches = this.canvasData.stitches.filter(
            (s) => s.sourceId !== nodeId && s.targetId !== nodeId
          );
        });
        this.selectedNodes.clear();
        this.requestSave();
        this.redrawLines();
        new import_obsidian8.Notice(`\u{1F5D1}\uFE0F ${count} elemento(s) eliminado(s).`);
      }
    });
  }
  selectNode(id, el) {
    this.selectedNodes.add(id);
    const nodeData = this.canvasData.nodes[id];
    if (!nodeData || !nodeData.isDoodleCut) {
      el.style.boxShadow = "0 0 0 4px var(--color-blue)";
    }
  }
  // Guarda los IDs de las tarjetas seleccionadas
  // 🛸 MOTOR DE DRAG & DROP
  setupDropZone() {
    this.canvasEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    });
    this.canvasEl.addEventListener("drop", async (e) => {
      var _a;
      e.preventDefault();
      const payload = (_a = window.OmniDragManager) == null ? void 0 : _a.payload;
      if (!payload) return;
      const rect = this.canvasEl.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;
      if (payload.type === "group") {
        const parentId = `group-${Date.now()}`;
        const parentItem = {
          text: `# ${payload.title}`,
          // Formato de título
          color: "var(--interactive-accent)",
          file: null
        };
        this.saveNodeToSettings(parentId, parentItem, dropX, dropY);
        this.drawNode(parentId, parentItem, dropX, dropY);
        const idTranslationMap = /* @__PURE__ */ new Map();
        payload.items.forEach((childItem, index) => {
          const childNodeId = `pin-${Date.now()}-${index}`;
          if (childItem.blockId) {
            idTranslationMap.set(childItem.blockId, childNodeId);
          }
          const childX = dropX + 280;
          const childY = dropY + index * 130;
          this.saveNodeToSettings(childNodeId, childItem, childX, childY);
          this.drawNode(childNodeId, childItem, childX, childY);
          this.canvasData.stitches.push({
            sourceId: parentId,
            targetId: childNodeId,
            label: "Incluye"
          });
        });
        payload.items.forEach((childItem) => {
          if (childItem.semanticStitches && childItem.blockId) {
            const sourceNodeId = idTranslationMap.get(childItem.blockId);
            childItem.semanticStitches.forEach((stitch) => {
              const match = stitch.target.match(/#\\^([a-zA-Z0-9]+)/);
              if (match && sourceNodeId) {
                const targetBlockId = match[1];
                const targetNodeId = idTranslationMap.get(targetBlockId);
                if (targetNodeId) {
                  this.canvasData.stitches.push({
                    sourceId: sourceNodeId,
                    targetId: targetNodeId,
                    label: stitch.reason
                    // Ej: "miden lo mismo"
                  });
                }
              }
            });
          }
        });
        this.requestSave();
        this.redrawLines();
        new import_obsidian8.Notice(`\u{1F4E6} Grupo '${payload.title}' materializado con sus hilos.`);
      } else {
        const nodeId = `pin-${Date.now()}`;
        this.saveNodeToSettings(nodeId, payload, dropX, dropY);
        this.drawNode(nodeId, payload, dropX, dropY);
        new import_obsidian8.Notice("\u{1F4CC} \xA1Marginalia materializada!");
      }
    });
  }
  // 🎨 RENDERIZADO FÍSICO DE LA TARJETA
  drawNode(nodeId, item, x, y) {
    var _a;
    const existingNode = this.canvasEl.querySelector(`#${nodeId}`);
    if (existingNode) {
      if (existingNode.style.cursor !== "grabbing") {
        existingNode.style.left = `${x}px`;
        existingNode.style.top = `${y}px`;
      }
      return;
    }
    const node = this.canvasEl.createDiv({ cls: "cornell-pinboard-node" });
    node.id = nodeId;
    node.style.position = "absolute";
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.zIndex = "10";
    if (item.isDoodleCut && item.doodleImg) {
      const img = node.createEl("img", { attr: { src: item.doodleImg } });
      img.style.display = "block";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.pointerEvents = "none";
      node.style.backgroundColor = "transparent";
      node.style.border = "none";
      node.style.boxShadow = "none";
      node.style.minWidth = "unset";
      node.style.width = "fit-content";
      node.style.padding = "0px";
    } else {
      node.style.minWidth = "300px";
      node.style.width = "fit-content";
      node.style.maxWidth = "800px";
      node.style.padding = "12px";
      node.style.backgroundColor = "var(--background-primary)";
      node.style.border = "1px solid var(--background-modifier-border)";
      node.style.borderLeft = `4px solid ${item.color || "var(--text-accent)"}`;
      node.style.borderRadius = "6px";
      node.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
      const markdownContainer = node.createDiv({ cls: "cornell-pinboard-markdown markdown-rendered markdown-preview-view markdown-reading-view" });
      markdownContainer.style.maxHeight = "400px";
      markdownContainer.style.overflowY = "auto";
      markdownContainer.style.overflowX = "hidden";
      let cleanText = (item.text || "").replace(/%%[\s\S]*?%%/g, "").trim();
      cleanText += "\n";
      import_obsidian8.MarkdownRenderer.render(
        this.plugin.app,
        cleanText,
        markdownContainer,
        ((_a = item.file) == null ? void 0 : _a.path) || "",
        this
      ).then(() => {
        setTimeout(() => {
          markdownContainer.querySelectorAll("img, .pdf-cropped-embed, .internal-embed").forEach((el) => {
            const htmlEl = el;
            htmlEl.style.maxWidth = "750px";
            htmlEl.style.height = "auto";
            htmlEl.style.borderRadius = "4px";
            htmlEl.style.display = "block";
          });
        }, 100);
      });
      if (item.file) {
        const meta = node.createDiv({ text: `\u{1F4C4} ${item.file.basename}` });
        meta.style.fontSize = "0.8em";
        meta.style.color = "var(--text-muted)";
        meta.style.marginTop = "8px";
        meta.style.borderTop = "1px dashed var(--background-modifier-border)";
        meta.style.paddingTop = "4px";
      } else if (item.isCustomText) {
        const meta = node.createDiv({ text: `\u270F\uFE0F Doble clic para editar` });
        meta.style.fontSize = "0.8em";
        meta.style.color = "var(--text-muted)";
        meta.style.marginTop = "8px";
        meta.style.borderTop = "1px dashed var(--background-modifier-border)";
        meta.style.paddingTop = "4px";
        node.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          if (node.querySelector("textarea")) return;
          markdownContainer.style.display = "none";
          const textarea = node.createEl("textarea");
          textarea.value = item.text || "";
          textarea.style.width = "100%";
          textarea.style.minHeight = "150px";
          textarea.style.background = "transparent";
          textarea.style.color = "var(--text-normal)";
          textarea.style.border = "1px solid var(--interactive-accent)";
          textarea.style.borderRadius = "4px";
          textarea.style.padding = "8px";
          textarea.style.resize = "vertical";
          textarea.style.fontFamily = "inherit";
          textarea.style.fontSize = "inherit";
          textarea.focus();
          const saveEdit = () => {
            const newText = textarea.value;
            item.text = newText;
            if (this.canvasData.nodes[nodeId]) {
              this.canvasData.nodes[nodeId].text = newText;
              this.requestSave();
            }
            textarea.remove();
            markdownContainer.style.display = "block";
            markdownContainer.empty();
            import_obsidian8.MarkdownRenderer.render(this.plugin.app, newText + "\n", markdownContainer, "", this);
          };
          textarea.addEventListener("blur", saveEdit);
          textarea.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter" && (evt.ctrlKey || evt.metaKey)) {
              evt.preventDefault();
              saveEdit();
            }
          });
        });
      }
      const actionsDiv = node.createDiv();
      actionsDiv.style.position = "absolute";
      actionsDiv.style.bottom = "8px";
      actionsDiv.style.right = "8px";
      actionsDiv.style.display = "flex";
      actionsDiv.style.gap = "4px";
      actionsDiv.style.zIndex = "20";
      const delBtn = actionsDiv.createEl("button", { title: "Remove from Canvas" });
      (0, import_obsidian8.setIcon)(delBtn, "trash");
      this.styleMiniButton(delBtn, "var(--text-muted)");
      delBtn.onclick = (e) => {
        e.stopPropagation();
        node.remove();
        delete this.canvasData.nodes[nodeId];
        this.canvasData.stitches = this.canvasData.stitches.filter((s) => s.sourceId !== nodeId && s.targetId !== nodeId);
        this.requestSave();
        this.redrawLines();
      };
      const stitchBtn = actionsDiv.createEl("button", { title: "Connect to another note" });
      (0, import_obsidian8.setIcon)(stitchBtn, "link");
      this.styleMiniButton(stitchBtn, "var(--color-blue)");
      stitchBtn.onclick = (e) => {
        e.stopPropagation();
        this.handleStitchClick(nodeId, node);
      };
      const expandBtn = actionsDiv.createEl("button", { title: "Expand Context" });
      (0, import_obsidian8.setIcon)(expandBtn, "quote");
      this.styleMiniButton(expandBtn, "var(--color-purple)");
      expandBtn.onclick = (e) => {
        e.stopPropagation();
        if (!item.context) {
          new import_obsidian8.Notice("No hay contexto adicional para esta nota.");
          return;
        }
        const currentX = parseInt(node.style.left, 10);
        const currentY = parseInt(node.style.top, 10);
        const contextX = currentX + 340;
        const contextY = currentY;
        const contextNodeId = `ctx-${Date.now()}`;
        let formattedContext = item.context.trim();
        if (!formattedContext.startsWith(">")) {
          formattedContext = formattedContext.split("\n").map((l) => `> ${l}`).join("\n");
        }
        const contextItem = { text: formattedContext, color: "var(--text-muted)", file: item.file, line: item.line, context: null };
        this.saveNodeToSettings(contextNodeId, contextItem, contextX, contextY);
        this.drawNode(contextNodeId, contextItem, contextX, contextY);
        if (!this.canvasData.stitches) this.canvasData.stitches = [];
        this.canvasData.stitches.push({ sourceId: nodeId, targetId: contextNodeId, label: "Contexto" });
        this.requestSave();
        this.redrawLines();
      };
    }
    node.style.cursor = "grab";
    let isDragging = false;
    let startX = 0, startY = 0;
    let draggedNodesData = /* @__PURE__ */ new Map();
    let animationFrameId = null;
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - startX) / this.zoomLevel;
      const dy = (e.clientY - startY) / this.zoomLevel;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          draggedNodesData.forEach((data) => {
            data.el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          });
          animationFrameId = null;
        });
      }
    };
    const onMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const dx = (e.clientX - startX) / this.zoomLevel;
      const dy = (e.clientY - startY) / this.zoomLevel;
      draggedNodesData.forEach((data, id) => {
        const finalLeft = data.initialLeft + dx;
        const finalTop = data.initialTop + dy;
        data.el.style.transform = "none";
        data.el.style.left = `${finalLeft}px`;
        data.el.style.top = `${finalTop}px`;
        data.el.style.zIndex = "10";
        data.el.style.willChange = "auto";
        const mdContainer = data.el.querySelector(".markdown-rendered");
        if (mdContainer) mdContainer.style.pointerEvents = "auto";
        if (this.canvasData.nodes[id]) {
          this.canvasData.nodes[id].x = finalLeft;
          this.canvasData.nodes[id].y = finalTop;
        }
      });
      this.requestSave();
      this.redrawLines();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (item.isDoodleCut) {
        this.clearSelection();
      }
    };
    node.addEventListener("mousedown", (e) => {
      if (e.target.closest("button, a, .internal-link, .internal-embed, .pdf-embed, .pdf-cropped-embed, img")) return;
      if (this.isSpaceDown || e.button === 1) return;
      e.stopPropagation();
      this.containerEl.focus();
      if (!this.selectedNodes.has(nodeId)) {
        if (!e.shiftKey) this.clearSelection();
        this.selectNode(nodeId, node);
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      draggedNodesData.clear();
      this.selectedNodes.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          draggedNodesData.set(id, {
            initialLeft: parseInt(el.style.left, 10) || 0,
            initialTop: parseInt(el.style.top, 10) || 0,
            el
          });
          el.style.zIndex = "100";
          el.style.willChange = "transform";
          const mdContainer = el.querySelector(".markdown-rendered");
          if (mdContainer) mdContainer.style.pointerEvents = "none";
        }
      });
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }
  // ======================================================
  // ⛓️ LÓGICA DE CONEXIÓN (STITCHING)
  // ======================================================
  handleStitchClick(nodeId, nodeEl) {
    if (!this.isStitchingMode) {
      this.isStitchingMode = true;
      this.sourceStitchId = nodeId;
      nodeEl.style.boxShadow = "0 0 0 4px var(--color-blue)";
      nodeEl.classList.add("is-stitching-source");
      this.stitchBannerEl.style.display = "flex";
      this.stitchBannerEl.style.backgroundColor = "var(--color-blue)";
      this.stitchBannerEl.style.color = "white";
      this.stitchBannerEl.innerHTML = `<span>\u26D3\uFE0F Paso 2: Haz clic en la nota de DESTINO (Clic en el fondo para cancelar)</span>`;
    } else {
      if (this.sourceStitchId === nodeId) {
        new import_obsidian8.Notice("\u26A0\uFE0F No puedes conectar una nota consigo misma.");
        this.cancelStitch();
        return;
      }
      const targetId = nodeId;
      const sourceId = this.sourceStitchId;
      new StitchLabelModal(this.plugin.app, (label) => {
        if (!this.canvasData.stitches) {
          this.canvasData.stitches = [];
        }
        this.canvasData.stitches.push({
          sourceId,
          targetId,
          label
        });
        this.requestSave();
        this.redrawLines();
        this.cancelStitch();
        new import_obsidian8.Notice("\u2728 \xA1Conexi\xF3n establecida!");
      }).open();
    }
  }
  cancelStitch() {
    this.isStitchingMode = false;
    this.sourceStitchId = null;
    this.stitchBannerEl.style.display = "none";
    const sourceNode = this.canvasEl.querySelector(".is-stitching-source");
    if (sourceNode) {
      sourceNode.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
      sourceNode.classList.remove("is-stitching-source");
    }
  }
  styleMiniButton(btn, color) {
    btn.style.width = "24px";
    btn.style.height = "24px";
    btn.style.padding = "4px";
    btn.style.borderRadius = "50%";
    btn.style.backgroundColor = "var(--background-primary)";
    btn.style.border = `1px solid ${color}`;
    btn.style.color = color;
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  }
  // 💾 MEMORIA PERSISTENTE
  saveNodeToSettings(nodeId, item, x, y) {
    if (!this.canvasData.nodes) this.canvasData.nodes = {};
    this.canvasData.nodes[nodeId] = {
      id: nodeId,
      x,
      y,
      text: item.text,
      color: item.color,
      filePath: item.file ? item.file.path : null,
      line: item.line,
      context: item.context,
      isCustomText: item.isCustomText,
      // 👈 VITAL: Recordar que es una nota libre
      isDoodleCut: item.isDoodleCut,
      // 👈 ¡NUEVO! Memorizar que es un recorte de dibujo
      doodleImg: item.doodleImg
      // 👈 ¡NUEVO! Guardar los píxeles del dibujo
    };
    this.requestSave();
  }
  async renderSavedNodes() {
    if (!this.canvasData.nodes) return;
    const nodes = this.canvasData.nodes;
    for (const key in nodes) {
      const n = nodes[key];
      let fileObj = null;
      if (n.filePath) {
        fileObj = this.plugin.app.vault.getAbstractFileByPath(n.filePath);
      }
      const mockItem = {
        text: n.text,
        color: n.color,
        file: fileObj,
        line: n.line,
        context: n.context,
        isCustomText: n.isCustomText,
        // 👈 Cargamos si es nota libre
        isDoodleCut: n.isDoodleCut,
        // 👈 ¡NUEVO! Cargamos la bandera del dibujo
        doodleImg: n.doodleImg
        // 👈 ¡NUEVO! Cargamos la imagen base64
      };
      this.drawNode(n.id, mockItem, n.x, n.y);
    }
  }
  // ======================================================
  // 📝 MOTOR DE TARJETAS DE TEXTO LIBRES (POST-ITS)
  // ======================================================
  addCustomTextNode(x, y) {
    const nodeId = `text-${Date.now()}`;
    const item = {
      text: "Haz doble clic para editar...",
      color: "var(--color-yellow)",
      // Color Post-it por defecto
      file: null,
      isCustomText: true
    };
    this.saveNodeToSettings(nodeId, item, x, y);
    this.drawNode(nodeId, item, x, y);
    new import_obsidian8.Notice("\u{1F4DD} Tarjeta de texto a\xF1adida");
  }
  // Variable para el Anti-Freeze
  // 🧠 MOTOR DE GUARDADO INTELIGENTE Y SIN LAG
  triggerSmartSave() {
    if (this.saveDoodleTimeout) clearTimeout(this.saveDoodleTimeout);
    this.saveDoodleTimeout = setTimeout(() => {
      if (this.isDoodling || this.isSelecting || this.currentTool !== "hand") {
        this.triggerSmartSave();
        return;
      }
      this.doodleCanvasEl.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          this.canvasData.doodleDataUrl = reader.result;
          this.saveDoodleTimeout = null;
          this.requestSave();
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    }, 1500);
  }
  setupDoodleEngine() {
    let cachedRect = null;
    let originalToolBeforeShift = null;
    const getPointerPos = (e) => {
      const rect = cachedRect || this.canvasEl.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / this.zoomLevel,
        y: (e.clientY - rect.top) / this.zoomLevel
      };
    };
    const commitStroke = () => {
      if (!this.isDoodling) return;
      if (this.strokePoints.length > this.lastDrawnIndex) {
        this.doodleCtx.beginPath();
        const p1 = this.strokePoints[this.lastDrawnIndex - 1];
        const p2 = this.strokePoints[this.lastDrawnIndex];
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        this.doodleCtx.moveTo(mid.x, mid.y);
        for (let i = this.lastDrawnIndex + 1; i < this.strokePoints.length; i++) {
          const pt2 = this.strokePoints[i - 1];
          const pt3 = this.strokePoints[i];
          const mid_next = { x: (pt2.x + pt3.x) / 2, y: (pt2.y + pt3.y) / 2 };
          this.doodleCtx.quadraticCurveTo(pt2.x, pt2.y, mid_next.x, mid_next.y);
        }
        this.doodleCtx.stroke();
      }
      this.isDoodling = false;
      this.strokePoints = [];
      this.lastDrawnIndex = 1;
      cachedRect = null;
      this.triggerSmartSave();
    };
    this.doodleCanvasEl.addEventListener("pointerdown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        this.doodleCanvasEl.style.pointerEvents = "none";
        const clonedEvent = new MouseEvent("mousedown", e);
        this.canvasEl.dispatchEvent(clonedEvent);
        return;
      }
      if (this.currentTool === "hand" || e.button !== 0 || this.isSpaceDown) return;
      this.clearSelection();
      if (e.shiftKey && this.currentTool === "pen") {
        originalToolBeforeShift = this.currentTool;
        this.currentTool = "eraser";
      }
      this.doodleCanvasEl.setPointerCapture(e.pointerId);
      this.isDoodling = true;
      cachedRect = this.canvasEl.getBoundingClientRect();
      const isEraser = this.currentTool === "eraser";
      this.doodleCtx.lineWidth = isEraser ? this.currentPenSize * 4 : this.currentPenSize;
      if (isEraser) {
        this.doodleCtx.globalCompositeOperation = "destination-out";
        this.doodleCtx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        this.doodleCtx.globalCompositeOperation = "source-over";
        if (this.currentColor === "smart") {
          this.doodleCtx.strokeStyle = document.body.classList.contains("theme-dark") ? "#ffffff" : "#000000";
        } else {
          this.doodleCtx.strokeStyle = this.currentColor;
        }
      }
      const pos = getPointerPos(e);
      this.strokePoints = [pos, pos];
      this.lastDrawnIndex = 1;
      this.doodleCtx.fillStyle = this.doodleCtx.strokeStyle;
      this.doodleCtx.beginPath();
      this.doodleCtx.arc(pos.x, pos.y, this.doodleCtx.lineWidth / 2, 0, Math.PI * 2);
      this.doodleCtx.fill();
    });
    this.doodleCanvasEl.addEventListener("pointermove", (e) => {
      if (!this.isDoodling) return;
      const coalescedEvents = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of coalescedEvents) {
        this.strokePoints.push(getPointerPos(ev));
      }
      if (this.strokePoints.length > this.lastDrawnIndex) {
        this.doodleCtx.beginPath();
        const p1 = this.strokePoints[this.lastDrawnIndex - 1];
        const p2 = this.strokePoints[this.lastDrawnIndex];
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        this.doodleCtx.moveTo(mid.x, mid.y);
        for (let i = this.lastDrawnIndex + 1; i < this.strokePoints.length; i++) {
          const pt2 = this.strokePoints[i - 1];
          const pt3 = this.strokePoints[i];
          const mid_next = { x: (pt2.x + pt3.x) / 2, y: (pt2.y + pt3.y) / 2 };
          this.doodleCtx.quadraticCurveTo(pt2.x, pt2.y, mid_next.x, mid_next.y);
        }
        this.doodleCtx.stroke();
        this.lastDrawnIndex = this.strokePoints.length - 1;
      }
    });
    this.doodleCanvasEl.addEventListener("pointerup", (e) => {
      this.doodleCanvasEl.releasePointerCapture(e.pointerId);
      commitStroke();
      if (originalToolBeforeShift) {
        this.currentTool = originalToolBeforeShift;
        originalToolBeforeShift = null;
      }
    });
    window.addEventListener("blur", () => {
      if (this.isDoodling) commitStroke();
    });
  }
  // ======================================================
  // 🧠 MOTOR DE TINTA INTELIGENTE (Procesamiento de Píxeles)
  // ======================================================
  applySmartInk() {
    if (!this.doodleCtx || !this.doodleCanvasEl) return;
    const isDark = document.body.classList.contains("theme-dark");
    const imgData = this.doodleCtx.getImageData(0, 0, this.doodleCanvasEl.width, this.doodleCanvasEl.height);
    const data = imgData.data;
    let modified = false;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a === 0) continue;
      const isGrayscale = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
      if (isGrayscale) {
        const brightness = (r + g + b) / 3;
        if (isDark && brightness < 100) {
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
          modified = true;
        } else if (!isDark && brightness > 150) {
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
          modified = true;
        }
      }
    }
    if (modified) {
      this.doodleCtx.putImageData(imgData, 0, 0);
      this.saveCanvasInBg();
    }
  }
  // ======================================================
  // 📸 UTILIDAD: Convertidor de Imagen a Archivo Físico
  // ======================================================
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  // ======================================================
  // 📸 MOTOR DE EXPORTACIÓN A IMAGEN (Cero Dependencias)
  // ======================================================
  async exportToImage() {
    const notice = new import_obsidian8.Notice("\u{1F4F8} Revelando fotograf\xEDa del lienzo... esto puede tardar un momento.", 0);
    try {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const nodes = Array.from(this.canvasEl.querySelectorAll(".cornell-pinboard-node"));
      nodes.forEach((n) => {
        minX = Math.min(minX, n.offsetLeft);
        minY = Math.min(minY, n.offsetTop);
        maxX = Math.max(maxX, n.offsetLeft + n.offsetWidth);
        maxY = Math.max(maxY, n.offsetTop + n.offsetHeight);
      });
      if (minX === Infinity) {
        minX = 0;
        minY = 0;
        maxX = 2500;
        maxY = 2500;
      }
      const padding = 100;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX += padding;
      maxY += padding;
      const exportWidth = maxX - minX;
      const exportHeight = maxY - minY;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = exportWidth;
      finalCanvas.height = exportHeight;
      const ctx = finalCanvas.getContext("2d");
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--background-primary-alt").trim() || "#1e1e1e";
      ctx.fillRect(0, 0, exportWidth, exportHeight);
      if (this.doodleCanvasEl) {
        ctx.drawImage(this.doodleCanvasEl, -minX, -minY);
      }
      const stitches = this.canvasData.stitches || [];
      stitches.forEach((stitch) => {
        const sourceNode = document.getElementById(stitch.sourceId);
        const targetNode = document.getElementById(stitch.targetId);
        if (sourceNode && targetNode) {
          const sX = sourceNode.offsetLeft + sourceNode.offsetWidth / 2 - minX;
          const sY = sourceNode.offsetTop + sourceNode.offsetHeight / 2 - minY;
          const tX = targetNode.offsetLeft + targetNode.offsetWidth / 2 - minX;
          const tY = targetNode.offsetTop + targetNode.offsetHeight / 2 - minY;
          const distanceX = Math.abs(tX - sX);
          const controlPointOffset = Math.max(50, distanceX * 0.3);
          ctx.beginPath();
          ctx.moveTo(sX, sY);
          ctx.bezierCurveTo(
            sX + controlPointOffset,
            sY,
            tX - controlPointOffset,
            tY,
            tX,
            tY
          );
          let strokeColor = stitch.color || "var(--interactive-accent)";
          if (strokeColor.includes("var(")) {
            const varMatch = strokeColor.match(/var\((.*?)\)/);
            if (varMatch) {
              strokeColor = getComputedStyle(document.body).getPropertyValue(varMatch[1]).trim() || "#a277ff";
            }
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = stitch.thickness || 3;
          if (stitch.dasharray && stitch.dasharray !== "none") {
            const dashValues = stitch.dasharray.split(",").map(Number);
            ctx.setLineDash(dashValues);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          if (stitch.label) {
            const midX = (sX + tX) / 2;
            const midY = (sY + tY) / 2;
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--background-primary").trim() || "#2d2d2d";
            ctx.fillRect(midX - 30, midY - 10, 60, 20);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--text-muted").trim() || "#aaaaaa";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(stitch.label, midX, midY);
          }
        }
      });
      nodes.forEach((n) => {
        const x = n.offsetLeft - minX;
        const y = n.offsetTop - minY;
        const w = n.offsetWidth;
        const h = n.offsetHeight;
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--background-primary").trim() || "#2d2d2d";
        ctx.fillRect(x, y, w, h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = n.style.borderLeftColor || "#a277ff";
        ctx.lineWidth = 6;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--text-muted").trim() || "#aaaaaa";
        ctx.font = "14px sans-serif";
        ctx.textBaseline = "top";
        const markdownEl = n.querySelector(".cornell-pinboard-markdown");
        const rawText = markdownEl ? markdownEl.innerText.trim() : n.innerText.trim();
        const paddingLeft = 20;
        const paddingRight = 20;
        const maxWidthText = w - (paddingLeft + paddingRight);
        const lineHeight = 22;
        let textY = y + 25;
        const paragraphs = rawText.split("\n");
        let linesDrawn = 0;
        const maxLinesInPhoto = 14;
        ctx.textAlign = "left";
        for (let i = 0; i < paragraphs.length; i++) {
          if (linesDrawn >= maxLinesInPhoto) break;
          const words = paragraphs[i].split(" ");
          let currentLine = "";
          for (let n2 = 0; n2 < words.length; n2++) {
            if (linesDrawn >= maxLinesInPhoto) break;
            const testLine = currentLine + words[n2] + " ";
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidthText && n2 > 0) {
              ctx.fillText(currentLine, x + paddingLeft, textY);
              currentLine = words[n2] + " ";
              textY += lineHeight;
              linesDrawn++;
            } else {
              currentLine = testLine;
            }
          }
          if (linesDrawn < maxLinesInPhoto && currentLine.trim() !== "") {
            ctx.fillText(currentLine, x + paddingLeft, textY);
            textY += lineHeight;
            linesDrawn++;
          }
        }
      });
      const base64 = finalCanvas.toDataURL("image/png");
      const arrayBuffer = this.base64ToArrayBuffer(base64.replace(/^data:image\/png;base64,/, ""));
      const fileName = `Lienzo_Exportado_${window.moment().format("YYYYMMDD_HHmmss")}.png`;
      await this.plugin.app.vault.createBinary(fileName, arrayBuffer);
      notice.hide();
      new import_obsidian8.Notice(`\u2705 \xA1Fotograf\xEDa exitosa!
Guardada en tu b\xF3veda como: ${fileName}`, 6e3);
    } catch (error) {
      console.error(error);
      notice.hide();
      new import_obsidian8.Notice("\u274C Error al exportar el lienzo.");
    }
  }
  // ======================================================
  // 🧠 MOTOR DE REPASO: Escáner de Flashcards (Visión de Rayos X)
  // ======================================================
  async openFlashcardReview() {
    const flashcards = [];
    const notice = new import_obsidian8.Notice("\u{1F50D} Escaneando archivos originales en el disco...", 0);
    const nodes = Object.values(this.canvasData.nodes);
    for (const node of nodes) {
      if (node.filePath && node.line !== void 0) {
        const file = this.plugin.app.vault.getAbstractFileByPath(node.filePath);
        if (file) {
          const content = await this.plugin.app.vault.read(file);
          const lines = content.split("\n");
          if (node.line >= 0 && node.line < lines.length) {
            const originalLine = lines[node.line];
            const marginaliaRegex = /(?:%%\\?[><](.*?)%%|\\marginalia\{([\s\S]*?)\}|\\\\([\s\S]*?)\\\\)/;
            const match = originalLine.match(marginaliaRegex);
            const marginaliaContent = match ? match[1] || match[2] || match[3] : null;
            if (marginaliaContent && marginaliaContent.includes(";;")) {
              let question = marginaliaContent.split(";;")[0].trim();
              question = question.replace(/^\\>/, "").trim();
              let answer = originalLine.replace(marginaliaRegex, "").trim();
              if (originalLine.trim().startsWith(">") || answer.startsWith(">")) {
                let startLineIdx = node.line;
                while (startLineIdx > 0 && lines[startLineIdx - 1].trim().startsWith(">")) {
                  startLineIdx--;
                }
                let endLineIdx = node.line;
                while (endLineIdx < lines.length - 1) {
                  const nextLine = lines[endLineIdx + 1].trim();
                  if (nextLine.startsWith(">")) {
                    endLineIdx++;
                  } else if (nextLine === "" && endLineIdx + 2 < lines.length && lines[endLineIdx + 2].trim().startsWith(">")) {
                    endLineIdx += 2;
                  } else {
                    break;
                  }
                }
                const calloutLines = [];
                for (let i = startLineIdx; i <= endLineIdx; i++) {
                  if (i === node.line) {
                    let cleanLine = lines[i].replace(marginaliaRegex, "").trim();
                    if (cleanLine === "" || cleanLine === ">") cleanLine = ">";
                    calloutLines.push(cleanLine);
                  } else {
                    calloutLines.push(lines[i].trim());
                  }
                }
                answer = calloutLines.join("\n").trim();
              }
              answer = answer.replace(/\s*\^[a-zA-Z0-9_-]+$/, "").trim();
              if (!answer && node.context) {
                answer = node.context.trim();
              }
              if (question) {
                flashcards.push({
                  front: question,
                  back: answer || "*(Sin contexto de respuesta)*",
                  sourcePath: file.path
                  // Clave para la vinculación nativa en el modal
                });
              }
            }
          }
        }
      }
    }
    notice.hide();
    if (flashcards.length === 0) {
      new import_obsidian8.Notice("\u26A0\uFE0F No se encontraron flashcards.\nAseg\xFArate de tener tarjetas cuyas notas originales incluyan el separador ';;'.");
      return;
    }
    new CanvasFlashcardModal(this.plugin.app, flashcards, this).open();
  }
};

// CornellParser.ts
var UNIVERSAL_MARGINALIA_REGEX = /%%\s*[\\\/]?([><])([\s\S]*?)%%/g;

// main.ts
function sanitizeFileName(name) {
  return name.replace(/[\/\?<>\\:\*\|":]/g, "-").replace(/\.\./g, "").trim();
}
function sanitizeForTemplater(text) {
  return text.replace(/<%/g, "&lt;%").replace(/%>/g, "%&gt;");
}
function sanitizeAnkiDeckName(name) {
  if (!name) return "Default";
  return name.replace(/<[^>]*>?/gm, "").replace(/[^\w\s\-\_:]/g, "").replace(/:{3,}/g, "::").trim();
}
var TagSuggester = class {
  constructor(app, inputEl) {
    this.suggestions = [];
    this.activeIndex = 0;
    this.currentMatchStart = 0;
    this.currentMatchLength = 0;
    this.app = app;
    this.inputEl = inputEl;
    this.suggestEl = document.createElement("div");
    this.suggestEl.className = "suggestion-container cornell-tag-suggest";
    this.suggestEl.style.display = "none";
    this.suggestEl.style.position = "absolute";
    this.suggestEl.style.zIndex = "99999";
    this.suggestEl.style.top = "calc(100% + 2px)";
    this.suggestEl.style.left = "0";
    this.suggestEl.style.width = "100%";
    this.suggestEl.style.maxHeight = "200px";
    this.suggestEl.style.overflowY = "auto";
    const parent = this.inputEl.parentNode;
    if (parent) {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = this.inputEl.style.width || "100%";
      wrapper.style.marginBottom = this.inputEl.style.marginBottom || "0px";
      this.inputEl.style.marginBottom = "0px";
      parent.insertBefore(wrapper, this.inputEl);
      wrapper.appendChild(this.inputEl);
      wrapper.appendChild(this.suggestEl);
    }
    this.inputEl.addEventListener("input", this.onInput.bind(this));
    this.inputEl.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.inputEl.addEventListener("blur", () => setTimeout(() => this.close(), 150));
  }
  onInput() {
    const val = this.inputEl.value;
    const cursorPos = this.inputEl.selectionStart || 0;
    const textBefore = val.substring(0, cursorPos);
    const match = textBefore.match(/(?:^|\s)(#[a-zA-Z0-9_/-]*)$/);
    if (match) {
      const prefix = match[1];
      this.currentMatchStart = cursorPos - prefix.length;
      this.currentMatchLength = prefix.length;
      const allTags = Object.keys(this.app.metadataCache.getTags());
      this.suggestions = allTags.filter((t) => t.toLowerCase().includes(prefix.toLowerCase()) && t !== prefix).slice(0, 10);
      if (this.suggestions.length > 0) {
        this.renderSuggestions();
        return;
      }
    }
    this.close();
  }
  renderSuggestions() {
    this.suggestEl.empty();
    this.activeIndex = 0;
    this.suggestions.forEach((tag, index) => {
      const itemEl = this.suggestEl.createDiv({ cls: "suggestion-item" });
      itemEl.createSpan({ text: tag });
      if (index === 0) itemEl.addClass("is-selected");
      itemEl.onmousedown = (e) => {
        e.preventDefault();
        this.selectSuggestion(tag);
      };
      itemEl.onmouseenter = () => {
        this.suggestEl.querySelectorAll(".suggestion-item").forEach((el) => el.removeClass("is-selected"));
        itemEl.addClass("is-selected");
        this.activeIndex = index;
      };
    });
    this.suggestEl.style.display = "block";
  }
  onKeyDown(e) {
    if (this.suggestEl.style.display === "none") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
      this.updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
      this.updateSelection();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      this.selectSuggestion(this.suggestions[this.activeIndex]);
    } else if (e.key === "Escape") {
      this.close();
    }
  }
  updateSelection() {
    const items = this.suggestEl.querySelectorAll(".suggestion-item");
    items.forEach((item, index) => {
      if (index === this.activeIndex) {
        item.addClass("is-selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.removeClass("is-selected");
      }
    });
  }
  selectSuggestion(tag) {
    const val = this.inputEl.value;
    const before = val.substring(0, this.currentMatchStart);
    const after = val.substring(this.currentMatchStart + this.currentMatchLength);
    this.inputEl.value = before + tag + " " + after;
    this.inputEl.focus();
    const newCursorPos = this.currentMatchStart + tag.length + 1;
    this.inputEl.setSelectionRange(newCursorPos, newCursorPos);
    this.close();
    this.inputEl.dispatchEvent(new Event("input"));
  }
  close() {
    this.suggestEl.style.display = "none";
    this.suggestEl.empty();
  }
};
var _OmniCaptureManager = class _OmniCaptureManager {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
  }
  openDoodle() {
    return new Promise((resolve) => {
      new SidebarDoodleModal(this.app, (arrayBuffer, isInstant) => {
        resolve({ data: arrayBuffer, isInstant });
      }).open();
    });
  }
  // 💾 AQUÍ VIVE TU VIEJA LÓGICA DE GUARDADO (Intacta y Desacoplada)
  async saveCapture(payload, pendingClipboardImageData = null, pendingClipboardImageExt = "png") {
    const thought = payload.thought;
    let rawDestInput = payload.destination;
    let cleanDestName = sanitizeFileName(rawDestInput.replace(/^\d{12,14}\s*-\s*/, "").trim());
    if (!cleanDestName) cleanDestName = "Marginalia Inbox";
    let finalDestName = cleanDestName;
    if (this.plugin.settings.zkMode) {
      const zkId = window.moment().format("YYYYMMDDHHmmss");
      finalDestName = cleanDestName !== "Marginalia Inbox" ? `${zkId} - ${cleanDestName}` : zkId;
    }
    let context = "";
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          if (text && text !== _OmniCaptureManager.lastCapturedContext) {
            context = text.trim();
            _OmniCaptureManager.lastCapturedContext = context;
          }
        }
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const buffer = await blob.arrayBuffer();
          if (buffer.byteLength !== _OmniCaptureManager.lastCapturedImageLength) {
            pendingClipboardImageData = buffer;
            pendingClipboardImageExt = imageType.split("/")[1] || "png";
            _OmniCaptureManager.lastCapturedImageLength = buffer.byteLength;
          }
        }
      }
    } catch (err) {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText !== _OmniCaptureManager.lastCapturedContext) {
          context = clipText.trim();
          _OmniCaptureManager.lastCapturedContext = context;
        }
      } catch (e) {
      }
    }
    let safeContext = sanitizeForTemplater(context);
    if (!thought && !context && !payload.doodleData && !pendingClipboardImageData) {
      new import_obsidian10.Notice("\u26A0\uFE0F Capture is empty!");
      throw new Error("Empty capture");
    }
    let contextImageSyntax = "";
    if (pendingClipboardImageData) {
      const dateStr = window.moment().format("YYYYMMDD_HHmmss");
      const fileName = `clip_${dateStr}.${pendingClipboardImageExt}`;
      let attachmentPath = fileName;
      try {
        attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
      } catch (e) {
      }
      await this.app.vault.createBinary(attachmentPath, pendingClipboardImageData);
      contextImageSyntax = `![[${attachmentPath.split("/").pop()}]]`;
    }
    let doodleSyntax = "";
    if (payload.doodleData) {
      const dateStr = window.moment().format("YYYYMMDD_HHmmss");
      const fileName = `doodle_${dateStr}.png`;
      const folder = this.plugin.settings.doodleFolder.trim();
      let attachmentPath = folder ? `${folder}/${fileName}` : fileName;
      if (folder) await this.plugin.ensureFolderExists(folder);
      else {
        try {
          attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
        } catch (e) {
        }
      }
      await this.app.vault.createBinary(attachmentPath, payload.doodleData);
      doodleSyntax = `img:[[${attachmentPath.split("/").pop()}]]`;
    }
    let marginaliaContent = "";
    if (thought) {
      const parts = thought.split(";;");
      marginaliaContent = parts.map((part, index) => {
        let trimmed = part.trim();
        if (index < parts.length - 1) {
          return `${trimmed};; %%
%%> `;
        }
        return trimmed;
      }).join("");
    }
    if (doodleSyntax) {
      marginaliaContent += marginaliaContent ? `
${doodleSyntax}` : doodleSyntax;
    }
    marginaliaContent = marginaliaContent.trim();
    const defaultTemplate = "\n%%> {{text}} %%\n{{citation}}\n{{image}}\n\n---";
    let templateStr = this.plugin.settings.omniCaptureTemplate || defaultTemplate;
    let finalMd = templateStr.replace(/{{text}}/gi, marginaliaContent).replace(/{{citation}}/gi, safeContext).replace(/{{image}}/gi, contextImageSyntax);
    finalMd = finalMd.replace(/%%>\s*%%/g, "");
    const templaterPlugin = this.app.plugins.plugins["templater-obsidian"];
    if (templaterPlugin && templaterPlugin.templater) {
      try {
        const activeContextFile = this.app.workspace.getActiveFile();
        finalMd = await templaterPlugin.templater.parse_template(
          { target_file: activeContextFile, run_mode: 4 },
          finalMd
        );
      } catch (err) {
        console.warn("Cornell Marginalia: Error de Templater en OmniCapture", err);
      }
    }
    finalMd = finalMd.replace(/\n{4,}/g, "\n\n\n");
    let file = this.app.metadataCache.getFirstLinkpathDest(finalDestName, "");
    if (file instanceof import_obsidian10.TFile) {
      await this.app.vault.append(file, finalMd);
    } else {
      let fileName = finalDestName.endsWith(".md") ? finalDestName : `${finalDestName}.md`;
      let folderPath = this.plugin.settings.zkMode ? this.plugin.settings.zkFolder.trim() : this.plugin.settings.omniCaptureFolder.trim();
      if (folderPath) {
        await this.plugin.ensureFolderExists(folderPath);
        fileName = `${folderPath}/${fileName}`;
      }
      let header = this.plugin.settings.zkMode ? `# \u{1F5C3}\uFE0F ${finalDestName}
` : `# \u{1F4E5} ${finalDestName}
`;
      if (this.plugin.settings.zkMode && this.plugin.settings.zkTemplatePath) {
        const activeFile = this.app.workspace.getActiveFile();
        const activeSourceName = activeFile ? activeFile.basename : "No Active Source";
        const dateStr = window.moment().format("YYYY-MM-DD");
        const timeStr = window.moment().format("HH:mm");
        const templateData = await this.plugin.getTemplateContent(this.plugin.settings.zkTemplatePath, {
          title: finalDestName,
          date: dateStr,
          time: timeStr,
          source_note: activeSourceName
        });
        if (templateData) header = templateData;
      }
      await this.app.vault.create(fileName, header + finalMd);
    }
    new import_obsidian10.Notice(`\u26A1 Capture injected into ${finalDestName}`);
    if (this.plugin.settings.lastOmniDestination !== cleanDestName) {
      this.plugin.settings.lastOmniDestination = cleanDestName;
      await this.plugin.saveSettings();
    }
  }
};
// Memorias estáticas del portapapeles
_OmniCaptureManager.lastCapturedContext = "";
_OmniCaptureManager.lastCapturedImageLength = 0;
var OmniCaptureManager = _OmniCaptureManager;
var OmniDragManager = class {
};
OmniDragManager.payload = null;
var DEFAULT_SETTINGS = {
  exportCleanTags: true,
  exportCleanIds: true,
  dragDropTemplate: "- {{text}} {{source_note}}",
  collapsedBoxes: [],
  pinnedThreads: [],
  structuralColors: [],
  ignoredFolders: "Templates",
  enableSemanticStitching: false,
  alignment: "left",
  marginWidth: 25,
  marginOffset: 20,
  fontSize: "0.85em",
  fontFamily: "inherit",
  adaptiveMode: false,
  enableReadingView: true,
  tags: [
    { prefix: "!", color: "#ffea00" },
    { prefix: "?", color: "#ff9900" },
    { prefix: "X-", color: "#ff4d4d" },
    { prefix: "V-", color: "#00cc66" }
  ],
  outgoingLinks: [],
  lastOmniDestination: "Marginalia Inbox",
  extractHighlights: false,
  ignoredHighlightFolders: "Excalidraw",
  ignoredHighlightTexts: "\u26A0  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. \u26A0",
  showSyntaxInSourceMode: false,
  zkMode: false,
  zkFolder: "Zettelkasten",
  zkTemplatePath: "",
  doodleFolder: "Marginalia Attachments",
  canvasFolder: "Evidence Boards",
  pinboardFolder: "Pinboards",
  pinboardNodes: {},
  pinboardStitches: [],
  pinboardTemplatePath: "",
  pinboardItemTemplatePath: "",
  canvasItemTemplatePath: "",
  omniCaptureFolder: "",
  omniCaptureTemplate: "\n%%> {{text}} %%\n{{citation}}\n{{image}}\n\n---",
  responsiveMarginalia: false,
  responsiveThreshold: 850,
  blurExplanatoryMarginalia: false,
  enableDashboardAddon: false,
  dashboardData: {
    trackerHistory: [],
    deleteCompletedTasks: false,
    enableTaskNotesIntegration: false
  },
  // 👇 LOS VALORES POR DEFECTO PARA LOS NUEVOS USUARIOS
  addons: {
    "gamification-profile": false,
    // Por defecto viene apagado
    "custom-background": false,
    "rhizome-time-machine": false,
    "super-doodle": false,
    // 🎨
    "anki-sync": false,
    "zoom-doodle": false
  },
  userStats: {
    xp: 0,
    level: 1,
    marginaliasCreated: 0,
    colorUsage: {},
    profileImage: "",
    quote: "Stay curious.",
    customBackground: "",
    bgBlur: 5,
    bgOpacity: 0.8,
    rhizomeReviews: {},
    margidoroPending: [],
    activeReading: {}
  },
  enablePdfDoodle: false,
  // recuerda mazos
  ankiRecentDecks: [],
  ankiTagToDeck: {},
  //  VALORES POR DEFECTO MARGIDORO
  margidoro: {
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    logFolder: "Margidoro Logs",
    hardPrefix: "?",
    reviewReminderTime: "20:00",
    // 👈 NUEVO: Hora por defecto
    cyclesBeforeLongBreak: 4
  },
  deleteCompletedTasks: false,
  enableTaskNotesIntegration: false,
  visualHelper: false
};
var VisualAnchorWidget = class extends import_view.WidgetType {
  constructor(color) {
    super();
    this.color = color || "var(--text-accent)";
  }
  toDOM() {
    const dot = document.createElement("span");
    dot.addClass("cornell-visual-anchor");
    dot.style.display = "inline-block";
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = this.color;
    dot.style.marginRight = "4px";
    dot.style.verticalAlign = "middle";
    return dot;
  }
};
var MarginNoteWidget = class extends import_view.WidgetType {
  constructor(text, app, customColor, sourcePath = "", direction = ">", isFlashcard = false) {
    super();
    this.text = text;
    this.app = app;
    this.customColor = customColor;
    this.sourcePath = sourcePath;
    this.direction = direction;
    this.isFlashcard = isFlashcard;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-cornell-margin";
    if (this.isFlashcard) {
      div.classList.add("is-flashcard");
    } else {
      div.classList.add("is-explanatory");
    }
    if (this.customColor) {
      div.style.borderColor = this.customColor;
      div.style.color = this.customColor;
    }
    let finalRenderText = this.text;
    const imagesToRender = [];
    const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
    const imgMatches = Array.from(finalRenderText.matchAll(imgRegex));
    imgMatches.forEach((m) => imagesToRender.push(m[1]));
    finalRenderText = finalRenderText.replace(imgRegex, "").trim();
    const threadLinks = [];
    const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
    const linkMatches = Array.from(finalRenderText.matchAll(linkRegex));
    linkMatches.forEach((m) => threadLinks.push(m[1]));
    finalRenderText = finalRenderText.replace(linkRegex, "").trim();
    import_obsidian10.MarkdownRenderer.render(this.app, finalRenderText, div, this.sourcePath, new import_obsidian10.Component());
    if (imagesToRender.length > 0) {
      imagesToRender.forEach((imgName) => {
        const cleanName = imgName.split("|")[0];
        const file = this.app.metadataCache.getFirstLinkpathDest(cleanName, this.sourcePath);
        if (file) {
          const imgSrc = this.app.vault.getResourcePath(file);
          div.createEl("img", { attr: { src: imgSrc } });
        } else {
          div.createDiv({ text: `\u26A0\uFE0F Imagen no encontrada: ${cleanName}`, cls: "cornell-sidebar-item-text" });
        }
      });
    }
    if (threadLinks.length > 0) {
      const threadContainer = div.createDiv({ cls: "cornell-thread-container" });
      threadLinks.forEach((linkTarget) => {
        const btn = threadContainer.createEl("button", { cls: "cornell-thread-btn", title: `Follow thread: ${linkTarget}` });
        btn.innerHTML = "\u{1F517}";
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.app.workspace.openLinkText(linkTarget, this.sourcePath, true);
        };
        btn.onmouseover = (event) => {
          this.app.workspace.trigger("hover-link", {
            event,
            source: "cornell-marginalia",
            hoverParent: threadContainer,
            targetEl: btn,
            linktext: linkTarget,
            sourcePath: this.sourcePath
          });
        };
      });
    }
    div.onclick = (e) => {
      const target = e.target;
      if (target.tagName !== "A" && !target.hasClass("cornell-thread-btn")) e.preventDefault();
    };
    return div;
  }
  ignoreEvent() {
    return false;
  }
};
var createCornellExtension = (app, settings, getActiveRecallMode) => import_view.ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.buildDecorations(view);
  }
  update(update) {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      this.decorations = this.buildDecorations(update.view);
    }
  }
  buildDecorations(view) {
    const builder = new import_state.RangeSetBuilder();
    if (settings.showSyntaxInSourceMode) {
      const isLivePreview = view.state.field(import_obsidian10.editorLivePreviewField, false);
      if (!isLivePreview) {
        return builder.finish();
      }
    }
    const file = app.workspace.getActiveFile();
    if (file) {
      const ignoredPaths = settings.ignoredFolders.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      for (const path of ignoredPaths) {
        if (file.path.startsWith(path)) return builder.finish();
      }
    }
    const { state } = view;
    const cursorRanges = state.selection.ranges;
    const decorationsData = [];
    for (const { from, to } of view.visibleRanges) {
      const text = state.doc.sliceString(from, to);
      const regex = /%%\s*[\\\/]?([><])([\s\S]*?)%%/g;
      let match;
      while (match = regex.exec(text)) {
        const matchStart = from + match.index;
        const matchEnd = matchStart + match[0].length;
        const direction = match[1];
        const noteContent = match[2];
        const tree = (0, import_language.syntaxTree)(state);
        const node = tree.resolve(matchStart, 1);
        const isCode = node.name.includes("code") || node.name.includes("Code") || node.name.includes("math");
        let isCornellBlock = false;
        if (isCode) {
          let lineNum = state.doc.lineAt(matchStart).number;
          while (lineNum > 0) {
            const lineText = state.doc.line(lineNum).text.trim();
            if (lineText.startsWith("```") || lineText.startsWith("~~~")) {
              if (lineText.toLowerCase().includes("cornell")) {
                isCornellBlock = true;
              }
              break;
            }
            lineNum--;
          }
        }
        if (isCode && !isCornellBlock) continue;
        let isCursorInside = false;
        const line = state.doc.lineAt(matchStart);
        for (const range of cursorRanges) {
          if (range.from >= line.from && range.to <= line.to) {
            isCursorInside = true;
            break;
          }
        }
        if (isCursorInside) continue;
        let tempNoteContent = noteContent.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
        const isFlashcard = tempNoteContent.includes(";;");
        if (isFlashcard) {
          const lineNum = line.number;
          let startLineNum = lineNum;
          let endLineNum = lineNum;
          let textWithoutMarginalia = line.text.replace(/%%[><](.*?)%%/g, "").trim();
          textWithoutMarginalia = textWithoutMarginalia.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
          const isCalloutLine = textWithoutMarginalia.startsWith(">");
          let cleanTextForStandalone = textWithoutMarginalia;
          if (isCalloutLine) cleanTextForStandalone = cleanTextForStandalone.replace(/^>\s*/, "").trim();
          const isStandalone = cleanTextForStandalone === "";
          if (!isStandalone) {
            if (isCalloutLine) {
              while (startLineNum > 1 && state.doc.line(startLineNum - 1).text.trim().startsWith(">")) startLineNum--;
              while (endLineNum < state.doc.lines && state.doc.line(endLineNum + 1).text.trim().startsWith(">")) endLineNum++;
            } else {
            }
          } else {
            let nextIdx = lineNum + 1;
            while (nextIdx <= state.doc.lines && state.doc.line(nextIdx).text.replace(/%%[><](.*?)%%/g, "").trim() === "") nextIdx++;
            if (nextIdx <= state.doc.lines) {
              startLineNum = nextIdx;
              endLineNum = nextIdx;
              const targetText = state.doc.line(nextIdx).text.trim();
              if (targetText.startsWith(">")) {
                while (endLineNum < state.doc.lines && state.doc.line(endLineNum + 1).text.trim().startsWith(">")) endLineNum++;
              } else if (targetText.startsWith("```")) {
                endLineNum++;
                while (endLineNum <= state.doc.lines && !state.doc.line(endLineNum).text.trim().startsWith("```")) endLineNum++;
              }
            }
          }
          for (let n = startLineNum; n <= endLineNum; n++) {
            const targetLine = state.doc.line(n);
            if (!decorationsData.some((d) => d.from === targetLine.from && d.type === 0)) {
              decorationsData.push({
                from: targetLine.from,
                to: targetLine.from,
                type: 0,
                dec: import_view.Decoration.line({ class: "cornell-flashcard-target" })
              });
            }
          }
          tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
        }
        let finalNoteText = tempNoteContent;
        let matchedColor = "var(--text-accent)";
        for (const tag of settings.tags) {
          if (finalNoteText.startsWith(tag.prefix)) {
            matchedColor = tag.color;
            finalNoteText = finalNoteText.substring(tag.prefix.length).trim();
            break;
          }
        }
        if (finalNoteText.length === 0) continue;
        decorationsData.push({
          from: line.from,
          to: line.from,
          type: 1,
          dec: import_view.Decoration.widget({
            // 👇 3. PASAMOS 'isFlashcard' COMO ÚLTIMO PARÁMETRO
            widget: new MarginNoteWidget(finalNoteText, app, matchedColor, (file == null ? void 0 : file.path) || "", direction, isFlashcard),
            side: -1
          })
        });
        if (settings.visualHelper) {
          decorationsData.push({
            from: matchStart,
            to: matchStart,
            // ⚠️ CRÍTICO: Mismo inicio y fin (longitud 0)
            type: 2,
            dec: import_view.Decoration.widget({
              widget: new VisualAnchorWidget(matchedColor),
              side: -1
              // Se renderiza justo antes de la marca de ocultación
            })
          });
        }
        decorationsData.push({
          from: matchStart,
          to: matchEnd,
          type: 3,
          dec: import_view.Decoration.mark({ class: "cornell-hide-raw" })
        });
      }
    }
    decorationsData.sort((a, b) => {
      if (a.from !== b.from) return a.from - b.from;
      if (a.to !== b.to) return a.to - b.to;
      return a.type - b.type;
    });
    decorationsData.forEach((d) => builder.add(d.from, d.to, d.dec));
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations
});
var CORNELL_VIEW_TYPE = "cornell-marginalia-view";
var SemanticStitchModal = class extends import_obsidian10.Modal {
  constructor(app, sourceName, targetName, onSubmit) {
    super(app);
    this.sourceName = sourceName;
    this.targetName = targetName;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u{1F517} Semantic Connection" });
    contentEl.createEl("p", {
      text: `How is "${this.sourceName}" related to "${this.targetName}"?`,
      attr: { style: "color: var(--text-muted); font-size: 0.9em;" }
    });
    const inputEl = contentEl.createEl("input", { type: "text", placeholder: "e.g., miden lo mismo (Leave empty for classic stitch)" });
    inputEl.style.width = "100%";
    inputEl.style.marginBottom = "20px";
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px;" } });
    const cancelBtn = btnContainer.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const confirmBtn = btnContainer.createEl("button", { text: "Stitch Notes", cls: "mod-cta" });
    confirmBtn.style.backgroundColor = "var(--interactive-accent)";
    confirmBtn.style.color = "var(--text-on-accent)";
    confirmBtn.onclick = () => {
      this.onSubmit(inputEl.value.trim());
      this.close();
    };
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmBtn.click();
    });
    setTimeout(() => inputEl.focus(), 50);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ConfirmStitchModal = class extends import_obsidian10.Modal {
  constructor(app, message, onConfirm) {
    super(app);
    this.message = message;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u26A0\uFE0F Multi-Stitch Warning" });
    const p = contentEl.createEl("p", { text: this.message });
    p.style.whiteSpace = "pre-wrap";
    const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "flex-end";
    btnContainer.style.gap = "10px";
    btnContainer.style.marginTop = "20px";
    const cancelBtn = btnContainer.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => {
      this.close();
      new import_obsidian10.Notice("Stitching cancelled.");
    };
    const confirmBtn = btnContainer.createEl("button", { text: "Proceed", cls: "mod-cta" });
    confirmBtn.style.backgroundColor = "var(--interactive-accent)";
    confirmBtn.style.color = "var(--text-on-accent)";
    confirmBtn.onclick = () => {
      this.onConfirm();
      this.close();
    };
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var ThreadMergeModal = class extends import_obsidian10.Modal {
  constructor(app, sourceTag, targetTag, onSubmit) {
    super(app);
    this.sourceTag = sourceTag;
    this.targetTag = targetTag;
    this.onSubmit = onSubmit;
  }
  // --- MODAL DE FUSIÓN DE HILOS (DRAG & DROP) ---
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u{1F5C2}\uFE0F Merge Threads" });
    const descEl = contentEl.createEl("p", { cls: "cornell-modal-text" });
    descEl.appendText("You are grouping ");
    descEl.createEl("b", { text: this.sourceTag });
    descEl.appendText(" and ");
    descEl.createEl("b", { text: this.targetTag });
    descEl.appendText(".");
    contentEl.createEl("p", {
      text: "Enter a name for the new parent collection (e.g., 'abuelo'):",
      attr: { style: "font-size: 0.9em; color: var(--text-muted); margin-bottom: 5px;" }
    });
    const inputEl = contentEl.createEl("input", { type: "text", placeholder: "New collection name..." });
    inputEl.style.width = "100%";
    inputEl.style.marginBottom = "20px";
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: flex-end; gap: 10px;" } });
    const cancelBtn = btnContainer.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const confirmBtn = btnContainer.createEl("button", { text: "Group Threads", cls: "mod-cta" });
    confirmBtn.onclick = () => {
      const val = inputEl.value.trim();
      if (!val) {
        new import_obsidian10.Notice("\u26A0\uFE0F Please enter a valid name.");
        return;
      }
      const safeTagName = val.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      this.onSubmit(safeTagName);
      this.close();
    };
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmBtn.click();
    });
    setTimeout(() => inputEl.focus(), 50);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DoodleModal = class extends import_obsidian10.Modal {
  constructor(app, editor) {
    super(app);
    this.isDrawing = false;
    this.editor = editor;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "80vw";
    this.modalEl.style.maxWidth = "800px";
    this.scope.register(["Mod"], "Enter", (e) => {
      e.preventDefault();
      this.saveDoodle();
    });
    contentEl.createEl("h3", { text: "\u270F\uFE0F Marginalia Doodle" });
    const canvasContainer = contentEl.createDiv();
    canvasContainer.style.border = "2px dashed var(--background-modifier-border)";
    canvasContainer.style.borderRadius = "8px";
    canvasContainer.style.backgroundColor = "#ffffff";
    canvasContainer.style.cursor = "crosshair";
    canvasContainer.style.touchAction = "none";
    this.canvas = canvasContainer.createEl("canvas");
    this.canvas.width = 750;
    this.canvas.height = 400;
    this.canvas.style.display = "block";
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#000000";
    this.canvas.addEventListener("pointerdown", (e) => {
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.isDrawing) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
    });
    this.canvas.addEventListener("pointerup", () => {
      this.isDrawing = false;
    });
    this.canvas.addEventListener("pointerout", () => {
      this.isDrawing = false;
    });
    const btnContainer = contentEl.createDiv();
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    btnContainer.style.marginTop = "15px";
    const leftBtns = btnContainer.createDiv();
    leftBtns.style.display = "flex";
    leftBtns.style.gap = "8px";
    const penBtn = leftBtns.createEl("button", { cls: "mod-cta" });
    (0, import_obsidian10.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = leftBtns.createEl("button");
    (0, import_obsidian10.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = leftBtns.createEl("button");
    (0, import_obsidian10.setIcon)(clearBtn, "trash-2");
    clearBtn.setAttribute("aria-label", "Clear Canvas");
    penBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = 3;
      penBtn.addClass("mod-cta");
      eraserBtn.removeClass("mod-cta");
    };
    eraserBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = 20;
      eraserBtn.addClass("mod-cta");
      penBtn.removeClass("mod-cta");
    };
    clearBtn.onclick = () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const rightBtns = btnContainer.createDiv();
    rightBtns.style.display = "flex";
    rightBtns.style.gap = "10px";
    const cancelBtn = rightBtns.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const saveBtn = rightBtns.createEl("button", { text: "Save to Margin", cls: "mod-cta" });
    saveBtn.style.backgroundColor = "var(--interactive-accent)";
    saveBtn.style.color = "var(--text-on-accent)";
    saveBtn.onclick = () => this.saveDoodle();
  }
  async saveDoodle() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const arrayBuffer = base64ToArrayBuffer2(base64Data);
    const dateStr = window.moment().format("YYYYMMDD_HHmmss");
    const fileName = `doodle_${dateStr}.png`;
    try {
      const activeFile = this.app.workspace.getActiveFile();
      let attachmentPath = fileName;
      if (activeFile) {
        try {
          attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, activeFile.path);
        } catch (e) {
          const parentPath = activeFile.parent ? activeFile.parent.path : "";
          attachmentPath = parentPath === "/" || !parentPath ? fileName : `${parentPath}/${fileName}`;
        }
      }
      await this.app.vault.createBinary(attachmentPath, arrayBuffer);
      const actualFileName = attachmentPath.split("/").pop();
      const insertion = `%%> img:[[${actualFileName}]] %%`;
      const cursor = this.editor.getCursor();
      this.editor.replaceRange(insertion, cursor);
      new import_obsidian10.Notice("\u270F\uFE0F Doodle saved!");
      this.close();
    } catch (error) {
      new import_obsidian10.Notice("Error saving doodle. Check console.");
      console.error(error);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
function base64ToArrayBuffer2(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
var _OmniCaptureModal = class _OmniCaptureModal extends import_obsidian10.Modal {
  constructor(app, plugin) {
    super(app);
    this.isDrawing = false;
    this.hasDoodle = false;
    this.clipboardImageData = null;
    this.clipboardImageExt = "png";
    this.plugin = plugin;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "60vw";
    this.modalEl.style.maxWidth = "700px";
    contentEl.createEl("h2", { text: "\u26A1 Omni-Capture" });
    const destRow = contentEl.createDiv({ attr: { style: "margin-bottom: 15px; display: flex; gap: 10px; align-items: center;" } });
    destRow.createSpan({ text: "\u{1F4E5} Destination:", attr: { style: "font-weight: bold;" } });
    const lastTarget = this.plugin.settings.lastOmniDestination || "Marginalia Inbox";
    this.destinationInput = destRow.createEl("input", { type: "text", value: lastTarget });
    this.destinationInput.style.flexGrow = "1";
    const datalist = contentEl.createEl("datalist");
    datalist.id = "omni-vault-files";
    this.app.vault.getMarkdownFiles().forEach((f) => datalist.createEl("option", { value: f.basename }));
    this.destinationInput.setAttribute("list", "omni-vault-files");
    contentEl.createEl("h4", { text: "\u{1F4A1} Your Idea/Thought:", attr: { style: "margin-bottom: 5px;" } });
    this.thoughtInput = contentEl.createEl("textarea", { placeholder: "e.g., Windows is like fast food, Linux is fresh vegetables..." });
    this.thoughtInput.style.width = "100%";
    this.thoughtInput.style.height = "80px";
    this.thoughtInput.style.marginBottom = "15px";
    new TagSuggester(this.app, this.thoughtInput);
    const contextHeader = contentEl.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;" } });
    contextHeader.createEl("h4", { text: "\u{1F4C4} Context (Clipboard):", attr: { style: "margin: 0;" } });
    const clearCtxBtn = contextHeader.createEl("span", { text: "\u{1F9F9} Clear", attr: { style: "cursor: pointer; font-size: 0.85em; color: var(--text-muted);" } });
    clearCtxBtn.onclick = () => {
      this.clipboardInput.value = "";
      this.clipboardImageData = null;
      this.clipboardImagePreview.style.display = "none";
      this.clipboardImagePreview.src = "";
      this.clipboardInput.placeholder = "Context cleared. Type or paste (Ctrl+V) here...";
    };
    this.clipboardInput = contentEl.createEl("textarea", { placeholder: "Loading clipboard..." });
    this.clipboardInput.style.width = "100%";
    this.clipboardInput.style.height = "60px";
    this.clipboardInput.style.opacity = "0.8";
    this.clipboardImagePreview = contentEl.createEl("img");
    this.clipboardImagePreview.style.maxWidth = "100%";
    this.clipboardImagePreview.style.maxHeight = "200px";
    this.clipboardImagePreview.style.display = "none";
    this.clipboardImagePreview.style.marginTop = "10px";
    this.clipboardImagePreview.style.borderRadius = "8px";
    this.clipboardImagePreview.style.border = "1px solid var(--background-modifier-border)";
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          if (text && text !== _OmniCaptureModal.lastCapturedContext) {
            this.clipboardInput.value = text;
          } else if (text) {
            this.clipboardInput.placeholder = "Old clipboard ignored. Paste (Ctrl+V) if needed.";
          }
        }
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const buffer = await blob.arrayBuffer();
          if (buffer.byteLength !== _OmniCaptureModal.lastCapturedImageLength) {
            this.clipboardImageData = buffer;
            this.clipboardImageExt = imageType.split("/")[1] || "png";
            this.clipboardImagePreview.src = URL.createObjectURL(blob);
            this.clipboardImagePreview.style.display = "block";
          }
        }
      }
    } catch (err) {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText !== _OmniCaptureModal.lastCapturedContext) {
          this.clipboardInput.value = clipText;
        }
      } catch (e) {
        this.clipboardInput.placeholder = "Paste your context here (Ctrl+V)...";
      }
    }
    this.modalEl.addEventListener("paste", async (e) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            this.clipboardImageData = await blob.arrayBuffer();
            this.clipboardImageExt = blob.type.split("/")[1] || "png";
            this.clipboardImagePreview.src = URL.createObjectURL(blob);
            this.clipboardImagePreview.style.display = "block";
          }
        }
      }
    });
    this.canvasContainer = contentEl.createDiv();
    this.canvasContainer.style.display = "none";
    this.canvasContainer.style.border = "2px dashed var(--background-modifier-border)";
    this.canvasContainer.style.borderRadius = "8px";
    this.canvasContainer.style.backgroundColor = "#ffffff";
    this.canvasContainer.style.cursor = "crosshair";
    this.canvasContainer.style.marginTop = "15px";
    this.canvasContainer.style.touchAction = "none";
    this.canvas = this.canvasContainer.createEl("canvas");
    this.canvas.width = 650;
    this.canvas.height = 250;
    this.canvas.style.display = "block";
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#000000";
    this.canvas.addEventListener("pointerdown", (e) => {
      this.isDrawing = true;
      this.hasDoodle = true;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.isDrawing) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
    });
    this.canvas.addEventListener("pointerup", () => {
      this.isDrawing = false;
    });
    this.canvas.addEventListener("pointerout", () => {
      this.isDrawing = false;
    });
    this.canvas.addEventListener("pointerout", () => {
      this.isDrawing = false;
    });
    const doodleTools = this.canvasContainer.createDiv();
    doodleTools.style.display = "flex";
    doodleTools.style.gap = "8px";
    doodleTools.style.marginTop = "10px";
    doodleTools.style.paddingTop = "10px";
    doodleTools.style.borderTop = "1px solid var(--background-modifier-border)";
    const penBtn = doodleTools.createEl("button", { cls: "mod-cta" });
    (0, import_obsidian10.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = doodleTools.createEl("button");
    (0, import_obsidian10.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = doodleTools.createEl("button");
    (0, import_obsidian10.setIcon)(clearBtn, "trash-2");
    clearBtn.setAttribute("aria-label", "Clear Doodle");
    penBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = 3;
      penBtn.addClass("mod-cta");
      eraserBtn.removeClass("mod-cta");
    };
    eraserBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = 20;
      eraserBtn.addClass("mod-cta");
      penBtn.removeClass("mod-cta");
    };
    clearBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.hasDoodle = false;
    };
    const btnContainer = contentEl.createDiv({ attr: { style: "display: flex; justify-content: space-between; margin-top: 20px;" } });
    const doodleBtn = btnContainer.createEl("button", { text: "\u{1F3A8} Add Doodle" });
    doodleBtn.onclick = () => {
      if (this.canvasContainer.style.display === "none") {
        this.canvasContainer.style.display = "block";
        doodleBtn.innerText = "\u{1F5D1}\uFE0F Clear Doodle";
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.hasDoodle = false;
        this.canvasContainer.style.display = "none";
        doodleBtn.innerText = "\u{1F3A8} Add Doodle";
      }
    };
    const rightBtns = btnContainer.createDiv({ attr: { style: "display: flex; gap: 10px;" } });
    const cancelBtn = rightBtns.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const saveBtn = rightBtns.createEl("button", { text: "\u{1F4BE} Save Capture", cls: "mod-cta" });
    saveBtn.style.backgroundColor = "var(--interactive-accent)";
    saveBtn.style.color = "var(--text-on-accent)";
    saveBtn.onclick = () => this.saveCapture();
    this.modalEl.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.saveCapture();
      }
    });
    setTimeout(() => {
      this.thoughtInput.focus();
    }, 50);
  }
  async saveCapture() {
    const thought = this.thoughtInput.value.trim();
    const context = this.clipboardInput.value.trim();
    let rawDestInput = this.destinationInput.value.trim() || "Marginalia Inbox";
    let cleanDestName = sanitizeFileName(rawDestInput.replace(/^\d{12,14}\s*-\s*/, "").trim());
    if (!cleanDestName) cleanDestName = "Marginalia Inbox";
    let finalDestName = cleanDestName;
    if (this.plugin.settings.zkMode) {
      const zkId = window.moment().format("YYYYMMDDHHmmss");
      if (cleanDestName !== "Marginalia Inbox") {
        finalDestName = `${zkId} - ${cleanDestName}`;
      } else {
        finalDestName = zkId;
      }
    }
    if (!thought && !context && !this.hasDoodle && !this.clipboardImageData) {
      new import_obsidian10.Notice("Capture is empty!");
      return;
    }
    if (this.plugin.settings.lastOmniDestination !== cleanDestName) {
      this.plugin.settings.lastOmniDestination = cleanDestName;
      await this.plugin.saveSettings();
    }
    _OmniCaptureModal.lastCapturedContext = context;
    _OmniCaptureModal.lastCapturedImageLength = this.clipboardImageData ? this.clipboardImageData.byteLength : 0;
    let contextImageSyntax = "";
    if (this.clipboardImageData) {
      const dateStr = window.moment().format("YYYYMMDD_HHmmss");
      const fileName = `clip_${dateStr}.${this.clipboardImageExt}`;
      let attachmentPath = fileName;
      try {
        attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
      } catch (e) {
        attachmentPath = fileName;
      }
      await this.app.vault.createBinary(attachmentPath, this.clipboardImageData);
      const actualFileName = attachmentPath.split("/").pop();
      contextImageSyntax = `![[${actualFileName}]]`;
    }
    let doodleSyntax = "";
    if (this.hasDoodle) {
      const dataUrl = this.canvas.toDataURL("image/png");
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const dateStr = window.moment().format("YYYYMMDD_HHmmss");
      const fileName = `doodle_${dateStr}.png`;
      const folder = this.plugin.settings.doodleFolder.trim();
      let attachmentPath = fileName;
      if (folder) {
        await this.plugin.ensureFolderExists(folder);
        attachmentPath = `${folder}/${fileName}`;
      } else {
        try {
          attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
        } catch (e) {
          attachmentPath = fileName;
        }
      }
      await this.app.vault.createBinary(attachmentPath, bytes.buffer);
      const actualFileName = attachmentPath.split("/").pop();
      doodleSyntax = `img:[[${actualFileName}]]`;
    }
    let marginaliaContent = "";
    if (thought) marginaliaContent += `${thought} `;
    if (doodleSyntax) marginaliaContent += `${doodleSyntax}`;
    let finalMd = "\n";
    if (marginaliaContent.trim()) {
      finalMd += `%%> ${marginaliaContent.trim()} %%
`;
    }
    if (context) {
      finalMd += `${context}
`;
    }
    if (contextImageSyntax) {
      finalMd += `${contextImageSyntax}
`;
    }
    finalMd += `
---
`;
    let file = this.app.metadataCache.getFirstLinkpathDest(finalDestName, "");
    try {
      if (file instanceof import_obsidian10.TFile) {
        await this.app.vault.append(file, finalMd);
      } else {
        let fileName = finalDestName.endsWith(".md") ? finalDestName : `${finalDestName}.md`;
        let folderPath = "";
        if (this.plugin.settings.zkMode) {
          folderPath = this.plugin.settings.zkFolder.trim();
        } else {
          folderPath = this.plugin.settings.omniCaptureFolder.trim();
        }
        if (folderPath) {
          await this.plugin.ensureFolderExists(folderPath);
          fileName = `${folderPath}/${fileName}`;
        }
        let header = this.plugin.settings.zkMode ? `# \u{1F5C3}\uFE0F ${finalDestName}
` : `# \u{1F4E5} ${finalDestName}
`;
        if (this.plugin.settings.zkMode && this.plugin.settings.zkTemplatePath) {
          const activeFile = this.app.workspace.getActiveFile();
          const activeSourceName = activeFile ? activeFile.basename : "No Active Source";
          const dateStr = window.moment().format("YYYY-MM-DD");
          const timeStr = window.moment().format("HH:mm");
          const templateData = await this.plugin.getTemplateContent(this.plugin.settings.zkTemplatePath, {
            title: finalDestName,
            date: dateStr,
            time: timeStr,
            source_note: activeSourceName
            // 🎯 Inyectamos inteligentemente el archivo activo
          });
          if (templateData) header = templateData;
        }
        await this.app.vault.create(fileName, header + finalMd);
      }
      new import_obsidian10.Notice(`\u2705 Capture injected into ${finalDestName}`);
      if (this.plugin.settings.addons && this.plugin.settings.addons["gamification-profile"]) {
        this.plugin.gamificationAddon.addXp();
        this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
          if (leaf.view instanceof CornellNotesView) leaf.view.renderUI();
        });
      }
      this.close();
    } catch (error) {
      new import_obsidian10.Notice("Error saving capture. Check console.");
      console.error(error);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
// 🧠 CACHÉ INTELIGENTE (Memoria a corto plazo del Plugin)
_OmniCaptureModal.lastCapturedContext = "";
_OmniCaptureModal.lastCapturedImageLength = 0;
var OmniCaptureModal = _OmniCaptureModal;
var SidebarDoodleModal = class extends import_obsidian10.Modal {
  constructor(app, onSave) {
    super(app);
    this.isDrawing = false;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "80vw";
    this.modalEl.style.maxWidth = "800px";
    this.scope.register(["Mod"], "Enter", (e) => {
      e.preventDefault();
      this.attachDoodle(true);
    });
    contentEl.createEl("h3", { text: "\u270F\uFE0F Omni-Capture Doodle" });
    const canvasContainer = contentEl.createDiv();
    canvasContainer.style.border = "2px dashed var(--background-modifier-border)";
    canvasContainer.style.borderRadius = "8px";
    canvasContainer.style.backgroundColor = "#ffffff";
    canvasContainer.style.cursor = "crosshair";
    canvasContainer.style.touchAction = "none";
    this.canvas = canvasContainer.createEl("canvas");
    this.canvas.width = 750;
    this.canvas.height = 400;
    this.canvas.style.display = "block";
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#000000";
    this.canvas.addEventListener("pointerdown", (e) => {
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.isDrawing) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();
    });
    this.canvas.addEventListener("pointerup", () => {
      this.isDrawing = false;
    });
    this.canvas.addEventListener("pointerout", () => {
      this.isDrawing = false;
    });
    const btnContainer = contentEl.createDiv();
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "space-between";
    btnContainer.style.marginTop = "15px";
    const leftBtns = btnContainer.createDiv();
    leftBtns.style.display = "flex";
    leftBtns.style.gap = "8px";
    const penBtn = leftBtns.createEl("button", { cls: "mod-cta" });
    (0, import_obsidian10.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = leftBtns.createEl("button");
    (0, import_obsidian10.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = leftBtns.createEl("button");
    (0, import_obsidian10.setIcon)(clearBtn, "trash-2");
    clearBtn.setAttribute("aria-label", "Clear Canvas");
    penBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = 3;
      penBtn.addClass("mod-cta");
      eraserBtn.removeClass("mod-cta");
    };
    eraserBtn.onclick = (e) => {
      e.preventDefault();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = 20;
      eraserBtn.addClass("mod-cta");
      penBtn.removeClass("mod-cta");
    };
    clearBtn.onclick = () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const rightBtns = btnContainer.createDiv({ attr: { style: "display: flex; gap: 10px;" } });
    const cancelBtn = rightBtns.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const saveBtn = rightBtns.createEl("button", { text: "\u2714\uFE0F Attach" });
    saveBtn.title = "Attach image and keep writing";
    saveBtn.onclick = () => this.attachDoodle(false);
    const zapBtn = rightBtns.createEl("button", { text: " Save", cls: "mod-cta" });
    (0, import_obsidian10.setIcon)(zapBtn, "zap");
    zapBtn.setAttribute("aria-label", "Save Entire Capture Now (Ctrl+Enter)");
    zapBtn.style.backgroundColor = "var(--interactive-accent)";
    zapBtn.style.color = "var(--text-on-accent)";
    zapBtn.style.display = "flex";
    zapBtn.style.alignItems = "center";
    zapBtn.style.gap = "4px";
    zapBtn.onclick = () => this.attachDoodle(true);
  }
  attachDoodle(instant) {
    const dataUrl = this.canvas.toDataURL("image/png");
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const arrayBuffer = base64ToArrayBuffer2(base64Data);
    this.onSave(arrayBuffer, instant);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var _CornellNotesView = class _CornellNotesView extends import_obsidian10.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.currentTab = "current";
    // 🧠 Memoria para el Cosido por Teclado
    this.selectedForStitch = [];
    this.isStitchingMode = false;
    this.sourceStitchItem = null;
    this.searchQuery = "";
    this.activeColorFilters = /* @__PURE__ */ new Set();
    this.cachedItems = [];
    // NUEVO: Memoria para el filtro de "Ultra-Recientes" (Sesión activa)
    this.isRecentFilterActive = false;
    // 📖 NUEVO: Memoria para el modo de salto directo a PDF++
    this.isDirectPdfModeActive = false;
    // 🧠 NUEVO: Memoria para el Active Recall en PDFs
    this.isActiveRecallPdfMode = false;
    // 💬 NUEVO: Memoria para el Overlay Mode (Píldoras en PDF)
    this.isPdfPillsModeActive = false;
    // ⚡ NUEVO: Memoria para el Filtro de Flashcards
    this.isFlashcardFilterActive = false;
    // 📍 NUEVO: Memoria para el filtro de Hilos Locales (Solo Nota Actual)
    this.isLocalThreadsActive = false;
    // 🚀 NUEVA MEMORIA RAM (Caché de Bóveda)
    this.vaultCache = /* @__PURE__ */ new Map();
    // 📚 MEMORIA ZOTLIKE
    this.isZotlikeMode = false;
    this.activePdfName = "";
    this.draggedSidebarItems = null;
    this.isGroupedByContent = false;
    this.isGroupedByFolder = false;
    // 📁 NUEVO: Memoria para la vista de carpetas
    this.pinboardItems = [];
    this.pinboardFocusIndex = null;
    this.targetInsertIndex = null;
    this.targetInsertAsChild = false;
    this.isSliderOpen = false;
    // HASTA ACA
    this.autoPasteInterval = null;
    this.lastClipboardText = "";
    // 🚀 NUEVA CACHÉ PARA OPTIMIZAR IMÁGENES
    this.imagePathCache = {};
    // 🎨 VARIABLES DEL LIENZO INMORTAL (ZEN DOODLE)
    this.isZenMode = false;
    this.zenCanvasEl = null;
    this.zenCtx = null;
    this.zenIsDrawing = false;
    //templater
    this.pendingDoodleData = null;
    this.pendingClipboardImageData = null;
    this.pendingClipboardImageExt = "png";
    // --- 🧠 ESTADOS DE BLURTING ---
    this.isBlurtingActive = false;
    this.isAuditing = false;
    this.originalCanvasData = null;
    this.blurtingFormat = "textual";
    // 👈 Nueva memoria
    this.blurtingDeck = [];
    this.plugin = plugin;
  }
  getViewType() {
    return CORNELL_VIEW_TYPE;
  }
  getDisplayText() {
    return "Marginalia Explorer";
  }
  getIcon() {
    return "list";
  }
  async onOpen() {
    this.renderUI();
    await this.scanNotes();
  }
  // 🎨 MOTOR DEL ZEN DOODLE (LIENZO DE PANEL COMPLETO)
  renderZenDoodle(container) {
    const zenContainer = container.createDiv({ cls: "cornell-zen-container" });
    zenContainer.style.display = "flex";
    zenContainer.style.flexDirection = "column";
    zenContainer.style.height = "100%";
    zenContainer.style.gap = "15px";
    zenContainer.style.padding = "10px 0";
    const topBar = zenContainer.createDiv();
    topBar.style.display = "flex";
    topBar.style.justifyContent = "space-between";
    topBar.style.alignItems = "center";
    const leftGrp = topBar.createDiv({ attr: { style: "display:flex; gap:6px; align-items:center;" } });
    const cancelBtn = leftGrp.createEl("button", { title: "Return to Board" });
    (0, import_obsidian10.setIcon)(cancelBtn, "arrow-left");
    cancelBtn.style.boxShadow = "none";
    if (this.isBlurtingActive) {
      cancelBtn.style.display = "none";
    } else {
      cancelBtn.onclick = () => {
        this.isZenMode = false;
        this.applyFiltersAndRender();
      };
    }
    const penBtn = leftGrp.createEl("button", { cls: "mod-cta", title: "Pen" });
    (0, import_obsidian10.setIcon)(penBtn, "pencil");
    const eraserBtn = leftGrp.createEl("button", { title: "Eraser" });
    (0, import_obsidian10.setIcon)(eraserBtn, "eraser");
    penBtn.onclick = () => {
      if (this.zenCtx) {
        this.zenCtx.globalCompositeOperation = "source-over";
        this.zenCtx.lineWidth = 4;
        penBtn.addClass("mod-cta");
        eraserBtn.removeClass("mod-cta");
      }
    };
    eraserBtn.onclick = () => {
      if (this.zenCtx) {
        this.zenCtx.globalCompositeOperation = "destination-out";
        this.zenCtx.lineWidth = 25;
        eraserBtn.addClass("mod-cta");
        penBtn.removeClass("mod-cta");
      }
    };
    const rightGrp = topBar.createDiv({ attr: { style: "display:flex; gap:6px;" } });
    const clearBtn = rightGrp.createEl("button", { title: "Clear Canvas" });
    (0, import_obsidian10.setIcon)(clearBtn, "trash-2");
    clearBtn.style.boxShadow = "none";
    clearBtn.onclick = () => {
      if (this.zenCanvasEl && this.zenCtx) {
        this.zenCtx.clearRect(0, 0, this.zenCanvasEl.width, this.zenCanvasEl.height);
      }
    };
    const saveBtn = rightGrp.createEl("button", { cls: "mod-cta" });
    if (this.isBlurtingActive) {
      saveBtn.innerText = "\u{1F3C1} Finish & Audit";
      saveBtn.title = "Finish Session and Audit";
      saveBtn.style.backgroundColor = "var(--color-purple)";
      saveBtn.style.color = "white";
      saveBtn.onclick = () => {
        this.isBlurtingActive = false;
        new import_obsidian10.Notice("\u{1F3A8} Visual Session finished! Time to audit in RED.");
        this.renderUI();
        this.applyFiltersAndRender();
      };
    } else {
      saveBtn.innerText = "\u{1F4BE} Attach";
      saveBtn.title = "Save and add to Board";
      saveBtn.style.backgroundColor = "var(--interactive-accent)";
      saveBtn.style.color = "var(--text-on-accent)";
      saveBtn.onclick = async () => {
        if (!this.zenCanvasEl) return;
        saveBtn.innerText = "\u23F3 Saving...";
        const dataUrl = this.zenCanvasEl.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const arrayBuffer = base64ToArrayBuffer2(base64Data);
        const dateStr = window.moment().format("YYYYMMDD_HHmmss");
        const fileName = `zendoodle_${dateStr}.png`;
        const folder = this.plugin.settings.doodleFolder.trim();
        let attachmentPath = fileName;
        if (folder) {
          await this.plugin.ensureFolderExists(folder);
          attachmentPath = `${folder}/${fileName}`;
        } else {
          try {
            attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
          } catch (e) {
            attachmentPath = fileName;
          }
        }
        await this.app.vault.createBinary(attachmentPath, arrayBuffer);
        const actualFileName = attachmentPath.split("/").pop();
        const doodleSyntax = `![[${actualFileName}]]`;
        this.pinboardItems.push({
          text: doodleSyntax,
          rawText: doodleSyntax,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isCustom: true,
          // Lo metemos como nodo esqueleto para que no busque archivos asociados
          indentLevel: 0
        });
        new import_obsidian10.Notice("\u{1F3A8} Zen Doodle attached to Board!");
        this.isZenMode = false;
        if (this.zenCtx) this.zenCtx.clearRect(0, 0, this.zenCanvasEl.width, this.zenCanvasEl.height);
        this.applyFiltersAndRender();
      };
    }
    if (!this.zenCanvasEl) {
      this.zenCanvasEl = document.createElement("canvas");
      this.zenCanvasEl.width = 800;
      this.zenCanvasEl.height = 1200;
      this.zenCtx = this.zenCanvasEl.getContext("2d");
      this.zenCtx.lineWidth = 4;
      this.zenCtx.lineCap = "round";
      this.zenCtx.lineJoin = "round";
      this.zenCtx.strokeStyle = "#000000";
      this.zenCanvasEl.style.backgroundColor = "#ffffff";
      this.zenCanvasEl.style.border = "2px dashed var(--background-modifier-border)";
      this.zenCanvasEl.style.borderRadius = "8px";
      this.zenCanvasEl.style.width = "100%";
      this.zenCanvasEl.style.flexGrow = "1";
      this.zenCanvasEl.style.cursor = "crosshair";
      this.zenCanvasEl.style.touchAction = "none";
      const getPointerPos = (e) => {
        const rect = this.zenCanvasEl.getBoundingClientRect();
        const scaleX = this.zenCanvasEl.width / rect.width;
        const scaleY = this.zenCanvasEl.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      };
      this.zenCanvasEl.addEventListener("pointerdown", (e) => {
        this.zenIsDrawing = true;
        const pos = getPointerPos(e);
        this.zenCtx.beginPath();
        this.zenCtx.moveTo(pos.x, pos.y);
      });
      this.zenCanvasEl.addEventListener("pointermove", (e) => {
        if (!this.zenIsDrawing) return;
        const pos = getPointerPos(e);
        this.zenCtx.lineTo(pos.x, pos.y);
        this.zenCtx.stroke();
      });
      this.zenCanvasEl.addEventListener("pointerup", () => {
        this.zenIsDrawing = false;
      });
      this.zenCanvasEl.addEventListener("pointerout", () => {
        this.zenIsDrawing = false;
      });
      this.zenCanvasEl.addEventListener("pointercancel", () => {
        this.zenIsDrawing = false;
      });
    }
    zenContainer.appendChild(this.zenCanvasEl);
  }
  renderUI() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("cornell-sidebar-container");
    if (this.isBlurtingActive || this.isAuditing) {
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.bottom = "0";
      container.style.left = "0";
      container.style.right = "0";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.padding = "10px";
      container.style.overflow = "hidden";
      const titleText = this.isBlurtingActive ? "\u{1F9E0} Focus Mode (Draw!)" : "\u{1F58D}\uFE0F Audit Phase (Correct in Red)";
      container.createEl("h4", { text: titleText, cls: "cornell-sidebar-title" });
      const actionBtn = container.createEl("button", { cls: "mod-cta" });
      actionBtn.style.width = "100%";
      actionBtn.style.marginBottom = "15px";
      actionBtn.style.flexShrink = "0";
      if (this.isBlurtingActive) {
        actionBtn.innerText = "\u{1F3C1} Finish & Audit";
        actionBtn.style.backgroundColor = "var(--color-purple)";
        actionBtn.style.color = "white";
        actionBtn.onclick = () => {
          if (this.blurtingFormat === "visual" && this.zenCanvasEl) {
            const dataUrl = this.zenCanvasEl.toDataURL("image/png");
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            this.originalCanvasData = base64ToArrayBuffer2(base64Data);
          }
          this.isBlurtingActive = false;
          this.isAuditing = true;
          new import_obsidian10.Notice("\u{1F3A8} Session finished! Time to audit in RED.");
          this.renderUI();
          if (this.blurtingFormat === "visual") {
            setTimeout(() => this.containerEl.dispatchEvent(new CustomEvent("cornell-force-red-pen")), 50);
          }
        };
      } else {
        actionBtn.innerText = "\u{1F4BE} Save Session to Vault";
        actionBtn.style.backgroundColor = "var(--color-green)";
        actionBtn.style.color = "white";
        actionBtn.onclick = () => this.saveBlurtingSession();
      }
      const contentDiv = container.createDiv({ cls: "cornell-sidebar-content" });
      contentDiv.style.flexGrow = "1";
      contentDiv.style.height = this.isAuditing ? "50%" : "100%";
      contentDiv.style.width = "100%";
      contentDiv.style.position = "relative";
      contentDiv.style.display = "flex";
      contentDiv.style.flexDirection = "column";
      contentDiv.style.overflow = "hidden";
      if (this.blurtingFormat === "visual") {
        this.renderZenDoodle(contentDiv);
      }
      if (this.isAuditing) {
        const deckDiv = container.createDiv({ cls: "cornell-audit-deck" });
        deckDiv.style.flexGrow = "1";
        deckDiv.style.height = "50%";
        deckDiv.style.overflowY = "auto";
        deckDiv.style.borderTop = "2px dashed var(--background-modifier-border)";
        deckDiv.style.marginTop = "10px";
        deckDiv.style.paddingTop = "10px";
        deckDiv.style.display = "flex";
        deckDiv.style.flexDirection = "column";
        deckDiv.style.gap = "10px";
        deckDiv.createEl("h5", { text: "\u{1F4DA} Your Reference Notes:", attr: { style: "margin: 0; color: var(--text-muted); text-align: center;" } });
        this.blurtingDeck.forEach((item) => {
          this.createItemDiv(item, deckDiv);
        });
      }
      return;
    }
    container.style.position = "";
    container.style.top = "";
    container.style.bottom = "";
    container.style.left = "";
    container.style.right = "";
    container.style.display = "";
    container.style.flexDirection = "";
    container.style.padding = "";
    container.style.overflow = "";
    container.createEl("h4", { text: "Marginalia Explorer", cls: "cornell-sidebar-title" });
    if (this.plugin.settings.addons && this.plugin.settings.addons["gamification-profile"]) {
      const stats = this.plugin.settings.userStats;
      const profileDiv = container.createDiv({ cls: "cornell-profile-widget" });
      const nextLevelXp = stats.level * 100;
      const xpPercentage = Math.min(100, stats.xp / nextLevelXp * 100);
      const avatarHtml = stats.profileImage ? `<img src="${stats.profileImage}" class="cornell-profile-avatar-img" />` : `<div class="cornell-profile-avatar">\u{1F464}</div>`;
      const quoteHtml = stats.quote ? `<div class="cornell-profile-quote">"${stats.quote}"</div>` : ``;
      profileDiv.innerHTML = `
                ${avatarHtml}
                <div class="cornell-profile-info">
                    <div class="cornell-profile-header">
                        <span class="cornell-profile-level">Level ${stats.level}</span>
                        <span class="cornell-profile-score">${stats.marginaliasCreated} Notes</span>
                    </div>
                    <div class="cornell-xp-bar-container">
                        <div class="cornell-xp-bar" style="width: ${xpPercentage}%;"></div>
                    </div>
                    <div class="cornell-xp-text">${stats.xp} / ${nextLevelXp} XP</div>
                    ${quoteHtml}
                </div>
            `;
    }
    this.renderQuickCapture(container);
    const controlsDiv = container.createDiv({ cls: "cornell-sidebar-controls" });
    const tabCurrent = controlsDiv.createEl("button", { text: "Current", cls: this.currentTab === "current" ? "cornell-tab-active" : "" });
    const tabVault = controlsDiv.createEl("button", { text: "Vault", cls: this.currentTab === "vault" ? "cornell-tab-active" : "" });
    const tabThreads = controlsDiv.createEl("button", { text: "\u2307 Threads", cls: this.currentTab === "threads" ? "cornell-tab-active" : "" });
    const tabPinboard = controlsDiv.createEl("button", { text: "\u25CF Board", cls: this.currentTab === "pinboard" ? "cornell-tab-active" : "", title: "Your Pinboard" });
    if (this.plugin.settings.addons && this.plugin.settings.addons["blurting-mode"]) {
      const tabReviews = controlsDiv.createEl("button", {
        cls: this.currentTab === "reviews" ? "cornell-tab-active" : "",
        title: "Spaced Repetition Reviews"
      });
      tabReviews.style.display = "flex";
      tabReviews.style.alignItems = "center";
      tabReviews.style.justifyContent = "center";
      tabReviews.style.gap = "5px";
      const iconSpan = tabReviews.createSpan();
      (0, import_obsidian10.setIcon)(iconSpan, "calendar-clock");
      tabReviews.createSpan({ text: "Reviews" });
      tabReviews.onclick = async () => {
        this.currentTab = "reviews";
        this.renderUI();
        this.applyFiltersAndRender();
      };
    } else if (this.currentTab === "reviews") {
      this.currentTab = "current";
    }
    const actionControlsDiv = container.createDiv({ cls: "cornell-sidebar-controls" });
    if (this.plugin.settings.addons && this.plugin.settings.addons["blurting-mode"]) {
      const btnBlurting = actionControlsDiv.createEl("button", { title: "Start Active Recall Session (1-3-7)" });
      btnBlurting.style.display = "flex";
      btnBlurting.style.alignItems = "center";
      btnBlurting.style.gap = "5px";
      (0, import_obsidian10.setIcon)(btnBlurting.createSpan(), "brain");
      btnBlurting.createSpan({ text: "Blurt" });
      btnBlurting.onclick = () => {
        const deck = this.getCurrentFilteredDeck();
        if (deck.length === 0) {
          new import_obsidian10.Notice("\u26A0\uFE0F Your current deck is empty. Scan notes or adjust filters first.");
          return;
        }
        new BlurtingSetupModal(this.plugin.app, this, deck).open();
      };
    }
    const btnStitch = actionControlsDiv.createEl("button", { text: "\u26D3\uFE0E Stitch", title: "Connect two notes" });
    const btnGroup = actionControlsDiv.createEl("button", {
      text: "\u{1F5C1} Group",
      title: "Group identical notes",
      cls: this.isGroupedByContent ? "cornell-tab-active" : ""
    });
    const btnRefresh = actionControlsDiv.createEl("button", { text: "\u27F3", title: "Refresh data" });
    const filterContainer = container.createDiv({ cls: "cornell-sidebar-filters" });
    if (this.currentTab === "pinboard") {
      filterContainer.style.display = "none";
      actionControlsDiv.style.display = "none";
    }
    const searchWrapper = filterContainer.createDiv({ cls: "cornell-search-wrapper" });
    const searchIconEl = searchWrapper.createSpan({ cls: "cornell-search-icon" });
    (0, import_obsidian10.setIcon)(searchIconEl, "search");
    const searchInput = searchWrapper.createEl("input", { type: "text", placeholder: "Search notes...", cls: "cornell-search-bar" });
    searchInput.value = this.searchQuery;
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.applyFiltersAndRender();
    };
    const filtersRow = filterContainer.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; margin-top: 8px;" } });
    const pillsContainer = filterContainer.createDiv({ cls: "cornell-color-pills" });
    this.plugin.settings.tags.forEach((tag) => {
      const pill = pillsContainer.createEl("span", { cls: "cornell-color-pill" });
      pill.style.backgroundColor = tag.color;
      pill.title = `Filter ${tag.prefix}`;
      if (this.activeColorFilters.has(tag.color)) pill.addClass("is-active");
      pill.onclick = () => {
        if (this.activeColorFilters.has(tag.color)) {
          this.activeColorFilters.delete(tag.color);
          pill.removeClass("is-active");
        } else {
          this.activeColorFilters.add(tag.color);
          pill.addClass("is-active");
        }
        this.applyFiltersAndRender();
      };
    });
    const recentBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Recientes (\xDAltima hora)" });
    recentBtn.style.backgroundColor = this.isRecentFilterActive ? "var(--interactive-accent)" : "transparent";
    recentBtn.style.border = "1px solid var(--background-modifier-border)";
    recentBtn.style.color = this.isRecentFilterActive ? "var(--text-on-accent)" : "var(--text-muted)";
    recentBtn.style.cursor = "pointer";
    recentBtn.style.position = "relative";
    (0, import_obsidian10.setIcon)(recentBtn, "clock");
    const svg = recentBtn.querySelector("svg");
    if (svg) {
      svg.style.width = "14px";
      svg.style.height = "14px";
      svg.style.strokeWidth = "2.2";
      svg.style.position = "absolute";
      svg.style.top = "50%";
      svg.style.left = "50%";
      svg.style.transform = "translate(-50%, -50%)";
    }
    recentBtn.onclick = async () => {
      this.isRecentFilterActive = !this.isRecentFilterActive;
      recentBtn.style.backgroundColor = this.isRecentFilterActive ? "var(--interactive-accent)" : "transparent";
      recentBtn.style.color = this.isRecentFilterActive ? "var(--text-on-accent)" : "var(--text-muted)";
      await this.scanNotes();
    };
    const directPdfBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Direct PDF Mode" });
    directPdfBtn.style.backgroundColor = this.isDirectPdfModeActive ? "var(--interactive-accent)" : "transparent";
    directPdfBtn.style.border = "1px solid var(--background-modifier-border)";
    directPdfBtn.style.color = this.isDirectPdfModeActive ? "var(--text-on-accent)" : "var(--text-muted)";
    directPdfBtn.style.cursor = "pointer";
    directPdfBtn.style.position = "relative";
    (0, import_obsidian10.setIcon)(directPdfBtn, "book");
    const pdfSvg = directPdfBtn.querySelector("svg");
    if (pdfSvg) {
      pdfSvg.style.width = "14px";
      pdfSvg.style.height = "14px";
      pdfSvg.style.strokeWidth = "2.2";
      pdfSvg.style.position = "absolute";
      pdfSvg.style.top = "50%";
      pdfSvg.style.left = "50%";
      pdfSvg.style.transform = "translate(-50%, -50%)";
    }
    directPdfBtn.onclick = () => {
      this.isDirectPdfModeActive = !this.isDirectPdfModeActive;
      directPdfBtn.style.backgroundColor = this.isDirectPdfModeActive ? "var(--interactive-accent)" : "transparent";
      directPdfBtn.style.color = this.isDirectPdfModeActive ? "var(--text-on-accent)" : "var(--text-muted)";
      new import_obsidian10.Notice(this.isDirectPdfModeActive ? "\u{1F4D6} Modo PDF Directo: Activado" : "\u{1F4D6} Modo PDF Directo: Desactivado");
    };
    const flashcardFilterBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Show only Flashcards (;;)" });
    flashcardFilterBtn.style.backgroundColor = this.isFlashcardFilterActive ? "var(--interactive-accent)" : "transparent";
    flashcardFilterBtn.style.border = "1px solid var(--background-modifier-border)";
    flashcardFilterBtn.style.color = this.isFlashcardFilterActive ? "var(--text-on-accent)" : "var(--text-muted)";
    flashcardFilterBtn.style.cursor = "pointer";
    flashcardFilterBtn.style.position = "relative";
    (0, import_obsidian10.setIcon)(flashcardFilterBtn, "layers");
    const fcSvg = flashcardFilterBtn.querySelector("svg");
    if (fcSvg) {
      fcSvg.style.width = "14px";
      fcSvg.style.height = "14px";
      fcSvg.style.strokeWidth = "2.2";
      fcSvg.style.position = "absolute";
      fcSvg.style.top = "50%";
      fcSvg.style.left = "50%";
      fcSvg.style.transform = "translate(-50%, -50%)";
    }
    flashcardFilterBtn.onclick = () => {
      this.isFlashcardFilterActive = !this.isFlashcardFilterActive;
      flashcardFilterBtn.style.backgroundColor = this.isFlashcardFilterActive ? "var(--interactive-accent)" : "transparent";
      flashcardFilterBtn.style.color = this.isFlashcardFilterActive ? "var(--text-on-accent)" : "var(--text-muted)";
      this.applyFiltersAndRender();
    };
    const localThreadsBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Filtrar hilos de la nota actual" });
    localThreadsBtn.style.backgroundColor = this.isLocalThreadsActive ? "var(--interactive-accent)" : "transparent";
    localThreadsBtn.style.border = "1px solid var(--background-modifier-border)";
    localThreadsBtn.style.color = this.isLocalThreadsActive ? "var(--text-on-accent)" : "var(--text-muted)";
    localThreadsBtn.style.cursor = "pointer";
    localThreadsBtn.style.position = "relative";
    localThreadsBtn.style.display = this.currentTab === "threads" ? "inline-block" : "none";
    (0, import_obsidian10.setIcon)(localThreadsBtn, "file-symlink");
    const ltSvg = localThreadsBtn.querySelector("svg");
    if (ltSvg) {
      ltSvg.style.width = "14px";
      ltSvg.style.height = "14px";
      ltSvg.style.strokeWidth = "2.2";
      ltSvg.style.position = "absolute";
      ltSvg.style.top = "50%";
      ltSvg.style.left = "50%";
      ltSvg.style.transform = "translate(-50%, -50%)";
    }
    localThreadsBtn.onclick = () => {
      this.isLocalThreadsActive = !this.isLocalThreadsActive;
      localThreadsBtn.style.backgroundColor = this.isLocalThreadsActive ? "var(--interactive-accent)" : "transparent";
      localThreadsBtn.style.color = this.isLocalThreadsActive ? "var(--text-on-accent)" : "var(--text-muted)";
      this.applyFiltersAndRender();
    };
    const activeRecallPdfBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Active Recall en PDF (Oculta los resaltados para repasar)" });
    activeRecallPdfBtn.style.backgroundColor = this.isActiveRecallPdfMode ? "var(--color-purple)" : "transparent";
    activeRecallPdfBtn.style.border = "1px solid var(--background-modifier-border)";
    activeRecallPdfBtn.style.color = this.isActiveRecallPdfMode ? "white" : "var(--text-muted)";
    activeRecallPdfBtn.style.cursor = "pointer";
    activeRecallPdfBtn.style.position = "relative";
    (0, import_obsidian10.setIcon)(activeRecallPdfBtn, "brain-circuit");
    const arSvg = activeRecallPdfBtn.querySelector("svg");
    if (arSvg) {
      arSvg.style.width = "14px";
      arSvg.style.height = "14px";
      arSvg.style.strokeWidth = "2.2";
      arSvg.style.position = "absolute";
      arSvg.style.top = "50%";
      arSvg.style.left = "50%";
      arSvg.style.transform = "translate(-50%, -50%)";
    }
    let currentSyncChain = [];
    activeRecallPdfBtn.onclick = () => {
      this.isActiveRecallPdfMode = !this.isActiveRecallPdfMode;
      activeRecallPdfBtn.style.backgroundColor = this.isActiveRecallPdfMode ? "var(--color-purple)" : "transparent";
      activeRecallPdfBtn.style.color = this.isActiveRecallPdfMode ? "white" : "var(--text-muted)";
      if (this.isActiveRecallPdfMode) {
        document.body.classList.add("cornell-pdf-active-recall");
        new import_obsidian10.Notice("\u{1F9E0} Active Recall PDF: Activado (Pasa el rat\xF3n para revelar bloque completo)");
        this.pdfHoverSync = (e) => {
          const target = e.target;
          if (!target || !target.matches) return;
          if (currentSyncChain.includes(target)) return;
          if (target.matches(".pdf-plus-backlink, .rect-highlight, .pdf-highlight, .textLayer .highlight, .annotationLayer .highlight, .pdf-cropped-embed")) {
            currentSyncChain.forEach((el) => el.classList.remove("cornell-reveal-sync"));
            currentSyncChain = [];
            target.classList.add("cornell-reveal-sync");
            currentSyncChain.push(target);
            const isCrop = target.classList.contains("rect-highlight") || target.closest(".pdf-cropped-embed") || target.tagName.toLowerCase() === "img" || target.classList.contains("pdf-plus-backlink") && target.getBoundingClientRect().height > 32;
            if (isCrop) {
              return;
            }
            const page = target.closest(".page, .markdown-preview-view");
            if (!page) return;
            const allHighlights = Array.from(page.querySelectorAll(".pdf-plus-backlink, .pdf-highlight, .textLayer .highlight, .annotationLayer .highlight")).filter((el) => {
              const elIsCrop = el.classList.contains("rect-highlight") || el.closest(".pdf-cropped-embed") || el.classList.contains("pdf-plus-backlink") && el.getBoundingClientRect().height > 32;
              return !elIsCrop;
            });
            const targetIdx = allHighlights.indexOf(target);
            if (targetIdx === -1) return;
            const targetColor = window.getComputedStyle(target).backgroundColor;
            for (let i = targetIdx - 1; i >= 0; i--) {
              const el = allHighlights[i];
              const prevEl = allHighlights[i + 1];
              if (window.getComputedStyle(el).backgroundColor === targetColor && Math.abs(el.getBoundingClientRect().bottom - prevEl.getBoundingClientRect().top) < 45) {
                el.classList.add("cornell-reveal-sync");
                currentSyncChain.push(el);
              } else {
                break;
              }
            }
            for (let i = targetIdx + 1; i < allHighlights.length; i++) {
              const el = allHighlights[i];
              const prevEl = allHighlights[i - 1];
              if (window.getComputedStyle(el).backgroundColor === targetColor && Math.abs(el.getBoundingClientRect().top - prevEl.getBoundingClientRect().bottom) < 45) {
                el.classList.add("cornell-reveal-sync");
                currentSyncChain.push(el);
              } else {
                break;
              }
            }
          }
        };
        this.pdfMouseOutSync = (e) => {
          const related = e.relatedTarget;
          if (related && currentSyncChain.includes(related)) return;
          currentSyncChain.forEach((el) => el.classList.remove("cornell-reveal-sync"));
          currentSyncChain = [];
        };
        document.body.addEventListener("mouseover", this.pdfHoverSync);
        document.body.addEventListener("mouseout", this.pdfMouseOutSync);
      } else {
        document.body.classList.remove("cornell-pdf-active-recall");
        new import_obsidian10.Notice("\u{1F9E0} Active Recall PDF: Desactivado");
        if (this.pdfHoverSync) document.body.removeEventListener("mouseover", this.pdfHoverSync);
        if (this.pdfMouseOutSync) document.body.removeEventListener("mouseout", this.pdfMouseOutSync);
        currentSyncChain.forEach((el) => el.classList.remove("cornell-reveal-sync"));
        currentSyncChain = [];
      }
    };
    const pdfPillsBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Overlay Mode (Muestra las Marginalias sobre el PDF)" });
    pdfPillsBtn.style.backgroundColor = this.isPdfPillsModeActive ? "var(--interactive-accent)" : "transparent";
    pdfPillsBtn.style.border = "1px solid var(--background-modifier-border)";
    pdfPillsBtn.style.color = this.isPdfPillsModeActive ? "white" : "var(--text-muted)";
    pdfPillsBtn.style.cursor = "pointer";
    pdfPillsBtn.style.position = "relative";
    (0, import_obsidian10.setIcon)(pdfPillsBtn, "message-square-quote");
    const pSvg = pdfPillsBtn.querySelector("svg");
    if (pSvg) {
      pSvg.style.width = "14px";
      pSvg.style.height = "14px";
      pSvg.style.strokeWidth = "2.2";
      pSvg.style.position = "absolute";
      pSvg.style.top = "50%";
      pSvg.style.left = "50%";
      pSvg.style.transform = "translate(-50%, -50%)";
    }
    pdfPillsBtn.onclick = () => {
      this.isPdfPillsModeActive = !this.isPdfPillsModeActive;
      pdfPillsBtn.style.backgroundColor = this.isPdfPillsModeActive ? "var(--interactive-accent)" : "transparent";
      pdfPillsBtn.style.color = this.isPdfPillsModeActive ? "var(--text-on-accent)" : "var(--text-muted)";
      let styleEl = document.getElementById("cornell-pdf-pills-style");
      if (this.isPdfPillsModeActive) {
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "cornell-pdf-pills-style";
          styleEl.innerHTML = `
                        .pdf-viewer .pdf-plus-backlink, 
                        .pdf-viewer .rect-highlight, 
                        .pdf-viewer .pdf-highlight, 
                        .pdf-viewer .textLayer .highlight,
                        .pdf-viewer .annotationLayer .highlight {
                            pointer-events: auto !important;
                            cursor: pointer !important;
                            z-index: 50 !important;
                        }
                    `;
          document.head.appendChild(styleEl);
        }
        new import_obsidian10.Notice("\u{1F4AC} Hover Mode: ON. Precisi\xF3n Geom\xE9trica Activada.");
        let currentTooltip = null;
        let hoverTimeout = null;
        this.pdfPillMouseOver = (e) => {
          var _a;
          const target = e.target;
          if (!target || !target.matches) return;
          if (target.closest(".cornell-pill-expanded")) return;
          const isHighlight = target.matches(".pdf-plus-backlink, .rect-highlight, .pdf-highlight, .textLayer .highlight, .annotationLayer .highlight, .pdf-cropped-embed");
          if (isHighlight) {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (currentTooltip) {
              currentTooltip.remove();
              currentTooltip = null;
            }
            const pageEl = target.closest(".page");
            const rawPageNum = pageEl ? pageEl.getAttribute("data-page-number") : null;
            if (!rawPageNum) return;
            const pageNum = rawPageNum.replace(/\D/g, "");
            if (!pageNum) return;
            let exactAnnotId = target.getAttribute("data-annotation-id") || ((_a = target.closest("[data-annotation-id]")) == null ? void 0 : _a.getAttribute("data-annotation-id"));
            const pixelRect = target.getBoundingClientRect();
            const domAspect = pixelRect.width / pixelRect.height;
            const domWidth = parseFloat(target.style.width);
            const domLeft = parseFloat(target.style.left);
            const domLeftRatio = domLeft / domWidth;
            const isDomCrop = target.classList.contains("rect-highlight") || target.closest(".pdf-cropped-embed") || target.classList.contains("pdf-plus-backlink") && pixelRect.height > 32;
            const pageRegex = new RegExp(`page=${pageNum}(?:\\D|$)`);
            const exactNotes = this.cachedItems.filter((n) => {
              var _a2;
              const searchArea = `${(_a2 = n.outgoingLinks) == null ? void 0 : _a2.join(" ")} ${n.context || ""} ${n.rawText || ""}`;
              if (!pageRegex.test(searchArea)) return false;
              if (exactAnnotId && searchArea.includes(exactAnnotId)) {
                return true;
              }
              const isMarkdownCrop = searchArea.includes("&rect=");
              if (isDomCrop) {
                if (isMarkdownCrop) {
                  const rectMatch = searchArea.match(/rect=\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
                  if (rectMatch) {
                    const L = parseFloat(rectMatch[1]);
                    const B = parseFloat(rectMatch[2]);
                    const R = parseFloat(rectMatch[3]);
                    const T = parseFloat(rectMatch[4]);
                    const pdfWidth = Math.abs(R - L);
                    const pdfHeight = Math.abs(T - B);
                    const pdfAspect = pdfWidth / pdfHeight;
                    const pdfLeftRatio = L / pdfWidth;
                    const diffAspect = Math.abs(domAspect - pdfAspect) / Math.max(domAspect, pdfAspect);
                    const diffLeft = Math.abs(domLeftRatio - pdfLeftRatio);
                    if (diffAspect < 0.15 && diffLeft < 0.15) {
                      return true;
                    }
                  }
                }
                return false;
              }
              if (!isDomCrop) {
                if (!isMarkdownCrop) {
                  return true;
                }
              }
              return false;
            });
            if (exactNotes.length === 0) return;
            const tooltip = document.createElement("div");
            currentTooltip = tooltip;
            tooltip.className = "popover cornell-pill-expanded";
            const title = document.createElement("h4");
            if (exactNotes.length === 1 && exactAnnotId) title.innerText = `\u{1F3AF} Exact Match`;
            else if (isDomCrop) title.innerText = `\u{1F3AF} Crop Match`;
            else title.innerText = `\u{1F4DD} Page ${pageNum} Marginalias`;
            title.style.margin = "0 0 10px 0";
            title.style.borderBottom = "1px solid var(--background-modifier-border)";
            title.style.paddingBottom = "5px";
            title.style.color = exactNotes.length === 1 || isDomCrop ? "var(--interactive-accent)" : "var(--text-muted)";
            tooltip.appendChild(title);
            exactNotes.forEach((note) => {
              const itemDiv = this.createItemDiv(note, tooltip);
              itemDiv.classList.add("cornell-sidebar-item");
            });
            tooltip.style.visibility = "hidden";
            document.body.appendChild(tooltip);
            requestAnimationFrame(() => {
              let leftPos = e.clientX + 15;
              if (leftPos + tooltip.offsetWidth > window.innerWidth) leftPos = e.clientX - tooltip.offsetWidth - 15;
              let topPos = e.clientY + 15;
              if (topPos + tooltip.offsetHeight > window.innerHeight) topPos = window.innerHeight - tooltip.offsetHeight - 15;
              tooltip.style.left = `${Math.max(10, leftPos)}px`;
              tooltip.style.top = `${Math.max(10, topPos)}px`;
              tooltip.style.visibility = "visible";
            });
            tooltip.addEventListener("mouseleave", (ev) => {
              const related = ev.relatedTarget;
              if (related && related.closest(".pdf-plus-backlink, .rect-highlight, .pdf-highlight")) return;
              if (currentTooltip) {
                currentTooltip.remove();
                currentTooltip = null;
              }
            });
          }
        };
        this.pdfPillMouseOut = (e) => {
          const target = e.target;
          const related = e.relatedTarget;
          if (target.matches(".pdf-plus-backlink, .rect-highlight, .pdf-highlight, .textLayer .highlight, .annotationLayer .highlight, .pdf-cropped-embed")) {
            if (related && related.closest(".cornell-pill-expanded")) return;
            if (related && related.closest(".pdf-plus-backlink, .rect-highlight, .pdf-highlight")) return;
            hoverTimeout = setTimeout(() => {
              if (currentTooltip) {
                currentTooltip.remove();
                currentTooltip = null;
              }
            }, 150);
          }
        };
        document.body.addEventListener("mouseover", this.pdfPillMouseOver);
        document.body.addEventListener("mouseout", this.pdfPillMouseOut);
      } else {
        new import_obsidian10.Notice("\u{1F4AC} Hover Mode: OFF.");
        if (styleEl) styleEl.remove();
        if (this.pdfPillMouseOver) document.body.removeEventListener("mouseover", this.pdfPillMouseOver);
        if (this.pdfPillMouseOut) document.body.removeEventListener("mouseout", this.pdfPillMouseOut);
        document.querySelectorAll(".cornell-pill-expanded").forEach((el) => el.remove());
      }
    };
    const folderBtn = pillsContainer.createEl("span", { cls: "cornell-color-pill", title: "Agrupar por Carpetas y Archivos" });
    folderBtn.style.backgroundColor = this.isGroupedByFolder ? "var(--interactive-accent)" : "transparent";
    folderBtn.style.border = "1px solid var(--background-modifier-border)";
    folderBtn.style.color = this.isGroupedByFolder ? "var(--text-on-accent)" : "var(--text-muted)";
    folderBtn.style.cursor = "pointer";
    folderBtn.style.position = "relative";
    folderBtn.style.display = this.currentTab === "vault" ? "inline-block" : "none";
    (0, import_obsidian10.setIcon)(folderBtn, "folder-tree");
    const fSvg = folderBtn.querySelector("svg");
    if (fSvg) {
      fSvg.style.width = "14px";
      fSvg.style.height = "14px";
      fSvg.style.strokeWidth = "2.2";
      fSvg.style.position = "absolute";
      fSvg.style.top = "50%";
      fSvg.style.left = "50%";
      fSvg.style.transform = "translate(-50%, -50%)";
    }
    folderBtn.onclick = () => {
      this.isGroupedByFolder = !this.isGroupedByFolder;
      folderBtn.style.backgroundColor = this.isGroupedByFolder ? "var(--interactive-accent)" : "transparent";
      folderBtn.style.color = this.isGroupedByFolder ? "var(--text-on-accent)" : "var(--text-muted)";
      this.applyFiltersAndRender();
    };
    container.createDiv({ cls: "cornell-stitch-banner", text: "" }).style.display = "none";
    container.createDiv({ cls: "cornell-stitch-banner", text: "" }).style.display = "none";
    container.createDiv({ cls: "cornell-sidebar-content" });
    tabCurrent.onclick = async () => {
      this.currentTab = "current";
      this.renderUI();
      await this.scanNotes();
    };
    tabVault.onclick = async () => {
      this.currentTab = "vault";
      this.renderUI();
      await this.scanNotes();
    };
    tabThreads.onclick = async () => {
      this.currentTab = "threads";
      this.renderUI();
      await this.scanNotes();
    };
    tabPinboard.onclick = async () => {
      this.currentTab = "pinboard";
      this.renderUI();
      this.applyFiltersAndRender();
    };
    btnRefresh.onclick = async () => {
      new import_obsidian10.Notice("Scanning & Syncing...");
      await this.scanNotes();
      if (this.plugin.settings.enableTaskNotesIntegration) {
        await this.syncTasksFromTaskNotes();
      }
    };
    btnStitch.onclick = () => {
      this.isStitchingMode = !this.isStitchingMode;
      this.sourceStitchItem = null;
      btnStitch.classList.toggle("cornell-tab-active", this.isStitchingMode);
      this.updateStitchBanner();
    };
    btnGroup.onclick = () => {
      this.isGroupedByContent = !this.isGroupedByContent;
      btnGroup.classList.toggle("cornell-tab-active", this.isGroupedByContent);
      this.applyFiltersAndRender();
    };
    container.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.classList.contains("cornell-sidebar-item") || activeEl.classList.contains("cornell-pinboard-item"))) return;
        e.preventDefault();
        const firstItem = container.querySelector(".cornell-sidebar-item, .cornell-pinboard-item");
        if (firstItem) firstItem.focus();
      }
    });
  }
  updateStitchBanner() {
    const banner = this.containerEl.querySelector(".cornell-stitch-banner");
    if (!this.isStitchingMode) {
      banner.style.display = "none";
      return;
    }
    banner.style.display = "block";
    if (!this.sourceStitchItem) {
      banner.innerText = "\u26D3\uFE0E Step 1: Click the ORIGIN note...";
      banner.style.backgroundColor = "var(--interactive-accent)";
    } else {
      banner.innerText = "\u26D3\uFE0E Step 2: Click the DESTINATION note...";
      banner.style.backgroundColor = "var(--color-green)";
    }
  }
  // 🗄️ UI DEL CAJÓN DESLIZANTE (OMNI-CAPTURE)
  // ⚡ OMNI-CAPTURE TOP BAR (DISEÑO PERSISTENTE)
  // ⚡ OMNI-CAPTURE BAR (DISEÑO MUTANTE CONTEXTUAL)
  renderQuickCapture(parent) {
    const qcContainer = parent.createDiv({ cls: "cornell-quick-capture" });
    if (this.currentTab === "pinboard") {
      const topRow = qcContainer.createDiv({ cls: "cornell-qc-toprow" });
      topRow.style.justifyContent = "center";
      const destLabel = topRow.createSpan({ cls: "cornell-qc-label" });
      destLabel.style.display = "flex";
      destLabel.style.alignItems = "center";
      destLabel.style.gap = "4px";
      (0, import_obsidian10.setIcon)(destLabel, "layout-dashboard");
      destLabel.createSpan({ text: "Active Board" });
      const bottomRow = qcContainer.createDiv({ cls: "cornell-qc-bottomrow" });
      this.sliderIdeaInput = bottomRow.createEl("textarea", { placeholder: "Add text (# for titles, - for children)" });
      this.sliderIdeaInput.classList.add("cornell-qc-textarea");
      new TagSuggester(this.plugin.app, this.sliderIdeaInput);
      const submitBtn = bottomRow.createEl("button", { title: "Add to Board (Enter)" });
      submitBtn.classList.add("cornell-qc-submit");
      (0, import_obsidian10.setIcon)(submitBtn, "plus");
      const addAction = () => {
        const val = this.sliderIdeaInput.value.trim();
        if (val) {
          let newItem;
          let isManualHyphen = false;
          if (val.startsWith("#")) {
            newItem = { text: val, rawText: val, color: "transparent", file: null, line: -1, blockId: null, outgoingLinks: [], isTitle: true };
          } else {
            const dashMatch = val.match(/^(-+)\s*(.*)/);
            let cleanText = val;
            let manualIndent = 0;
            if (dashMatch) {
              isManualHyphen = true;
              manualIndent = dashMatch[1].length;
              cleanText = dashMatch[2] || "Empty node";
            }
            newItem = { text: cleanText, rawText: cleanText, color: "transparent", file: null, line: -1, blockId: null, outgoingLinks: [], isCustom: true, indentLevel: manualIndent };
          }
          if (this.targetInsertIndex !== null && this.targetInsertIndex >= 0) {
            if (!newItem.isTitle && !isManualHyphen) {
              const parentIndent = this.pinboardItems[this.targetInsertIndex].indentLevel || 0;
              newItem.indentLevel = this.targetInsertAsChild ? parentIndent + 1 : parentIndent;
            }
            this.pinboardItems.splice(this.targetInsertIndex + 1, 0, newItem);
            this.targetInsertIndex = null;
          } else {
            this.pinboardItems.push(newItem);
          }
          this.sliderIdeaInput.value = "";
          this.applyFiltersAndRender();
          setTimeout(() => {
            if (this.sliderIdeaInput) this.sliderIdeaInput.focus();
          }, 50);
        }
      };
      submitBtn.onclick = addAction;
      this.sliderIdeaInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          addAction();
        }
      });
    } else {
      const topRow = qcContainer.createDiv({ cls: "cornell-qc-toprow" });
      const destLabel = topRow.createSpan({ cls: "cornell-qc-label" });
      destLabel.style.display = "flex";
      destLabel.style.alignItems = "center";
      destLabel.style.gap = "4px";
      (0, import_obsidian10.setIcon)(destLabel, "inbox");
      destLabel.createSpan({ text: "Dest:" });
      this.sliderDestInput = topRow.createEl("input", { type: "text", placeholder: "Inbox..." });
      this.sliderDestInput.value = this.plugin.settings.lastOmniDestination || "Marginalia Inbox";
      this.sliderDestInput.classList.add("cornell-qc-dest");
      const datalistId = "sidebar-omni-vault-files";
      let datalist = document.getElementById(datalistId);
      if (!datalist) {
        datalist = document.body.createEl("datalist", { attr: { id: datalistId } });
      } else {
        datalist.empty();
      }
      this.app.vault.getMarkdownFiles().forEach((f) => datalist.createEl("option", { value: f.basename }));
      this.sliderDestInput.setAttribute("list", datalistId);
      const zkBtn = topRow.createEl("button", { title: "Toggle Zettelkasten Mode" });
      zkBtn.classList.add("cornell-qc-btn");
      zkBtn.style.display = "flex";
      zkBtn.style.alignItems = "center";
      zkBtn.style.gap = "4px";
      (0, import_obsidian10.setIcon)(zkBtn, "fingerprint");
      zkBtn.createSpan({ text: "ZK" });
      const updateZkUI = () => {
        if (this.plugin.settings.zkMode) {
          zkBtn.style.color = "var(--color-green)";
          zkBtn.style.backgroundColor = "var(--background-modifier-hover)";
          zkBtn.style.borderColor = "var(--color-green)";
        } else {
          zkBtn.style.color = "var(--text-muted)";
          zkBtn.style.backgroundColor = "transparent";
          zkBtn.style.borderColor = "var(--background-modifier-border)";
        }
      };
      updateZkUI();
      zkBtn.onclick = async () => {
        this.plugin.settings.zkMode = !this.plugin.settings.zkMode;
        await this.plugin.saveSettings();
        updateZkUI();
        new import_obsidian10.Notice(this.plugin.settings.zkMode ? "\u{1F5C3}\uFE0F ZK Mode: ON (Will create new notes)" : "\u{1F5C3}\uFE0F ZK Mode: OFF (Will append to Destination)");
        this.sliderIdeaInput.focus();
      };
      const clearCtxBtn = topRow.createEl("button", { title: "Clear Clipboard & Memory" });
      clearCtxBtn.classList.add("cornell-qc-btn");
      clearCtxBtn.style.display = "flex";
      clearCtxBtn.style.alignItems = "center";
      clearCtxBtn.style.gap = "4px";
      (0, import_obsidian10.setIcon)(clearCtxBtn, "eraser");
      clearCtxBtn.createSpan({ text: "Clear" });
      clearCtxBtn.onclick = async () => {
        await navigator.clipboard.writeText("");
        _CornellNotesView.lastCapturedContext = "";
        _CornellNotesView.lastCapturedImageLength = 0;
        this.pendingClipboardImageData = null;
        this.pendingDoodleData = null;
        doodleBtn.style.color = "var(--text-muted)";
        new import_obsidian10.Notice("\u{1F9F9} Clipboard & Memory cleared!");
      };
      const doodleBtn = topRow.createEl("button", { title: "Attach Doodle" });
      doodleBtn.classList.add("cornell-qc-btn");
      doodleBtn.style.display = "flex";
      doodleBtn.style.alignItems = "center";
      doodleBtn.style.gap = "4px";
      (0, import_obsidian10.setIcon)(doodleBtn, "palette");
      doodleBtn.createSpan({ text: "Doodle" });
      doodleBtn.onclick = async () => {
        const result = await this.plugin.captureManager.openDoodle();
        this.pendingDoodleData = result.data;
        doodleBtn.style.color = "var(--color-green)";
        if (result.isInstant) {
          executeSave();
        } else {
          new import_obsidian10.Notice("\u{1F3A8} Doodle attached! Press \u26A1 to save.");
        }
      };
      const bottomRow = qcContainer.createDiv({ cls: "cornell-qc-bottomrow" });
      this.sliderIdeaInput = bottomRow.createEl("textarea", { placeholder: "\u{1F4A1} Your Idea (Auto-paste enabled)..." });
      this.sliderIdeaInput.classList.add("cornell-qc-textarea");
      new TagSuggester(this.plugin.app, this.sliderIdeaInput);
      this.sliderIdeaInput.addEventListener("paste", async (e) => {
        if (!e.clipboardData) return;
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              this.pendingClipboardImageData = await blob.arrayBuffer();
              this.pendingClipboardImageExt = blob.type.split("/")[1] || "png";
              new import_obsidian10.Notice("\u{1F5BC}\uFE0F Image attached to capture!");
            }
          }
        }
      });
      const submitBtn = bottomRow.createEl("button", { title: "Save Capture (Ctrl+Enter)" });
      submitBtn.classList.add("cornell-qc-submit");
      (0, import_obsidian10.setIcon)(submitBtn, "zap");
      const executeSave = async () => {
        const payload = {
          thought: this.sliderIdeaInput.value.trim(),
          destination: this.sliderDestInput.value.trim() || "Marginalia Inbox",
          doodleData: this.pendingDoodleData
        };
        try {
          await this.plugin.captureManager.saveCapture(payload, this.pendingClipboardImageData, this.pendingClipboardImageExt);
          if (this.plugin.settings.addons && this.plugin.settings.addons["gamification-profile"]) {
            this.plugin.gamificationAddon.addXp();
            this.renderUI();
          }
          this.sliderIdeaInput.value = "";
          let cleanDestName = payload.destination.replace(/^\d{12,14}\s*-\s*/, "").trim() || "Marginalia Inbox";
          this.sliderDestInput.value = cleanDestName;
          this.pendingDoodleData = null;
          this.pendingClipboardImageData = null;
          doodleBtn.style.color = "var(--text-muted)";
          this.applyFiltersAndRender();
        } catch (e) {
        }
      };
      submitBtn.onclick = executeSave;
      this.sliderIdeaInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          executeSave();
        }
      });
    }
  }
  // 🧠 HELPER: Captura el estado actual de la vista respetando los filtros
  getCurrentFilteredDeck() {
    const isFilterActive = this.searchQuery.length > 0 || this.activeColorFilters.size > 0 || this.isRecentFilterActive;
    const matchesFilter = (item) => {
      const matchesSearch = item.text.toLowerCase().includes(this.searchQuery) || item.file.basename.toLowerCase().includes(this.searchQuery);
      const matchesColor = this.isRecentFilterActive || this.activeColorFilters.size === 0 || this.activeColorFilters.has(item.color);
      const FRESHNESS_WINDOW_MS = 36e5;
      const matchesRecent = !this.isRecentFilterActive || item.file && Date.now() - item.file.stat.mtime < FRESHNESS_WINDOW_MS;
      const matchesFlashcard = !this.isFlashcardFilterActive || item.rawText.includes(";;");
      return matchesSearch && matchesColor && matchesRecent && matchesFlashcard;
    };
    return this.cachedItems.filter(matchesFilter);
  }
  // 🚀 MOTOR DE SINCRONIZACIÓN ON-DEMAND (Cero lag, cero background)
  async syncTasksFromTaskNotes() {
    if (!this.plugin.settings.enableTaskNotesIntegration) return;
    const { port, token } = await this.plugin.getTaskNotesConfig();
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`http://localhost:${port}/api/tasks?limit=200`, { headers });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.success || !data.data || !data.data.tasks) return;
      const tnTasks = data.data.tasks;
      const localTasks = this.cachedItems.filter((item) => item.text.match(/^-\s*\[ \]\s+(.*)/));
      let syncedCount = 0;
      const filesToMutate = /* @__PURE__ */ new Map();
      for (const localTask of localTasks) {
        const match = localTask.text.match(/^-\s*\[ \]\s+(.*)/);
        if (!match) continue;
        const rawTitle = match[1];
        const cleanTitle = this.cleanExportText(rawTitle);
        const remoteTask = tnTasks.find((t) => t.title === cleanTitle || t.title.includes(cleanTitle));
        const isCompletedRemotely = remoteTask && (remoteTask.completed === true || remoteTask.status === "done" || remoteTask.status === "completed" || remoteTask.status === "x");
        if (isCompletedRemotely) {
          if (!filesToMutate.has(localTask.file)) filesToMutate.set(localTask.file, []);
          filesToMutate.get(localTask.file).push(localTask);
          syncedCount++;
        }
      }
      if (syncedCount > 0) {
        for (const [file, items] of filesToMutate.entries()) {
          await this.plugin.app.vault.process(file, (content) => {
            const lines = content.split("\n");
            for (const item of items) {
              if (item.line >= 0 && item.line < lines.length) {
                if (this.plugin.settings.deleteCompletedTasks) {
                  const escapedRaw = item.rawText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                  const fullMarginaliaRegex = new RegExp(`%%[><]\\s*${escapedRaw}\\s*%%`, "g");
                  if (fullMarginaliaRegex.test(lines[item.line])) {
                    lines[item.line] = lines[item.line].replace(fullMarginaliaRegex, "");
                  } else {
                    lines[item.line] = lines[item.line].replace(item.rawText, "");
                  }
                } else {
                  const newRaw = item.rawText.replace(/-\s*\[ \]/, `- [x]`);
                  lines[item.line] = lines[item.line].replace(item.rawText, newRaw);
                }
              }
            }
            return lines.join("\n");
          });
        }
        new import_obsidian10.Notice(`\u{1F504} Synced ${syncedCount} task(s) completed in TaskNotes!`);
        await this.scanNotes();
      } else {
        new import_obsidian10.Notice("\u2705 Tasks are up to date with TaskNotes.");
      }
    } catch (e) {
      console.log("TaskNotes sync bypass (Server likely off):", e);
    }
  }
  async scanNotes() {
    if (this.currentTab === "pinboard") {
      this.applyFiltersAndRender();
      return;
    }
    const contentDiv = this.containerEl.querySelector(".cornell-sidebar-content");
    if (!contentDiv) return;
    contentDiv.empty();
    const allItemsFlat = [];
    const defaultColor = "var(--text-accent)";
    let filesToScan = [];
    this.isZotlikeMode = false;
    this.activePdfName = "";
    let activePdfBasename = "";
    if (this.currentTab === "current") {
      const activeFile = this.plugin.app.workspace.getActiveFile();
      if (activeFile) {
        if (activeFile.extension.toLowerCase() === "pdf") {
          this.isZotlikeMode = true;
          this.activePdfName = activeFile.name;
          activePdfBasename = activeFile.basename;
          filesToScan = this.plugin.app.vault.getMarkdownFiles();
          const ignoredPaths = this.plugin.settings.ignoredFolders.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
          filesToScan = filesToScan.filter((f) => !ignoredPaths.some((p) => f.path.startsWith(p)));
        } else {
          filesToScan.push(activeFile);
        }
      } else {
        contentDiv.createEl("p", { text: "No active file.", cls: "cornell-sidebar-empty" });
        return;
      }
    } else {
      filesToScan = this.plugin.app.vault.getMarkdownFiles();
      const ignoredPaths = this.plugin.settings.ignoredFolders.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      filesToScan = filesToScan.filter((f) => !ignoredPaths.some((p) => f.path.startsWith(p)));
    }
    if (this.isRecentFilterActive) {
      filesToScan = filesToScan.sort((a, b) => b.stat.mtime - a.stat.mtime);
      if (!this.isZotlikeMode) {
        filesToScan = filesToScan.slice(0, 5);
      }
    }
    const baseEncoded = activePdfBasename.replace(/ /g, "%20");
    const nameEncoded = this.activePdfName.replace(/ /g, "%20");
    let zotlikeFilesProcessed = 0;
    for (const file of filesToScan) {
      if (this.isZotlikeMode) {
        const fullContent = await this.plugin.app.vault.cachedRead(file);
        if (!fullContent.includes(this.activePdfName) && !fullContent.includes(nameEncoded) && !fullContent.includes(`[[${activePdfBasename}`) && !fullContent.includes(`[[${baseEncoded}`)) {
          continue;
        }
        if (this.isRecentFilterActive) {
          zotlikeFilesProcessed++;
          if (zotlikeFilesProcessed > 5) break;
        }
      }
      let itemsToPush = [];
      const cachedData = this.vaultCache.get(file.path);
      if (cachedData && cachedData.mtime === file.stat.mtime) {
        itemsToPush = cachedData.items;
      } else {
        const content = await this.plugin.app.vault.cachedRead(file);
        const lines = content.split("\n");
        const fileItems = [];
        const lineRegex = /%%\s*[\\\/]?[><](.*?)%%/g;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let match;
          while ((match = lineRegex.exec(line)) !== null) {
            let noteContent = match[1].trim();
            let tempNoteContent = noteContent.replace(/(?:\s+|^)(?:anki)?\^[a-zA-Z0-9-]+/g, "").trim();
            if (tempNoteContent.includes(";;")) {
              tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
            }
            const rawTextForStitching = noteContent;
            let cleanText = tempNoteContent;
            let matchedColor = defaultColor;
            for (const tag of this.plugin.settings.tags) {
              if (cleanText.startsWith(tag.prefix)) {
                matchedColor = tag.color;
                cleanText = cleanText.substring(tag.prefix.length).trim();
                break;
              }
            }
            cleanText = cleanText.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim();
            const linkRegex = /(?<!!)\[\[(.*?)\]\](?:\s*\{stitch:\s*([^}]+)\})?/g;
            const outgoingLinks = [];
            const semanticStitches = [];
            const linkMatches = Array.from(cleanText.matchAll(linkRegex));
            linkMatches.forEach((m) => {
              const targetLink = m[1];
              const stitchReason = m[2] || null;
              outgoingLinks.push(targetLink);
              if (stitchReason) {
                semanticStitches.push({
                  target: targetLink,
                  reason: stitchReason.trim()
                });
              }
            });
            cleanText = cleanText.replace(linkRegex, "").trim();
            if (cleanText.length === 0) continue;
            const blockIdMatch = line.match(/(?:^|\s)\^([a-zA-Z0-9]+)/);
            const existingBlockId = blockIdMatch ? blockIdMatch[1] : null;
            let startLine = i;
            let endLine = i;
            let textWithoutMarginalia = lines[i].replace(/%%\s*[\\\/]?[><](.*?)%%/g, "").trim();
            textWithoutMarginalia = textWithoutMarginalia.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
            let isTargetingCallout = false;
            if (lines[i].trim().startsWith(">")) {
              isTargetingCallout = true;
            } else if (textWithoutMarginalia === "") {
              let nextIdx = i + 1;
              while (nextIdx < lines.length && lines[nextIdx].trim() === "") nextIdx++;
              if (nextIdx < lines.length && lines[nextIdx].trim().startsWith(">")) {
                isTargetingCallout = true;
                startLine = nextIdx;
                endLine = nextIdx;
              }
            }
            if (isTargetingCallout) {
              while (startLine > 0 && lines[startLine - 1].trim().startsWith(">")) startLine--;
              while (endLine < lines.length - 1 && lines[endLine + 1].trim().startsWith(">")) endLine++;
            } else {
              while (startLine > 0 && lines[startLine - 1].trim() !== "" && !lines[startLine - 1].trim().startsWith(">")) startLine--;
              while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== "" && !lines[endLine + 1].trim().startsWith(">")) endLine++;
            }
            let fullContext = "";
            for (let j = startLine; j <= endLine; j++) {
              let cleanLine = lines[j].replace(/%%\s*[\\\/]?[><](.*?)%%/g, "").trim();
              cleanLine = cleanLine.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
              if (cleanLine) fullContext += `${cleanLine}
`;
            }
            const finalContext = fullContext.trim();
            fileItems.push({
              text: cleanText,
              rawText: rawTextForStitching,
              color: matchedColor,
              file,
              line: i,
              blockId: existingBlockId,
              outgoingLinks,
              semanticStitches,
              // 👈 INYECTAMOS LA MEMORIA AQUÍ
              context: finalContext
              // 👈 Contexto perfecto, respeta los saltos de línea.
            });
          }
        }
        this.vaultCache.set(file.path, { mtime: file.stat.mtime, items: fileItems });
        itemsToPush = fileItems;
      }
      if (this.isRecentFilterActive) {
        allItemsFlat.push(...[...itemsToPush].reverse());
      } else {
        allItemsFlat.push(...itemsToPush);
      }
    }
    this.cachedItems = allItemsFlat;
    this.applyFiltersAndRender();
  }
  applyFiltersAndRender() {
    if (this.isBlurtingActive) {
      return;
    }
    document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
    const contentDiv = this.containerEl.querySelector(".cornell-sidebar-content");
    if (!contentDiv) return;
    if (this.currentTab === "pinboard") {
      this.renderPinboardTab(contentDiv);
      return;
    }
    if (this.currentTab === "reviews") {
      this.renderReviewsTab(contentDiv);
      return;
    }
    const activeFile = this.plugin.app.workspace.getActiveFile();
    const isFilterActive = this.searchQuery.length > 0 || this.activeColorFilters.size > 0 || this.isFlashcardFilterActive || this.isLocalThreadsActive;
    const matchesFilter = (item) => {
      const matchesSearch = item.text.toLowerCase().includes(this.searchQuery) || item.file.basename.toLowerCase().includes(this.searchQuery);
      const matchesColor = this.activeColorFilters.size === 0 || this.activeColorFilters.has(item.color);
      const matchesFlashcard = !this.isFlashcardFilterActive || item.rawText.includes(";;");
      const matchesLocal = !this.isLocalThreadsActive || activeFile && item.file && item.file.path === activeFile.path;
      return matchesSearch && matchesColor && matchesFlashcard && matchesLocal;
    };
    if (this.currentTab === "threads") {
      contentDiv.empty();
      const threadsWrapper = contentDiv.createDiv();
      threadsWrapper.createEl("h5", {
        text: "\u{1F517} Semantic Threads",
        attr: { style: "margin: 0 0 10px 0; color: var(--text-muted); text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px;" }
      });
      const allTargetIds = /* @__PURE__ */ new Set();
      this.cachedItems.forEach((item) => {
        item.outgoingLinks.forEach((l) => {
          const parts = l.split("#^");
          if (parts.length === 2) allTargetIds.add(parts[1]);
        });
      });
      if (!isFilterActive) {
        const rootItems = this.cachedItems.filter((item) => {
          const isChild = item.blockId && allTargetIds.has(item.blockId);
          if (isChild) return false;
          const isParent = item.outgoingLinks.length > 0;
          const hasTag = /#([a-zA-Z0-9_/-]+)/.test(item.text);
          return isParent || hasTag;
        });
        this.renderThreads(rootItems, threadsWrapper, false);
      } else {
        const matchingItems = this.cachedItems.filter(matchesFilter);
        const topLevelMatches = matchingItems.filter((item) => {
          const isChildOfAnotherMatch = matchingItems.some((parent) => item.blockId && parent.outgoingLinks.some((link) => link.includes(`#^${item.blockId}`)));
          return !isChildOfAnotherMatch;
        });
        const zettelTopLevelMatches = topLevelMatches.filter((item) => {
          const isChild = item.blockId && allTargetIds.has(item.blockId);
          const isParent = item.outgoingLinks.length > 0;
          const hasTag = /#([a-zA-Z0-9_/-]+)/.test(item.text);
          return isParent || hasTag || isChild;
        });
        this.renderThreads(zettelTopLevelMatches, threadsWrapper, true);
      }
    } else {
      const filtered = this.cachedItems.filter(matchesFilter);
      if (this.isRecentFilterActive) {
        const recentResults = {
          "transparent": filtered
          // Usamos 'transparent' para que no le pinte el borde al grupo
        };
        this.renderResults(recentResults, contentDiv);
      } else if (this.currentTab === "vault" && this.isGroupedByFolder) {
        this.renderFolderTree(filtered, contentDiv, isFilterActive);
      } else if (this.isGroupedByContent) {
        const groupedResults = {};
        filtered.forEach((item) => {
          const normalizedText = item.text.trim().toLowerCase();
          if (!groupedResults[normalizedText]) groupedResults[normalizedText] = [];
          groupedResults[normalizedText].push(item);
        });
        this.renderGroupedByContent(groupedResults, contentDiv);
      } else {
        const results = {};
        filtered.forEach((item) => {
          if (!results[item.color]) results[item.color] = [];
          results[item.color].push(item);
        });
        this.renderResults(results, contentDiv);
      }
    }
  }
  renderPinboardTab(container) {
    container.empty();
    if (this.isZenMode) {
      this.renderZenDoodle(container);
      return;
    }
    const boardCanvas = container.createDiv();
    boardCanvas.style.minHeight = "100%";
    boardCanvas.style.display = "flex";
    boardCanvas.style.flexDirection = "column";
    boardCanvas.addEventListener("dragenter", (e) => {
      if (OmniDragManager.payload) e.preventDefault();
    });
    boardCanvas.addEventListener("dragover", (e) => {
      if (OmniDragManager.payload) {
        e.preventDefault();
        boardCanvas.style.boxShadow = "inset 0 0 10px rgba(var(--interactive-accent-rgb), 0.3)";
      }
    });
    boardCanvas.addEventListener("dragleave", () => {
      boardCanvas.style.boxShadow = "none";
    });
    boardCanvas.addEventListener("drop", (e) => {
      boardCanvas.style.boxShadow = "none";
      if (OmniDragManager.payload) {
        e.preventDefault();
        e.stopPropagation();
        const translatedText = OmniDragManager.payload.text.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim();
        const newItem = { ...OmniDragManager.payload, text: translatedText, indentLevel: 0 };
        this.pinboardItems.push(newItem);
        this.pinboardFocusIndex = this.pinboardItems.length - 1;
        this.applyFiltersAndRender();
      }
    });
    const topControls = boardCanvas.createDiv({ cls: "cornell-pinboard-controls" });
    topControls.style.display = "flex";
    topControls.style.flexDirection = "column";
    topControls.style.gap = "10px";
    topControls.style.marginBottom = "20px";
    const toolbarRow = topControls.createDiv();
    toolbarRow.style.display = "flex";
    toolbarRow.style.justifyContent = "space-between";
    toolbarRow.style.alignItems = "center";
    toolbarRow.style.marginBottom = "5px";
    const leftGroup = toolbarRow.createDiv();
    leftGroup.style.display = "flex";
    leftGroup.style.gap = "4px";
    const createIconBtn = (icon, title) => {
      const btn = leftGroup.createEl("button", { title });
      btn.style.height = "28px";
      btn.style.width = "32px";
      btn.style.padding = "0";
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.backgroundColor = "transparent";
      btn.style.boxShadow = "none";
      btn.style.border = "1px solid var(--background-modifier-border)";
      btn.style.color = "var(--text-muted)";
      btn.style.borderRadius = "4px";
      btn.onmouseenter = () => {
        btn.style.backgroundColor = "var(--background-modifier-hover)";
        btn.style.color = "var(--text-normal)";
      };
      btn.onmouseleave = () => {
        btn.style.backgroundColor = "transparent";
        btn.style.color = "var(--text-muted)";
      };
      (0, import_obsidian10.setIcon)(btn, icon);
      return btn;
    };
    createIconBtn("copy", "Copy Board to Clipboard").onclick = () => this.exportMindmap();
    createIconBtn("download", "Import skeleton from active note").onclick = () => this.importActiveFileSkeleton();
    createIconBtn("pen-tool", "Zen Doodle Mode").onclick = () => {
      this.isZenMode = true;
      this.applyFiltersAndRender();
    };
    createIconBtn("file-text", "Export to Markdown Note").onclick = () => this.exportPinboard();
    createIconBtn("layout-dashboard", "Export to Canvas").onclick = () => this.exportCanvas();
    const clearBtn = createIconBtn("trash-2", "Clear Board");
    clearBtn.onmouseenter = () => {
      clearBtn.style.backgroundColor = "var(--background-modifier-error-hover)";
      clearBtn.style.color = "var(--text-error)";
    };
    clearBtn.onclick = () => {
      this.pinboardItems = [];
      this.applyFiltersAndRender();
      new import_obsidian10.Notice("Board cleared!");
    };
    const autoPasteBtn = toolbarRow.createEl("button", { title: "Auto-add copied text to Board" });
    autoPasteBtn.style.height = "28px";
    autoPasteBtn.style.padding = "0 10px";
    autoPasteBtn.style.display = "flex";
    autoPasteBtn.style.alignItems = "center";
    autoPasteBtn.style.gap = "6px";
    autoPasteBtn.style.fontSize = "0.8em";
    autoPasteBtn.style.border = "1px solid var(--background-modifier-border)";
    autoPasteBtn.style.borderRadius = "4px";
    autoPasteBtn.style.boxShadow = "none";
    autoPasteBtn.style.cursor = "pointer";
    const updateAutoBtn = () => {
      autoPasteBtn.empty();
      if (this.autoPasteInterval) {
        (0, import_obsidian10.setIcon)(autoPasteBtn.createSpan(), "pause");
        autoPasteBtn.createSpan({ text: "Auto" });
        autoPasteBtn.style.backgroundColor = "var(--color-green)";
        autoPasteBtn.style.color = "#fff";
        autoPasteBtn.style.borderColor = "var(--color-green)";
      } else {
        (0, import_obsidian10.setIcon)(autoPasteBtn.createSpan(), "play");
        autoPasteBtn.createSpan({ text: "Auto" });
        autoPasteBtn.style.backgroundColor = "transparent";
        autoPasteBtn.style.color = "var(--text-muted)";
        autoPasteBtn.style.borderColor = "var(--background-modifier-border)";
      }
    };
    updateAutoBtn();
    autoPasteBtn.onclick = async () => {
      if (this.autoPasteInterval) {
        window.clearInterval(this.autoPasteInterval);
        this.autoPasteInterval = null;
        new import_obsidian10.Notice("\u{1F916} Auto-Paste deactivated.");
      } else {
        this.lastClipboardText = await navigator.clipboard.readText();
        this.autoPasteInterval = window.setInterval(async () => {
          try {
            const currentText = await navigator.clipboard.readText();
            if (currentText && currentText !== this.lastClipboardText) {
              this.lastClipboardText = currentText;
              this.pinboardItems.push({ text: currentText, rawText: currentText, color: "transparent", file: null, line: -1, blockId: null, outgoingLinks: [], isCustom: true, indentLevel: 0 });
              this.applyFiltersAndRender();
              new import_obsidian10.Notice("Text auto-pasted! \u{1F4DD}");
            }
          } catch (e) {
          }
        }, 1e3);
        new import_obsidian10.Notice("\u{1F916} Auto-Paste ON! Copy text to see it appear.");
      }
      updateAutoBtn();
    };
    if (this.pinboardItems.length === 0) {
      boardCanvas.createEl("p", { text: "Your Board is empty. Paste a skeleton, add nodes, or pin notes!", cls: "cornell-sidebar-empty" });
      return;
    }
    let draggedIndex = null;
    const listContainer = boardCanvas.createDiv();
    this.pinboardItems.forEach((item, index) => {
      let currentIndex = index;
      let itemWrapper = listContainer.createDiv();
      itemWrapper.setAttr("draggable", "true");
      itemWrapper.classList.add("cornell-pinboard-item");
      itemWrapper.tabIndex = 0;
      itemWrapper.style.cursor = "grab";
      itemWrapper.style.marginBottom = "5px";
      const indent = item.indentLevel || 0;
      itemWrapper.style.marginLeft = `${indent * 20}px`;
      itemWrapper.style.borderRadius = "4px";
      itemWrapper.addEventListener("focus", () => {
        itemWrapper.style.backgroundColor = "var(--background-modifier-hover)";
        itemWrapper.style.outline = "2px solid var(--interactive-accent)";
        itemWrapper.style.outlineOffset = "-2px";
      });
      itemWrapper.addEventListener("blur", () => {
        itemWrapper.style.backgroundColor = "transparent";
        itemWrapper.style.outline = "none";
      });
      itemWrapper.addEventListener("cornell-move", (e) => {
        const dir = e.detail;
        if (dir === "up" && index > 0) {
          const temp = this.pinboardItems[index];
          this.pinboardItems[index] = this.pinboardItems[index - 1];
          this.pinboardItems[index - 1] = temp;
          this.pinboardFocusIndex = index - 1;
          this.applyFiltersAndRender();
        } else if (dir === "down" && index < this.pinboardItems.length - 1) {
          const temp = this.pinboardItems[index];
          this.pinboardItems[index] = this.pinboardItems[index + 1];
          this.pinboardItems[index + 1] = temp;
          this.pinboardFocusIndex = index + 1;
          this.applyFiltersAndRender();
        } else if (dir === "left") {
          item.indentLevel = Math.max(0, (item.indentLevel || 0) - 1);
          this.pinboardFocusIndex = index;
          this.applyFiltersAndRender();
        } else if (dir === "right") {
          item.indentLevel = (item.indentLevel || 0) + 1;
          this.pinboardFocusIndex = index;
          this.applyFiltersAndRender();
        }
      });
      itemWrapper.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.targetInsertIndex = currentIndex;
          this.targetInsertAsChild = e.altKey;
          if (this.sliderIdeaInput) this.sliderIdeaInput.focus();
          return;
        }
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            if (itemWrapper.previousElementSibling) itemWrapper.previousElementSibling.focus();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            if (itemWrapper.nextElementSibling) itemWrapper.nextElementSibling.focus();
          } else if (e.key.toLowerCase() === "h") {
            e.preventDefault();
            e.stopPropagation();
            const hoverEvent = new MouseEvent("mouseenter", { bubbles: true, cancelable: true });
            itemWrapper.dispatchEvent(hoverEvent);
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            const leaveEvent = new MouseEvent("mouseleave", { bubbles: true, cancelable: true });
            itemWrapper.dispatchEvent(leaveEvent);
          }
        }
      });
      if (item.isTitle) {
        itemWrapper.style.padding = "10px 5px";
        itemWrapper.style.marginTop = "15px";
        itemWrapper.style.borderBottom = "2px solid var(--interactive-accent)";
        itemWrapper.style.color = "var(--text-accent)";
        itemWrapper.style.fontWeight = "bold";
        itemWrapper.style.display = "flex";
        itemWrapper.style.justifyContent = "space-between";
        const match = item.text.match(/^(#+)\s(.*)/);
        itemWrapper.style.fontSize = match ? match[1].length === 1 ? "1.4em" : "1.25em" : "1.1em";
        const titleSpan = itemWrapper.createSpan({ text: match ? match[2] : item.text });
        titleSpan.style.wordBreak = "break-word";
        titleSpan.style.whiteSpace = "normal";
        titleSpan.style.cursor = "text";
        titleSpan.title = "Double-click to edit";
        const delBtn = itemWrapper.createSpan({ text: "\xD7", title: "Borrar" });
        delBtn.style.cursor = "pointer";
        delBtn.style.flexShrink = "0";
        delBtn.onclick = () => {
          this.pinboardItems.splice(currentIndex, 1);
          this.applyFiltersAndRender();
        };
        titleSpan.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          const currentText = match ? match[2] : item.text;
          const prefix = match ? match[1] + " " : "";
          const input = document.createElement("input");
          input.type = "text";
          input.value = currentText;
          input.style.width = "100%";
          input.style.background = "transparent";
          input.style.border = "1px solid var(--interactive-accent)";
          input.style.color = "inherit";
          input.style.font = "inherit";
          input.style.outline = "none";
          itemWrapper.replaceChild(input, titleSpan);
          input.focus();
          const saveEdit = () => {
            const newVal = input.value.trim();
            if (newVal) {
              item.text = prefix + newVal;
              item.rawText = prefix + newVal;
            }
            this.applyFiltersAndRender();
          };
          input.addEventListener("blur", saveEdit);
          input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") saveEdit();
            if (ev.key === "Escape") this.applyFiltersAndRender();
          });
        });
      } else if (item.isCustom) {
        itemWrapper.style.padding = "6px 8px";
        itemWrapper.style.display = "flex";
        itemWrapper.style.justifyContent = "space-between";
        itemWrapper.style.alignItems = "flex-start";
        itemWrapper.style.color = "var(--text-normal)";
        itemWrapper.style.borderLeft = "2px solid var(--background-modifier-border)";
        itemWrapper.style.backgroundColor = "var(--background-primary-alt)";
        const textSpan = itemWrapper.createSpan();
        textSpan.style.wordBreak = "break-word";
        textSpan.style.whiteSpace = "normal";
        textSpan.style.flex = "1";
        textSpan.style.marginRight = "10px";
        textSpan.style.cursor = "text";
        textSpan.title = "Double-click to edit";
        if (item.text.startsWith("![")) {
          import_obsidian10.MarkdownRenderer.renderMarkdown(item.text, textSpan, "", this.plugin);
          setTimeout(() => {
            const img = textSpan.querySelector("img");
            if (img) {
              img.style.maxHeight = "250px";
              img.style.maxWidth = "100%";
              img.style.objectFit = "contain";
              img.style.borderRadius = "4px";
            }
          }, 50);
        } else {
          textSpan.innerText = "\u26AC " + item.text;
        }
        const delBtn = itemWrapper.createSpan({ text: "\xD7", title: "Delete node" });
        delBtn.style.cursor = "pointer";
        delBtn.style.opacity = "0.3";
        delBtn.style.flexShrink = "0";
        delBtn.onclick = () => {
          this.pinboardItems.splice(currentIndex, 1);
          this.applyFiltersAndRender();
        };
        itemWrapper.onmouseenter = () => delBtn.style.opacity = "1";
        itemWrapper.onmouseleave = () => delBtn.style.opacity = "0.3";
        textSpan.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          const input = document.createElement("input");
          input.type = "text";
          input.value = item.text;
          input.style.width = "100%";
          input.style.background = "transparent";
          input.style.border = "1px solid var(--interactive-accent)";
          input.style.color = "inherit";
          input.style.font = "inherit";
          input.style.outline = "none";
          itemWrapper.replaceChild(input, textSpan);
          input.focus();
          const saveEdit = () => {
            const newVal = input.value.trim();
            if (newVal) {
              item.text = newVal;
              item.rawText = newVal;
            }
            this.applyFiltersAndRender();
          };
          input.addEventListener("blur", saveEdit);
          input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") saveEdit();
            if (ev.key === "Escape") this.applyFiltersAndRender();
          });
        });
      } else {
        const marginaliaDOM = this.createItemDiv(item, itemWrapper, true, currentIndex);
        marginaliaDOM.setAttr("draggable", "false");
      }
      itemWrapper.addEventListener("dragstart", (e) => {
        draggedIndex = currentIndex;
        itemWrapper.style.opacity = "0.4";
        e.stopPropagation();
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "copyMove";
          let targetId = item.blockId;
          if (!targetId && item.file) {
            targetId = Math.random().toString(36).substring(2, 8);
            item.blockId = targetId;
            this.injectBackgroundBlockId(item.file, item.line, targetId);
          }
          if (e.ctrlKey || e.metaKey) {
            let cleanText = this.cleanExportText(item.text);
            if (!cleanText) cleanText = item.text.replace(/!\[\[(.*?)\]\]/g, "\u{1F5BC}\uFE0F [Image]").trim() || "Pinboard Node";
            let citationText = item.context || "";
            cleanText = cleanText.replace(/\r?\n|\r/g, " ").replace(/\s{2,}/g, " ").trim();
            citationText = citationText.replace(/\r?\n|\r/g, " ").replace(/\s{2,}/g, " ").trim();
            e.dataTransfer.setData("text/plain", cleanText);
            e.dataTransfer.setData("application/cornell-marginalia-payload", cleanText);
            if (citationText) {
              navigator.clipboard.writeText(citationText);
              new import_obsidian10.Notice("\u{1F3A8} Excalidraw: Marginalia soltada. \xA1Presiona Ctrl+V para pegar el PDF++!");
            } else {
              new import_obsidian10.Notice("\u{1F3A8} Excalidraw: Marginalia soltada en el lienzo.");
            }
          } else {
            let dragPayload = this.buildThreadDropText(item, 0, /* @__PURE__ */ new Set(), void 0, false);
            e.dataTransfer.setData("text/plain", dragPayload.trim());
            _CornellNotesView.lastDraggedPayload = dragPayload.trim();
          }
        }
      });
      itemWrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        itemWrapper.style.borderTop = "3px solid var(--interactive-accent)";
        console.log("\u2708\uFE0F 2. DRAG OVER: Volando sobre una nota. \xBFHay payload?", OmniDragManager.payload !== null);
      });
      itemWrapper.addEventListener("dragleave", () => {
        itemWrapper.style.borderTop = "";
      });
      itemWrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        itemWrapper.style.borderTop = "";
        if (OmniDragManager.payload) {
          const newItem = { ...OmniDragManager.payload, indentLevel: 0 };
          this.pinboardItems.splice(currentIndex, 0, newItem);
          this.applyFiltersAndRender();
          return;
        }
        if (draggedIndex !== null && draggedIndex !== currentIndex) {
          const itemToMove = this.pinboardItems[draggedIndex];
          this.pinboardItems.splice(draggedIndex, 1);
          const targetIndex = draggedIndex < currentIndex ? currentIndex - 1 : currentIndex;
          this.pinboardItems.splice(targetIndex, 0, itemToMove);
          this.pinboardFocusIndex = targetIndex;
          this.applyFiltersAndRender();
        }
      });
      itemWrapper.addEventListener("dragend", () => {
        itemWrapper.style.opacity = "1";
        draggedIndex = null;
        this.triggerTemplaterAfterDrop();
      });
    });
    const dropZone = listContainer.createDiv();
    dropZone.style.height = "60px";
    dropZone.style.width = "100%";
    dropZone.style.marginTop = "10px";
    dropZone.style.borderRadius = "4px";
    dropZone.style.transition = "all 0.2s ease";
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      console.log("\u2708\uFE0F 2.5 DRAG OVER: Volando sobre la zona vac\xEDa. \xBFHay payload?", OmniDragManager.payload !== null);
      dropZone.style.border = "2px dashed var(--interactive-accent)";
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.style.border = "none";
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.border = "none";
      if (OmniDragManager.payload) {
        console.log("\u{1F6EC} 3. DROP: \xA1Aterrizaje autorizado en el Pinboard!");
        const newItem = { ...OmniDragManager.payload, indentLevel: 0 };
        this.pinboardItems.push(newItem);
        this.pinboardFocusIndex = this.pinboardItems.length - 1;
        this.applyFiltersAndRender();
        return;
      }
      if (draggedIndex !== null && draggedIndex !== this.pinboardItems.length - 1) {
        const itemToMove = this.pinboardItems[draggedIndex];
        this.pinboardItems.splice(draggedIndex, 1);
        this.pinboardItems.push(itemToMove);
        this.pinboardFocusIndex = this.pinboardItems.length - 1;
        this.applyFiltersAndRender();
      }
    });
    if (this.pinboardFocusIndex !== null && listContainer.children[this.pinboardFocusIndex]) {
      listContainer.children[this.pinboardFocusIndex].focus();
      this.pinboardFocusIndex = null;
    }
  }
  // ======================================================
  // 🧠 MOTOR DE REPETICIÓN ESPACIADA (1-3-7) Y AUDITORÍA
  // ======================================================
  async saveBlurtingSession() {
    const zkId = window.moment().format("YYYYMMDDHHmmss");
    const today = window.moment().format("YYYY-MM-DD");
    const nextReview = window.moment().add(1, "days").format("YYYY-MM-DD");
    let fileContent = `---
blurting_source_query: "${this.searchQuery || "Full Vault"}"
first_session: ${today}
next_review: ${nextReview}
review_stage: 1
---

# \u{1F9E0} Blurting Audit: ${this.searchQuery || "Session"}

`;
    if (this.blurtingFormat === "visual" && this.zenCanvasEl) {
      const folder = this.plugin.settings.doodleFolder.trim();
      await this.plugin.ensureFolderExists(folder);
      if (this.originalCanvasData) {
        const origName = `blurting_raw_${zkId}.png`;
        const origPath = folder ? `${folder}/${origName}` : origName;
        await this.plugin.app.vault.createBinary(origPath, this.originalCanvasData);
        fileContent += `### \u{1F9E0} 1. The Blurt (Original)
![[${origName}]]

`;
      }
      const dataUrl = this.zenCanvasEl.toDataURL("image/png");
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const correctedBuffer = base64ToArrayBuffer2(base64Data);
      const corrName = `blurting_audit_${zkId}.png`;
      const corrPath = folder ? `${folder}/${corrName}` : corrName;
      await this.plugin.app.vault.createBinary(corrPath, correctedBuffer);
      fileContent += `### \u{1F58D}\uFE0F 2. The Audit (Corrections)
![[${corrName}]]

`;
    }
    fileContent += `*Deck contained ${this.blurtingDeck.length} notes.*`;
    const folderPath = this.plugin.settings.zkFolder.trim() || "/";
    await this.plugin.ensureFolderExists(folderPath);
    let finalPath = folderPath === "/" ? `Audit_${zkId}.md` : `${folderPath}/Audit_${zkId}.md`;
    await this.plugin.app.vault.create(finalPath, fileContent);
    new import_obsidian10.Notice("\u2705 Dual Session saved to Spaced Repetition Engine!");
    this.originalCanvasData = null;
    this.isAuditing = false;
    this.isZenMode = false;
    this.currentTab = "reviews";
    this.renderUI();
    this.applyFiltersAndRender();
  }
  renderReviewsTab(container) {
    container.empty();
    container.createEl("h3", { text: "\u{1F514} Due for Review (1-3-7)", cls: "cornell-sidebar-title" });
    const todayStr = window.moment().format("YYYY-MM-DD");
    const cache = this.plugin.app.metadataCache;
    const allFiles = this.plugin.app.vault.getMarkdownFiles();
    const dueReviews = [];
    for (const file of allFiles) {
      const fileCache = cache.getFileCache(file);
      if ((fileCache == null ? void 0 : fileCache.frontmatter) && fileCache.frontmatter.next_review) {
        const nextReview = fileCache.frontmatter.next_review;
        const stage = fileCache.frontmatter.review_stage || 1;
        if (stage < 4 && nextReview <= todayStr) {
          dueReviews.push({ file, frontmatter: fileCache.frontmatter });
        }
      }
    }
    if (dueReviews.length === 0) {
      container.createEl("p", { text: "\u{1F389} You're all caught up! No reviews pending.", cls: "cornell-sidebar-empty" });
      return;
    }
    dueReviews.forEach((review) => {
      const card = container.createDiv({ cls: "cornell-sidebar-item" });
      card.style.borderLeftColor = "var(--color-purple)";
      const title = review.frontmatter.blurting_source_query || review.file.basename;
      card.createDiv({ text: `\u{1F4DA} Topic: ${title}`, attr: { style: "font-weight: bold; margin-bottom: 5px; color: var(--text-normal);" } });
      card.createDiv({ text: `Stage: ${review.frontmatter.review_stage} (Due: ${review.frontmatter.next_review})`, cls: "cornell-sidebar-item-meta" });
      const btnRow = card.createDiv({ attr: { style: "display: flex; gap: 10px; margin-top: 10px;" } });
      const openBtn = btnRow.createEl("button", { text: "\u{1F441}\uFE0F Open" });
      openBtn.onclick = () => this.plugin.app.workspace.getLeaf(false).openFile(review.file);
      const advanceBtn = btnRow.createEl("button", { text: "\u2705 Advance Stage", cls: "mod-cta" });
      advanceBtn.style.backgroundColor = "var(--color-green)";
      advanceBtn.style.color = "white";
      advanceBtn.onclick = async () => {
        await this.advanceReviewStage(review.file, review.frontmatter);
        this.applyFiltersAndRender();
      };
    });
  }
  async advanceReviewStage(file, currentFrontmatter) {
    const currentStage = currentFrontmatter.review_stage || 1;
    let daysToAdd = 0;
    let newStage = currentStage + 1;
    if (currentStage === 1) daysToAdd = 2;
    else if (currentStage === 2) daysToAdd = 4;
    else if (currentStage === 3) daysToAdd = 999;
    const nextReviewStr = window.moment().add(daysToAdd, "days").format("YYYY-MM-DD");
    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.review_stage = newStage;
      if (newStage > 3) {
        frontmatter.next_review = "Mastered";
      } else {
        frontmatter.next_review = nextReviewStr;
      }
    });
    new import_obsidian10.Notice(newStage > 3 ? "\u{1F393} Topic Mastered!" : `\u{1F4C8} Advanced! Next review on ${nextReviewStr}`);
  }
  // --- ⚡ DISPARADOR DE LA SESIÓN ---
  async startBlurtingSession(deck, format) {
    this.isBlurtingActive = true;
    this.blurtingDeck = deck;
    this.blurtingFormat = format;
    if (format === "visual") {
      this.currentTab = "pinboard";
      this.isZenMode = true;
    } else {
      const zkId = window.moment().format("YYYYMMDDHHmmss");
      const fileName = `${this.plugin.settings.zkFolder}/Blurting_${zkId}.md`;
      await this.plugin.ensureFolderExists(this.plugin.settings.zkFolder);
      const header = `# \u{1F9E0} Blurting Session
*Write down everything you remember about the ${deck.length} notes in your deck.*

---

`;
      const newFile = await this.plugin.app.vault.create(fileName, header);
      await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
    }
    this.renderUI();
    this.applyFiltersAndRender();
  }
  async exportPinboard() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const folder = this.plugin.settings.pinboardFolder.trim();
    await this.plugin.ensureFolderExists(folder);
    const fileName = folder ? `${folder}/Pinboard_${dateStr}.md` : `Pinboard_${dateStr}.md`;
    let dominantSource = "Multiple Sources";
    if (this.isZotlikeMode && this.activePdfName) {
      dominantSource = this.activePdfName;
    } else {
      const sourceCounts = {};
      let maxCount = 0;
      let topSource = "";
      for (const item of this.pinboardItems) {
        if (!item.isTitle && !item.isCustom && item.file && item.file.basename) {
          const basename = item.file.basename;
          sourceCounts[basename] = (sourceCounts[basename] || 0) + 1;
          if (sourceCounts[basename] > maxCount) {
            maxCount = sourceCounts[basename];
            topSource = basename;
          }
        }
      }
      if (topSource) {
        dominantSource = topSource;
      } else {
        dominantSource = "Custom Board";
      }
    }
    let content = "";
    if (this.plugin.settings.pinboardTemplatePath) {
      content = await this.plugin.getTemplateContent(this.plugin.settings.pinboardTemplatePath, {
        title: `Pinboard_${dateStr}`,
        // @ts-ignore
        date: window.moment().format("YYYY-MM-DD"),
        // @ts-ignore
        time: window.moment().format("HH:mm"),
        source_note: dominantSource
        // 🎯 FIX: Ahora sí usa el algoritmo inteligente
      });
    }
    if (!content) {
      content = `# \u25CF Pinboard Session
*Exported on: ${window.moment().format("YYYY-MM-DD HH:mm")}*

---

`;
    }
    let itemTemplateRaw = "";
    if (this.plugin.settings.pinboardItemTemplatePath) {
      const templateFile = this.app.metadataCache.getFirstLinkpathDest(this.plugin.settings.pinboardItemTemplatePath, "");
      if (templateFile instanceof import_obsidian10.TFile) {
        itemTemplateRaw = await this.app.vault.read(templateFile);
      }
    }
    for (const item of this.pinboardItems) {
      if (item.isTitle) {
        const text = item.text.startsWith("#") ? item.text : `## ${item.text}`;
        content += `${text}

`;
        continue;
      }
      if (item.isCustom) {
        const indentSpaces = "  ".repeat(item.indentLevel || 0);
        content += `${indentSpaces}- ${item.text}

`;
        continue;
      }
      let targetId = item.blockId;
      if (!targetId) {
        targetId = Math.random().toString(36).substring(2, 8);
        item.blockId = targetId;
        await this.injectBackgroundBlockId(item.file, item.line, targetId);
      }
      let citation = "";
      let contextText = "";
      if (item.file && item.line !== void 0) {
        const fileContent = await this.plugin.app.vault.cachedRead(item.file);
        const lines = fileContent.split("\n");
        contextText = lines[item.line] || "";
        contextText = contextText.replace(/%%[><](.*?)%%/g, "").trim();
        let searchIdx = item.line + 1;
        while (searchIdx < lines.length) {
          const lineStr = lines[searchIdx].trim();
          if (lineStr.startsWith(">")) {
            citation += `${lineStr}
`;
          } else if (lineStr.startsWith("^") || lineStr === "") {
          } else {
            break;
          }
          searchIdx++;
        }
      }
      const sourceLink = item.file ? `[[${item.file.basename}#^${targetId}|${item.file.basename}]]` : "Custom";
      const cleanExportItemText = sanitizeForTemplater(this.cleanExportText(item.text));
      if (itemTemplateRaw) {
        let currentItemContent = itemTemplateRaw;
        currentItemContent = currentItemContent.replace(/{{text}}/g, cleanExportItemText);
        const finalCitation = sanitizeForTemplater(citation ? citation.trim() : contextText);
        currentItemContent = currentItemContent.replace(/{{citation}}/g, finalCitation);
        currentItemContent = currentItemContent.replace(/{{source_note}}/g, sourceLink);
        content += `${currentItemContent}

`;
      } else {
        content += `${cleanExportItemText}

`;
        if (citation) {
          content += `${citation}
`;
        } else if (contextText) {
          content += `${contextText}
`;
        }
        content += `*\u2014 \u{1F517} ${sourceLink}*

---

`;
      }
    }
    const templaterPlugin = this.app.plugins.plugins["templater-obsidian"];
    if (templaterPlugin && templaterPlugin.templater) {
      try {
        const activeContextFile = this.app.workspace.getActiveFile();
        content = await templaterPlugin.templater.parse_template(
          { target_file: activeContextFile, run_mode: 4 },
          content
        );
      } catch (err) {
        console.warn("Cornell Marginalia: Error de Templater en Pinboard", err);
      }
    }
    try {
      const newFile = await this.plugin.app.vault.create(fileName, content);
      await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
      new import_obsidian10.Notice("Pinboard compiled successfully!");
    } catch (error) {
      new import_obsidian10.Notice("Error creating Pinboard file. Check console.");
    }
  }
  // 🌳 NUEVA FUNCIÓN MEJORADA: Exportador al Portapapeles para Mindmaps (Excalidraw)
  async exportMindmap() {
    if (this.pinboardItems.length === 0) {
      new import_obsidian10.Notice("El Board est\xE1 vac\xEDo.");
      return;
    }
    let content = "";
    for (const item of this.pinboardItems) {
      if (item.isTitle) {
        const text = item.text.startsWith("#") ? item.text : `# ${item.text}`;
        content += `${text}
`;
      } else if (item.isCustom) {
        const indentSpaces = "	".repeat(item.indentLevel || 0);
        content += `${indentSpaces}- ${item.text}
`;
      } else {
        const indentSpaces = "	".repeat(item.indentLevel || 0);
        let targetId = item.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          item.blockId = targetId;
          await this.injectBackgroundBlockId(item.file, item.line, targetId);
        }
        const imgRegex = /img:\s*\[\[(.*?)\]\]/i;
        const match = item.rawText.match(imgRegex);
        let cleanText = item.rawText.replace(imgRegex, "").trim();
        cleanText = this.cleanExportText(cleanText);
        let contextText = "";
        if (item.file && item.line !== void 0) {
          const fileContent = await this.plugin.app.vault.cachedRead(item.file);
          const lines = fileContent.split("\n");
          let originalLine = lines[item.line] || "";
          originalLine = originalLine.replace(/%%[><](.*?)%%/g, "").trim();
          originalLine = originalLine.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
          if (!originalLine && item.line > 0) {
            originalLine = lines[item.line - 1].trim();
          }
          let searchIdx = item.line + 1;
          let citation = "";
          while (searchIdx < lines.length) {
            const lineStr = lines[searchIdx].trim();
            if (lineStr.startsWith(">")) citation += `${lineStr}
`;
            else if (lineStr.startsWith("^") || lineStr === "") {
            } else break;
            searchIdx++;
          }
          contextText = citation ? citation.trim() : originalLine;
        }
        if (cleanText.length > 0) {
          content += `${indentSpaces}- [[${item.file.basename}#^${targetId}|${cleanText}]]
`;
        } else if (match) {
          content += `${indentSpaces}- [[${item.file.basename}#^${targetId}|\u{1F3A8} Doodle]]
`;
        }
        if (match) {
          const imageName = match[1];
          content += `${indentSpaces}	- ![[${imageName}]]
`;
        }
        if (contextText) {
          const cleanContext = contextText.replace(/\n/g, " ");
          content += `${indentSpaces}	-  ${cleanContext}
`;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(content);
      new import_obsidian10.Notice("\u{1F4CB} \xA1Mindmap copiado! Ve a Excalidraw y presiona Ctrl+V");
    } catch (error) {
      new import_obsidian10.Notice("Error al copiar al portapapeles. Revisa la consola.");
      console.error(error);
    }
  }
  // 🎨 NUEVO MOTOR: Generador Automático de Canvas (Tablero de Evidencia) con Plantillas
  async exportCanvas() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const folder = this.plugin.settings.canvasFolder.trim();
    await this.plugin.ensureFolderExists(folder);
    const fileName = folder ? `${folder}/EvidenceBoard_${dateStr}.canvas` : `EvidenceBoard_${dateStr}.canvas`;
    let canvasTemplateRaw = "";
    if (this.plugin.settings.canvasItemTemplatePath) {
      const templateFile = this.app.metadataCache.getFirstLinkpathDest(this.plugin.settings.canvasItemTemplatePath, "");
      if (templateFile instanceof import_obsidian10.TFile) {
        canvasTemplateRaw = await this.app.vault.read(templateFile);
      }
    }
    const nodes = [];
    const edges = [];
    const genId = () => [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    let currentY = 0;
    let lastTitleId = null;
    let parentAtLevel = {};
    for (const item of this.pinboardItems) {
      const nodeId = genId();
      if (item.isTitle) {
        const rawTitle = item.text.startsWith("#") ? item.text : `# ${item.text}`;
        const titleText = sanitizeForTemplater(rawTitle);
        nodes.push({ id: nodeId, type: "text", text: titleText, x: 0, y: currentY, width: 350, height: 100, color: "1" });
        lastTitleId = nodeId;
        parentAtLevel = {};
        parentAtLevel[-1] = nodeId;
        currentY += 150;
      } else if (item.isCustom) {
        const safeSkeletonText = sanitizeForTemplater(item.text);
        const indent = item.indentLevel || 0;
        const baseX = (indent + 1) * 450;
        nodes.push({ id: nodeId, type: "text", text: `**${safeSkeletonText}**`, x: baseX, y: currentY, width: 250, height: 60, color: "5" });
        const parentId = parentAtLevel[indent - 1] || lastTitleId;
        if (parentId) edges.push({ id: genId(), fromNode: parentId, fromSide: "right", toNode: nodeId, toSide: "left" });
        parentAtLevel[indent] = nodeId;
        currentY += 100;
      } else {
        const indent = item.indentLevel || 0;
        const baseX = (indent + 1) * 450;
        let targetId = item.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          item.blockId = targetId;
          await this.injectBackgroundBlockId(item.file, item.line, targetId);
        }
        let canvasNoteContent = item.rawText;
        const hasImage = /img:\s*\[\[(.*?)\]\]/gi.test(canvasNoteContent);
        canvasNoteContent = canvasNoteContent.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]");
        canvasNoteContent = sanitizeForTemplater(this.cleanExportText(canvasNoteContent));
        const sourceLink = `[[${item.file.basename}#^${targetId}|\u{1F517} Origin]]`;
        let noteText = "";
        if (canvasTemplateRaw) {
          noteText = canvasTemplateRaw;
          noteText = noteText.replace(/{{text}}/g, canvasNoteContent);
          noteText = noteText.replace(/{{source_note}}/g, sourceLink);
        } else {
          noteText = `**Marginalia:**
${canvasNoteContent}

${sourceLink}`;
        }
        const nodeHeight = hasImage ? 320 : 140;
        nodes.push({ id: nodeId, type: "text", text: noteText, x: baseX, y: currentY, width: 300, height: nodeHeight, color: "4" });
        const parentId = parentAtLevel[indent - 1] || lastTitleId;
        if (parentId) {
          edges.push({ id: genId(), fromNode: parentId, fromSide: "right", toNode: nodeId, toSide: "left" });
        }
        parentAtLevel[indent] = nodeId;
        const fileContent = await this.plugin.app.vault.cachedRead(item.file);
        const lines = fileContent.split("\n");
        let startLine = item.line;
        let endLine = item.line;
        while (startLine > 0 && lines[startLine - 1].trim() !== "" && !lines[startLine - 1].startsWith("```")) {
          startLine--;
        }
        while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== "" && !lines[endLine + 1].startsWith("```")) {
          endLine++;
        }
        let contextText = "";
        for (let i = startLine; i <= endLine; i++) {
          let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
          cleanLine = cleanLine.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
          if (cleanLine.startsWith("```")) continue;
          if (cleanLine) {
            contextText += cleanLine + "\n";
          }
        }
        contextText = contextText.trim();
        if (contextText) {
          const safeContextText = sanitizeForTemplater(contextText.trim());
          const contextNodeId = genId();
          nodes.push({ id: contextNodeId, type: "text", text: `> ${safeContextText}`, x: baseX + 400, y: currentY - 20, width: 450, height: Math.max(180, nodeHeight) });
          edges.push({ id: genId(), fromNode: nodeId, fromSide: "right", toNode: contextNodeId, toSide: "left" });
        }
        currentY += hasImage ? 360 : 220;
      }
    }
    let canvasData = JSON.stringify({ nodes, edges }, null, 2);
    const templaterPlugin = this.app.plugins.plugins["templater-obsidian"];
    if (templaterPlugin && templaterPlugin.templater) {
      try {
        const activeContextFile = this.app.workspace.getActiveFile();
        canvasData = await templaterPlugin.templater.parse_template(
          { target_file: activeContextFile, run_mode: 4 },
          canvasData
        );
      } catch (err) {
        console.warn("Cornell Marginalia: Error de Templater en Canvas", err);
      }
    }
    try {
      const newFile = await this.plugin.app.vault.create(fileName, canvasData);
      await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
      new import_obsidian10.Notice("\u{1F3A8} Evidence Board created successfully!");
    } catch (error) {
      new import_obsidian10.Notice("Error creating Canvas file. Check console.");
      console.error(error);
    }
  }
  renderGroupedByContent(groupedResults, container) {
    container.empty();
    let totalFound = 0;
    for (const [normalizedText, items] of Object.entries(groupedResults)) {
      if (items.length === 0) continue;
      totalFound += items.length;
      if (items.length === 1) {
        this.createItemDiv(items[0], container);
        continue;
      }
      const groupParent = container.createDiv({ cls: "cornell-thread-parent" });
      groupParent.style.position = "relative";
      const representativeItem = items[0];
      const headerDiv = groupParent.createDiv({ cls: "cornell-sidebar-item" });
      headerDiv.style.borderLeftColor = representativeItem.color;
      const textRow = headerDiv.createDiv({ cls: "cornell-sidebar-item-text" });
      textRow.style.display = "flex";
      textRow.style.justifyContent = "space-between";
      textRow.style.alignItems = "flex-start";
      const textSpan = textRow.createSpan({ text: representativeItem.text });
      textSpan.style.flexGrow = "1";
      const allPinned = items.every((item) => this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path));
      const groupPinBtn = textRow.createEl("span", {
        text: allPinned ? "\u25CF" : "\u25CB",
        title: allPinned ? "Unpin Group" : "Pin Group to Board"
      });
      groupPinBtn.style.cursor = "pointer";
      groupPinBtn.style.marginLeft = "10px";
      groupPinBtn.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      groupPinBtn.style.opacity = allPinned ? "1" : "0";
      headerDiv.addEventListener("mouseenter", () => {
        const currentlyAllPinned = items.every((item) => this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path));
        if (!currentlyAllPinned) groupPinBtn.style.opacity = "0.5";
      });
      headerDiv.addEventListener("mouseleave", () => {
        const currentlyAllPinned = items.every((item) => this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path));
        if (!currentlyAllPinned) groupPinBtn.style.opacity = "0";
      });
      groupPinBtn.onmouseenter = () => {
        groupPinBtn.style.opacity = "1";
        groupPinBtn.style.transform = "scale(1.2)";
      };
      groupPinBtn.onmouseleave = () => {
        groupPinBtn.style.transform = "scale(1)";
        const currentlyAllPinned = items.every((item) => this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path));
        if (!currentlyAllPinned) groupPinBtn.style.opacity = "0.5";
      };
      groupPinBtn.onclick = (e) => {
        e.stopPropagation();
        const currentlyAllPinned = items.every((item) => this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path));
        if (currentlyAllPinned) {
          this.pinboardItems = this.pinboardItems.filter((p) => !items.some((i) => i.rawText === p.rawText && i.file.path === p.file.path));
          groupPinBtn.innerText = "\u25CB";
          groupPinBtn.style.opacity = "0.5";
        } else {
          items.forEach((item) => {
            const alreadyPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
            if (!alreadyPinned) this.pinboardItems.push(item);
          });
          groupPinBtn.innerText = "\u25CF";
          groupPinBtn.style.opacity = "1";
        }
      };
      headerDiv.createDiv({ cls: "cornell-sidebar-item-meta", text: `\u{1F5C1} ${items.length} occurrences` });
      headerDiv.setAttr("draggable", "true");
      headerDiv.addEventListener("dragstart", (event) => {
        event.stopPropagation();
        window.OmniDragManager = {
          payload: {
            type: "group",
            title: representativeItem.text,
            items
            // La lista de marginalias hijas
          }
        };
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = "copy";
        let targetId = representativeItem.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          representativeItem.blockId = targetId;
          this.injectBackgroundBlockId(representativeItem.file, representativeItem.line, targetId);
        }
        const dragPayload = `[[${representativeItem.file.basename}#^${targetId}|Group: ${representativeItem.text}]]`;
        event.dataTransfer.setData("text/plain", dragPayload);
        _CornellNotesView.lastDraggedPayload = dragPayload;
        this.draggedSidebarItems = items;
      });
      headerDiv.addEventListener("dragend", () => {
        this.draggedSidebarItems = null;
        headerDiv.removeClass("cornell-drop-target");
        this.triggerTemplaterAfterDrop();
        window.OmniDragManager = { payload: null };
      });
      headerDiv.addEventListener("dragenter", (e) => {
        e.preventDefault();
        const isSelf = this.draggedSidebarItems && this.draggedSidebarItems.some((i) => items.includes(i));
        if (this.draggedSidebarItems && !isSelf) headerDiv.addClass("cornell-drop-target");
      });
      headerDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      });
      headerDiv.addEventListener("dragleave", () => {
        headerDiv.removeClass("cornell-drop-target");
      });
      headerDiv.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        headerDiv.removeClass("cornell-drop-target");
        const isSelf = this.draggedSidebarItems && this.draggedSidebarItems.some((i) => items.includes(i));
        if (this.draggedSidebarItems && !isSelf) {
          await this.executeMassStitch(items, this.draggedSidebarItems);
          this.draggedSidebarItems = null;
        }
      });
      const childrenContainer = groupParent.createDiv({ cls: "cornell-thread-tree is-collapsed" });
      const toggleBtn = headerDiv.createDiv({ cls: "cornell-collapse-toggle is-collapsed" });
      toggleBtn.innerHTML = "\u25BC";
      headerDiv.prepend(toggleBtn);
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        if (childrenContainer.hasClass("is-collapsed")) {
          childrenContainer.removeClass("is-collapsed");
          toggleBtn.removeClass("is-collapsed");
        } else {
          childrenContainer.addClass("is-collapsed");
          toggleBtn.addClass("is-collapsed");
        }
      };
      items.forEach((item) => {
        const childDiv = this.createItemDiv(item, childrenContainer);
        const textNode = childDiv.querySelector(".cornell-sidebar-item-text > span:first-child");
        if (textNode) textNode.style.display = "none";
        const metaNode = childDiv.querySelector(".cornell-sidebar-item-meta");
        if (metaNode) {
          metaNode.style.fontSize = "0.9em";
          metaNode.style.textAlign = "left";
          metaNode.style.color = "var(--text-normal)";
        }
      });
    }
    if (totalFound === 0) container.createEl("p", { text: "No notes match your search.", cls: "cornell-sidebar-empty" });
  }
  // 📁 NUEVO MOTOR: Convierte rutas físicas en Cajas Semánticas
  renderFolderTree(items, container, isFilteredMode = false) {
    container.empty();
    if (items.length === 0) {
      container.createEl("p", { text: "No notes match your search.", cls: "cornell-sidebar-empty" });
      return;
    }
    const tree = /* @__PURE__ */ new Map();
    for (const item of items) {
      if (!item.file) continue;
      const cleanPath = item.file.path.replace(/\.md$/i, "");
      const parts = cleanPath.split("/");
      let currentLevel = tree;
      let currentPath = "\u{1F4C1}";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath += `/${part}`;
        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            name: part,
            fullPath: currentPath,
            children: /* @__PURE__ */ new Map(),
            items: []
          });
        }
        const node = currentLevel.get(part);
        if (i === parts.length - 1) {
          node.items.push(item);
        }
        currentLevel = node.children;
      }
    }
    if (!this.plugin.settings.pinnedThreads) this.plugin.settings.pinnedThreads = [];
    const pinnedRoots = [];
    const unpinnedRoots = [];
    tree.forEach((node) => {
      if (this.plugin.settings.pinnedThreads.includes(node.fullPath)) {
        pinnedRoots.push(node);
      } else {
        unpinnedRoots.push(node);
      }
    });
    pinnedRoots.forEach((node) => this.renderSemanticTree(node, container, isFilteredMode, 0));
    if (pinnedRoots.length > 0 && unpinnedRoots.length > 0) {
      const sep = container.createDiv();
      sep.style.height = "1px";
      sep.style.backgroundColor = "var(--background-modifier-border)";
      sep.style.margin = "15px 0";
      sep.style.opacity = "0.5";
    }
    unpinnedRoots.forEach((node) => this.renderSemanticTree(node, container, isFilteredMode, 0));
  }
  // tag boxes
  renderThreads(rootItems, container, isFilteredMode = false) {
    container.empty();
    if (rootItems.length === 0) {
      container.createEl("p", { text: "No matching threads found.", cls: "cornell-sidebar-empty" });
      return;
    }
    const tree = /* @__PURE__ */ new Map();
    for (const root of rootItems) {
      const tagMatches = Array.from(root.text.matchAll(/#([a-zA-Z0-9_/-]+)/g));
      const tagsToProcess = tagMatches.length > 0 ? tagMatches.map((m) => m[1]) : ["Untagged"];
      for (const fullTag of tagsToProcess) {
        const parts = fullTag.split("/");
        let currentLevel = tree;
        let currentPath = "";
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          currentPath += i === 0 ? part : `/${part}`;
          if (!currentLevel.has(part)) {
            currentLevel.set(part, {
              name: part,
              fullPath: `#${currentPath}`,
              children: /* @__PURE__ */ new Map(),
              items: []
            });
          }
          const node = currentLevel.get(part);
          if (i === parts.length - 1) {
            if (!node.items.some((existing) => {
              var _a, _b;
              return ((_a = existing.file) == null ? void 0 : _a.path) === ((_b = root.file) == null ? void 0 : _b.path) && existing.line === root.line;
            })) {
              node.items.push(root);
            }
          }
          currentLevel = node.children;
        }
      }
    }
    if (!this.plugin.settings.pinnedThreads) this.plugin.settings.pinnedThreads = [];
    const pinnedRoots = [];
    const unpinnedRoots = [];
    tree.forEach((node) => {
      if (this.plugin.settings.pinnedThreads.includes(node.fullPath)) {
        pinnedRoots.push(node);
      } else {
        unpinnedRoots.push(node);
      }
    });
    pinnedRoots.forEach((node) => this.renderSemanticTree(node, container, isFilteredMode, 0));
    if (pinnedRoots.length > 0 && unpinnedRoots.length > 0) {
      const sep = container.createDiv();
      sep.style.height = "1px";
      sep.style.backgroundColor = "var(--background-modifier-border)";
      sep.style.margin = "15px 0";
      sep.style.opacity = "0.5";
    }
    unpinnedRoots.forEach((node) => this.renderSemanticTree(node, container, isFilteredMode, 0));
  }
  // 🧼 PURIFICADOR UNIVERSAL PARA EXPORTACIONES
  cleanExportText(text) {
    let clean = text;
    if (this.plugin.settings.exportCleanTags) {
      clean = clean.replace(/#[a-zA-Z0-9_/-]+/g, "");
    }
    if (this.plugin.settings.exportCleanIds) {
      clean = clean.replace(/(?:\s+|^)\^[a-zA-Z0-9_-]+/g, "");
      clean = clean.replace(/\[\[[^\]]+#\^[a-zA-Z0-9_-]+(?:\|[^\]]+)?\]\]/g, "");
    }
    clean = clean.replace(/\s*;;\s*/g, "");
    return clean.trim().replace(/\s{2,}/g, " ");
  }
  // 🧵 NUEVO MOTOR RECURSIVO: Construye el texto de una marginalia y todos sus hijos
  buildThreadDropText(item, depth, visitedIds, customTitle, includeChildren = true) {
    if (item.blockId && visitedIds.has(item.blockId)) return "";
    const newVisited = new Set(visitedIds);
    if (item.blockId) newVisited.add(item.blockId);
    const dateStr = window.moment().format("YYYY-MM-DD");
    const timeStr = window.moment().format("HH:mm");
    let cleanText = this.cleanExportText(item.text);
    if (!cleanText) {
      cleanText = item.text.replace(/!\[\[(.*?)\]\]/g, "\u{1F5BC}\uFE0F [Image]").trim() || "Marginalia Doodle";
    }
    const targetId = item.blockId ? `#^${item.blockId}` : "";
    const sourceLink = item.file ? `[[${item.file.basename}${targetId}]]` : "";
    const citationText = item.context || "";
    const rootTitle = customTitle || (item.file ? item.file.basename : "Note");
    let lineStr = this.plugin.settings.dragDropTemplate || "- {{text}} {{source_note}}";
    lineStr = lineStr.replace(/{{title}}/g, rootTitle);
    lineStr = lineStr.replace(/{{date}}/g, dateStr);
    lineStr = lineStr.replace(/{{time}}/g, timeStr);
    lineStr = lineStr.replace(/{{text}}/g, cleanText);
    lineStr = lineStr.replace(/{{source_note}}/g, sourceLink);
    lineStr = lineStr.replace(/{{citation}}/g, citationText);
    const indentSpaces = "	".repeat(depth);
    let formattedItem = lineStr.split("\n").map((line) => line.trim() ? indentSpaces + line : "").join("\n") + "\n";
    if (includeChildren && item.outgoingLinks && item.outgoingLinks.length > 0) {
      for (const linkStr of item.outgoingLinks) {
        const parts = linkStr.split("#^");
        if (parts.length === 2) {
          const childId = parts[1];
          const childItem = this.cachedItems.find((i) => i.blockId === childId);
          if (childItem) {
            formattedItem += this.buildThreadDropText(childItem, depth + 1, newVisited, customTitle, true);
          }
        }
      }
    }
    return formattedItem;
  }
  // 🪆 NUEVA FUNCIÓN: Dibuja cajas dentro de cajas al infinito
  renderSemanticTree(node, container, isFilteredMode, depth) {
    var _a;
    const groupEl = container.createDiv({ cls: "cornell-thread-parent" });
    groupEl.style.border = "1px solid var(--background-modifier-border)";
    groupEl.style.marginBottom = "10px";
    groupEl.style.borderRadius = "6px";
    groupEl.style.overflow = "hidden";
    groupEl.style.backgroundColor = depth > 0 ? "var(--background-primary-alt)" : "transparent";
    groupEl.setAttribute("data-semantic-path", node.fullPath);
    const headerEl = groupEl.createDiv({ cls: "cornell-thread-header" });
    headerEl.style.fontWeight = "bold";
    headerEl.style.padding = "6px 10px";
    headerEl.style.backgroundColor = "var(--background-secondary)";
    headerEl.style.display = "flex";
    headerEl.style.alignItems = "center";
    headerEl.style.gap = "6px";
    headerEl.style.cursor = "pointer";
    const isFolderMode = node.fullPath.startsWith("\u{1F4C1}");
    const isFile = isFolderMode && node.children.size === 0;
    const toggleIcon = headerEl.createSpan({ cls: "cornell-collapse-icon" });
    (0, import_obsidian10.setIcon)(toggleIcon, "chevron-down");
    toggleIcon.style.color = "var(--text-muted)";
    if (!this.plugin.settings.pinnedThreads) this.plugin.settings.pinnedThreads = [];
    const isPinned = this.plugin.settings.pinnedThreads.includes(node.fullPath);
    const iconSpan = headerEl.createSpan();
    if (isPinned) {
      (0, import_obsidian10.setIcon)(iconSpan, "pin");
      iconSpan.style.color = "var(--interactive-accent)";
    } else if (isFolderMode) {
      (0, import_obsidian10.setIcon)(iconSpan, isFile ? "file-text" : "folder");
      if (isFile) iconSpan.style.color = "var(--interactive-accent)";
    } else {
      (0, import_obsidian10.setIcon)(iconSpan, depth === 0 ? "folder-closed" : "folder-tree");
    }
    const displayName = isFolderMode ? node.name : node.name.toUpperCase();
    headerEl.createSpan({ text: displayName });
    if (isFile) {
      headerEl.createSpan({ text: `(${node.items.length})`, attr: { style: "margin-left: 4px; font-size: 0.85em; color: var(--text-muted); font-weight: normal;" } });
    }
    const controlsEl = headerEl.createDiv({ cls: "cornell-thread-controls" });
    controlsEl.style.marginLeft = "auto";
    controlsEl.style.display = "flex";
    controlsEl.style.gap = "10px";
    controlsEl.style.opacity = "0";
    controlsEl.style.transition = "opacity 0.2s ease";
    headerEl.addEventListener("mouseenter", () => controlsEl.style.opacity = "1");
    headerEl.addEventListener("mouseleave", () => controlsEl.style.opacity = "0");
    const pinBtn = controlsEl.createEl("span", { attr: { title: isPinned ? "Unpin" : "Pin to top" } });
    pinBtn.style.cursor = "pointer";
    pinBtn.style.color = isPinned ? "var(--interactive-accent)" : "var(--text-muted)";
    (0, import_obsidian10.setIcon)(pinBtn, "pin");
    pinBtn.onclick = async (e) => {
      e.stopPropagation();
      if (isPinned) {
        this.plugin.settings.pinnedThreads = this.plugin.settings.pinnedThreads.filter((p) => p !== node.fullPath);
      } else {
        this.plugin.settings.pinnedThreads.push(node.fullPath);
      }
      await this.plugin.saveSettings();
      this.applyFiltersAndRender();
    };
    const colorBtn = controlsEl.createEl("span", { attr: { title: "Paint Box (Saves to Settings)" } });
    colorBtn.style.cursor = "pointer";
    colorBtn.style.color = "var(--text-muted)";
    (0, import_obsidian10.setIcon)(colorBtn, "palette");
    const colorInput = controlsEl.createEl("input", { type: "color" });
    colorInput.style.display = "none";
    colorBtn.onclick = (e) => {
      e.stopPropagation();
      colorInput.click();
    };
    colorInput.onchange = async (e) => {
      const newColor = e.target.value;
      if (!this.plugin.settings.structuralColors) this.plugin.settings.structuralColors = [];
      const existing = this.plugin.settings.structuralColors.find((c) => c.tag === node.fullPath);
      if (existing) {
        existing.color = newColor;
      } else {
        this.plugin.settings.structuralColors.push({ tag: node.fullPath, color: newColor });
      }
      await this.plugin.saveSettings();
      this.applyFiltersAndRender();
    };
    const exportBtn = controlsEl.createEl("span", { text: "\u23FA\uFE0E", attr: { title: "Export full tree to Board" } });
    exportBtn.style.cursor = "pointer";
    exportBtn.style.color = "var(--text-muted)";
    exportBtn.style.fontSize = "1.2em";
    exportBtn.style.lineHeight = "1";
    exportBtn.onclick = (e) => {
      e.stopPropagation();
      const pushItemAndChildrenToBoard = (marginalia, indent, visitedIds) => {
        if (marginalia.blockId && visitedIds.has(marginalia.blockId)) return;
        const newVisited = new Set(visitedIds);
        if (marginalia.blockId) newVisited.add(marginalia.blockId);
        const alreadyPinned = this.pinboardItems.some(
          (p) => p.file && marginalia.file && p.blockId === marginalia.blockId && p.file.path === marginalia.file.path
        );
        if (!alreadyPinned) {
          this.pinboardItems.push({ ...marginalia, indentLevel: indent });
        }
        if (this.currentTab === "threads" && marginalia.outgoingLinks && marginalia.outgoingLinks.length > 0) {
          for (const linkStr of marginalia.outgoingLinks) {
            const parts = linkStr.split("#^");
            if (parts.length === 2) {
              const childId = parts[1].split("|")[0].trim();
              const childItem = this.cachedItems.find((i) => i.blockId === childId);
              if (childItem) pushItemAndChildrenToBoard(childItem, indent + 1, newVisited);
            }
          }
        }
      };
      const exportTreeToBoard = (currentNode, currentDepth) => {
        const headingLevel = "#".repeat(currentDepth + 1);
        const headingText = `${headingLevel} ${currentNode.name.toUpperCase()}`;
        this.pinboardItems.push({
          text: headingText,
          rawText: headingText,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isTitle: true
        });
        for (const item of currentNode.items) {
          pushItemAndChildrenToBoard(item, 0, /* @__PURE__ */ new Set());
        }
        currentNode.children.forEach((child) => exportTreeToBoard(child, currentDepth + 1));
      };
      exportTreeToBoard(node, depth);
      this.applyFiltersAndRender();
      new import_obsidian10.Notice(`\u{1F4E6} ${node.name} exportado al Board con todos sus hilos!`);
    };
    const contentEl = groupEl.createDiv({ cls: "cornell-thread-content" });
    contentEl.style.padding = "10px";
    contentEl.style.display = "flex";
    contentEl.style.flexDirection = "column";
    contentEl.style.gap = "4px";
    let matchedColor = null;
    if ((_a = this.plugin.settings) == null ? void 0 : _a.structuralColors) {
      for (const structColor of this.plugin.settings.structuralColors) {
        const settingTag = structColor.tag.trim();
        if (settingTag === node.fullPath || settingTag === node.name || settingTag === `#${node.name}`) {
          matchedColor = structColor.color;
          break;
        }
      }
    }
    if (matchedColor) {
      groupEl.style.border = `1px solid ${matchedColor}66`;
      groupEl.style.borderLeft = `4px solid ${matchedColor}`;
      headerEl.style.backgroundColor = `${matchedColor}22`;
      headerEl.style.color = matchedColor;
      iconSpan.style.color = matchedColor;
      toggleIcon.style.color = matchedColor;
    }
    if (!this.plugin.settings.collapsedBoxes) this.plugin.settings.collapsedBoxes = [];
    let isCollapsed = isFolderMode ? true : false;
    if (this.plugin.settings.collapsedBoxes.includes(node.fullPath)) {
      isCollapsed = !isCollapsed;
    }
    contentEl.style.display = isCollapsed ? "none" : "flex";
    (0, import_obsidian10.setIcon)(toggleIcon, isCollapsed ? "chevron-right" : "chevron-down");
    headerEl.style.borderBottom = isCollapsed ? "none" : "1px solid var(--background-modifier-border)";
    let isRendered = false;
    const renderItemsLazy = () => {
      if (isRendered) return;
      for (const rootItem of node.items) {
        if (this.currentTab === "threads") {
          const threadWrapper = contentEl.createDiv({ cls: "cornell-draggable-thread" });
          threadWrapper.setAttr("draggable", "true");
          threadWrapper.style.cursor = "grab";
          threadWrapper.style.backgroundColor = "var(--background-primary)";
          threadWrapper.style.border = "1px solid var(--background-modifier-border)";
          threadWrapper.style.borderRadius = "6px";
          threadWrapper.style.padding = "8px";
          threadWrapper.style.marginBottom = "10px";
          threadWrapper.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
          threadWrapper.style.transition = "box-shadow 0.2s ease, opacity 0.2s";
          threadWrapper.addEventListener("dragstart", (e) => {
            if (!e.dataTransfer) return;
            e.stopPropagation();
            e.dataTransfer.setData("application/cornell-single-thread", JSON.stringify({
              filePath: rootItem.file.path,
              rawText: rootItem.rawText,
              currentTag: node.fullPath,
              line: rootItem.line
            }));
            const dragPayload = this.buildThreadDropText(rootItem, 0, /* @__PURE__ */ new Set(), void 0, true);
            e.dataTransfer.setData("text/plain", dragPayload.trim());
            _CornellNotesView.lastDraggedPayload = dragPayload.trim();
            e.dataTransfer.effectAllowed = "copyMove";
            setTimeout(() => threadWrapper.style.opacity = "0.5", 0);
          });
          threadWrapper.addEventListener("dragend", (e) => {
            e.stopPropagation();
            threadWrapper.style.opacity = "1";
            this.triggerTemplaterAfterDrop();
          });
          this.renderThreadNode(rootItem, threadWrapper, this.cachedItems, /* @__PURE__ */ new Set(), isFilteredMode, true);
        } else {
          const marginaliaDOM = this.createItemDiv(rootItem, contentEl);
          marginaliaDOM.classList.add("cornell-sidebar-item");
          marginaliaDOM.tabIndex = 0;
        }
      }
      isRendered = true;
    };
    if (!isCollapsed) renderItemsLazy();
    headerEl.onclick = async (e) => {
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      contentEl.style.display = isCollapsed ? "none" : "flex";
      (0, import_obsidian10.setIcon)(toggleIcon, isCollapsed ? "chevron-right" : "chevron-down");
      headerEl.style.borderBottom = isCollapsed ? "none" : "1px solid var(--background-modifier-border)";
      if (!isCollapsed) renderItemsLazy();
      if (this.plugin.settings.collapsedBoxes.includes(node.fullPath)) {
        this.plugin.settings.collapsedBoxes = this.plugin.settings.collapsedBoxes.filter((path) => path !== node.fullPath);
      } else {
        this.plugin.settings.collapsedBoxes.push(node.fullPath);
      }
      await this.plugin.saveSettings();
    };
    groupEl.setAttr("draggable", "true");
    groupEl.style.cursor = "grab";
    groupEl.addEventListener("dragstart", (e) => {
      if (!e.dataTransfer) return;
      e.stopPropagation();
      const allItemsInTree = [];
      const extractItems = (currentNode) => {
        allItemsInTree.push(...currentNode.items);
        currentNode.children.forEach((child) => extractItems(child));
      };
      extractItems(node);
      window.OmniDragManager = {
        payload: {
          type: "group",
          title: node.name.toUpperCase(),
          items: allItemsInTree
          // 👈 AHORA SÍ VAN TODAS LAS MARGINALIAS
        }
      };
      e.dataTransfer.setData("application/cornell-semantic-path", node.fullPath);
      const isMajor = node.children.size > 0 ? "true" : "false";
      e.dataTransfer.setData("application/cornell-is-major", isMajor);
      let dropText = "";
      const rootTitle = node.name.toUpperCase();
      const buildDropText = (currentNode, currentDepth) => {
        const headingLevel = "#".repeat(currentDepth + 1);
        dropText += `${headingLevel} ${currentNode.name.toUpperCase()}

`;
        const includeChildren = this.currentTab === "threads";
        for (const item of currentNode.items) {
          dropText += this.buildThreadDropText(item, 0, /* @__PURE__ */ new Set(), rootTitle, includeChildren);
        }
        dropText += "\n";
        currentNode.children.forEach((child) => buildDropText(child, currentDepth + 1));
      };
      buildDropText(node, 0);
      e.dataTransfer.setData("text/plain", dropText.trim());
      _CornellNotesView.lastDraggedPayload = dropText.trim();
      e.dataTransfer.effectAllowed = "copyMove";
      setTimeout(() => groupEl.style.opacity = "0.5", 0);
    });
    groupEl.addEventListener("dragend", (e) => {
      e.stopPropagation();
      groupEl.style.opacity = "1";
      this.triggerTemplaterAfterDrop();
      window.OmniDragManager = { payload: null };
    });
    groupEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      groupEl.style.boxShadow = "0 0 0 2px var(--interactive-accent) inset";
    });
    groupEl.addEventListener("dragleave", (e) => {
      e.stopPropagation();
      groupEl.style.boxShadow = "";
    });
    groupEl.addEventListener("drop", async (e) => {
      var _a2, _b, _c;
      e.preventDefault();
      e.stopPropagation();
      groupEl.style.boxShadow = "";
      const targetPath = node.fullPath;
      if (targetPath.startsWith("\u{1F4C1}")) {
        new import_obsidian10.Notice("\u26A0\uFE0F Cannot merge physical folders or files. Please use the Obsidian file explorer to move them.");
        return;
      }
      const singleThreadData = (_a2 = e.dataTransfer) == null ? void 0 : _a2.getData("application/cornell-single-thread");
      if (singleThreadData) {
        const threadPayload = JSON.parse(singleThreadData);
        if (threadPayload.currentTag === targetPath) return;
        await this.executeSingleThreadMerge(threadPayload, targetPath);
        return;
      }
      const sourcePath = (_b = e.dataTransfer) == null ? void 0 : _b.getData("application/cornell-semantic-path");
      if (sourcePath) {
        if (sourcePath === targetPath || targetPath.startsWith(`${sourcePath}/`)) {
          new import_obsidian10.Notice("\u26A0\uFE0F You cannot merge a box into itself or its own children.");
          return;
        }
        const isSourceMajor = ((_c = e.dataTransfer) == null ? void 0 : _c.getData("application/cornell-is-major")) === "true";
        const isTargetMajor = node.children.size > 0;
        if (!isSourceMajor && isTargetMajor) {
          await this.executeFractalMerge(sourcePath, targetPath);
        } else {
          new ThreadMergeModal(this.plugin.app, sourcePath, targetPath, async (newParentName) => {
            await this.executeGroupMerge(sourcePath, targetPath, newParentName);
          }).open();
        }
      }
    });
    const pinnedChildren = [];
    const unpinnedChildren = [];
    node.children.forEach((childNode) => {
      if (this.plugin.settings.pinnedThreads.includes(childNode.fullPath)) {
        pinnedChildren.push(childNode);
      } else {
        unpinnedChildren.push(childNode);
      }
    });
    pinnedChildren.forEach((childNode) => this.renderSemanticTree(childNode, contentEl, isFilteredMode, depth + 1));
    if (pinnedChildren.length > 0 && unpinnedChildren.length > 0) {
      const sep = contentEl.createDiv();
      sep.style.height = "1px";
      sep.style.backgroundColor = "var(--background-modifier-border)";
      sep.style.margin = "5px 0";
      sep.style.opacity = "0.3";
    }
    unpinnedChildren.forEach((childNode) => this.renderSemanticTree(childNode, contentEl, isFilteredMode, depth + 1));
  }
  renderThreadNode(item, container, allItems, visitedIds, isFilteredMode = false, isRootCall = false) {
    var _a;
    if (item.blockId && visitedIds.has(item.blockId)) {
      const brokenDiv = container.createDiv({ cls: "cornell-sidebar-item" });
      brokenDiv.style.borderLeftColor = "red";
      brokenDiv.createDiv({ cls: "cornell-sidebar-item-text", text: `\u{1F501} Loop detected! (${item.file.basename})` });
      return;
    }
    const newVisited = new Set(visitedIds);
    if (item.blockId) newVisited.add(item.blockId);
    const nodeWrapper = container.createDiv({ cls: "cornell-node-wrapper" });
    if (isFilteredMode && isRootCall && item.blockId) {
      const parentNode = allItems.find((p) => p.outgoingLinks.some((link) => link.includes(`#^${item.blockId}`)));
      if (parentNode) {
        const upBtn = nodeWrapper.createDiv({ cls: "cornell-thread-up-btn", title: "Go to parent note" });
        upBtn.innerHTML = `\u2191 Child of: <b>${parentNode.file.basename}</b>`;
        upBtn.onclick = async () => {
          const leaf = this.plugin.app.workspace.getLeaf(false);
          await leaf.openFile(parentNode.file, { eState: { line: parentNode.line } });
        };
      }
    }
    const itemDiv = this.createItemDiv(item, nodeWrapper);
    itemDiv.style.position = "relative";
    if (item.outgoingLinks.length > 0) {
      const toggleBtn = itemDiv.createDiv({ cls: "cornell-collapse-toggle" });
      toggleBtn.innerHTML = "\u25BC";
      itemDiv.prepend(toggleBtn);
      const childrenContainer = nodeWrapper.createDiv({ cls: "cornell-thread-tree" });
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        if (childrenContainer.hasClass("is-collapsed")) {
          childrenContainer.removeClass("is-collapsed");
          toggleBtn.removeClass("is-collapsed");
        } else {
          childrenContainer.addClass("is-collapsed");
          toggleBtn.addClass("is-collapsed");
        }
      };
      for (const linkStr of item.outgoingLinks) {
        const parts = linkStr.split("#^");
        if (parts.length === 2) {
          const targetId = parts[1].split("|")[0].trim();
          const childItem = allItems.find((i) => i.blockId === targetId);
          if (childItem) {
            const semanticData = (_a = item.semanticStitches) == null ? void 0 : _a.find((s) => s.target === linkStr);
            if (semanticData && semanticData.reason) {
              const reasonPill = childrenContainer.createDiv({ cls: "cornell-semantic-pill" });
              reasonPill.style.fontSize = "0.82em";
              reasonPill.style.color = "var(--text-muted)";
              reasonPill.style.padding = "2px 8px";
              reasonPill.style.marginLeft = "16px";
              reasonPill.style.borderLeft = "2px solid var(--interactive-accent)";
              reasonPill.style.backgroundColor = "var(--background-secondary)";
              reasonPill.style.borderBottomRightRadius = "4px";
              reasonPill.style.borderTopRightRadius = "4px";
              reasonPill.style.marginBottom = "4px";
              reasonPill.style.marginTop = "2px";
              reasonPill.style.display = "inline-flex";
              reasonPill.style.alignItems = "center";
              reasonPill.style.gap = "6px";
              const iconSpan = reasonPill.createSpan({ text: "\u{1F517} " });
              iconSpan.style.fontSize = "0.9em";
              iconSpan.style.opacity = "0.7";
              reasonPill.createEl("i", { text: semanticData.reason });
            }
            this.renderThreadNode(childItem, childrenContainer, allItems, newVisited, isFilteredMode, false);
          } else {
            const brokenDiv = childrenContainer.createDiv({ cls: "cornell-sidebar-item" });
            brokenDiv.style.borderLeftColor = "gray";
            brokenDiv.createDiv({ cls: "cornell-sidebar-item-text", text: `\u26A0\uFE0F Broken link: ${linkStr}` });
          }
        }
      }
    }
  }
  renderResults(results, container) {
    container.empty();
    let totalFound = 0;
    if (this.isZotlikeMode) {
      const zotBanner = container.createDiv({ cls: "cornell-sidebar-item" });
      zotBanner.style.borderLeftColor = "var(--interactive-accent)";
      zotBanner.style.backgroundColor = "var(--background-secondary)";
      zotBanner.style.marginBottom = "15px";
      zotBanner.style.padding = "10px";
      zotBanner.style.borderRadius = "4px";
      zotBanner.createDiv({ text: `\u{1F4DA} Linked to Active PDF:`, attr: { style: "font-size: 0.85em; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;" } });
      zotBanner.createDiv({ text: this.activePdfName, attr: { style: "font-weight: bold; color: var(--text-accent); word-break: break-all; font-size: 1.1em;" } });
    }
    for (const [color, items] of Object.entries(results)) {
      if (items.length === 0) continue;
      totalFound += items.length;
      const groupHeader = container.createDiv({ cls: "cornell-sidebar-group" });
      const colorDot = groupHeader.createSpan({ cls: "cornell-sidebar-color-dot" });
      colorDot.style.backgroundColor = color;
      groupHeader.createSpan({ text: `${items.length} notes` });
      for (const item of items) {
        const marginaliaDOM = this.createItemDiv(item, container);
        marginaliaDOM.classList.add("cornell-sidebar-item");
        marginaliaDOM.tabIndex = 0;
        marginaliaDOM.style.outline = "none";
        marginaliaDOM.addEventListener("focus", () => {
          marginaliaDOM.style.outline = "2px solid var(--interactive-accent)";
          marginaliaDOM.style.outlineOffset = "2px";
        });
        marginaliaDOM.addEventListener("blur", () => {
          marginaliaDOM.style.outline = "none";
        });
        marginaliaDOM.addEventListener("keydown", async (e) => {
          const pinCurrentItem = (targetItem, domEl) => {
            const alreadyPinned = this.pinboardItems.some(
              (pinned) => pinned.file && targetItem.file && pinned.blockId === targetItem.blockId && pinned.file.path === targetItem.file.path
            );
            if (!alreadyPinned) {
              this.pinboardItems.push(targetItem);
              new import_obsidian10.Notice(`\u{1F4CC} Pinned: ${targetItem.text.substring(0, 15)}...`);
              const originalBg = domEl.style.backgroundColor;
              domEl.style.backgroundColor = "var(--color-green)";
              setTimeout(() => domEl.style.backgroundColor = originalBg, 200);
            }
          };
          if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            let prev = marginaliaDOM.previousElementSibling;
            while (prev && prev.tabIndex < 0) {
              prev = prev.previousElementSibling;
            }
            if (prev) {
              prev.focus();
              if (e.shiftKey) pinCurrentItem(item, marginaliaDOM);
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            let next = marginaliaDOM.nextElementSibling;
            while (next && next.tabIndex < 0) {
              next = next.nextElementSibling;
            }
            if (next) {
              next.focus();
              if (e.shiftKey) pinCurrentItem(item, marginaliaDOM);
            }
          } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            const leaf = this.plugin.app.workspace.getLeaf(false);
            await leaf.openFile(item.file, { eState: { line: item.line } });
          } else if (e.key === "Enter" || e.key.toLowerCase() === "p") {
            e.preventDefault();
            e.stopPropagation();
            pinCurrentItem(item, marginaliaDOM);
          } else if (e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            const selIndex = this.selectedForStitch.findIndex((i) => i === item);
            if (selIndex > -1) {
              this.selectedForStitch.splice(selIndex, 1);
              marginaliaDOM.style.boxShadow = "";
            } else {
              this.selectedForStitch.push(item);
              marginaliaDOM.style.boxShadow = "0 0 0 2px var(--color-blue) inset";
            }
          } else if (e.key.toLowerCase() === "h") {
            e.preventDefault();
            e.stopPropagation();
            const hoverEvent = new MouseEvent("mouseenter", { bubbles: true, cancelable: true });
            marginaliaDOM.dispatchEvent(hoverEvent);
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            const leaveEvent = new MouseEvent("mouseleave", { bubbles: true, cancelable: true });
            marginaliaDOM.dispatchEvent(leaveEvent);
            document.querySelectorAll(".hover-popover").forEach((el) => el.remove());
          }
        });
      }
    }
    if (totalFound === 0) container.createEl("p", { text: "No notes match your search.", cls: "cornell-sidebar-empty" });
  }
  // 🦴 NUEVO MOTOR: Importador de Esqueletos
  async importActiveFileSkeleton() {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian10.Notice("\u26A0\uFE0F Open a note first to import its skeleton.");
      return;
    }
    const content = await this.plugin.app.vault.cachedRead(activeFile);
    const lines = content.split("\n");
    let importedCount = 0;
    for (const line of lines) {
      const titleMatch = line.match(/^(#+)\s+(.*)/);
      if (titleMatch) {
        this.pinboardItems.push({
          text: line,
          rawText: line,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isTitle: true
        });
        importedCount++;
        continue;
      }
      const listMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
      if (listMatch) {
        const spaces = listMatch[1].length;
        const level = Math.floor(spaces / 2);
        const text = listMatch[2];
        this.pinboardItems.push({
          text,
          rawText: text,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isCustom: true,
          indentLevel: level
        });
        importedCount++;
      }
    }
    if (importedCount > 0) {
      new import_obsidian10.Notice(`\u{1F9B4} Imported ${importedCount} skeleton nodes!`);
      this.applyFiltersAndRender();
    } else {
      new import_obsidian10.Notice("No headers or lists found in this note.");
    }
  }
  createItemDiv(item, parentContainer, isPinboardView = false, pinIndex = -1) {
    const itemDiv = parentContainer.createDiv({ cls: "cornell-sidebar-item" });
    itemDiv.style.borderLeftColor = item.color;
    const textRow = itemDiv.createDiv({ cls: "cornell-sidebar-item-text" });
    textRow.style.display = "flex";
    textRow.style.justifyContent = "space-between";
    textRow.style.alignItems = "flex-start";
    const taskMatch = item.text.match(/^-\s*\[([ xX])\]\s+(.*)/);
    const isTask = !!taskMatch;
    const isChecked = taskMatch ? taskMatch[1].toLowerCase() === "x" : false;
    if (isTask) {
      const checkbox = textRow.createEl("input", { type: "checkbox" });
      checkbox.checked = isChecked;
      checkbox.style.marginRight = "8px";
      checkbox.style.marginTop = "4px";
      checkbox.style.cursor = "pointer";
      checkbox.style.flexShrink = "0";
      checkbox.onclick = async (e) => {
        e.stopPropagation();
        const targetState = checkbox.checked ? "x" : " ";
        await this.plugin.app.vault.process(item.file, (data) => {
          const lines = data.split("\n");
          if (item.line >= 0 && item.line < lines.length) {
            if (checkbox.checked && this.plugin.settings.deleteCompletedTasks) {
              const escapedRaw = item.rawText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
              const fullMarginaliaRegex = new RegExp(`%%[><]\\s*${escapedRaw}\\s*%%`, "g");
              if (fullMarginaliaRegex.test(lines[item.line])) {
                lines[item.line] = lines[item.line].replace(fullMarginaliaRegex, "");
              } else {
                lines[item.line] = lines[item.line].replace(item.rawText, "");
              }
              new import_obsidian10.Notice("\u{1F5D1}\uFE0F Task completed and marginalia deleted!");
            } else {
              const newRaw = item.rawText.replace(/-\s*\[[ xX]\]/, `- [${targetState}]`);
              lines[item.line] = lines[item.line].replace(item.rawText, newRaw);
            }
          }
          return lines.join("\n");
        });
        this.scanNotes();
      };
    }
    const textSpan = textRow.createSpan();
    textSpan.style.wordBreak = "break-word";
    textSpan.style.flexGrow = "1";
    textSpan.style.marginRight = "10px";
    if (isChecked) textSpan.style.textDecoration = "line-through";
    let textToRender = isTask ? taskMatch[2] : item.text;
    const imgRegex = /!\[\[(.*?(?:\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.svg))\|?(.*?)\]\]/gi;
    textToRender = textToRender.replace(imgRegex, (match, filename) => {
      const trimmedFilename = filename.trim();
      if (this.imagePathCache[trimmedFilename]) {
        const cachedPath = this.imagePathCache[trimmedFilename];
        return `<img src="${cachedPath}" class="cornell-sidebar-thumb" style="max-height: 35px; width: auto; object-fit: contain; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 5px;" />`;
      }
      const file = this.plugin.app.metadataCache.getFirstLinkpathDest(trimmedFilename, item.file.path);
      if (file) {
        const resourcePath = this.plugin.app.vault.getResourcePath(file);
        this.imagePathCache[trimmedFilename] = resourcePath;
        return `<img src="${resourcePath}" class="cornell-sidebar-thumb" style="max-height: 35px; width: auto; object-fit: contain; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 5px;" />`;
      }
      return match;
    });
    ;
    import_obsidian10.MarkdownRenderer.renderMarkdown(
      textToRender,
      // 👈 AHORA LE PASAMOS EL TEXTO CON LA ETIQUETA <img>
      textSpan,
      // Dónde lo vamos a dibujar
      item.file.path,
      // 🔗 FUNDAMENTAL: La ruta base
      this
      // El componente actual
    );
    setTimeout(() => {
      const paragraphs = textSpan.querySelectorAll("p");
      paragraphs.forEach((p) => {
        p.style.margin = "0";
        p.style.display = "inline";
      });
      const embeds = textSpan.querySelectorAll(".internal-embed, img");
      embeds.forEach((embed) => {
        const el = embed;
        if (isPinboardView) {
          el.style.maxHeight = "180px";
          el.style.display = "block";
          el.style.marginTop = "5px";
        } else {
          el.style.maxHeight = "35px";
          el.style.display = "inline-block";
          el.style.verticalAlign = "middle";
          el.style.marginRight = "8px";
        }
        el.style.maxWidth = "100%";
        el.style.objectFit = "contain";
        el.style.borderRadius = "4px";
      });
    }, 50);
    if (isPinboardView) {
      const indentControls = textRow.createSpan();
      indentControls.style.marginLeft = "10px";
      indentControls.style.marginRight = "auto";
      indentControls.style.opacity = "0.5";
      const btnLeft = indentControls.createEl("span", { text: "\u2190", title: "Outdent" });
      btnLeft.style.cursor = "pointer";
      btnLeft.style.marginRight = "8px";
      btnLeft.onclick = (e) => {
        e.stopPropagation();
        item.indentLevel = Math.max(0, (item.indentLevel || 0) - 1);
        this.applyFiltersAndRender();
      };
      const btnRight = indentControls.createEl("span", { text: "\u2192", title: "Indent" });
      btnRight.style.cursor = "pointer";
      btnRight.onclick = (e) => {
        e.stopPropagation();
        item.indentLevel = (item.indentLevel || 0) + 1;
        this.applyFiltersAndRender();
      };
    }
    textSpan.style.flexGrow = "1";
    const isAlreadyPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
    let iconText = isPinboardView ? "\xD7" : isAlreadyPinned ? "\u25CF" : "\u25CB";
    const pinBtn = textRow.createEl("span", { text: iconText });
    pinBtn.style.flexShrink = "0";
    pinBtn.style.cursor = "pointer";
    pinBtn.style.marginLeft = "10px";
    pinBtn.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    pinBtn.style.opacity = isPinboardView || isAlreadyPinned ? "1" : "0";
    let taskBtn = null;
    if (isTask && this.plugin.settings.enableTaskNotesIntegration) {
      taskBtn = textRow.createEl("span", { attr: { title: "Send to TaskNotes" } });
      taskBtn.style.cursor = "pointer";
      taskBtn.style.opacity = "0";
      taskBtn.style.flexShrink = "0";
      taskBtn.style.marginLeft = "8px";
      taskBtn.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      taskBtn.style.color = "var(--color-blue)";
      (0, import_obsidian10.setIcon)(taskBtn, "list-todo");
      taskBtn.onmouseenter = () => {
        taskBtn.style.transform = "scale(1.2)";
      };
      taskBtn.onmouseleave = () => {
        taskBtn.style.transform = "scale(1)";
      };
      taskBtn.onclick = (e) => {
        e.stopPropagation();
        const rawTitle = taskMatch[2];
        const cleanTitle = this.cleanExportText(rawTitle);
        const tagMatches = [...rawTitle.matchAll(/#([a-zA-Z0-9_/-]+)/g)];
        const tags = tagMatches.map((m) => m[1]);
        this.plugin.sendToTaskNotes(cleanTitle, tags);
      };
    }
    itemDiv.addEventListener("mouseenter", () => {
      const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
      if (!isPinboardView && !currentPinned) pinBtn.style.opacity = "0.5";
      if (taskBtn) taskBtn.style.opacity = "1";
    });
    itemDiv.addEventListener("mouseleave", () => {
      const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
      if (!isPinboardView && !currentPinned) pinBtn.style.opacity = "0";
      if (taskBtn) taskBtn.style.opacity = "0";
    });
    pinBtn.onmouseenter = () => {
      pinBtn.style.opacity = "1";
      pinBtn.style.transform = "scale(1.2)";
    };
    pinBtn.onmouseleave = () => {
      pinBtn.style.transform = "scale(1)";
      const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
      if (!isPinboardView && !currentPinned) pinBtn.style.opacity = "0.5";
    };
    pinBtn.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
      if (isPinboardView) {
        this.pinboardItems.splice(pinIndex, 1);
        this.applyFiltersAndRender();
      } else {
        const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
        if (currentPinned) {
          this.pinboardItems = this.pinboardItems.filter((p) => !(p.rawText === item.rawText && p.file.path === item.file.path));
          pinBtn.innerText = "\u25CB";
          pinBtn.style.opacity = "0.5";
          new import_obsidian10.Notice("Removed from the board");
        } else {
          this.pinboardItems.push(item);
          pinBtn.innerText = "\u25CF";
          pinBtn.style.opacity = "1";
          new import_obsidian10.Notice("Added to board!");
        }
        this.applyFiltersAndRender();
      }
    };
    itemDiv.createDiv({ cls: "cornell-sidebar-item-meta", text: `${item.file.basename} (L${item.line + 1})` });
    itemDiv.onclick = async () => {
      if (this.isStitchingMode) {
        if (!this.sourceStitchItem) {
          this.sourceStitchItem = item;
          itemDiv.style.backgroundColor = "var(--background-modifier-hover)";
          this.updateStitchBanner();
        } else {
          if (this.sourceStitchItem === item) {
            new import_obsidian10.Notice("Cannot connect a note to itself.");
            return;
          }
          const finishStitch = () => {
            this.isStitchingMode = false;
            this.sourceStitchItem = null;
            this.updateStitchBanner();
          };
          if (this.plugin.settings.enableSemanticStitching) {
            new SemanticStitchModal(
              this.plugin.app,
              this.sourceStitchItem.file.basename,
              item.file.basename,
              async (reason) => {
                await this.executeMassStitch([this.sourceStitchItem], [item], reason);
                finishStitch();
              }
            ).open();
          } else {
            await this.executeMassStitch([this.sourceStitchItem], [item]);
            finishStitch();
          }
        }
        return;
      }
      if (this.isDirectPdfModeActive) {
        const searchArea = `${item.context || ""} ${item.rawText || ""} ${item.text || ""}`;
        const wikiRegex = /\[+([^\[\]]+\.pdf[^\]]*?)\]+/i;
        const mdRegex = /\[.*?\]\((.*?\.pdf.*?)\)/i;
        const fallbackRegex = /([a-zA-Z0-9_ \-\.]+\.pdf(?:#[a-zA-Z0-9=&,\-\.]+)?)/i;
        let pdfLink = "";
        const wikiMatch = searchArea.match(wikiRegex);
        const mdMatch = searchArea.match(mdRegex);
        const fallbackMatch = searchArea.match(fallbackRegex);
        if (wikiMatch) {
          pdfLink = wikiMatch[1].split("|")[0].trim();
        } else if (mdMatch) {
          pdfLink = mdMatch[1].trim();
        } else if (fallbackMatch) {
          pdfLink = fallbackMatch[1].trim();
        }
        if (pdfLink) {
          console.log("\u{1F517} PDF++ Link capturado:", pdfLink);
          await this.plugin.app.workspace.openLinkText(pdfLink, item.file.path, false);
          return;
        } else {
          new import_obsidian10.Notice("\u26A0\uFE0F No se encontr\xF3 una cita a un PDF en esta marginalia.");
        }
      }
      const leaf = this.plugin.app.workspace.getLeaf(false);
      await leaf.openFile(item.file, { eState: { line: item.line } });
    };
    let hoverTimeout = null;
    let tooltipEl = null;
    let tooltipComponent = null;
    let isHovering = false;
    const removeTooltip = () => {
      isHovering = false;
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (tooltipComponent) {
        tooltipComponent.unload();
        tooltipComponent = null;
      }
      if (tooltipEl) {
        tooltipEl.remove();
        tooltipEl = null;
      }
      document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
    };
    itemDiv.addEventListener("mouseenter", (e) => {
      isHovering = true;
      hoverTimeout = setTimeout(async () => {
        if (!isHovering) return;
        const content = await this.plugin.app.vault.cachedRead(item.file);
        if (!isHovering || !document.body.contains(itemDiv)) return;
        const lines = content.split("\n");
        let startLine = item.line;
        let endLine = item.line;
        let textWithoutMarginalia = lines[item.line].replace(/%%[><](.*?)%%/g, "").trim();
        textWithoutMarginalia = textWithoutMarginalia.replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
        let isTargetingCallout = false;
        if (lines[item.line].trim().startsWith(">")) {
          isTargetingCallout = true;
        } else if (textWithoutMarginalia === "") {
          let nextIdx = item.line + 1;
          while (nextIdx < lines.length && lines[nextIdx].trim() === "") nextIdx++;
          if (nextIdx < lines.length && lines[nextIdx].trim().startsWith(">")) {
            isTargetingCallout = true;
            startLine = nextIdx;
            endLine = nextIdx;
          }
        }
        if (isTargetingCallout) {
          while (startLine > 0 && lines[startLine - 1].trim().startsWith(">")) startLine--;
          while (endLine < lines.length - 1 && lines[endLine + 1].trim().startsWith(">")) endLine++;
        } else {
          while (startLine > 0 && lines[startLine - 1].trim() !== "" && !lines[startLine - 1].trim().startsWith(">")) startLine--;
          while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== "" && !lines[endLine + 1].trim().startsWith(">")) endLine++;
        }
        removeTooltip();
        const wikiRegex = /\[+([^\[\]]+\.pdf[^\]]*?)\]+/i;
        const mdRegex = /\[.*?\]\((.*?\.pdf.*?)\)/i;
        const fallbackRegex = /([a-zA-Z0-9_ \-\.]+\.pdf(?:#[a-zA-Z0-9=&,\-\.]+)?)/i;
        const zoteroRegex = /!*\[\[([^\]]+\.md#\s*\^[a-zA-Z0-9_-]+)\]\]/i;
        let resolvedLinkText = null;
        for (let j = startLine; j <= endLine; j++) {
          const lineStr = lines[j];
          const wikiMatch = lineStr.match(wikiRegex);
          const mdMatch = lineStr.match(mdRegex);
          const fallbackMatch = lineStr.match(fallbackRegex);
          const zoteroMatch = lineStr.match(zoteroRegex);
          if (wikiMatch) {
            resolvedLinkText = wikiMatch[1].split("|")[0].trim();
          } else if (mdMatch) {
            resolvedLinkText = mdMatch[1].trim();
          } else if (fallbackMatch) {
            resolvedLinkText = fallbackMatch[1].trim();
          } else if (zoteroMatch) {
            resolvedLinkText = zoteroMatch[1].replace(/#\s*\^/, "#^").trim();
          }
          if (resolvedLinkText) break;
        }
        if (resolvedLinkText) {
          this.plugin.app.workspace.trigger("hover-link", {
            event: e,
            source: "preview",
            hoverParent: itemDiv,
            targetEl: itemDiv,
            linktext: resolvedLinkText,
            sourcePath: item.file.path
          });
          return;
        }
        let rawBlock = "";
        let highlightApplied = false;
        for (let i = startLine; i <= endLine; i++) {
          let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
          if (cleanLine.startsWith("```")) continue;
          if (cleanLine) {
            if ((i === item.line || i >= item.line && !highlightApplied) && !highlightApplied) {
              rawBlock += `==${cleanLine}==
`;
              highlightApplied = true;
            } else rawBlock += `${cleanLine}
`;
          }
        }
        tooltipEl = document.createElement("div");
        tooltipEl.className = "popover hover-popover cornell-hover-tooltip markdown-rendered markdown-preview-view";
        tooltipEl.style.position = "fixed";
        tooltipEl.style.zIndex = "99999";
        tooltipEl.style.width = "450px";
        tooltipEl.style.maxHeight = "350px";
        tooltipEl.style.overflowY = "auto";
        tooltipEl.style.backgroundColor = "var(--background-primary)";
        tooltipEl.style.border = "1px solid var(--background-modifier-border)";
        tooltipEl.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
        tooltipEl.style.borderRadius = "8px";
        tooltipEl.style.padding = "12px";
        tooltipEl.style.display = "flex";
        tooltipEl.style.flexDirection = "column";
        tooltipEl.style.gap = "8px";
        const styleTag = document.createElement("style");
        styleTag.innerHTML = `.cornell-hover-tooltip p { margin: 0 0 8px 0 !important; }`;
        tooltipEl.appendChild(styleTag);
        const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
        const headerText = `\u{1F4C4} ${item.file.basename} (L${item.line + 1})`;
        header.createEl("span", {
          text: headerText,
          // Text escapa automáticamente cualquier tag HTML
          attr: {
            style: "font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;"
          }
        });
        const body = tooltipEl.createDiv();
        body.style.width = "100%";
        document.body.appendChild(tooltipEl);
        const rect = itemDiv.getBoundingClientRect();
        let leftPos = rect.right + 20;
        if (leftPos + 450 > window.innerWidth) leftPos = rect.left - 470;
        if (leftPos < 10) leftPos = 10;
        tooltipEl.style.left = `${leftPos}px`;
        let topPos = rect.top;
        if (topPos + 350 > window.innerHeight) topPos = window.innerHeight - 360;
        tooltipEl.style.top = `${Math.max(10, topPos)}px`;
        const inlineImgRegex = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg))\|?(.*?)\]\]/gi;
        rawBlock = rawBlock.replace(inlineImgRegex, (match2, filename) => {
          const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
          if (file) {
            const resourcePath = this.plugin.app.vault.getResourcePath(file);
            return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
          }
          return match2;
        });
        if (!rawBlock.trim()) rawBlock = "*No text context available.*";
        await import_obsidian10.MarkdownRenderer.renderMarkdown(rawBlock, body, item.file.path, this);
        requestAnimationFrame(() => {
          if (tooltipEl) tooltipEl.addClass("is-visible");
        });
      }, 500);
    });
    itemDiv.addEventListener("mouseleave", removeTooltip);
    if (!isPinboardView) {
      itemDiv.setAttr("draggable", "true");
      itemDiv.addEventListener("dragstart", (event) => {
        event.stopPropagation();
        document.querySelectorAll(".hover-popover").forEach((el) => el.remove());
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = "copy";
        window.OmniDragManager = { payload: item };
        let targetId = item.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          item.blockId = targetId;
          this.injectBackgroundBlockId(item.file, item.line, targetId);
        }
        if (event.ctrlKey || event.metaKey) {
          let cleanText = this.cleanExportText(item.text);
          if (!cleanText) cleanText = item.text.replace(/!\[\[(.*?)\]\]/g, "\u{1F5BC}\uFE0F [Image]").trim() || "Marginalia Doodle";
          let citationText = item.context || "";
          cleanText = cleanText.replace(/\r?\n|\r/g, " ").replace(/\s{2,}/g, " ").trim();
          citationText = citationText.replace(/\r?\n|\r/g, " ").replace(/\s{2,}/g, " ").trim();
          event.dataTransfer.setData("text/plain", cleanText);
          _CornellNotesView.lastDraggedPayload = cleanText;
          if (citationText) {
            navigator.clipboard.writeText(citationText);
            new import_obsidian10.Notice("\u{1F3A8} Excalidraw: Marginalia soltada. \xA1Presiona Ctrl+V para pegar el PDF++!");
          } else {
            new import_obsidian10.Notice("\u{1F3A8} Excalidraw: Marginalia soltada en el lienzo.");
          }
        } else {
          const shouldIncludeChildren = this.currentTab === "threads";
          let dragPayload = this.buildThreadDropText(item, 0, /* @__PURE__ */ new Set(), void 0, shouldIncludeChildren);
          event.dataTransfer.setData("text/plain", dragPayload.trim());
          _CornellNotesView.lastDraggedPayload = dragPayload.trim();
        }
        this.draggedSidebarItems = [item];
      });
      itemDiv.addEventListener("dragend", () => {
        this.draggedSidebarItems = null;
        itemDiv.removeClass("cornell-drop-target");
        this.triggerTemplaterAfterDrop();
        window.OmniDragManager = { payload: null };
      });
      itemDiv.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (this.draggedSidebarItems && !this.draggedSidebarItems.includes(item)) {
          itemDiv.addClass("cornell-drop-target");
        }
      });
      itemDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      });
      itemDiv.addEventListener("dragleave", () => {
        itemDiv.removeClass("cornell-drop-target");
      });
      itemDiv.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        itemDiv.removeClass("cornell-drop-target");
        if (this.draggedSidebarItems && !this.draggedSidebarItems.includes(item)) {
          await this.executeMassStitch([item], this.draggedSidebarItems);
          this.draggedSidebarItems = null;
        }
      });
    }
    return itemDiv;
  }
  // ======================================================
  // 🗂️ MOTOR DE FUSIÓN DE HILOS (DRAG & DROP)
  // ======================================================
  async executeThreadMerge(sourcePayload, targetItem, newParentName, targetTag) {
    const sourceItem = this.cachedItems.find((i) => i.file.path === sourcePayload.filePath && i.text === sourcePayload.text);
    if (!sourceItem) {
      new import_obsidian10.Notice("\u26A0\uFE0F Could not locate the source thread in the vault.");
      return;
    }
    const sourceCleanTag = sourcePayload.currentTag.replace("#", "");
    const targetCleanTag = targetTag.replace("#", "");
    const newSourceTag = `#${newParentName}/${sourceCleanTag}`;
    const newTargetTag = `#${newParentName}/${targetCleanTag}`;
    new import_obsidian10.Notice(`\u{1F5C2}\uFE0F Grouping into #${newParentName}...`);
    await this.plugin.app.vault.process(sourceItem.file, (data) => {
      const lines = data.split("\n");
      if (sourceItem.line >= 0 && sourceItem.line < lines.length) {
        const newRaw = sourceItem.rawText.replace(sourcePayload.currentTag, newSourceTag);
        lines[sourceItem.line] = lines[sourceItem.line].replace(sourceItem.rawText, newRaw);
      }
      return lines.join("\n");
    });
    await this.plugin.app.vault.process(targetItem.file, (data) => {
      const lines = data.split("\n");
      if (targetItem.line >= 0 && targetItem.line < lines.length) {
        const newRaw = targetItem.rawText.replace(targetTag, newTargetTag);
        lines[targetItem.line] = lines[targetItem.line].replace(targetItem.rawText, newRaw);
      }
      return lines.join("\n");
    });
    new import_obsidian10.Notice(`\u2705 Threads successfully grouped under #${newParentName}!`);
    await this.scanNotes();
  }
  // ======================================================
  // 🎯 MOTOR DE ASIMILACIÓN (HILOS INDIVIDUALES)
  // ======================================================
  async executeSingleThreadMerge(threadPayload, targetPath) {
    const file = this.plugin.app.vault.getAbstractFileByPath(threadPayload.filePath);
    if (!(file instanceof import_obsidian10.TFile)) return;
    await this.plugin.app.vault.process(file, (data) => {
      var _a;
      const lines = data.split("\n");
      const lineIdx = threadPayload.line;
      if (lineIdx !== void 0 && lineIdx >= 0 && lineIdx < lines.length) {
        let currentLine = lines[lineIdx];
        if (targetPath === "#Untagged") {
          const cleanRaw = threadPayload.rawText.replace(threadPayload.currentTag, "").replace(/\s{2,}/g, " ");
          currentLine = currentLine.replace(threadPayload.rawText, cleanRaw);
        } else if (threadPayload.currentTag === "#Untagged") {
          let prefixToKeep = "";
          let contentAfterColor = threadPayload.rawText.trim();
          if ((_a = this.plugin.settings) == null ? void 0 : _a.tags) {
            for (const colorTag of this.plugin.settings.tags) {
              const cPrefix = colorTag.prefix.trim();
              if (cPrefix && contentAfterColor.startsWith(cPrefix)) {
                prefixToKeep = `${cPrefix} `;
                contentAfterColor = contentAfterColor.substring(cPrefix.length).trim();
                break;
              }
            }
          }
          const newInnerRaw = `${prefixToKeep}${targetPath} ${contentAfterColor}`;
          currentLine = currentLine.replace(threadPayload.rawText, newInnerRaw);
        } else {
          const newRaw = threadPayload.rawText.replace(threadPayload.currentTag, targetPath);
          currentLine = currentLine.replace(threadPayload.rawText, newRaw);
        }
        lines[lineIdx] = currentLine;
      }
      return lines.join("\n");
    });
    new import_obsidian10.Notice(`\u2705 Hilo asimilado exitosamente en ${targetPath}`);
    await this.scanNotes();
  }
  // ======================================================
  // 🧬 MOTOR DE MUTACIÓN FRACTAL (FAGOCITACIÓN)
  // ======================================================
  async executeFractalMerge(sourcePath, targetPath) {
    new import_obsidian10.Notice(`\u{1F9EC} Asimilando ${sourcePath} dentro de ${targetPath}...`);
    const undoRecords = [];
    const affectedItems = this.cachedItems.filter((item) => {
      const tagMatches = [...item.text.matchAll(/#([a-zA-Z0-9_/-]+)/g)];
      const tags = tagMatches.map((m) => `#${m[1]}`);
      return tags.some((t) => t === sourcePath || t.startsWith(`${sourcePath}/`));
    });
    if (affectedItems.length === 0) return;
    const filesToMutate = /* @__PURE__ */ new Map();
    for (const item of affectedItems) {
      if (!filesToMutate.has(item.file)) filesToMutate.set(item.file, []);
      filesToMutate.get(item.file).push(item);
    }
    for (const [file, items] of filesToMutate.entries()) {
      await this.plugin.app.vault.process(file, (data) => {
        const lines = data.split("\n");
        for (const item of items) {
          if (item.line >= 0 && item.line < lines.length) {
            const currentLine = lines[item.line];
            let newRawText = item.rawText;
            const tagMatches = [...newRawText.matchAll(/#([a-zA-Z0-9_/-]+)/g)];
            for (const match of tagMatches) {
              const tag = `#${match[1]}`;
              if (tag === sourcePath || tag.startsWith(`${sourcePath}/`)) {
                const cleanTagRest = tag.substring(sourcePath.length);
                const cleanSource = sourcePath.replace("#", "");
                const newTag = `${targetPath}/${cleanSource}${cleanTagRest}`;
                const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                const regex = new RegExp(escapedTag + "(?=[\\s]|$|%%)", "g");
                newRawText = newRawText.replace(regex, newTag);
              }
            }
            undoRecords.push({ file: item.file, line: item.line, oldRaw: item.rawText, newRaw: newRawText });
            lines[item.line] = currentLine.replace(item.rawText, newRawText);
          }
        }
        return lines.join("\n");
      });
    }
    this.plugin.lastStitchAction = undoRecords;
    new import_obsidian10.Notice(`\u2705 Asimilaci\xF3n completa! (Press Ctrl+Shift+Z to Undo)`);
    await this.scanNotes();
  }
  // ======================================================
  // 🗂️ MOTOR DE AGRUPACIÓN FRACTAL (SÚPER-RECUADRO)
  // ======================================================
  async executeGroupMerge(sourcePath, targetPath, newParentName) {
    new import_obsidian10.Notice(`\u{1F9EC} Creando s\xFAper-recuadro #${newParentName}...`);
    const undoRecords = [];
    const affectedItems = this.cachedItems.filter((item) => {
      const tagMatches = [...item.text.matchAll(/#([a-zA-Z0-9_/-]+)/g)];
      const tags = tagMatches.map((m) => `#${m[1]}`);
      return tags.some((t) => t === sourcePath || t.startsWith(`${sourcePath}/`) || t === targetPath || t.startsWith(`${targetPath}/`));
    });
    if (affectedItems.length === 0) return;
    const filesToMutate = /* @__PURE__ */ new Map();
    for (const item of affectedItems) {
      if (!filesToMutate.has(item.file)) filesToMutate.set(item.file, []);
      filesToMutate.get(item.file).push(item);
    }
    for (const [file, items] of filesToMutate.entries()) {
      await this.plugin.app.vault.process(file, (data) => {
        const lines = data.split("\n");
        for (const item of items) {
          if (item.line >= 0 && item.line < lines.length) {
            const currentLine = lines[item.line];
            let newRawText = item.rawText;
            const tagMatches = [...newRawText.matchAll(/#([a-zA-Z0-9_/-]+)/g)];
            for (const match of tagMatches) {
              const tag = `#${match[1]}`;
              if (tag === sourcePath || tag.startsWith(`${sourcePath}/`)) {
                const cleanTagRest = tag.substring(sourcePath.length);
                const cleanSource = sourcePath.replace("#", "");
                const newTag = `#${newParentName}/${cleanSource}${cleanTagRest}`;
                const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                const regex = new RegExp(escapedTag + "(?=[\\s]|$|%%)", "g");
                newRawText = newRawText.replace(regex, newTag);
              } else if (tag === targetPath || tag.startsWith(`${targetPath}/`)) {
                const cleanTagRest = tag.substring(targetPath.length);
                const cleanTarget = targetPath.replace("#", "");
                const newTag = `#${newParentName}/${cleanTarget}${cleanTagRest}`;
                const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                const regex = new RegExp(escapedTag + "(?=[\\s]|$|%%)", "g");
                newRawText = newRawText.replace(regex, newTag);
              }
            }
            undoRecords.push({ file: item.file, line: item.line, oldRaw: item.rawText, newRaw: newRawText });
            lines[item.line] = currentLine.replace(item.rawText, newRawText);
          }
        }
        return lines.join("\n");
      });
    }
    this.plugin.lastStitchAction = undoRecords;
    new import_obsidian10.Notice(`\u2705 S\xFAper-recuadro #${newParentName} creado. (Press Ctrl+Shift+Z to Undo)`);
    await this.scanNotes();
  }
  async executeMassStitch(sources, targets, semanticReason) {
    const totalLinks = sources.length * targets.length;
    const processStitching = async () => {
      new import_obsidian10.Notice(`Stitching ${totalLinks} thread(s)... \u26D3\uFE0E`);
      const undoRecords = [];
      for (const target of targets) {
        if (!target.blockId) {
          target.blockId = Math.random().toString(36).substring(2, 8);
          await this.injectBackgroundBlockId(target.file, target.line, target.blockId);
        }
      }
      for (const source of sources) {
        let linksToInject = "";
        for (const target of targets) {
          if (source === target) continue;
          const reasonString = semanticReason ? ` {stitch: ${semanticReason}}` : "";
          linksToInject += ` [[${target.file.basename}#^${target.blockId}]]${reasonString}`;
        }
        if (linksToInject.length > 0) {
          let expectedNewRaw = "";
          await this.plugin.app.vault.process(source.file, (data) => {
            const lines = data.split("\n");
            if (source.line >= 0 && source.line < lines.length) {
              let newRaw = source.rawText;
              const idMatch = newRaw.match(/(\s*\^[a-zA-Z0-9]+)\s*$/);
              if (idMatch) {
                newRaw = newRaw.substring(0, idMatch.index) + linksToInject + idMatch[1];
              } else {
                newRaw = newRaw + linksToInject;
              }
              expectedNewRaw = newRaw;
              lines[source.line] = lines[source.line].replace(source.rawText, newRaw);
            }
            return lines.join("\n");
          });
          undoRecords.push({ file: source.file, line: source.line, oldRaw: source.rawText, newRaw: expectedNewRaw });
        }
      }
      this.plugin.lastStitchAction = undoRecords;
      new import_obsidian10.Notice("Threads successfully connected! \u2728 (Press Ctrl+Shift+Z to Undo)");
      await this.scanNotes();
    };
    if (totalLinks > 1 && !semanticReason) {
      new ConfirmStitchModal(
        this.plugin.app,
        `You are about to create ${totalLinks} connections.
This will modify ${sources.length} note(s).

Are you sure you want to proceed?`,
        processStitching
      ).open();
    } else {
      await processStitching();
    }
  }
  async injectBackgroundBlockId(file, lineIndex, newId) {
    await this.plugin.app.vault.process(file, (data) => {
      const lines = data.split("\n");
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];
        if (!line.match(/\^([a-zA-Z0-9]+)(?:\s*%%)?\s*$/)) {
          const lastPercentIndex = line.lastIndexOf("%%");
          if (lastPercentIndex !== -1 && lastPercentIndex > 0) {
            line = line.substring(0, lastPercentIndex) + ` ^${newId} ` + line.substring(lastPercentIndex);
          } else {
            line = line + ` ^${newId}`;
          }
          lines[lineIndex] = line;
        }
      }
      return lines.join("\n");
    });
  }
  // 🧠 MOTOR DE SINCRONIZACIÓN TEMPLATER (Quirúrgico y Seguro para Undo)
  async triggerTemplaterAfterDrop() {
    const payload = _CornellNotesView.lastDraggedPayload;
    if (!payload || !payload.includes("<%")) return;
    const templaterPlugin = this.plugin.app.plugins.plugins["templater-obsidian"];
    if (!templaterPlugin || !templaterPlugin.templater) return;
    const activeView = this.plugin.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
    if (!activeView || !activeView.file || !activeView.editor) return;
    const editor = activeView.editor;
    setTimeout(async () => {
      try {
        const content = editor.getValue();
        const cursor = editor.getCursor();
        const endOffset = editor.posToOffset(cursor);
        const startOffset = endOffset - payload.length;
        let targetStartOffset = -1;
        if (startOffset >= 0 && content.substring(startOffset, endOffset) === payload) {
          targetStartOffset = startOffset;
        } else {
          targetStartOffset = content.lastIndexOf(payload);
        }
        if (targetStartOffset === -1) return;
        const parsedPayload = await templaterPlugin.templater.parse_template(
          { target_file: activeView.file, run_mode: 4 },
          // 4 = API Interna
          payload
        );
        if (parsedPayload === payload) return;
        const startPos = editor.offsetToPos(targetStartOffset);
        const endPos = editor.offsetToPos(targetStartOffset + payload.length);
        editor.replaceRange(parsedPayload, startPos, endPos);
        _CornellNotesView.lastDraggedPayload = "";
      } catch (err) {
        console.warn("Cornell Marginalia: Fallo al procesar Templater tras Drag & Drop", err);
      }
    }, 50);
  }
  // Se ejecuta cuando cierras la barra lateral
  async onClose() {
    if (this.autoPasteInterval) {
      window.clearInterval(this.autoPasteInterval);
      this.autoPasteInterval = null;
    }
  }
};
// 🧠 MEMORIA DEL OMNI-CAPTURE LATERAL
_CornellNotesView.lastCapturedContext = "";
_CornellNotesView.lastCapturedImageLength = 0;
_CornellNotesView.lastDraggedPayload = "";
var CornellNotesView = _CornellNotesView;
var CornellSettingTab = class extends import_obsidian10.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Cornell Marginalia Settings" });
    containerEl.createEl("h3", { text: "\u{1F3A8} Appearance & Rendering" });
    new import_obsidian10.Setting(containerEl).setName("Responsive Marginalia (Auto-Collapse)").setDesc("OPTIONAL: Automatically move marginalia inside the text when the note pane is too narrow (e.g. when you open the sidebar).").addToggle((toggle) => toggle.setValue(this.plugin.settings.responsiveMarginalia).onChange(async (value) => {
      this.plugin.settings.responsiveMarginalia = value;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    new import_obsidian10.Setting(containerEl).setName("Responsive Threshold (px)").setDesc("Set the width at which marginalia collapses into the text. (Requires Auto-Collapse to be ON).").addSlider((slider) => slider.setLimits(400, 1200, 10).setValue(this.plugin.settings.responsiveThreshold).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.responsiveThreshold = value;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    new import_obsidian10.Setting(containerEl).setName("Adaptive Width (Theme Compatibility)").setDesc("\u{1F9E0} Auto-calculates margin width based on empty screen space. Turn ON if you are having problems with your current  theme to prevent overlap.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.adaptiveMode).onChange(async (value) => {
        this.plugin.settings.adaptiveMode = value;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Margin Alignment").addDropdown(
      (d) => d.addOption("left", "Left").addOption("right", "Right").setValue(this.plugin.settings.alignment).onChange(async (v) => {
        this.plugin.settings.alignment = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Margin Width (%)").addSlider(
      (s) => s.setLimits(15, 60, 1).setValue(this.plugin.settings.marginWidth).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.marginWidth = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Margin Distance (Offset)").setDesc("Adjust how close or far the marginalia sits from the main text. Higher values push it outwards, lower values pull it inwards.").addSlider(
      (s) => s.setLimits(-50, 150, 5).setValue(this.plugin.settings.marginOffset).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.marginOffset = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Font Size").addText(
      (t) => t.setValue(this.plugin.settings.fontSize).onChange(async (v) => {
        this.plugin.settings.fontSize = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Font Family").addText(
      (t) => t.setValue(this.plugin.settings.fontFamily).onChange(async (v) => {
        this.plugin.settings.fontFamily = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Enable in Reading View").setDesc("Shows marginalia in reading mode. Turn this off if you prefer a clean view.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableReadingView).onChange(async (value) => {
        this.plugin.settings.enableReadingView = value;
        await this.plugin.saveSettings();
        new import_obsidian10.Notice("Reload the note to see changes in Reading View.");
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Extract Highlights").setDesc("OPTIONAL: Include standard text highlights (==text==) in the Explorer and Pinboard.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.extractHighlights).onChange(async (value) => {
        this.plugin.settings.extractHighlights = value;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
          if (leaf.view instanceof CornellNotesView) leaf.view.scanNotes();
        });
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Blur Explanatory Marginalias").setDesc("\u{1F9E0} Active Recall: Blurs regular marginalias that share a line with a flashcard, preventing spoilers.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.blurExplanatoryMarginalia).onChange(async (value) => {
        this.plugin.settings.blurExplanatoryMarginalia = value;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F3F7}\uFE0F Color Tags" });
    this.plugin.settings.tags.forEach((tag, index) => {
      new import_obsidian10.Setting(containerEl).setName(`Tag ${index + 1}`).addText(
        (t) => t.setValue(tag.prefix).onChange(async (v) => {
          this.plugin.settings.tags[index].prefix = v;
          await this.plugin.saveSettings();
          this.plugin.app.workspace.updateOptions();
        })
      ).addColorPicker(
        (c) => c.setValue(tag.color).onChange(async (v) => {
          this.plugin.settings.tags[index].color = v;
          await this.plugin.saveSettings();
          this.plugin.app.workspace.updateOptions();
        })
      ).addButton(
        (b) => b.setIcon("trash").onClick(async () => {
          this.plugin.settings.tags.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
          this.plugin.app.workspace.updateOptions();
        })
      );
    });
    new import_obsidian10.Setting(containerEl).addButton(
      (b) => b.setButtonText("Add Tag").onClick(async () => {
        this.plugin.settings.tags.push({ prefix: "New", color: "#888" });
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F5C2}\uFE0F Structural Box Colors" });
    containerEl.createEl("p", {
      text: "Asigna colores EXCLUSIVAMENTE a los recuadros de los Hilos Sem\xE1nticos (ej: #abuelo). Esto NO alterar\xE1 el color de tus marginalias en el texto.",
      cls: "setting-item-description"
    });
    if (!this.plugin.settings.structuralColors) this.plugin.settings.structuralColors = [];
    this.plugin.settings.structuralColors.forEach((struct, index) => {
      new import_obsidian10.Setting(containerEl).setName(`Box Tag ${index + 1}`).addText(
        (t) => t.setPlaceholder("#tag-estructural").setValue(struct.tag).onChange(async (v) => {
          this.plugin.settings.structuralColors[index].tag = v;
          await this.plugin.saveSettings();
          this.plugin.app.workspace.updateOptions();
        })
      ).addColorPicker(
        (c) => c.setValue(struct.color).onChange(async (v) => {
          this.plugin.settings.structuralColors[index].color = v;
          await this.plugin.saveSettings();
          this.plugin.app.workspace.updateOptions();
        })
      ).addButton(
        (b) => b.setIcon("trash").onClick(async () => {
          this.plugin.settings.structuralColors.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
          this.plugin.app.workspace.updateOptions();
        })
      );
    });
    new import_obsidian10.Setting(containerEl).addButton(
      (b) => b.setButtonText("Add Box Color").onClick(async () => {
        this.plugin.settings.structuralColors.push({ tag: "#new-box", color: "#4a90e2" });
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h3", { text: "\u2705 Task Management" });
    new import_obsidian10.Setting(containerEl).setName("Auto-Delete Completed Tasks").setDesc("When you check a marginalia task (- [x]), it will be permanently deleted from the Markdown file to keep your vault clean.").addToggle(
      (t) => t.setValue(this.plugin.settings.deleteCompletedTasks).onChange(async (v) => {
        this.plugin.settings.deleteCompletedTasks = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("TaskNotes HTTP API Integration").setDesc("Shows a button on task marginalias to send them directly to the TaskNotes plugin.").addToggle(
      (t) => t.setValue(this.plugin.settings.enableTaskNotesIntegration).onChange(async (v) => {
        this.plugin.settings.enableTaskNotesIntegration = v;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F4C2} File & Output Management" });
    new import_obsidian10.Setting(containerEl).setName("Omni-Capture Default Folder").setDesc("Folder where new marginalia files will be created (leave empty for root).").addText(
      (text) => text.setPlaceholder("Example: 00_Inbox").setValue(this.plugin.settings.omniCaptureFolder).onChange(async (value) => {
        this.plugin.settings.omniCaptureFolder = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Omni-Capture Template").setDesc("Define the output format for your captures. Use {{text}}, {{citation}}, and {{image}}. Supports Templater (<% %>). If you want to use Flashcard mode, remember to include ';;' inside your text template.").addTextArea((text) => text.setPlaceholder("\\n%%> {{text}} %%\\n{{citation}}\\n{{image}}\\n\\n---").setValue(this.plugin.settings.omniCaptureTemplate).onChange(async (value) => {
      this.plugin.settings.omniCaptureTemplate = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian10.Setting(containerEl).setName("Zettelkasten Folder").setDesc("Where should your ZK notes be created? (Leave empty for root).").addText(
      (t) => t.setValue(this.plugin.settings.zkFolder).onChange(async (v) => {
        this.plugin.settings.zkFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Zettelkasten Template Path").setDesc("Optional: Path to a markdown file to use as a template (e.g., Templates/ZK.md). Supports {{title}}, {{date}}, {{time}}.").addText(
      (t) => t.setValue(this.plugin.settings.zkTemplatePath).onChange(async (v) => {
        this.plugin.settings.zkTemplatePath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Doodles Folder").setDesc("Where should your hand-drawn images be saved? (Leave empty for root).").addText(
      (t) => t.setValue(this.plugin.settings.doodleFolder).onChange(async (v) => {
        this.plugin.settings.doodleFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Evidence Boards Folder").setDesc("Where should your Canvas files be exported?").addText(
      (t) => t.setValue(this.plugin.settings.canvasFolder).onChange(async (v) => {
        this.plugin.settings.canvasFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Pinboards Folder").setDesc("Where should your exported Pinboard Markdown files go?").addText(
      (t) => t.setValue(this.plugin.settings.pinboardFolder).onChange(async (v) => {
        this.plugin.settings.pinboardFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Pinboards Template Path").setDesc("Optional: Path to a markdown file to use as a template for exported Boards.").addText(
      (t) => t.setValue(this.plugin.settings.pinboardTemplatePath).onChange(async (v) => {
        this.plugin.settings.pinboardTemplatePath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Pinboards Item Template Path").setDesc("Optional: Template for each individual marginalia in the board. Supports {{text}}, {{citation}}, and {{source_note}}.").addText(
      (t) => t.setValue(this.plugin.settings.pinboardItemTemplatePath).onChange(async (v) => {
        this.plugin.settings.pinboardItemTemplatePath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Canvas Item Template Path").setDesc("Optional: Template for the main marginalia node in the Evidence Board. Supports {{text}} and {{source_note}}.").addText(
      (t) => t.setValue(this.plugin.settings.canvasItemTemplatePath).onChange(async (v) => {
        this.plugin.settings.canvasItemTemplatePath = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("\u2728 Clean Exports (Remove Tags)").setDesc("Automatically strip #tags from notes when exporting to Pinboard, Canvas, or Dragging to a note.").addToggle(
      (t) => t.setValue(this.plugin.settings.exportCleanTags).onChange(async (v) => {
        this.plugin.settings.exportCleanTags = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("\u2728 Clean Exports (Remove Block IDs)").setDesc("Automatically strip ^block-ids from your notes when exporting.").addToggle(
      (t) => t.setValue(this.plugin.settings.exportCleanIds).onChange(async (v) => {
        this.plugin.settings.exportCleanIds = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Drag & Drop Template (To Note)").setDesc("Format used when you drag a Semantic Thread box directly into a Markdown note. Supports {{text}}, {{citation}}, {{time}} and {{source_note}}.").addTextArea(
      (t) => t.setValue(this.plugin.settings.dragDropTemplate).onChange(async (v) => {
        this.plugin.settings.dragDropTemplate = v;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u2699\uFE0F Advanced & Exclusions" });
    new import_obsidian10.Setting(containerEl).setName("Show Syntax in Source Mode").setDesc("If enabled, Cornell Notes will show as raw Markdown syntax when using Source Mode, instead of rendering visual blocks.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showSyntaxInSourceMode).onChange(async (value) => {
        this.plugin.settings.showSyntaxInSourceMode = value;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.updateOptions();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Ignored Folders").setDesc("Comma-separated list of folders to completely ignore.").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredFolders).onChange(async (v) => {
        this.plugin.settings.ignoredFolders = v;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.updateOptions();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Ignored Folders for Highlights").setDesc("Comma-separated list of folders to ignore ONLY for highlights (e.g., Excalidraw, Templates).").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredHighlightFolders).onChange(async (v) => {
        this.plugin.settings.ignoredHighlightFolders = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("Ignored Highlight Texts").setDesc("Comma-separated list of exact texts or fragments to ignore (e.g., Switch to EXCALIDRAW VIEW).").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredHighlightTexts).onChange(async (v) => {
        this.plugin.settings.ignoredHighlightTexts = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian10.Setting(containerEl).setName("\u{1F517} Semantic Stitching UI").setDesc('When connecting (stitching) notes, ask for a semantic reason (e.g. "miden lo mismo").').addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableSemanticStitching).onChange(async (value) => {
        this.plugin.settings.enableSemanticStitching = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F9E9} Addons & Modules" });
    new import_obsidian10.Setting(containerEl).setName("Gamification & User Profile").setDesc("Turn your marginalia into a game! Earn XP, level up, and customize your profile sidebar.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["gamification-profile"]).onChange(async (value) => {
        this.plugin.settings.addons["gamification-profile"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.gamificationAddon.load();
          new import_obsidian10.Notice("\u{1F3AE} Gamification Addon Enabled!");
        } else {
          this.plugin.gamificationAddon.unload();
          new import_obsidian10.Notice("\u{1F6D1} Gamification Addon Disabled.");
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["gamification-profile"]) {
      new import_obsidian10.Setting(containerEl).setName("Profile Image URL").setDesc("Paste an image URL for your avatar.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.profileImage).onChange(async (value) => {
          this.plugin.settings.userStats.profileImage = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian10.Setting(containerEl).setName("Inspirational Quote").setDesc("A short bio or quote for your profile.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.quote).onChange(async (value) => {
          this.plugin.settings.userStats.quote = value;
          await this.plugin.saveSettings();
        })
      );
    }
    new import_obsidian10.Setting(containerEl).setName("Custom Explorer Background").setDesc("Add a beautiful background image to your Marginalia Explorer.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["custom-background"]).onChange(async (value) => {
        this.plugin.settings.addons["custom-background"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.backgroundAddon.load();
        } else {
          this.plugin.backgroundAddon.unload();
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["custom-background"]) {
      new import_obsidian10.Setting(containerEl).setName("Background Image URL").setDesc("Paste an image URL (e.g., from Unsplash) or local vault path.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.customBackground).onChange(async (value) => {
          this.plugin.settings.userStats.customBackground = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
      new import_obsidian10.Setting(containerEl).setName("Background Blur").setDesc("Amount of blur (lo-fi effect).").addSlider(
        (slider) => slider.setLimits(0, 20, 1).setValue(this.plugin.settings.userStats.bgBlur).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.userStats.bgBlur = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
      new import_obsidian10.Setting(containerEl).setName("Dark Overlay Opacity").setDesc("Dims the background so text is readable (0 = invisible, 1 = pitch black).").addSlider(
        (slider) => slider.setLimits(0.1, 1, 0.05).setValue(this.plugin.settings.userStats.bgOpacity).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.userStats.bgOpacity = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
    }
    new import_obsidian10.Setting(containerEl).setName("\u{1F331} Time Machine & Rhizome").setDesc("Explore your marginaliae on a chronological, full-screen interactive canvas with spaced repetition.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["rhizome-time-machine"]).onChange(async (value) => {
        this.plugin.settings.addons["rhizome-time-machine"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.rhizomeAddon.load();
          new import_obsidian10.Notice("\u{1F331} Time Machine Enabled! Check the left ribbon.");
        } else {
          this.plugin.rhizomeAddon.unload();
          new import_obsidian10.Notice("\u{1F6D1} Time Machine Disabled.");
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["rhizome-time-machine"]) {
      new import_obsidian10.Setting(containerEl).setName("\u{1F30C} Time Machine Wallpaper URL").setDesc("Paste a direct link to an image (jpg, png, gif) for your Time Machine background.").addText(
        (text) => text.setPlaceholder("https://example.com/background.jpg").setValue(this.plugin.settings.rhizomeBgImage || "").onChange(async (value) => {
          this.plugin.settings.rhizomeBgImage = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian10.Setting(containerEl).setName("\u{1F30C} Wallpaper Opacity").setDesc("Adjust the background transparency so it doesn't interfere with your notes (0.1 to 1.0).").addSlider(
        (slider) => slider.setLimits(0.1, 1, 0.1).setValue(this.plugin.settings.rhizomeBgOpacity || 0.3).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.rhizomeBgOpacity = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian10.Setting(containerEl).setName("\u{1F30C} Wallpaper Blur").setDesc("Apply a blur effect to the background to make your notes stand out more (0 to 20).").addSlider(
        (slider) => slider.setLimits(0, 20, 1).setValue(this.plugin.settings.rhizomeBgBlur !== void 0 ? this.plugin.settings.rhizomeBgBlur : 2).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.rhizomeBgBlur = value;
          await this.plugin.saveSettings();
        })
      );
    }
    new import_obsidian10.Setting(containerEl).setName("Pdf Doodle & Harvest").setDesc("Enable temporary drawing mode on PDFs.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enablePdfDoodle).onChange(async (value) => {
        this.plugin.settings.enablePdfDoodle = value;
        await this.plugin.saveSettings();
        new import_obsidian10.Notice("Restart Obsidian to apply Addon changes.");
      })
    );
    new import_obsidian10.Setting(containerEl).setName(this.plugin.superDoodleAddon.name).setDesc(this.plugin.superDoodleAddon.description).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons[this.plugin.superDoodleAddon.id] || false).onChange(async (value) => {
        this.plugin.settings.addons[this.plugin.superDoodleAddon.id] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.superDoodleAddon.load();
          new import_obsidian10.Notice(`\u2705 ${this.plugin.superDoodleAddon.name} enabled`);
        } else {
          this.plugin.superDoodleAddon.unload();
          new import_obsidian10.Notice(`\u274C ${this.plugin.superDoodleAddon.name} disabled`);
        }
      })
    );
    new import_obsidian10.Setting(containerEl).setName(this.plugin.blurtingAddon.name).setDesc(this.plugin.blurtingAddon.description).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons[this.plugin.blurtingAddon.id] || false).onChange(async (value) => {
        this.plugin.settings.addons[this.plugin.blurtingAddon.id] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.blurtingAddon.load();
          new import_obsidian10.Notice(`\u2705 ${this.plugin.blurtingAddon.name} enabled`);
        } else {
          this.plugin.blurtingAddon.unload();
          new import_obsidian10.Notice(`\u274C ${this.plugin.blurtingAddon.name} disabled`);
        }
        this.plugin.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
          if (leaf.view instanceof CornellNotesView) leaf.view.renderUI();
        });
      })
    );
    new import_obsidian10.Setting(containerEl).setName("\u{1F345} Margidoro Engine").setDesc("Knowledge-aware Pomodoro timer. Tracks your marginalias during study sessions and schedules reviews.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["margidoro"] || false).onChange(async (value) => {
        this.plugin.settings.addons["margidoro"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.margidoroAddon.load();
          new import_obsidian10.Notice("\u{1F345} Margidoro Enabled! Check the bottom status bar.");
        } else {
          this.plugin.margidoroAddon.unload();
          new import_obsidian10.Notice("\u{1F6D1} Margidoro Disabled.");
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["margidoro"]) {
      new import_obsidian10.Setting(containerEl).setName("Work Duration (min)").addSlider((s) => s.setLimits(5, 60, 5).setValue(this.plugin.settings.margidoro.workTime).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.margidoro.workTime = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("Short Break Duration (min)").addSlider((s) => s.setLimits(1, 15, 1).setValue(this.plugin.settings.margidoro.shortBreak || 5).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.margidoro.shortBreak = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("Long Break Duration (min)").addSlider((s) => s.setLimits(10, 45, 5).setValue(this.plugin.settings.margidoro.longBreak || 15).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.margidoro.longBreak = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("Pomodoros before Long Break").setDesc("How many work cycles to complete before taking a longer break.").addSlider((s) => s.setLimits(1, 10, 1).setValue(this.plugin.settings.margidoro.cyclesBeforeLongBreak || 4).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.margidoro.cyclesBeforeLongBreak = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("Hard Marginalia Auto-Tag").setDesc("Prefix (like ? or X-) that automatically marks a note as HARD during the session review.").addText((t) => t.setValue(this.plugin.settings.margidoro.hardPrefix).onChange(async (v) => {
        this.plugin.settings.margidoro.hardPrefix = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("Session Logs Folder").setDesc('Where your daily Pomodoro summaries will be saved. \u26A0\uFE0F TIP: Add this folder name to "Ignored Folders" above to prevent duplicating notes in your Explorer.').addText((t) => t.setValue(this.plugin.settings.margidoro.logFolder).onChange(async (v) => {
        this.plugin.settings.margidoro.logFolder = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian10.Setting(containerEl).setName("\u{1F514} Daily Review Reminder").setDesc("Time (HH:mm) to remind you to review your pending Hard Marginalias. Example: 20:00").addText((t) => t.setValue(this.plugin.settings.margidoro.reviewReminderTime).onChange(async (v) => {
        this.plugin.settings.margidoro.reviewReminderTime = v;
        await this.plugin.saveSettings();
      }));
    }
    new import_obsidian10.Setting(containerEl).setName(this.plugin.ankiSyncAddon.name).setDesc(this.plugin.ankiSyncAddon.description).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons[this.plugin.ankiSyncAddon.id] || false).onChange(async (value) => {
        this.plugin.settings.addons[this.plugin.ankiSyncAddon.id] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.ankiSyncAddon.load();
          new import_obsidian10.Notice(`\u2705 ${this.plugin.ankiSyncAddon.name} enabled`);
        } else {
          this.plugin.ankiSyncAddon.unload();
          new import_obsidian10.Notice(`\u274C ${this.plugin.ankiSyncAddon.name} disabled`);
        }
      })
    );
    if (this.plugin.settings.addons["anki-sync"]) {
      containerEl.createEl("h4", { text: "\u{1F3F7}\uFE0F Anki Auto-Sync (Tag Mappings)" });
      new import_obsidian10.Setting(containerEl).setName("Add Tag Mapping").setDesc("Map an Obsidian tag to an Anki deck. Only notes with these tags will be bulk-synced.").addButton(
        (btn) => btn.setButtonText("+ Add Route").setCta().onClick(async () => {
          this.plugin.settings.ankiTagToDeck["#new-tag"] = "Deck::New";
          await this.plugin.saveSettings();
          this.display();
        })
      );
      for (const [tag, deck] of Object.entries(this.plugin.settings.ankiTagToDeck)) {
        const mappingDiv = containerEl.createDiv({ attr: { style: "display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: var(--background-secondary); padding: 10px; border-radius: 8px;" } });
        const tagInput = mappingDiv.createEl("input", { type: "text", value: tag });
        tagInput.placeholder = "#etiqueta";
        tagInput.style.width = "150px";
        mappingDiv.createSpan({ text: "\u2794", attr: { style: "color: var(--text-muted);" } });
        const deckInput = mappingDiv.createEl("input", { type: "text", value: deck });
        deckInput.placeholder = "Deck::Subdeck";
        deckInput.style.flexGrow = "1";
        const saveBtn = mappingDiv.createEl("button");
        (0, import_obsidian10.setIcon)(saveBtn, "save");
        saveBtn.title = "Save mapping";
        saveBtn.onclick = async () => {
          let newTag = tagInput.value.trim();
          if (!newTag.startsWith("#")) newTag = "#" + newTag;
          const safeDeck = sanitizeAnkiDeckName(deckInput.value);
          if (newTag !== tag) delete this.plugin.settings.ankiTagToDeck[tag];
          this.plugin.settings.ankiTagToDeck[newTag] = safeDeck;
          await this.plugin.saveSettings();
          new import_obsidian10.Notice("\u2705 Mapping saved");
          this.display();
        };
        const delBtn = mappingDiv.createEl("button");
        (0, import_obsidian10.setIcon)(delBtn, "trash-2");
        delBtn.title = "Delete mapping";
        delBtn.onclick = async () => {
          delete this.plugin.settings.ankiTagToDeck[tag];
          await this.plugin.saveSettings();
          this.display();
        };
      }
    }
    new import_obsidian10.Setting(containerEl).setName(this.plugin.zoomDoodleAddon.name).setDesc(this.plugin.zoomDoodleAddon.description).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons[this.plugin.zoomDoodleAddon.id] || false).onChange(async (value) => {
        this.plugin.settings.addons[this.plugin.zoomDoodleAddon.id] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.zoomDoodleAddon.load();
          new import_obsidian10.Notice(`\u2705 ${this.plugin.zoomDoodleAddon.name} activado`);
        } else {
          this.plugin.zoomDoodleAddon.unload();
          new import_obsidian10.Notice(`\u274C ${this.plugin.zoomDoodleAddon.name} desactivado`);
        }
      })
    );
    new import_obsidian10.Setting(containerEl).setName("\u{1F680} Dashboard:Smart Study ").setDesc("Linear calendar, routines, subjects, and dynamic spaced review.").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableDashboardAddon).onChange(async (value) => {
      this.plugin.settings.enableDashboardAddon = value;
      await this.plugin.saveSettings();
      new import_obsidian10.Notice(value ? "\u{1F680} Dashboard Activado: Por favor recarga el plugin." : "\u{1F6D1} Dashboard Desactivado: Por favor recarga el plugin.");
    }));
    new import_obsidian10.Setting(containerEl).setName("Cornell Board \u{1F30C}").setDesc("Activate an infinite, freeform canvas to drag, connect, and visually materialize marginalias.").addToggle((toggle) => toggle.setValue(this.plugin.settings.addons["spatial-pinboard"] || false).onChange(async (value) => {
      this.plugin.settings.addons["spatial-pinboard"] = value;
      await this.plugin.saveSettings();
      if (value) {
        this.plugin.pinboardAddon.load();
      } else {
        this.plugin.pinboardAddon.unload();
      }
    }));
  }
};
var RhizomeView = class extends import_obsidian10.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.isReviewMode = false;
    this.isMargidoroMode = false;
    this.isStitchingMode = false;
    this.isMoleculeMode = false;
    this.hideOrphans = false;
    // 👻 Controla si ocultamos las notas sin conexiones
    this.is3DMode = false;
    // 🌌 Activa la perspectiva de mesa holográfica
    this.focusedClusterId = null;
    // 🎯 Recuerda qué molécula estamos aislando
    this.sourceStitchItem = null;
    // 🔍 NUEVOS ESTADOS DE FILTRO Y CACHÉ
    this.searchQuery = "";
    this.activeColorFilters = /* @__PURE__ */ new Set();
    this.showOnlyFlashcards = false;
    this.cachedTimelineData = {};
    this.allCachedNodes = [];
    this.plugin = plugin;
  }
  getViewType() {
    return RHIZOME_VIEW_TYPE;
  }
  getDisplayText() {
    return "Rhizome Time Machine";
  }
  getIcon() {
    return "git-commit-vertical";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    if (!this.plugin.settings.userStats) {
      this.plugin.settings.userStats = { xp: 0, level: 1, marginaliasCreated: 0, colorUsage: {}, profileImage: "", quote: "Stay curious.", customBackground: "", bgBlur: 5, bgOpacity: 0.8, rhizomeReviews: {}, margidoroPending: [], activeReading: {} };
    }
    if (!this.plugin.settings.userStats.rhizomeReviews) {
      this.plugin.settings.userStats.rhizomeReviews = {};
    }
    const wrapper = container.createDiv({ cls: "cornell-rhizome-wrapper" });
    this.topBarEl = wrapper.createDiv({ cls: "cornell-rhizome-topbar" });
    this.canvasEl = wrapper.createDiv({ cls: "cornell-rhizome-canvas" });
    this.canvasEl.style.flexGrow = "1";
    this.canvasEl.style.position = "relative";
    const bgUrl = this.plugin.settings.rhizomeBgImage;
    if (bgUrl && bgUrl.trim() !== "") {
      const customBg = wrapper.createDiv({ cls: "cornell-rhizome-custom-bg" });
      customBg.style.backgroundImage = `url("${bgUrl}")`;
      customBg.style.opacity = (this.plugin.settings.rhizomeBgOpacity || 0.3).toString();
      const blurValue = this.plugin.settings.rhizomeBgBlur !== void 0 ? this.plugin.settings.rhizomeBgBlur : 2;
      customBg.style.filter = `blur(${blurValue}px)`;
      wrapper.prepend(customBg);
      this.canvasEl.classList.add("has-custom-bg");
    }
    this.renderTopBar();
    this.canvasEl.createEl("h2", {
      text: "\u23F3 Time travel... (Scanning vault)",
      attr: { style: "color: var(--text-muted); text-align: center; margin-top: 20%;" }
    });
    await this.scanVault();
    await this.runGarbageCollector();
    this.renderTimeline();
  }
  renderTopBar() {
    this.topBarEl.empty();
    const searchWrapper = this.topBarEl.createDiv({ cls: "cornell-search-wrapper" });
    const searchIconEl = searchWrapper.createSpan({ cls: "cornell-search-icon" });
    (0, import_obsidian10.setIcon)(searchIconEl, "search");
    const searchInput = searchWrapper.createEl("input", { type: "text", placeholder: "Search timeline...", cls: "cornell-search-bar" });
    searchInput.value = this.searchQuery;
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderTimeline();
    };
    const flashcardBtn = this.topBarEl.createEl("button", {
      title: "Show only Flashcards (;;)",
      cls: "cornell-rhizome-filter-btn" + (this.showOnlyFlashcards ? " is-active" : "")
    });
    (0, import_obsidian10.setIcon)(flashcardBtn, "layers");
    flashcardBtn.createSpan({ text: "Flashcards" });
    flashcardBtn.onclick = () => {
      this.showOnlyFlashcards = !this.showOnlyFlashcards;
      flashcardBtn.classList.toggle("is-active", this.showOnlyFlashcards);
      this.renderTimeline();
    };
    const pillsContainer = this.topBarEl.createDiv({ cls: "cornell-color-pills" });
    this.plugin.settings.tags.forEach((tag) => {
      const pill = pillsContainer.createEl("span", { cls: "cornell-color-pill" });
      pill.style.backgroundColor = tag.color;
      pill.title = `Filter ${tag.prefix}`;
      if (this.activeColorFilters.has(tag.color)) pill.addClass("is-active");
      pill.onclick = () => {
        if (this.activeColorFilters.has(tag.color)) {
          this.activeColorFilters.delete(tag.color);
          pill.removeClass("is-active");
        } else {
          this.activeColorFilters.add(tag.color);
          pill.addClass("is-active");
        }
        this.renderTimeline();
      };
    });
    const moleculeBtn = this.topBarEl.createEl("button", {
      title: "Molecule View (Compass)",
      cls: "cornell-rhizome-filter-btn" + (this.isMoleculeMode ? " is-active" : "")
    });
    (0, import_obsidian10.setIcon)(moleculeBtn, "share-2");
    moleculeBtn.createSpan({ text: "Molecule" });
    const orphanBtn = this.topBarEl.createEl("button", {
      title: "Hide notes without compass links",
      cls: "cornell-rhizome-filter-btn" + (this.hideOrphans ? " is-active" : "")
    });
    (0, import_obsidian10.setIcon)(orphanBtn, "eye-off");
    orphanBtn.createSpan({ text: "Clean Orphans" });
    orphanBtn.style.display = this.isMoleculeMode ? "flex" : "none";
    const btn3D = this.topBarEl.createEl("button", {
      title: "Toggle Holographic 3D View",
      cls: "cornell-rhizome-filter-btn" + (this.is3DMode ? " is-active" : "")
    });
    (0, import_obsidian10.setIcon)(btn3D, "box");
    btn3D.createSpan({ text: "3D Space" });
    btn3D.style.display = this.isMoleculeMode ? "flex" : "none";
    moleculeBtn.onclick = () => {
      this.isMoleculeMode = !this.isMoleculeMode;
      moleculeBtn.classList.toggle("is-active", this.isMoleculeMode);
      orphanBtn.style.display = this.isMoleculeMode ? "flex" : "none";
      btn3D.style.display = this.isMoleculeMode ? "flex" : "none";
      this.renderTimeline();
    };
    orphanBtn.onclick = () => {
      this.hideOrphans = !this.hideOrphans;
      orphanBtn.classList.toggle("is-active", this.hideOrphans);
      this.renderTimeline();
    };
    btn3D.onclick = () => {
      this.is3DMode = !this.is3DMode;
      btn3D.classList.toggle("is-active", this.is3DMode);
      this.renderTimeline();
    };
    const refreshBtn = this.topBarEl.createEl("button", { title: "Rescan Vault", cls: "cornell-rhizome-filter-btn" });
    (0, import_obsidian10.setIcon)(refreshBtn, "refresh-cw");
    refreshBtn.onclick = async () => {
      await this.scanVault();
      this.renderTimeline();
      new import_obsidian10.Notice("Timeline rescanned!");
    };
  }
  async scanVault() {
    var _a;
    const files = this.plugin.app.vault.getMarkdownFiles();
    this.cachedTimelineData = {};
    this.allCachedNodes = [];
    const logFolder = ((_a = this.plugin.settings.margidoro) == null ? void 0 : _a.logFolder) || "Margidoro Logs";
    for (const file of files) {
      if (this.plugin.settings.ignoredFolders && file.path.includes(this.plugin.settings.ignoredFolders)) continue;
      if (file.path.includes(logFolder)) continue;
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = /%%[><](.*?)%%/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          let rawText = match[1].trim();
          if (!rawText) continue;
          let tempText = rawText.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
          let isFlashcard = false;
          if (tempText.includes(";;")) {
            isFlashcard = true;
            tempText = tempText.replace(";;", "").replace(/\s{2,}/g, " ").trim();
          }
          let color = "var(--text-normal)";
          for (const tag of this.plugin.settings.tags) {
            if (tempText.startsWith(tag.prefix)) {
              color = tag.color;
              break;
            }
          }
          const date = new Date(file.stat.mtime);
          const dateString = date.toISOString().split("T")[0];
          if (!this.cachedTimelineData[dateString]) this.cachedTimelineData[dateString] = [];
          const blockIdMatch = line.match(/\^([a-zA-Z0-9]+)(?:\s*%%)?\s*$/);
          const blockId = blockIdMatch ? blockIdMatch[1] : null;
          const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
          const outgoingLinks = [];
          let linkMatch;
          while ((linkMatch = linkRegex.exec(rawText)) !== null) {
            outgoingLinks.push(linkMatch[1]);
          }
          const compassRegex = /\[(North|South|East|West)::\s*\[\[([\s\S]*?)\]\]\]/gi;
          const compassLinks = [];
          let compassMatch;
          while ((compassMatch = compassRegex.exec(rawText)) !== null) {
            compassLinks.push({ target: compassMatch[2].trim(), direction: compassMatch[1].toLowerCase() });
          }
          const cleanCardText = tempText.replace(compassRegex, "").trim();
          const nodeData = {
            text: cleanCardText,
            color,
            rawText,
            file,
            line: i,
            blockId,
            outgoingLinks,
            compassLinks,
            id: blockId ? blockId : `${file.basename}-L${i}`,
            isFlashcard
          };
          this.cachedTimelineData[dateString].push(nodeData);
          this.allCachedNodes.push(nodeData);
        }
      }
    }
  }
  // 🧹 MOTOR DE LIMPIEZA (Garbage Collector)
  // Borra los datos de repaso de las flashcards/notas que el usuario ya eliminó de su bóveda
  async runGarbageCollector() {
    if (!this.plugin.settings.userStats || !this.plugin.settings.userStats.rhizomeReviews) return;
    const currentValidIds = new Set(this.allCachedNodes.map((node) => node.id));
    let isDirty = false;
    let deletedCount = 0;
    for (const savedId in this.plugin.settings.userStats.rhizomeReviews) {
      if (!currentValidIds.has(savedId)) {
        delete this.plugin.settings.userStats.rhizomeReviews[savedId];
        isDirty = true;
        deletedCount++;
      }
    }
    if (isDirty) {
      await this.plugin.saveSettings();
      console.log(`\u{1F9F9} Rhizome Garbage Collector: Se eliminaron ${deletedCount} registros hu\xE9rfanos. Tu data.json est\xE1 optimizado.`);
    }
  }
  renderTimeline(ignoredCanvas) {
    var _a;
    if (this.isMoleculeMode) {
      return this.renderMoleculeView();
    }
    const canvas = this.canvasEl;
    canvas.empty();
    const timelineData = {};
    const searchLower = this.searchQuery.toLowerCase();
    const onlyFc = this.showOnlyFlashcards;
    const activeColors = this.activeColorFilters;
    for (const date in this.cachedTimelineData) {
      const filteredNodes = this.cachedTimelineData[date].filter((item) => {
        var _a2;
        const matchesSearch = item.text.toLowerCase().includes(searchLower) || item.file.basename.toLowerCase().includes(searchLower);
        const matchesColor = activeColors.size === 0 || activeColors.has(item.color);
        const matchesFc = !onlyFc || item.isFlashcard;
        const isPending = (_a2 = this.plugin.settings.userStats.margidoroPending) == null ? void 0 : _a2.includes(item.id);
        const matchesMargidoro = !this.isMargidoroMode || isPending;
        return matchesSearch && matchesColor && matchesFc && matchesMargidoro;
      });
      if (filteredNodes.length > 0) {
        timelineData[date] = filteredNodes;
      }
    }
    const allNodes = this.allCachedNodes;
    let currentZoom = 1;
    const zoomControls = canvas.createDiv({ cls: "cornell-rhizome-zoom-controls" });
    const reviewBtn = zoomControls.createEl("button", {
      text: this.isReviewMode ? "\u{1F525} Heatmap (Review)" : "\u{1F9E0} Study Mode",
      cls: this.isReviewMode ? "is-reviewing" : ""
    });
    reviewBtn.onclick = () => {
      this.isReviewMode = !this.isReviewMode;
      this.renderTimeline();
    };
    const margidoroBtn = zoomControls.createEl("button", {
      text: this.isMargidoroMode ? "\u{1F345} Focus: Pending" : "\u{1F345} Pomodoro Review",
      cls: this.isMargidoroMode ? "is-reviewing" : ""
    });
    margidoroBtn.style.marginLeft = "10px";
    margidoroBtn.onclick = () => {
      this.isMargidoroMode = !this.isMargidoroMode;
      if (this.isMargidoroMode) this.isReviewMode = false;
      this.renderTimeline();
    };
    const zoomOutBtn = zoomControls.createEl("button", { text: "-" });
    const zoomResetBtn = zoomControls.createEl("button", { text: "100%" });
    const zoomInBtn = zoomControls.createEl("button", { text: "+" });
    const scrollContainer = canvas.createDiv({ cls: "cornell-rhizome-scroll" });
    const contentContainer = scrollContainer.createDiv({ cls: "cornell-rhizome-content" });
    const applyZoom = () => {
      contentContainer.style.setProperty("zoom", currentZoom.toString());
      zoomResetBtn.innerText = `${Math.round(currentZoom * 100)}%`;
    };
    zoomInBtn.onclick = () => {
      currentZoom = Math.min(currentZoom + 0.2, 2.5);
      applyZoom();
    };
    zoomOutBtn.onclick = () => {
      currentZoom = Math.max(currentZoom - 0.2, 0.2);
      applyZoom();
    };
    zoomResetBtn.onclick = () => {
      currentZoom = 1;
      applyZoom();
    };
    scrollContainer.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) currentZoom = Math.min(currentZoom + 0.1, 2.5);
        else currentZoom = Math.max(currentZoom - 0.1, 0.2);
        applyZoom();
      }
    });
    const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlay.classList.add("cornell-rhizome-svg-overlay");
    contentContainer.appendChild(svgOverlay);
    const sortedDates = Object.keys(timelineData).sort();
    if (sortedDates.length === 0) {
      contentContainer.createEl("h3", { text: "\u{1F50D} No matching notes found.", attr: { style: "margin: auto;" } });
      return;
    }
    const domNodesMap = /* @__PURE__ */ new Map();
    for (const date of sortedDates) {
      const dayColumn = contentContainer.createDiv({ cls: "cornell-rhizome-day-column" });
      dayColumn.createDiv({ cls: "cornell-rhizome-date-label", text: date });
      const nodesContainer = dayColumn.createDiv({ cls: "cornell-rhizome-nodes" });
      for (const item of timelineData[date]) {
        const node = nodesContainer.createDiv({ cls: "cornell-rhizome-node" });
        node.id = item.id;
        node.setAttr("draggable", "true");
        node.addEventListener("dragstart", (e) => {
          console.log("\u{1F6F8} 1. DRAG START: Nota capturada en el Rhizome", item.text);
          OmniDragManager.payload = {
            text: item.text.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim(),
            rawText: item.text,
            color: item.color,
            file: item.file,
            line: item.line,
            blockId: item.blockId,
            outgoingLinks: item.outgoingLinks,
            indentLevel: 0
          };
          node.style.opacity = "0.5";
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", item.text);
          }
        });
        node.addEventListener("dragend", (e) => {
          console.log("\u{1F4A5} 4. DRAG END: Vuelo terminado. Destruyendo payload.");
          node.style.opacity = "1";
          OmniDragManager.payload = null;
        });
        if (item.isFlashcard) {
          const fcIcon = node.createSpan({ text: "\u26A1 ", title: "Flashcard" });
          fcIcon.style.opacity = "0.7";
          fcIcon.style.fontSize = "1.1em";
        }
        const reviewData = this.plugin.settings.userStats.rhizomeReviews[item.id] || { lastReviewed: 0, interval: 0, ease: 2.5 };
        const now = Date.now();
        const msInDay = 24 * 60 * 60 * 1e3;
        const nextReviewDate = reviewData.lastReviewed + reviewData.interval * msInDay;
        let isDue = false;
        let heatmapColor = "";
        if (reviewData.lastReviewed === 0) {
          heatmapColor = "#ff4d4d";
          isDue = true;
        } else if (now >= nextReviewDate) {
          heatmapColor = "#ff9900";
          isDue = true;
        } else {
          heatmapColor = "#00cc66";
        }
        if (this.isReviewMode) {
          node.style.borderColor = heatmapColor;
          node.style.boxShadow = `0 4px 15px ${heatmapColor}30`;
        } else {
          node.style.borderColor = item.color;
          node.style.boxShadow = `0 4px 15px ${item.color}20`;
        }
        const exactKey = `${item.file.basename}#^${item.blockId}`;
        const fileKey = item.file.basename;
        if (item.blockId) domNodesMap.set(exactKey, node);
        if (!domNodesMap.has(fileKey)) domNodesMap.set(fileKey, node);
        let cleanText = item.text.replace(/^[!?XV-]+\s*/, "");
        const imagesToRender = [];
        const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
        const imgMatches = Array.from(cleanText.matchAll(imgRegex));
        imgMatches.forEach((m) => imagesToRender.push(m[1]));
        cleanText = cleanText.replace(imgRegex, "").trim();
        const threadRegex = /(?<!!)\[\[(.*?)\]\]/g;
        cleanText = cleanText.replace(threadRegex, "").trim();
        if (cleanText) {
          node.createEl("span", { text: cleanText.length > 130 ? cleanText.substring(0, 130) + "..." : cleanText });
        }
        if (imagesToRender.length > 0) {
          const imgContainer = node.createDiv({ cls: "cornell-rhizome-images" });
          imagesToRender.forEach((imgName) => {
            const cleanName = imgName.split("|")[0];
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, item.file.path);
            if (file) {
              const imgSrc = this.plugin.app.vault.getResourcePath(file);
              const imgEl = imgContainer.createEl("img", { attr: { src: imgSrc } });
              imgEl.style.maxHeight = "120px";
              imgEl.style.maxWidth = "100%";
              imgEl.style.objectFit = "contain";
              imgEl.style.borderRadius = "4px";
              imgEl.style.marginTop = "8px";
              imgEl.style.display = "block";
              imgEl.style.background = "transparent";
            }
          });
        }
        if (this.isReviewMode && isDue) {
          const gradeContainer = node.createDiv({ cls: "cornell-srs-controls" });
          const btnHard = gradeContainer.createEl("button", { text: "Hard", cls: "srs-hard" });
          const btnGood = gradeContainer.createEl("button", { text: "Good", cls: "srs-good" });
          const btnEasy = gradeContainer.createEl("button", { text: "Easy", cls: "srs-easy" });
          const processGrade = async (grade, e) => {
            e.stopPropagation();
            let { interval, ease } = reviewData;
            if (grade === "hard") {
              interval = Math.max(1, interval * 0.5);
              ease = Math.max(1.3, ease - 0.2);
            } else if (grade === "good") {
              interval = interval === 0 ? 1 : interval * ease;
            } else if (grade === "easy") {
              interval = interval === 0 ? 4 : interval * ease * 1.3;
              ease += 0.15;
            }
            this.plugin.settings.userStats.rhizomeReviews[item.id] = {
              lastReviewed: Date.now(),
              interval,
              ease
            };
            await this.plugin.saveSettings();
            node.style.borderColor = "#00cc66";
            node.style.boxShadow = `0 4px 15px #00cc6640`;
            gradeContainer.remove();
            new import_obsidian10.Notice(`Brain synced! Next review in ${Math.round(interval)} days. \u{1F9E0}`);
          };
          btnHard.onclick = (e) => processGrade("hard", e);
          btnGood.onclick = (e) => processGrade("good", e);
          btnEasy.onclick = (e) => processGrade("easy", e);
        }
        const actionsDiv = node.createDiv({ cls: "cornell-rhizome-actions" });
        if (this.isMargidoroMode && ((_a = this.plugin.settings.userStats.margidoroPending) == null ? void 0 : _a.includes(item.id))) {
          const resolveBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
          (0, import_obsidian10.setIcon)(resolveBtn, "check-circle");
          resolveBtn.title = "Mark as Mastered";
          resolveBtn.style.background = "var(--color-green)";
          resolveBtn.style.color = "white";
          resolveBtn.style.padding = "4px";
          resolveBtn.style.borderRadius = "4px";
          resolveBtn.style.cursor = "pointer";
          resolveBtn.style.marginRight = "5px";
          resolveBtn.onClickEvent(async (ev) => {
            ev.stopPropagation();
            this.plugin.settings.userStats.margidoroPending = this.plugin.settings.userStats.margidoroPending.filter((id) => id !== item.id);
            await this.plugin.saveSettings();
            node.style.transition = "all 0.3s ease";
            node.style.transform = "scale(0.8)";
            node.style.opacity = "0";
            setTimeout(() => this.renderTimeline(), 300);
            new import_obsidian10.Notice("\u2705 Topic Mastered!");
          });
        }
        const stitchBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian10.setIcon)(stitchBtn, "link");
        stitchBtn.title = "Stitch (Connect) to another note";
        stitchBtn.onClickEvent((e) => {
          e.stopPropagation();
          this.handleStitchClick(item, node, canvas);
        });
        const focusBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian10.setIcon)(focusBtn, "focus");
        focusBtn.title = "Focus on semantic cluster";
        focusBtn.onClickEvent((e) => {
          e.stopPropagation();
          this.activateFocusMode(item.id, allNodes, domNodesMap, canvas);
        });
        if (imagesToRender.length > 0) {
          const zoomBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
          (0, import_obsidian10.setIcon)(zoomBtn, "maximize");
          zoomBtn.title = "View Doodle in Fullscreen";
          zoomBtn.onClickEvent((ev) => {
            ev.stopPropagation();
            const firstImg = imagesToRender[0];
            const cleanName = firstImg.split("|")[0];
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, item.file.path);
            if (file) {
              const imgSrc = this.plugin.app.vault.getResourcePath(file);
              const overlay = document.body.createDiv({ cls: "cornell-lightbox-overlay" });
              overlay.style.position = "fixed";
              overlay.style.top = "0";
              overlay.style.left = "0";
              overlay.style.width = "100vw";
              overlay.style.height = "100vh";
              overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
              overlay.style.zIndex = "999999";
              overlay.style.display = "flex";
              overlay.style.justifyContent = "center";
              overlay.style.alignItems = "center";
              overlay.style.overflow = "hidden";
              const imgContainer = overlay.createDiv();
              imgContainer.style.transition = "transform 0.1s ease-out";
              imgContainer.style.cursor = "grab";
              const bigImg = imgContainer.createEl("img", { attr: { src: imgSrc, draggable: "false" } });
              bigImg.style.backgroundColor = "white";
              bigImg.style.padding = "15px";
              bigImg.style.borderRadius = "8px";
              bigImg.style.maxHeight = "90vh";
              bigImg.style.maxWidth = "90vw";
              bigImg.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
              if (document.body.classList.contains("theme-dark") && cleanName.includes("doodle_")) {
                bigImg.style.filter = "invert(1)";
                bigImg.style.opacity = "0.9";
              }
              let scale = 1;
              let isDraggingImg = false;
              let startX = 0, startY = 0;
              let translateX = 0, translateY = 0;
              const updateTransform = () => {
                imgContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
              };
              overlay.addEventListener("wheel", (e) => {
                e.preventDefault();
                if (e.deltaY < 0) scale = Math.min(scale + 0.15, 5);
                else scale = Math.max(scale - 0.15, 0.5);
                updateTransform();
              });
              imgContainer.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                isDraggingImg = true;
                imgContainer.style.cursor = "grabbing";
                imgContainer.style.transition = "none";
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
              });
              window.addEventListener("mousemove", (e) => {
                if (!isDraggingImg) return;
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateTransform();
              });
              window.addEventListener("mouseup", () => {
                if (isDraggingImg) {
                  isDraggingImg = false;
                  imgContainer.style.cursor = "grab";
                  imgContainer.style.transition = "transform 0.1s ease-out";
                }
              });
              overlay.addEventListener("mousedown", (e) => {
                if (e.target === overlay) {
                  overlay.remove();
                }
              });
              const escListener = (evKey) => {
                if (evKey.key === "Escape") {
                  overlay.remove();
                  document.removeEventListener("keydown", escListener);
                }
              };
              document.addEventListener("keydown", escListener);
            }
          });
        }
        node.onClickEvent(() => {
          this.plugin.app.workspace.getLeaf(false).openFile(item.file, { eState: { line: item.line } });
        });
        let hoverTimeout = null;
        let tooltipEl = null;
        let isHovering = false;
        const removeTooltip = () => {
          isHovering = false;
          if (hoverTimeout) clearTimeout(hoverTimeout);
          if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
          }
          document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
        };
        node.addEventListener("mouseenter", (e) => {
          isHovering = true;
          hoverTimeout = setTimeout(async () => {
            if (!isHovering) return;
            const content = await this.plugin.app.vault.cachedRead(item.file);
            if (!isHovering || !document.body.contains(node)) return;
            const lines = content.split("\n");
            let startLine = item.line;
            let endLine = item.line;
            while (startLine > 0 && lines[startLine - 1].trim() !== "" && !lines[startLine - 1].startsWith("```")) startLine--;
            while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== "" && !lines[endLine + 1].startsWith("```")) endLine++;
            removeTooltip();
            const pdfRegex = /!*\[\[(.*?\.(?:pdf).*?)\]\]/i;
            const mdPdfRegex = /\[.*?\]\((.*?\.(?:pdf).*?)\)/i;
            let pdfLinkText = null;
            let match = lines[item.line].match(pdfRegex) || lines[item.line].match(mdPdfRegex);
            if (match) pdfLinkText = match[1];
            if (!pdfLinkText && item.line - 1 >= startLine) {
              match = lines[item.line - 1].match(pdfRegex) || lines[item.line - 1].match(mdPdfRegex);
              if (match) pdfLinkText = match[1];
            }
            if (!pdfLinkText && item.line + 1 <= endLine) {
              match = lines[item.line + 1].match(pdfRegex) || lines[item.line + 1].match(mdPdfRegex);
              if (match) pdfLinkText = match[1];
            }
            if (pdfLinkText) {
              const cleanLinkText = pdfLinkText.split("|")[0].trim();
              this.plugin.app.workspace.trigger("hover-link", {
                event: e,
                source: "preview",
                hoverParent: node,
                targetEl: node,
                linktext: cleanLinkText,
                sourcePath: item.file.path
              });
              return;
            }
            let rawBlock = "";
            let highlightApplied = false;
            for (let i = startLine; i <= endLine; i++) {
              let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
              if (cleanLine.startsWith("```")) continue;
              if (cleanLine) {
                if ((i === item.line || i >= item.line && !highlightApplied) && !highlightApplied) {
                  rawBlock += `==${cleanLine}==
`;
                  highlightApplied = true;
                } else rawBlock += `${cleanLine}
`;
              }
            }
            tooltipEl = document.createElement("div");
            tooltipEl.className = "popover hover-popover cornell-hover-tooltip markdown-rendered markdown-preview-view";
            tooltipEl.style.position = "fixed";
            tooltipEl.style.zIndex = "99999";
            tooltipEl.style.width = "450px";
            tooltipEl.style.maxHeight = "350px";
            tooltipEl.style.overflowY = "auto";
            tooltipEl.style.backgroundColor = "var(--background-primary)";
            tooltipEl.style.border = "1px solid var(--background-modifier-border)";
            tooltipEl.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
            tooltipEl.style.borderRadius = "8px";
            tooltipEl.style.padding = "12px";
            tooltipEl.style.display = "flex";
            tooltipEl.style.flexDirection = "column";
            tooltipEl.style.gap = "8px";
            const styleTag = document.createElement("style");
            styleTag.innerHTML = `.cornell-hover-tooltip p { margin: 0 0 8px 0 !important; }`;
            tooltipEl.appendChild(styleTag);
            const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
            const headerSpan = header.createEl("span", {
              text: `\u{1F4C4} ${item.file.basename} (L${item.line + 1})`,
              attr: { style: "font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;" }
            });
            const body = tooltipEl.createDiv();
            body.style.width = "100%";
            document.body.appendChild(tooltipEl);
            const rect = node.getBoundingClientRect();
            let leftPos = rect.right + 20;
            if (leftPos + 450 > window.innerWidth) leftPos = rect.left - 470;
            if (leftPos < 10) leftPos = 10;
            tooltipEl.style.left = `${leftPos}px`;
            let topPos = rect.top;
            if (topPos + 350 > window.innerHeight) topPos = window.innerHeight - 360;
            tooltipEl.style.top = `${Math.max(10, topPos)}px`;
            const inlineImgRegex = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg))\|?(.*?)\]\]/gi;
            rawBlock = rawBlock.replace(inlineImgRegex, (match2, filename) => {
              const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
              if (file) {
                const resourcePath = this.plugin.app.vault.getResourcePath(file);
                return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
              }
              return match2;
            });
            if (!rawBlock.trim()) rawBlock = "*No text context available.*";
            await import_obsidian10.MarkdownRenderer.renderMarkdown(rawBlock, body, item.file.path, this);
            requestAnimationFrame(() => {
              if (tooltipEl) tooltipEl.addClass("is-visible");
            });
          }, 500);
        });
        node.addEventListener("mouseleave", removeTooltip);
      }
    }
    setTimeout(() => {
      allNodes.forEach((sourceItem) => {
        const sourceNode = document.getElementById(sourceItem.id);
        if (!sourceNode) return;
        sourceItem.outgoingLinks.forEach((link) => {
          let targetKey = link.split("|")[0].trim();
          let targetNode = domNodesMap.get(targetKey);
          if (targetNode && targetNode !== sourceNode) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("fill", "transparent");
            path.setAttribute("stroke", "var(--interactive-accent)");
            path.setAttribute("stroke-width", "2");
            path.classList.add("cornell-semantic-thread");
            path.setAttribute("data-source", sourceNode.id);
            path.setAttribute("data-target", targetNode.id);
            svgOverlay.appendChild(path);
          }
        });
      });
      this.updatePathCoordinates(contentContainer, scrollContainer);
      const allPaths = document.querySelectorAll(".cornell-semantic-thread");
      allPaths.forEach((path) => {
        path.classList.remove("is-visible");
      });
      const allDomNodes = document.querySelectorAll(".cornell-rhizome-node");
      allDomNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
          const currentId = node.id;
          node.classList.add("is-hovered");
          allPaths.forEach((path) => {
            const src = path.getAttribute("data-source");
            const tgt = path.getAttribute("data-target");
            if (src === currentId || tgt === currentId) {
              path.classList.add("is-visible");
              const partnerId = src === currentId ? tgt : src;
              const partnerNode = document.getElementById(partnerId);
              if (partnerNode) partnerNode.classList.add("is-connected");
            }
          });
        });
        node.addEventListener("mouseleave", () => {
          const isFocusMode = document.querySelector(".cornell-focus-banner");
          if (!isFocusMode) {
            allPaths.forEach((path) => path.classList.remove("is-visible"));
          }
          allDomNodes.forEach((n) => {
            n.classList.remove("is-connected");
            n.classList.remove("is-hovered");
          });
        });
      });
    }, 300);
  }
  // ======================================================
  // 🌌 MOTOR DEL MODO MOLÉCULA (LIENZO ESPACIAL 3D)
  // ======================================================
  renderMoleculeView() {
    const canvas = this.canvasEl;
    canvas.empty();
    const scrollContainer = canvas.createDiv({ cls: "cornell-rhizome-scroll" });
    scrollContainer.style.overflow = "auto";
    const container = scrollContainer.createDiv({ cls: "cornell-molecule-canvas" });
    container.style.position = "relative";
    container.style.width = "3000px";
    container.style.height = "3000px";
    container.style.pointerEvents = "none";
    let rotX = 55;
    let rotY = -15;
    let currentZoom = this.is3DMode ? 0.9 : 1;
    const zoomControls = canvas.createDiv({ cls: "cornell-rhizome-zoom-controls" });
    zoomControls.style.zIndex = "1000";
    const margidoroBtn = zoomControls.createEl("button", {
      text: this.isMargidoroMode ? "\u{1F345} Focus: Pending" : "\u{1F345} Pomodoro Review",
      cls: this.isMargidoroMode ? "is-reviewing" : ""
    });
    margidoroBtn.style.marginRight = "10px";
    margidoroBtn.onclick = () => {
      this.isMargidoroMode = !this.isMargidoroMode;
      this.renderTimeline();
    };
    const zoomOutBtn = zoomControls.createEl("button", { text: "-" });
    const zoomResetBtn = zoomControls.createEl("button", { text: "100%" });
    const zoomInBtn = zoomControls.createEl("button", { text: "+" });
    const applyTransform = (smooth = true) => {
      container.style.transition = smooth ? "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none";
      if (this.is3DMode) {
        container.style.transform = `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${currentZoom}) translateY(-100px)`;
        container.style.transformStyle = "preserve-3d";
        container.style.boxShadow = "inset 0 0 200px rgba(0,0,0,0.5)";
      } else {
        container.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) scale(${currentZoom}) translateY(0px)`;
        container.style.boxShadow = "none";
      }
    };
    zoomInBtn.onclick = () => {
      currentZoom = Math.min(currentZoom + 0.2, 2.5);
      applyTransform();
      zoomResetBtn.innerText = `${Math.round(currentZoom * 100)}%`;
    };
    zoomOutBtn.onclick = () => {
      currentZoom = Math.max(currentZoom - 0.2, 0.2);
      applyTransform();
      zoomResetBtn.innerText = `${Math.round(currentZoom * 100)}%`;
    };
    zoomResetBtn.onclick = () => {
      currentZoom = this.is3DMode ? 0.9 : 1;
      rotX = 55;
      rotY = -15;
      applyTransform();
      zoomResetBtn.innerText = "100%";
    };
    scrollContainer.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) currentZoom = Math.min(currentZoom + 0.1, 2.5);
        else currentZoom = Math.max(currentZoom - 0.1, 0.2);
        applyTransform();
        zoomResetBtn.innerText = `${Math.round(currentZoom * 100)}%`;
      }
    });
    scrollContainer.addEventListener("mousedown", (e) => {
      if (!this.is3DMode) return;
      if (e.target.closest(".cornell-rhizome-node, .cornell-action-btn, button, a")) return;
      let startX = e.clientX;
      let startY = e.clientY;
      let startRotX = rotX;
      let startRotY = rotY;
      scrollContainer.style.cursor = "grabbing";
      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        rotY = startRotY + dx * 0.4;
        rotX = Math.max(0, Math.min(startRotX - dy * 0.4, 85));
        applyTransform(false);
      };
      const onMouseUp = () => {
        scrollContainer.style.cursor = "auto";
        applyTransform(true);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    applyTransform();
    const linesContainer = container.createDiv({ cls: "cornell-3d-lines-container" });
    linesContainer.style.position = "absolute";
    linesContainer.style.top = "0";
    linesContainer.style.left = "0";
    linesContainer.style.width = "100%";
    linesContainer.style.height = "100%";
    linesContainer.style.pointerEvents = "none";
    linesContainer.style.transformStyle = "preserve-3d";
    linesContainer.style.zIndex = "0";
    if (this.focusedClusterId) {
      const focusBanner = scrollContainer.createDiv({ cls: "cornell-focus-banner" });
      focusBanner.style.position = "fixed";
      focusBanner.style.top = "20px";
      focusBanner.style.left = "50%";
      focusBanner.style.transform = "translateX(-50%)";
      focusBanner.style.zIndex = "1000";
      focusBanner.style.background = "var(--interactive-accent)";
      focusBanner.style.color = "var(--text-on-accent)";
      focusBanner.style.padding = "10px 20px";
      focusBanner.style.borderRadius = "20px";
      focusBanner.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
      focusBanner.style.display = "flex";
      focusBanner.style.gap = "10px";
      focusBanner.style.alignItems = "center";
      focusBanner.innerHTML = `<span>\u{1F3AF} Focused on Isolated Molecule</span>`;
      const exitFocusBtn = focusBanner.createEl("button", { text: "\u2716 Exit Focus" });
      exitFocusBtn.style.background = "transparent";
      exitFocusBtn.style.border = "1px solid white";
      exitFocusBtn.style.color = "white";
      exitFocusBtn.style.cursor = "pointer";
      exitFocusBtn.style.borderRadius = "4px";
      exitFocusBtn.onclick = () => {
        this.focusedClusterId = null;
        this.renderTimeline();
      };
    }
    const clusterIds = /* @__PURE__ */ new Set();
    if (this.focusedClusterId) {
      const queue = [this.focusedClusterId];
      clusterIds.add(this.focusedClusterId);
      const network = /* @__PURE__ */ new Map();
      this.allCachedNodes.forEach((n) => {
        if (!network.has(n.id)) network.set(n.id, []);
        if (n.compassLinks) {
          n.compassLinks.forEach((l) => {
            const rawT = l.target.split("|")[0].trim().replace("[[", "").replace("]]", "");
            const match = rawT.match(/#\^([a-zA-Z0-9]+)/);
            let tId = match ? match[1] : null;
            if (!tId) {
              const tNode = this.allCachedNodes.find((xn) => xn.file.basename === rawT || xn.text.includes(rawT));
              if (tNode) tId = tNode.id;
            }
            if (tId) {
              if (!network.has(tId)) network.set(tId, []);
              network.get(n.id).push(tId);
              network.get(tId).push(n.id);
            }
          });
        }
      });
      let head = 0;
      while (head < queue.length) {
        const current = queue[head++];
        const neighbors = network.get(current) || [];
        neighbors.forEach((nx) => {
          if (!clusterIds.has(nx)) {
            clusterIds.add(nx);
            queue.push(nx);
          }
        });
      }
    }
    const searchLower = this.searchQuery.toLowerCase();
    const activeColors = this.activeColorFilters;
    const connectedIds = /* @__PURE__ */ new Set();
    if (this.hideOrphans) {
      this.allCachedNodes.forEach((node) => {
        if (node.compassLinks && node.compassLinks.length > 0) {
          connectedIds.add(node.id);
          node.compassLinks.forEach((link) => {
            const rawTarget = link.target.split("|")[0].trim().replace("[[", "").replace("]]", "");
            const targetIdMatch = rawTarget.match(/#\^([a-zA-Z0-9]+)/);
            if (targetIdMatch) {
              connectedIds.add(targetIdMatch[1]);
            } else {
              const targetNode = this.allCachedNodes.find((n) => n.file.basename === rawTarget || n.text.includes(rawTarget));
              if (targetNode) connectedIds.add(targetNode.id);
            }
          });
        }
      });
    }
    const validNodes = this.allCachedNodes.filter((item) => {
      var _a;
      const matchesSearch = item.text.toLowerCase().includes(searchLower) || item.file.basename.toLowerCase().includes(searchLower);
      const matchesColor = activeColors.size === 0 || activeColors.has(item.color);
      const matchesOrphan = !this.hideOrphans || connectedIds.has(item.id) || connectedIds.has(item.blockId);
      const matchesCluster = !this.focusedClusterId || clusterIds.has(item.id);
      const isPending = (_a = this.plugin.settings.userStats.margidoroPending) == null ? void 0 : _a.includes(item.id);
      const matchesMargidoro = !this.isMargidoroMode || isPending;
      return matchesSearch && matchesColor && matchesOrphan && matchesCluster && matchesMargidoro;
    });
    const positions = /* @__PURE__ */ new Map();
    const centerX = 1500;
    const centerY = 1500;
    const spacing = 350;
    validNodes.forEach((node, idx) => {
      if (!positions.has(node.id)) {
        const initZ = this.is3DMode ? node.text.length % 200 - 100 : 0;
        positions.set(node.id, { x: centerX + idx * 50, y: centerY + idx * 50, z: initZ, rx: 0, ry: 0 });
      }
      if (node.compassLinks && node.compassLinks.length > 0) {
        node.compassLinks.forEach((link) => {
          const rawTarget = link.target.split("|")[0].trim().replace("[[", "").replace("]]", "");
          const targetIdMatch = rawTarget.match(/#\^([a-zA-Z0-9]+)/);
          let targetNode = null;
          if (targetIdMatch) {
            const tId = targetIdMatch[1];
            targetNode = validNodes.find((n) => n.id === tId || n.blockId === tId);
          } else {
            targetNode = validNodes.find((n) => n.file.basename === rawTarget || n.text.includes(rawTarget));
          }
          if (targetNode) {
            const basePos = positions.get(node.id);
            let dx = 0;
            let dy = 0;
            if (link.direction === "north") dy = -spacing;
            if (link.direction === "south") dy = spacing;
            if (link.direction === "east") dx = spacing;
            if (link.direction === "west") dx = -spacing;
            positions.set(targetNode.id, { x: basePos.x + dx, y: basePos.y + dy, z: basePos.z, rx: 0, ry: 0 });
          }
        });
      }
    });
    validNodes.forEach((item) => {
      var _a;
      const pos = positions.get(item.id);
      if (!pos) return;
      const node = container.createDiv({ cls: "cornell-rhizome-node is-molecule-node" });
      node.id = item.id;
      node.style.position = "absolute";
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      node.style.width = "240px";
      node.style.borderColor = item.color;
      node.style.boxShadow = `0 4px 15px ${item.color}20`;
      node.style.zIndex = "1";
      node.style.pointerEvents = "auto";
      if (this.is3DMode) {
        node.style.transform = `translateZ(${pos.z}px) rotateX(${pos.rx || 0}deg) rotateY(${pos.ry || 0}deg)`;
        const shadowSpread = Math.max(10, 30 + pos.z * 0.2);
        node.style.boxShadow = `0 ${shadowSpread}px ${shadowSpread + 10}px ${item.color}40`;
      } else {
        node.style.transform = "translateZ(0px)";
      }
      let cleanText = item.text.replace(/^[!?XV-]+\s*/, "");
      const imagesToRender = [];
      const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
      const imgMatches = Array.from(cleanText.matchAll(imgRegex));
      imgMatches.forEach((m) => imagesToRender.push(m[1]));
      cleanText = cleanText.replace(imgRegex, "").trim();
      const threadRegex = /(?<!!)\[\[(.*?)\]\]/g;
      cleanText = cleanText.replace(threadRegex, "").trim();
      if (cleanText) {
        node.createEl("span", { text: cleanText.length > 130 ? cleanText.substring(0, 130) + "..." : cleanText });
      }
      if (imagesToRender.length > 0) {
        const imgContainer = node.createDiv({ cls: "cornell-rhizome-images" });
        imagesToRender.forEach((imgName) => {
          const cleanName = imgName.split("|")[0];
          const file = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, item.file.path);
          if (file) {
            const imgSrc = this.plugin.app.vault.getResourcePath(file);
            const imgEl = imgContainer.createEl("img", { attr: { src: imgSrc, draggable: "false" } });
            imgEl.style.maxHeight = "120px";
            imgEl.style.maxWidth = "100%";
            imgEl.style.objectFit = "contain";
            imgEl.style.borderRadius = "4px";
            imgEl.style.marginTop = "8px";
            imgEl.style.display = "block";
          }
        });
      }
      const actionsDiv = node.createDiv({ cls: "cornell-rhizome-actions" });
      actionsDiv.style.position = "absolute";
      actionsDiv.style.bottom = "8px";
      actionsDiv.style.right = "8px";
      actionsDiv.style.display = "flex";
      actionsDiv.style.gap = "6px";
      actionsDiv.style.zIndex = "10";
      if (this.isMargidoroMode && ((_a = this.plugin.settings.userStats.margidoroPending) == null ? void 0 : _a.includes(item.id))) {
        const resolveBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian10.setIcon)(resolveBtn, "check-circle");
        resolveBtn.title = "Mark as Mastered";
        resolveBtn.style.background = "var(--color-green)";
        resolveBtn.style.color = "white";
        resolveBtn.style.padding = "4px";
        resolveBtn.style.borderRadius = "4px";
        resolveBtn.style.cursor = "pointer";
        resolveBtn.onClickEvent(async (ev) => {
          ev.stopPropagation();
          this.plugin.settings.userStats.margidoroPending = this.plugin.settings.userStats.margidoroPending.filter((id) => id !== item.id);
          await this.plugin.saveSettings();
          node.style.transform = "scale(0.8)";
          node.style.opacity = "0";
          setTimeout(() => this.renderTimeline(), 250);
          new import_obsidian10.Notice("\u2705 Topic Mastered!");
        });
      }
      const focusBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
      (0, import_obsidian10.setIcon)(focusBtn, "focus");
      focusBtn.title = "Isolate Molecule Cluster";
      focusBtn.style.background = "var(--background-modifier-border)";
      focusBtn.style.padding = "4px";
      focusBtn.style.borderRadius = "4px";
      focusBtn.style.cursor = "pointer";
      focusBtn.onClickEvent((ev) => {
        ev.stopPropagation();
        this.focusedClusterId = item.id;
        this.renderTimeline();
      });
      const stitchBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
      (0, import_obsidian10.setIcon)(stitchBtn, "link");
      stitchBtn.title = "Stitch (Connect) to another note";
      stitchBtn.style.background = "var(--background-modifier-border)";
      stitchBtn.style.padding = "4px";
      stitchBtn.style.borderRadius = "4px";
      stitchBtn.style.cursor = "pointer";
      stitchBtn.onClickEvent((ev) => {
        ev.stopPropagation();
        this.handleStitchClick(item, node, canvas);
      });
      if (imagesToRender.length > 0) {
        const zoomBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian10.setIcon)(zoomBtn, "maximize");
        zoomBtn.title = "View Doodle in Fullscreen";
        zoomBtn.style.background = "var(--background-modifier-border)";
        zoomBtn.style.padding = "4px";
        zoomBtn.style.borderRadius = "4px";
        zoomBtn.style.cursor = "pointer";
        zoomBtn.onClickEvent((ev) => {
          ev.stopPropagation();
          const firstImg = imagesToRender[0];
          const cleanName = firstImg.split("|")[0];
          const file = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, item.file.path);
          if (file) {
            const imgSrc = this.plugin.app.vault.getResourcePath(file);
            const overlay = document.body.createDiv({ cls: "cornell-lightbox-overlay" });
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
            overlay.style.zIndex = "999999";
            overlay.style.display = "flex";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            const bigImg = overlay.createEl("img", { attr: { src: imgSrc } });
            bigImg.style.backgroundColor = "white";
            bigImg.style.padding = "10px";
            bigImg.style.borderRadius = "8px";
            bigImg.style.maxHeight = "90vh";
            bigImg.style.maxWidth = "90vw";
            if (document.body.classList.contains("theme-dark") && cleanName.includes("doodle_")) {
              bigImg.style.filter = "invert(1)";
              bigImg.style.opacity = "0.9";
            }
            overlay.onclick = () => overlay.remove();
            const escListener = (evKey) => {
              if (evKey.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", escListener);
              }
            };
            document.addEventListener("keydown", escListener);
          }
        });
      }
      let wasDragged = false;
      node.addEventListener("click", (e) => {
        if (wasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (this.isStitchingMode) {
          this.handleStitchClick(item, node, canvas);
        } else {
          this.plugin.app.workspace.getLeaf(false).openFile(item.file, { eState: { line: item.line } });
        }
      });
      let hoverTimeout = null;
      let tooltipEl = null;
      let isHovering = false;
      const removeTooltip = () => {
        isHovering = false;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        if (tooltipEl) {
          tooltipEl.remove();
          tooltipEl = null;
        }
        document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
      };
      node.addEventListener("mouseenter", (e) => {
        if (wasDragged) return;
        isHovering = true;
        hoverTimeout = setTimeout(async () => {
          if (!isHovering) return;
          const content = await this.plugin.app.vault.cachedRead(item.file);
          if (!isHovering || !document.body.contains(node)) return;
          const lines = content.split("\n");
          let startLine = item.line;
          let endLine = item.line;
          while (startLine > 0 && lines[startLine - 1].trim() !== "" && !lines[startLine - 1].startsWith("```")) startLine--;
          while (endLine < lines.length - 1 && lines[endLine + 1].trim() !== "" && !lines[endLine + 1].startsWith("```")) endLine++;
          removeTooltip();
          const pdfRegex = /!*\[\[(.*?\.(?:pdf).*?)\]\]/i;
          const mdPdfRegex = /\[.*?\]\((.*?\.(?:pdf).*?)\)/i;
          let pdfLinkText = null;
          let match = lines[item.line].match(pdfRegex) || lines[item.line].match(mdPdfRegex);
          if (match) pdfLinkText = match[1];
          if (!pdfLinkText && item.line - 1 >= startLine) {
            match = lines[item.line - 1].match(pdfRegex) || lines[item.line - 1].match(mdPdfRegex);
            if (match) pdfLinkText = match[1];
          }
          if (!pdfLinkText && item.line + 1 <= endLine) {
            match = lines[item.line + 1].match(pdfRegex) || lines[item.line + 1].match(mdPdfRegex);
            if (match) pdfLinkText = match[1];
          }
          if (pdfLinkText) {
            const cleanLinkText = pdfLinkText.split("|")[0].trim();
            this.plugin.app.workspace.trigger("hover-link", {
              event: e,
              source: "preview",
              hoverParent: node,
              targetEl: node,
              linktext: cleanLinkText,
              sourcePath: item.file.path
            });
            return;
          }
          let rawBlock = "";
          let highlightApplied = false;
          for (let i = startLine; i <= endLine; i++) {
            let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
            if (cleanLine.startsWith("```")) continue;
            if (cleanLine) {
              if ((i === item.line || i >= item.line && !highlightApplied) && !highlightApplied) {
                rawBlock += `==${cleanLine}==
`;
                highlightApplied = true;
              } else rawBlock += `${cleanLine}
`;
            }
          }
          tooltipEl = document.createElement("div");
          tooltipEl.className = "popover hover-popover cornell-hover-tooltip markdown-rendered markdown-preview-view";
          tooltipEl.style.position = "fixed";
          tooltipEl.style.zIndex = "99999";
          tooltipEl.style.width = "450px";
          tooltipEl.style.maxHeight = "350px";
          tooltipEl.style.overflowY = "auto";
          tooltipEl.style.backgroundColor = "var(--background-primary)";
          tooltipEl.style.border = "1px solid var(--background-modifier-border)";
          tooltipEl.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
          tooltipEl.style.borderRadius = "8px";
          tooltipEl.style.padding = "12px";
          tooltipEl.style.display = "flex";
          tooltipEl.style.flexDirection = "column";
          tooltipEl.style.gap = "8px";
          const styleTag = document.createElement("style");
          styleTag.innerHTML = `.cornell-hover-tooltip p { margin: 0 0 8px 0 !important; }`;
          tooltipEl.appendChild(styleTag);
          const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
          const headerSpan = header.createEl("span", {
            text: `\u{1F4C4} ${item.file.basename} (L${item.line + 1})`,
            attr: { style: "font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;" }
          });
          const body = tooltipEl.createDiv();
          body.style.width = "100%";
          document.body.appendChild(tooltipEl);
          const rect = node.getBoundingClientRect();
          let leftPos = rect.right + 20;
          if (leftPos + 450 > window.innerWidth) leftPos = rect.left - 470;
          if (leftPos < 10) leftPos = 10;
          tooltipEl.style.left = `${leftPos}px`;
          let topPos = rect.top;
          if (topPos + 350 > window.innerHeight) topPos = window.innerHeight - 360;
          tooltipEl.style.top = `${Math.max(10, topPos)}px`;
          const inlineImgRegex = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg))\|?(.*?)\]\]/gi;
          rawBlock = rawBlock.replace(inlineImgRegex, (match2, filename) => {
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
            if (file) {
              const resourcePath = this.plugin.app.vault.getResourcePath(file);
              return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
            }
            return match2;
          });
          if (!rawBlock.trim()) rawBlock = "*No text context available.*";
          await import_obsidian10.MarkdownRenderer.renderMarkdown(rawBlock, body, item.file.path, this);
          requestAnimationFrame(() => {
            if (tooltipEl) tooltipEl.addClass("is-visible");
          });
        }, 500);
      });
      node.addEventListener("mouseleave", removeTooltip);
      node.style.cursor = "grab";
      node.addEventListener("mousedown", (e) => {
        var _a2, _b, _c;
        const target = e.target;
        if (target.closest("button, a")) return;
        wasDragged = false;
        let startX = e.clientX;
        let startY = e.clientY;
        let initialLeft = parseInt(node.style.left, 10) || 0;
        let initialTop = parseInt(node.style.top, 10) || 0;
        node.style.zIndex = "100";
        node.style.cursor = "grabbing";
        node.style.transition = "none";
        removeTooltip();
        let initialZ = ((_a2 = positions.get(item.id)) == null ? void 0 : _a2.z) || 0;
        let initialRx = ((_b = positions.get(item.id)) == null ? void 0 : _b.rx) || 0;
        let initialRy = ((_c = positions.get(item.id)) == null ? void 0 : _c.ry) || 0;
        const onMouseMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            wasDragged = true;
          }
          if (moveEvent.shiftKey && this.is3DMode) {
            const newZ = initialZ - dy * 1.5;
            node.style.transform = `translateZ(${newZ}px) rotateX(${initialRx}deg) rotateY(${initialRy}deg)`;
            const shadowSpread = Math.max(10, 30 + newZ * 0.2);
            node.style.boxShadow = `0 ${shadowSpread}px ${shadowSpread + 10}px ${item.color}40`;
            positions.set(item.id, { x: initialLeft, y: initialTop, z: newZ, rx: initialRx, ry: initialRy });
          } else if (moveEvent.altKey && this.is3DMode) {
            const newRx = initialRx - dy * 0.5;
            const newRy = initialRy + dx * 0.5;
            node.style.transform = `translateZ(${initialZ}px) rotateX(${newRx}deg) rotateY(${newRy}deg)`;
            positions.set(item.id, { x: initialLeft, y: initialTop, z: initialZ, rx: newRx, ry: newRy });
          } else {
            const radY = rotY * (Math.PI / 180);
            const radX = rotX * (Math.PI / 180);
            const cosY = Math.abs(Math.cos(radY)) < 0.1 ? 0.1 * Math.sign(Math.cos(radY)) : Math.cos(radY);
            const cosX = Math.abs(Math.cos(radX)) < 0.1 ? 0.1 * Math.sign(Math.cos(radX)) : Math.cos(radX);
            const localDx = dx / currentZoom / cosY;
            const localDy = dy / currentZoom / cosX;
            const newX = initialLeft + localDx;
            const newY = initialTop + localDy;
            node.style.left = `${newX}px`;
            node.style.top = `${newY}px`;
            positions.set(item.id, { x: newX, y: newY, z: initialZ, rx: initialRx, ry: initialRy });
          }
          this.redrawMoleculeLines(validNodes, positions, linesContainer);
        };
        const onMouseUp = () => {
          node.style.zIndex = "1";
          node.style.cursor = "grab";
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          setTimeout(() => {
            wasDragged = false;
          }, 50);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    });
    this.redrawMoleculeLines(validNodes, positions, linesContainer);
    setTimeout(() => {
      scrollContainer.scrollLeft = 1e3;
      scrollContainer.scrollTop = 1e3;
    }, 100);
  }
  // 🎯 MOTOR DEL MODO FOCO SEMÁNTICO
  activateFocusMode(centerNodeId, allNodes, domNodesMap, canvas) {
    const allDomNodes = document.querySelectorAll(".cornell-rhizome-node");
    const allColumns = document.querySelectorAll(".cornell-rhizome-day-column");
    const allPaths = document.querySelectorAll(".cornell-semantic-thread");
    const scrollContainer = canvas.querySelector(".cornell-rhizome-scroll");
    const contentContainer = canvas.querySelector(".cornell-rhizome-content");
    const clusterIds = /* @__PURE__ */ new Set();
    clusterIds.add(centerNodeId);
    const centerNodeData = allNodes.find((n) => n.id === centerNodeId);
    if (centerNodeData) {
      centerNodeData.outgoingLinks.forEach((link) => {
        const targetKey = link.split("|")[0].trim();
        const targetNode = domNodesMap.get(targetKey);
        if (targetNode) clusterIds.add(targetNode.id);
      });
    }
    allNodes.forEach((node) => {
      node.outgoingLinks.forEach((link) => {
        const targetKey = link.split("|")[0].trim();
        const targetNode = domNodesMap.get(targetKey);
        if (targetNode && targetNode.id === centerNodeId) {
          clusterIds.add(node.id);
        }
      });
    });
    allDomNodes.forEach((node) => {
      if (!clusterIds.has(node.id)) {
        node.classList.add("is-dimmed");
      } else {
        node.classList.remove("is-dimmed");
      }
    });
    allColumns.forEach((col) => {
      const visibleNodes = col.querySelectorAll(".cornell-rhizome-node:not(.is-dimmed)");
      if (visibleNodes.length === 0) {
        col.classList.add("is-empty");
      } else {
        col.classList.remove("is-empty");
      }
    });
    setTimeout(() => {
      this.updatePathCoordinates(contentContainer, scrollContainer);
      allPaths.forEach((path) => {
        const src = path.getAttribute("data-source");
        const tgt = path.getAttribute("data-target");
        if (src && tgt && (clusterIds.has(src) && clusterIds.has(tgt))) {
          path.classList.add("is-visible");
        } else {
          path.classList.remove("is-visible");
        }
      });
    }, 150);
    const existingBanner = canvas.querySelector(".cornell-focus-banner");
    if (existingBanner) existingBanner.remove();
    const banner = canvas.createDiv({ cls: "cornell-focus-banner" });
    const bannerIcon = banner.createSpan();
    (0, import_obsidian10.setIcon)(bannerIcon, "network");
    banner.createSpan({ text: `Semantic Cluster (${clusterIds.size} notes)` });
    const exitBtn = banner.createEl("button", { cls: "cornell-focus-exit-btn", title: "Exit Focus Mode" });
    (0, import_obsidian10.setIcon)(exitBtn, "x");
    exitBtn.onclick = () => {
      allDomNodes.forEach((n) => n.classList.remove("is-dimmed"));
      allColumns.forEach((c) => c.classList.remove("is-empty"));
      allPaths.forEach((p) => p.classList.remove("is-visible"));
      banner.remove();
      setTimeout(() => {
        this.updatePathCoordinates(contentContainer, scrollContainer);
      }, 150);
    };
  }
  // 🕸️ MOTOR RE-CALCULADOR DE RUTAS SVG (Calcula la física real en vivo)
  updatePathCoordinates(contentContainer, scrollContainer) {
    const svgOverlay = contentContainer.querySelector(".cornell-rhizome-svg-overlay");
    if (!svgOverlay) return;
    const currentZoom = parseFloat(contentContainer.style.getPropertyValue("zoom")) || 1;
    svgOverlay.style.width = contentContainer.scrollWidth + "px";
    svgOverlay.style.height = contentContainer.scrollHeight + "px";
    const containerRect = scrollContainer.getBoundingClientRect();
    const allPaths = svgOverlay.querySelectorAll(".cornell-semantic-thread");
    allPaths.forEach((path) => {
      const srcId = path.getAttribute("data-source");
      const tgtId = path.getAttribute("data-target");
      const sourceNode = document.getElementById(srcId);
      const targetNode = document.getElementById(tgtId);
      if (sourceNode && targetNode && !sourceNode.classList.contains("is-dimmed") && !targetNode.classList.contains("is-dimmed")) {
        const sRect = sourceNode.getBoundingClientRect();
        const tRect = targetNode.getBoundingClientRect();
        const sX = (sRect.right - containerRect.left + scrollContainer.scrollLeft) / currentZoom;
        const sY = (sRect.top + sRect.height / 2 - containerRect.top + scrollContainer.scrollTop) / currentZoom;
        const tX = (tRect.left - containerRect.left + scrollContainer.scrollLeft) / currentZoom;
        const tY = (tRect.top + tRect.height / 2 - containerRect.top + scrollContainer.scrollTop) / currentZoom;
        const cp1X = sX + 50;
        const cp1Y = sY;
        const cp2X = tX - 50;
        const cp2Y = tY;
        path.setAttribute("d", `M ${sX} ${sY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tX} ${tY}`);
        path.style.display = "block";
      } else {
        path.style.display = "none";
      }
    });
  }
  // ======================================================
  // ⛓️ MOTOR DE COSIDO EN LA MÁQUINA DEL TIEMPO
  // ======================================================
  handleStitchClick(item, nodeEl, canvas) {
    if (!this.isStitchingMode) {
      this.isStitchingMode = true;
      this.sourceStitchItem = item;
      nodeEl.classList.add("is-stitching-source");
      let banner = canvas.querySelector(".cornell-rhizome-stitch-banner");
      if (!banner) {
        banner = canvas.createDiv({ cls: "cornell-rhizome-stitch-banner" });
      }
      banner.innerHTML = `<span>\u26D3\uFE0E Step 2: Select destination note to connect with <b>${item.file.basename}</b>...</span>`;
      const cancelBtn = banner.createEl("button", { text: "Cancel", cls: "cornell-stitch-cancel" });
      cancelBtn.onclick = () => this.cancelStitch(canvas);
      new import_obsidian10.Notice("Step 1: Origin selected. Click the Link icon on the destination note.");
    } else {
      if (this.sourceStitchItem.id === item.id) {
        new import_obsidian10.Notice("Cannot connect a note to itself.");
        this.cancelStitch(canvas);
        return;
      }
      const banner = canvas.querySelector(".cornell-rhizome-stitch-banner");
      if (banner) {
        banner.empty();
        banner.innerHTML = `<span>\u{1F9ED} Select relationship from <b>${this.sourceStitchItem.file.basename}</b> to <b>${item.file.basename}</b>:</span>`;
        const directions = ["Classic", "North", "South", "East", "West"];
        directions.forEach((dir) => {
          const btn = banner.createEl("button", { text: dir, cls: "cornell-compass-btn" });
          btn.style.margin = "0 5px";
          btn.onclick = (e) => {
            e.stopPropagation();
            this.executeStitch(this.sourceStitchItem, item, dir).then(() => {
              this.cancelStitch(canvas);
              this.renderTimeline(canvas);
            });
          };
        });
        const cancelBtn = banner.createEl("button", { text: "Cancel", cls: "cornell-stitch-cancel" });
        cancelBtn.style.marginLeft = "15px";
        cancelBtn.onclick = (e) => {
          e.stopPropagation();
          this.cancelStitch(canvas);
        };
      }
    }
  }
  cancelStitch(canvas) {
    this.isStitchingMode = false;
    this.sourceStitchItem = null;
    document.querySelectorAll(".is-stitching-source").forEach((el) => el.classList.remove("is-stitching-source"));
    const banner = canvas.querySelector(".cornell-rhizome-stitch-banner");
    if (banner) banner.remove();
  }
  //======================================================
  //  MOTOR de cocido!!!!
  // ======================================================
  async executeStitch(source, target, direction = "Classic") {
    new import_obsidian10.Notice(`Stitching semantic ${direction} thread... \u23F3\u26D3\uFE0E`);
    let targetId = target.blockId;
    if (!targetId) {
      targetId = Math.random().toString(36).substring(2, 8);
      await this.plugin.app.vault.process(target.file, (data) => {
        const lines = data.split("\n");
        if (target.line >= 0 && target.line < lines.length) {
          let line = lines[target.line];
          if (!line.match(/\^([a-zA-Z0-9]+)(?:\s*%%)?\s*$/)) {
            const lastPercentIndex = line.lastIndexOf("%%");
            if (lastPercentIndex !== -1 && lastPercentIndex > 0) {
              line = line.substring(0, lastPercentIndex) + ` ^${targetId} ` + line.substring(lastPercentIndex);
            } else {
              line = line + ` ^${targetId}`;
            }
            lines[target.line] = line;
          }
        }
        return lines.join("\n");
      });
    }
    let linkToInject = "";
    if (direction === "Classic") {
      linkToInject = ` [[${target.file.basename}#^${targetId}]]`;
    } else {
      linkToInject = ` [${direction}:: [[${target.file.basename}#^${targetId}]]]`;
    }
    let expectedNewRaw = "";
    await this.plugin.app.vault.process(source.file, (data) => {
      const lines = data.split("\n");
      if (source.line >= 0 && source.line < lines.length) {
        let newRaw = source.rawText;
        const lastPercentIndex = newRaw.lastIndexOf("%%");
        if (lastPercentIndex !== -1 && lastPercentIndex > 0) {
          const contentInside = newRaw.substring(0, lastPercentIndex);
          const idMatch = contentInside.match(/(\s*\^[a-zA-Z0-9]+)\s*$/);
          if (idMatch) {
            newRaw = contentInside.substring(0, idMatch.index) + linkToInject + idMatch[1] + " " + newRaw.substring(lastPercentIndex);
          } else {
            newRaw = contentInside + linkToInject + " " + newRaw.substring(lastPercentIndex);
          }
        } else {
          const idMatch = newRaw.match(/(\s*\^[a-zA-Z0-9]+)\s*$/);
          if (idMatch) {
            newRaw = newRaw.substring(0, idMatch.index) + linkToInject + idMatch[1];
          } else {
            newRaw = newRaw + linkToInject;
          }
        }
        expectedNewRaw = newRaw;
        lines[source.line] = lines[source.line].replace(source.rawText, newRaw);
      }
      return lines.join("\n");
    });
    this.plugin.lastStitchAction = [{
      file: source.file,
      line: source.line,
      oldRaw: source.rawText,
      newRaw: expectedNewRaw
    }];
    new import_obsidian10.Notice("\u2728 Conexi\xF3n sem\xE1ntica establecida! (Press Ctrl+Shift+Z to Undo)");
  }
  // ======================================================
  // 🕸️ MOTOR ELÁSTICO 3D: VECTORES MATEMÁTICOS REALES
  // ======================================================
  redrawMoleculeLines(validNodes, positions, linesContainer) {
    linesContainer.empty();
    validNodes.forEach((node) => {
      if (node.compassLinks && node.compassLinks.length > 0) {
        node.compassLinks.forEach((link) => {
          const rawTarget = link.target.split("|")[0].trim().replace("[[", "").replace("]]", "");
          const targetIdMatch = rawTarget.match(/#\^([a-zA-Z0-9]+)/);
          let targetNode = null;
          if (targetIdMatch) {
            targetNode = validNodes.find((n) => n.id === targetIdMatch[1] || n.blockId === targetIdMatch[1]);
          } else {
            targetNode = validNodes.find((n) => n.file.basename === rawTarget || n.text.includes(rawTarget));
          }
          if (targetNode && positions.has(node.id) && positions.has(targetNode.id)) {
            const sPos = positions.get(node.id);
            const tPos = positions.get(targetNode.id);
            const startX = sPos.x + 120;
            const startY = sPos.y + 40;
            const startZ = sPos.z || 0;
            const endX = tPos.x + 120;
            const endY = tPos.y + 40;
            const endZ = tPos.z || 0;
            const dx = endX - startX;
            const dy = endY - startY;
            const dz = endZ - startZ;
            const dist2D = Math.hypot(dx, dy);
            const length = Math.hypot(dist2D, dz);
            const angleZ = Math.atan2(dy, dx) * (180 / Math.PI);
            const angleY = Math.atan2(-dz, dist2D) * (180 / Math.PI);
            const linkColor = link.direction === "north" ? "var(--color-blue, #4a90e2)" : link.direction === "south" ? "var(--color-green, #50e3c2)" : link.direction === "east" ? "var(--color-orange, #f5a623)" : link.direction === "west" ? "var(--color-red, #d0021b)" : "var(--interactive-accent)";
            const line = linesContainer.createDiv({ cls: "cornell-3d-line" });
            line.style.position = "absolute";
            line.style.left = "0px";
            line.style.top = "0px";
            line.style.width = `${length}px`;
            line.style.height = "3px";
            line.style.transformOrigin = "0 50%";
            line.style.transform = `translate3d(${startX}px, ${startY}px, ${startZ}px) rotateZ(${angleZ}deg) rotateY(${angleY}deg)`;
            line.style.pointerEvents = "none";
            line.style.backgroundImage = `linear-gradient(to right, ${linkColor} 50%, transparent 50%)`;
            line.style.backgroundSize = "15px 3px";
            line.style.opacity = "0.8";
            const arrow = line.createDiv();
            arrow.style.position = "absolute";
            arrow.style.right = "0";
            arrow.style.top = "50%";
            arrow.style.transform = "translate(100%, -50%)";
            arrow.style.borderTop = "6px solid transparent";
            arrow.style.borderBottom = "6px solid transparent";
            arrow.style.borderLeft = `12px solid ${linkColor}`;
          }
        });
      }
    });
  }
};
var CornellMarginalia = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    this.lastStitchAction = null;
    this.activeRecallMode = false;
    this.activeAddons = [];
  }
  // 📁 MOTOR DE CREACIÓN DE CARPETAS
  async ensureFolderExists(folderPath) {
    if (!folderPath || folderPath === "/" || folderPath.trim() === "") return;
    const normalizedPath = folderPath.replace(/\\/g, "/");
    const folders = normalizedPath.split("/");
    let currentPath = "";
    for (const folder of folders) {
      if (!folder) continue;
      currentPath = currentPath === "" ? folder : `${currentPath}/${folder}`;
      const folderAbstract = this.app.vault.getAbstractFileByPath(currentPath);
      if (!folderAbstract) {
        await this.app.vault.createFolder(currentPath);
      }
    }
  }
  // 🚀 LECTOR DE CONFIGURACIÓN DE TASKNOTES
  async getTaskNotesConfig() {
    try {
      const configStr = await this.app.vault.adapter.read(".obsidian/plugins/tasknotes/data.json");
      const config = JSON.parse(configStr);
      return {
        port: config.apiPort || 8080,
        token: config.apiAuthToken || ""
        // Rescatamos el token si existe
      };
    } catch (e) {
      return { port: 8080, token: "" };
    }
  }
  // 🚀 PUENTE HTTP A TASKNOTES
  async sendToTaskNotes(taskTitle, tags = []) {
    const { port, token } = await this.getTaskNotesConfig();
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`http://localhost:${port}/api/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: taskTitle, tags })
      });
      if (response.ok) {
        new import_obsidian10.Notice("\u{1F680} Task successfully sent to TaskNotes!");
      } else {
        new import_obsidian10.Notice(`\u26A0\uFE0F Failed to send task. Is TaskNotes API enabled on port ${port}?`);
      }
    } catch (e) {
      new import_obsidian10.Notice(`\u274C Could not connect to TaskNotes on port ${port}. Is the plugin running?`);
    }
  }
  // 📄 MOTOR DE PLANTILLAS AVANZADO (Con soporte para Templater)
  async getTemplateContent(templatePath, variables, targetFile) {
    if (!templatePath || templatePath.trim() === "") return "";
    const file = this.app.metadataCache.getFirstLinkpathDest(templatePath, "");
    if (file instanceof import_obsidian10.TFile) {
      let content = await this.app.vault.read(file);
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, value);
      }
      const templaterPlugin = this.app.plugins.plugins["templater-obsidian"];
      if (templaterPlugin && templaterPlugin.templater) {
        try {
          const activeContextFile = targetFile || this.app.workspace.getActiveFile();
          if (activeContextFile) {
            content = await templaterPlugin.templater.parse_template(
              { target_file: activeContextFile, run_mode: 4 },
              // run_mode 4 es para llamadas de API internas
              content
            );
          }
        } catch (error) {
          console.warn("Cornell Marginalia: Error al parsear con Templater. Verifique la sintaxis de sus tags <% %>.", error);
        }
      }
      return content + "\n";
    }
    new import_obsidian10.Notice(`\u26A0\uFE0F Template not found: ${templatePath}`);
    return "";
  }
  async onload() {
    await this.loadSettings();
    this.captureManager = new OmniCaptureManager(this.app, this);
    this.gamificationAddon = new GamificationAddon(this);
    if (this.settings.addons && this.settings.addons["gamification-profile"]) {
      this.gamificationAddon.load();
    }
    this.backgroundAddon = new CustomBackgroundAddon(this);
    if (this.settings.addons && this.settings.addons["custom-background"]) {
      this.backgroundAddon.load();
    }
    this.superDoodleAddon = new SuperDoodleAddon(this);
    if (this.settings.addons[this.superDoodleAddon.id]) {
      this.superDoodleAddon.load();
    }
    this.registerView(RHIZOME_VIEW_TYPE, (leaf) => new RhizomeView(leaf, this));
    this.rhizomeAddon = new RhizomeAddon(this);
    if (this.settings.addons && this.settings.addons["rhizome-time-machine"]) {
      this.rhizomeAddon.load();
    }
    if (this.settings.enablePdfDoodle) {
      new PdfDoodleAddon(this).load();
    }
    this.blurtingAddon = new BlurtingAddon(this);
    if (this.settings.addons && this.settings.addons[this.blurtingAddon.id]) {
      this.blurtingAddon.load();
    }
    this.margidoroAddon = new MargidoroAddon(this);
    if (this.settings.addons && this.settings.addons["margidoro"]) {
      this.margidoroAddon.load();
    }
    this.ankiSyncAddon = new AnkiSyncAddon(this);
    if (this.settings.addons && this.settings.addons["anki-sync"]) {
      this.ankiSyncAddon.load();
    }
    this.zoomDoodleAddon = new ZoomDoodleAddon(this);
    if (this.settings.addons && this.settings.addons["zoom-doodle"]) {
      this.zoomDoodleAddon.load();
    }
    if (this.settings.enableDashboardAddon) {
      const dashboard = new DashboardAddon(this);
      this.activeAddons.push(dashboard);
      dashboard.load();
    }
    this.registerView(PINBOARD_VIEW_TYPE, (leaf) => new PinboardView(leaf, this));
    try {
      this.app.viewRegistry.unregisterExtensions(["cboard"]);
    } catch (e) {
    }
    try {
      this.registerExtensions(["cboard"], PINBOARD_VIEW_TYPE);
    } catch (error) {
      console.log("La extensi\xF3n .cboard sigue registrada, ignorando error para continuar la carga.");
    }
    this.addCommand({
      id: "create-new-cboard",
      name: "Create new Canvas (.cboard)",
      callback: async () => {
        const fileName = `Lienzo ${window.moment().format("YYYY-MM-DD HH-mm-ss")}.cboard`;
        const file = await this.app.vault.create(fileName, '{"nodes":{},"stitches":[]}');
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.openFile(file);
      }
    });
    this.updateStyles();
    this.registerView(CORNELL_VIEW_TYPE, (leaf) => new CornellNotesView(leaf, this));
    this.registerEditorExtension(import_view.EditorView.domEventHandlers({
      drop: (event, view) => {
        var _a;
        const text = (_a = event.dataTransfer) == null ? void 0 : _a.getData("text/plain");
        if (text && text.includes("<%") && text.includes("%>")) {
          event.preventDefault();
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos === null) return false;
          this.processTemplaterDrop(text, pos, view);
          return true;
        }
        return false;
      }
    }));
    this.addCommand({
      id: "open-cornell-explorer",
      name: "Open Marginalia Explorer",
      callback: () => {
        this.activateView();
      }
    });
    this.addSettingTab(new CornellSettingTab(this.app, this));
    this.registerEditorExtension(createCornellExtension(this.app, this.settings, () => this.activeRecallMode));
    this.ribbonIcon = this.addRibbonIcon("eye", "Toggle Active Recall Mode", (evt) => {
      this.toggleActiveRecall();
    });
    const toggleVisualHelper = async () => {
      this.settings.visualHelper = !this.settings.visualHelper;
      await this.saveSettings();
      new import_obsidian10.Notice(`Cornell Visual Helper: ${this.settings.visualHelper ? "Activado \u{1F7E2}" : "Desactivado \u{1F534}"}`);
      this.app.workspace.updateOptions();
    };
    this.addRibbonIcon("map-pin", "Alternar Visual Helper (Cornell)", toggleVisualHelper);
    this.addCommand({
      id: "toggle-cornell-visual-helper",
      name: "Alternar Visual Helper (Puntos de anclaje)",
      callback: toggleVisualHelper
    });
    this.addCommand({
      id: "insert-cornell-note",
      name: "Insert Margin Note",
      callback: () => {
        var _a, _b;
        let editor = (_a = this.app.workspace.activeEditor) == null ? void 0 : _a.editor;
        if (!editor) {
          const view = (_b = this.app.workspace.activeLeaf) == null ? void 0 : _b.view;
          if (view && view.editor) {
            editor = view.editor;
          }
        }
        if (editor) {
          const selection = editor.getSelection();
          if (selection) {
            editor.replaceSelection(`%%> ${selection} %%`);
          } else {
            editor.replaceSelection(`%%>  %%`);
            const cursor = editor.getCursor();
            editor.setCursor({ line: cursor.line, ch: cursor.ch - 3 });
          }
          return;
        }
        const activeEl = document.activeElement;
        if (activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement) {
          const start = activeEl.selectionStart;
          const end = activeEl.selectionEnd;
          if (start !== null && end !== null) {
            const text = activeEl.value;
            const selection = text.substring(start, end);
            const replacement = selection ? `%%> ${selection} %%` : `%%>  %%`;
            activeEl.setRangeText(replacement, start, end, "end");
            if (!selection) {
              activeEl.setSelectionRange(start + 4, start + 4);
            }
            activeEl.dispatchEvent(new Event("input", { bubbles: true }));
            activeEl.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
    });
    this.addCommand({
      id: "insert-cornell-block",
      name: "Insert Cornell Block (Editorial)",
      editorCallback: (editor) => {
        const selection = editor.getSelection();
        const startPos = editor.getCursor("from");
        if (selection) {
          editor.replaceSelection(`\`\`\`cornell
%%>  %%
${selection}
\`\`\``);
        } else {
          editor.replaceSelection(`\`\`\`cornell
%%>  %%

\`\`\``);
        }
        editor.setCursor({ line: startPos.line + 1, ch: 4 });
      }
    });
    this.addCommand({
      id: "omni-capture",
      name: "\u26A1 Omni-Capture (Idea, Context & Doodle)",
      callback: () => {
        new OmniCaptureModal(this.app, this).open();
      }
    });
    this.addCommand({
      id: "cornell-open-sidebar-doodle",
      name: "Open Sidebar Doodle Canvas",
      hotkeys: [{ modifiers: ["Alt", "Shift"], key: "d" }],
      callback: async () => {
        const result = await this.captureManager.openDoodle();
        if (result.isInstant) {
          await this.captureManager.saveCapture({
            thought: "",
            destination: this.settings.lastOmniDestination,
            doodleData: result.data
          });
          this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
            if (leaf.view instanceof CornellNotesView) leaf.view.applyFiltersAndRender();
          });
        } else {
          const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
          if (leaves.length > 0) {
            const view = leaves[0].view;
            view.pendingDoodleData = result.data;
            const doodleBtn = view.containerEl.querySelector('.cornell-qc-btn[title="Attach Doodle"]');
            if (doodleBtn) doodleBtn.style.color = "var(--color-green)";
            new import_obsidian10.Notice("\u{1F3A8} Doodle in memory! Press \u26A1 in the sidebar to save.");
          } else {
            new import_obsidian10.Notice("\u{1F3A8} Doodle captured. Open Sidebar to complete your note.");
          }
        }
      }
    });
    ["up", "down", "left", "right"].forEach((dir) => {
      this.addCommand({
        id: `cornell-pinboard-move-${dir}`,
        name: `Pinboard: Move Item ${dir.charAt(0).toUpperCase() + dir.slice(1)}`,
        // Por defecto les ponemos Alt + Flechas para que no choquen con Outliner
        hotkeys: [{ modifiers: ["Alt"], key: `Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}` }],
        checkCallback: (checking) => {
          const activeEl = document.activeElement;
          if (activeEl && activeEl.classList.contains("cornell-pinboard-item")) {
            if (!checking) {
              activeEl.dispatchEvent(new CustomEvent("cornell-move", { detail: dir }));
            }
            return true;
          }
          return false;
        }
      });
    });
    this.addCommand({
      id: "cornell-focus-explorer",
      name: "Open & Focus Marginalia Explorer",
      hotkeys: [{ modifiers: ["Alt"], key: "e" }],
      // Alt+E por defecto (Explorer)
      callback: async () => {
        let leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length === 0) {
          const rightLeaf = this.app.workspace.getRightLeaf(false);
          if (rightLeaf) {
            await rightLeaf.setViewState({ type: CORNELL_VIEW_TYPE, active: true });
          }
          leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        }
        this.app.workspace.revealLeaf(leaves[0]);
        setTimeout(() => {
          const view = leaves[0].view;
          const firstItem = view.containerEl.querySelector(".cornell-sidebar-item, .cornell-pinboard-item");
          if (firstItem) firstItem.focus();
        }, 100);
      }
    });
    this.addCommand({
      id: "undo-last-stitch",
      name: "Undo Last Action (Stitch/Group)",
      hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "z" }],
      callback: async () => {
        if (!this.lastStitchAction || this.lastStitchAction.length === 0) {
          new import_obsidian10.Notice("\u26A0\uFE0F No recent action to undo.");
          return;
        }
        new import_obsidian10.Notice("\u23EA Undoing last action...");
        for (const record of this.lastStitchAction) {
          await this.app.vault.process(record.file, (data) => {
            const lines = data.split("\n");
            if (record.line >= 0 && record.line < lines.length) {
              lines[record.line] = lines[record.line].replace(record.newRaw, record.oldRaw);
            }
            return lines.join("\n");
          });
        }
        this.lastStitchAction = null;
        new import_obsidian10.Notice("\u2705 Action undone successfully!");
        this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((l) => {
          if (l.view instanceof CornellNotesView) l.view.scanNotes();
        });
      }
    });
    this.addCommand({
      id: "cornell-mass-stitch",
      name: "Execute Mass Stitch (Keyboard Mode)",
      hotkeys: [{ modifiers: ["Alt"], key: "s" }],
      // Alt + S por defecto
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          if (view.selectedForStitch.length < 2) {
            new import_obsidian10.Notice("\u26A0\uFE0F Select at least 2 marginalias using Spacebar first.");
            return;
          }
          const targets = [view.selectedForStitch[view.selectedForStitch.length - 1]];
          const sources = view.selectedForStitch.slice(0, -1);
          if (this.settings.enableSemanticStitching) {
            new SemanticStitchModal(this.app, "Selected Notes", targets[0].file.basename, (reason) => {
              view.executeMassStitch(sources, targets, reason).then(() => {
                view.selectedForStitch = [];
                view.applyFiltersAndRender();
              });
            }).open();
          } else {
            view.executeMassStitch(sources, targets).then(() => {
              view.selectedForStitch = [];
              view.applyFiltersAndRender();
            });
          }
        } else {
          new import_obsidian10.Notice("Open the Marginalia Explorer first.");
        }
      }
    });
    this.addCommand({
      id: "cornell-refresh-explorer",
      name: "Refresh Explorer",
      hotkeys: [{ modifiers: ["Alt"], key: "r" }],
      // Alt+R por defecto
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          view.scanNotes();
          new import_obsidian10.Notice("Marginalias refreshed!");
        }
      }
    });
    this.addCommand({
      id: "cornell-search-explorer",
      name: "Focus Search Bar",
      hotkeys: [{ modifiers: ["Alt"], key: "f" }],
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          const searchInput = view.containerEl.querySelector(".cornell-search-bar");
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        } else {
          new import_obsidian10.Notice("Open the Marginalia Explorer first.");
        }
      }
    });
    this.addCommand({
      id: "cornell-focus-pinboard-input",
      name: "Pinboard: Focus Add Text Input",
      hotkeys: [{ modifiers: ["Alt"], key: "a" }],
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          if (view.currentTab !== "pinboard") {
            view.currentTab = "pinboard";
            view.renderUI();
            view.applyFiltersAndRender();
          }
          setTimeout(() => {
            const input = view.containerEl.querySelector("textarea.cornell-qc-textarea");
            if (input) input.focus();
          }, 50);
        } else {
          new import_obsidian10.Notice("Open the Marginalia Explorer first.");
        }
      }
    });
    this.addCommand({
      id: "cornell-focus-omnicapture-input",
      name: "Focus Omni-Capture Input (Sidebar)",
      hotkeys: [{ modifiers: ["Alt"], key: "c" }],
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          if (view.currentTab === "pinboard") {
            view.currentTab = "current";
            view.renderUI();
            view.scanNotes();
          }
          setTimeout(() => {
            const input = view.containerEl.querySelector("textarea.cornell-qc-textarea");
            if (input) input.focus();
          }, 50);
        } else {
          new import_obsidian10.Notice("Open the Marginalia Explorer first.");
        }
      }
    });
    ["Current", "Vault", "Threads", "Board"].forEach((tabName, index) => {
      this.addCommand({
        id: `cornell-switch-tab-${tabName.toLowerCase()}`,
        name: `Switch to Tab: ${tabName}`,
        hotkeys: [{ modifiers: ["Alt"], key: (index + 1).toString() }],
        // Alt+1, 2, 3, 4
        callback: () => {
          const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
          if (leaves.length > 0) {
            const view = leaves[0].view;
            const elements = Array.from(view.containerEl.querySelectorAll("div, button"));
            const tabButton = elements.find((el) => {
              var _a;
              const text = ((_a = el.textContent) == null ? void 0 : _a.trim().toLowerCase()) || "";
              return text.endsWith(tabName.toLowerCase()) && el.children.length <= 2;
            });
            if (tabButton) {
              tabButton.click();
              setTimeout(() => {
                const firstItem = view.containerEl.querySelector(".cornell-sidebar-item, .cornell-pinboard-item");
                if (firstItem) firstItem.focus();
              }, 100);
            } else {
              new import_obsidian10.Notice(`\u26A0\uFE0F Could not find the ${tabName} tab.`);
            }
          } else {
            new import_obsidian10.Notice("Open the Marginalia Explorer first.");
          }
        }
      });
    });
    this.addCommand({
      id: "open-doodle-canvas",
      name: "Draw a Doodle (Margin Image)",
      editorCallback: (editor) => {
        new DoodleModal(this.app, editor).open();
      }
    });
    this.addCommand({
      id: "generate-flashcards-sr",
      name: "Flashcards Generation (Spaced Repetition)",
      editorCallback: (editor, view) => {
        this.generateFlashcards(editor);
      }
    });
    this.addCommand({
      id: "toggle-reading-view-marginalia",
      name: "Toggle Marginalia in Reading View",
      callback: async () => {
        this.settings.enableReadingView = !this.settings.enableReadingView;
        await this.saveSettings();
        const statusMessage = this.settings.enableReadingView ? "ON \u{1F4D6}" : "OFF \u{1F6AB}";
        new import_obsidian10.Notice(`Reading View Marginalia: ${statusMessage}
(Switch tabs or refresh to see the changes)`);
      }
    });
    this.addCommand({
      id: "prepare-pdf-print",
      name: "Prepare Marginalia for PDF Print",
      editorCallback: (editor) => {
        this.prepareForPrint(editor);
      }
    });
    this.addCommand({
      id: "restore-pdf-print",
      name: "Restore Marginalia after PDF Print",
      editorCallback: (editor) => {
        this.restoreFromPrint(editor);
      }
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor, view) => {
        menu.addItem((item) => {
          item.setTitle("Insert Margin Note").setIcon("quote-glyph").setSection("insert").onClick(() => {
            const selection = editor.getSelection();
            if (selection) {
              editor.replaceSelection(`%%> ${selection} %%`);
            } else {
              editor.replaceSelection(`%%>  %%`);
              const cursor = editor.getCursor();
              editor.setCursor({ line: cursor.line, ch: cursor.ch - 3 });
            }
          });
        });
        menu.addItem((item) => {
          item.setTitle("Omni-Capture Idea").setIcon("zap").setSection("insert").onClick(() => {
            new OmniCaptureModal(this.app, this).open();
          });
        });
        menu.addItem((item) => {
          item.setTitle("Draw Margin Doodle").setIcon("pencil").setSection("insert").onClick(() => {
            new DoodleModal(this.app, editor).open();
          });
        });
        menu.addItem((item) => {
          item.setTitle("Insert Cornell Block").setIcon("columns").setSection("insert").onClick(() => {
            const selection = editor.getSelection();
            const startPos = editor.getCursor("from");
            if (selection) {
              editor.replaceSelection(`\`\`\`cornell
%%>  %%
${selection}
\`\`\``);
            } else {
              editor.replaceSelection(`\`\`\`cornell
%%>  %%

\`\`\``);
            }
            editor.setCursor({ line: startPos.line + 1, ch: 4 });
          });
        });
      })
    );
    this.registerMarkdownCodeBlockProcessor("cornell", async (source, el, ctx) => {
      if (!this.settings.enableReadingView) return;
      const regex = UNIVERSAL_MARGINALIA_REGEX;
      const matches = [...source.matchAll(regex)];
      const cleanSource = source.replace(regex, (match, direction, noteContent) => {
        if (!this.settings.visualHelper) return "";
        let tempNoteContent = noteContent.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
        if (tempNoteContent.includes(";;")) {
          tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
        }
        let matchedColor = "var(--text-accent)";
        for (const tag of this.settings.tags) {
          if (tempNoteContent.startsWith(tag.prefix)) {
            matchedColor = tag.color;
            break;
          }
        }
        return `<span class="cornell-visual-anchor" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${matchedColor}; margin-right: 4px; vertical-align: middle;"></span>`;
      }).trim();
      const wrapper = el.createDiv({ cls: "cornell-reading-container cornell-editorial-wrapper" });
      wrapper.style.position = "relative";
      wrapper.style.width = "100%";
      el.style.overflow = "visible";
      el.style.contain = "none";
      setTimeout(() => {
        if (!el.closest(".markdown-source-view")) return;
        let parent = el.parentElement;
        while (parent && !parent.classList.contains("cm-content")) {
          parent.style.setProperty("overflow", "visible", "important");
          parent.style.setProperty("contain", "none", "important");
          if (parent.classList.contains("cm-line") || parent.classList.contains("cm-embed-block")) {
            parent.style.setProperty("z-index", "99", "important");
            parent.style.setProperty("position", "relative", "important");
          }
          parent = parent.parentElement;
        }
      }, 50);
      const contentCol = wrapper.createDiv({ cls: "cornell-editorial-content" });
      await import_obsidian10.MarkdownRenderer.renderMarkdown(cleanSource, contentCol, ctx.sourcePath, this);
      if (matches.length > 0) {
        const isMainLeft = this.settings.alignment === "left";
        const firstDirection = matches[0][1];
        const isNoteLeft = isMainLeft && firstDirection === ">" || !isMainLeft && firstDirection === "<";
        let colClass = isNoteLeft ? "cornell-col-left" : "cornell-col-right";
        let column = wrapper.createDiv({ cls: colClass });
        column.style.setProperty("position", "absolute", "important");
        column.style.setProperty("top", "0", "important");
        column.style.setProperty("bottom", "0", "important");
        column.style.setProperty("width", "var(--cornell-width)", "important");
        column.style.setProperty("display", "flex", "important");
        column.style.setProperty("flex-direction", "column", "important");
        column.style.setProperty("overflow-y", "auto", "important");
        column.style.setProperty("scrollbar-width", "none", "important");
        column.style.cssText += "::-webkit-scrollbar { display: none; }";
        if (isNoteLeft) {
          column.style.setProperty("left", "var(--cornell-margin-out)", "important");
          column.style.removeProperty("right");
        } else {
          column.style.setProperty("right", "var(--cornell-margin-out)", "important");
          column.style.removeProperty("left");
        }
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const direction = match[1];
          let noteContent = match[2];
          let tempNoteContent = noteContent.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
          const isFlashcard = tempNoteContent.includes(";;");
          if (isFlashcard) {
            tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
            wrapper.classList.add("cornell-flashcard-target");
          }
          let matchedColor = null;
          let finalNoteText = tempNoteContent;
          for (const tag of this.settings.tags) {
            if (finalNoteText.startsWith(tag.prefix)) {
              matchedColor = tag.color;
              finalNoteText = finalNoteText.substring(tag.prefix.length).trim();
              break;
            }
          }
          let finalRenderText = finalNoteText;
          const imagesToRender = [];
          const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
          const imgMatches = Array.from(finalRenderText.matchAll(imgRegex));
          imgMatches.forEach((m) => imagesToRender.push(m[1]));
          finalRenderText = finalRenderText.replace(imgRegex, "").trim();
          const threadLinks = [];
          const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
          const linkMatches = Array.from(finalRenderText.matchAll(linkRegex));
          linkMatches.forEach((m) => threadLinks.push(m[1]));
          finalRenderText = finalRenderText.replace(linkRegex, "").trim();
          const marginDiv = document.createElement("div");
          marginDiv.className = "cm-cornell-margin reading-mode-margin cornell-editorial-margin";
          if (isFlashcard) {
            marginDiv.classList.add("is-flashcard");
          } else {
            marginDiv.classList.add("is-explanatory");
          }
          if (matchedColor) {
            marginDiv.style.setProperty("border-color", matchedColor, "important");
            marginDiv.style.setProperty("color", matchedColor, "important");
          }
          import_obsidian10.MarkdownRenderer.render(this.app, finalRenderText, marginDiv, ctx.sourcePath, this);
          if (imagesToRender.length > 0) {
            imagesToRender.forEach((imgName) => {
              const cleanName = imgName.split("|")[0];
              const file = this.app.metadataCache.getFirstLinkpathDest(cleanName, ctx.sourcePath);
              if (file) {
                const imgSrc = this.app.vault.getResourcePath(file);
                marginDiv.createEl("img", { attr: { src: imgSrc } });
              }
            });
          }
          if (threadLinks.length > 0) {
            const threadContainer = marginDiv.createDiv({ cls: "cornell-thread-container" });
            threadLinks.forEach((linkTarget) => {
              const btn = threadContainer.createEl("button", { cls: "cornell-thread-btn", title: `Follow thread: ${linkTarget}` });
              btn.innerHTML = "\u{1F517}";
              btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.app.workspace.openLinkText(linkTarget, ctx.sourcePath, true);
              };
            });
          }
          if (isMainLeft && direction === "<" || !isMainLeft && direction === ">") {
            marginDiv.classList.add("cornell-reverse-align");
          }
          marginDiv.style.setProperty("position", "relative", "important");
          marginDiv.style.setProperty("box-sizing", "border-box", "important");
          marginDiv.style.setProperty("margin", "0", "important");
          if (i < matches.length - 1) {
            marginDiv.style.setProperty("padding-bottom", "20px", "important");
          }
          if (i === matches.length - 1) {
            marginDiv.style.setProperty("flex-grow", "1", "important");
          } else {
            marginDiv.style.setProperty("flex-grow", "0", "important");
          }
          column.appendChild(marginDiv);
        }
      }
    });
    this.registerMarkdownPostProcessor((el, ctx) => {
      var _a;
      if (!this.settings.enableReadingView) return;
      if (el.classList.contains("block-language-cornell") || el.querySelector(".cornell-editorial-wrapper")) {
        return;
      }
      const isolateRegex = /(^|<br>)((?:(?!<br>).)*?%%\s*[\\\/]?[><][\s\S]*?;;[\s\S]*?%%(?:(?!<br>).)*)/g;
      if (isolateRegex.test(el.innerHTML)) {
        el.innerHTML = el.innerHTML.replace(isolateRegex, (match, br, content) => {
          return `${br}<span class="cornell-reading-flashcard-target" style="display:block; width:100%;">${content}</span>`;
        });
      }
      const htmlRegex = /%%\s*[\\\/]?([><])([\s\S]*?)%%/g;
      if (htmlRegex.test(el.innerHTML)) {
        el.innerHTML = el.innerHTML.replace(htmlRegex, (match, direction, noteContent) => {
          if (!this.settings.visualHelper) return "";
          let tempContent = noteContent.replace(/<[^>]*>?/gm, "");
          tempContent = tempContent.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
          if (tempContent.includes(";;")) tempContent = tempContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
          let matchedColor = "var(--text-accent)";
          for (const tag of this.settings.tags) {
            if (tempContent.startsWith(tag.prefix)) {
              matchedColor = tag.color;
              break;
            }
          }
          return `<span class="cornell-visual-anchor" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${matchedColor}; margin-right: 4px; vertical-align: middle;"></span>`;
        });
      }
      const sectionInfo = ctx.getSectionInfo(el);
      if (!sectionInfo) return;
      const lines = sectionInfo.text.split("\n");
      const sectionLines = lines.slice(sectionInfo.lineStart, sectionInfo.lineEnd + 1);
      const firstLine = (_a = sectionLines[0]) == null ? void 0 : _a.trim();
      if (firstLine && (firstLine.startsWith("```") || firstLine.startsWith("~~~"))) {
        return;
      }
      const listItems = el.querySelectorAll("li");
      let liIndex = 0;
      let currentTarget = el;
      sectionLines.forEach((line) => {
        const isListItemLine = /^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line);
        if (isListItemLine) {
          if (listItems[liIndex]) {
            currentTarget = listItems[liIndex];
          }
          liIndex++;
        }
        const regex = /%%\s*[\\\/]?([><])(.*?)%%/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          const direction = match[1];
          let noteContent = match[2];
          let tempNoteContent = noteContent.replace(/\s*\^([a-zA-Z0-9]+)\s*$/, "").trim();
          const isFlashcard = tempNoteContent.includes(";;");
          let matchedColor = null;
          let finalNoteText = tempNoteContent;
          for (const tag of this.settings.tags) {
            if (finalNoteText.startsWith(tag.prefix)) {
              matchedColor = tag.color;
              finalNoteText = finalNoteText.substring(tag.prefix.length).trim();
              break;
            }
          }
          let finalRenderText = finalNoteText;
          const imagesToRender = [];
          const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
          const imgMatches = Array.from(finalRenderText.matchAll(imgRegex));
          imgMatches.forEach((m) => imagesToRender.push(m[1]));
          finalRenderText = finalRenderText.replace(imgRegex, "").trim();
          const threadLinks = [];
          const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
          const linkMatches = Array.from(finalRenderText.matchAll(linkRegex));
          linkMatches.forEach((m) => threadLinks.push(m[1]));
          finalRenderText = finalRenderText.replace(linkRegex, "").trim();
          const marginDiv = document.createElement("div");
          marginDiv.className = "cm-cornell-margin reading-mode-margin";
          if (isFlashcard) {
            marginDiv.classList.add("is-flashcard");
            let textWithoutMarginalia = line.replace(/%%\s*[\\\/]?[><](.*?)%%/g, "").replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
            const isCalloutLine = textWithoutMarginalia.startsWith(">");
            let cleanTextForStandalone = textWithoutMarginalia;
            if (isCalloutLine) cleanTextForStandalone = cleanTextForStandalone.replace(/^>\s*/, "").trim();
            const isStandalone = cleanTextForStandalone === "";
            let targetToBlur = null;
            if (!isStandalone) {
              if (isCalloutLine) {
                const calloutParent = currentTarget.closest(".callout");
                if (calloutParent) targetToBlur = calloutParent;
              }
            } else {
              let nextEl = currentTarget.nextElementSibling;
              if (!nextEl && currentTarget.parentElement) {
                nextEl = currentTarget.parentElement.nextElementSibling;
              }
              if (nextEl) targetToBlur = nextEl;
            }
            if (targetToBlur) {
              targetToBlur.classList.add("cornell-flashcard-target");
            }
          } else {
            marginDiv.classList.add("is-explanatory");
          }
          if (matchedColor) {
            marginDiv.style.setProperty("border-color", matchedColor, "important");
            marginDiv.style.setProperty("color", matchedColor, "important");
          }
          import_obsidian10.MarkdownRenderer.render(this.app, finalRenderText, marginDiv, ctx.sourcePath, this);
          if (imagesToRender.length > 0) {
            imagesToRender.forEach((imgName) => {
              const cleanName = imgName.split("|")[0];
              const file = this.app.metadataCache.getFirstLinkpathDest(cleanName, ctx.sourcePath);
              if (file) {
                const imgSrc = this.app.vault.getResourcePath(file);
                marginDiv.createEl("img", { attr: { src: imgSrc } });
              }
            });
          }
          if (threadLinks.length > 0) {
            const threadContainer = marginDiv.createDiv({ cls: "cornell-thread-container" });
            threadLinks.forEach((linkTarget) => {
              const btn = threadContainer.createEl("button", { cls: "cornell-thread-btn", title: `Follow thread: ${linkTarget}` });
              btn.innerHTML = "\u{1F517}";
              btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.app.workspace.openLinkText(linkTarget, ctx.sourcePath, true);
              };
              btn.onmouseover = (event) => {
                this.app.workspace.trigger("hover-link", {
                  event,
                  source: "cornell-marginalia",
                  hoverParent: threadContainer,
                  targetEl: btn,
                  linktext: linkTarget,
                  sourcePath: ctx.sourcePath
                });
              };
            });
          }
          currentTarget.classList.add("cornell-reading-container");
          const isMainLeft = this.settings.alignment === "left";
          const isNoteLeft = isMainLeft && direction === ">" || !isMainLeft && direction === "<";
          marginDiv.style.setProperty("position", "relative", "important");
          marginDiv.style.setProperty("width", "100%", "important");
          marginDiv.style.setProperty("left", "auto", "important");
          marginDiv.style.setProperty("right", "auto", "important");
          marginDiv.style.setProperty("margin-top", "0", "important");
          marginDiv.style.setProperty("margin-bottom", "12px", "important");
          let colClass = isNoteLeft ? "cornell-col-left" : "cornell-col-right";
          let column = Array.from(currentTarget.children).find((c) => c.classList.contains(colClass));
          if (!column) {
            column = document.createElement("div");
            column.className = colClass;
            column.style.setProperty("position", "absolute", "important");
            column.style.setProperty("top", "0", "important");
            column.style.setProperty("width", "var(--cornell-width)", "important");
            if (isNoteLeft) {
              column.style.setProperty("left", "var(--cornell-margin-out)", "important");
              column.style.removeProperty("right");
            } else {
              column.style.setProperty("right", "var(--cornell-margin-out)", "important");
              column.style.removeProperty("left");
            }
            currentTarget.appendChild(column);
          }
          if (isMainLeft && direction === "<" || !isMainLeft && direction === ">") {
            marginDiv.classList.add("cornell-reverse-align");
          }
          column.appendChild(marginDiv);
          if (isFlashcard) {
            currentTarget.classList.add("cornell-flashcard-target");
            let tempTextForCallout = line.replace(/%%\s*[\\\/]?[><](.*?)%%/g, "").replace(/\^[a-zA-Z0-9_-]+$/, "").trim();
            if (tempTextForCallout === "") {
              setTimeout(() => {
                let nextEl = currentTarget.nextElementSibling;
                if (nextEl && (nextEl.classList.contains("callout") || nextEl.querySelector(".callout"))) {
                  nextEl.classList.add("cornell-flashcard-target");
                } else if (!nextEl && currentTarget.parentElement) {
                  let parentNext = currentTarget.parentElement.nextElementSibling;
                  if (parentNext && (parentNext.classList.contains("callout") || parentNext.querySelector(".callout"))) {
                    parentNext.classList.add("cornell-flashcard-target");
                  }
                }
              }, 50);
            }
          }
          setTimeout(() => {
            const colLeft = Array.from(currentTarget.children).find((c) => c.classList.contains("cornell-col-left"));
            const colRight = Array.from(currentTarget.children).find((c) => c.classList.contains("cornell-col-right"));
            let maxH = 0;
            if (colLeft) maxH = Math.max(maxH, colLeft.offsetHeight);
            if (colRight) maxH = Math.max(maxH, colRight.offsetHeight);
            if (maxH > 0) {
              currentTarget.style.minHeight = `${maxH + 10}px`;
            }
          }, 100);
        }
      });
    });
    this.registerMarkdownPostProcessor((el, ctx) => {
      const printMargins = el.querySelectorAll(".cornell-print-margin");
      printMargins.forEach((margin) => {
        const parent = margin.closest("p, li, blockquote");
        if (parent) {
          const direction = margin.getAttribute("data-direction");
          if (direction === ">") {
            parent.classList.add("cornell-print-parent-left");
          } else if (direction === "<") {
            parent.classList.add("cornell-print-parent-right");
          }
        }
      });
    });
  }
  // 🧠 PROCESADOR DE TEMPLATER EN RAM
  async processTemplaterDrop(text, pos, view) {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
    let safeText = sanitizeForTemplater(text);
    let finalContent = safeText;
    if (activeView && activeView.file) {
      const templaterPlugin = this.app.plugins.plugins["templater-obsidian"];
      if (templaterPlugin && templaterPlugin.templater) {
        try {
          finalContent = await templaterPlugin.templater.parse_template(
            { target_file: activeView.file, run_mode: 4 },
            safeText
          );
        } catch (err) {
          console.warn("Cornell Marginalia: Fallo al compilar Templater", err);
        }
      }
    }
    view.dispatch({
      changes: { from: pos, insert: finalContent }
    });
    view.dispatch({
      selection: { anchor: pos + finalContent.length }
    });
    view.focus();
  }
  onunload() {
    console.log("Descargando Cornell Marginalia...");
    if (this.settings.addons && this.settings.addons["super-doodle"]) {
      this.superDoodleAddon.unload();
    }
  }
  toggleActiveRecall() {
    this.activeRecallMode = !this.activeRecallMode;
    new import_obsidian10.Notice(this.activeRecallMode ? "Active Recall Mode: ON \u{1F648}" : "Active Recall Mode: OFF \u{1F441}\uFE0F");
    if (this.activeRecallMode) {
      this.ribbonIcon.setAttribute("aria-label", "Disable Active Recall");
      document.body.classList.add("cornell-active-recall-on");
    } else {
      this.ribbonIcon.setAttribute("aria-label", "Enable Active Recall");
      document.body.classList.remove("cornell-active-recall-on");
    }
    this.app.workspace.updateOptions();
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: CORNELL_VIEW_TYPE, active: true });
      }
    }
    if (leaf) workspace.revealLeaf(leaf);
  }
  generateFlashcards(editor) {
    const content = editor.getValue();
    const headerText = "### Flashcards";
    const lines = content.split("\n");
    const foundFlashcards = /* @__PURE__ */ new Set();
    const regex = /^(.*?)\s*%%[><]\s*(.*?);;/;
    lines.forEach((line) => {
      const match = line.match(regex);
      if (match) {
        const answer = match[1].trim();
        const question = match[2].trim();
        if (answer && question) {
          foundFlashcards.add(`${question} :: ${answer}`);
        }
      }
    });
    if (foundFlashcards.size === 0) {
      new import_obsidian10.Notice("No active recall notes (ending in ;;) found.");
      return;
    }
    let headerLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === headerText) {
        headerLineIndex = i;
        break;
      }
    }
    let newFlashcards = [];
    if (headerLineIndex !== -1) {
      const existingContent = lines.slice(headerLineIndex + 1).join("\n");
      foundFlashcards.forEach((card) => {
        if (!existingContent.includes(card)) {
          newFlashcards.push(card);
        }
      });
      if (newFlashcards.length > 0) {
        const textToAppend = "\n" + newFlashcards.join("\n");
        const lastLine = editor.lineCount();
        editor.replaceRange(textToAppend, { line: lastLine, ch: 0 });
        new import_obsidian10.Notice(`Added ${newFlashcards.length} new flashcards.`);
      } else {
        new import_obsidian10.Notice("All flashcards are already up to date!");
      }
    } else {
      newFlashcards = Array.from(foundFlashcards);
      const textToAppend = `

${headerText}
${newFlashcards.join("\n")}`;
      const lastLine = editor.lineCount();
      editor.replaceRange(textToAppend, { line: lastLine, ch: 0 });
      new import_obsidian10.Notice(`Generated section with ${newFlashcards.length} flashcards.`);
    }
  }
  updateStyles() {
    let widthValue = `${this.settings.marginWidth}%`;
    if (this.settings.adaptiveMode) {
      widthValue = `clamp(150px, calc((100vw - var(--file-line-width, 700px)) / 2 - 40px), 400px)`;
    }
    document.body.style.setProperty("--cornell-width", widthValue);
    document.body.style.setProperty("--cornell-offset", `${this.settings.marginOffset}px`);
    document.body.style.setProperty("--cornell-margin-out", `calc(-1 * var(--cornell-width) - var(--cornell-offset))`);
    document.body.style.setProperty("--cornell-font-size", this.settings.fontSize);
    document.body.style.setProperty("--cornell-font-family", this.settings.fontFamily);
    if (this.settings.alignment === "left") {
      document.body.style.setProperty("--cornell-float", "left");
      document.body.style.setProperty("--cornell-margin-left", "var(--cornell-margin-out)");
      document.body.style.setProperty("--cornell-margin-right", "15px");
      document.body.style.setProperty("--cornell-border-r", "2px solid var(--text-accent)");
      document.body.style.setProperty("--cornell-border-l", "none");
      document.body.style.setProperty("--cornell-text-align", "right");
      document.body.style.setProperty("--cornell-float-rev", "right");
      document.body.style.setProperty("--cornell-margin-left-rev", "15px");
      document.body.style.setProperty("--cornell-margin-right-rev", "var(--cornell-margin-out)");
    } else {
      document.body.style.setProperty("--cornell-float", "right");
      document.body.style.setProperty("--cornell-margin-right", "var(--cornell-margin-out)");
      document.body.style.setProperty("--cornell-margin-left", "15px");
      document.body.style.setProperty("--cornell-border-l", "2px solid var(--text-accent)");
      document.body.style.setProperty("--cornell-border-r", "none");
      document.body.style.setProperty("--cornell-text-align", "left");
      document.body.style.setProperty("--cornell-float-rev", "left");
      document.body.style.setProperty("--cornell-margin-right-rev", "15px");
      document.body.style.setProperty("--cornell-margin-left-rev", "var(--cornell-margin-out)");
    }
    let dynamicStyle = document.getElementById("cornell-dynamic-styles");
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = "cornell-dynamic-styles";
      document.head.appendChild(dynamicStyle);
    }
    if (this.settings.responsiveMarginalia) {
      document.body.classList.add("cornell-responsive-mode");
      dynamicStyle.innerText = `
                @container editor-container (max-width: ${this.settings.responsiveThreshold}px) {
                    body.cornell-responsive-mode .cm-cornell-margin,
                    body.cornell-responsive-mode .reading-mode-margin {
                        position: relative !important;
                        width: 100% !important;
                        float: none !important;
                        clear: both !important;
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        left: auto !important;
                        right: auto !important;
                        display: block !important;
                        margin-top: 5px !important;
                        margin-bottom: 15px !important;
                        border-left: 4px solid currentColor !important; 
                        border-right: none !important;
                        text-align: left !important;
                        box-sizing: border-box !important; 
                    }
                    body.cornell-responsive-mode .cornell-col-left,
                    body.cornell-responsive-mode .cornell-col-right {
                        position: relative !important;
                        width: 100% !important;
                        left: auto !important;
                        right: auto !important;
                        display: block !important;
                    }
                    body.cornell-responsive-mode .reading-mode-margin.cornell-reverse-align {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        border-left: 4px solid currentColor !important;
                        border-right: none !important;
                        text-align: left !important;
                    }
                }
            `;
    } else {
      document.body.classList.remove("cornell-responsive-mode");
      dynamicStyle.innerText = "";
    }
    if (this.settings.blurExplanatoryMarginalia) {
      document.body.classList.add("cornell-blur-explanatory");
    } else {
      document.body.classList.remove("cornell-blur-explanatory");
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async prepareForPrint(editor) {
    let content = editor.getValue();
    let modified = false;
    const activeFile = this.app.workspace.getActiveFile();
    const sourcePath = activeFile ? activeFile.path : "";
    const blockRegex = /```cornell\n([\s\S]*?)```/g;
    content = content.replace(blockRegex, (match, blockContent) => {
      modified = true;
      const safeOriginal = btoa(encodeURIComponent(match));
      const uniqueId = "cornell-block-" + Math.random().toString(36).substring(2, 9);
      const noteRegex = /%%([><])(.*?)%%/g;
      let marginaliasHTML = "";
      let cleanText = blockContent;
      let firstColor = null;
      let noteMatch;
      while ((noteMatch = noteRegex.exec(cleanText)) !== null) {
        const fullNote = noteMatch[0];
        const direction = noteMatch[1];
        let noteContent = noteMatch[2];
        let tempNoteContent = noteContent.replace(/\s*[\^~][a-zA-Z0-9-]+\s*/g, " ").trim();
        const isFlashcard = tempNoteContent.includes(";;");
        if (isFlashcard) {
          tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
        }
        let matchedColor = "var(--text-accent)";
        let noteText = tempNoteContent;
        for (const tag of this.settings.tags) {
          if (noteText.startsWith(tag.prefix)) {
            matchedColor = tag.color;
            noteText = noteText.substring(tag.prefix.length).trim();
            break;
          }
        }
        if (!firstColor) firstColor = matchedColor;
        const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
        let imgHtml = "";
        noteText = noteText.replace(imgRegex, (imgMatch, imgName) => {
          const cleanName = imgName.split("|")[0];
          const file = this.app.metadataCache.getFirstLinkpathDest(cleanName, sourcePath);
          if (file) {
            const imgSrc = this.app.vault.getResourcePath(file);
            imgHtml += `<img src="${imgSrc}" style="max-width: 100%; border-radius: 4px; margin-top: 5px; display: block;" />`;
          }
          return "";
        });
        const compassRegex = /\[(North|South|East|West)::\s*\[\[([\s\S]*?)\]\]\]/gi;
        noteText = noteText.replace(compassRegex, "").trim();
        const threadRegex = /(?<!!)\[\[(.*?)\]\]/g;
        noteText = noteText.replace(threadRegex, "").trim();
        const stitchRegex = /\{stitch:\s*[^}]+\}/g;
        noteText = noteText.replace(stitchRegex, "").trim();
        const isMainLeft2 = this.settings.alignment === "left";
        const textAlign = isMainLeft2 ? "right" : "left";
        marginaliasHTML += `<div style="margin-bottom: 15px; font-size: 0.85em; opacity: 0.9; color: ${matchedColor}; text-align: ${textAlign};">${noteText}${imgHtml}</div>
`;
        cleanText = cleanText.replace(fullNote, "");
        noteRegex.lastIndex = 0;
      }
      cleanText = cleanText.replace(/[ \t]*\^[a-zA-Z0-9-]{4,}\s*$/gm, "");
      const isMainLeft = this.settings.alignment === "left";
      const widthVal = `var(--cornell-width, 25%)`;
      const blockLineColor = firstColor || "var(--text-accent)";
      const borderSide = isMainLeft ? "border-right" : "border-left";
      const paddingSide = isMainLeft ? "padding-right" : "padding-left";
      const paddingRightSide = isMainLeft ? "padding-left" : "padding-right";
      const leftColHtml = `
<div class="cornell-print-left" style="width: ${widthVal}; flex-shrink: 0; ${borderSide}: 2px solid ${blockLineColor}; ${paddingSide}: 15px; display: flex; flex-direction: column;">
${marginaliasHTML}
</div>`;
      const rightColHtml = `
<div class="cornell-print-right" style="flex-grow: 1; min-width: 0; ${paddingRightSide}: 15px;">

${cleanText.trim()}

</div>`;
      const firstCol = isMainLeft ? leftColHtml : rightColHtml;
      const secondCol = isMainLeft ? rightColHtml : leftColHtml;
      return `
<div id="${uniqueId}" class="cornell-print-block" data-original="${safeOriginal}" style="display: flex; flex-direction: row; align-items: stretch; margin-bottom: 2em; page-break-inside: avoid; break-inside: avoid; width: 100%;">
<style>
#${uniqueId} .cornell-print-right > p:first-child,
#${uniqueId} .cornell-print-right > ul:first-child,
#${uniqueId} .cornell-print-right > ol:first-child,
#${uniqueId} .cornell-print-right > div:first-child > p:first-child,
#${uniqueId} .cornell-print-right > div:first-child > ul:first-child { margin-top: 0 !important; padding-top: 0 !important; }
#${uniqueId} .cornell-print-left > div:first-child { margin-top: 0 !important; padding-top: 0 !important; }
</style>
${firstCol}
${secondCol}
</div>
<div class="cornell-block-end" style="display:none;"></div>`.trim();
    });
    const docLines = content.split("\n");
    const finalLines = docLines.map((line) => {
      if (line.includes("cornell-print-block")) return line;
      const inlineRegex = /%%\s*[\\\/]?([><])(.*?)%%/g;
      let match;
      let marginaliasToInject = "";
      let cleanLine = line;
      let lineModified = false;
      while ((match = inlineRegex.exec(cleanLine)) !== null) {
        modified = true;
        lineModified = true;
        const fullMatch = match[0];
        const direction = match[1];
        let noteText = match[2].trim();
        const safeOriginal = btoa(encodeURIComponent(fullMatch));
        let tempNoteContent = noteText.replace(/\s*[\^~][a-zA-Z0-9-]+\s*/g, " ").trim();
        const isFlashcard = tempNoteContent.includes(";;");
        if (isFlashcard) {
          tempNoteContent = tempNoteContent.replace(";;", "").replace(/\s{2,}/g, " ").trim();
        }
        let matchedColor = "var(--text-accent)";
        noteText = tempNoteContent;
        for (const tag of this.settings.tags) {
          if (noteText.startsWith(tag.prefix)) {
            matchedColor = tag.color;
            noteText = noteText.substring(tag.prefix.length).trim();
            break;
          }
        }
        const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
        let imgHtml = "";
        noteText = noteText.replace(imgRegex, (imgMatch, imgName) => {
          const cleanName = imgName.split("|")[0];
          const file = this.app.metadataCache.getFirstLinkpathDest(cleanName, sourcePath);
          if (file) {
            const imgSrc = this.app.vault.getResourcePath(file);
            imgHtml += `<img src="${imgSrc}" style="max-width: 100%; border-radius: 4px; margin-top: 5px; display: block;" />`;
          }
          return "";
        });
        const compassRegex = /\[(North|South|East|West)::\s*\[\[([\s\S]*?)\]\]\]/gi;
        noteText = noteText.replace(compassRegex, "").trim();
        const threadRegex = /(?<!!)\[\[(.*?)\]\]/g;
        noteText = noteText.replace(threadRegex, "").trim();
        const stitchRegex = /\{stitch:\s*[^}]+\}/g;
        noteText = noteText.replace(stitchRegex, "").trim();
        const borderStyle = direction === ">" ? `border-right: 3px solid ${matchedColor};` : `border-left: 3px solid ${matchedColor};`;
        marginaliasToInject += `<span class="cornell-print-margin" data-original="${safeOriginal}" data-direction="${direction}" style="${borderStyle} color: ${matchedColor};">${noteText}${imgHtml}</span>`;
        cleanLine = cleanLine.replace(fullMatch, "").trim();
        inlineRegex.lastIndex = 0;
      }
      return lineModified ? marginaliasToInject + " " + cleanLine : line;
    });
    content = finalLines.join("\n");
    if (modified) {
      editor.setValue(content);
      new import_obsidian10.Notice("\u{1F5A8}\uFE0F PDF Print Mode: Ready! (Press Restore after exporting)");
    } else {
      new import_obsidian10.Notice("No marginalias found to prepare.");
    }
  }
  async restoreFromPrint(editor) {
    let content = editor.getValue();
    let modified = false;
    const blockRegex = /<div[^>]*data-original="([^"]+)"[\s\S]*?<div class="cornell-block-end" style="display:none;"><\/div>/g;
    content = content.replace(blockRegex, (match, b64Data) => {
      modified = true;
      return decodeURIComponent(atob(b64Data));
    });
    const inlineRegex = /<span class="cornell-print-margin"[^>]*data-original="([^"]+)"[^>]*>[\s\S]*?<\/span>/g;
    content = content.replace(inlineRegex, (match, b64Data) => {
      modified = true;
      return decodeURIComponent(atob(b64Data));
    });
    if (modified) {
      editor.setValue(content);
      new import_obsidian10.Notice("\u2705 Marginalia restored to original Markdown!");
    } else {
      new import_obsidian10.Notice("\u26A0\uFE0F No print blocks found to restore.");
      if (this.settings.addons && this.settings.addons["zoom-doodle"]) {
        this.zoomDoodleAddon.unload();
      }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CORNELL_VIEW_TYPE,
  CornellNotesView,
  CornellSettingTab,
  OmniCaptureManager,
  OmniDragManager,
  RhizomeView,
  TagSuggester,
  sanitizeAnkiDeckName,
  sanitizeFileName,
  sanitizeForTemplater
});
