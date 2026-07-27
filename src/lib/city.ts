const suffixPattern = /(特别行政区|自治州|自治县|地区|盟|市|区|县)$/;

export function normalizeCity(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, "")
    .replace(suffixPattern, "")
    .toLocaleLowerCase("zh-CN");
}

export function displayCity(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, "");
}
