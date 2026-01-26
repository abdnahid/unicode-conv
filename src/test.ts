import { bijoyToUnicode, unicodeToBijoy } from "./core";

// 1. Test: ANSI to Unicode
const ansiInput = "Rbve †gvt b~iæj Avwgb";
const unicodeResult = bijoyToUnicode(ansiInput);

console.log("--- Test: ANSI to Unicode ---");
console.log("Input (ANSI):", ansiInput);
console.log("Output (Unicode):", unicodeResult);
console.log("Success:", unicodeResult === "আমার সোনার বাংলা" ? "✅" : "❌");

// console.log("\n");

// // 2. Test: Unicode to ANSI
// const unicodeInput = "আমি বাংলায় গান গাই";
// const ansiResult = unicodeToBijoy(unicodeInput);

// console.log("--- Test: Unicode to ANSI ---");
// console.log("Input (Unicode):", unicodeInput);
// console.log("Output (ANSI):", ansiResult);
// // Note: This output will look like gibberish in your console
// // because the console uses a Unicode font, not a Bijoy font.
