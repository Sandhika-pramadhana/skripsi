import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

const SHA256 = CryptoJS.SHA256;
const Hex = CryptoJS.enc.Hex;
const Utf8 = CryptoJS.enc.Utf8;
const Base64 = CryptoJS.enc.Base64;
const AES = CryptoJS.AES;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clientEncrypt(value: string) {
  if (value == null) return "";

  const secret_key = "tgAeMdjxcf4Lgo5cWjWs2LJthDInDU6C";
  const secret_iv = "RJkv3p6VAW6O45eW";

  const key = SHA256(secret_key).toString(Hex).substring(0, 32);
  const iv = SHA256(secret_iv).toString(Hex).substring(0, 16);
  const output = AES.encrypt(value, Utf8.parse(key), {
    iv: Utf8.parse(iv),
  }).toString();
  const output2ndB64 = Utf8.parse(output).toString(Base64);
  return output2ndB64;
}

export const zip = <L, R>(a: L[], b: R[]) =>
  Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

type TypeWithId = { id: string };
export const withId = (id: string) => (o: TypeWithId) => o.id === id;
export const withoutId = (id: string) => (o: TypeWithId) => o.id !== id;
export const withProp = <Obj>(key: keyof Obj, id: string) => (o: Obj) => o[key] === id;

export const sortLexically = (a: string, b: string) =>
  a == b ? 0 : a < b ? -1 : 1;

export function CurrentDate() {
  const currentDate: Date = new Date();
  const year: number = currentDate.getFullYear();
  const month: string = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because month is zero-based
  const day: string = String(currentDate.getDate()).padStart(2, "0");

  const formattedDate: string = `${year}-${month}-${day}`;

  return formattedDate;
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export const base64toBlob = (b64Data: string, contentType: string = '', sliceSize: number = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
};

export const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));

export const convertStrToNumber = (input: string) => {
  // Attempt to convert the input to a number
  const number = Number(input);
  
  // Check if the conversion was successful (not NaN and the input is entirely numeric)
  if (!isNaN(number) && /^\d+$/.test(input)) {
    return number;
  } else {
    return input;
  }
};
export const fetchFile = async (url: string, fileName: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();

  const FileConstructor = window.File;
  return new FileConstructor([blob], fileName, { type: blob.type });
};

// Split a string by the first occurrence of a slash ('/')
// Input: "2309202416/HCM/CM/1024"
// Output: ["2309202416", "/HCM/CM/1024"]
export const splitStringBySlash = (input: string): [string, string] => {
  const index = input?.indexOf("/");

  if (index === -1) {
    return [input, ""]; // Return the whole string and an empty string if no '/' is found
  }

  const firstPart = input?.substring(0, index);
  const secondPart = input?.substring(index);

  return [firstPart, secondPart];
};

export const sanitizeString = (string: string) => {
  return string.trim().replace(/[\u200B-\u200D\uFEFF]/g, ''); 
};
