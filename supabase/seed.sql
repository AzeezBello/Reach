-- Seed data for the FKL Connect tenant: leadership profiles and the
-- collaborations between leaders and published content.
--
-- Safe to run more than once: every insert uses ON CONFLICT DO NOTHING and
-- content is matched by slug, so nothing is duplicated.

-- ---------------------------------------------------------------------------
-- Leaders (generated from lib/data/leaders.json)
-- ---------------------------------------------------------------------------

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'wasiu-sanni-eshilokun',
  'Senator Wasiu Sanni Eshilokun',
  'Senator',
  'federal',
  'Federal Government',
  'Senator, Lagos Central Senatorial District',
  'Lagos Central Senatorial District',
  'Lagos Central Senatorial District',
  'Senator Wasiu Sanni Eshilokun represents Lagos Central Senatorial District in the National Assembly.',
  array['Wasiu Sanni Eshilokun is a Nigerian politician serving in the Senate representing Lagos Central Senatorial District.', 'His legislative role places him within the federal representation structure serving communities across Lagos Central.']::text[],
  array['Federal legislative representation for Lagos Central Senatorial District.', 'Participation in Senate legislative and committee processes.']::text[],
  '[{"label": "National Assembly / NALTF — Senate Directory", "url": "https://naltf.gov.ng/senate-page/"}, {"label": "National Assembly — Senate Committees", "url": "https://naltf.gov.ng/senate-committees/"}]'::jsonb,
  '/images/leaders/wasiu-sanni-eshilokun.jpeg',
  10
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'fuad-kayode-laguda',
  'Hon. Fuad Kayode Laguda',
  'Member, House of Representatives',
  'federal',
  'Federal Government',
  'House of Representatives, Surulere I Federal Constituency',
  'Surulere I Federal Constituency',
  'Surulere I Federal Constituency',
  'Hon. Fuad Kayode Laguda represents the Surulere I Federal Constituency in the Federal House of Representatives and is the principal of the FKL Connect digital constituency office.',
  array['Fuad Kayode Laguda is a Nigerian public representative serving at the federal legislative level.', 'His constituency role connects residents of Surulere I with the National Assembly.']::text[],
  array['Federal legislative representation for Surulere I.', 'Representation of constituency interests within the House of Representatives.', 'Chairman, House Committee on Federal Polytechnics and Other Higher Technical Education.', 'Participation in federal legislative proceedings and oversight.']::text[],
  '[{"label": "National Assembly of Nigeria", "url": "https://nass.gov.ng/"}, {"label": "National Assembly — Members Directory", "url": "https://nass.gov.ng/mps/"}]'::jsonb,
  '/images/leaders/fuad-kayode-laguda.jpg',
  20
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'lanre-okunlola',
  'Hon. Lanre Okunlola',
  'Member, House of Representatives',
  'federal',
  'Federal Government',
  'House of Representatives, Surulere II Federal Constituency',
  'Surulere II Federal Constituency',
  'Surulere II Federal Constituency',
  'Hon. Lanre Okunlola represents the Surulere II Federal Constituency in the Federal House of Representatives.',
  array['Lanre Okunlola is a Nigerian legislator representing Surulere II Federal Constituency in the House of Representatives.', 'His National Assembly profile identifies him as a member of the House of Representatives for Surulere II.']::text[],
  array['Federal legislative representation for Surulere II.', 'Participation in House of Representatives legislative proceedings.', 'Representation of constituency interests at the federal level.']::text[],
  '[{"label": "National Assembly — Legislator Profile", "url": "https://nass.gov.ng/mps/single/588"}, {"label": "National Assembly of Nigeria", "url": "https://nass.gov.ng/"}]'::jsonb,
  '/images/leaders/lanre-okunlola.jpg',
  30
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'femi-gbajabiamila',
  'Rt. Hon. Femi Gbajabiamila',
  'Chief of Staff to the President',
  'federal',
  'Federal Government',
  'Office of the Chief of Staff to the President',
  'Federal Republic of Nigeria',
  null,
  'Rt. Hon. Femi Gbajabiamila is the Chief of Staff to President Bola Ahmed Tinubu. He previously represented Surulere I Federal Constituency in the House of Representatives and served as Speaker of the 9th House of Representatives.',
  array['Femi Gbajabiamila is a Nigerian lawyer and politician who currently serves as Chief of Staff to the President of Nigeria.', 'He previously represented Surulere I Federal Constituency in Lagos State in the House of Representatives.', 'The State House records that he assumed the role of Chief of Staff on June 14, 2023, after resigning his membership of the 10th House of Representatives.', 'He served as Speaker of Nigeria''s 9th House of Representatives from June 11, 2019, to June 13, 2023.']::text[],
  array['Chief of Staff to the President of the Federal Republic of Nigeria.', 'Former federal representative for Surulere I Federal Constituency.', 'Former Speaker of the 9th House of Representatives.', 'Participation in federal executive coordination and presidential engagements.']::text[],
  '[{"label": "The State House — Office of the President", "url": "https://statehouse.gov.ng/presidency/office-of-the-president/"}, {"label": "The State House — Presidency", "url": "https://statehouse.gov.ng/presidency/"}]'::jsonb,
  '/images/leaders/femi-gbajabiamila.webp',
  40
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'desmond-olushola-elliot',
  'Hon. Desmond Olushola Elliot',
  'Member, Lagos State House of Assembly',
  'state',
  'Lagos State Government',
  'Lagos State House of Assembly, Surulere I',
  'Surulere I State Constituency',
  'Surulere I State Constituency',
  'Hon. Desmond Olushola Elliot represents Surulere I State Constituency in the Lagos State House of Assembly.',
  array['Desmond Olushola Elliot is a Lagos State legislator representing Surulere I State Constituency.', 'He serves within the Lagos State House of Assembly and participates in state-level legislative responsibilities.']::text[],
  array['State legislative representation for Surulere I.', 'Participation in Lagos State House of Assembly proceedings.', 'Representation of constituency interests at the state level.']::text[],
  '[{"label": "Lagos State House of Assembly — 10th Assembly", "url": "https://lagoshouseofassembly.gov.ng/"}]'::jsonb,
  '/images/leaders/desmond-olushola-elliot.jpg',
  50
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'mosunmola-rotimi-sangodara',
  'Hon. Mosunmola Rotimi Sangodara',
  'Member, Lagos State House of Assembly',
  'state',
  'Lagos State Government',
  'Lagos State House of Assembly, Surulere II',
  'Surulere II State Constituency',
  'Surulere II State Constituency',
  'Hon. Mosunmola Rotimi Sangodara represents Surulere II State Constituency in the Lagos State House of Assembly.',
  array['Mosunmola Rotimi Sangodara is a Lagos State legislator representing Surulere II State Constituency.', 'Her role is part of the legislative representation structure of Lagos State.']::text[],
  array['State legislative representation for Surulere II.', 'Participation in Lagos State House of Assembly proceedings.', 'Representation of constituency interests at the state level.']::text[],
  '[{"label": "Lagos State House of Assembly — 10th Assembly", "url": "https://lagoshouseofassembly.gov.ng/"}]'::jsonb,
  '/images/leaders/mosunmola-rotimi-sangodara.jpeg',
  60
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'sulaiman-bamidele-yusuf',
  'Hon. Sulaiman Bamidele Yusuf',
  'Executive Chairman',
  'local',
  'Surulere Local Government',
  'Executive Chairman, Surulere Local Government',
  'Surulere Local Government Area',
  null,
  'Hon. Sulaiman Bamidele Yusuf serves as the Executive Chairman of Surulere Local Government Area.',
  array['Sulaiman Bamidele Yusuf serves in the executive leadership of Surulere Local Government Area.', 'His office is responsible for local government administration and service delivery within Surulere LGA.']::text[],
  array['Local government executive administration.', 'Coordination of local government services and programmes.', 'Community-level administration and service delivery.']::text[],
  '[{"label": "Surulere Local Government", "url": "https://surulerelga.lg.gov.ng/"}, {"label": "Local Governance Accountability Portal — Surulere LGA", "url": "https://lgaportal.org/lgaDetails?lgaId=519"}]'::jsonb,
  '/images/leaders/sulaiman-bamidele-yusuf.jpeg',
  70
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'prince-muiz-dosunmu',
  'Hon. Prince Muiz Dosunmu',
  'Vice Chairman',
  'local',
  'Surulere Local Government',
  'Vice Chairman, Surulere Local Government',
  'Surulere Local Government Area',
  null,
  'Hon. Prince Muiz Dosunmu serves as Vice Chairman of Surulere Local Government.',
  array['Prince Muiz Dosunmu serves in the executive leadership structure of Surulere Local Government.', 'The Vice Chairman''s office supports the administration and delivery of local government responsibilities.']::text[],
  array['Support for Surulere Local Government administration.', 'Participation in local government programmes and community initiatives.', 'Support for grassroots service delivery.']::text[],
  '[{"label": "Surulere Local Government", "url": "https://surulerelga.lg.gov.ng/"}]'::jsonb,
  null,
  80
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'akeem-olayiwola-abdulrahman',
  'Hon. Akeem Olayiwola AbdulRahman',
  'Legislative Assembly — Surulere LGA',
  'local',
  'Surulere Local Government',
  'Surulere Local Government Legislative Assembly',
  'Surulere Local Government Area',
  null,
  'Hon. Akeem Olayiwola AbdulRahman is listed among the candidates recorded for the Surulere Local Government legislative election.',
  array['Akeem Olayiwola AbdulRahman is associated with the legislative representation structure of Surulere Local Government.', 'His profile is included in the REACH directory as a local legislative representative, with the title kept deliberately neutral to reflect the available official election record.']::text[],
  array['Local legislative representation.', 'Participation in grassroots legislative responsibilities.', 'Representation of community interests through the local government legislative structure.']::text[],
  '[{"label": "Lagos State Independent Electoral Commission — 2025 Election Results", "url": "https://lasiec.gov.ng/2025_election_results/"}]'::jsonb,
  null,
  90
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, level, level_label, office, jurisdiction, constituency, summary, biography, service, sources, image_url, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'odunayo-oluwafemi-daniel',
  'Hon. Odunayo Oluwafemi Daniel',
  'Executive Chairman',
  'local',
  'Itire-Ikate LCDA',
  'Executive Chairman, Itire-Ikate LCDA',
  'Itire-Ikate Local Council Development Area',
  'Itire-Ikate LCDA',
  'Hon. Odunayo Oluwafemi Daniel serves as Executive Chairman of Itire-Ikate Local Council Development Area (LCDA), with a focus on local administration, community development and service delivery.',
  array['Hon. Oluwafemi Daniel Odunayo, popularly known as FOD, serves as the Executive Chairman of Itire-Ikate Local Council Development Area.', 'According to the official LCDA profile, he attended Saint Thomas Aquinas Primary School in Surulere and Birch Freeman High School, also in Surulere.', 'He later studied at the University of Lagos, Akoka, where he earned an Advanced Diploma in Security Operations and Management between 2012 and 2014.', 'The official LCDA profile describes his professional background as including specialised security support and training.']::text[],
  array['Executive leadership of Itire-Ikate LCDA.', 'Local administration and grassroots service delivery.', 'Community development and infrastructure initiatives.', 'Environmental, education, health and social-service initiatives within the LCDA.', 'Coordination of programmes intended to improve services and community conditions.']::text[],
  '[{"label": "Itire-Ikate LCDA — Official Profile", "url": "https://www.itireikatelcda.lg.gov.ng/team/hon-odunayo-oluwafemi-daniel/"}, {"label": "Itire-Ikate LCDA — Meet the Chairman", "url": "https://www.itireikatelcda.lg.gov.ng/meet-the-chairman/"}, {"label": "Itire-Ikate LCDA — Official Website", "url": "https://www.itireikatelcda.lg.gov.ng/"}]'::jsonb,
  '/images/leaders/odunayo-oluwafemi-daniel.jpg',
  100
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Collaborations
--
-- FKL leads every item published by the FKL Connect office. Selected items
-- are joint collaborations with a partner leader.
-- ---------------------------------------------------------------------------

