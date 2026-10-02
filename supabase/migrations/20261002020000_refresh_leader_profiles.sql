-- Refresh the initial Surulere leadership directory with current, sourced profiles.
-- Preserve existing organization/account links and content collaborations.

insert into public.leaders (
  organization_id, slug, name, role, level, level_label, office,
  jurisdiction, constituency, summary, biography, service, sources,
  image_url, sort_order
)
select
  (select id from public.organizations where slug = 'fkl-connect'),
  profile.slug,
  profile.name,
  profile.role,
  profile.level,
  profile.level_label,
  profile.office,
  profile.jurisdiction,
  profile.constituency,
  profile.summary,
  profile.biography,
  profile.service,
  profile.sources,
  profile.image_url,
  profile.sort_order
from (values
  (
    'wasiu-sanni-eshilokun',
    'Senator Wasiu Sanni Eshilokun',
    'Senator, Lagos Central',
    'federal', 'Federal Government',
    'Senator, Lagos Central Senatorial District',
    'Lagos Central Senatorial District',
    'Lagos Central Senatorial District',
    'Senator Wasiu Sanni Eshilokun represents Lagos Central in the 10th Senate of Nigeria.',
    array[
      'The National Assembly Library Trust Fund lists Senator Sanni Wasiu Eshilokun as the senator for Lagos Central, Lagos State, on the APC platform.',
      'He serves in the Senate of the 10th National Assembly.'
    ]::text[],
    array[
      'Federal legislative representation for Lagos Central Senatorial District.',
      'Participation in Senate legislative business and committee work.'
    ]::text[],
    '[{"label":"National Assembly Library Trust Fund — Senate Directory","url":"https://naltf.gov.ng/senate-page/"},{"label":"National Assembly — Senate Committees","url":"https://naltf.gov.ng/senate-committees/"}]'::jsonb,
    '/images/leaders/wasiu-sanni-eshilokun.jpeg', 10
  ),
  (
    'fuad-kayode-laguda',
    'Hon. Fuad Kayode Laguda',
    'Member, House of Representatives',
    'federal', 'Federal Government',
    'House of Representatives, Surulere I Federal Constituency',
    'Surulere I Federal Constituency',
    'Surulere I Federal Constituency',
    'Fuad Kayode Laguda represents Surulere I Federal Constituency in the House of Representatives.',
    array[
      'Fuad Kayode Laguda won the February 2024 Surulere I House of Representatives by-election.',
      'Before entering the House, he worked in revenue administration at the Lagos State Internal Revenue Service and the Federal Inland Revenue Service.',
      'He studied Economics at the University of Maiduguri and holds postgraduate qualifications in public administration and business administration from the University of Lagos.'
    ]::text[],
    array[
      'Federal legislative representation for Surulere I.',
      'Representation of constituency interests in the House of Representatives.'
    ]::text[],
    '[{"label":"National Assembly — Fuad Kayode Laguda","url":"https://nass.gov.ng/rep/laguda-fuad-kayode"},{"label":"TheCable — Profile: Fuad Laguda","url":"https://www.thecable.ng/profile-fuad-laguda-taxman-who-is-determined-to-continue-gbajas-legacy-at-nassembly/"}]'::jsonb,
    '/images/leaders/fuad-kayode-laguda.jpg', 20
  ),
  (
    'lanre-okunlola',
    'Hon. Lanre Okunlola',
    'Member, House of Representatives',
    'federal', 'Federal Government',
    'House of Representatives, Surulere II Federal Constituency',
    'Surulere II Federal Constituency',
    'Surulere II Federal Constituency',
    'Lanre Okunlola represents Surulere II Federal Constituency in the House of Representatives.',
    array[
      'The National Assembly member directory identifies Hon. Lanre Okunlola as the APC representative for Surulere II Federal Constituency.',
      'His National Assembly profile provides official contact and parliamentary information.'
    ]::text[],
    array[
      'Federal legislative representation for Surulere II.',
      'Participation in House of Representatives legislative proceedings.'
    ]::text[],
    '[{"label":"National Assembly — Hon. Lanre Okunlola","url":"https://www.nass.gov.ng/mps/single/588"}]'::jsonb,
    '/images/leaders/lanre-okunlola.jpg', 30
  ),
  (
    'femi-gbajabiamila',
    'Rt. Hon. Femi Gbajabiamila',
    'Chief of Staff to the President',
    'federal', 'Federal Government',
    'Office of the Chief of Staff to the President',
    'Federal Republic of Nigeria', null,
    'Femi Gbajabiamila is Chief of Staff to President Bola Ahmed Tinubu and a former Speaker of the House of Representatives.',
    array[
      'The State House lists Femi Gbajabiamila as Chief of Staff to the President.',
      'He represented Surulere I in the House of Representatives from 2003 until June 2023 and served as Speaker of the 9th House from 2019 to 2023.',
      'He studied law at the University of Lagos and was called to the Nigerian Bar in 1984.'
    ]::text[],
    array[
      'Executive coordination as Chief of Staff to the President.',
      'Former federal legislative representation for Surulere I.',
      'Former Speaker of the 9th House of Representatives.'
    ]::text[],
    '[{"label":"The State House — Office of the President","url":"https://statehouse.gov.ng/presidency/office-of-the-president/"}]'::jsonb,
    '/images/leaders/femi-gbajabiamila.webp', 40
  ),
  (
    'desmond-olushola-elliot',
    'Hon. Desmond Olushola Elliott',
    'Member, Lagos State House of Assembly',
    'state', 'Lagos State Government',
    'Lagos State House of Assembly, Surulere I',
    'Surulere I State Constituency',
    'Surulere I State Constituency',
    'Desmond Olushola Elliott represents Surulere I in the Lagos State House of Assembly.',
    array[
      'The Lagos State House of Assembly lists Desmond Olushola Elliott as a member and identifies him with Surulere Constituency I.',
      'His official Assembly profile records a BSc in Economics from Lagos State University and postgraduate study in legislative studies.',
      'The Assembly profile lists his public office email as hondesmondelliot@lagoshouseofassembly.gov.ng.'
    ]::text[],
    array[
      'State legislative representation for Surulere I.',
      'House committee and constituency work in the Lagos State House of Assembly.'
    ]::text[],
    '[{"label":"Lagos State House of Assembly — Desmond Olushola Elliott","url":"https://lagoshouseofassembly.gov.ng/home/desmond-olushola-elliott/"},{"label":"TheCable — Desmond Elliot declares 4th assembly bid","url":"https://www.thecable.ng/surulere-blessed-me-i-have-to-give-back-desmond-elliot-declares-4th-lagos-assembly-bid/"}]'::jsonb,
    '/images/leaders/desmond-olushola-elliot.jpg', 50
  ),
  (
    'mosunmola-rotimi-sangodara',
    'Hon. (Mrs.) Mosunmola Rotimi Sangodara',
    'Member, Lagos State House of Assembly',
    'state', 'Lagos State Government',
    'Lagos State House of Assembly, Surulere II',
    'Surulere II State Constituency',
    'Surulere II State Constituency',
    'Mosunmola Rotimi Sangodara represents Surulere II in the Lagos State House of Assembly.',
    array[
      'The Lagos State House of Assembly lists Hon. (Mrs.) Mosunmola Rotimi Sangodara as the member representing Surulere Constituency II in the 10th Assembly.',
      'Her official profile records a background in banking and business administration and identifies her as chair of the House Committee on Education (Ministry and Agency).',
      'The Assembly profile lists her public office email as honsangodaram@lagoshouseofassembly.gov.ng.'
    ]::text[],
    array[
      'State legislative representation for Surulere II.',
      'Chair, House Committee on Education (Ministry and Agency).'
    ]::text[],
    '[{"label":"Lagos State House of Assembly — Mosunmola Rotimi Sangodara","url":"https://lagoshouseofassembly.gov.ng/home/hon-mrs-mosunmola-rotimi-sangodara/"}]'::jsonb,
    '/images/leaders/mosunmola-rotimi-sangodara.jpeg', 60
  ),
  (
    'sulaiman-bamidele-yusuf',
    'Hon. Sulaiman Bamidele Yusuf',
    'Executive Chairman',
    'local', 'Surulere Local Government',
    'Executive Chairman, Surulere Local Government',
    'Surulere Local Government Area', null,
    'Sulaiman Bamidele Yusuf is the elected Executive Chairman of Surulere Local Government following the 2025 Lagos council elections.',
    array[
      'Sulaiman Bamidele Yusuf was elected Executive Chairman of Surulere Local Government in the July 2025 Lagos council elections.',
      'His office is responsible for local administration and service delivery across Surulere LGA.'
    ]::text[],
    array[
      'Local government executive administration.',
      'Coordination of council services and community programmes.'
    ]::text[],
    '[{"label":"LASIEC — 2025 Election Results","url":"https://lasiec.gov.ng/2025_election_results/"},{"label":"BusinessDay — 2025 Lagos local council chairmen","url":"https://businessday.ng/news/article/here-are-57-new-chairmen-of-lagos-local-councils/"}]'::jsonb,
    '/images/leaders/sulaiman-bamidele-yusuf.jpeg', 70
  ),
  (
    'prince-muiz-dosunmu',
    'Hon. Muiz Dosunmu',
    'Vice Chairman',
    'local', 'Surulere Local Government',
    'Vice Chairman, Surulere Local Government',
    'Surulere Local Government Area', null,
    'Muiz Dosunmu is the Vice Chairman of Surulere Local Government, elected with the 2025 council administration.',
    array[
      'Muiz Dosunmu was elected Vice Chairman of Surulere Local Government with the 2025 Lagos council administration.',
      'As vice chairman, he supports the executive administration of the local council.'
    ]::text[],
    array[
      'Support for Surulere Local Government administration.',
      'Participation in council programmes and grassroots service delivery.'
    ]::text[],
    '[{"label":"LASIEC — 2025 Election Results","url":"https://lasiec.gov.ng/2025_election_results/"},{"label":"BusinessDay — 2025 Lagos local council chairmen","url":"https://businessday.ng/news/article/here-are-57-new-chairmen-of-lagos-local-councils/"}]'::jsonb,
    null, 80
  ),
  (
    'akeem-olayiwola-abdulrahman',
    'Hon. Akeem Olayiwola Abdulrahman',
    'Councillor and Council Leader',
    'local', 'Surulere Local Government',
    'Surulere Local Government Legislative Council',
    'Surulere Local Government Area',
    'Ward F3, Surulere Local Government Area',
    'Akeem Olayiwola Abdulrahman is a Surulere councillor and council leader.',
    array[
      'The Lagos State Independent Electoral Commission includes Akeem Olayiwola Abdulrahman in its 2025 Surulere election results.',
      'Public professional information identifies him as a councillor for Ward F3 and council leader in Surulere Local Government.'
    ]::text[],
    array[
      'Local legislative representation in Surulere.',
      'Council leadership and representation of ward constituents.'
    ]::text[],
    '[{"label":"LASIEC — Surulere 2025 Election Results","url":"https://www.lasiec.gov.ng/wp-content/uploads/2025results/SURULERE%20RESULT.xlsx"},{"label":"Public professional profile — Akeem Olayiwola Abdulrahman","url":"https://ng.linkedin.com/in/olayiwola-akeem-abdulrahman-66947b29b"}]'::jsonb,
    null, 90
  ),
  (
    'odunayo-oluwafemi-daniel',
    'Hon. Odunayo Oluwafemi Daniel',
    'Executive Chairman',
    'local', 'Itire-Ikate LCDA',
    'Executive Chairman, Itire-Ikate LCDA',
    'Itire-Ikate Local Council Development Area',
    'Itire-Ikate LCDA',
    'Oluwafemi Daniel Odunayo, known as FOD, is the Executive Chairman of Itire-Ikate LCDA.',
    array[
      'The Itire-Ikate LCDA lists Hon. Odunayo Oluwafemi Daniel as its Executive Chairman.',
      'His official biography records primary and secondary education in Surulere and an Advanced Diploma in Security Operations and Management from the University of Lagos.',
      'The LCDA describes his focus as local administration, community development, and service delivery.'
    ]::text[],
    array[
      'Executive leadership of Itire-Ikate LCDA.',
      'Local administration and grassroots service delivery.',
      'Community development programmes.'
    ]::text[],
    '[{"label":"Itire-Ikate LCDA — Official Profile","url":"https://www.itireikatelcda.lg.gov.ng/team/hon-odunayo-oluwafemi-daniel/"},{"label":"Itire-Ikate LCDA — Executive Cabinet","url":"https://itireikatelcda.lg.gov.ng/cat_team/executive-cabinets/"}]'::jsonb,
    '/images/leaders/odunayo-oluwafemi-daniel.jpg', 100
  )
) as profile (
  slug, name, role, level, level_label, office, jurisdiction,
  constituency, summary, biography, service, sources, image_url, sort_order
)
on conflict (slug) do update set
  name = excluded.name,
  role = excluded.role,
  level = excluded.level,
  level_label = excluded.level_label,
  office = excluded.office,
  jurisdiction = excluded.jurisdiction,
  constituency = excluded.constituency,
  summary = excluded.summary,
  biography = excluded.biography,
  service = excluded.service,
  sources = excluded.sources,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  updated_at = now();

