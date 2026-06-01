// lib/sanitize.ts

export function sanitizePII(text: string): string {
    if (!text) return "";

    let sanitized = text;

    // 1. Redact Credit Card Patterns (13 to 16 digits)
    const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
    sanitized = sanitized.replace(creditCardRegex, "[REDACTED_CREDIT_CARD]");

    // 2. Redact Email Addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    sanitized = sanitized.replace(emailRegex, "[REDACTED_EMAIL]");

    // 3. Redact Phone Numbers (Matches common international formats)
    const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g;
    sanitized = sanitized.replace(phoneRegex, "[REDACTED_PHONE]");

    return sanitized;
}
