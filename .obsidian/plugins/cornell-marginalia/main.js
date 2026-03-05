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
  default: () => CornellMarginalia
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");
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
    this.description = "Transform Zen Doodle into an adjustable-size canvas with panoramic navigation, colors, and adjustable brush size.";
    // Guardamos el método original para restaurarlo después
    this.originalRenderZenDoodle = null;
  }
  load() {
    this.originalRenderZenDoodle = CornellNotesView.prototype.renderZenDoodle;
    const addonInstance = this;
    CornellNotesView.prototype.renderZenDoodle = function(container) {
      const view = this;
      let currentTool = "pen";
      let currentColor = "#000000";
      let currentSize = 4;
      let isDragging = false;
      let startX = 0, startY = 0;
      let scrollLeftStart = 0, scrollTopStart = 0;
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
        var _a;
        if (!view.zenCanvasEl || !view.zenCtx) return;
        const [newW, newH] = e.target.value.split("x").map(Number);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = view.zenCanvasEl.width;
        tempCanvas.height = view.zenCanvasEl.height;
        (_a = tempCanvas.getContext("2d")) == null ? void 0 : _a.drawImage(view.zenCanvasEl, 0, 0);
        view.zenCanvasEl.width = newW;
        view.zenCanvasEl.height = newH;
        view.zenCtx.lineCap = "round";
        view.zenCtx.lineJoin = "round";
        view.zenCtx.lineWidth = currentTool === "eraser" ? currentSize * 3 : currentSize;
        view.zenCtx.strokeStyle = currentColor;
        view.zenCtx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
        view.zenCtx.drawImage(tempCanvas, 0, 0);
        new import_obsidian3.Notice(`\u{1F4D0} Canvas resized to ${newW}x${newH}`);
      };
      const sizeSlider = centerGrp.createEl("input", { type: "range" });
      sizeSlider.min = "1";
      sizeSlider.max = "50";
      sizeSlider.value = "4";
      sizeSlider.style.width = "80px";
      sizeSlider.oninput = (e) => {
        currentSize = parseInt(e.target.value);
        if (currentTool === "pen" && view.zenCtx) view.zenCtx.lineWidth = currentSize;
        else if (currentTool === "eraser" && view.zenCtx) view.zenCtx.lineWidth = currentSize * 3;
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
        cBtn.style.border = c === currentColor ? "2px solid var(--text-normal)" : "2px solid transparent";
        cBtn.onclick = () => {
          currentColor = c;
          currentTool = "pen";
          if (view.zenCtx) {
            view.zenCtx.strokeStyle = currentColor;
            view.zenCtx.globalCompositeOperation = "source-over";
            view.zenCtx.lineWidth = currentSize;
          }
          updateToolUI();
          colorBtns.forEach((btn) => btn.style.border = "2px solid transparent");
          cBtn.style.border = "2px solid var(--text-normal)";
        };
        colorBtns.push(cBtn);
      });
      const rightGrp = topBar.createDiv({ attr: { style: "display:flex; gap:10px;" } });
      const clearBtn = rightGrp.createEl("button", { title: "Clear Canvas" });
      (0, import_obsidian3.setIcon)(clearBtn, "trash-2");
      clearBtn.style.boxShadow = "none";
      clearBtn.onclick = () => {
        if (view.zenCanvasEl && view.zenCtx) {
          view.zenCtx.clearRect(0, 0, view.zenCanvasEl.width, view.zenCanvasEl.height);
        }
      };
      const attachBtn = rightGrp.createEl("button", { text: "\u{1F4CC} Attach to Board", title: "Save and add to Pinboard" });
      attachBtn.onclick = async () => {
        if (!view.zenCanvasEl) return;
        attachBtn.innerText = "\u23F3...";
        const dataUrl = view.zenCanvasEl.toDataURL("image/png");
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
        if (view.zenCtx) view.zenCtx.clearRect(0, 0, view.zenCanvasEl.width, view.zenCanvasEl.height);
        view.applyFiltersAndRender();
      };
      const zapBtn = rightGrp.createEl("button", { text: "\u26A1 Omni-Capture", cls: "mod-cta", title: "Save instantly to Omni-Capture Destination" });
      zapBtn.style.backgroundColor = "var(--interactive-accent)";
      zapBtn.style.color = "var(--text-on-accent)";
      zapBtn.onclick = async () => {
        if (!view.zenCanvasEl) return;
        zapBtn.innerText = "\u23F3 Saving...";
        const dataUrl = view.zenCanvasEl.toDataURL("image/png");
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
          if (view.zenCtx) view.zenCtx.clearRect(0, 0, view.zenCanvasEl.width, view.zenCanvasEl.height);
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
        if (view.zenCanvasEl) view.zenCanvasEl.style.cursor = "crosshair";
        if (currentTool === "hand") {
          handBtn.addClass("mod-cta");
          if (view.zenCanvasEl) view.zenCanvasEl.style.cursor = "grab";
        } else if (currentTool === "pen") {
          penBtn.addClass("mod-cta");
        } else if (currentTool === "eraser") {
          eraserBtn.addClass("mod-cta");
        }
      };
      handBtn.onclick = () => {
        currentTool = "hand";
        updateToolUI();
      };
      penBtn.onclick = () => {
        currentTool = "pen";
        if (view.zenCtx) {
          view.zenCtx.globalCompositeOperation = "source-over";
          view.zenCtx.lineWidth = currentSize;
          view.zenCtx.strokeStyle = currentColor;
        }
        updateToolUI();
      };
      eraserBtn.onclick = () => {
        currentTool = "eraser";
        if (view.zenCtx) {
          view.zenCtx.globalCompositeOperation = "destination-out";
          view.zenCtx.lineWidth = currentSize * 3;
        }
        updateToolUI();
      };
      const scrollWrapper = zenContainer.createDiv();
      scrollWrapper.style.flexGrow = "1";
      scrollWrapper.style.overflow = "auto";
      scrollWrapper.style.border = "2px dashed var(--background-modifier-border)";
      scrollWrapper.style.borderRadius = "8px";
      scrollWrapper.style.backgroundColor = "var(--background-secondary-alt)";
      if (!view.zenCanvasEl) {
        view.zenCanvasEl = document.createElement("canvas");
        view.zenCanvasEl.width = 3200;
        view.zenCanvasEl.height = 4800;
        view.zenCtx = view.zenCanvasEl.getContext("2d");
        view.zenCtx.lineCap = "round";
        view.zenCtx.lineJoin = "round";
        view.zenCtx.lineWidth = currentSize;
        view.zenCtx.strokeStyle = currentColor;
        view.zenCanvasEl.style.backgroundColor = "#ffffff";
        view.zenCanvasEl.style.display = "block";
        view.zenCanvasEl.style.touchAction = "none";
        updateToolUI();
        const getPointerPos = (e) => {
          const rect = view.zenCanvasEl.getBoundingClientRect();
          return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        view.zenCanvasEl.addEventListener("pointerdown", (e) => {
          if (currentTool === "hand") {
            isDragging = true;
            view.zenCanvasEl.style.cursor = "grabbing";
            startX = e.clientX;
            startY = e.clientY;
            scrollLeftStart = scrollWrapper.scrollLeft;
            scrollTopStart = scrollWrapper.scrollTop;
          } else {
            view.zenIsDrawing = true;
            const pos = getPointerPos(e);
            view.zenCtx.beginPath();
            view.zenCtx.moveTo(pos.x, pos.y);
          }
        });
        view.zenCanvasEl.addEventListener("pointermove", (e) => {
          if (currentTool === "hand" && isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            scrollWrapper.scrollLeft = scrollLeftStart - dx;
            scrollWrapper.scrollTop = scrollTopStart - dy;
          } else if (view.zenIsDrawing) {
            const pos = getPointerPos(e);
            view.zenCtx.lineTo(pos.x, pos.y);
            view.zenCtx.stroke();
          }
        });
        const stopAction = () => {
          view.zenIsDrawing = false;
          isDragging = false;
          if (currentTool === "hand") view.zenCanvasEl.style.cursor = "grab";
        };
        view.zenCanvasEl.addEventListener("pointerup", stopAction);
        view.zenCanvasEl.addEventListener("pointerout", stopAction);
        view.zenCanvasEl.addEventListener("pointercancel", stopAction);
      }
      scrollWrapper.appendChild(view.zenCanvasEl);
      setTimeout(() => {
        scrollWrapper.scrollLeft = (3200 - scrollWrapper.clientWidth) / 2;
        scrollWrapper.scrollTop = (4800 - scrollWrapper.clientHeight) / 2;
      }, 10);
    };
  }
  unload() {
    if (this.originalRenderZenDoodle) {
      CornellNotesView.prototype.renderZenDoodle = this.originalRenderZenDoodle;
    }
  }
};

