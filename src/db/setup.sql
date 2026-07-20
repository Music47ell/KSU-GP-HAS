-- =============================================================================
-- KSU-GP-HAS: Healthcare Appointment System — Schema Only
-- Run this in the Supabase SQL editor first, then use scripts/seed.ts
-- to create test users via the Admin API (safe for all Supabase versions).
-- =============================================================================

-- 1. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Custom Enums
create type appointment_status as enum ('scheduled', 'cancelled', 'completed');
create type doctor_status as enum ('ONLINE', 'OFFLINE');
create type doctor_approval as enum ('APPROVED', 'DENIED', 'PENDING');

-- 3. Tables
create table public.admins (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  name text
);

create table public.doctors (
  id bigint primary key generated always as identity,
  user_id uuid not null unique references auth.users on delete cascade,
  name text,
  fees integer,
  specialty text,
  approved doctor_approval default 'PENDING',
  status text default 'offline'
);

create table public.patients (
  id bigint primary key generated always as identity,
  user_id uuid not null unique references auth.users on delete cascade,
  name text,
  dob date,
  gender text
);

create table public.appointments (
  id uuid not null default gen_random_uuid(),
  patient_id uuid not null references public.patients(user_id) on delete cascade,
  doctor_id uuid not null references public.doctors(user_id) on delete cascade,
  time timestamptz not null,
  purpose text,
  status appointment_status default 'scheduled',
  primary key (id)
);

-- 4. Row-Level Security
alter table public.appointments enable row level security;
alter table public.admins enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;

-- Admins: full access
create policy admin_all_policy on admins
  for all using (true);

-- Doctors: everyone can view, only self can insert/update/delete
create policy "doctors are viewable by everyone"
  on doctors for select using (true);

create policy "doctors can insert their own profile"
  on doctors for insert with check (auth.uid() = user_id);

create policy "doctors can update own profile"
  on doctors for update using (auth.uid() = user_id);

create policy "doctors can delete own profile"
  on doctors for delete using (auth.uid() = user_id);

-- Appointments: doctors can select/update their own
create policy doctor_appointments_select_policy
  on appointments for select
  using (auth.uid() in (select user_id from doctors where user_id = doctor_id));

create policy doctor_appointments_update_policy
  on appointments for update
  using (auth.uid() in (select user_id from doctors where user_id = doctor_id));

-- Patients: only self
create policy patient_select_policy
  on patients for select using (auth.uid() = user_id);

create policy patient_insert_policy
  on patients for insert with check (auth.uid() = user_id);

create policy patient_update_policy
  on patients for update using (auth.uid() = user_id);

create policy patient_delete_policy
  on patients for delete using (auth.uid() = user_id);

-- Appointments: patients can select/insert/update/delete their own
create policy patient_appointments_select_policy
  on appointments for select
  using (auth.uid() in (select user_id from patients where user_id = patient_id));

create policy patient_appointments_insert_policy
  on appointments for insert
  with check (auth.uid() in (select user_id from patients where user_id = patient_id));

create policy patient_appointments_update_policy
  on appointments for update
  using (auth.uid() in (select user_id from patients where user_id = patient_id));

create policy patient_appointments_delete_policy
  on appointments for delete
  using (auth.uid() in (select user_id from patients where user_id = patient_id));

-- 5. Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'role' = 'admin' then
    insert into public.admins (user_id, name)
    values (new.id, new.raw_user_meta_data ->> 'name');
  elsif new.raw_user_meta_data ->> 'role' = 'doctor' then
    insert into public.doctors (user_id, name, fees, specialty)
    values (
      new.id,
      new.raw_user_meta_data ->> 'name',
      (new.raw_user_meta_data ->> 'fees')::integer,
      new.raw_user_meta_data ->> 'specialty'
    );
  elsif new.raw_user_meta_data ->> 'role' = 'patient' then
    insert into public.patients (user_id, name, dob, gender)
    values (
      new.id,
      new.raw_user_meta_data ->> 'name',
      (new.raw_user_meta_data ->> 'dob')::date,
      new.raw_user_meta_data ->> 'gender'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
