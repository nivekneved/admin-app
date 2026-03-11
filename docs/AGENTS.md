## [2026-03-11 23:55] Antigravity

- Updated `.gitignore` to exclude `dist/` and `build_output.txt` (though `dist/` remains tracked as it was previously).
- Pushed changes to Git for `admin-app`.
- Verified `web-app` is clean.

## [2026-03-12 00:05] Antigravity

- Generated and applied seed data (7+ entries each) for `public.inquiries`, `public.subscribers`, `public.reviews`, and `public.profiles` in Supabase.
- Seed data stored in `supabase/seed_moderation.sql`.

## [2026-03-12 00:10] Antigravity

- Created the `public.popup_ads` table in Supabase to manage promotional popups.
- Seeded the table with 8 diverse promotional entries (images, videos, and text).
- SQL script saved to `supabase/popup_ads.sql`.
