# HavenWelfare - Product Requirements Document

## Project Overview
**Name:** HavenWelfare  
**Domain:** Rehabilitation & De-Addiction Welfare Platform  
**Type:** Full-Stack Web Application (Frontend + Backend + Admin Panel)

## Original Problem Statement
Build a secure, role-based welfare web application supporting rehabilitation and de-addiction programs, doctor-patient coordination, verified rehab centers, and manual donation management.

## User Personas

### 1. Admin (Super Admin)
- Complete system control
- User management (approve/reject/suspend)
- Manage rehab centers, addiction types
- Configure payment & SMTP settings
- Verify donations manually
- View audit logs and analytics

### 2. Doctor
- Medical professionals managing rehabilitation cases
- Profile management with verification docs
- Accept/reject patient treatment requests
- Update treatment notes

### 3. Patient
- Individuals seeking rehabilitation
- Choose doctor and rehab center
- Track treatment status
- View received donations

### 4. Donor
- Public donors (login optional)
- View approved patients
- Submit manual donations
- Track donation status

## Core Requirements (Static)

### Authentication & Access
- [x] JWT-based authentication
- [x] Role-based authorization (RBAC)
- [x] Email/password login and registration
- [x] Forgot password flow (with SendGrid - admin configurable)
- [x] Secure password hashing (bcrypt)
- [x] Admin seeded on first deployment

### Admin Features
- [x] Analytics dashboard
- [x] User management (approve/reject/suspend)
- [x] Rehab centers CRUD
- [x] Addiction types CRUD
- [x] Donation verification workflow
- [x] Payment settings (Bank/UPI/QR)
- [x] SMTP settings for SendGrid
- [x] Audit logging

### Doctor Features
- [x] Profile management
- [x] Document upload for verification
- [x] Patient requests management
- [x] Treatment notes

### Patient Features
- [x] Profile management
- [x] Choose doctor and center
- [x] Treatment status tracking
- [x] Donation history

### Donor Portal
- [x] View approved patients
- [x] Submit donations with screenshot
- [x] Track donation status
- [x] Payment info display

## What's Been Implemented

### Backend (FastAPI + MongoDB)
- Complete REST API with 25+ endpoints
- JWT authentication system
- Role-based middleware
- File upload handling (local storage)
- SendGrid email integration (admin configurable)
- Audit logging
- Admin seeding

### Frontend (React + Tailwind + Shadcn UI)
- Professional design with Manrope + Inter fonts
- Deep Forest (#0f392b) + Terracotta (#d97757) theme
- Responsive dashboard layouts
- All role-specific dashboards
- Donor portal
- Auth flows (login, register, forgot password)

### Database Collections
- users (with roles and status)
- rehab_centers
- addiction_types
- donations
- treatment_requests
- admin_settings (payment, smtp)
- password_reset_tokens
- audit_logs

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React 19 + Tailwind CSS + Shadcn UI
- **Database:** MongoDB
- **Auth:** JWT + bcrypt
- **Email:** SendGrid (admin configurable)
- **Storage:** Local filesystem

## Admin Credentials (Initial)
- Email: brijesh.kr.dube@gmail.com
- Password: Haven@9874

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Authentication system
- [x] Admin dashboard
- [x] User management
- [x] Core CRUD operations

### P1 (High Priority) - DONE
- [x] Donation workflow
- [x] Treatment request flow
- [x] Payment settings
- [x] Role-based dashboards

### P2 (Medium Priority) - Remaining
- [ ] Email notifications for status changes
- [ ] Donation receipt PDF generation
- [ ] Advanced analytics/charts
- [ ] Search and filter enhancements

### P3 (Low Priority) - Future
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Export reports to CSV/Excel
- [ ] SMS notifications

## Next Tasks
1. Configure SendGrid API key in admin SMTP settings
2. Add sample rehab centers and addiction types
3. Register test doctors and patients
4. Set up payment details for donations
5. Test full donation workflow end-to-end

---
*Last Updated: January 2026*
