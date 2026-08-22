/** zod preprocess helper: treat blank form fields as null instead of "". */
export function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}
