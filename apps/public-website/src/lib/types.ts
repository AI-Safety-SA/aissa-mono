export interface PublicImage {
  alt: string | null;
  url: string | null;
}

export interface PublicStats {
  totalEvents: number;
  totalParticipants: number;
  totalPrograms: number;
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

export interface PublicTestimonial {
  attributionName: string;
  attributionTitle?: string | null;
  contextKind?: string | null;
  id: number;
  quote: string;
}

export interface PublicTeamPerson {
  bio?: string | null;
  fullName: string;
  headshot: PublicImage | null;
  id: number;
  organisation?: string | null;
  personTag?: string | null;
}

export interface PublicHomePayload {
  events: PublicEvent[];
  programs: PublicProgram[];
  research: PublicResearch[];
  stats: PublicStats;
  team: PublicTeamPerson[];
  testimonials: PublicTestimonial[];
}