// main.ts
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
    let cleanDestName = rawDestInput.replace(/^\d{12,14}\s*-\s*/, "").trim();
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
    if (!thought && !context && !payload.doodleData && !pendingClipboardImageData) {
      new import_obsidian4.Notice("\u26A0\uFE0F Capture is empty!");
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
    let marginaliaContent = thought ? `${thought} ` : "";
    if (doodleSyntax) marginaliaContent += `${doodleSyntax}`;
    let finalMd = "\n";
    if (marginaliaContent.trim()) finalMd += `%%> ${marginaliaContent.trim()} %%
`;
    if (context) finalMd += `${context}
`;
    if (contextImageSyntax) finalMd += `${contextImageSyntax}
`;
    finalMd += `
---
`;
    let file = this.app.metadataCache.getFirstLinkpathDest(finalDestName, "");
    if (file instanceof import_obsidian4.TFile) {
      await this.app.vault.append(file, finalMd);
    } else {
      let fileName = finalDestName.endsWith(".md") ? finalDestName : `${finalDestName}.md`;
      let folderPath = this.plugin.settings.zkMode ? this.plugin.settings.zkFolder.trim() : this.plugin.settings.omniCaptureFolder.trim();
      if (folderPath) {
        await this.plugin.ensureFolderExists(folderPath);
        fileName = `${folderPath}/${fileName}`;
      }
      const header = this.plugin.settings.zkMode ? `# \u{1F5C3}\uFE0F ${finalDestName}
` : `# \u{1F4E5} ${finalDestName}
`;
      await this.app.vault.create(fileName, header + finalMd);
    }
    new import_obsidian4.Notice(`\u26A1 Capture injected into ${finalDestName}`);
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
  ignoredFolders: "Templates",
  alignment: "left",
  marginWidth: 25,
  fontSize: "0.85em",
  fontFamily: "inherit",
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
  zkMode: false,
  zkFolder: "Zettelkasten",
  doodleFolder: "Marginalia Attachments",
  canvasFolder: "Evidence Boards",
  pinboardFolder: "Pinboards",
  omniCaptureFolder: "",
  // 👇 LOS VALORES POR DEFECTO PARA LOS NUEVOS USUARIOS
  addons: {
    "gamification-profile": false,
    // Por defecto viene apagado
    "custom-background": false,
    "rhizome-time-machine": false,
    "super-doodle": false
    // 🎨
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
    rhizomeReviews: {}
  },
  enablePdfDoodle: false
};
var MarginNoteWidget = class extends import_view.WidgetType {
  constructor(text, app, customColor, sourcePath = "", direction = ">") {
    super();
    this.text = text;
    this.app = app;
    this.customColor = customColor;
    this.sourcePath = sourcePath;
    this.direction = direction;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-cornell-margin";
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
    import_obsidian4.MarkdownRenderer.render(this.app, finalRenderText, div, this.sourcePath, new import_obsidian4.Component());
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
      const regex = /%%([><])([\s\S]*?)%%/g;
      let match;
      while (match = regex.exec(text)) {
        const matchStart = from + match.index;
        const matchEnd = matchStart + match[0].length;
        const direction = match[1];
        const noteContent = match[2];
        const tree = (0, import_language.syntaxTree)(state);
        const node = tree.resolve(matchStart, 1);
        const isCode = node.name.includes("code") || node.name.includes("Code") || node.name.includes("math");
        if (isCode) continue;
        let isCursorInside = false;
        const line = state.doc.lineAt(matchStart);
        for (const range of cursorRanges) {
          if (range.from >= line.from && range.to <= line.to) {
            isCursorInside = true;
            break;
          }
        }
        if (isCursorInside) continue;
        if (noteContent.trim().endsWith(";;")) {
          decorationsData.push({
            from: line.from,
            to: line.from,
            type: 0,
            dec: import_view.Decoration.line({ class: "cornell-flashcard-target" })
          });
        }
        let matchedColor = null;
        let finalNoteText = noteContent.trim();
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
            widget: new MarginNoteWidget(finalNoteText, app, matchedColor, (file == null ? void 0 : file.path) || "", direction),
            side: -1
          })
        });
        decorationsData.push({
          from: matchStart,
          to: matchEnd,
          type: 2,
          dec: import_view.Decoration.mark({ class: "cornell-hide-raw" })
        });
      }
    }
    decorationsData.sort((a, b) => {
      if (a.from !== b.from) return a.from - b.from;
      return a.type - b.type;
    });
    decorationsData.forEach((d) => builder.add(d.from, d.to, d.dec));
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations
});
var CORNELL_VIEW_TYPE = "cornell-marginalia-view";
var ConfirmStitchModal = class extends import_obsidian4.Modal {
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
      new import_obsidian4.Notice("Stitching cancelled.");
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
var DoodleModal = class extends import_obsidian4.Modal {
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
    (0, import_obsidian4.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = leftBtns.createEl("button");
    (0, import_obsidian4.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = leftBtns.createEl("button");
    (0, import_obsidian4.setIcon)(clearBtn, "trash-2");
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
      new import_obsidian4.Notice("\u270F\uFE0F Doodle saved!");
      this.close();
    } catch (error) {
      new import_obsidian4.Notice("Error saving doodle. Check console.");
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
var _OmniCaptureModal = class _OmniCaptureModal extends import_obsidian4.Modal {
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
    (0, import_obsidian4.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = doodleTools.createEl("button");
    (0, import_obsidian4.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = doodleTools.createEl("button");
    (0, import_obsidian4.setIcon)(clearBtn, "trash-2");
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
    let cleanDestName = rawDestInput.replace(/^\d{12,14}\s*-\s*/, "").trim();
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
      new import_obsidian4.Notice("Capture is empty!");
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
      if (file instanceof import_obsidian4.TFile) {
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
        const header = this.plugin.settings.zkMode ? `# \u{1F5C3}\uFE0F ${finalDestName}
` : `# \u{1F4E5} ${finalDestName}
`;
        await this.app.vault.create(fileName, header + finalMd);
      }
      new import_obsidian4.Notice(`\u2705 Capture injected into ${finalDestName}`);
      if (this.plugin.settings.addons && this.plugin.settings.addons["gamification-profile"]) {
        this.plugin.gamificationAddon.addXp();
        this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
          if (leaf.view instanceof CornellNotesView) leaf.view.renderUI();
        });
      }
      this.close();
    } catch (error) {
      new import_obsidian4.Notice("Error saving capture. Check console.");
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
var SidebarDoodleModal = class extends import_obsidian4.Modal {
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
    (0, import_obsidian4.setIcon)(penBtn, "pencil");
    penBtn.setAttribute("aria-label", "Pen");
    const eraserBtn = leftBtns.createEl("button");
    (0, import_obsidian4.setIcon)(eraserBtn, "eraser");
    eraserBtn.setAttribute("aria-label", "Eraser");
    const clearBtn = leftBtns.createEl("button");
    (0, import_obsidian4.setIcon)(clearBtn, "trash-2");
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
    (0, import_obsidian4.setIcon)(zapBtn, "zap");
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
var _CornellNotesView = class _CornellNotesView extends import_obsidian4.ItemView {
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
    // 🚀 NUEVA MEMORIA RAM (Caché de Bóveda)
    this.vaultCache = /* @__PURE__ */ new Map();
    // 📚 MEMORIA ZOTLIKE
    this.isZotlikeMode = false;
    this.activePdfName = "";
    this.draggedSidebarItems = null;
    this.isGroupedByContent = false;
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
    this.pendingDoodleData = null;
    this.pendingClipboardImageData = null;
    this.pendingClipboardImageExt = "png";
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
    (0, import_obsidian4.setIcon)(cancelBtn, "arrow-left");
    cancelBtn.style.boxShadow = "none";
    cancelBtn.onclick = () => {
      this.isZenMode = false;
      this.applyFiltersAndRender();
    };
    const penBtn = leftGrp.createEl("button", { cls: "mod-cta", title: "Pen" });
    (0, import_obsidian4.setIcon)(penBtn, "pencil");
    const eraserBtn = leftGrp.createEl("button", { title: "Eraser" });
    (0, import_obsidian4.setIcon)(eraserBtn, "eraser");
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
    (0, import_obsidian4.setIcon)(clearBtn, "trash-2");
    clearBtn.style.boxShadow = "none";
    clearBtn.onclick = () => {
      if (this.zenCanvasEl && this.zenCtx) {
        this.zenCtx.clearRect(0, 0, this.zenCanvasEl.width, this.zenCanvasEl.height);
      }
    };
    const saveBtn = rightGrp.createEl("button", { text: "\u{1F4BE} Attach", cls: "mod-cta", title: "Save and add to Board" });
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
      new import_obsidian4.Notice("\u{1F3A8} Zen Doodle attached to Board!");
      this.isZenMode = false;
      if (this.zenCtx) this.zenCtx.clearRect(0, 0, this.zenCanvasEl.width, this.zenCanvasEl.height);
      this.applyFiltersAndRender();
    };
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
    const actionControlsDiv = container.createDiv({ cls: "cornell-sidebar-controls" });
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
    (0, import_obsidian4.setIcon)(searchIconEl, "search");
    const searchInput = searchWrapper.createEl("input", { type: "text", placeholder: "Search notes...", cls: "cornell-search-bar" });
    searchInput.value = this.searchQuery;
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.applyFiltersAndRender();
    };
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
      new import_obsidian4.Notice("Scanning...");
      await this.scanNotes();
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
      (0, import_obsidian4.setIcon)(destLabel, "layout-dashboard");
      destLabel.createSpan({ text: "Active Board" });
      const bottomRow = qcContainer.createDiv({ cls: "cornell-qc-bottomrow" });
      this.sliderIdeaInput = bottomRow.createEl("textarea", { placeholder: "Add text (# for titles, - for children)" });
      this.sliderIdeaInput.classList.add("cornell-qc-textarea");
      const submitBtn = bottomRow.createEl("button", { title: "Add to Board (Enter)" });
      submitBtn.classList.add("cornell-qc-submit");
      (0, import_obsidian4.setIcon)(submitBtn, "plus");
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
      (0, import_obsidian4.setIcon)(destLabel, "inbox");
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
      (0, import_obsidian4.setIcon)(zkBtn, "fingerprint");
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
        new import_obsidian4.Notice(this.plugin.settings.zkMode ? "\u{1F5C3}\uFE0F ZK Mode: ON (Will create new notes)" : "\u{1F5C3}\uFE0F ZK Mode: OFF (Will append to Destination)");
        this.sliderIdeaInput.focus();
      };
      const clearCtxBtn = topRow.createEl("button", { title: "Clear Clipboard & Memory" });
      clearCtxBtn.classList.add("cornell-qc-btn");
      clearCtxBtn.style.display = "flex";
      clearCtxBtn.style.alignItems = "center";
      clearCtxBtn.style.gap = "4px";
      (0, import_obsidian4.setIcon)(clearCtxBtn, "eraser");
      clearCtxBtn.createSpan({ text: "Clear" });
      clearCtxBtn.onclick = async () => {
        await navigator.clipboard.writeText("");
        _CornellNotesView.lastCapturedContext = "";
        _CornellNotesView.lastCapturedImageLength = 0;
        this.pendingClipboardImageData = null;
        this.pendingDoodleData = null;
        doodleBtn.style.color = "var(--text-muted)";
        new import_obsidian4.Notice("\u{1F9F9} Clipboard & Memory cleared!");
      };
      const doodleBtn = topRow.createEl("button", { title: "Attach Doodle" });
      doodleBtn.classList.add("cornell-qc-btn");
      doodleBtn.style.display = "flex";
      doodleBtn.style.alignItems = "center";
      doodleBtn.style.gap = "4px";
      (0, import_obsidian4.setIcon)(doodleBtn, "palette");
      doodleBtn.createSpan({ text: "Doodle" });
      doodleBtn.onclick = async () => {
        const result = await this.plugin.captureManager.openDoodle();
        this.pendingDoodleData = result.data;
        doodleBtn.style.color = "var(--color-green)";
        if (result.isInstant) {
          executeSave();
        } else {
          new import_obsidian4.Notice("\u{1F3A8} Doodle attached! Press \u26A1 to save.");
        }
      };
      const bottomRow = qcContainer.createDiv({ cls: "cornell-qc-bottomrow" });
      this.sliderIdeaInput = bottomRow.createEl("textarea", { placeholder: "\u{1F4A1} Your Idea (Auto-paste enabled)..." });
      this.sliderIdeaInput.classList.add("cornell-qc-textarea");
      this.sliderIdeaInput.addEventListener("paste", async (e) => {
        if (!e.clipboardData) return;
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              this.pendingClipboardImageData = await blob.arrayBuffer();
              this.pendingClipboardImageExt = blob.type.split("/")[1] || "png";
              new import_obsidian4.Notice("\u{1F5BC}\uFE0F Image attached to capture!");
            }
          }
        }
      });
      const submitBtn = bottomRow.createEl("button", { title: "Save Capture (Ctrl+Enter)" });
      submitBtn.classList.add("cornell-qc-submit");
      (0, import_obsidian4.setIcon)(submitBtn, "zap");
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
    const baseEncoded = activePdfBasename.replace(/ /g, "%20");
    const nameEncoded = this.activePdfName.replace(/ /g, "%20");
    for (const file of filesToScan) {
      if (this.isZotlikeMode) {
        const fullContent = await this.plugin.app.vault.cachedRead(file);
        if (!fullContent.includes(this.activePdfName) && !fullContent.includes(nameEncoded) && !fullContent.includes(`[[${activePdfBasename}`) && !fullContent.includes(`[[${baseEncoded}`)) {
          continue;
        }
      }
      const cachedData = this.vaultCache.get(file.path);
      if (cachedData && cachedData.mtime === file.stat.mtime) {
        allItemsFlat.push(...cachedData.items);
        continue;
      }
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split("\n");
      const fileItems = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineRegex = /%%[><](.*?)%%/g;
        let match;
        while ((match = lineRegex.exec(line)) !== null) {
          let noteContent = match[1].trim();
          if (noteContent.endsWith(";;")) noteContent = noteContent.slice(0, -2).trim();
          const rawTextForStitching = noteContent;
          let cleanText = noteContent;
          let matchedColor = defaultColor;
          for (const tag of this.plugin.settings.tags) {
            if (cleanText.startsWith(tag.prefix)) {
              matchedColor = tag.color;
              cleanText = cleanText.substring(tag.prefix.length).trim();
              break;
            }
          }
          cleanText = cleanText.replace(/img:\s*\[\[(.*?)\]\]/gi, "![[$1]]").trim();
          const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
          const outgoingLinks = [];
          const linkMatches = Array.from(cleanText.matchAll(linkRegex));
          linkMatches.forEach((m) => outgoingLinks.push(m[1]));
          cleanText = cleanText.replace(linkRegex, "").trim();
          if (cleanText.length === 0) continue;
          const blockIdMatch = line.match(/\^([a-zA-Z0-9]+)\s*$/);
          const existingBlockId = blockIdMatch ? blockIdMatch[1] : null;
          fileItems.push({
            text: cleanText,
            rawText: rawTextForStitching,
            color: matchedColor,
            file,
            line: i,
            blockId: existingBlockId,
            outgoingLinks
          });
        }
      }
      this.vaultCache.set(file.path, { mtime: file.stat.mtime, items: fileItems });
      allItemsFlat.push(...fileItems);
    }
    this.cachedItems = allItemsFlat;
    this.applyFiltersAndRender();
  }
  applyFiltersAndRender() {
    document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
    const contentDiv = this.containerEl.querySelector(".cornell-sidebar-content");
    if (!contentDiv) return;
    if (this.currentTab === "pinboard") {
      this.renderPinboardTab(contentDiv);
      return;
    }
    const isFilterActive = this.searchQuery.length > 0 || this.activeColorFilters.size > 0;
    const matchesFilter = (item) => {
      const matchesSearch = item.text.toLowerCase().includes(this.searchQuery) || item.file.basename.toLowerCase().includes(this.searchQuery);
      const matchesColor = this.activeColorFilters.size === 0 || this.activeColorFilters.has(item.color);
      return matchesSearch && matchesColor;
    };
    if (this.currentTab === "threads") {
      if (!isFilterActive) {
        const allTargetIds = /* @__PURE__ */ new Set();
        this.cachedItems.forEach((item) => {
          item.outgoingLinks.forEach((l) => {
            const parts = l.split("#^");
            if (parts.length === 2) allTargetIds.add(parts[1]);
          });
        });
        const rootItems = this.cachedItems.filter((item) => item.outgoingLinks.length > 0 && (!item.blockId || !allTargetIds.has(item.blockId)));
        this.renderThreads(rootItems, contentDiv, false);
      } else {
        const matchingItems = this.cachedItems.filter(matchesFilter);
        const topLevelMatches = matchingItems.filter((item) => {
          const isChildOfAnotherMatch = matchingItems.some((parent) => item.blockId && parent.outgoingLinks.some((link) => link.includes(`#^${item.blockId}`)));
          return !isChildOfAnotherMatch;
        });
        this.renderThreads(topLevelMatches, contentDiv, true);
      }
    } else {
      const filtered = this.cachedItems.filter(matchesFilter);
      if (this.isGroupedByContent) {
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
      (0, import_obsidian4.setIcon)(btn, icon);
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
      new import_obsidian4.Notice("Board cleared!");
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
        (0, import_obsidian4.setIcon)(autoPasteBtn.createSpan(), "pause");
        autoPasteBtn.createSpan({ text: "Auto" });
        autoPasteBtn.style.backgroundColor = "var(--color-green)";
        autoPasteBtn.style.color = "#fff";
        autoPasteBtn.style.borderColor = "var(--color-green)";
      } else {
        (0, import_obsidian4.setIcon)(autoPasteBtn.createSpan(), "play");
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
        new import_obsidian4.Notice("\u{1F916} Auto-Paste deactivated.");
      } else {
        this.lastClipboardText = await navigator.clipboard.readText();
        this.autoPasteInterval = window.setInterval(async () => {
          try {
            const currentText = await navigator.clipboard.readText();
            if (currentText && currentText !== this.lastClipboardText) {
              this.lastClipboardText = currentText;
              this.pinboardItems.push({ text: currentText, rawText: currentText, color: "transparent", file: null, line: -1, blockId: null, outgoingLinks: [], isCustom: true, indentLevel: 0 });
              this.applyFiltersAndRender();
              new import_obsidian4.Notice("Text auto-pasted! \u{1F4DD}");
            }
          } catch (e) {
          }
        }, 1e3);
        new import_obsidian4.Notice("\u{1F916} Auto-Paste ON! Copy text to see it appear.");
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
          import_obsidian4.MarkdownRenderer.renderMarkdown(item.text, textSpan, "", this.plugin);
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
  async exportPinboard() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const folder = this.plugin.settings.pinboardFolder.trim();
    await this.plugin.ensureFolderExists(folder);
    const fileName = folder ? `${folder}/Pinboard_${dateStr}.md` : `Pinboard_${dateStr}.md`;
    let content = `# \u25CF Pinboard Session
*Exported on: ${window.moment().format("YYYY-MM-DD HH:mm")}*

---

`;
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
      const fileContent = await this.plugin.app.vault.cachedRead(item.file);
      const lines = fileContent.split("\n");
      let contextText = lines[item.line] || "";
      contextText = contextText.replace(/%%[><](.*?)%%/g, "").trim();
      if (contextText.length > 0 && !contextText.includes(`^${targetId}`)) {
        contextText += ` ^${targetId}`;
      }
      content += `Margin Note: ${item.text}

`;
      if (contextText.length > 0) {
        content += `${contextText}

`;
      }
      content += `From: [[${item.file.basename}#^${targetId}|${item.file.basename}]]

---

`;
    }
    try {
      const newFile = await this.plugin.app.vault.create(fileName, content);
      await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
      new import_obsidian4.Notice("Pinboard compiled successfully!");
    } catch (error) {
      new import_obsidian4.Notice("Error creating Pinboard file. Check console.");
    }
  }
  // 🌳 NUEVA FUNCIÓN: Exportador al Portapapeles para Mindmaps (Excalidraw)
  async exportMindmap() {
    if (this.pinboardItems.length === 0) {
      new import_obsidian4.Notice("El Board est\xE1 vac\xEDo.");
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
        const cleanText = item.rawText.replace(imgRegex, "").trim();
        if (match) {
          const imageName = match[1];
          if (cleanText.length > 0) {
            content += `${indentSpaces}- [[${item.file.basename}#^${targetId}|${cleanText}]]
`;
            content += `${indentSpaces}	- ![[${imageName}]]
`;
          } else {
            content += `${indentSpaces}- ![[${imageName}]]
`;
          }
        } else {
          content += `${indentSpaces}- [[${item.file.basename}#^${targetId}|${item.rawText}]]
`;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(content);
      new import_obsidian4.Notice("\u{1F4CB} \xA1Mindmap copiado! Ve a Excalidraw y presiona Ctrl+V");
    } catch (error) {
      new import_obsidian4.Notice("Error al copiar al portapapeles. Revisa la consola.");
      console.error(error);
    }
  }
  // 🎨 NUEVO MOTOR: Generador Automático de Canvas (Tablero de Evidencia)
  async exportCanvas() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const folder = this.plugin.settings.canvasFolder.trim();
    await this.plugin.ensureFolderExists(folder);
    const fileName = folder ? `${folder}/EvidenceBoard_${dateStr}.canvas` : `EvidenceBoard_${dateStr}.canvas`;
    const nodes = [];
    const edges = [];
    const genId = () => [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    let currentY = 0;
    let lastTitleId = null;
    let parentAtLevel = {};
    for (const item of this.pinboardItems) {
      const nodeId = genId();
      if (item.isTitle) {
        const titleText = item.text.startsWith("#") ? item.text : `# ${item.text}`;
        nodes.push({ id: nodeId, type: "text", text: titleText, x: 0, y: currentY, width: 350, height: 100, color: "1" });
        lastTitleId = nodeId;
        parentAtLevel = {};
        parentAtLevel[-1] = nodeId;
        currentY += 150;
      } else if (item.isCustom) {
        const indent = item.indentLevel || 0;
        const baseX = (indent + 1) * 450;
        nodes.push({ id: nodeId, type: "text", text: `**${item.text}**`, x: baseX, y: currentY, width: 250, height: 60, color: "5" });
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
        const noteText = `**Marginalia:**
${canvasNoteContent}

[[${item.file.basename}#^${targetId}|\u{1F517} Origin]]`;
        const nodeHeight = hasImage ? 320 : 140;
        nodes.push({ id: nodeId, type: "text", text: noteText, x: baseX, y: currentY, width: 300, height: nodeHeight, color: "4" });
        const parentId = parentAtLevel[indent - 1] || lastTitleId;
        if (parentId) {
          edges.push({ id: genId(), fromNode: parentId, fromSide: "right", toNode: nodeId, toSide: "left" });
        }
        parentAtLevel[indent] = nodeId;
        const fileContent = await this.plugin.app.vault.cachedRead(item.file);
        const lines = fileContent.split("\n");
        const startLine = Math.max(0, item.line - 1);
        const endLine = Math.min(lines.length - 1, item.line + 1);
        let contextText = "";
        for (let i = startLine; i <= endLine; i++) {
          let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
          if (cleanLine) contextText += cleanLine + "\n";
        }
        contextText = contextText.trim();
        if (contextText) {
          const contextNodeId = genId();
          nodes.push({ id: contextNodeId, type: "text", text: `> ${contextText}`, x: baseX + 400, y: currentY - 20, width: 450, height: Math.max(180, nodeHeight) });
          edges.push({ id: genId(), fromNode: nodeId, fromSide: "right", toNode: contextNodeId, toSide: "left" });
        }
        currentY += hasImage ? 360 : 220;
      }
    }
    const canvasData = JSON.stringify({ nodes, edges }, null, 2);
    try {
      const newFile = await this.plugin.app.vault.create(fileName, canvasData);
      await this.plugin.app.workspace.getLeaf(true).openFile(newFile);
      new import_obsidian4.Notice("\u{1F3A8} Evidence Board created successfully!");
    } catch (error) {
      new import_obsidian4.Notice("Error creating Canvas file. Check console.");
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
        this.draggedSidebarItems = items;
      });
      headerDiv.addEventListener("dragend", () => {
        this.draggedSidebarItems = null;
        headerDiv.removeClass("cornell-drop-target");
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
  renderThreads(rootItems, container, isFilteredMode = false) {
    container.empty();
    if (rootItems.length === 0) {
      container.createEl("p", { text: "No matching threads found.", cls: "cornell-sidebar-empty" });
      return;
    }
    for (const root of rootItems) {
      const threadGroup = container.createDiv({ cls: "cornell-thread-parent" });
      this.renderThreadNode(root, threadGroup, this.cachedItems, /* @__PURE__ */ new Set(), isFilteredMode, true);
    }
  }
  renderThreadNode(item, container, allItems, visitedIds, isFilteredMode = false, isRootCall = false) {
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
          const targetId = parts[1];
          const childItem = allItems.find((i) => i.blockId === targetId);
          if (childItem) {
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
              new import_obsidian4.Notice(`\u{1F4CC} Pinned: ${targetItem.text.substring(0, 15)}...`);
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
      new import_obsidian4.Notice("\u26A0\uFE0F Open a note first to import its skeleton.");
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
      new import_obsidian4.Notice(`\u{1F9B4} Imported ${importedCount} skeleton nodes!`);
      this.applyFiltersAndRender();
    } else {
      new import_obsidian4.Notice("No headers or lists found in this note.");
    }
  }
  createItemDiv(item, parentContainer, isPinboardView = false, pinIndex = -1) {
    const itemDiv = parentContainer.createDiv({ cls: "cornell-sidebar-item" });
    itemDiv.style.borderLeftColor = item.color;
    const textRow = itemDiv.createDiv({ cls: "cornell-sidebar-item-text" });
    textRow.style.display = "flex";
    textRow.style.justifyContent = "space-between";
    textRow.style.alignItems = "flex-start";
    const textSpan = textRow.createSpan();
    textSpan.style.wordBreak = "break-word";
    textSpan.style.flexGrow = "1";
    textSpan.style.marginRight = "10px";
    let textToRender = item.text;
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
    import_obsidian4.MarkdownRenderer.renderMarkdown(
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
    pinBtn.style.cursor = "pointer";
    pinBtn.style.marginLeft = "10px";
    pinBtn.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    pinBtn.style.opacity = isPinboardView || isAlreadyPinned ? "1" : "0";
    itemDiv.addEventListener("mouseenter", () => {
      const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
      if (!isPinboardView && !currentPinned) pinBtn.style.opacity = "0.5";
    });
    itemDiv.addEventListener("mouseleave", () => {
      const currentPinned = this.pinboardItems.some((p) => p.rawText === item.rawText && p.file.path === item.file.path);
      if (!isPinboardView && !currentPinned) pinBtn.style.opacity = "0";
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
        } else {
          this.pinboardItems.push(item);
          pinBtn.innerText = "\u25CF";
          pinBtn.style.opacity = "1";
        }
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
            new import_obsidian4.Notice("Cannot connect a note to itself.");
            return;
          }
          await this.executeMassStitch([this.sourceStitchItem], [item]);
          this.isStitchingMode = false;
          this.sourceStitchItem = null;
          this.updateStitchBanner();
        }
        return;
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
        if (!isHovering) return;
        if (!document.body.contains(itemDiv)) return;
        const lines = content.split("\n");
        const startLine = Math.max(0, item.line - 1);
        const endLine = Math.min(lines.length - 1, item.line + 1);
        removeTooltip();
        let rawBlock = "";
        for (let i = startLine; i <= endLine; i++) {
          let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
          if (cleanLine) {
            if (i === item.line) {
              rawBlock += `==${cleanLine}==
`;
            } else {
              rawBlock += `${cleanLine}
`;
            }
          }
        }
        const pdfRegex = /!*\[\[(.*?\.(?:pdf).*?)\]\]/i;
        const pdfMatch = rawBlock.match(pdfRegex);
        if (pdfMatch) {
          const pdfLinkText = pdfMatch[1];
          this.plugin.app.workspace.trigger("hover-link", {
            event: e,
            source: "preview",
            hoverParent: itemDiv,
            targetEl: itemDiv,
            linktext: pdfLinkText,
            sourcePath: item.file.path
          });
          return;
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
        styleTag.innerHTML = `

                    .cornell-hover-tooltip p { margin: 0 0 8px 0 !important; }

                `;
        tooltipEl.appendChild(styleTag);
        const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
        header.innerHTML = `<span style="font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;">\u{1F4C4} ${item.file.basename} (L${item.line + 1})</span>`;
        const body = tooltipEl.createDiv();
        body.style.width = "100%";
        document.body.appendChild(tooltipEl);
        const rect = itemDiv.getBoundingClientRect();
        let leftPos = rect.left - 470;
        if (leftPos < 10) leftPos = rect.right + 20;
        tooltipEl.style.left = `${leftPos}px`;
        let topPos = rect.top;
        if (topPos + 350 > window.innerHeight) topPos = window.innerHeight - 360;
        tooltipEl.style.top = `${Math.max(10, topPos)}px`;
        const imgRegex2 = /!\[\[(.*?\.(?:png|jpg|jpeg|gif|bmp|svg))\|?(.*?)\]\]/gi;
        rawBlock = rawBlock.replace(imgRegex2, (match, filename) => {
          const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
          if (file) {
            const resourcePath = this.plugin.app.vault.getResourcePath(file);
            return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
          }
          return match;
        });
        if (!rawBlock.trim()) rawBlock = "*No text context available.*";
        await import_obsidian4.MarkdownRenderer.renderMarkdown(
          rawBlock,
          body,
          item.file.path,
          this
        );
        requestAnimationFrame(() => {
          if (tooltipEl) tooltipEl.addClass("is-visible");
        });
      }, 500);
    });
    itemDiv.addEventListener("mouseleave", removeTooltip);
    if (!isPinboardView) {
      itemDiv.setAttr("draggable", "true");
      itemDiv.addEventListener("dragstart", (event) => {
        document.querySelectorAll(".hover-popover").forEach((el) => el.remove());
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = "copy";
        let targetId = item.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          item.blockId = targetId;
          this.injectBackgroundBlockId(item.file, item.line, targetId);
        }
        let safeAlias = item.text.replace(/!\[\[(.*?)\]\]/g, "\u{1F5BC}\uFE0F [Image]").trim();
        if (!safeAlias) safeAlias = "Marginalia Doodle";
        const dragPayload = `[[${item.file.basename}#^${targetId}|${safeAlias}]]`;
        event.dataTransfer.setData("text/plain", dragPayload);
        this.draggedSidebarItems = [item];
      });
      itemDiv.addEventListener("dragend", () => {
        this.draggedSidebarItems = null;
        itemDiv.removeClass("cornell-drop-target");
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
  async executeMassStitch(sources, targets) {
    const totalLinks = sources.length * targets.length;
    const processStitching = async () => {
      new import_obsidian4.Notice(`Stitching ${totalLinks} thread(s)... \u26D3\uFE0E`);
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
          linksToInject += ` [[${target.file.basename}#^${target.blockId}]]`;
        }
        if (linksToInject.length > 0) {
          await this.plugin.app.vault.process(source.file, (data) => {
            const lines = data.split("\n");
            if (source.line >= 0 && source.line < lines.length) {
              lines[source.line] = lines[source.line].replace(source.rawText, source.rawText + linksToInject);
            }
            return lines.join("\n");
          });
        }
      }
      new import_obsidian4.Notice("\xA1Hilos conectados con \xE9xito! \u2728");
      await this.scanNotes();
    };
    if (totalLinks > 1) {
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
        if (!lines[lineIndex].match(/\^([a-zA-Z0-9]+)\s*$/)) {
          lines[lineIndex] = lines[lineIndex] + ` ^${newId}`;
        }
      }
      return lines.join("\n");
    });
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
var CornellNotesView = _CornellNotesView;
var CornellSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Cornell Marginalia Settings" });
    containerEl.createEl("h3", { text: "\u{1F3A8} Appearance & Rendering" });
    new import_obsidian4.Setting(containerEl).setName("Margin Alignment").addDropdown(
      (d) => d.addOption("left", "Left").addOption("right", "Right").setValue(this.plugin.settings.alignment).onChange(async (v) => {
        this.plugin.settings.alignment = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Margin Width (%)").addSlider(
      (s) => s.setLimits(15, 60, 1).setValue(this.plugin.settings.marginWidth).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.marginWidth = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Font Size").addText(
      (t) => t.setValue(this.plugin.settings.fontSize).onChange(async (v) => {
        this.plugin.settings.fontSize = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Font Family").addText(
      (t) => t.setValue(this.plugin.settings.fontFamily).onChange(async (v) => {
        this.plugin.settings.fontFamily = v;
        await this.plugin.saveSettings();
        this.plugin.updateStyles();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Enable in Reading View").setDesc("Shows marginalia in reading mode. Turn this off if you prefer a clean view.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableReadingView).onChange(async (value) => {
        this.plugin.settings.enableReadingView = value;
        await this.plugin.saveSettings();
        new import_obsidian4.Notice("Reload the note to see changes in Reading View.");
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Extract Highlights").setDesc("OPTIONAL: Include standard text highlights (==text==) in the Explorer and Pinboard.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.extractHighlights).onChange(async (value) => {
        this.plugin.settings.extractHighlights = value;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE).forEach((leaf) => {
          if (leaf.view instanceof CornellNotesView) leaf.view.scanNotes();
        });
      })
    );
    containerEl.createEl("h3", { text: "\u{1F3F7}\uFE0F Color Tags" });
    this.plugin.settings.tags.forEach((tag, index) => {
      new import_obsidian4.Setting(containerEl).setName(`Tag ${index + 1}`).addText(
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
    new import_obsidian4.Setting(containerEl).addButton(
      (b) => b.setButtonText("Add Tag").onClick(async () => {
        this.plugin.settings.tags.push({ prefix: "New", color: "#888" });
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F4C2} File & Output Management" });
    new import_obsidian4.Setting(containerEl).setName("Omni-Capture Default Folder").setDesc("Folder where new marginalia files will be created (leave empty for root).").addText(
      (text) => text.setPlaceholder("Example: 00_Inbox").setValue(this.plugin.settings.omniCaptureFolder).onChange(async (value) => {
        this.plugin.settings.omniCaptureFolder = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Zettelkasten Folder").setDesc("Where should your ZK notes be created? (Leave empty for root).").addText(
      (t) => t.setValue(this.plugin.settings.zkFolder).onChange(async (v) => {
        this.plugin.settings.zkFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Doodles Folder").setDesc("Where should your hand-drawn images be saved? (Leave empty for root).").addText(
      (t) => t.setValue(this.plugin.settings.doodleFolder).onChange(async (v) => {
        this.plugin.settings.doodleFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Evidence Boards Folder").setDesc("Where should your Canvas files be exported?").addText(
      (t) => t.setValue(this.plugin.settings.canvasFolder).onChange(async (v) => {
        this.plugin.settings.canvasFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Pinboards Folder").setDesc("Where should your exported Pinboard Markdown files go?").addText(
      (t) => t.setValue(this.plugin.settings.pinboardFolder).onChange(async (v) => {
        this.plugin.settings.pinboardFolder = v;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u2699\uFE0F Advanced & Exclusions" });
    new import_obsidian4.Setting(containerEl).setName("Ignored Folders").setDesc("Comma-separated list of folders to completely ignore.").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredFolders).onChange(async (v) => {
        this.plugin.settings.ignoredFolders = v;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.updateOptions();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Ignored Folders for Highlights").setDesc("Comma-separated list of folders to ignore ONLY for highlights (e.g., Excalidraw, Templates).").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredHighlightFolders).onChange(async (v) => {
        this.plugin.settings.ignoredHighlightFolders = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Ignored Highlight Texts").setDesc("Comma-separated list of exact texts or fragments to ignore (e.g., Switch to EXCALIDRAW VIEW).").addTextArea(
      (t) => t.setValue(this.plugin.settings.ignoredHighlightTexts).onChange(async (v) => {
        this.plugin.settings.ignoredHighlightTexts = v;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "\u{1F9E9} Addons & Modules" });
    new import_obsidian4.Setting(containerEl).setName("Gamification & User Profile").setDesc("Turn your marginalia into a game! Earn XP, level up, and customize your profile sidebar.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["gamification-profile"]).onChange(async (value) => {
        this.plugin.settings.addons["gamification-profile"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.gamificationAddon.load();
          new import_obsidian4.Notice("\u{1F3AE} Gamification Addon Enabled!");
        } else {
          this.plugin.gamificationAddon.unload();
          new import_obsidian4.Notice("\u{1F6D1} Gamification Addon Disabled.");
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["gamification-profile"]) {
      new import_obsidian4.Setting(containerEl).setName("Profile Image URL").setDesc("Paste an image URL for your avatar.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.profileImage).onChange(async (value) => {
          this.plugin.settings.userStats.profileImage = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian4.Setting(containerEl).setName("Inspirational Quote").setDesc("A short bio or quote for your profile.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.quote).onChange(async (value) => {
          this.plugin.settings.userStats.quote = value;
          await this.plugin.saveSettings();
        })
      );
    }
    new import_obsidian4.Setting(containerEl).setName("Custom Explorer Background").setDesc("Add a beautiful background image to your Marginalia Explorer.").addToggle(
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
      new import_obsidian4.Setting(containerEl).setName("Background Image URL").setDesc("Paste an image URL (e.g., from Unsplash) or local vault path.").addText(
        (text) => text.setValue(this.plugin.settings.userStats.customBackground).onChange(async (value) => {
          this.plugin.settings.userStats.customBackground = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
      new import_obsidian4.Setting(containerEl).setName("Background Blur").setDesc("Amount of blur (lo-fi effect).").addSlider(
        (slider) => slider.setLimits(0, 20, 1).setValue(this.plugin.settings.userStats.bgBlur).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.userStats.bgBlur = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
      new import_obsidian4.Setting(containerEl).setName("Dark Overlay Opacity").setDesc("Dims the background so text is readable (0 = invisible, 1 = pitch black).").addSlider(
        (slider) => slider.setLimits(0.1, 1, 0.05).setValue(this.plugin.settings.userStats.bgOpacity).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.userStats.bgOpacity = value;
          await this.plugin.saveSettings();
          this.plugin.backgroundAddon.applyStyles();
        })
      );
    }
    new import_obsidian4.Setting(containerEl).setName("\u{1F331} Time Machine & Rhizome").setDesc("Explore your marginaliae on a chronological, full-screen interactive canvas with spaced repetition.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons["rhizome-time-machine"]).onChange(async (value) => {
        this.plugin.settings.addons["rhizome-time-machine"] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.rhizomeAddon.load();
          new import_obsidian4.Notice("\u{1F331} Time Machine Enabled! Check the left ribbon.");
        } else {
          this.plugin.rhizomeAddon.unload();
          new import_obsidian4.Notice("\u{1F6D1} Time Machine Disabled.");
        }
        this.display();
      })
    );
    if (this.plugin.settings.addons["rhizome-time-machine"]) {
      new import_obsidian4.Setting(containerEl).setName("\u{1F30C} Time Machine Wallpaper URL").setDesc("Paste a direct link to an image (jpg, png, gif) for your Time Machine background.").addText(
        (text) => text.setPlaceholder("https://example.com/background.jpg").setValue(this.plugin.settings.rhizomeBgImage || "").onChange(async (value) => {
          this.plugin.settings.rhizomeBgImage = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian4.Setting(containerEl).setName("\u{1F30C} Wallpaper Opacity").setDesc("Adjust the background transparency so it doesn't interfere with your notes (0.1 to 1.0).").addSlider(
        (slider) => slider.setLimits(0.1, 1, 0.1).setValue(this.plugin.settings.rhizomeBgOpacity || 0.3).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.rhizomeBgOpacity = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian4.Setting(containerEl).setName("\u{1F30C} Wallpaper Blur").setDesc("Apply a blur effect to the background to make your notes stand out more (0 to 20).").addSlider(
        (slider) => slider.setLimits(0, 20, 1).setValue(this.plugin.settings.rhizomeBgBlur !== void 0 ? this.plugin.settings.rhizomeBgBlur : 2).setDynamicTooltip().onChange(async (value) => {
          this.plugin.settings.rhizomeBgBlur = value;
          await this.plugin.saveSettings();
        })
      );
    }
    new import_obsidian4.Setting(containerEl).setName("Pdf Doodle & Harvest").setDesc("Enable temporary drawing mode on PDFs.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enablePdfDoodle).onChange(async (value) => {
        this.plugin.settings.enablePdfDoodle = value;
        await this.plugin.saveSettings();
        new import_obsidian4.Notice("Restart Obsidian to apply Addon changes.");
      })
    );
    new import_obsidian4.Setting(containerEl).setName(this.plugin.superDoodleAddon.name).setDesc(this.plugin.superDoodleAddon.description).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.addons[this.plugin.superDoodleAddon.id] || false).onChange(async (value) => {
        this.plugin.settings.addons[this.plugin.superDoodleAddon.id] = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.superDoodleAddon.load();
          new import_obsidian4.Notice(`\u2705 ${this.plugin.superDoodleAddon.name} enabled`);
        } else {
          this.plugin.superDoodleAddon.unload();
          new import_obsidian4.Notice(`\u274C ${this.plugin.superDoodleAddon.name} disabled`);
        }
      })
    );
  }
};
var RhizomeView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.isReviewMode = false;
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
      this.plugin.settings.userStats = { xp: 0, level: 1, marginaliasCreated: 0, colorUsage: {}, profileImage: "", quote: "Stay curious.", customBackground: "", bgBlur: 5, bgOpacity: 0.8, rhizomeReviews: {} };
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
    (0, import_obsidian4.setIcon)(searchIconEl, "search");
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
    (0, import_obsidian4.setIcon)(flashcardBtn, "layers");
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
    (0, import_obsidian4.setIcon)(moleculeBtn, "share-2");
    moleculeBtn.createSpan({ text: "Molecule" });
    const orphanBtn = this.topBarEl.createEl("button", {
      title: "Hide notes without compass links",
      cls: "cornell-rhizome-filter-btn" + (this.hideOrphans ? " is-active" : "")
    });
    (0, import_obsidian4.setIcon)(orphanBtn, "eye-off");
    orphanBtn.createSpan({ text: "Clean Orphans" });
    orphanBtn.style.display = this.isMoleculeMode ? "flex" : "none";
    const btn3D = this.topBarEl.createEl("button", {
      title: "Toggle Holographic 3D View",
      cls: "cornell-rhizome-filter-btn" + (this.is3DMode ? " is-active" : "")
    });
    (0, import_obsidian4.setIcon)(btn3D, "box");
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
    (0, import_obsidian4.setIcon)(refreshBtn, "refresh-cw");
    refreshBtn.onclick = async () => {
      await this.scanVault();
      this.renderTimeline();
      new import_obsidian4.Notice("Timeline rescanned!");
    };
  }
  async scanVault() {
    const files = this.plugin.app.vault.getMarkdownFiles();
    this.cachedTimelineData = {};
    this.allCachedNodes = [];
    for (const file of files) {
      if (this.plugin.settings.ignoredFolders && file.path.includes(this.plugin.settings.ignoredFolders)) continue;
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = /%%[><](.*?)%%/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          let rawText = match[1].trim();
          if (!rawText) continue;
          let isFlashcard = false;
          if (rawText.endsWith(";;")) {
            isFlashcard = true;
            rawText = rawText.slice(0, -2).trim();
          }
          let color = "var(--text-normal)";
          for (const tag of this.plugin.settings.tags) {
            if (rawText.startsWith(tag.prefix)) {
              color = tag.color;
              break;
            }
          }
          const date = new Date(file.stat.ctime);
          const dateString = date.toISOString().split("T")[0];
          if (!this.cachedTimelineData[dateString]) this.cachedTimelineData[dateString] = [];
          const blockIdMatch = line.match(/\^([a-zA-Z0-9]+)\s*$/);
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
          const cleanCardText = rawText.replace(compassRegex, "").trim();
          const nodeData = {
            text: cleanCardText,
            // 👈 Pasamos el texto limpio
            color,
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
        const matchesSearch = item.text.toLowerCase().includes(searchLower) || item.file.basename.toLowerCase().includes(searchLower);
        const matchesColor = activeColors.size === 0 || activeColors.has(item.color);
        const matchesFc = !onlyFc || item.isFlashcard;
        return matchesSearch && matchesColor && matchesFc;
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
            new import_obsidian4.Notice(`Brain synced! Next review in ${Math.round(interval)} days. \u{1F9E0}`);
          };
          btnHard.onclick = (e) => processGrade("hard", e);
          btnGood.onclick = (e) => processGrade("good", e);
          btnEasy.onclick = (e) => processGrade("easy", e);
        }
        const actionsDiv = node.createDiv({ cls: "cornell-rhizome-actions" });
        const stitchBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian4.setIcon)(stitchBtn, "link");
        stitchBtn.title = "Stitch (Connect) to another note";
        stitchBtn.onClickEvent((e) => {
          e.stopPropagation();
          this.handleStitchClick(item, node, canvas);
        });
        const focusBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
        (0, import_obsidian4.setIcon)(focusBtn, "focus");
        focusBtn.title = "Focus on semantic cluster";
        focusBtn.onClickEvent((e) => {
          e.stopPropagation();
          this.activateFocusMode(item.id, allNodes, domNodesMap, canvas);
        });
        if (imagesToRender.length > 0) {
          const zoomBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
          (0, import_obsidian4.setIcon)(zoomBtn, "maximize");
          zoomBtn.title = "View Doodle in Fullscreen";
          zoomBtn.onClickEvent((e) => {
            e.stopPropagation();
            const firstImg = imagesToRender[0];
            const cleanName = firstImg.split("|")[0];
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(cleanName, item.file.path);
            if (file) {
              const imgSrc = this.plugin.app.vault.getResourcePath(file);
              const overlay = document.body.createDiv({ cls: "cornell-lightbox-overlay" });
              const bigImg = overlay.createEl("img", { attr: { src: imgSrc } });
              bigImg.style.backgroundColor = "white";
              bigImg.style.padding = "10px";
              bigImg.style.borderRadius = "8px";
              if (document.body.classList.contains("theme-dark") && cleanName.includes("doodle_")) {
                bigImg.style.filter = "invert(1)";
                bigImg.style.opacity = "0.9";
              }
              overlay.onclick = () => overlay.remove();
              const escListener = (ev) => {
                if (ev.key === "Escape") {
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
            const startLine = Math.max(0, item.line - 1);
            const endLine = Math.min(lines.length - 1, item.line + 1);
            removeTooltip();
            let rawBlock = "";
            for (let i = startLine; i <= endLine; i++) {
              let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
              if (cleanLine) {
                if (i === item.line) rawBlock += `==${cleanLine}==
`;
                else rawBlock += `${cleanLine}
`;
              }
            }
            const pdfRegex = /!*\[\[(.*?\.(?:pdf).*?)\]\]/i;
            const pdfMatch = rawBlock.match(pdfRegex);
            if (pdfMatch) {
              this.plugin.app.workspace.trigger("hover-link", {
                event: e,
                source: "preview",
                hoverParent: node,
                targetEl: node,
                linktext: pdfMatch[1],
                sourcePath: item.file.path
              });
              return;
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
            const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
            header.innerHTML = `<span style="font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;">\u{1F4C4} ${item.file.basename} (L${item.line + 1})</span>`;
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
            rawBlock = rawBlock.replace(inlineImgRegex, (match, filename) => {
              const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
              if (file) {
                const resourcePath = this.plugin.app.vault.getResourcePath(file);
                return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
              }
              return match;
            });
            if (!rawBlock.trim()) rawBlock = "*No text context available.*";
            await import_obsidian4.MarkdownRenderer.renderMarkdown(rawBlock, body, item.file.path, this);
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
      const matchesSearch = item.text.toLowerCase().includes(searchLower) || item.file.basename.toLowerCase().includes(searchLower);
      const matchesColor = activeColors.size === 0 || activeColors.has(item.color);
      const matchesOrphan = !this.hideOrphans || connectedIds.has(item.id) || connectedIds.has(item.blockId);
      const matchesCluster = !this.focusedClusterId || clusterIds.has(item.id);
      return matchesSearch && matchesColor && matchesOrphan && matchesCluster;
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
      const focusBtn = actionsDiv.createDiv({ cls: "cornell-action-btn" });
      (0, import_obsidian4.setIcon)(focusBtn, "focus");
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
      (0, import_obsidian4.setIcon)(stitchBtn, "link");
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
        (0, import_obsidian4.setIcon)(zoomBtn, "maximize");
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
          const startLine = Math.max(0, item.line - 1);
          const endLine = Math.min(lines.length - 1, item.line + 1);
          removeTooltip();
          let rawBlock = "";
          for (let i = startLine; i <= endLine; i++) {
            let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
            if (cleanLine) {
              if (i === item.line) rawBlock += `==${cleanLine}==
`;
              else rawBlock += `${cleanLine}
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
          const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
          header.innerHTML = `<span style="font-size: 1.1em; color: var(--text-normal); font-weight: bold; display: block; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 6px; width: 100%;">\u{1F4C4} ${item.file.basename} (L${item.line + 1})</span>`;
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
          rawBlock = rawBlock.replace(inlineImgRegex, (match, filename) => {
            const file = this.plugin.app.metadataCache.getFirstLinkpathDest(filename.trim(), item.file.path);
            if (file) {
              const resourcePath = this.plugin.app.vault.getResourcePath(file);
              return `<img src="${resourcePath}" style="max-height:220px; max-width:100%; border-radius:6px; display:block; margin:8px auto;">`;
            }
            return match;
          });
          if (!rawBlock.trim()) rawBlock = "*No text context available.*";
          await import_obsidian4.MarkdownRenderer.renderMarkdown(rawBlock, body, item.file.path, this);
          requestAnimationFrame(() => {
            if (tooltipEl) tooltipEl.addClass("is-visible");
          });
        }, 500);
      });
      node.addEventListener("mouseleave", removeTooltip);
      node.style.cursor = "grab";
      node.addEventListener("mousedown", (e) => {
        var _a, _b, _c;
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
        let initialZ = ((_a = positions.get(item.id)) == null ? void 0 : _a.z) || 0;
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
    (0, import_obsidian4.setIcon)(bannerIcon, "network");
    banner.createSpan({ text: `Semantic Cluster (${clusterIds.size} notes)` });
    const exitBtn = banner.createEl("button", { cls: "cornell-focus-exit-btn", title: "Exit Focus Mode" });
    (0, import_obsidian4.setIcon)(exitBtn, "x");
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
      new import_obsidian4.Notice("Step 1: Origin selected. Click the Link icon on the destination note.");
    } else {
      if (this.sourceStitchItem.id === item.id) {
        new import_obsidian4.Notice("Cannot connect a note to itself.");
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
  async executeStitch(source, target, direction = "Classic") {
    new import_obsidian4.Notice(`Stitching semantic ${direction} thread... \u23F3\u26D3\uFE0E`);
    let targetId = target.blockId;
    if (!targetId) {
      targetId = Math.random().toString(36).substring(2, 8);
      await this.plugin.app.vault.process(target.file, (data) => {
        const lines = data.split("\n");
        if (target.line >= 0 && target.line < lines.length) {
          if (!lines[target.line].match(/\^([a-zA-Z0-9]+)\s*$/)) {
            lines[target.line] = lines[target.line] + ` ^${targetId}`;
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
    await this.plugin.app.vault.process(source.file, (data) => {
      const lines = data.split("\n");
      if (source.line >= 0 && source.line < lines.length) {
        lines[source.line] = lines[source.line].replace(source.text, source.text + linkToInject);
      }
      return lines.join("\n");
    });
    new import_obsidian4.Notice("\u2728 Conexi\xF3n sem\xE1ntica establecida con \xE9xito!");
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
var CornellMarginalia = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.activeRecallMode = false;
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
    this.updateStyles();
    this.registerView(CORNELL_VIEW_TYPE, (leaf) => new CornellNotesView(leaf, this));
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
    this.addCommand({
      id: "insert-cornell-note",
      name: "Insert Margin Note",
      editorCallback: (editor) => {
        const selection = editor.getSelection();
        if (selection) editor.replaceSelection(`%%> ${selection} %%`);
        else {
          editor.replaceSelection(`%%>  %%`);
          const cursor = editor.getCursor();
          editor.setCursor({ line: cursor.line, ch: cursor.ch - 3 });
        }
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
            new import_obsidian4.Notice("\u{1F3A8} Doodle in memory! Press \u26A1 in the sidebar to save.");
          } else {
            new import_obsidian4.Notice("\u{1F3A8} Doodle captured. Open Sidebar to complete your note.");
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
      id: "cornell-mass-stitch",
      name: "Execute Mass Stitch (Keyboard Mode)",
      hotkeys: [{ modifiers: ["Alt"], key: "s" }],
      // Alt + S por defecto
      callback: () => {
        const leaves = this.app.workspace.getLeavesOfType(CORNELL_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          if (view.selectedForStitch.length < 2) {
            new import_obsidian4.Notice("\u26A0\uFE0F Select at least 2 marginalias using Spacebar first.");
            return;
          }
          const targets = [view.selectedForStitch[view.selectedForStitch.length - 1]];
          const sources = view.selectedForStitch.slice(0, -1);
          view.executeMassStitch(sources, targets).then(() => {
            view.selectedForStitch = [];
            view.applyFiltersAndRender();
          });
        } else {
          new import_obsidian4.Notice("Open the Marginalia Explorer first.");
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
          new import_obsidian4.Notice("Marginalias refreshed!");
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
          new import_obsidian4.Notice("Open the Marginalia Explorer first.");
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
          new import_obsidian4.Notice("Open the Marginalia Explorer first.");
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
          new import_obsidian4.Notice("Open the Marginalia Explorer first.");
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
              new import_obsidian4.Notice(`\u26A0\uFE0F Could not find the ${tabName} tab.`);
            }
          } else {
            new import_obsidian4.Notice("Open the Marginalia Explorer first.");
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
        new import_obsidian4.Notice(`Reading View Marginalia: ${statusMessage}
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
      })
    );
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (!this.settings.enableReadingView) return;
      const sectionInfo = ctx.getSectionInfo(el);
      if (!sectionInfo) return;
      const lines = sectionInfo.text.split("\n");
      const sectionLines = lines.slice(sectionInfo.lineStart, sectionInfo.lineEnd + 1);
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
        const regex = /%%([><])(.*?)%%/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          const direction = match[1];
          let noteContent = match[2].trim();
          const isFlashcard = noteContent.endsWith(";;");
          if (isFlashcard) {
            noteContent = noteContent.slice(0, -2).trim();
          }
          let matchedColor = null;
          let finalNoteText = noteContent;
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
          if (matchedColor) {
            marginDiv.style.setProperty("border-color", matchedColor, "important");
            marginDiv.style.setProperty("color", matchedColor, "important");
          }
          import_obsidian4.MarkdownRenderer.render(this.app, finalRenderText, marginDiv, ctx.sourcePath, this);
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
              column.style.setProperty("left", "var(--cornell-margin-left)", "important");
            } else {
              column.style.setProperty("right", "calc(-1 * var(--cornell-width) - 20px)", "important");
            }
            currentTarget.appendChild(column);
          }
          if (isMainLeft && direction === "<" || !isMainLeft && direction === ">") {
            marginDiv.classList.add("cornell-reverse-align");
          }
          column.appendChild(marginDiv);
          if (isFlashcard) {
            currentTarget.classList.add("cornell-flashcard-target");
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
  }
  onunload() {
    console.log("Descargando Cornell Marginalia...");
    if (this.settings.addons && this.settings.addons["super-doodle"]) {
      this.superDoodleAddon.unload();
    }
  }
  toggleActiveRecall() {
    this.activeRecallMode = !this.activeRecallMode;
    new import_obsidian4.Notice(this.activeRecallMode ? "Active Recall Mode: ON \u{1F648}" : "Active Recall Mode: OFF \u{1F441}\uFE0F");
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
    const regex = /^(.*?)\s*%%>\s*(.*?);;\s*%%/;
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
      new import_obsidian4.Notice("No active recall notes (ending in ;;) found.");
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
        new import_obsidian4.Notice(`Added ${newFlashcards.length} new flashcards.`);
      } else {
        new import_obsidian4.Notice("All flashcards are already up to date!");
      }
    } else {
      newFlashcards = Array.from(foundFlashcards);
      const textToAppend = `

${headerText}
${newFlashcards.join("\n")}`;
      const lastLine = editor.lineCount();
      editor.replaceRange(textToAppend, { line: lastLine, ch: 0 });
      new import_obsidian4.Notice(`Generated section with ${newFlashcards.length} flashcards.`);
    }
  }
  updateStyles() {
    document.body.style.setProperty("--cornell-width", `${this.settings.marginWidth}%`);
    document.body.style.setProperty("--cornell-font-size", this.settings.fontSize);
    document.body.style.setProperty("--cornell-font-family", this.settings.fontFamily);
    if (this.settings.alignment === "left") {
      document.body.style.setProperty("--cornell-float", "left");
      document.body.style.setProperty("--cornell-margin-left", `calc(-1 * var(--cornell-width) - 20px)`);
      document.body.style.setProperty("--cornell-margin-right", "15px");
      document.body.style.setProperty("--cornell-border-r", "2px solid var(--text-accent)");
      document.body.style.setProperty("--cornell-border-l", "none");
      document.body.style.setProperty("--cornell-text-align", "right");
    } else {
      document.body.style.setProperty("--cornell-float", "right");
      document.body.style.setProperty("--cornell-margin-right", `calc(-1 * var(--cornell-width) - 20px)`);
      document.body.style.setProperty("--cornell-margin-left", "15px");
      document.body.style.setProperty("--cornell-border-l", "2px solid var(--text-accent)");
      document.body.style.setProperty("--cornell-border-r", "none");
      document.body.style.setProperty("--cornell-text-align", "left");
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
    const lines = content.split("\n");
    const newLines = lines.map((line) => {
      const regex = /%%([><])(.*?)%%/g;
      let match;
      let marginaliasToInject = "";
      let cleanLine = line;
      while ((match = regex.exec(cleanLine)) !== null) {
        modified = true;
        const fullMatch = match[0];
        const direction = match[1];
        let noteContent = match[2];
        let finalText = noteContent.trim();
        if (finalText.endsWith(";;")) {
          finalText = finalText.slice(0, -2).trim();
        }
        let matchedColor = "var(--text-accent)";
        for (const tag of this.settings.tags) {
          if (finalText.startsWith(tag.prefix)) {
            matchedColor = tag.color;
            finalText = finalText.substring(tag.prefix.length).trim();
            break;
          }
        }
        const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
        let imgHtml = "";
        const imgMatches = Array.from(finalText.matchAll(imgRegex));
        imgMatches.forEach((m) => {
          const imgName = m[1].split("|")[0];
          const file = this.app.metadataCache.getFirstLinkpathDest(imgName, sourcePath);
          if (file) {
            const imgSrc = this.app.vault.getResourcePath(file);
            imgHtml += `<img src="${imgSrc}" style="max-width: 100%; border-radius: 4px; margin-top: 5px; display: block;" />`;
          }
        });
        finalText = finalText.replace(imgRegex, "").trim();
        const compassRegex = /\[(North|South|East|West)::\s*\[\[([\s\S]*?)\]\]\]/gi;
        finalText = finalText.replace(compassRegex, "").trim();
        const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
        finalText = finalText.replace(linkRegex, "").trim();
        const safeOriginal = encodeURIComponent(fullMatch);
        const borderStyle = direction === ">" ? `border-right: 3px solid ${matchedColor};` : `border-left: 3px solid ${matchedColor};`;
        marginaliasToInject += `<span class="cornell-print-margin" data-original="${safeOriginal}" data-direction="${direction}" style="${borderStyle} color: ${matchedColor};">${finalText}${imgHtml}</span>`;
        cleanLine = cleanLine.replace(fullMatch, "").trim();
        regex.lastIndex = 0;
      }
      return marginaliasToInject.length > 0 ? marginaliasToInject + " " + cleanLine : line;
    });
    const newContent = newLines.join("\n");
    if (modified) {
      editor.setValue(newContent);
      new import_obsidian4.Notice("\xA1Nota preparada para imprimir! Enlaces ocultos e im\xE1genes procesadas.");
    } else {
      new import_obsidian4.Notice("No se encontraron marginalias para convertir.");
    }
  }
  async restoreFromPrint(editor) {
    let content = editor.getValue();
    let modified = false;
    const newContent = content.replace(/<span class="cornell-print-margin" data-original="(.*?)".*?<\/span>/gs, (match, safeOriginal) => {
      modified = true;
      return decodeURIComponent(safeOriginal);
    });
    if (modified) {
      editor.setValue(newContent);
      new import_obsidian4.Notice("\xA1Nota restaurada a formato Markdown original!");
    } else {
      new import_obsidian4.Notice("No hay marginalias preparadas para restaurar.");
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
  RhizomeView
});
