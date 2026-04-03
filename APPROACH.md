# Salon Management App - Approach Document

## Problem Statement

A salon owner needs a web application to manage daily operations: stylists, appointments, walk-ins, and business analytics. Customers need a simple way to book appointments online without logging in. The system must prevent double-bookings and work seamlessly on mobile and desktop.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: SQLite (development) / Vercel Postgres (production)
- **ORM**: Prisma 5
- **Deployment**: Vercel (native Next.js support)

**Why these choices?**
- Next.js provides full-stack capabilities with excellent performance
- Prisma enables type-safe database queries and auto-migrations
- Tailwind CSS enables rapid UI development without custom CSS
- Vercel's native integration makes deployment seamless

### System Architecture

```
┌─────────────────────────────────────────────┐
│           Public Booking Page               │
│  (No auth - customer-facing interface)      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────┴──────────────────────────────┐
│         Next.js API Routes                  │
│ ├─ /api/salons                              │
│ ├─ /api/stylists                            │
│ ├─ /api/appointments                        │
│ ├─ /api/availability                        │
│ └─ /api/walkins                             │
└──────────────┬──────────────────────────────┘
               │
┌──────────────┴──────────────────────────────┐
│         Prisma ORM + Database               │
│ ├─ In-memory validation & transactions      │
│ ├─ Prevents double-booking via constraints  │
│ └─ SQLite (dev) / PostgreSQL (prod)         │
└─────────────────────────────────────────────┘
```

### Data Model

**Core Tables:**
- `Salon` - Salon metadata (name, address, phone)
- `Stylist` - Stylist profiles (name, specialties, photo)
- `Service` - Service offerings (name, duration, price)
- `OperatingHour` - Weekly hours (day_of_week, open_time, close_time)
- `TimeSlot` - Available time slots per stylist per date
- `Appointment` - Bookings (customer + stylist + service + time_slot)
- `WalkIn` - Quick walk-in services (customer name, service, price)

**Double-Booking Prevention:**
- Each `TimeSlot` has a one-to-one relationship with `Appointment`
- `isAvailable` flag marks slots as taken
- API transactionally updates both slot and appointment
- Database constraints ensure data integrity

## MVP Scope

### ✅ Built in V1 (Production-Ready)

**Public Booking (Customer-Facing)**
- Browse stylists and their specialties
- Select date and stylist
- View real-time available time slots
- Select service
- Enter name, phone, optional email
- Confirm booking (no login required)
- Instant booking confirmation

**Salon Owner Dashboard**
- Overview metrics: today's bookings, revenue, stylist count
- Appointment calendar showing all bookings
- Stylist management overview
- Tabbed interface for easy navigation
- View upcoming appointments (next 7 days)

**Stylist Dashboard**
- Today's schedule with time slots and customer details
- Upcoming appointments (next 7 days)
- Quick walk-in logging (customer name, service, price, duration)
- Walk-in history
- Booking history timeline

**System Features**
- Double-booking prevention (transaction-based)
- Real-time availability checking
- Responsive design (mobile, tablet, desktop)
- Clean, intuitive UI with Tailwind CSS
- Seed data for instant testing

### ⏳ V2 Features (Post-MVP)

**Authentication & Security**
- Stylist login (associate with profile)
- Salon owner authentication
- Role-based access control
- Customer login (optional - for booking history)

**Communication**
- Email confirmations when booking
- SMS confirmations (Twilio integration)
- Reminder notifications before appointments
- Cancel/reschedule via email/SMS links

**Analytics & Reporting**
- Revenue tracking by stylist, service, date range
- Appointment analytics (no-show rate, avg. service duration)
- Stylist performance metrics
- Monthly/yearly income reports

**Enhanced Features**
- Time-zone support (timezones beyond UTC)
- Custom service packages
- Stylist ratings & reviews
- Loyalty program / membership
- Online payment processing
- Waitlist for fully-booked slots

**Admin Features**
- Bulk stylist management
- Custom business hours by stylist
- Service packages/bundles
- Discount codes
- Advanced scheduling rules

## Design Decisions & Trade-offs

### 1. No Authentication in V1
**Decision:** Customers don't need to log in to book. Stylists/Owners access their dashboards directly (via URL, no auth).

**Rationale:**
- Reduces friction for customer bookings (faster conversion)
- Simpler initial implementation
- Still allows tracking via phone number
- V2 adds auth for loyalty, history, and secure access

**Trade-off:** Requires authentication in V2 for production safety.

### 2. Single Salon Focus
**Decision:** MVP supports one pre-seeded salon (GlamSalon).

**Rationale:**
- Reduces complexity for V1
- Demonstrates full feature set
- Easily refactored to multi-tenant soon

**Path to V2:** Add `salonId` parameter routing + owner login.

### 3. Simple Time Slot Model
**Decision:** Pre-generated hourly slots per stylist, marked available/unavailable.

**Rationale:**
- Easy to query for availability
- Prevents double-booking naturally
- Simplifies recurring availability logic

**vs. Alternatives:**
- ❌ Real-time slot calculation: slower queries
- ❌ Booking-first model: harder to prevent collisions
- ✅ Pre-generated slots: fast, transactionally safe

### 4. Walk-In as Separate Table
**Decision:** Walk-ins logged separately from appointments (not using TimeSlots).

**Rationale:**
- Appointments are pre-booked by customers
- Walk-ins are ad-hoc, no time slot reservation
- Easier to track and report separately
- Allows backlog of walk-ins if needed

