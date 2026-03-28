# 05 History & Agent Progress

## 2026-03-28 - Final Production Hardening & Admin Security
- **Authentication Resilience**: Hardened `ProtectedRoute.jsx` to verify active admin roles, preventing any unauthorized client-side access. (C-06)
- **Database Immobilization**: Secured core booking and customer RPC functions by setting an immutable `search_path` to prevent SQL injection resolution. (C-03)
- **RLS Consolidation**: Removed overlapping policies and optimized `auth.uid()` calls to enhance row-level security performance. (M-02, M-03)
- **Data Privacy**: Restricted public access to PII tables (`inquiries`, `subscribers`) to admins only while maintaining public form availability. (H-04, H-05)

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
