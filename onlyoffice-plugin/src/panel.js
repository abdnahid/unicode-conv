// Bangla Converter panel: installs the TOANSI/TOUNICODE formulas and converts selected cells in place.
// Kept as plain JavaScript (not bundled): callCommand() serializes the command functions with
// toString() and runs them inside the editor, so they must stay self-contained.
(function (window) {
  "use strict";

  var plugin = window.Asc.plugin;
  var SETTINGS_KEY = "bangla-converter-settings";
  var defaults = {
    changeFont: true,
    ansiFont: "SutonnyMJ",
    unicodeFont: "Noto Sans Bengali",
    onlyBijoyFont: true,
  };

  // Bijoy fonts are conventionally named "...MJ" (SutonnyMJ, SulekhaMJ, Sutonny OMJ, ...).
  function isBijoyFont(name) {
    return !!name && /MJ\s*$/i.test(name);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function loadSettings() {
    var saved = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch (e) {
      saved = {};
    }
    return Object.assign({}, defaults, saved);
  }

  function readSettings() {
    var settings = {
      changeFont: $("change-font").checked,
      ansiFont: $("ansi-font").value.trim() || defaults.ansiFont,
      unicodeFont: $("unicode-font").value.trim() || defaults.unicodeFont,
      onlyBijoyFont: $("only-bijoy-font").checked,
    };
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      // Storage can be unavailable; settings just won't persist.
    }
    return settings;
  }

  function showStatus(message, kind) {
    var status = $("status");
    status.textContent = message;
    status.className = "status " + (kind || "info");
  }

  // --- Custom functions ---------------------------------------------------------------
  // Registered through the same store the Macros plugin uses, which the editor keeps
  // app-wide, so the formulas work in every spreadsheet once installed.

  function installFunctions() {
    var library = window.BANGLA_LIBRARY;
    plugin.executeMethod("GetCustomFunctions", [], function (data) {
      var store = { macrosArray: [], current: -1 };
      if (data) {
        try {
          store = JSON.parse(data);
        } catch (e) {
          store = { macrosArray: [], current: -1 };
        }
      }
      if (!store.macrosArray) store.macrosArray = [];

      var existing = null;
      for (var i = 0; i < store.macrosArray.length; i++) {
        if (store.macrosArray[i].guid === library.guid) existing = store.macrosArray[i];
      }
      if (existing && existing.value === library.code) {
        $("formula-status").textContent = "Formulas are installed and available in every spreadsheet.";
        return;
      }
      if (existing) {
        existing.value = library.code;
      } else {
        store.macrosArray.push({ guid: library.guid, name: library.name, value: library.code });
      }
      plugin.executeMethod("SetCustomFunctions", [JSON.stringify(store)], function () {
        $("formula-status").textContent = existing
          ? "Formulas updated to the latest version."
          : "Formulas installed. They are now available in every spreadsheet.";
      });
    });
  }

  // --- In-place conversion ------------------------------------------------------------

  // Runs inside the editor. Returns the text cells of the selection (limited to the used range).
  function readSelectionCommand() {
    var sheet = Api.GetActiveSheet();
    var result = { sheet: sheet.GetName(), cells: [] };
    var target = null;
    try {
      target = Api.Intersect(Api.GetSelection(), sheet.GetUsedRange());
    } catch (e) {
      target = null;
    }
    if (!target) return result;

    var wantFont = Asc.scope.wantFont;
    target.ForEach(function (cell) {
      var value = cell.GetValue();
      if (typeof value !== "string" || value === "") return;
      var formula = cell.GetFormula();
      var isFormula = typeof formula === "string" && formula.charAt(0) === "=";
      var font = "";
      if (wantFont && !isFormula) {
        try {
          font = cell.GetCharacters(1, 1).GetFont().GetName() || "";
        } catch (e) {
          font = "";
        }
      }
      result.cells.push([cell.GetAddress(false, false), value, isFormula, font]);
    });
    return result;
  }

  // Runs inside the editor. Writes the converted values (and optionally the font) back.
  function writeCellsCommand() {
    var sheet = Api.GetSheet(Asc.scope.sheet);
    var updates = Asc.scope.updates;
    var font = Asc.scope.font;
    for (var i = 0; i < updates.length; i++) {
      var range = sheet.GetRange(updates[i][0]);
      range.SetValue(updates[i][1]);
      if (font) range.SetFontName(font);
    }
    return updates.length;
  }

  function callCommand(command, recalc) {
    return new Promise(function (resolve) {
      plugin.callCommand(command, false, recalc, resolve);
    });
  }

  async function convertSelection(direction) {
    var settings = readSettings();
    var converter = window.BanglaConverter;
    var toUnicode = direction === "toUnicode";
    var counts = { converted: 0, skippedFormulas: 0, skippedFont: 0 };

    window.Asc.scope.wantFont = toUnicode && settings.onlyBijoyFont;
    var selection = await callCommand(readSelectionCommand, false);
    if (!selection || !selection.cells) return counts;

    var updates = [];
    selection.cells.forEach(function (cell) {
      var address = cell[0], value = cell[1], isFormula = cell[2], font = cell[3];
      if (isFormula) {
        counts.skippedFormulas++;
        return;
      }
      var converted;
      if (toUnicode) {
        if (converter.isUnicode(value)) return;
        if (settings.onlyBijoyFont && !isBijoyFont(font)) {
          counts.skippedFont++;
          return;
        }
        converted = converter.bijoyToUnicode(value);
      } else {
        if (!converter.isUnicode(value)) return;
        converted = converter.unicodeToBijoy(value);
      }
      if (converted !== value) updates.push([address, converted]);
    });

    if (updates.length) {
      window.Asc.scope.sheet = selection.sheet;
      window.Asc.scope.updates = updates;
      window.Asc.scope.font = settings.changeFont ? (toUnicode ? settings.unicodeFont : settings.ansiFont) : "";
      await callCommand(writeCellsCommand, true);
    }
    counts.converted = updates.length;
    return counts;
  }

  function describe(counts) {
    var parts = ["Converted " + counts.converted + " cell" + (counts.converted === 1 ? "" : "s") + "."];
    if (counts.skippedFormulas) {
      parts.push("Skipped " + counts.skippedFormulas + " formula cell(s); use =TOANSI() / =TOUNICODE() for those.");
    }
    if (counts.skippedFont) {
      parts.push(
        "Skipped " + counts.skippedFont + " cell(s) not in a Bijoy (…MJ) font. " +
        'Untick "Only convert cells in a Bijoy font" to include them.'
      );
    }
    return parts.join(" ");
  }

  async function run(direction) {
    var buttons = document.querySelectorAll("button");
    buttons.forEach(function (b) { b.disabled = true; });
    showStatus("Converting…");
    try {
      var counts = await convertSelection(direction);
      showStatus(describe(counts), counts.converted ? "ok" : "info");
    } catch (error) {
      showStatus("Error: " + (error && error.message ? error.message : String(error)), "error");
    } finally {
      buttons.forEach(function (b) { b.disabled = false; });
    }
  }

  plugin.init = function () {
    var settings = loadSettings();
    $("change-font").checked = settings.changeFont;
    $("ansi-font").value = settings.ansiFont;
    $("unicode-font").value = settings.unicodeFont;
    $("only-bijoy-font").checked = settings.onlyBijoyFont;

    $("to-ansi").addEventListener("click", function () { run("toAnsi"); });
    $("to-unicode").addEventListener("click", function () { run("toUnicode"); });

    installFunctions();
  };

  plugin.button = function () {
    this.executeCommand("close", "");
  };
})(window);
