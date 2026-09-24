Markdown
# @abdalgolabs/ansi-unicode-converter

![npm version](https://img.shields.io/npm/v/@abdalgolabs/ansi-unicode-converter)
![license](https://img.shields.io/npm/l/@abdalgolabs/ansi-unicode-converter)

A professional, lightweight, and high-performance Bengali language converter. Seamlessly switch between **Bijoy (ANSI)** and **Unicode** encoding. Developed by **ABDNAHID** under **ABDALGOLABS**.

This package is designed to work in Node.js environments, browser-based projects, and even as a remote API for Excel.

## Features

- ✅ **Bijoy to Unicode**: Convert legacy ANSI text to modern Unicode.
- ✅ **Unicode to Bijoy**: Convert Unicode to ANSI for use with fonts like *SutonnyMJ*.
- ✅ **Smart Detection**: Automatically detects if a string is already Unicode to prevent double conversion.
- ✅ **TypeScript Native**: Full type definitions included for a great developer experience.
- ✅ **Excel Friendly**: Ready to be used with Excel's `WEBSERVICE` function.

## Installation

```bash
npm install @abdalgolabs/ansi-unicode-converter
```

## :hammer_and_wrench: Usage

#### 1. In Node.js / TypeScript
```
import { bijoyToUnicode, unicodeToBijoy, isUnicode } from '@abdalgolabs/ansi-unicode-converter';

// Convert Bijoy to Unicode
const ansiText = "Avgvi †mvbvi evsjv";
const unicodeResult = bijoyToUnicode(ansiText);
console.log(unicodeResult); // আমার সোনার বাংলা

// Convert Unicode to Bijoy
const uniText = "আমার সোনার বাংলা";
const ansiResult = unicodeToBijoy(uniText);
console.log(ansiResult); // Avgvi †mvbvi evsjv

// Check if text is already Unicode
console.log(isUnicode("Hello")); // false
console.log(isUnicode("আমার")); // true
```

#### 2. Excel Add-in (recommended for Excel)
The `excel-addin/` folder contains an Office Add-in that runs the converter inside Excel on Windows, Mac and the web. Conversion happens locally, with no API calls per cell.

- **Formulas:** `=BANGLA.TOANSI(A1)` (Unicode → Bijoy) and `=BANGLA.TOUNICODE(A1)` (Bijoy → Unicode). Both accept ranges, e.g. `=BANGLA.TOANSI(A1:A100)`, and spill the results.
- **Task pane** (Home → Bangla Converter): converts the selected cells in place and optionally switches their font (SutonnyMJ / Nirmala UI). Formula cells are never overwritten. When converting to Unicode, it only touches cells in a Bijoy (`…MJ`) font by default, so English text isn't garbled.

**Try it locally** (desktop Excel on Windows/Mac):
```bash
cd excel-addin
npm install
npm start        # trusts a localhost dev certificate, starts https://localhost:3000 and sideloads into Excel
npm stop         # when done
```

**Host it for real use:** deploy `excel-addin/` as its own Vercel project (Root Directory `excel-addin`; `vercel.json` is included). Set the env var `ADDIN_URL` to the deployment URL (e.g. `https://bangla-addin.vercel.app/`) and redeploy. The built `dist/manifest.xml` then points there. Install that manifest via:
- **Just you:** Excel → Insert → Add-ins → My Add-ins → Upload My Add-in (web/Mac), or a shared-folder catalog (Windows).
- **An organization:** Microsoft 365 admin center → Integrated apps.
- **Everyone:** submit to AppSource through Microsoft Partner Center.

#### 3. ONLYOFFICE plugin
The `onlyoffice-plugin/` folder contains a spreadsheet plugin for ONLYOFFICE (8.1+). It's built and tested for Desktop Editors on Linux.

- **Formulas:** `=TOANSI(A1)` (Unicode → Bijoy) and `=TOUNICODE(A1)` (Bijoy → Unicode). Opening the plugin once installs them, and after that they work in every spreadsheet.
- **Panel** (Plugins tab → Bangla Converter): converts the selected cells in place, with the same safeguards as the Excel add-in (formula cells untouched, Bijoy-font-only for → Unicode, optional font switch to SutonnyMJ / Noto Sans Bengali).

**Build and install (Linux):**
```bash
cd onlyoffice-plugin
npm install
npm run build            # dist/{GUID}/, dist/bangla-converter.plugin, dist/custom-functions.js
npm run install-plugin   # copies into ~/.local/share/onlyoffice/desktopeditors/sdkjs-plugins/
```
Restart Desktop Editors afterwards. Alternatively, go to Plugins → Plugin Manager → *Install plugin manually* and choose `dist/bangla-converter.plugin`. On a machine without Node, you can also paste `dist/custom-functions.js` into View → Macros → Custom functions to get just the formulas.

Notes:
- **Font:** Bijoy output only reads as Bangla with the SutonnyMJ font installed (e.g. copy it to `~/.local/share/fonts/` and run `fc-cache -f`).
- **Other apps:** the formulas are specific to ONLYOFFICE, so the same file opened in Excel or LibreOffice shows `#NAME?` in those cells once recalculated. Convert in place (panel) if the file will be shared.

#### 4. Excel via `WEBSERVICE` (Windows desktop only, no install)
You can use this package as a live API to convert cells in Excel.
Paste the following formula in a cell (Replace YOUR_URL with your Vercel deployment link):

- [x] For Bijoy to Unicode

In Excel
```
=WEBSERVICE("https://YOUR_URL.vercel.app/api/convert?type=b2u&text=" & ENCODEURL(A1))
```
- [x] For Unicode to Bijoy

In Excel

```
=WEBSERVICE("https://YOUR_URL.vercel.app/api/convert?type=u2b&text=" & ENCODEURL(A1))
```
 Note: For the result to look like Bangla, you must change the cell font to SutonnyMJ.

## :globe_with_meridians: API Endpoints

| Method | Endpoint | body |details|
| ---- | ------ | --------------- |---|
| GET | /api/convert?type=b2u&text=your_bijoy_text |:no_entry_sign:|Converts your bijoy formatted texts to unicode|
| GET | /api/convert?type=u2b&text=your_unicode_text |:no_entry_sign:|Converts your unicode formatted texts to bijoy|
| POST | /to-unicode | JSON Body: { "text": "your ansi/bijoy text"}|Converts your bijoy formatted texts to unicode|
| POST | /to-ansi | JSON Body: { "text": "your unicode text" }|Converts your unicode formatted texts to bijoy|

If you deploy the included server.ts, you get the following endpoints:
Technical Details
This converter handles complex Bengali linguistic rules, including:
Rearranging "Kar" (ে, ি, ৈ) positions.
Handling "Reph" (র্) and "Ro-fola" (্র) logic.
Correcting common conjuncts (যুক্তবর্ণ).
## :balance_scale: License
MIT © ABDALGOLABS
Developed by ABDNAHID


