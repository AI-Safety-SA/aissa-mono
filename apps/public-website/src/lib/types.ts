export interface PublicImage {
  alt: string | null;
  caption?: string | null;
  url: string | null;
}

export interface PublicPersonSummary {
  bio?: string | null;
  fullName: string;
  headshot: PublicImage | null;
  id: number;
  organisation?: string | null;
  personTag?: string | null;
}

export interface PublicCohortSummary {
  acceptedCount?: number | null;
  averageRating?: number | null;
  completionCount?: number | null;
  completionRate?: number | null;
  endDate?: string | null;
  id: number;
  name: string;
  slug: string;
  startDate?: string | null;
}

export interface PublicProjectSummary {
  id: number;
  slug?: string | null;
  title: string;
  type?: string | null;
}

export interface PublicOrganisationSummary {
  id: number;
  logo?: PublicImage | null;
  name: string;
  website?: string | null;
}

export interface PublicStats {
  totalEvents: number;
  totalParticipants: number;
  totalPrograms: number;
  totalResearch: number;
}

export interface PublicProgram {
  applicationCount?: number | null;
  cohorts?: PublicCohortSummary[];
  description?: unknown;
  endDate?: string | null;
  gallery?: PublicImage[];
  highlightOnPublicWebsite?: boolean | null;
  highlightPriority?: number | null;
  id: number;
  image: PublicImage | null;
  name: string;
  partners?: PublicOrganisationSummary[];
  participantCount?: number | null;
  projects?: PublicProjectSummary[];
  showOnPublicWebsite?: boolean | null;
  slug: string;
  startDate?: string | null;
  totalCompletions?: number;
  totalParticipants?: number;
  type?: string | null;
  websiteUrl?: string | null;
}

export interface PublicEvent {
  attendanceCount?: number | null;
  description?: unknown;
  eventDate?: string | null;
  gallery?: PublicImage[];
  hosts?: PublicPersonSummary[];
  id: number;
  image: PublicImage | null;
  location?: string | null;
  lumaPublicUrl?: string | null;
  name: string;
  organiser?: PublicPersonSummary | null;
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
  websiteUrl?: string | null;
}

export interface PublicHomePayload {
  events: PublicEvent[];
  programs: PublicProgram[];
  research: PublicResearch[];
  stats: PublicStats;
  team: PublicTeamPerson[];
  testimonials: PublicTestimonial[];
}
