import { IP } from "@/consts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function change_minio(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/^http:\/\/minio/, `http://${IP}`);
}
