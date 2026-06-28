function isFileContent(value: unknown): boolean {
  return (
    typeof value === "string" ||
    value === null ||
    (typeof value === "object" && value != null && "template" in value)
  );
}

function resolveContent(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    "template" in (value as Record<string, unknown>)
  ) {
    const v = value as { template: string; options?: Record<string, unknown> };
    return `//Generated from template: ${v.template}\n// Options: ${JSON.stringify(v.options ?? {}, null, 2)}\n`;
  }
  return "";
}
