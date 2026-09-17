-- ============================================================
-- SUPABASE — CENA DE GALA / DEDICATORIAS
-- Ejecutar TODO este archivo en Supabase > SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- Tabla principal de dedicatorias
create table if not exists public.dedications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default 'Anónimo',
  recipient text,
  type text not null,
  message text not null,
  anonymous boolean not null default false,
  visible boolean not null default true
);

-- Usuarios autorizados como STAFF
create table if not exists public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.dedications enable row level security;
alter table public.staff_members enable row level security;

-- ============================================================
-- PERMISOS
-- ============================================================

revoke all on table public.dedications from anon;
revoke all on table public.dedications from authenticated;

grant insert on table public.dedications to anon;
grant insert on table public.dedications to authenticated;
grant select, delete on table public.dedications to authenticated;

revoke all on table public.staff_members from anon;
revoke all on table public.staff_members from authenticated;
grant select on table public.staff_members to authenticated;

-- ============================================================
-- POLÍTICAS DE DEDICATORIAS
-- ============================================================

drop policy if exists "Public can send dedications" on public.dedications;
create policy "Public can send dedications"
on public.dedications
for insert
to anon, authenticated
with check (
  char_length(message) between 1 and 700
  and char_length(name) <= 60
  and char_length(coalesce(recipient, '')) <= 80
  and char_length(type) <= 80
);

drop policy if exists "Staff can read dedications" on public.dedications;
create policy "Staff can read dedications"
on public.dedications
for select
to authenticated
using (
  exists (
    select 1
    from public.staff_members s
    where s.user_id = (select auth.uid())
  )
);

drop policy if exists "Staff can hide dedications" on public.dedications;
create policy "Staff can hide dedications"
on public.dedications
for delete
to authenticated
using (
  exists (
    select 1
    from public.staff_members s
    where s.user_id = (select auth.uid())
  )
);

-- ============================================================
-- POLÍTICA DE STAFF
-- Cada usuario autenticado solo puede comprobar su propia
-- pertenencia a staff.
-- ============================================================

drop policy if exists "Staff can see own membership" on public.staff_members;
create policy "Staff can see own membership"
on public.staff_members
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Índice para que la consulta de autorización sea rápida.
create index if not exists staff_members_user_id_idx
on public.staff_members(user_id);

create index if not exists dedications_created_at_idx
on public.dedications(created_at desc);

-- ============================================================
-- REALTIME
-- Permite que staff.html reciba nuevas dedicatorias sin tener
-- que recargar manualmente.
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dedications'
  ) then
    alter publication supabase_realtime add table public.dedications;
  end if;
end $$;

-- ============================================================
-- DESPUÉS DE CREAR EL USUARIO STAFF EN AUTH
-- ============================================================
-- En Supabase > Authentication > Users crea el usuario con email
-- y contraseña. Copia su UUID y ejecuta:
--
-- insert into public.staff_members (user_id, display_name)
-- values ('UUID-DEL-USUARIO', 'Staff');
--
-- Ejemplo:
-- insert into public.staff_members (user_id, display_name)
-- values ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'Carly');
--
-- NO pongas aquí una contraseña.
