// Default seed data. Used on first run, or when no saved state exists.

export const defaultMeta = {
  dashTitle: 'PROJECT DASHBOARD',
  projectName: 'HEADCHANGE',
  lastUpdated: 'November 2, 2026',
  currentPhase: 'Branding Development',
  startDate: 'June 24, 2026',
  endDate: 'Jan 22, 2027',
  thisWeekRange: 'Nov 2–6, 2026',
  thisWeekItems: '• Winter packaging updates',
  milestones: '• In-Store Display kickoff call\n• Final packaging approval',
};

export const defaultMonths = [
  { name: 'JUNE', weeksCount: 4 },
  { name: 'JULY', weeksCount: 4 },
  { name: 'AUGUST', weeksCount: 4 },
  { name: 'SEPTEMBER', weeksCount: 4 },
  { name: 'OCTOBER', weeksCount: 4 },
  { name: 'NOVEMBER', weeksCount: 4 },
  { name: 'DECEMBER', weeksCount: 4 },
  { name: 'JANUARY', weeksCount: 4 },
  { name: 'FEBRUARY', weeksCount: 3 },
];

export const defaultWaiting = [
  { id: 'w1', title: 'Kickoff calls schedule' },
  { id: 'w2', title: 'Packaging Copy Feedback' },
];

export const defaultTemplates = [
  {
    id: 'tmpl-1',
    title: 'Brand Strategy Discovery Homework',
    description: 'Core brand positioning, vision, target audience demographics, and brand values.',
    fields: [
      { label: 'Company Overview & Elevator Pitch', value: 'HEADCHANGE is a modern wellness and performance brand.' },
      { label: 'Primary Target Audience', value: 'Active professionals aged 25-45 looking for premium daily routines.' },
      { label: 'Top 3 Competitors', value: '1. Brand X, 2. Brand Y, 3. Studio Z' },
    ],
  },
  {
    id: 'tmpl-2',
    title: 'Packaging & Print Specs Form',
    description: 'Box dimensions, materials, barcode placements, and compliance copy.',
    fields: [
      { label: 'Box Dimensions (LxWxH)', value: '120mm x 80mm x 45mm' },
      { label: 'Print Materials & Finish', value: 'Matte recyclable cardboard with spot UV logo accent' },
      { label: 'Regulatory Copy / Warnings', value: 'Include standard FDA disclaimer on back panel.' },
    ],
  },
  {
    id: 'tmpl-3',
    title: 'E-Commerce & Website Brief',
    description: 'Platform preference, site structure, key integrations, and payment gateways.',
    fields: [
      { label: 'CMS / E-Commerce Platform', value: 'Shopify Plus' },
      { label: 'Key Features Required', value: 'Subscription support (Recharge), Custom Bundles, Currency Switcher' },
    ],
  },
  {
    id: 'tmpl-4',
    title: 'Photography & Creative Direction Shot List',
    description: 'Product hero shots, lifestyle setup requirements, and model casting notes.',
    fields: [
      { label: 'Required Deliverable Aspect Ratios', value: '1:1 Square (Shopify), 9:16 Vertical (Reels/TikTok)' },
      { label: 'Prop & Styling Notes', value: 'Minimalist wooden textures with bright warm natural daylight.' },
    ],
  },
];

const s = (id, title, completed) => ({ id, title, completed });

