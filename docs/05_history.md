# 05 History & Agent Progress

## 2026-04-01 - Ecosystem Stabilization & Debloat (Production Candidate)
- **Admin App Security**: Fully restored `AuthProvider` and `ProtectedRoute` around the `/` layout routes in `App.jsx`, neutralizing an open-access authentication bypass. Purged unrouted views (`ResetPassword.jsx`) and debug payloads (`console.log`) throughout the auth cycle. Refactored `Login.jsx` to prevent unused variables from breaking CI.
- **Mobile App Build Stabilizer**: Resolved catastrophic ESLint parser failures by installing the orphaned `eslint-plugin-import` dev dependency required by Expo. Mobile pipelines now pass `npm run lint` cleanly.
- **Web App Strict Typings**: Erased all rogue `any` Typescript signatures within the `privacy-policy` to `Record<string, unknown>`. Patched a severe React hook optimization warning in `BookingWizard.tsx` by migrating unstable generic `watch()` calls to `useWatch({ control })`, and converted rigid Zod `.default('')` properties to `.optional()` mapped fields for 100% accurate `react-hook-form` type resolution. Fixed broken DOM parsing map in `terms-conditions`.
- **Ecosystem Node Debloat**: Performed mass uninstallation of heavy, orphaned NPM dependencies across the architecture utilizing `depcheck`, shrinking deployment pipelines (Removed `next-intl`, `react-dropzone`, `react-hot-toast`, `uuid`, `date-fns`, `qrcode.react`). 
- **Compilation Gate Pass**: Both `npx tsc --noEmit` and pipeline lint validations built perfectly locally, yielding `EXIT CODE 0` clearing the final deployment gate.
## 2026-03-31 - Service Metadata & Card Teasers
- **Database Schema**: Added `short_description` column to `public.services` for card-specific summaries.
- **Admin App Enhancement**: Integrated "Card Teaser (Short Description)" field into `CreateService.jsx` for both creation and editing.
- **Web App Rendering**: Updated `ServiceCard.tsx` to prefer `short_description` if available, falling back to main description truncation for consistency.
- **Listing Integration**: Updated `ServiceListing.tsx`, `DealsCarousel.tsx`, and `DestinationListing.tsx` to fetch and propagate `short_description` from Supabase to the UI.

---

## 2026-03-29 - Authentication & RLS Stability Fix
- **RLS Recursion Fix**: Resolved a critical "infinite recursion detected" error in the `admins` table by migrating policies to use `SECURITY DEFINER` functions (`is_admin_v2`, `is_super_admin`). This allows for safe role verification without circular policy calls.
- **ProtectedRoute Stabilization**: Refactored the authentication guard to use a consolidated `onAuthStateChange` pattern, resolving "Lock not released" warnings and race conditions in `React.StrictMode`.
- **Diagnostic Logging**: Implemented comprehensive `AUTH_EVENT` and `AUTH_CHECK` console messaging to improve future troubleshooting.
- **Visual Feedback**: Added an "Authenticating..." loading state to `ProtectedRoute` for a smoother user experience during verification.

---

## 2026-03-25 - Branding Integration & Asset Resolution
- **Local Asset Integration**: Synchronized `src/assets` folder with standard icons and placeholders from the Web App.
- **Dynamic Asset Resolver**: Implemented a centralized `resolveImageUrl` in `src/utils/image.js` using `import.meta.glob` to support bundled local assets via `/assets/` prefix.
- **Enhanced Branding**: Expanded `Settings.jsx` and `site_settings` schema to include site logo, dimensions, favicons, and social sharing metadata.
- **CMS Expansion**: Upgraded `CMS.jsx` with full support for [NEW] Hero sections across all dynamic pages (Destinations, News, Flights, Activities).
- **Service Catalog**: Integrated multi-image gallery support and narrative metadata (highlights, includes, policies) in `CreateService.jsx`.
- **UI Maintenance**: Verified 100% asset resolution across `Categories.jsx`, `Services.jsx`, `HeroSlider.jsx`, and `PopupAds.jsx` to eliminate 404 errors.

---

## 2026-03-24 - Zero-Regression Database Schema Parity (Schema)
- **Database Refactor Integration**: Replaced legacy `bookings` table queries (`activity_name`, `activity_type`, `total_amount`) with their new UI-driven counterparts (`service_name`, `service_type`, `total_price`) across all files (`Bookings.jsx`, `CreateBooking.jsx`, `Dashboard.jsx`, `ViewCustomer.jsx`, `Reports.jsx`).
- **Migration Execution**: Executed Supabase SQL migration (e.g. `start_date` -> `check_in_date`) to force the backend database perfectly into alignment with the frontend naming structures.

---

## 2026-03-24 - Assets & Independent Toggles
- **Independent Toggles**: Separated "Web Footer Visibility" and "Mobile Footer Visibility" in Global Settings.
- **Asset Management**: Added dynamic configuration field for "Experience Section Image".
