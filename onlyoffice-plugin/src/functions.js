(function()
{
  /**
   * Converts Unicode Bangla text to Bijoy (ANSI). Show the result in the SutonnyMJ font.
   * @customfunction
   * @param {any} text Unicode Bangla text, or a cell that contains it.
   * @returns {any} The text in Bijoy (ANSI) encoding.
   */
  function TOANSI(text) {
    return convert(text, BanglaConverter.unicodeToBijoy);
  }

  /**
   * Converts Bijoy (ANSI) text to Unicode Bangla. Text that is already Unicode is returned unchanged.
   * @customfunction
   * @param {any} text Bijoy (ANSI) text, or a cell that contains it.
   * @returns {any} The text in Unicode.
   */
  function TOUNICODE(text) {
    return convert(text, BanglaConverter.bijoyToUnicode);
  }

  // Only text is converted; numbers and booleans pass through, empty cells give "".
  function convert(value, fn) {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? fn(value) : value;
  }

  /*__CONVERTER__*/

  Api.AddCustomFunction(TOANSI);
  Api.AddCustomFunction(TOUNICODE);
})();
