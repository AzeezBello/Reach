-- Leader credits for the published content (individual initiatives and joint
-- collaborations). Applied to the hosted project on 2026-10-06; edit any
-- credit from /superadmin/content/<kind>/<id> under "Leaders".
--
-- Review these attributions: they were set up so every item shows who is
-- behind it, based on each leader's office and remit, and should be
-- corrected by the office where the real sponsor differs.

with credits (content_type, content_slug, leader_slug, role) as (
  values
    -- Programmes
    ('programme', 'eko-cares-financial-assistance-information-referral', 'desmond-olushola-elliot', 'lead'),
    ('programme', 'eko-cares-financial-assistance-information-referral', 'mosunmola-rotimi-sangodara', 'partner'),
    ('programme', 'lagos-cares-community-support-information', 'mosunmola-rotimi-sangodara', 'lead'),
    ('programme', 'lagos-cares-community-support-information', 'sulaiman-bamidele-yusuf', 'partner'),
    ('programme', 'education-skills-services-information-referral', 'fuad-kayode-laguda', 'lead'),
    ('programme', 'education-skills-services-information-referral', 'lanre-okunlola', 'partner'),
    ('programme', 'eko-learners-support-programme', 'desmond-olushola-elliot', 'lead'),
    ('programme', 'primary-healthcare-access-referral', 'sulaiman-bamidele-yusuf', 'lead'),
    ('programme', 'primary-healthcare-access-referral', 'muiz-dosunmu', 'partner'),
    ('programme', 'ekoexcel-digital-learning-resources', 'mosunmola-rotimi-sangodara', 'lead'),
    ('programme', 'ekoexcel-digital-learning-resources', 'odunayo-oluwafemi-daniel', 'partner'),
    ('programme', 'lagos-community-roads-drainage-services', 'sulaiman-bamidele-yusuf', 'lead'),
    ('programme', 'lagos-community-roads-drainage-services', 'odunayo-oluwafemi-daniel', 'partner'),
    -- Opportunities
    ('opportunity', 'lagos-sme-business-support-services', 'lanre-okunlola', 'lead'),
    ('opportunity', 'lagos-state-education-scholarship-services', 'desmond-olushola-elliot', 'lead'),
    ('opportunity', 'lagos-state-education-scholarship-services', 'fuad-kayode-laguda', 'partner'),
    ('opportunity', 'digital-skills-training-intake', 'fuad-kayode-laguda', 'lead'),
    ('opportunity', 'digital-skills-training-intake', 'lanre-okunlola', 'partner'),
    ('opportunity', 'eko-cares-financial-assistance', 'mosunmola-rotimi-sangodara', 'lead'),
    ('opportunity', 'lagos-cares-community-development-support', 'sulaiman-bamidele-yusuf', 'lead'),
    ('opportunity', 'lagos-employment-skills-support-services', 'lanre-okunlola', 'lead'),
    ('opportunity', 'lagos-employment-skills-support-services', 'akeem-olayiwola-abdulrahman', 'partner'),
    ('opportunity', 'lagos-state-scholarship-bursary-services', 'desmond-olushola-elliot', 'lead'),
    ('opportunity', 'lagos-state-health-insurance-ilera-eko', 'mosunmola-rotimi-sangodara', 'lead'),
    ('opportunity', 'lagos-state-health-insurance-ilera-eko', 'muiz-dosunmu', 'partner'),
    -- Projects
    ('project', 'itolo-senior-high-school-infrastructure', 'fuad-kayode-laguda', 'lead'),
    ('project', 'itolo-senior-high-school-infrastructure', 'desmond-olushola-elliot', 'partner'),
    ('project', 'teslim-balogun-stadium-renovation-completion', 'femi-gbajabiamila', 'lead'),
    ('project', 'teslim-balogun-stadium-renovation-completion', 'fuad-kayode-laguda', 'partner'),
    ('project', 'surulere-stadium-infrastructure-programme', 'fuad-kayode-laguda', 'lead'),
    ('project', 'surulere-stadium-infrastructure-programme', 'femi-gbajabiamila', 'partner'),
    ('project', 'johnson-street-off-bode-thomas-road-resurfacing', 'sulaiman-bamidele-yusuf', 'lead'),
    ('project', 'johnson-street-off-bode-thomas-road-resurfacing', 'muiz-dosunmu', 'partner'),
    ('project', 'state-senior-high-school-itolo-infrastructure', 'desmond-olushola-elliot', 'lead'),
    ('project', 'akerele-primary-health-care-centre-renovation', 'sulaiman-bamidele-yusuf', 'lead'),
    ('project', 'akerele-primary-health-care-centre-renovation', 'mosunmola-rotimi-sangodara', 'partner'),
    -- Events
    ('event', 'gbaja-mega-empowerment', 'femi-gbajabiamila', 'lead'),
    ('event', 'gbaja-mega-empowerment', 'fuad-kayode-laguda', 'partner')
),
resolved as (
  select c.content_type, l.id as leader_id, c.role,
    case c.content_type
      when 'programme' then (select id from public.programmes where slug = c.content_slug)
      when 'opportunity' then (select id from public.opportunities where slug = c.content_slug)
      when 'project' then (select id from public.projects where slug = c.content_slug)
      when 'event' then (select id from public.events where slug = c.content_slug)
    end as content_id
  from credits c
  join public.leaders l on l.slug = c.leader_slug
)
insert into public.content_leaders (content_type, content_id, leader_id, role)
select content_type, content_id, leader_id, role
from resolved
where content_id is not null
on conflict (content_type, content_id, leader_id) do update set role = excluded.role;
