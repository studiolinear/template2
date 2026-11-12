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

// Intake form templates: sections -> questions.
// question.type: text | textarea | dropdown | radio | checkbox | date
const q = (id, type, label, o = {}) => ({ id, type, label, required: !!o.required, options: o.options || [] });

export const defaultTemplates = [
  {
    id: 'tmpl-1',
    title: 'Brand Strategy Discovery Homework',
    description: 'Core brand positioning, vision, target audience demographics, and brand values.',
    sections: [
      { id: 't1-s1', title: 'About your company', description: 'Tell us who you are.', questions: [
        q('t1-q1', 'textarea', 'Company overview & elevator pitch', { required: true }),
        q('t1-q2', 'textarea', 'Primary target audience'),
        q('t1-q3', 'dropdown', 'Where is the brand in its life?', { options: ['Pre-launch', 'Launched < 1 year', 'Established'] }),
      ] },
      { id: 't1-s2', title: 'Positioning', description: '', questions: [
        q('t1-q4', 'textarea', 'Top 3 competitors'),
        q('t1-q5', 'checkbox', 'Which words describe the brand?', { options: ['Bold', 'Playful', 'Premium', 'Minimal', 'Scientific'] }),
      ] },
    ],
  },
  {
    id: 'tmpl-2',
    title: 'Packaging & Print Specs Form',
    description: 'Box dimensions, materials, barcode placements, and compliance copy.',
    sections: [
      { id: 't2-s1', title: 'Specs', description: '', questions: [
        q('t2-q1', 'text', 'Box dimensions (L x W x H)', { required: true }),
        q('t2-q2', 'dropdown', 'Print finish', { options: ['Matte', 'Gloss', 'Soft-touch', 'Spot UV accent'] }),
        q('t2-q3', 'radio', 'Recyclable materials required?', { options: ['Yes', 'No'] }),
      ] },
      { id: 't2-s2', title: 'Compliance', description: '', questions: [
        q('t2-q4', 'textarea', 'Regulatory copy / warnings'),
      ] },
    ],
  },
  {
    id: 'tmpl-3',
    title: 'E-Commerce & Website Brief',
    description: 'Platform preference, site structure, key integrations, and payment gateways.',
    sections: [
      { id: 't3-s1', title: 'Platform', description: '', questions: [
        q('t3-q1', 'dropdown', 'CMS / e-commerce platform', { options: ['Shopify', 'Shopify Plus', 'WooCommerce', 'Other'] }),
        q('t3-q2', 'checkbox', 'Features required', { options: ['Subscriptions', 'Custom bundles', 'Currency switcher', 'Reviews'] }),
      ] },
    ],
  },
  {
    id: 'tmpl-4',
    title: 'Photography & Creative Direction Shot List',
    description: 'Product hero shots, lifestyle setup requirements, and model casting notes.',
    sections: [
      { id: 't4-s1', title: 'Shot list', description: '', questions: [
        q('t4-q1', 'checkbox', 'Required aspect ratios', { options: ['1:1 Square', '9:16 Vertical', '16:9 Landscape', '4:5 Portrait'] }),
        q('t4-q2', 'textarea', 'Prop & styling notes'),
        q('t4-q3', 'date', 'Preferred shoot date'),
      ] },
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

// ---------------------------------------------------------------------------
// Scope-of-work templates (from the Studio Linear "Scope of work" doc).
// Each template is a package/tier; applying one fills the package's scope checklist.
// ---------------------------------------------------------------------------
const L = (str) => str.split('\n').map((x) => x.trim()).filter(Boolean);

const ST_STANDARD = `1-day strategy workshop
Brand strategy homework
Final Brand Strategy Handbook
Market + competitive analysis
Core identity re-exploration (positioning, personality, differentiation)
Audience + value proposition refinement
Mission, vision, values, and positioning statement
Rewritten brand narrative + messaging framework
Voice, tone, and cross-channel storytelling (web, social, retail)`;
const SOCIAL_BASE = `Social media strategy and positioning
Monthly content planning and calendar
Caption writing and post optimization
Scheduling and publishing content
Comment responses and light DM monitoring
Platform guidance and growth recommendations
Monthly performance reporting
Ongoing campaign and promo support`;
const INFLUENCER = `Influencer sourcing and vetting
Outreach and partnership coordination
Campaign briefs and content guidelines
Influencer relationship management
Content review and approvals
Campaign performance tracking and reporting`;
const UGC = `UGC creator sourcing and vetting
Creator outreach and coordination
Content brief development
Review and approval of UGC content
Organizing and delivering UGC assets
Performance reporting and optimization`;
const MSG_STANDARD = `Intake form
30min strategy call
Brand messaging deck
Problem / solution
Mission statement
Manifesto / who we are
Tone words
Buzz words
Headlines
Grammar & style guidelines
Voice do's and don'ts
2 rounds of revisions`;

export const defaultScopeTemplates = [
  { id: 'sc-bs-ess', name: 'Brand Strategy – Essentials', items: L(`1-hour kickoff call for brand alignment
Brand strategy homework (basic insights gathering)
Market & competitive overview (high-level)
Core identity review (positioning + differentiators)
Basic audience definition + key value proposition
Mini Brand Strategy Summary (short handbook)`) },
  { id: 'sc-bs-std', name: 'Brand Strategy – Standard', items: L(ST_STANDARD) },
  { id: 'sc-bs-prem', name: 'Brand Strategy – Premium', items: L(`${ST_STANDARD}
Additional stakeholder workshop(s) or deep-dive sessions
Extended competitive & cultural trend analysis
Expanded audience personas with psychographics and segmentation
Messaging playbook with platform-specific guidelines
Visual storytelling guidance for brand applications (packaging, digital, retail)
Launch strategy recommendations or campaign blueprint
Optional content examples for web, social, and retail`) },
  { id: 'sc-bm-ess', name: 'Brand Messaging – Essentials', items: L(`Intake form
30min strategy call
Brand messaging deck
Problem / solution
Mission statement
Tone words
Buzz words
Headlines
1 round of revisions`) },
  { id: 'sc-bm-std', name: 'Brand Messaging – Standard', items: L(MSG_STANDARD) },
  { id: 'sc-bm-prem', name: 'Brand Messaging – Premium', items: L(`${MSG_STANDARD}
Brand positioning statement
Audience personas
Value propositions
Brand story narrative
Extended tone matrix
Messaging pillars
Social bio + brand description
Email/newsletter intro copy`) },
  { id: 'sc-branding', name: 'Branding Package', items: L(`Intake form
Onboarding call
Pinterest board / mood board / color variations
Fonts
4-6 logo / submark concepts
Brand application examples
Basic brand book
2 rounds of revisions`) },
  { id: 'sc-packaging', name: 'Packaging Design', items: L(`Custom packaging design
Creative direction
Pinterest board
Moodboard
Digital mockup
Working files in .AI, .PNG, and .PDF formats
2 rounds of revisions`) },
  { id: 'sc-website', name: 'Website Package', items: L(`Intake form
Onboarding call
Collaborative Pinterest board
Up to 8 pages
Custom Figma design
Desktop & mobile responsive design
2 rounds of revisions
Build in selected CMS
Connect merch page with existing Shopify site
Connect to social media
Connect newsletter
Location map + age gate
Tax & shipping setup`) },
  { id: 'sc-photo', name: 'Product Photography', items: L(`5-7 images
Model not included
Additional props, wardrobe, model, and location to be reimbursed in the final invoice (if needed)`) },
  { id: 'sc-photo-life', name: 'Product & Lifestyle Photography', items: L(`5-7 images
Includes wardrobe, props and model
Location costs to be reimbursed in the final invoice (if needed)`) },
  { id: 'sc-social', name: 'Full Social Management + Strategy', items: L(SOCIAL_BASE) },
  { id: 'sc-social-inf', name: 'Full Social Management + Influencer Campaigns', items: L(`${SOCIAL_BASE}\n${INFLUENCER}`) },
  { id: 'sc-social-ugc', name: 'Full Social Management + UGC Program', items: L(`${SOCIAL_BASE}\n${UGC}`) },
  { id: 'sc-social-all', name: 'Full Social Management + Influencer + UGC', items: L(`${SOCIAL_BASE}
Influencer campaign management
${INFLUENCER}
UGC creator program management
${UGC}
Integrated campaign planning across all channels`) },
];

// ---------------------------------------------------------------------------
// Weekly-breakdown templates (from the "Weekly Breakdown" Google Sheet).
// Week numbers are relative (1 = the package's first week); applying one to a package maps them
// to the package's real timeline weeks. rows: [our work, client needs to provide, milestone / review]
// ---------------------------------------------------------------------------
export const defaultWeeklyTemplates = [
  { id: 'wk-bs', name: 'Brand Strategy', rows: [
    ['Brand strategy workshop', 'Completed brand strategy homework', 'Brand Strategy Workshop Completed'],
    ['Finalizing brand strategy deck', 'Any additional info during workshop (if applicable)', 'Final deck internal review'],
    ['Deliver final brand strategy deck', 'Feedback and revisions (if applicable)', 'Review and revision'],
    ['Finalize brand strategy', 'Final approval', 'Brand Strategy Approved ✅'],
  ] },
  { id: 'wk-bm', name: 'Brand Messaging', rows: [
    ['Preparation / Based on Brand strategy direction', 'Any additional info (if applicable)', 'Messaging framework prepared'],
    ['Develop brand messaging', 'Clarifications on messaging direction (if applicable)', 'Brand messaging internal review'],
    ['Deliver brand messaging deck', 'Feedback and revisions', 'Client review and feedback completed'],
    ['Finalize brand messaging', 'Final approval', 'Brand Messaging approved ✅'],
  ] },
  { id: 'wk-branding', name: 'Branding', rows: [
    ['Branding kickoff / Creative direction', '', 'Creative direction presented'],
    ['Brand concepts development', 'Additional feedback (if applicable)', 'Branding concepts development started'],
    ['Brand concepts presentation', 'Feedback and revisions', 'Branding concepts feedback received'],
    ['Revisions to brand concept', 'Feedback and revisions', 'Branding concepts feedback received'],
    ['Final revisions to brand concept', 'Feedback and revisions', 'Branding concepts feedback received'],
    ['Final deliverables', '', 'Branding package delivered'],
  ] },
  { id: 'wk-packaging', name: 'Packaging', rows: [
    ['Kickoff and preparation / Creative direction', 'All needed assets (dielines, product info, packaging material specs, etc.)', 'Packaging requirements complete'],
    ['Concept development & mockups', 'Feedback on design direction', 'Initial packaging concepts presented'],
    ['Design revisions', 'Feedback and confirm packaging details', 'Packaging design approved'],
    ['Final design revisions', 'Feedback and revisions', 'Branding concepts feedback received'],
    ['Finalization', 'Print-ready artwork approval', 'Packaging files delivered'],
  ] },
  { id: 'wk-website', name: 'Website', rows: [
    ['Kickoff / Preparation and asset collection', 'Website assets due this week', 'Website assets received & verified'],
    ['Homepage design', 'Any outstanding assets & homepage design feedback', 'Homepage design review'],
    ['Website design development', 'Final feedback on homepage & clarifications on page content', 'Interior pages presented'],
    ['Design revisions & finalization', 'Final approval of all website designs', 'Website design approved ✅'],
    ['Website development', 'Confirm technical access (if not already provided)', 'Development kickoff'],
    ['Continue development', 'API keys or 3rd party credentials (if applicable)', 'Development progress internal review'],
    ['Continue development', 'Final content updates (if any)', 'Development complete'],
    ['QA & client review', 'Review staging website & submit final feedback', 'Staging site approved'],
    ['Final refinements & launch', 'Final authorization to launch', 'Website successfully launched'],
  ] },
  { id: 'wk-photo', name: 'Photography', rows: [
    ['Shot planning', 'Review shot list, usage requirements', 'Shot list sent for review'],
    ['Finalize shot list', 'Approve final shot list & confirm products/SKUs', 'Shot list approved ✅'],
    ['Pre-production', 'Products must be delivered by this week', 'Pre-production underway'],
    ['Production preparation', 'Confirm availability for approvals (if needed)', 'Production ready'],
    ['Lifestyle photoshoot', 'Be available for real-time approvals (if attending remotely or on-site)', 'Photoshoot completed'],
    ['Post-production', 'Select preferred images & final approval of edits', 'Final images approved'],
    ['Final delivery', '', 'Lifestyle photography delivered'],
  ] },
];