-- Individual: FKL leads all programmes, opportunities and projects of the tenant.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'programme', p.id, l.id, 'lead'
from public.programmes p
join public.organizations o on o.id = p.organization_id and o.slug = 'fkl-connect'
join public.leaders l on l.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'opportunity', op.id, l.id, 'lead'
from public.opportunities op
join public.organizations o on o.id = op.organization_id and o.slug = 'fkl-connect'
join public.leaders l on l.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'project', pr.id, l.id, 'lead'
from public.projects pr
join public.organizations o on o.id = pr.organization_id and o.slug = 'fkl-connect'
join public.leaders l on l.slug = 'fuad-kayode-laguda'
on conflict do nothing;

-- Joint: Community Health & Wellbeing Outreach with the Itire-Ikate LCDA chairman.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'programme', p.id, l.id, 'partner'
from public.programmes p
join public.leaders l on l.slug = 'odunayo-oluwafemi-daniel'
where p.slug = 'community-health-wellbeing-outreach'
on conflict do nothing;

-- Joint: Community Infrastructure Improvement with the Surulere II representative.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'project', pr.id, l.id, 'partner'
from public.projects pr
join public.leaders l on l.slug = 'lanre-okunlola'
where pr.slug = 'community-infrastructure-improvement'
on conflict do nothing;

