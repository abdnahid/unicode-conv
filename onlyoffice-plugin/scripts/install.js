// Copies the built plugin into ONLYOFFICE Desktop Editors' user plugin folder (Linux).
// Restart the editors afterwards.
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
const folderName = config.guid.replace(/^asc\./, "");
const source = path.join(root, "dist", folderName);

if (process.platform !== "linux") {
  console.error("This script installs into the Linux Desktop Editors folder.");
  console.error("On other systems, use Plugins > Plugin Manager > Install plugin manually with dist/bangla-converter.plugin.");
  process.exit(1);
}
if (!fs.existsSync(source)) {
  console.error("Build first: npm run build");
  process.exit(1);
}

const pluginsDir = path.join(os.homedir(), ".local/share/onlyoffice/desktopeditors/sdkjs-plugins");
const target = path.join(pluginsDir, folderName);
fs.mkdirSync(pluginsDir, { recursive: true });
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Installed to ${target}`);
console.log("Restart ONLYOFFICE Desktop Editors, then open a spreadsheet: Plugins tab > Bangla Converter.");
