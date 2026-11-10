-- Optional demo seed. First create an account in the app and select "Recruiter / employer".
-- This inserts sample company and vacancy records owned by the earliest recruiter profile.

do $$
declare
  recruiter_id uuid;
begin
  select id into recruiter_id
  from public.profiles
  where role = 'recruiter'
  order by created_at asc
  limit 1;

  if recruiter_id is null then
    raise exception 'Create a CareerConnect recruiter account first, then run this seed script.';
  end if;

  insert into public.companies (owner_id, name, slug, website, description, industry, company_size, headquarters)
  values
    (recruiter_id, 'Northstar Digital', 'northstar-digital', 'https://example.com', 'Product engineering studio building reliable digital experiences for growing businesses.', 'Software Development', '51–200', 'Bengaluru, India'),
    (recruiter_id, 'FinEdge Technologies', 'finedge-technologies', 'https://example.com', 'Technology team developing secure financial products and payment infrastructure.', 'Financial Technology', '201–500', 'Hyderabad, India'),
    (recruiter_id, 'Meridian Insights', 'meridian-insights', 'https://example.com', 'Analytics and research team helping organizations make evidence-led decisions.', 'Data & Analytics', '11–50', 'Remote, India'),
    (recruiter_id, 'Loom & Logic', 'loom-and-logic', 'https://example.com', 'Design-led product company focused on clear, accessible software experiences.', 'Design & Technology', '11–50', 'Pune, India')
  on conflict (slug) do update set name = excluded.name, description = excluded.description;

  insert into public.company_members (company_id, user_id, member_role)
  select c.id, recruiter_id, 'owner'
  from public.companies c
  where c.slug in ('northstar-digital', 'finedge-technologies', 'meridian-insights', 'loom-and-logic')
  on conflict (company_id, user_id) do nothing;

  insert into public.jobs (
    company_id, created_by, title, slug, department, description, responsibilities, requirements,
    location, work_mode, employment_type, experience_level, salary_min, salary_max,
    salary_currency, status, published_at
  )
  select c.id, recruiter_id, v.title, v.slug, v.department, v.description, v.responsibilities,
         v.requirements, v.location, v.work_mode::public.work_mode,
         v.employment_type::public.employment_type, v.experience_level::public.experience_level,
         v.salary_min, v.salary_max, 'INR', 'published', now()
  from (values
    ('northstar-digital', 'Frontend Engineer', 'frontend-engineer-northstar', 'Engineering',
     'Build accessible, high-performance product experiences with React and TypeScript. Partner with design and backend teams to deliver reliable interfaces.',
     array['Develop and maintain responsive product interfaces', 'Collaborate on design systems and component quality'],
     array['React', 'TypeScript', 'CSS', 'REST API integration'], 'Bengaluru, India', 'hybrid', 'full_time', 'junior', 600000, 900000),
    ('finedge-technologies', 'Backend Developer – Node.js', 'backend-nodejs-finedge', 'Engineering',
     'Develop secure APIs and scalable services for a growing financial technology platform. Work closely with product, data, and infrastructure teams.',
     array['Design and implement versioned APIs', 'Improve database performance and service reliability'],
     array['Node.js', 'PostgreSQL', 'REST APIs', 'Git'], 'Hyderabad, India', 'onsite', 'full_time', 'entry', 500000, 750000),
    ('meridian-insights', 'Data Analyst Intern', 'data-analyst-intern-meridian', 'Analytics',
     'Turn business data into clear dashboards, reports, and useful insights. Support data quality, analysis, and stakeholder reporting.',
     array['Prepare and validate datasets', 'Build recurring dashboards and reports'],
     array['SQL', 'Python', 'Excel', 'Data visualization'], 'Remote, India', 'remote', 'internship', 'entry', 180000, 240000),
    ('loom-and-logic', 'Product Design Associate', 'product-design-associate-loom', 'Design',
     'Work with product and engineering teams to shape intuitive user journeys and polished product experiences.',
     array['Create user flows and interactive prototypes', 'Contribute to the product design system'],
     array['Figma', 'Prototyping', 'Design systems', 'User research'], 'Pune, India', 'hybrid', 'full_time', 'junior', 450000, 650000),
    ('northstar-digital', 'QA Automation Engineer', 'qa-automation-northstar', 'Quality Engineering',
     'Improve release confidence by designing automated tests and quality checks for web applications.',
     array['Build and maintain automated test suites', 'Collaborate with engineers to prevent regressions'],
     array['Playwright', 'JavaScript', 'API testing', 'CI/CD'], 'Bengaluru, India', 'hybrid', 'full_time', 'junior', 500000, 800000),
    ('finedge-technologies', 'Cloud Support Associate', 'cloud-support-finedge', 'Cloud Operations',
     'Support cloud application reliability through monitoring, incident triage, and clear operational documentation.',
     array['Monitor cloud services and investigate incidents', 'Maintain operational runbooks'],
     array['Linux', 'Networking fundamentals', 'AWS or Azure', 'Problem solving'], 'Hyderabad, India', 'onsite', 'full_time', 'entry', 400000, 600000)
  ) as v(company_slug, title, slug, department, description, responsibilities, requirements, location, work_mode, employment_type, experience_level, salary_min, salary_max)
  join public.companies c on c.slug = v.company_slug
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    status = 'published',
    published_at = coalesce(public.jobs.published_at, now());
end;
$$;