-- Joint: Community Lighting & Public Spaces with the Itire-Ikate LCDA chairman.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'project', pr.id, l.id, 'partner'
from public.projects pr
join public.leaders l on l.slug = 'odunayo-oluwafemi-daniel'
where pr.slug = 'community-lighting-public-spaces'
on conflict do nothing;

-- Joint: Education Support Opportunity with the Chief of Staff to the President.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'opportunity', op.id, l.id, 'partner'
from public.opportunities op
join public.leaders l on l.slug = 'femi-gbajabiamila'
where op.slug = 'education-support-opportunity'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

insert into public.events (organization_id, title, slug, summary, description, category, venue, location, starts_at, ends_at, capacity, status, image_url, is_featured)
select
  o.id,
  'Acada Carnival 2026',
  'acada-carnival-2026',
  'A celebration of learning for students across Surulere: quiz competitions, spelling bees, career talks, scholarship announcements and a fun fair.',
  E'Acada Carnival brings secondary-school students, teachers and parents from across the constituency together for a full day built around education.\n\nHighlights:\n• Inter-school quiz and spelling-bee finals\n• Career talks with professionals from the community\n• Scholarship and education-support announcements\n• Exhibitions from the FKL Skills Development Programme\n• Games, music and a fun fair for younger children\n\nSchools can register their teams through their principal. Individual students and families are welcome to attend free of charge.',
  'Education',
  'Teslim Balogun Stadium',
  'Surulere, Lagos',
  '2026-12-12 09:00:00+01',
  '2026-12-12 17:00:00+01',
  3000,
  'published',
  '/images/community/summer-with-fkl-04.webp',
  true
