/**
 * แปลง camelCase เป็น snake_case
 * @param str input เช่น "userId" → "user_id"
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * แปลง snake_case เป็น camelCase
 * @param str input เช่น "user_id" → "userId"
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * แปลง key ของ object จาก camelCase → snake_case
 */
export function objectCamelToSnake(
    obj: Record<string, any>
): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [camelToSnake(key), val])
    );
}

/**
 * แปลง key ของ object จาก snake_case → camelCase
 */
export function objectSnakeToCamel(
    obj: Record<string, any>
): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [snakeToCamel(key), val])
    );
}

/**
 * Convert any string to Title Case
 * @param name 
 */
export function toTitleCase(name: string) {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
