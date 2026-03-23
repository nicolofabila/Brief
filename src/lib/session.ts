"use client";

import { STORAGE_SESSION } from "./brief-storage";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_SESSION);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_SESSION, id);
  }
  return id;
}
