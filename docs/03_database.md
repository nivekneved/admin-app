# 03 Database & API Model

## Core Schema (Supabase)
The Admin app manages the most critical tables in the Travel Lounge ecosystem.

### 1. `site_settings`
Manages the global visual identity and metadata for both Web and Mobile apps.
- `logo_url`, `logo_dimensions`
- `favicon_url`
- `social_share_metadata`
- `footer_visibility_toggles`

### 2. `services`
Central repository for all travel products (Hotels, Flights, Cruises, Activities).
- `pricing_json`: Dynamic pricing models.
- `inventory_count`: Real-time availability tracking.
- `multi_image_gallery`: Resolved via the central asset resolver.

### 3. `bookings`
Unified booking engine schema.
- Synchronized with `get_or_create_customer_v1` RPC.
- Fields: `service_name`, `service_type`, `total_price`, `check_in_date`.

---

## Stored Procedures (RPCs)
- **`create_booking_v1`**: Secure procedure to handle transaction integrity.
- **`get_or_create_customer_v1`**: Platform-agnostic customer identification and creation logic.

---

## Database Operational Flows
- **CMS Update**: Any change made in the Admin CMS (`CMS.jsx`) propagates instantly to the public `services` and `hero_slides` tables.
- **Settings Propagation**: Global site configurations are cached on the frontend to minimize database queries while ensuring brand consistency.
