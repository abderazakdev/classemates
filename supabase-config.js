/* =====================================================================
   supabase-config.js
   Sole job: initialise the Supabase client and expose it as
   window.supabaseClient for every other script.
   ---------------------------------------------------------------------
   Load order in index.html: Supabase CDN -> this file -> app-logic.js
   ---------------------------------------------------------------------
   SQL to run once in Supabase (SQL Editor) to create the table:

   create table if not exists public.students (
     id         bigint generated always as identity primary key,
     name       text    not null,
     surname    text    not null,
     age        integer not null check (age between 3 and 99),
     level      text    not null,
     class_id   text    not null,
     created_at timestamptz not null default now()
   );

   alter table public.students enable row level security;

   -- Demo policy (anyone with the anon key can insert/read).
   -- Tighten this before storing real pupils' data (see notes).
   create policy "demo insert" on public.students for insert to anon with check (true);
   create policy "demo read"   on public.students for select to anon using (true);
   ===================================================================== */
(function () {
  "use strict";

  const SUPABASE_URL = "[PASTE_YOUR_SUPABASE_PROJECT_URL_HERE]";
  const SUPABASE_ANON_KEY = "[PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE]";

  const isPlaceholder = (v) => !v || v.startsWith("[PASTE_");

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("[Classe mates] Supabase library not loaded. Check the CDN <script> tag in index.html.");
    window.supabaseClient = null;
    return;
  }

  if (isPlaceholder(SUPABASE_URL) || isPlaceholder(SUPABASE_ANON_KEY)) {
    console.warn("[Classe mates] Supabase credentials are still placeholders. Edit supabase-config.js.");
    window.supabaseClient = null;
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
