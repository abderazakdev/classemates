/* =====================================================================
   supabase-config.js
   Sole job: initialise the Supabase client and expose it as
   window.supabaseClient for every other script.
   ---------------------------------------------------------------------
   Load order in index.html: Supabase CDN -> this file -> app-logic.js
   ---------------------------------------------------------------------
   SQL to run once in Supabase (SQL Editor) to create the tables:

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

   -- Shared account directory, so a teacher on one device can find a
   -- student's account ID even if that student signed up on another
   -- device/browser. NOTE: this is a lightweight classroom demo, not a
   -- production auth system: the anon key can read and write this
   -- table (including the password field), so do not use real
   -- sensitive passwords, and do not use this for anything beyond a
   -- private classroom tool.

   create table if not exists public.accounts (
     id         text primary key,
     password   text    not null,
     name       text    not null,
     surname    text    not null,
     age        integer not null check (age between 3 and 99),
     level      text    not null,
     photo      text,
     plus       boolean not null default false,
     last_edit  bigint,
     updated_at timestamptz not null default now()
   );

   alter table public.accounts enable row level security;

   create policy "demo accounts upsert" on public.accounts for insert to anon with check (true);
   create policy "demo accounts update" on public.accounts for update to anon using (true);
   create policy "demo accounts read"   on public.accounts for select to anon using (true);

   -- Phone push-notification subscriptions ("START A MATE" live alerts).
   -- Only the account owner's browser ever writes its own subscription;
   -- there is deliberately no anon SELECT policy, so a subscription's
   -- endpoint can't be read back over the anon key. The send-live-push
   -- Edge Function reads this table with the service-role key instead,
   -- which bypasses RLS. See PUSH_NOTIFICATIONS_SETUP.md for the rest
   -- of the setup (VAPID keys, deploying the function).

   create table if not exists public.push_subscriptions (
     id         bigint generated always as identity primary key,
     account_id text not null,
     endpoint   text not null unique,
     p256dh     text not null,
     auth       text not null,
     created_at timestamptz not null default now()
   );

   alter table public.push_subscriptions enable row level security;

   create policy "demo push upsert" on public.push_subscriptions for insert to anon with check (true);
   create policy "demo push update" on public.push_subscriptions for update to anon using (true);
   create policy "demo push delete" on public.push_subscriptions for delete to anon using (true);
   ===================================================================== */
(function () {
  "use strict";

  const SUPABASE_URL = "https://lkihlhnqyxwooqkgbdzv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_666E_qq_uBOWWd2awoRLKw_0I2D52CV";

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
