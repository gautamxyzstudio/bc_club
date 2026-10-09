/**
 * Canadian Phone Number Validation Utilities
 */

// Recognized Canadian Area Codes by province / territory:
// British Columbia: 236, 250, 604, 672, 778
// Alberta: 368, 403, 587, 780, 825
// Saskatchewan: 306, 639
// Manitoba: 204, 431
// Ontario: 226, 249, 289, 343, 365, 416, 437, 519, 548, 613, 647, 683, 705, 742, 753, 807, 905
// Quebec: 263, 354, 367, 418, 438, 450, 468, 514, 579, 581, 819, 873
// New Brunswick: 506
// Nova Scotia & Prince Edward Island: 782, 902
// Newfoundland and Labrador: 709
// Yukon, Northwest Territories, Nunavut: 867
export const CANADIAN_AREA_CODES = new Set([
  "204", "226", "236", "249", "250", "263", "289", "306", "343", "354",
  "365", "367", "368", "403", "416", "418", "431", "437", "438", "450",
  "468", "506", "514", "519", "548", "579", "581", "587", "604", "613",
  "639", "647", "672", "683", "705", "709", "742", "753", "778", "780",
  "782", "807", "819", "825", "867", "873", "902", "905",
]);

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  digits?: string;
}

/**
 * Validates whether a phone number is a valid Canadian NANP phone number.
 */
export function validateCanadianPhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Extract all digit characters
  const digits = phone.replace(/\D/g, "");

  let raw = digits;
  // If user entered +1 or leading 1 with 11 digits, strip the country code 1
  if (raw.length === 11 && raw.startsWith("1")) {
    raw = raw.slice(1);
  }

  if (raw.length !== 10) {
    return {
      isValid: false,
      error: "Please enter a valid Canadian phone number",
      digits: raw,
    };
  }

  const areaCode = raw.slice(0, 3);
  const centralOffice = raw.slice(3, 6);
  const lineNumber = raw.slice(6, 10);

  if (!CANADIAN_AREA_CODES.has(areaCode)) {
    return {
      isValid: false,
      error: `"${areaCode}" is not a recognized Canadian area code. Please enter a valid Canadian phone number.`,
      digits: raw,
    };
  }

  // NANP central office code cannot start with 0 or 1
  if (centralOffice.startsWith("0") || centralOffice.startsWith("1")) {
    return {
      isValid: false,
      error: "Invalid Canadian phone number format (exchange code cannot begin with 0 or 1).",
      digits: raw,
    };
  }

  const formatted = `+1 (${areaCode}) ${centralOffice}-${lineNumber}`;
  return {
    isValid: true,
    formatted,
    digits: raw,
  };
}

/**
 * Formats user input as a Canadian phone number: (XXX) XXX-XXXX
 */
export function formatCanadianPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, "");
  let raw = digits;
  if (raw.length === 11 && raw.startsWith("1")) {
    raw = raw.slice(1);
  }

  const limited = raw.slice(0, 10);
  if (limited.length === 0) return "";
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
}
