# 05 History & Agent Progress

## 2026-04-10 - Architecture Transition: Monorepo Dissolution
- **Architectural Reversion**: Successfully transitioned from a monorepo structure to a standalone repository.
- **Standalone Verification**: Verified that the Vite build and all management dashboards operate correctly without workspace dependencies.
- **Git Synchronization**: Synchronized the independent repository with the primary GitHub origin.

## 2026-04-03 - Unified RLS Security Architecture & Data Reconciliation
- **RLS Policy Suite**: Deployed a comprehensive, zero-regression security overhaul covering 24+ project tables. Replaced fragmented policies with a three-tier unified architecture (Elevated, Content, Operations) to eliminate access conflicts.
- **Identity Reconciliation**: Resolved the "Disconnected ID" issue by linking 100% of matching `auth.users` to the `admins` and `customers` tables via email-based SQL reconciliation.
- **Access Restoration**: Fixed 401 and 404 API errors for metadata tables (`service_categories`, `navigations`, `content_blocks`) by restoring missing public read and staff management policies.
- **Security Definer Optimization**: Refactored internal RLS functions to use `SECURITY DEFINER` and specific `search_path` to prevent recursion and improve horizontal scaling performance.
- **Consolidated Inbox Ecosystem**: Merged `Inquiries` and `Subscribers` into a single, unified "Inbox" interface. Implemented data transformation logic to present newsletter signups and contact form queries in one cohesive chronological view with type-specific indicators. (U-15)
- **Menu Streamlining**: Deactivated the "Customers" menu item and Dashboard card to simplify the navigation experience and focus on direct customer engagement through the new Inbox hub. (U-14)
- **Documentation**: Generated `docs/07_rls_diagnosis.md` detailing the full diagnostic audit and remediation steps.

## 2026-04-01 - Admin Session Stability & API Integrity
- **Admin API Fix**: Resolved a critical `400 Bad Request` error in `Reports.jsx` caused by a malformed query requesting non-existent `price` and `quantity` columns from `booking_items`. Updated to use the correct `amount` column and refined the revenue aggregation logic.
- **Auth State Stabilization**: Refactored `AuthContext.jsx` to implement an explicit `initAuth()` sequence on mount. This ensures the admin session and role verification are fully resolved before the application proceeds to render protected routes, eliminating intermittent "No valid session" redirects during navigation.
- **Session Security Enforcement**: Verified that `sessionStorage` is correctly handling tab-level isolation. Re-authenticated sessions now correctly persist across page refreshes but are strictly purged upon tab closure, meeting the user's security requirement.
- **Interactivity Audit**: Confirmed all dashboard summary cards and recent activity rows (Bookings, Staff, Customers) are fully interactive and deep-link correctly to their management detail views.

## 2026-04-01 - Mobile Category Navigation & Ecosystem Stability
- **Mobile Navigation Fix**: Resolved the "category cards not working" issue by implementing `!inner` joins in `useSearchServices.ts`. This ensures correct PostgreSQL filtering of root service records by nested category slugs.
- **Expo Router Enhancement**: Updated category navigation in `(tabs)/index.tsx` to use robust object-based routing (`router.push({ pathname, params })`) for reliable cross-tab state propagation.
- **Mobile Lint Pass**: Resolved 10+ ESLint warnings in the Home screen by removing unused dependencies and optimizing component destructuring.
- **Admin Interactivity**: Refactored the dashboard and management tables (Recent Bookings, Activity) to support row-level click navigation, enabling deep-links into specific detail modals and profiles.
- **Asset Resolution**: Verified category image mapping in `resolveImageUrl` ensuring compatibility between local assets and Supabase bucket storage.
- **Session Security**: Migrated Admin App authentication storage to `sessionStorage`. Active sessions are now automatically terminated when the browser tab or window is closed, requiring re-authentication for every new session.

