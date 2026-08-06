-- IA BOT ALCALDÍA DIGITAL — verificación mínima para carga pública
-- Ejecutar en Supabase > SQL Editor si diagnostico-supabase.html devuelve 401/403 o []

alter table public.presentation_boards enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.presentation_boards to anon, authenticated;

drop policy if exists "Consejo de Gobierno public read" on public.presentation_boards;
create policy "Consejo de Gobierno public read"
on public.presentation_boards
for select
to anon, authenticated
using (board_id = 'consejo-gobierno-ciudad-orinoco');

-- Verifica que la fila exista exactamente con este ID:
select board_id, updated_at
from public.presentation_boards
where board_id = 'consejo-gobierno-ciudad-orinoco';