export const defaultPackages = [
  {
    id: 'pkg-1', number: '1', name: 'Brand Strategy', status: 'completed', startWeek: 1, endWeek: 4, templateId: 'tmpl-1',
    scope: [
      s('s1_1', 'Brand Discovery & Competitor Analysis', true),
      s('s1_2', 'Target Persona Profile & Positioning', true),
      s('s1_3', 'Brand Pillars & Core Values Definition', true),
      s('s1_4', 'Brand Strategy Presentation Deck', true),
    ],
    weekly: [
      { week: 'W1', work: 'Brand strategy workshop & discovery', client: 'Completed strategy questionnaire', milestone: 'Workshop Done', files: 'Brief.pdf', notes: 'Great alignment' },
      { week: 'W2', work: 'Finalizing positioning deck', client: 'Review initial concepts', milestone: 'Internal Review', files: 'Draft_v1.pdf', notes: 'On track' },
      { week: 'W3', work: 'Deliver final strategy deck', client: 'Feedback & sign-off', milestone: 'Review & Revision', files: 'Strategy_Final.pdf', notes: 'Approved' },
    ],
    assets: [
      { name: 'HEADCHANGE_Brand_Strategy_Final.pdf', size: '4.2 MB', url: '' },
      { name: 'Competitor_Research_Matrix.xlsx', size: '1.1 MB', url: '' },
    ],
  },
  {
    id: 'pkg-2', number: '2', name: 'Brand Messaging', status: 'completed', startWeek: 2, endWeek: 7, templateId: 'tmpl-1',
    scope: [
      s('s2_1', 'Tone of Voice Guidelines', true),
      s('s2_2', 'Tagline & Hero Messaging Matrix', true),
      s('s2_3', 'Key Product Benefit Statements', true),
      s('s2_4', 'Brand Story & Mission Copy', true),
    ],
    weekly: [
      { week: 'W2-W4', work: 'Drafting tone of voice & messaging framework', client: 'Provide existing collateral', milestone: 'Draft Delivery', files: 'Messaging_v1.docx', notes: 'Client feedback incorporated' },
      { week: 'W5-W7', work: 'Refining brand stories & taglines', client: 'Final deck sign-off', milestone: 'Messaging Sign-off', files: 'Brand_Messaging_Guide.pdf', notes: '100% complete' },
    ],
    assets: [{ name: 'Brand_Voice_Guidelines.pdf', size: '2.8 MB', url: '' }],
  },
  {
    id: 'pkg-3', number: '3', name: 'Visual Universe Exploration', status: 'in-progress', startWeek: 3, endWeek: 13, templateId: 'tmpl-1',
    scope: [
      s('s3_1', 'Moodboards & Creative Direction Routes', true),
      s('s3_2', 'Primary & Secondary Logo System', true),
      s('s3_3', 'Typography Palette & Color Suite', true),
      s('s3_4', 'Brand Patterns & 3D Texture Explorations', false),
      s('s3_5', 'Master Brand Identity Styleguide', false),
    ],
    weekly: [
      { week: 'W3-W8', work: 'Logo exploration & moodboard creation', client: 'Moodboard directional feedback', milestone: 'Direction Selection', files: 'Moodboard_Deck.pdf', notes: 'Option B selected' },
      { week: 'W9-W13', work: 'System refinement & pattern creation', client: 'Review expanded brand suite', milestone: 'Visual Identity Review', files: 'Identity_Exploration.pdf', notes: 'In progress' },
    ],
    assets: [{ name: 'Logo_Concepts_Presentation.pdf', size: '12.4 MB', url: '' }],
  },
  {
    id: 'pkg-4', number: '4', name: 'Packaging Design', status: 'in-progress', startWeek: 12, endWeek: 21, templateId: 'tmpl-2',
    scope: [
      s('s4_1', 'Primary Outer Box Dieline Setup', true),
      s('s4_2', 'Product Label Layouts (3 SKUs)', true),
      s('s4_3', 'Unboxing Experience & Inserts Concept', false),
      s('s4_4', '3D Photorealistic Packaging Renders', false),
      s('s4_5', 'Print-Ready Production Files & Finish Specs', false),
    ],
    weekly: [
      { week: 'W12-W16', work: 'Dieline construction & layout concepts', client: 'Provide SKU specs & dimensions', milestone: 'Dieline Lock', files: 'Dielines_Master.ai', notes: 'Specs received' },
      { week: 'W17-W21', work: 'Label artwork & 3D render mockups', client: 'Feedback on render iterations', milestone: 'Final Packaging Approval', files: 'Packaging_Renders.zip', notes: 'Currently reviewing W19' },
    ],
    assets: [{ name: 'SKU_1_Label_Draft.pdf', size: '3.5 MB', url: '' }],
  },
  {
    id: 'pkg-5', number: '5', name: 'Website Refresh', status: 'upcoming', startWeek: 22, endWeek: 30, templateId: 'tmpl-3',
    scope: [
      s('s5_1', 'Website Sitemap & UX Wireframes', false),
      s('s5_2', 'UI Kit & Component System Design', false),
      s('s5_3', 'Shopify E-Commerce Front-end Redesign', false),
    ],
    weekly: [], assets: [],
  },
  {
    id: 'pkg-6', number: '6', name: 'In-store Display Design', status: 'upcoming', startWeek: 19, endWeek: 25, templateId: 'tmpl-2',
    scope: [
      s('s6_1', 'Retail POS Stand Dimension Modeling', false),
      s('s6_2', 'Pop-Up Display Graphics & Signage', false),
    ],
    weekly: [], assets: [],
  },
  {
    id: 'pkg-7', number: '7', name: 'Photography', status: 'upcoming', startWeek: 22, endWeek: 28, templateId: 'tmpl-4',
    scope: [
      s('s7_1', 'Studio Product Hero Shots', false),
      s('s7_2', 'Lifestyle Model Photo Session', false),
    ],
    weekly: [], assets: [],
  },
  {
    id: 'pkg-8', number: '8', name: 'Social Management', status: 'upcoming', startWeek: 22, endWeek: 34, templateId: 'tmpl-1',
    scope: [
      s('s8_1', 'Social Media Grid Templates', false),
      s('s8_2', '30-Day Launch Content Calendar', false),
    ],
    weekly: [], assets: [],
  },
];