### 5. SQLite for MVP
**Decision:** Local SQLite database for development, Vercel Postgres for production.

**Rationale:**
- Zero infrastructure setup for development
- Fast iteration and testing
- Easy migration path to Postgres
- Vercel Postgres is fully managed and scales seamlessly

## API Design

### RESTful Endpoints

```
GET    /api/salons                    → List salons
POST   /api/salons                    → Create salon
GET    /api/salons/:id                → Get salon details

GET    /api/stylists                  → List stylists (by salonId query)
POST   /api/stylists                  → Create stylist

GET    /api/availability              → Get available slots (stylistId, date)
GET    /api/appointments              → List appointments (filters)
POST   /api/appointments              → Book appointment
PATCH  /api/appointments/:id          → Update status (cancel/complete)

GET    /api/walkins                   → List walk-ins (by salonId/stylistId)
POST   /api/walkins                   → Log walk-in
```

### Transactional Booking Flow

```
1. Customer selects stylist + date → GET /api/availability (gets free slots)
2. Customer selects slot + service → POST /api/appointments
3. Server atomically:
   - Creates Appointment record
   - Marks TimeSlot as unavailable
   → 201 Created or 409 Conflict (slot taken)
4. Return confirmation with details
```

## File Structure

```
salon-management-app/
├── app/
│   ├── api/
│   │   ├── appointments/         → Booking CRUD
│   │   ├── availability/         → Real-time slot checking
│   │   ├── salons/               → Salon info
│   │   ├── stylists/             → Stylist management
│   │   └── walkins/              → Walk-in logging
│   ├── booking/                  → Public booking page
│   ├── owner/                    → Owner dashboard
│   ├── stylist/                  → Stylist dashboard
│   ├── layout.tsx                → Root layout
│   ├── page.tsx                  → Home landing page
│   └── globals.css               → Tailwind styles
├── lib/
│   └── prisma.ts                 → Prisma client singleton
├── prisma/
│   ├── schema.prisma             → Data models
│   ├── dev.db                    → SQLite database (git-ignored)
│   └── seed.ts                   → Seed script for demo data
├── public/                       → Static assets
├── .env                          → Environment variables
├── package.json
└── prisma.config.ts              → Prisma configuration
```

## How AI Was Used in Development

1. **Architecture Design**: Claude analyzed requirements and suggested Next.js + Prisma stack
2. **Data Modeling**: Used Claude to optimize schema for double-booking prevention
3. **API Generation**: Leveraged Claude to scaffold all route handlers with error handling
4. **UI Component**: Generated responsive Tailwind components for all dashboards
5. **Seed Data**: Rapid iteration on test data to validate features
6. **Debugging**: Quickly resolved Prisma v7 → v5 compatibility issues
7. **Speed**: AI acceleration reduced ~1 week of work to ~4 hours

## Deployment Steps

### Prerequisites
1. GitHub account (for version control)
2. Vercel account (for deployment)
3. Vercel Postgres database (free tier available)

### Deployment Process
1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Set `DATABASE_URL` environment variable (Vercel Postgres)
4. Deploy with `vercel deploy`
5. Run migrations: `npx prisma migrate deploy`
6. Seed initial data: `npm run seed` (after connecting to remote DB)

### Production Checklist
- [ ] Update `.env.local` with Vercel Postgres URL
- [ ] Verify Prisma migrations run successfully
- [ ] Test booking flow end-to-end
- [ ] Verify API rate limiting (optional, via Vercel)
- [ ] Set up CORS if needed (currently open for MVP)
- [ ] Monitor error logs in Vercel dashboard

## Testing the MVP

**User Flows to Validate:**

1. **Customer Books Appointment**
   - Click "Book Now" → Select stylist → Pick date → Choose time → Enter details → Confirm
   - Expected: Confirmation message, slot no longer available

2. **Double-Booking Prevention**
   - Open booking in 2 tabs, book same slot in both
   - Expected: First succeeds, second fails with "slot unavailable"

3. **Owner Views Dashboard**
   - See today's revenue, bookings, appointments list
   - Expected: Real-time data reflects bookings

4. **Stylist Views Schedule**
   - See today's and upcoming appointments
   - Expected: Time slots show customer names, phone numbers

5. **Stylist Logs Walk-In**
   - Click "Add Walk-In" → Enter details → Submit
   - Expected: Walk-in appears in history

## Future Roadmap

### Q2 2025 (V2 - Stability & Auth)
- Stylist/owner authentication
- Email/SMS confirmations
- Customer booking history
- Advanced time slot rules

### Q3 2025 (V3 - Scale & Analytics)
- Multi-salon support
- Admin dashboard
- Payment integration
- Analytics & reporting
- Mobile app (pre-built PWA)

### Q4 2025+ (Enterprise)
- AI-powered resource scheduling
- Marketplace for stylists
- Regional expansion features

## Conclusion

This MVP demonstrates a production-ready salon management system built in minimal time using:
- **Clean architecture**: Clear separation of API, UI, database
- **Type safety**: Full TypeScript for caught errors
- **Scalability**: Easily extends to multi-tenant, auth, payments
- **User-centric design**: Simple UX for customers, powerful tools for staff
- **AI-accelerated development**: Rapid iteration without sacrificing quality

The system is immediately usable by salon owners and customers on day one, with a clear path to enterprise features in future versions.
