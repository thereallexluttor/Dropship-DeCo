-- Ejecutar en Supabase SQL Editor (o migración) antes de usar Descuentos por marca y el cron de expiración.
-- Añade la fecha de vigencia del descuento a nivel producto (último día inclusive).

alter table public.productos
  add column if not exists descuento_valido_hasta date null;

comment on column public.productos.descuento_valido_hasta is
  'Último día calendario (inclusive) en que el descuento aplica; el cron lo limpia al día siguiente.';
