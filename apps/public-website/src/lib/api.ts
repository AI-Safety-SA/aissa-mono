import "server-only";

import type {
  PublicEvent,
  PublicHomePayload,
  PublicProgram,
  PublicResearch,
  PublicTestimonial,
} from "./types";

function getApiConfig() {
  const baseUrl = process.env.TRACK_RECORD_API_BASE_URL;
  const token = process.env.TRACK_RECORD_API_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "TRACK_RECORD_API_BASE_URL and TRACK_RECORD_API_TOKEN are required.",
    );
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

export async function fetchPublicTrackRecord<T>(path: string): Promise<T> {
  const { baseUrl, token } = getApiConfig();
  const response = await fetch(
    `${baseUrl}/api/public-track-record/${path.replace(/^\//, "")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`Public track-record API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getHome = () => fetchPublicTrackRecord<PublicHomePayload>("home");
export const getPrograms = () =>
  fetchPublicTrackRecord<PublicProgram[]>("programs");
export const getProgram = (slug: string) =>
  fetchPublicTrackRecord<PublicProgram>(`programs/${slug}`);
export const getEvents = () => fetchPublicTrackRecord<PublicEvent[]>("events");
export const getEvent = (slug: string) =>
  fetchPublicTrackRecord<PublicEvent>(`events/${slug}`);
export const getResearch = () =>
  fetchPublicTrackRecord<PublicResearch[]>("research");
export const getTestimonials = () =>
  fetchPublicTrackRecord<PublicTestimonial[]>("testimonials");
