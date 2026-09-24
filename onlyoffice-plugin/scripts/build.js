// Builds the ONLYOFFICE plugin:
//   dist/{GUID}/                  plugin folder (what goes into sdkjs-plugins)
//   dist/bangla-converter.plugin  the same folder zipped, for Plugin Manager > "Install plugin manually"
//   dist/custom-functions.js      the formula library on its own, for pasting into View > Macros
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const esbuild = require("esbuild");
const { png, crc32 } = require("../../excel-addin/scripts/make-icons");

const root = path.join(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
const folderName = config.guid.replace(/^asc\./, "");
const out = path.join(dist, folderName);

// Stable id for our entry in the editor's custom-functions store; don't change it,
// or upgrades will add a second copy instead of replacing the first.
const LIBRARY_GUID = "e2e3ebfb3dc84a3181d2faab50265fdd";
const ICON_SCALES = { "": 28, "@1.25x": 35, "@1.5x": 42, "@1.75x": 49, "@2x": 56 };

function buildConverter() {
  const result = esbuild.buildSync({
    entryPoints: [path.join(src, "converter.ts")],
    bundle: true,
    format: "iife",
    globalName: "BanglaConverter",
    minify: true,
    target: "es2017",
    charset: "utf8",
    legalComments: "none",
    write: false,
  });
  return result.outputFiles[0].text.trim();
}

// The editor parses every /** */ block in the library in order and pairs them with the
// AddCustomFunction() calls, and it refuses code containing `import`. Fail the build if
// the embedded converter would break either rule.
function buildLibrary(converter) {
  const template = fs.readFileSync(path.join(src, "functions.js"), "utf8");
  const code = template.replace("/*__CONVERTER__*/", () => converter);
  const jsDocBlocks = (code.match(/\/\*\*/g) || []).length;
  const registrations = (code.match(/\.AddCustomFunction\(/g) || []).length;
  if (jsDocBlocks !== registrations) {
    throw new Error(`Library has ${jsDocBlocks} JSDoc blocks but ${registrations} AddCustomFunction calls`);
  }
  if (/\bimport\s*\(/.test(code) || /\bimport\s+/.test(code)) {
    throw new Error("Library contains `import`, which the editor's macro sandbox rejects");
  }
  return code;
}

function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return (day << 16) | time;
}

function zip(files) {
  const stamp = dosDateTime(new Date()) >>> 0;
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, "utf8");
    const compressed = zlib.deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(stamp, 10); // time/date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(stamp, 12);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + compressed.length;
  }
  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, end]);
}

function main() {
  const converter = buildConverter();
  const library = buildLibrary(converter);

  const files = [
    { name: "config.json", data: fs.readFileSync(path.join(root, "config.json")) },
    { name: "index.html", data: fs.readFileSync(path.join(src, "index.html")) },
    { name: "panel.js", data: fs.readFileSync(path.join(src, "panel.js")) },
    { name: "panel.css", data: fs.readFileSync(path.join(src, "panel.css")) },
    { name: "converter.js", data: Buffer.from(converter + "\n") },
    {
      name: "library.js",
      data: Buffer.from(
        "window.BANGLA_LIBRARY = " +
          JSON.stringify({ guid: LIBRARY_GUID, name: config.name, code: library }) +
          ";\n",
      ),
    },
  ];
  for (const theme of ["light", "dark"]) {
    for (const [suffix, size] of Object.entries(ICON_SCALES)) {
      files.push({ name: `resources/${theme}/icon${suffix}.png`, data: png(size) });
    }
  }

  // Empty dist/ rather than deleting it, so a shell sitting inside it doesn't block the build.
  fs.mkdirSync(dist, { recursive: true });
  for (const entry of fs.readdirSync(dist)) {
    fs.rmSync(path.join(dist, entry), { recursive: true, force: true });
  }
  for (const { name, data } of files) {
    const target = path.join(out, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
  fs.writeFileSync(path.join(dist, "bangla-converter.plugin"), zip(files));
  fs.writeFileSync(path.join(dist, "custom-functions.js"), library);

  console.log(`dist/${folderName}/`);
  console.log("dist/bangla-converter.plugin");
  console.log("dist/custom-functions.js");
}

main();