## 2026-04-01 - Admin Interactivity & Web Refinement
- **Admin Dashboard**: Refactored `Dashboard.jsx` to enable full interactivity. Clickable summary cards for Staff, Customers, and Bookings now navigate to their respective pages. Added interactive "Recent Staff" and "Recent Bookings" rows with deep-linking to details.
- **Staff Management**: Enhanced `Team.jsx` and `ManageStaff.jsx` with clickable list rows and a new "Recent System Activities" tracker component to verify individual staff contributions (e.g., Mandini Boolauk).
- **Customer Registry**: Updated `Customers.jsx` to support full-row click navigation to the detailed customer profile view.
- **Web App UI**: Refined the `About` page layout in `page.tsx` by embedding a scaled SVG logo inline with the branding text and centering the identity section for a premium aesthetic.
- **Mobile Build**: Triggered an automated Android APK build via EAS and confirmed it is currently in progress.
- **Code Quality**: Fixed unused variable warnings in the dashboard and verified 100% lint pass across the ecosystem. Pushed all changes to both `admin-app` and `web-app` repositories.

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

## 2026-04-08 - Managing Seasonal Service Pricing
- **Yearly Price Management**: Built a comprehensive Yearly Price management system in `PriceManager.jsx` with a 12-month calendar grid, daily overrides, age-group capacity limits (Adult, Teen, Child, Infant), and bulk-fill functionality.
- **Selector Optimization**: Converted Service Type, Year, and Variant (Room Type) inputs into high-fidelity dropdown menus for a more streamlined administrative experience.
- **Dynamic Context Loading**: Implemented reactive room type filtering that automatically populates the secondary selector based on the selected hotel service.
- **Legacy Data Reconciliation**: Developed an automated synchronization bridge that detects and imports room types from legacy JSONB columns into the relational `room_types` table, resolving the "blank dropdown" issue for older records like LOTUS 2026.
- **High-Fidelity UI Redesign**: Overhauled the "Age Capacity" editor with a premium aesthetic featuring context-aware status badges, bold typography, and a streamlined layout matching official design references.
- **Pricing Schema**: Ensured database schema integration (`service_pricing`) is production-ready with RLS and variant support.

## 2026-04-08 - Hotel Detail UI Refinement & Sidebar Cleanup
- **Sidebar De-cluttering**: Streamlined the right sidebar on the `CreateService.jsx` page by removing redundant "Base Rental" and "Current Inventory" fields.
- **Improved Information Hierarchy**: Relocated "Adults Max", "Kids Max", and "Child Age Limit" fields from the sidebar into the main "Accommodation & Pricing" section (specific to Hotels).
- **Styling Standardization**: Updated the relocated occupancy fields with high-contrast, premium styling to match the main content area's aesthetic.
- **Deployment**: Verified build integrity (`npm run build`) and pushed changes to the repository.
## 2026-04-08 - Per-Room Occupancy Transparency & Management
- **Admin App Granularity**: Upgraded `CreateService.jsx` to support specific occupancy limits (Max Adults, Max Kids, Child Age Limit) for individual room types. This allows for more precise booking controls where different room categories have varied capacities.
- **Web App Detail Overhaul**: Enhanced the Hotel detail page by surfacing these granular occupancy limits directly on the room type cards.
- **Data-Driven UI**: Refactored `HotelClientWrapper.tsx` and the server-side mapping logic to prioritize room-specific data while maintaining a robust fallback to hotel-level policies for legacy data compatibility.
- **Premium Visualization**: Implemented high-fidelity icons and badges (Users, Calendar) for occupancy data, improving user transparency and reducing inquiry friction during the room selection process.
- **Build Certification**: Verified 100% build success (`npm run build`) in the web application after schema and type updates.

## 2026-04-08 - Admin UX: Collapsible Form Infrastructure
- **Interactive Form Sections**: Redesigned the complex service creation/editing form with a high-fidelity accordion system. Implemented persistent `collapsedSections` state to manage visibility across Identity, Narrative, Policies, SEO, and more.
- **Micro-Animations & Visual Feedback**: Integrated `animate-in`, `fade-in`, and `slide-in` transitions with rotating `lucide-react` chevrons for a fluid, premium administrative experience.
- **Event Propagation Guarding**: Implemented `stopPropagation` on essential action triggers (e.g., "Add Room Type", "Add Day/Stop") to prevent accidental section collapsing during data entry.
- **Logic Stabilization**: Resolved critical JSX syntax errors and redundant component blocks between the Gallery and Accommodation sections, ensuring a clean and manageable codebase.
- **Build Certification**: Verified production readiness with a 100% successful `npm run build` pass in the `admin-app` environment.

