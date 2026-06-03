begin;

alter table public.admin_job_openings
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists description text,
  add column if not exists responsibilities jsonb not null default '[]'::jsonb,
  add column if not exists requirements jsonb not null default '[]'::jsonb,
  add column if not exists is_technical boolean not null default false;

update public.admin_job_openings
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
  || '-' || substr(replace(id::text, '-', ''), 1, 6)
where slug is null or trim(slug) = '';

create unique index if not exists admin_job_openings_slug_key
  on public.admin_job_openings(slug);

create table if not exists public.career_application_questions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.admin_job_openings(id) on delete cascade,
  question_scope text not null default 'shared' check (question_scope in ('shared', 'talent_pool', 'role')),
  field_key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'url', 'select', 'checkbox')),
  placeholder text,
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  is_technical_only boolean not null default false,
  section text not null default 'Application',
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  check (
    (question_scope = 'role' and job_id is not null)
    or (question_scope in ('shared', 'talent_pool') and job_id is null)
  ),
  unique nulls not distinct (question_scope, job_id, field_key)
);

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid unique references public.admin_hiring_candidates(id) on delete cascade,
  job_id uuid references public.admin_job_openings(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  location text not null,
  linkedin_url text,
  portfolio_url text,
  live_project_url text,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'withdrawn', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.career_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.career_applications(id) on delete cascade,
  document_type text not null check (document_type in ('cv', 'cover_letter')),
  original_filename text not null,
  mime_type text not null,
  file_extension text not null,
  bytes integer not null check (bytes > 0),
  cloudinary_public_id text not null unique,
  cloudinary_asset_id text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (application_id, document_type)
);

create index if not exists career_applications_job_created_idx
  on public.career_applications(job_id, created_at desc);

create index if not exists career_questions_job_position_idx
  on public.career_application_questions(job_id, position, created_at);

alter table public.career_application_questions enable row level security;
alter table public.career_applications enable row level security;
alter table public.career_application_documents enable row level security;

revoke all on table public.career_application_questions from anon, authenticated, public;
revoke all on table public.career_applications from anon, authenticated, public;
revoke all on table public.career_application_documents from anon, authenticated, public;

insert into public.career_application_questions
  (job_id, question_scope, field_key, label, field_type, placeholder, options, is_required, section, position)
values
  (null, 'shared', 'why_woosho', 'Why do you want to work at WooSho?', 'textarea', 'Tell us what caught your attention and how you would contribute.', '[]', true, 'Motivation', 10),
  (null, 'shared', 'start_timeline', 'When would you be available to start?', 'text', 'Immediately, two weeks notice, or a specific date', '[]', true, 'Availability', 20),
  (null, 'shared', 'employment_preference', 'Preferred engagement type', 'select', null, '["Full-time","Part-time","Contract","Internship"]', true, 'Availability', 30),
  (null, 'shared', 'initiative_example', 'Describe a time you solved an important problem without being asked.', 'textarea', 'Keep the example concrete: the situation, your action, and the result.', '[]', true, 'Ownership', 40)
on conflict (question_scope, job_id, field_key) do nothing;

insert into public.career_application_questions
  (job_id, question_scope, field_key, label, field_type, placeholder, options, is_required, is_technical_only, section, position)
values
  (null, 'shared', 'live_project_url', 'Live project URL', 'url', 'https://your-live-project.example', '[]', true, true, 'Technical Work', 50)
on conflict (question_scope, job_id, field_key) do nothing;

insert into public.career_application_questions
  (job_id, question_scope, field_key, label, field_type, placeholder, options, is_required, section, position)
values
  (null, 'talent_pool', 'talent_position', 'Which talent position best matches the work you would like to do at WooSho?', 'select', null, '["Software Engineering","Product Management","Product Design","Data and AI","Operations","Sales and Partnerships","Marketing and Growth","Customer Experience","Finance and Administration","Other"]', true, 'Talent Pool', 100),
  (null, 'talent_pool', 'experience_level', 'What best describes your current experience level?', 'select', null, '["Student or intern","Entry level","Early career","Mid level","Senior","Lead or manager","Executive","Career switcher"]', true, 'Talent Pool', 110),
  (null, 'talent_pool', 'skills_summary', 'What skills, tools, or domain knowledge would you bring to WooSho?', 'textarea', 'Focus on the capabilities you would want the hiring team to remember.', '[]', true, 'Talent Pool', 120),
  (null, 'talent_pool', 'opportunity_direction', 'What kind of opportunity or problem would you be most interested in working on?', 'textarea', 'Describe the work where you think you could make a strong contribution.', '[]', true, 'Talent Pool', 130),
  (null, 'talent_pool', 'work_arrangement', 'Which working arrangement would you prefer?', 'select', null, '["Remote","Hybrid","On-site","Flexible"]', true, 'Talent Pool', 140),
  (null, 'talent_pool', 'talent_pool_consent', 'I agree that WooSho may retain my talent-pool profile and contact me about relevant opportunities.', 'checkbox', null, '[]', true, 'Talent Pool', 150)
