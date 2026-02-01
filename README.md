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

#### 2. Usage in Microsoft Excel
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


