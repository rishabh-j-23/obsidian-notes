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
  default: () => CornellMarginalia
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_state = require("@codemirror/state");
var import_language = require("@codemirror/language");
var import_view = require("@codemirror/view");
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
  lastOmniDestination: "Marginalia Inbox"
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
    import_obsidian.MarkdownRenderer.render(this.app, finalRenderText, div, this.sourcePath, new import_obsidian.Component());
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
var ConfirmStitchModal = class extends import_obsidian.Modal {
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
      new import_obsidian.Notice("Stitching cancelled.");
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
var DoodleModal = class extends import_obsidian.Modal {
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
    const clearBtn = btnContainer.createEl("button", { text: "\u{1F5D1}\uFE0F Clear" });
    clearBtn.onclick = () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const rightBtns = btnContainer.createDiv();
    rightBtns.style.display = "flex";
    rightBtns.style.gap = "10px";
    const cancelBtn = rightBtns.createEl("button", { text: "Cancel" });
    cancelBtn.onclick = () => this.close();
    const saveBtn = rightBtns.createEl("button", { text: "\u{1F4BE} Save to Margin", cls: "mod-cta" });
    saveBtn.style.backgroundColor = "var(--interactive-accent)";
    saveBtn.style.color = "var(--text-on-accent)";
    saveBtn.onclick = () => this.saveDoodle();
  }
  async saveDoodle() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const arrayBuffer = base64ToArrayBuffer(base64Data);
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
      new import_obsidian.Notice("\u270F\uFE0F Doodle saved!");
      this.close();
    } catch (error) {
      new import_obsidian.Notice("Error saving doodle. Check console.");
      console.error(error);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
var _OmniCaptureModal = class _OmniCaptureModal extends import_obsidian.Modal {
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
  }
  async saveCapture() {
    const thought = this.thoughtInput.value.trim();
    const context = this.clipboardInput.value.trim();
    const destName = this.destinationInput.value.trim() || "Marginalia Inbox";
    if (!thought && !context && !this.hasDoodle && !this.clipboardImageData) {
      new import_obsidian.Notice("Capture is empty!");
      return;
    }
    if (this.plugin.settings.lastOmniDestination !== destName) {
      this.plugin.settings.lastOmniDestination = destName;
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
      let attachmentPath = fileName;
      try {
        attachmentPath = await this.app.fileManager.getAvailablePathForAttachment(fileName, "");
      } catch (e) {
        attachmentPath = fileName;
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
    const file = this.app.vault.getAbstractFileByPath(`${destName}.md`);
    try {
      if (file instanceof import_obsidian.TFile) {
        await this.app.vault.append(file, finalMd);
      } else {
        await this.app.vault.create(`${destName}.md`, `# \u{1F4E5} ${destName}
` + finalMd);
      }
      new import_obsidian.Notice(`\u2705 Capture injected into ${destName}`);
      this.close();
    } catch (error) {
      new import_obsidian.Notice("Error saving capture. Check console.");
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
var CornellNotesView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.currentTab = "current";
    this.isStitchingMode = false;
    this.sourceStitchItem = null;
    this.searchQuery = "";
    this.activeColorFilters = /* @__PURE__ */ new Set();
    this.cachedItems = [];
    this.draggedSidebarItems = null;
    this.isGroupedByContent = false;
    this.pinboardItems = [];
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
  renderUI() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("cornell-sidebar-container");
    container.createEl("h4", { text: "Marginalia Explorer", cls: "cornell-sidebar-title" });
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
    const searchInput = filterContainer.createEl("input", { type: "text", placeholder: "Search notes...", cls: "cornell-search-bar" });
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
      new import_obsidian.Notice("Scanning...");
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
  async scanNotes() {
    if (this.currentTab === "pinboard") {
      this.applyFiltersAndRender();
      return;
    }
    const contentDiv = this.containerEl.querySelector(".cornell-sidebar-content");
    if (!contentDiv) return;
    contentDiv.empty();
    contentDiv.createEl("p", { text: "Scanning vault...", cls: "cornell-sidebar-empty" });
    const allItemsFlat = [];
    const defaultColor = "var(--text-accent)";
    let filesToScan = [];
    if (this.currentTab === "current") {
      const activeFile = this.plugin.app.workspace.getActiveFile();
      if (activeFile) filesToScan.push(activeFile);
    } else {
      filesToScan = this.plugin.app.vault.getMarkdownFiles();
      const ignoredPaths = this.plugin.settings.ignoredFolders.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      filesToScan = filesToScan.filter((f) => !ignoredPaths.some((p) => f.path.startsWith(p)));
    }
    for (const file of filesToScan) {
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineRegex = /%%[><](.*?)%%/g;
        let match;
        while ((match = lineRegex.exec(line)) !== null) {
          let noteContent = match[1].trim();
          if (noteContent.endsWith(";;")) noteContent = noteContent.slice(0, -2).trim();
          const rawTextForStitching = noteContent;
          const imgRegex = /img:\s*\[\[(.*?)\]\]/gi;
          const hasImage = imgRegex.test(noteContent);
          let cleanText = noteContent.replace(imgRegex, "").trim();
          const linkRegex = /(?<!!)\[\[(.*?)\]\]/g;
          const outgoingLinks = [];
          const linkMatches = Array.from(cleanText.matchAll(linkRegex));
          linkMatches.forEach((m) => outgoingLinks.push(m[1]));
          cleanText = cleanText.replace(linkRegex, "").trim();
          let matchedColor = defaultColor;
          for (const tag of this.plugin.settings.tags) {
            if (cleanText.startsWith(tag.prefix)) {
              matchedColor = tag.color;
              cleanText = cleanText.substring(tag.prefix.length).trim();
              break;
            }
          }
          if (cleanText.length === 0) {
            if (hasImage) {
              cleanText = "\u{1F5BC}\uFE0F [Image]";
            } else {
              continue;
            }
          }
          const blockIdMatch = line.match(/\^([a-zA-Z0-9]+)\s*$/);
          const existingBlockId = blockIdMatch ? blockIdMatch[1] : null;
          allItemsFlat.push({
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
    const topControls = container.createDiv({ cls: "cornell-pinboard-controls" });
    topControls.style.display = "flex";
    topControls.style.flexDirection = "column";
    topControls.style.gap = "10px";
    topControls.style.marginBottom = "20px";
    const exportRow = topControls.createDiv();
    exportRow.style.display = "flex";
    exportRow.style.gap = "5px";
    const exportBtn = exportRow.createEl("button", { text: "\u{1F4DD} Note" });
    exportBtn.style.flex = "1";
    exportBtn.style.backgroundColor = "var(--interactive-accent)";
    exportBtn.style.color = "var(--text-on-accent)";
    exportBtn.style.fontWeight = "bold";
    exportBtn.style.border = "none";
    exportBtn.style.cursor = "pointer";
    exportBtn.onclick = () => this.exportPinboard();
    const exportMindmapBtn = exportRow.createEl("button", { text: "\u{1F4CB} Clip" });
    exportMindmapBtn.style.flex = "1";
    exportMindmapBtn.style.backgroundColor = "var(--color-green)";
    exportMindmapBtn.style.color = "#fff";
    exportMindmapBtn.style.fontWeight = "bold";
    exportMindmapBtn.style.border = "none";
    exportMindmapBtn.style.cursor = "pointer";
    exportMindmapBtn.onclick = () => this.exportMindmap();
    const exportCanvasBtn = exportRow.createEl("button", { text: "\u{1F3A8} Canvas" });
    exportCanvasBtn.style.flex = "1";
    exportCanvasBtn.style.backgroundColor = "var(--color-purple)";
    exportCanvasBtn.style.color = "#fff";
    exportCanvasBtn.style.fontWeight = "bold";
    exportCanvasBtn.style.border = "none";
    exportCanvasBtn.style.cursor = "pointer";
    exportCanvasBtn.onclick = () => this.exportCanvas();
    const titleRow = topControls.createDiv();
    titleRow.style.display = "flex";
    titleRow.style.gap = "5px";
    const titleInput = titleRow.createEl("input", { type: "text", placeholder: "Add title (Ej: ## My amazing title)" });
    titleInput.style.flexGrow = "1";
    titleInput.style.backgroundColor = "var(--background-modifier-form-field)";
    titleInput.style.border = "1px solid var(--background-modifier-border)";
    const addTitleBtn = titleRow.createEl("button", { text: "\u2795" });
    addTitleBtn.onclick = () => {
      const val = titleInput.value.trim();
      if (val) {
        this.pinboardItems.push({
          text: val,
          rawText: val,
          color: "transparent",
          file: null,
          line: -1,
          blockId: null,
          outgoingLinks: [],
          isTitle: true
        });
        this.applyFiltersAndRender();
      }
    };
    if (this.pinboardItems.length === 0) {
      container.createEl("p", { text: "Your Board is empty. Start by adding a title or pinning notes!", cls: "cornell-sidebar-empty" });
      return;
    }
    let draggedIndex = null;
    const listContainer = container.createDiv();
    this.pinboardItems.forEach((item, index) => {
      let itemWrapper = listContainer.createDiv();
      itemWrapper.setAttr("draggable", "true");
      itemWrapper.style.cursor = "grab";
      itemWrapper.style.marginBottom = "5px";
      const indent = item.indentLevel || 0;
      itemWrapper.style.marginLeft = `${indent * 20}px`;
      itemWrapper.style.transition = "margin-left 0.2s ease";
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
        itemWrapper.createSpan({ text: match ? match[2] : item.text });
        const delBtn = itemWrapper.createSpan({ text: "\xD7", title: "Borrar t\xEDtulo" });
        delBtn.style.cursor = "pointer";
        delBtn.onclick = () => {
          this.pinboardItems.splice(index, 1);
          this.applyFiltersAndRender();
        };
      } else {
        const marginaliaDOM = this.createItemDiv(item, itemWrapper, true, index);
        marginaliaDOM.setAttr("draggable", "false");
      }
      itemWrapper.addEventListener("dragstart", (e) => {
        draggedIndex = index;
        itemWrapper.style.opacity = "0.4";
        e.stopPropagation();
      });
      itemWrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        itemWrapper.style.borderTop = "3px solid var(--interactive-accent)";
      });
      itemWrapper.addEventListener("dragleave", () => {
        itemWrapper.style.borderTop = "";
      });
      itemWrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        itemWrapper.style.borderTop = "";
        if (draggedIndex !== null && draggedIndex !== index) {
          const itemToMove = this.pinboardItems[draggedIndex];
          this.pinboardItems.splice(draggedIndex, 1);
          const targetIndex = draggedIndex < index ? index - 1 : index;
          this.pinboardItems.splice(targetIndex, 0, itemToMove);
          this.applyFiltersAndRender();
        }
      });
      itemWrapper.addEventListener("dragend", () => {
        itemWrapper.style.opacity = "1";
        draggedIndex = null;
      });
    });
  }
  async exportPinboard() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const fileName = `Pinboard_${dateStr}.md`;
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
      new import_obsidian.Notice("Pinboard compiled successfully!");
      this.pinboardItems = [];
      this.applyFiltersAndRender();
    } catch (error) {
      new import_obsidian.Notice("Error creating Pinboard file. Check console.");
    }
  }
  // 🌳 NUEVA FUNCIÓN: Exportador al Portapapeles para Mindmaps (Excalidraw)
  async exportMindmap() {
    if (this.pinboardItems.length === 0) {
      new import_obsidian.Notice("El Board est\xE1 vac\xEDo.");
      return;
    }
    let content = "";
    for (const item of this.pinboardItems) {
      if (item.isTitle) {
        const text = item.text.startsWith("#") ? item.text : `# ${item.text}`;
        content += `${text}
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
      new import_obsidian.Notice("\u{1F4CB} \xA1Mindmap copiado! Ve a Excalidraw y presiona Ctrl+V");
    } catch (error) {
      new import_obsidian.Notice("Error al copiar al portapapeles. Revisa la consola.");
      console.error(error);
    }
  }
  // 🎨 NUEVO MOTOR: Generador Automático de Canvas (Tablero de Evidencia)
  async exportCanvas() {
    if (this.pinboardItems.length === 0) return;
    const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
    const fileName = `EvidenceBoard_${dateStr}.canvas`;
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
      new import_obsidian.Notice("\u{1F3A8} Evidence Board created successfully!");
    } catch (error) {
      new import_obsidian.Notice("Error creating Canvas file. Check console.");
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
    for (const [color, items] of Object.entries(results)) {
      if (items.length === 0) continue;
      totalFound += items.length;
      const groupHeader = container.createDiv({ cls: "cornell-sidebar-group" });
      const colorDot = groupHeader.createSpan({ cls: "cornell-sidebar-color-dot" });
      colorDot.style.backgroundColor = color;
      groupHeader.createSpan({ text: `${items.length} notes` });
      for (const item of items) {
        this.createItemDiv(item, container);
      }
    }
    if (totalFound === 0) container.createEl("p", { text: "No notes match your search.", cls: "cornell-sidebar-empty" });
  }
  createItemDiv(item, parentContainer, isPinboardView = false, pinIndex = -1) {
    const itemDiv = parentContainer.createDiv({ cls: "cornell-sidebar-item" });
    itemDiv.style.borderLeftColor = item.color;
    const textRow = itemDiv.createDiv({ cls: "cornell-sidebar-item-text" });
    textRow.style.display = "flex";
    textRow.style.justifyContent = "space-between";
    textRow.style.alignItems = "flex-start";
    const textSpan = textRow.createSpan({ text: item.text });
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
            new import_obsidian.Notice("Cannot connect a note to itself.");
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
        if (!isHovering) return;
        const content = await this.plugin.app.vault.cachedRead(item.file);
        if (!isHovering) return;
        if (!document.body.contains(itemDiv)) return;
        const lines = content.split("\n");
        const startLine = Math.max(0, item.line - 1);
        const endLine = Math.min(lines.length - 1, item.line + 1);
        let contextText = "";
        for (let i = startLine; i <= endLine; i++) {
          let cleanLine = lines[i].replace(/%%[><](.*?)%%/g, "").trim();
          if (cleanLine) {
            if (i === item.line) {
              contextText += `<div class="cornell-hover-highlight">${cleanLine}</div>`;
            } else {
              contextText += `<div class="cornell-hover-text-line">${cleanLine}</div>`;
            }
          }
        }
        if (!contextText) contextText = "<div class='cornell-hover-text-line'><i>No text context available.</i></div>";
        document.querySelectorAll(".cornell-hover-tooltip").forEach((el) => el.remove());
        tooltipEl = document.createElement("div");
        tooltipEl.className = "cornell-hover-tooltip";
        const header = tooltipEl.createDiv({ cls: "cornell-hover-context" });
        header.innerHTML = `<span>\u{1F4C4} <b>${item.file.basename}</b></span> <span>L${item.line + 1}</span>`;
        const body = tooltipEl.createDiv();
        body.innerHTML = contextText;
        document.body.appendChild(tooltipEl);
        const rect = itemDiv.getBoundingClientRect();
        let leftPos = rect.left - 340;
        if (leftPos < 10) leftPos = rect.right + 20;
        tooltipEl.style.left = `${leftPos}px`;
        tooltipEl.style.top = `${Math.min(rect.top, window.innerHeight - 150)}px`;
        requestAnimationFrame(() => {
          if (tooltipEl) tooltipEl.addClass("is-visible");
        });
      }, 600);
    });
    itemDiv.addEventListener("mouseleave", removeTooltip);
    if (!isPinboardView) {
      itemDiv.setAttr("draggable", "true");
      itemDiv.addEventListener("dragstart", (event) => {
        removeTooltip();
        if (!event.dataTransfer) return;
        event.dataTransfer.effectAllowed = "copy";
        let targetId = item.blockId;
        if (!targetId) {
          targetId = Math.random().toString(36).substring(2, 8);
          item.blockId = targetId;
          this.injectBackgroundBlockId(item.file, item.line, targetId);
        }
        const dragPayload = `[[${item.file.basename}#^${targetId}|${item.text}]]`;
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
      new import_obsidian.Notice(`Stitching ${totalLinks} thread(s)... \u26D3\uFE0E`);
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
      new import_obsidian.Notice("\xA1Hilos conectados con \xE9xito! \u2728");
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
};
var CornellSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Cornell Marginalia Settings" });
    containerEl.createEl("h3", { text: "General Appearance" });
    new import_obsidian.Setting(containerEl).setName("Enable in Reading View").setDesc("Shows marginalia in reading mode. Turn this off if you prefer a clean view.").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableReadingView).onChange(async (value) => {
      this.plugin.settings.enableReadingView = value;
      await this.plugin.saveSettings();
      new import_obsidian.Notice("Reload the note to see changes in Reading View");
    }));
    new import_obsidian.Setting(containerEl).setName("Margin Alignment").addDropdown((d) => d.addOption("left", "Left").addOption("right", "Right").setValue(this.plugin.settings.alignment).onChange(async (v) => {
      this.plugin.settings.alignment = v;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    new import_obsidian.Setting(containerEl).setName("Margin Width (%)").addSlider((s) => s.setLimits(15, 60, 1).setValue(this.plugin.settings.marginWidth).setDynamicTooltip().onChange(async (v) => {
      this.plugin.settings.marginWidth = v;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    new import_obsidian.Setting(containerEl).setName("Font Size").addText((t) => t.setValue(this.plugin.settings.fontSize).onChange(async (v) => {
      this.plugin.settings.fontSize = v;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    new import_obsidian.Setting(containerEl).setName("Font Family").addText((t) => t.setValue(this.plugin.settings.fontFamily).onChange(async (v) => {
      this.plugin.settings.fontFamily = v;
      await this.plugin.saveSettings();
      this.plugin.updateStyles();
    }));
    containerEl.createEl("h3", { text: "Color Tags" });
    this.plugin.settings.tags.forEach((tag, index) => {
      new import_obsidian.Setting(containerEl).setName(`Tag ${index + 1}`).addText((t) => t.setValue(tag.prefix).onChange(async (v) => {
        this.plugin.settings.tags[index].prefix = v;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.updateOptions();
      })).addColorPicker((c) => c.setValue(tag.color).onChange(async (v) => {
        this.plugin.settings.tags[index].color = v;
        await this.plugin.saveSettings();
        this.plugin.app.workspace.updateOptions();
      })).addButton((b) => b.setIcon("trash").onClick(async () => {
        this.plugin.settings.tags.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
        this.plugin.app.workspace.updateOptions();
      }));
    });
    new import_obsidian.Setting(containerEl).addButton((b) => b.setButtonText("Add Tag").onClick(async () => {
      this.plugin.settings.tags.push({ prefix: "New", color: "#888" });
      await this.plugin.saveSettings();
      this.display();
    }));
    containerEl.createEl("h3", { text: "Advanced" });
    new import_obsidian.Setting(containerEl).setName("Ignored Folders").addTextArea((t) => t.setValue(this.plugin.settings.ignoredFolders).onChange(async (v) => {
      this.plugin.settings.ignoredFolders = v;
      await this.plugin.saveSettings();
      this.plugin.app.workspace.updateOptions();
    }));
  }
};
var CornellMarginalia = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.activeRecallMode = false;
  }
  async onload() {
    await this.loadSettings();
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
        new import_obsidian.Notice(`Reading View Marginalia: ${statusMessage}
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
          import_obsidian.MarkdownRenderer.render(this.app, finalRenderText, marginDiv, ctx.sourcePath, this);
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
  toggleActiveRecall() {
    this.activeRecallMode = !this.activeRecallMode;
    new import_obsidian.Notice(this.activeRecallMode ? "Active Recall Mode: ON \u{1F648}" : "Active Recall Mode: OFF \u{1F441}\uFE0F");
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
      new import_obsidian.Notice("No active recall notes (ending in ;;) found.");
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
        new import_obsidian.Notice(`Added ${newFlashcards.length} new flashcards.`);
      } else {
        new import_obsidian.Notice("All flashcards are already up to date!");
      }
    } else {
      newFlashcards = Array.from(foundFlashcards);
      const textToAppend = `

${headerText}
${newFlashcards.join("\n")}`;
      const lastLine = editor.lineCount();
      editor.replaceRange(textToAppend, { line: lastLine, ch: 0 });
      new import_obsidian.Notice(`Generated section with ${newFlashcards.length} flashcards.`);
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
    const newContent = content.replace(/%%>(.*?)%%/g, (match, noteContent) => {
      modified = true;
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
      const safeOriginal = encodeURIComponent(match);
      return `<span class="cornell-print-margin" data-original="${safeOriginal}" style="border-right: 3px solid ${matchedColor}; color: ${matchedColor};">${finalText}</span>`;
    });
    if (modified) {
      editor.setValue(newContent);
      new import_obsidian.Notice("\xA1Nota preparada para imprimir! Exporta a PDF ahora.");
    } else {
      new import_obsidian.Notice("No se encontraron marginalias para convertir.");
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
      new import_obsidian.Notice("\xA1Nota restaurada a formato Markdown original!");
    } else {
      new import_obsidian.Notice("No hay marginalias preparadas para restaurar.");
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CORNELL_VIEW_TYPE
});
