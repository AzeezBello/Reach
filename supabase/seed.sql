-- Seed data for the FKL Connect tenant: leadership profiles and the
-- collaborations between leaders and published content.
--
-- Safe to run more than once: every insert uses ON CONFLICT DO NOTHING and
-- content is matched by slug, so nothing is duplicated.

-- ---------------------------------------------------------------------------
-- Leaders
-- ---------------------------------------------------------------------------

insert into public.leaders (organization_id, slug, name, role, office, jurisdiction, summary, biography, service, sources, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'fuad-kayode-laguda',
  'Fuad Kayode Laguda',
  'Member, House of Representatives',
  'Surulere I Federal Constituency',
  'Lagos State',
  'Member of the House of Representatives for Surulere I Federal Constituency and principal of the FKL Connect digital constituency office.',
  array[
    'Fuad Kayode Laguda is a member of Nigeria''s House of Representatives representing Surulere I Federal Constituency.',
    'National Assembly records provide public documentation of his participation in legislative proceedings and parliamentary business.'
  ],
  array[
    'Member of the 10th House of Representatives.',
    'Representative for Surulere I Federal Constituency, Lagos State.',
    'Chairman, House Committee on Federal Polytechnics and Other Higher Technical Education.'
  ],
  '[{"label": "National Assembly — Official Records", "url": "https://nass.gov.ng/"}]'::jsonb,
  1
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, office, jurisdiction, summary, biography, service, sources, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'femi-gbajabiamila',
  'Femi Gbajabiamila',
  'Chief of Staff to the President',
  'Office of the President',
  'Federal Republic of Nigeria',
  'Chief of Staff to the President. The State House records that he assumed the role on June 14, 2023, after serving in the House of Representatives and as Speaker of the 9th House.',
  array[
    'The State House identifies Femi Gbajabiamila as a lawyer and politician serving as Chief of Staff to the President.',
    'The State House records that he attended Igbobi College, Yaba, Lagos, and later pursued Advanced Level studies at King William''s College, Isle of Man, United Kingdom.'
  ],
  array[
    'Chief of Staff to the President since June 14, 2023.',
    'Former Speaker of Nigeria''s 9th House of Representatives, serving from June 11, 2019 to June 13, 2023.',
    'Former representative for Surulere I Federal Constituency in Lagos State.'
  ],
  '[{"label": "State House — Office of the President", "url": "https://statehouse.gov.ng/presidency/office-of-the-president/"}]'::jsonb,
  2
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, office, jurisdiction, summary, biography, service, sources, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'lanre-okunlola',
  'Lanre Okunlola',
  'Member, House of Representatives',
  'Surulere II Federal Constituency',
  'Lagos State',
  'Member of the House of Representatives for Surulere II Federal Constituency, according to the National Assembly''s official legislator profile.',
  array[
    'The National Assembly''s official legislator profile identifies Hon. Lanre Okunlola as a member of the House of Representatives for Surulere II Federal Constituency.',
    'The official profile provides parliamentary information for his office and constituency.'
  ],
  array[
    'Member of the House of Representatives.',
    'Representative for Surulere II Federal Constituency, Lagos State.'
  ],
  '[{"label": "National Assembly — Legislator Profile", "url": "https://nass.gov.ng/mps/single/588"}]'::jsonb,
  3
on conflict (slug) do nothing;

insert into public.leaders (organization_id, slug, name, role, office, jurisdiction, summary, biography, service, sources, sort_order)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  'odunayo-oluwafemi-daniel',
  'Odunayo Oluwafemi Daniel',
  'Executive Chairman',
  'Itire-Ikate LCDA',
  'Lagos State',
  'Executive Chairman of Itire-Ikate Local Council Development Area.',
  array[
    'The official Itire-Ikate LCDA profile identifies Hon. Odunayo Oluwafemi Daniel as Executive Chairman.',
    'The LCDA''s official profile states that he attended Saint Thomas Aquinas Primary School and Birch Freeman High School in Surulere, Lagos, before studying at the University of Lagos.',
    'The same official profile records an Advanced Diploma in Security Operations and Management from the University of Lagos between 2012 and 2014.'
  ],
  array[
    'Executive Chairman of Itire-Ikate LCDA.',
    'The official LCDA profile describes prior experience in specialised security support and training.',
    'The LCDA identifies community development and public service as areas of his administration.'
  ],
  '[{"label": "Itire-Ikate LCDA — Chairman Profile", "url": "https://www.itireikatelcda.lg.gov.ng/meet-the-chairman/"}, {"label": "Itire-Ikate LCDA — Official Team Profile", "url": "https://www.itireikatelcda.lg.gov.ng/team/hon-odunayo-oluwafemi-daniel/"}]'::jsonb,
  4
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
