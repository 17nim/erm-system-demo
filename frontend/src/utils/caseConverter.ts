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
 * รองรับทั้ง object ธรรมดา, object ซ้อนกันหลายชั้น และ array ของ object
 */
export function objectSnakeToCamel(input: any): any {
    if (Array.isArray(input)) {
        return input.map(objectSnakeToCamel); // recursively convert array elements
    }

    if (input !== null && typeof input === "object" && !Array.isArray(input)) {
        return Object.fromEntries(
            Object.entries(input).map(([key, val]) => [
                snakeToCamel(key),
                objectSnakeToCamel(val), // recursively convert nested objects
            ])
        );
    }

    return input; // return primitive values as-is
}
