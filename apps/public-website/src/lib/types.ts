export interface PublicImage {
  alt: string | null;
  url: string | null;
}

export interface PublicStats {
  totalEvents: number;
  totalParticipants: number;
  totalPrograms: number;
  totalProjects: number;
  totalResearch: number;
}

export interface PublicProgram {
  description?: unknown;
  endDate?: string | null;
  id: number;
  image: PublicImage | null;
  name: string;
  slug: string;
  startDate?: string | null;
  totalCompletions?: number;
  totalParticipants?: number;
  type?: string | null;
}

export interface PublicEvent {
  attendanceCount?: number | null;
  description?: unknown;
  eventDate?: string | null;
  id: number;
  image: PublicImage | null;
  location?: string | null;
  name: string;
  slug: string;
  type?: string | null;
}

export interface PublicResearch {
  acceptedVenue?: string | null;
  arxivLink?: string | null;
  authors?: Array<{ authorName?: string | null }>;
  doi?: string | null;
  id: number;
  publicationDate?: string | null;
  slug?: string | null;
  status?: string | null;
  title: string;
  venueType?: string | null;
}

export interface PublicProject {
  description?: unknown;
  id: number;
  linkUrl?: string | null;
  project_status?: string | null;
  repositoryUrl?: string | null;
  slug: string;
  tier?: string | null;
  title: string;
  type?: string | null;
}

export interface PublicHomePayload {
  events: PublicEvent[];
  programs: PublicProgram[];
  projects: PublicProject[];
  research: PublicResearch[];
  stats: PublicStats;
}
