export interface PhotoMemory {
  id: string;
  src: string;
  alt: string;
  caption: string;
  dateLabel: string;
  location: string;
  /** Slight organic tilt in degrees for the pinned polaroid board */
  tiltDeg: number;
  /** Washi tape tint (warm translucent pastel) */
  tapeColor: string;
  tapeAngleDeg: number;
}

export interface TimelineMilestone {
  yearLabel: string;
  dateLabel: string;
  title: string;
  description: string;
}

export interface AnniversaryConfig {
  /** Three 2-digit numbers required to unlock the keepsake */
  passcode: readonly [string, string, string];
  brandName: string;
  coupleNames: string;
  establishedLabel: string;
  /** ISO-8601 timestamp with timezone offset so elapsed time & countdown are exact */
  startDateIso: string;
  startDateDisplay: string;
  lockScreen: {
    title: string;
    boxLabels: readonly [string, string, string];
    submitLabel: string;
  };
  celebration: {
    heading: string;
    subheading: string;
    counterTitle: string;
    boardTitle: string;
    boardSubtitle: string;
    letterSectionTitle: string;
    timelineTitle: string;
  };
  photos: readonly PhotoMemory[];
  letter: {
    dateLabel: string;
    salutation: string;
    paragraphs: readonly string[];
    closing: string;
    signature: string;
  };
  timeline: readonly TimelineMilestone[];
}

export const anniversaryConfig: AnniversaryConfig = {
  passcode: ['25', '31', '20'],
  brandName: 'AnniversaryBox',
  coupleNames: 'NEW & FERN',
  establishedLabel: 'Est. Nov 20, 2020',
  startDateIso: '2020-11-20T00:00:00+07:00',
  startDateDisplay: 'November 20, 2020',
  lockScreen: {
    title: 'Log in to Card',
    boxLabels: ['First', 'Second', 'Third'],
    submitLabel: "Let's Go",
  },
  celebration: {
    heading: 'Slow mornings, late trains, and always coming home to you.',
    subheading:
      'Nothing flashy here—just our running clock since day one, the countdown to every November 20, and the chapters we have shared so far.',
    counterTitle: 'Time Together Since November 20, 2020',
    boardTitle: 'Pinned Snapshots',
    boardSubtitle:
      'Tap any polaroid to look closer—swap these mock frames in public/photos/ whenever you are ready.',
    letterSectionTitle: 'A Note on Cream Paper',
    timelineTitle: 'Chapters So Far',
  },
  photos: [
    {
      id: 'year-1',
      src: '/photos/photo-01.svg',
      alt: 'Two iced coffees on a sunlit wooden café table with a dried flower bud vase',
      caption: 'Two iced coffees & a table we stayed at way too long',
      dateLabel: 'Nov 2020',
      location: 'Corner Café, Ari',
      tiltDeg: -2.4,
      tapeColor: 'rgba(217, 167, 160, 0.58)',
      tapeAngleDeg: -6,
    },
    {
      id: 'year-2',
      src: '/photos/photo-02.svg',
      alt: 'Dusk skyline seen through a warm train window with a saved ticket stub',
      caption: 'Almost missed the last train back, kept the stub anyway',
      dateLabel: 'Oct 2021',
      location: 'Evening Line',
      tiltDeg: 1.9,
      tapeColor: 'rgba(187, 199, 180, 0.62)',
      tapeAngleDeg: 5,
    },
    {
      id: 'year-3',
      src: '/photos/photo-03.svg',
      alt: 'Rainy window pane beside an open book and a steaming rose ceramic mug',
      caption: 'All Saturday indoors while the storm refused to stop',
      dateLabel: 'Aug 2022',
      location: 'Rainy Weekend',
      tiltDeg: -1.3,
      tapeColor: 'rgba(232, 207, 173, 0.65)',
      tapeAngleDeg: -4,
    },
    {
      id: 'year-4',
      src: '/photos/photo-04.svg',
      alt: 'Golden sunset over quiet ocean waves with two figures walking along the shore',
      caption: 'Sand in our shoes and the quietest sunset of the trip',
      dateLabel: 'Dec 2023',
      location: 'Hua Hin Shore',
      tiltDeg: 2.5,
      tapeColor: 'rgba(217, 167, 160, 0.54)',
      tapeAngleDeg: 7,
    },
    {
      id: 'year-5',
      src: '/photos/photo-05.svg',
      alt: 'Cardboard moving boxes, leaned framed art, and a small potted olive tree in morning sun',
      caption: 'Dinner on cardboard boxes on our very first night here',
      dateLabel: 'May 2025',
      location: 'Our First Place',
      tiltDeg: -1.8,
      tapeColor: 'rgba(187, 199, 180, 0.6)',
      tapeAngleDeg: -5,
    },
    {
      id: 'year-6',
      src: '/photos/photo-06.svg',
      alt: 'Balcony at twilight with warm string lights, two chairs, and dried roses on a small table',
      caption: 'Same balcony chairs, still talking past midnight',
      dateLabel: 'Nov 2026',
      location: 'Home Balcony',
      tiltDeg: 1.4,
      tapeColor: 'rgba(232, 207, 173, 0.68)',
      tapeAngleDeg: 4,
    },
  ],
  letter: {
    dateLabel: 'November 20, 2026',
    salutation: 'To Fern,',
    paragraphs: [
      'Every November feels both impossibly quick and deeply lived-in. Looking back at that first afternoon over melting ice and half-finished coffees, I had no idea how ordinary and steady my favorite days with you would turn out to be.',
      'What I love most about us is not only the big trips or the milestone dates. It is the small shorthand we have built—knowing when to put the kettle on without asking, splitting the last bite of whatever is on the table, and sitting quietly in the same room when a long week wears us down.',
      'Thank you for every year of patience, good humor, honest conversations, and making every chapter feel like a place I wanted to stay. No matter how many Novembers roll past on this clock, you are still the person I want to tell everything to first.',
    ],
    closing: 'Always yours,',
    signature: 'New',
  },
  timeline: [
    {
      yearLabel: 'Year 01',
      dateLabel: 'November 2020',
      title: 'Two iced coffees that turned into four hours',
      description:
        'We sat near the window until the café started stacking chairs, already inventing excuses to meet again the next weekend.',
    },
    {
      yearLabel: 'Year 02',
      dateLabel: 'October 2021',
      title: 'Learning each other’s neighborhoods',
      description:
        'Long train rides, shared earphones, and discovering which late-night noodle stalls were actually worth the detour.',
    },
    {
      yearLabel: 'Year 03',
      dateLabel: 'August 2022',
      title: 'Quiet Saturdays when it poured',
      description:
        'No plans, no itinerary—just rain against the glass, half-read paperbacks, and realizing silence together felt easy.',
    },
    {
      yearLabel: 'Year 04',
      dateLabel: 'December 2023',
      title: 'Salt air and an unhurried coast',
      description:
        'Waking up early for sunrise, missing it by forty minutes, and deciding sunset was better anyway.',
    },
    {
      yearLabel: 'Year 05',
      dateLabel: 'May 2025',
      title: 'One set of keys and taped-up boxes',
      description:
        'Unpacking mismatched mugs, arguing fondly over where the bookshelf belonged, and turning bare walls into home.',
    },
    {
      yearLabel: 'Year 06',
      dateLabel: 'November 2026',
      title: 'Still choosing the balcony seats',
      description:
        'Six years in, and the best part of any day is still hearing the door unlock and catching up over dinner.',
    },
  ],
};
