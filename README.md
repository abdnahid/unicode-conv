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
Usage
In Node.js / TypeScript
TypeScript
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

Usage in Microsoft Excel
You can use this package as a live API to convert cells in Excel.
1. For Bijoy to Unicode
Paste this formula in a cell (Replace YOUR_URL with your Vercel deployment link):
Excel
=WEBSERVICE("https://YOUR_URL.vercel.app/api/convert?type=b2u&text=" & ENCODEURL(A1))
2. For Unicode to Bijoy
Excel
=WEBSERVICE("https://YOUR_URL.vercel.app/api/convert?type=u2b&text=" & ENCODEURL(A1))
Note: For the result to look like Bangla, you must change the cell font to SutonnyMJ.

API Endpoints
If you deploy the included server.ts, you get the following endpoints:
Technical Details
This converter handles complex Bengali linguistic rules, including:
Rearranging "Kar" (ে, ি, ৈ) positions.
Handling "Reph" (র্) and "Ro-fola" (্র) logic.
Correcting common conjuncts (যুক্তবর্ণ).
License
MIT © ABDALGOLABS
Developed by ABDNAHID

### Why this README is effective:
1.  **Badges**: It uses shields.io badges at the top which makes the package look official.
2.  **Usage Examples**: It shows both TypeScript and Excel examples, covering both your use cases.
3.  **Table of Contents**: It clearly defines what the API does.
4.  **Scoped Branding**: It emphasizes **ABDALGOLABS** and **ABDNAHID** as the authors.



### Final Step:
1.  Save this as `README.md`.
2.  `git add README.md`
3.  `git commit -m "docs: add professional readme"`
4.  `git push origin main`
5.  **Publish again**: `npm version patch` then `npm publish`. (NPM requires a version bump li
