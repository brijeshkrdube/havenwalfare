# HavenWelfare - Product Requirements Document

## Project Overview
**Name:** HavenWelfare  
**Domain:** Rehabilitation & De-Addiction Welfare Platform  
**Type:** Full-Stack Web Application (Frontend + Backend + Admin Panel)
**Currency:** USD ($)

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
- Download receipts for approved donations

## What's Been Implemented

### Phase 1 - Core Features (Completed)
- [x] JWT-based authentication for 4 roles (Admin, Doctor, Patient, Donor)
- [x] Role-based authorization (RBAC)
- [x] Email/password login and registration
- [x] Secure password hashing (bcrypt)
- [x] Admin seeded on first deployment
- [x] Admin analytics dashboard
- [x] User management (approve/reject/suspend)
- [x] Rehab centers CRUD
- [x] Addiction types CRUD
- [x] Donation verification workflow
- [x] Payment settings (Bank/UPI/QR)
- [x] Doctor profile management and verification docs
- [x] Patient profile with medical history
- [x] Treatment request flow
- [x] Donor portal with donation submission

### Phase 2 - Recent Updates (Completed - Jan 2026)
- [x] **Forgot Password Flow** - Email-based password reset via SendGrid (admin configurable SMTP)
- [x] **Audit Logging** - Full audit trail for user actions (login, registration, approvals, settings changes)
- [x] **Donation Receipt Download** - Printable receipts for approved donations
- [x] **USD Currency** - Changed all currency displays from INR (₹) to USD ($)

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React 19 + Tailwind CSS + Shadcn UI
- **Database:** MongoDB
- **Auth:** JWT + bcrypt
- **Email:** SendGrid (admin configurable)
- **Storage:** Local filesystem

## Key API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/admin/audit-logs` - Get audit logs (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/donations/{id}/receipt` - Get donation receipt (approved only)
- `GET /api/donations/track/{transaction_id}` - Track donation by transaction ID

## Admin Credentials (Initial)
- Email: brijesh.kr.dube@gmail.com
- Password: Haven@9874

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Authentication system
- [x] Admin dashboard
- [x] User management
- [x] Core CRUD operations
- [x] Forgot password flow
- [x] Audit logging
- [x] Donation receipts
- [x] USD currency

### P1 (High Priority) - DONE
- [x] Donation workflow
- [x] Treatment request flow
- [x] Payment settings
- [x] Role-based dashboards

### P2 (Medium Priority) - Remaining
- [ ] Email notifications for status changes (donation approved, user approved)
- [ ] Patient medical history display in Admin/Doctor panels (frontend UI exists, needs backend data)
- [ ] Advanced analytics/charts
- [ ] Search and filter enhancements

### P3 (Low Priority) - Future
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Export reports to CSV/Excel
- [ ] SMS notifications
- [ ] Video call link sharing between doctors and patients

## Next Tasks
1. Configure SendGrid API key in admin SMTP settings to enable password reset emails
2. Display patient medical history in Admin User Management panel
3. Display patient medical history in Doctor Patient Requests panel
4. Add email notifications for key events

---
*Last Updated: January 10, 2026*
