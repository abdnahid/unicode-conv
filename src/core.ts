// src/core.ts
import {
  bijoy_string_conversion_map,
  uni2bijoy_string_conversion_map,
  bijoyKarReplacements,
  bijoyRoFolaReplacements,
  correctBijoy,
  correctUnicode,
  ConversionMap,
} from "./data";

interface RegexPattern {
  regex: RegExp;
  replacement: string;
}

let bijoyPatterns: RegexPattern[] | null = null;
let uni2bijoyPatterns: RegexPattern[] | null = null;

// --- Helpers ---

function buildConversionPatterns(map: ConversionMap): RegexPattern[] {
  const patterns: RegexPattern[] = [];
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      patterns.push({
        regex: new RegExp(key, "g"),
        replacement: map[key],
      });
    }
  }
  return patterns;
}

function ensureBijoyPatterns(): void {
  if (!bijoyPatterns) {
    bijoyPatterns = buildConversionPatterns(bijoy_string_conversion_map);
  }
}

function ensureUni2BijoyPatterns(): void {
  if (!uni2bijoyPatterns) {
    uni2bijoyPatterns = buildConversionPatterns(
      uni2bijoy_string_conversion_map,
    );
  }
}

function replaceMultiple(
  text: string,
  map: ConversionMap,
  useRegex: boolean,
): string {
  let result = text;
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const pattern = useRegex ? new RegExp(key, "g") : key;
      result = result.replace(pattern, map[key]);
    }
  }
  return result;
}

// --- Bangla Character Checkers ---

const IsBanglaHalant = (n: string): boolean => n === "্";
const IsBanglaPreKar = (n: string): boolean => ["ি", "ৈ", "ে"].includes(n);
const IsBanglaPostKar = (n: string): boolean =>
  ["া", "ো", "ৌ", "ৗ", "ু", "ূ", "ী", "ৃ"].includes(n);
const IsBanglaKar = (n: string): boolean =>
  IsBanglaPreKar(n) || IsBanglaPostKar(n);
const IsBanglaNukta = (n: string): boolean => ["ং", "ঃ", "ঁ"].includes(n);
const IsBanglaBanjonborno = (n: string): boolean => /[ক-হড়-য়ংঃঁৎ]/.test(n);
const IsSpace = (n: string): boolean => [" ", "\t", "\n", "\r"].includes(n);

// --- Core Re-arrangement Logic (The Complex Part) ---

function ReArrangeUnicodeConvertedText(n: string): string {
  // Note: Converted logic exactly from original JS, added type safety
  for (let t = 0; t < n.length; t++) {
    // Logic 1: Moving Pre-Kar before Nukta/Kar
    if (
      t > 0 &&
      n.charAt(t) === "্" &&
      (IsBanglaKar(n.charAt(t - 1)) || IsBanglaNukta(n.charAt(t - 1))) &&
      t < n.length - 1
    ) {
      let f = n.substring(0, t - 1);
      f += n.charAt(t);
      f += n.charAt(t + 1);
      f += n.charAt(t - 1);
      f += n.substring(t + 2, n.length);
      n = f;
    }

    // Logic 2: Re-ordering Ra + Halant
    if (
      t > 0 &&
      t < n.length - 1 &&
      n.charAt(t) === "্" &&
      n.charAt(t - 1) === "র" &&
      n.charAt(t - 2) !== "্" &&
      IsBanglaKar(n.charAt(t + 1))
    ) {
      let e = n.substring(0, t - 1);
      e += n.charAt(t + 1);
      e += n.charAt(t - 1);
      e += n.charAt(t);
      e += n.substring(t + 2, n.length);
      n = e;
    }

    // Logic 3: Handling Ref (Reph)
    if (
      t < n.length - 1 &&
      n.charAt(t) === "র" &&
      IsBanglaHalant(n.charAt(t + 1)) &&
      !IsBanglaHalant(n.charAt(t - 1))
    ) {
      let i = 1;
      while (true) {
        if (t - i < 0) break;
        if (
          IsBanglaBanjonborno(n.charAt(t - i)) &&
          IsBanglaHalant(n.charAt(t - i - 1))
        ) {
          i += 2;
        } else if (i === 1 && IsBanglaKar(n.charAt(t - i))) {
          i++;
        } else {
          break;
        }
      }
      let o = n.substring(0, t - i);
      o += n.charAt(t);
      o += n.charAt(t + 1);
      o += n.substring(t - i, t);
      o += n.substring(t + 2, n.length);
      n = o;
      t += 1;
      continue;
    }

    // Logic 4: Pre-Kar re-arrangement
    if (
      t < n.length - 1 &&
      IsBanglaPreKar(n.charAt(t)) &&
      !IsSpace(n.charAt(t + 1))
    ) {
      let r = 1;
      while (IsBanglaBanjonborno(n.charAt(t + r))) {
        if (IsBanglaHalant(n.charAt(t + r + 1))) r += 2;
        else break;
      }
      let u = n.substring(0, t);
      u += n.substring(t + 1, t + r + 1);
      let h = 0;
      if (n.charAt(t) === "ে" && n.charAt(t + r + 1) === "া") {
        u += "ো";
        h = 1;
      } else if (n.charAt(t) === "ে" && n.charAt(t + r + 1) === "ৗ") {
        u += "ৌ";
        h = 1;
      } else {
        u += n.charAt(t);
      }
      u += n.substring(t + r + h + 1, n.length);
      n = u;
      t += r;
    }

    // Logic 5: Chandra Bindu
    if (
      t < n.length - 1 &&
      n.charAt(t) === "ঁ" &&
      IsBanglaPostKar(n.charAt(t + 1))
    ) {
      let s = n.substring(0, t);
      s += n.charAt(t + 1);
      s += n.charAt(t);
      s += n.substring(t + 2, n.length);
      n = s;
    }
  }
  return n;
}