on conflict (question_scope, job_id, field_key) do nothing;

create or replace function public.get_public_career_openings()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', job.id,
      'slug', job.slug,
      'title', job.title,
      'department', job.department,
      'location', job.location,
      'employmentType', job.employment_type,
      'openings', job.openings,
      'summary', coalesce(job.summary, ''),
      'description', coalesce(job.description, ''),
      'responsibilities', job.responsibilities,
      'requirements', job.requirements,
      'isTechnical', job.is_technical
    )
    order by job.created_at desc
  ), '[]'::jsonb)
  from public.admin_job_openings job
  where job.status = 'open';
$$;

create or replace function public.get_public_career_form(selected_job_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_job public.admin_job_openings%rowtype;
begin
  if selected_job_id is not null then
    select * into selected_job
    from public.admin_job_openings job
    where job.id = selected_job_id
      and job.status = 'open';

    if not found then
      raise exception 'This position is no longer accepting applications'
        using errcode = 'P0002';
    end if;
  end if;

  return jsonb_build_object(
    'job', case when selected_job_id is null then null else jsonb_build_object(
      'id', selected_job.id,
      'title', selected_job.title,
      'isTechnical', selected_job.is_technical
    ) end,
    'questions', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', question.id,
          'key', question.field_key,
          'label', question.label,
          'type', question.field_type,
          'placeholder', coalesce(question.placeholder, ''),
          'options', question.options,
          'required', question.is_required,
          'section', question.section,
          'position', question.position
        )
        order by question.position, question.created_at
      ), '[]'::jsonb)
      from public.career_application_questions question
      where question.is_active = true
        and (
          (question.question_scope = 'shared' and question.job_id is null)
          or (
            selected_job_id is null
            and question.question_scope = 'talent_pool'
            and question.job_id is null
          )
          or (
            selected_job_id is not null
            and question.question_scope = 'role'
            and question.job_id = selected_job_id
          )
        )
        and (
          question.is_technical_only = false
          or coalesce(selected_job.is_technical, false) = true
        )
    )
  );
end;
$$;

create or replace function public.get_admin_hiring()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  return jsonb_build_object(
    'candidates', (
      select coalesce(jsonb_agg(
        to_jsonb(candidate) || jsonb_build_object(
          'application', case when application.id is null then null else
            to_jsonb(application) || jsonb_build_object(
              'documents', (
                select coalesce(jsonb_agg(to_jsonb(document) order by document.created_at), '[]'::jsonb)
                from public.career_application_documents document
                where document.application_id = application.id
              )
            )
          end
        )
        order by candidate.created_at desc
      ), '[]'::jsonb)
      from public.admin_hiring_candidates candidate
      left join public.career_applications application on application.candidate_id = candidate.id
    ),
    'jobs', (
      select coalesce(jsonb_agg(
        to_jsonb(job) || jsonb_build_object(
          'questions', (
            select coalesce(jsonb_agg(to_jsonb(question) order by question.position, question.created_at), '[]'::jsonb)
            from public.career_application_questions question
            where question.job_id = job.id
          )
        )
        order by job.created_at desc
      ), '[]'::jsonb)
      from public.admin_job_openings job
    ),
    'talentPoolQuestions', (
      select coalesce(jsonb_agg(to_jsonb(question) order by question.position, question.created_at), '[]'::jsonb)
      from public.career_application_questions question
      where question.question_scope = 'talent_pool'
        and question.job_id is null
    ),
    'stages', jsonb_build_array('applied', 'screening', 'interview', 'offer', 'hired')
  );
end;
$$;