from public.organizations o
where o.slug = 'fkl-connect'
on conflict (organization_id, slug) do nothing;

insert into public.events (organization_id, title, slug, summary, description, category, venue, location, starts_at, ends_at, capacity, status, image_url, is_featured)
select
  o.id,
  'FKL Sports Community Fitness Day',
  'fkl-sports-community-fitness-day',
  'An early-morning aerobics, walk and basketball session open to residents of all ages, led by the FKL Sports team.',
  E'Join the FKL Sports team for a community fitness morning: a guided warm-up, a 3 km neighbourhood walk, aerobics, and friendly basketball and volleyball games.\n\nBring water and comfortable shoes. Free health checks (blood pressure and blood sugar) will be available on site.',
  'Sports & Health',
  'Rowe Park Sports Centre',
  'Yaba, Lagos',
  '2026-10-24 07:00:00+01',
  '2026-10-24 11:00:00+01',
  null,
  'published',
  '/images/community/fkl-sports-fitness-01.webp',
  false
from public.organizations o
where o.slug = 'fkl-connect'
on conflict (organization_id, slug) do nothing;

insert into public.events (organization_id, title, slug, summary, description, category, venue, location, starts_at, ends_at, capacity, status, image_url, is_featured)
select
  o.id,
  'Constituency Town Hall',
  'constituency-town-hall',
  'An open meeting where residents hear updates on projects and programmes and raise issues directly with the constituency office.',
  E'The town hall is an open forum for residents of Surulere I Federal Constituency.\n\nAgenda:\n• Progress report on community projects\n• Upcoming programmes and opportunities\n• Open floor: questions and requests from residents\n\nResidents who cannot attend can submit their questions in advance through a service request on this site.',
  'Community',
  'FKL Connect Digital Constituency Office',
  'Surulere, Lagos',
  '2026-11-14 10:00:00+01',
  '2026-11-14 13:00:00+01',
  250,
  'published',
  '/images/community/constituency-office-01.webp',
  false
from public.organizations o
where o.slug = 'fkl-connect'
on conflict (organization_id, slug) do nothing;

-- Event collaborations: FKL leads every event; Acada Carnival is a joint
-- collaboration with the Itire-Ikate LCDA chairman.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', e.id, l.id, 'lead'
from public.events e
join public.organizations o on o.id = e.organization_id and o.slug = 'fkl-connect'
join public.leaders l on l.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', e.id, l.id, 'partner'
from public.events e
join public.leaders l on l.slug = 'odunayo-oluwafemi-daniel'
where e.slug = 'acada-carnival-2026'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', e.id, l.id, 'partner'
from public.events e
join public.leaders l on l.slug = 'femi-gbajabiamila'
where e.slug = 'gbaja-mega-empowerment'
on conflict do nothing;
