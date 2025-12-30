/**
 * Person seed data extracted from AISSA Track Record
 * Uses placeholder emails: firstname.lastname@placeholder.aissa.org
 */

import { generatePlaceholderEmail } from '../utils'

export const persons = [
  // AISSA Core Team & Highlighted Individuals
  {
    email: generatePlaceholderEmail('Leo Hyams'),
    fullName: 'Leo Hyams',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Strategic Director of AI Safety South Africa. Default event organiser for AISSA events.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Benjamin Sturgeon'),
    fullName: 'Benjamin Sturgeon',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Strategic Director of AISSA. Was accepted to MATS 8.0 and the MATS extension program under Oly Sourbut and Sid Black\'s (UK AISI) stream.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/benjamin-sturgeon-41221241/',
    },
  },
  {
    email: generatePlaceholderEmail('Charl Botha'),
    fullName: 'Charl Botha',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Previous Full Stack Engineer. Joined our in-person BlueDot Intro to Transformative AI course. Quit his job to work on AI Safety. Completed the Intro to Cooperative AI Course. Now an Infrastructure Developer for AI Safety South Africa.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/botha-charl/',
    },
  },
  {
    email: generatePlaceholderEmail('Jaco Du Toit'),
    fullName: 'Jaco Du Toit',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Data Scientist. Joined the Condor Camp in 2024. Quit his job to work on AI Safety. Joined our team developing evals for the UK AISI alongside the AI Safety Engineering Taskforce. Completed the Intro to Cooperative AI Course. Attended the Cooperative AI Summer School. A recipient for a UK AISI Science of Evals Challenge Fund grant.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/jaco-du-toit-a04785208/',
    },
  },
  {
    email: generatePlaceholderEmail('Josh Stein'),
    fullName: 'Josh Stein',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Software Engineer. Joined the Condor Camp in 2024. Joined our in-person BlueDot Intro to Transformative AI course. Contracted with METR, Equistamp, and the AI Safety Engineering Taskforce. Now a software engineer for BlueDot Impact.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/josh-s-5b4ab869/',
    },
  },
  {
    email: generatePlaceholderEmail('Daniel Samuelson'),
    fullName: 'Daniel Samuelson',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'ML Engineer. Joined the Condor Camp in 2024. Pivoted from ML engineering to research engineering. Contributed significantly to HumanAgencyBench, a research paper led by Benjamin Sturgeon, which was accepted as a workshop paper to AAAI.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/daniel-samuelson-20b36a1b2/',
    },
  },
  {
    email: generatePlaceholderEmail('Noah De Nicola'),
    fullName: 'Noah De Nicola',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Reinforcement Learning MSc Student. Joined the Condor Camp in 2024. Joined our team developing evals for the UK AISI alongside the AI Safety Engineering Taskforce. AI Safety Fundamentals Course Facilitator.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/noah-de-nicola-9626b2218/',
    },
  },
  {
    email: generatePlaceholderEmail('Genevieve Chikwanha'),
    fullName: 'Genevieve Chikwanha',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Computer Science Student at the University of Cape Town. Joined our Condor Camp in 2024. Now an AISF course facilitator. Now conducting research on the risks of AI startups as a research assistant under Clifford Shearing at the Global Risk Governance group at the University of Cape Town.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/g%C3%A9nevieve-chikwanha-7202511b4/',
    },
  },
  {
    email: generatePlaceholderEmail('Tegan Green'),
    fullName: 'Tegan Green',
    highlight: true,
    featuredStory: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Event Curator at AISSA. Joined the Intro to Cooperative AI Course in Q2 2025. Now an event curator for us, and applying to be a mentor for AI Safety Camp.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    metadata: {
      linkedInUrl: 'https://www.linkedin.com/in/tegan-green-484510158',
    },
  },
  // University Group Leaders
  {
    email: generatePlaceholderEmail('Boyd Kane'),
    fullName: 'Boyd Kane',
    metadata: {
      role: 'Lead organiser of Stellies AI Safety',
    },
  },
  {
    email: generatePlaceholderEmail('Nicholas Lombard'),
    fullName: 'Nicholas Lombard',
    metadata: {
      role: 'Co-organiser of Stellies AI Safety',
    },
  },
  // Event Speakers and Panelists
  {
    email: generatePlaceholderEmail('Claude Formanek'),
    fullName: 'Claude Formanek',
    metadata: {
      title: 'Cooperative AI Foundation Fellow',
    },
  },
  {
    email: generatePlaceholderEmail('Benjamin Rosman'),
    fullName: 'Benjamin Rosman',
    metadata: {
      title: 'Professor of AI at the University of Witwatersrand',
    },
  },
  {
    email: generatePlaceholderEmail('Lydia De Lange'),
    fullName: 'Lydia De Lange',
    metadata: {
      title: 'Executive Director of the Deep Learning IndabaX South Africa',
    },
  },
  {
    email: generatePlaceholderEmail('Joshua Maumela'),
    fullName: 'Joshua Maumela',
    metadata: {
      title: 'Senior Machine Learning Engineer at Vodacom',
    },
  },
  {
    email: generatePlaceholderEmail('Ahmed Ghoor'),
    fullName: 'Ahmed Ghoor',
    metadata: {
      description: 'Researcher on agent behaviors in gridworlds',
    },
  },
  {
    email: generatePlaceholderEmail('Jonas Kgomo'),
    fullName: 'Jonas Kgomo',
    metadata: {
      description: 'Presented on African safety landscape at IndabaX 2023',
    },
  },
  {
    email: generatePlaceholderEmail('Zainab Chirwa'),
    fullName: 'Zainab Chirwa',
    metadata: {
      description: 'Presented on AI governance in Africa at IndabaX 2023',
    },
  },
  // Testimonial Providers
  {
    email: generatePlaceholderEmail('Lois Moses'),
    fullName: 'Lois Moses',
    metadata: {
      title: 'Research Staff, Pan-African Centre for AI Ethics',
    },
  },
  {
    email: generatePlaceholderEmail('Simone Renga'),
    fullName: 'Simone Renga',
    metadata: {
      title: 'Data Scientist, Sand Technologies',
    },
  },
  // Course Project Collaborators
  {
    email: generatePlaceholderEmail('Chialuka Prisca-mary Onuoha'),
    fullName: 'Chialuka Prisca-mary Onuoha',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Winnie Kungu'),
    fullName: 'Winnie Kungu',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Uzoma Mkparu'),
    fullName: 'Uzoma Mkparu',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Derrick Mandela'),
    fullName: 'Derrick Mandela',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Nkurunziza Christophe'),
    fullName: 'Nkurunziza Christophe',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Quency Otieno'),
    fullName: 'Quency Otieno',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Jane Ombiro'),
    fullName: 'Jane Ombiro',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Maxwell Ouya'),
    fullName: 'Maxwell Ouya',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Michael Mutinda'),
    fullName: 'Michael Mutinda',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Merve Ayyuce Kizrak'),
    fullName: 'Merve Ayyuce Kizrak',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Mashael Alzaid'),
    fullName: 'Mashael Alzaid',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Kojo Apeagyei'),
    fullName: 'Kojo Apeagyei',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Cosmas Ondino'),
    fullName: 'Cosmas Ondino',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Aurelia Brazeal'),
    fullName: 'Aurelia Brazeal',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Walter Nyagah'),
    fullName: 'Walter Nyagah',
    metadata: {},
  },
  {
    email: generatePlaceholderEmail('Tendai Mikioni'),
    fullName: 'Tendai Mikioni',
    metadata: {},
  },
  // Research Paper Collaborators (using full names where possible)
  {
    email: generatePlaceholderEmail('Emile Vorster'),
    fullName: 'Emile Vorster',
    metadata: {
      abbreviation: 'E. Vorster',
    },
  },
  {
    email: generatePlaceholderEmail('Jesse Haimes'),
    fullName: 'Jesse Haimes',
    metadata: {
      abbreviation: 'J. Haimes',
    },
  },
  {
    email: generatePlaceholderEmail('Jacy Reese Anthis'),
    fullName: 'Jacy Reese Anthis',
    metadata: {
      abbreviation: 'J. R. Anthis',
    },
  },
  {
    email: generatePlaceholderEmail('Ashleigh Strickland Cooper'),
    fullName: 'Ashleigh Strickland Cooper',
    metadata: {
      abbreviation: 'A. Strickland Cooper',
    },
  },
  {
    email: generatePlaceholderEmail('Joshua Olive'),
    fullName: 'Joshua Olive',
    metadata: {
      abbreviation: 'J. Olive',
    },
  },
  {
    email: generatePlaceholderEmail('Jonathan Bailey'),
    fullName: 'Jonathan Bailey',
    metadata: {
      abbreviation: 'J. Bailey',
    },
  },
  {
    email: generatePlaceholderEmail('Ali Abbas'),
    fullName: 'Ali Abbas',
    metadata: {
      abbreviation: 'A. Abbas',
    },
  },
  {
    email: generatePlaceholderEmail('Caspar Waggoner'),
    fullName: 'Caspar Waggoner',
    metadata: {
      abbreviation: 'C. Waggoner',
    },
  },
  {
    email: generatePlaceholderEmail('Dmitry Anisimov'),
    fullName: 'Dmitry Anisimov',
    metadata: {
      abbreviation: 'D. Anisimov',
    },
  },
  {
    email: generatePlaceholderEmail('Samuel Brown'),
    fullName: 'Samuel Brown',
    metadata: {
      abbreviation: 'S. Brown',
    },
  },
]