create or replace function public.admin_upsert_job_opening(
  job_id uuid,
  job_title text,
  job_department text,
  job_location text,
  job_employment_type text,
  job_openings integer,
  job_summary text default null,
  job_description text default null,
  job_responsibilities jsonb default '[]'::jsonb,
  job_requirements jsonb default '[]'::jsonb,
  job_is_technical boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_job_id uuid;
  saved_slug text;
begin
  perform private.assert_admin_role(array['super_admin']);

  if nullif(trim(job_title), '') is null
    or nullif(trim(job_department), '') is null
    or nullif(trim(job_location), '') is null
    or job_employment_type not in ('full_time', 'part_time', 'contract', 'internship')
    or job_openings is null
    or job_openings < 1
  then
    raise exception 'Valid job title, department, location, type, and vacancy count are required'
      using errcode = '22023';
  end if;

  saved_slug := trim(both '-' from regexp_replace(lower(trim(job_title)), '[^a-z0-9]+', '-', 'g'));

  if job_id is null then
    insert into public.admin_job_openings(
      title, slug, department, location, employment_type, openings, summary,
      description, responsibilities, requirements, is_technical
    )
    values (
      trim(job_title), saved_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
      trim(job_department), trim(job_location), job_employment_type, job_openings,
      nullif(trim(job_summary), ''), nullif(trim(job_description), ''),
      coalesce(job_responsibilities, '[]'::jsonb), coalesce(job_requirements, '[]'::jsonb),
      coalesce(job_is_technical, false)
    )
    returning id into saved_job_id;
  else
    update public.admin_job_openings
    set title = trim(job_title),
      department = trim(job_department),
      location = trim(job_location),
      employment_type = job_employment_type,
      openings = job_openings,
      summary = nullif(trim(job_summary), ''),
      description = nullif(trim(job_description), ''),
      responsibilities = coalesce(job_responsibilities, '[]'::jsonb),
      requirements = coalesce(job_requirements, '[]'::jsonb),
      is_technical = coalesce(job_is_technical, false),
      updated_at = timezone('utc'::text, now())
    where id = job_id
    returning id into saved_job_id;

    if not found then
      raise exception 'Job opening was not found' using errcode = 'P0002';
    end if;
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'job_opening',
    case when job_id is null then 'Job opening created' else 'Job opening updated' end,
    jsonb_build_object('jobId', saved_job_id, 'title', trim(job_title))
  );

  return saved_job_id;
end;
$$;

create or replace function public.admin_upsert_career_question(
  question_id uuid,
  question_job_id uuid,
  question_key text,
  question_label text,
  question_type text,
  question_placeholder text default null,
  question_options jsonb default '[]'::jsonb,
  question_required boolean default false,
  question_position integer default 0,
  application_scope text default 'role'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_question_id uuid;
begin
  perform private.assert_admin_role(array['super_admin']);

  if application_scope not in ('role', 'talent_pool')
    or (application_scope = 'role' and question_job_id is null)
    or (application_scope = 'talent_pool' and question_job_id is not null)
    or nullif(trim(question_key), '') is null
    or nullif(trim(question_label), '') is null
    or question_type not in ('text', 'textarea', 'url', 'select', 'checkbox')
  then
    raise exception 'Valid question details are required' using errcode = '22023';
  end if;

  if question_type = 'select'
    and jsonb_array_length(coalesce(question_options, '[]'::jsonb)) < 1
  then
    raise exception 'Dropdown questions require at least one option' using errcode = '22023';
  end if;

  if question_id is null then
    insert into public.career_application_questions(
      job_id, question_scope, field_key, label, field_type, placeholder, options, is_required, position
    )
    values (
      question_job_id, application_scope, trim(question_key), trim(question_label), question_type,
      nullif(trim(question_placeholder), ''), coalesce(question_options, '[]'::jsonb),
      coalesce(question_required, false), coalesce(question_position, 0)
    )
    returning id into saved_question_id;
  else
    update public.career_application_questions
    set field_key = trim(question_key),
      label = trim(question_label),
      field_type = question_type,
      placeholder = nullif(trim(question_placeholder), ''),
      options = coalesce(question_options, '[]'::jsonb),
      is_required = coalesce(question_required, false),
      position = coalesce(question_position, 0),
      updated_at = timezone('utc'::text, now())
    where id = question_id
      and job_id is not distinct from question_job_id
      and question_scope = application_scope
    returning id into saved_question_id;

    if not found then
      raise exception 'Career question was not found' using errcode = 'P0002';
    end if;
  end if;

  return saved_question_id;
end;
$$;

create or replace function public.admin_delete_career_question(question_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);
  delete from public.career_application_questions
  where id = question_id
    and question_scope in ('talent_pool', 'role');
  if not found then
    raise exception 'Career question was not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.get_public_career_openings() from public;
grant execute on function public.get_public_career_openings() to anon, authenticated;
revoke all on function public.get_public_career_form(uuid) from public;
grant execute on function public.get_public_career_form(uuid) to anon, authenticated;
revoke all on function public.admin_upsert_job_opening(uuid, text, text, text, text, integer, text, text, jsonb, jsonb, boolean) from public;
grant execute on function public.admin_upsert_job_opening(uuid, text, text, text, text, integer, text, text, jsonb, jsonb, boolean) to authenticated;
revoke all on function public.admin_upsert_career_question(uuid, uuid, text, text, text, text, jsonb, boolean, integer, text) from public;
grant execute on function public.admin_upsert_career_question(uuid, uuid, text, text, text, text, jsonb, boolean, integer, text) to authenticated;
revoke all on function public.admin_delete_career_question(uuid) from public;
grant execute on function public.admin_delete_career_question(uuid) to authenticated;

commit;
