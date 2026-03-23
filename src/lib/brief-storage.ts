export const STORAGE_INTERESTS = "brief_interests_v1";
export const STORAGE_SESSION = "brief_session_id";

export type StoredInterests = {
  keywords: string[];
};

export function defaultInterests(): StoredInterests {
  return { keywords: [] };
}
