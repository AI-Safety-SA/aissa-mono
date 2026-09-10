import { events, homeStats, programs, research } from "./site-content";
import type { PublicHomePayload, PublicProgram } from "./types";

function hasProgramImage(program: PublicProgram): boolean {
  return Boolean(program.image?.url);
}

export async function getHome(): Promise<PublicHomePayload> {
  return {
    stats: homeStats,
    programs: programs.filter(hasProgramImage),
    events,
    research,
    team: [],
    testimonials: [],
  };
}

export async function getPrograms(): Promise<PublicProgram[]> {
  return programs.filter(hasProgramImage);
}

export async function getProgram(slug: string): Promise<PublicProgram | null> {
  return programs.find((program) => program.slug === slug) ?? null;
}

export async function getEvents() {
  return events;
}

export async function getResearch() {
  return research;
}