function ReArrangeUnicodeText(n: string): string {
  let o = 0;
  for (let t = 0; t < n.length; t++) {
    // Logic 1: Moving Pre-Kar
    if (t < n.length && IsBanglaPreKar(n.charAt(t))) {
      let r = 1;
      while (IsBanglaBanjonborno(n.charAt(t - r))) {
        if (t - r < 0 || t - r <= o) break;
        if (IsBanglaHalant(n.charAt(t - r - 1))) r += 2;
        else break;
      }
      let f = n.substring(0, t - r);
      f += n.charAt(t);
      f += n.substring(t - r, t);
      f += n.substring(t + 1, n.length);
      n = f;
      o = t + 1;
      continue;
    }
    // Logic 2: Handling Ref (Reph) reverse
    if (
      t < n.length - 1 &&
      IsBanglaHalant(n.charAt(t)) &&
      n.charAt(t - 1) === "র"
    ) {
      let i = 1;
      let e = 0;
      while (true) {
        if (
          IsBanglaBanjonborno(n.charAt(t + i)) &&
          IsBanglaHalant(n.charAt(t + i + 1))
        ) {
          i += 2;
        } else if (
          IsBanglaBanjonborno(n.charAt(t + i)) &&
          IsBanglaPreKar(n.charAt(t + i + 1))
        ) {
          e = 1;
          break;
        } else {
          break;
        }
      }
      let u = n.substring(0, t - 1);
      u += n.substring(t + i + 1, t + i + e + 1);
      u += n.substring(t + 1, t + i + 1);
      u += n.charAt(t - 1);
      u += n.charAt(t);
      u += n.substring(t + i + e + 1, n.length);
      n = u;
      t += i + e;
      o = t + 1;
      continue;
    }
  }
  return n;
}

function replaceFirstLetter(n: string, t: string, i: string): string {
  return n.replace(new RegExp("^" + t, "gm"), i);
}

function replaceLastLetter(n: string, t: string, i: string): string {
  return n.replace(new RegExp(t + "$", "gm"), i);
}

// --- Main Exported Functions ---

export function bijoyToUnicode(text: string): string {
  if (!text) return "";
  if (isUnicode(text)) {
    return text;
  }
  ensureBijoyPatterns();
  let n = text;

  n = replaceMultiple(n, correctBijoy, true);

  if (bijoyPatterns) {
    for (const pattern of bijoyPatterns) {
      n = n.replace(pattern.regex, pattern.replacement);
    }
  }

  n = replaceMultiple(n, correctUnicode, true);
  n = ReArrangeUnicodeConvertedText(n);
  return n.replace(/অা/g, "আ");
}

export function unicodeToBijoy(text: string): string {
  if (!text) return "";
  let n = text;

  n = n
    .replace(/ব়/g, "র")
    .replace(/ড়/g, "ড়")
    .replace(/ঢ়/g, "ঢ়")
    .replace(/য়/g, "য়");
  n = n.replace(/ো/g, "ো").replace(/ৌ/g, "ৌ").replace(/্র্য/g, "্র‍্য");

  n = replaceLastLetter(n, "র্", "i&");
  n = replaceLastLetter(n, "র্‌", "i&");

  n = ReArrangeUnicodeText(n);
  ensureUni2BijoyPatterns();

  if (uni2bijoyPatterns) {
    for (const pattern of uni2bijoyPatterns) {
      n = n.replace(pattern.regex, pattern.replacement);
    }
  }

  n = replaceFirstLetter(n, "‡", "†");
  n = replaceFirstLetter(n, "‰", "ˆ");
  n = n
    .replace(/\(‡/g, "(†")
    .replace(/\[‡/g, "[†")
    .replace(/Ô‡/g, "Ô†")
    .replace(/Ò‡/g, "Ò†");
  n = n
    .replace(/\(‰/g, "(ˆ")
    .replace(/\[‰/g, "[ˆ")
    .replace(/Ô‰/g, "Ôˆ")
    .replace(/Ò‰/g, "Òˆ");

  n = replaceMultiple(n, bijoyKarReplacements, true);
  n = replaceMultiple(n, bijoyRoFolaReplacements, true);

  return n;
}

/**
 * Detects if a string contains Unicode Bangla characters.
 * Range: \u0980 to \u09FF
 */
export function isUnicode(text: string): boolean {
  const unicodePattern = /[\u0980-\u09FF]/;
  return unicodePattern.test(text);
}

export function convertMixedToUnicode(text: string): string {
    if (!text) return "";

    // Split by spaces to evaluate chunks
    const words = text.split(/(\s+)/); // Preserves spaces for perfect reconstruction

    return words.map(word => {
        // 1. Skip if it's just whitespace
        if (word.trim().length === 0) return word;

        // 2. Check if the word contains Unicode Bengali characters
        // If it's already Unicode, return it untouched
        if (isUnicode(word)) {
            return word;
        }

        // 3. Check if it contains ASCII/ANSI characters commonly used in Bijoy
        // We only convert if it looks like Bijoy (contains common Bijoy characters)
        // Adjust the regex based on your b2u character map
        const looksLikeBijoy = /[A-Za-z|†|‡|¶|¡]/.test(word);

        if (looksLikeBijoy) {
            return bijoyToUnicode(word);
        }

        // 4. If it's English/Numbers and not Bijoy, return as is
        return word;
    }).join('');
}