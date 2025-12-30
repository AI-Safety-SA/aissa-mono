/**
 * Project seed data extracted from AISSA Track Record
 * Includes research papers, bounties, grants, software tools, and course projects
 */

export const projects = [
  // Research Papers
  {
    slug: 'humanagencybench',
    title: 'HumanAgencyBench: Do Language Models Support Human Agency?',
    type: 'research_paper',
    project_status: 'published',
    linkUrl: 'https://openreview.net/forum?id=nHp5FquS2R',
    metadata: {
      authors: [
        'Benjamin Sturgeon',
        'Leo Hyams',
        'Daniel Samuelson',
        'Emile Vorster',
        'Jesse Haimes',
        'Jacy Reese Anthis',
      ],
      venue: 'Workshop on Datasets and Evaluators of AI Safety, AAAI',
      date: '2025-02',
      accepted: true,
    },
  },
  {
    slug: 'precursors-proxies-predictive-models',
    title: 'Precursors, Proxies, and Predictive Models for Long-Horizon Tasks',
    type: 'research_paper',
    project_status: 'accepted',
    metadata: {
      authors: ['Jaco Du Toit', 'Leo Hyams', 'Dmitry Anisimov', 'Samuel Brown'],
      venue:
        'Workshop on Evaluating the Evolving LLM Lifecycle: Benchmarks, Emergent Abilities, and Scaling at NeurIPS 2025',
      date: '2025',
      accepted: true,
    },
  },
  // UK AISI Bounties
  {
    slug: 'synthetic-environment-detection-eval',
    title: 'Synthetic Environment Detection Eval',
    type: 'bounty_submission',
    project_status: 'accepted',
    metadata: {
      authors: ['Jaco Du Toit', 'Leo Hyams', 'Ashleigh Strickland Cooper', 'Joshua Olive'],
      program: 'UK AISI ARA Stream Bounty Programme',
      date: '2025-03',
      accepted: true,
    },
  },
  {
    slug: 'situational-awareness-eval',
    title: 'Situational Awareness Eval',
    type: 'bounty_submission',
    project_status: 'accepted',
    metadata: {
      authors: [
        'Noah De Nicola',
        'Leo Hyams',
        'Benjamin Sturgeon',
        'Jaco Du Toit',
        'Jonathan Bailey',
        'Ali Abbas',
      ],
      program: 'UK AISI ARA Stream Bounty Programme',
      date: '2025-03',
      accepted: true,
    },
  },
  {
    slug: 'rl-manipulation-eval',
    title: 'RL Manipulation Eval',
    type: 'bounty_submission',
    project_status: 'accepted',
    metadata: {
      authors: ['Jaco Du Toit', 'Leo Hyams', 'Caspar Waggoner'],
      program: 'UK AISI ARA Stream Bounty Programme',
      date: '2025-03',
      accepted: true,
    },
  },
  {
    slug: 'efficient-test-time-chain-of-thought-eval',
    title: 'Efficient Test-Time Chain of Thought Eval',
    type: 'bounty_submission',
    project_status: 'accepted',
    metadata: {
      authors: ['Jaco Du Toit', 'Leo Hyams', 'Caspar Waggoner'],
      program: 'UK AISI ARA Stream Bounty Programme',
      date: '2025-03',
      accepted: true,
    },
  },
  // Grant Awards
  {
    slug: 'uk-aisi-challenge-fund-proxies',
    title: 'Proxies for Efficient Evaluation of Autonomous Replication and Adaptation in AI Agents',
    type: 'grant_award',
    project_status: 'in_progress',
    metadata: {
      authors: ['Leo Hyams', 'Jaco Du Toit', 'Samuel Brown'],
      grantAmount: 99999,
      grantCurrency: 'GBP',
      program: 'UK AISI Challenge Fund',
      date: '2025-Q4',
      partner: 'UK AISI Science of Evaluations team',
    },
  },
  // Software Tools
  {
    slug: 'aissa-website',
    title: 'AISSA Website',
    type: 'software_tool',
    project_status: 'published',
    linkUrl: 'http://www.aisafetyct.com',
    metadata: {
      description: 'Website to house newsletter and enable greater outreach and credibility',
      launchDate: '2024',
    },
  },
  {
    slug: 'aissa-newsletter',
    title: 'AISSA Newsletter',
    type: 'software_tool',
    project_status: 'published',
    metadata: {
      description:
        'Newsletter published on Substack for tracking metrics, feedback, and subscribers',
      articleCount: 3,
      subscriberCount: 60,
      launchDate: '2024',
      platform: 'Substack',
    },
  },
  // Course Research Projects (from 2024 AISF Course)
  {
    slug: 'emerging-ethical-landscape-ai-proliferation',
    title: 'The Emerging Ethical Landscape: AI Proliferation and Readiness in Africa',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Chialuka Prisca-mary Onuoha', 'Winnie Kungu', 'Uzoma Mkparu'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'impacts-human-agency-llms',
    title: 'Impacts on human agency from LLMs',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Benjamin Sturgeon'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'aissa-fellowship-retrospective',
    title: 'AI Safety Cape Town: Fellowship Retrospective',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Leo Hyams'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'cross-border-ai-governance',
    title: 'Cross-Border AI Governance - A Focus on East, West, and South Africa',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: [
        'Derrick Mandela',
        'Nkurunziza Christophe',
        'Quency Otieno',
        'Jane Ombiro',
        'Maxwell Ouya',
      ],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'ai-transformative-tool-kenya-criminal-justice',
    title: "AI as a Transformative Tool in Promoting Access in Kenya's Criminal Justice System",
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Michael Mutinda'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'sustainable-ai-rethinking-ethics-governance',
    title:
      'Sustainable AI and Rethinking AI Ethics and Governance for a Global Context from Principles to Local Realities of Global South',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Merve Ayyuce Kizrak', 'Mashael Alzaid', 'Kojo Apeagyei'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'exploring-ai-governance-education-global-south',
    title: 'Exploring AI Governance Education and Opportunities in the Global South',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Chialuka Prisca-mary Onuoha'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'geopolitics-ai-africa',
    title:
      'The Geopolitics of AI in Africa: AI Governance in Critical "National Security" Areas in Africa amid the recent dynamics in geopolitics and regional blocks',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Cosmas Ondino'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'state-ai-governance-healthcare-kenya',
    title: 'State of AI Governance in Healthcare in Kenya',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Aurelia Brazeal', 'Walter Nyagah'],
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'ai-enhanced-food-loss-reduction',
    title: 'AI-Enhanced Food Loss Reduction and Circular Systems for Climate Action in Kenya',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      presentationDate: '2024-06-30',
    },
  },
  {
    slug: 'advanced-ai-regulation-dual-framework',
    title: 'Advanced AI Regulation: A Dual Framework for Comprehensive Oversight',
    type: 'research_paper',
    project_status: 'submitted',
    programSlug: 'aisf-governance-2024-mar',
    metadata: {
      authors: ['Tendai Mikioni'],
      presentationDate: '2024-06-30',
    },
  },
]
