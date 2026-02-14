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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CornellMarginalia
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var MarginNoteWidget = class extends import_view.WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-cornell-margin";
    div.textContent = this.text;
    div.onclick = (e) => e.preventDefault();
    return div;
  }
  ignoreEvent() {
    return false;
  }
};
var cornellPlugin = import_view.ViewPlugin.fromClass(class {
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
    const { state } = view;
    const cursorRanges = state.selection.ranges;
    for (const { from, to } of view.visibleRanges) {
      const text = state.doc.sliceString(from, to);
      const regex = /%%>(.*?)%%/g;
      let match;
      while (match = regex.exec(text)) {
        const start = from + match.index;
        const end = start + match[0].length;
        let isCursorInside = false;
        for (const range of cursorRanges) {
          if (range.from >= start && range.to <= end) {
            isCursorInside = true;
            break;
          }
        }
        if (isCursorInside) {
          continue;
        }
        builder.add(start, end, import_view.Decoration.replace({
          widget: new MarginNoteWidget(match[1])
        }));
      }
    }
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations
});
var CornellMarginalia = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      console.log("Cornell Marginalia (Modo Comentarios) cargado \u{1FA7A}");
      this.registerEditorExtension(cornellPlugin);
    });
  }
};