-- FKL is the lead for the tenant's published and draft initiatives.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'programme', content.id, leader.id, 'lead'
from public.programmes content
join public.organizations org on org.id = content.organization_id and org.slug = 'fkl-connect'
join public.leaders leader on leader.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'opportunity', content.id, leader.id, 'lead'
from public.opportunities content
join public.organizations org on org.id = content.organization_id and org.slug = 'fkl-connect'
join public.leaders leader on leader.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'project', content.id, leader.id, 'lead'
from public.projects content
join public.organizations org on org.id = content.organization_id and org.slug = 'fkl-connect'
join public.leaders leader on leader.slug = 'fuad-kayode-laguda'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', content.id, leader.id, 'lead'
from public.events content
join public.organizations org on org.id = content.organization_id and org.slug = 'fkl-connect'
join public.leaders leader on leader.slug = 'fuad-kayode-laguda'
on conflict do nothing;

-- Gbaja partnerships are limited to the education support and empowerment items.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'opportunity', content.id, leader.id, 'partner'
from public.opportunities content
join public.leaders leader on leader.slug = 'femi-gbajabiamila'
where content.slug = 'education-support-opportunity'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', content.id, leader.id, 'partner'
from public.events content
join public.leaders leader on leader.slug = 'femi-gbajabiamila'
where content.slug = 'gbaja-mega-empowerment'
on conflict do nothing;

-- FOD partnerships are limited to initiatives explicitly named for health,
-- community infrastructure/lighting, and the Acada Carnival.
insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'programme', content.id, leader.id, 'partner'
from public.programmes content
join public.leaders leader on leader.slug = 'odunayo-oluwafemi-daniel'
where content.slug = 'community-health-wellbeing-outreach'
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'project', content.id, leader.id, 'partner'
from public.projects content
join public.leaders leader on leader.slug = 'odunayo-oluwafemi-daniel'
where content.slug in (
  'community-infrastructure-improvement',
  'community-lighting-public-spaces'
)
on conflict do nothing;

insert into public.content_leaders (content_type, content_id, leader_id, role)
select 'event', content.id, leader.id, 'partner'
from public.events content
join public.leaders leader on leader.slug = 'odunayo-oluwafemi-daniel'
where content.slug in ('acada-carnival', 'acada-carnival-2026')
on conflict do nothing;