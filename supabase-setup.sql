-- Ejecutar en Supabase > SQL Editor.
-- Esta versión es funcional para una pizarra pública controlada por un único ID.
-- Para producción institucional se recomienda añadir autenticación y políticas por usuario.

create table if not exists public.presentation_boards (
  board_id text primary key,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.presentation_boards enable row level security;

create policy "Public boards can be read"
on public.presentation_boards for select
using (true);

create policy "Public boards can be inserted"
on public.presentation_boards for insert
with check (true);

create policy "Public boards can be updated"
on public.presentation_boards for update
using (true)
with check (true);

-- IMPORTANTE:
-- Estas políticas facilitan el prototipo, pero cualquier persona que conozca el board_id
-- y la URL pública podría modificar la configuración. Para producción, implemente Supabase Auth
-- y restrinja insert/update al usuario administrador autenticado.
