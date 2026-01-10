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
- View patient medical history and donation history

### 2. Doctor
- Medical professionals managing rehabilitation cases
- Profile management with verification docs
- Accept/reject patient treatment requests
- Update treatment notes
- View patient medical history in treatment requests

### 3. Patient
- Individuals seeking rehabilitation
- Choose doctor and rehab center
- Track treatment status
- View received donations
- Update addiction and medical history

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

### Phase 2 - Enhanced Features (Completed - Jan 2026)
- [x] **Forgot Password Flow** - Email-based password reset via SendGrid (admin configurable SMTP)
- [x] **Audit Logging** - Full audit trail for user actions (login, registration, approvals, settings changes)
- [x] **Donation Receipt Download** - Printable receipts for approved donations
- [x] **USD Currency** - Changed all currency displays from INR (₹) to USD ($)

### Phase 3 - Notifications & History Display (Completed - Jan 2026)
- [x] **Email Notifications for User Status Changes** - Sends email when users are approved/rejected/suspended
- [x] **Email Notifications for Donation Approvals** - Sends email when donations are approved/rejected
- [x] **Patient Donation History in Admin Panel** - Admin can view each patient's donation history and totals
- [x] **Patient Medical History in Admin Panel** - Admin can view each patient's medical/addiction details
- [x] **Patient Medical History in Doctor Panel** - Doctors can view patient medical history in treatment request details

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
- `GET /api/admin/users` - Get all users with donation history for patients (admin only)
- `PUT /api/admin/users/{id}/status` - Update user status with email notification
- `GET /api/treatment-requests` - Get treatment requests with patient profile data
- `GET /api/donations/{id}/receipt` - Get donation receipt (approved only)
- `PUT /api/donations/{id}/approve` - Approve/reject donation with email notification
- `GET /api/donations/track/{transaction_id}` - Track donation by transaction ID

## Database Schema
- **users**: `{id, email, password, name, role, status, profile_data: {addiction_type_id, severity, duration, medical_history, ...}}`
- **donations**: `{id, patient_id, amount, transaction_id, status, donor_email, ...}`
- **treatment_requests**: `{id, patient_id, doctor_id, status, treatment_notes, ...}`
- **rehab_centers**: `{id, name, address, city, state, pincode, status}`
- **addiction_types**: `{id, name, description, severity_levels}`
- **admin_settings**: `{type: 'payment'/'smtp', ...settings}`
- **audit_logs**: `{id, user_id, user_email, action, details, created_at}`
- **password_reset_tokens**: `{id, user_id, token, expires_at, used}`

## Admin Credentials (Initial)
- Email: brijesh.kr.dube@gmail.com
- Password: Haven@9874

## Prioritized Backlog

### P0 (Critical) - ALL DONE ✅
- [x] Authentication system
- [x] Admin dashboard
- [x] User management
- [x] Core CRUD operations
- [x] Forgot password flow
- [x] Audit logging
- [x] Donation receipts
- [x] USD currency
- [x] Email notifications
- [x] Patient history display

### P1 (High Priority) - DONE ✅
- [x] Donation workflow
- [x] Treatment request flow
- [x] Payment settings
- [x] Role-based dashboards

### P2 (Medium Priority) - Remaining
- [ ] Advanced analytics charts
- [ ] Search and filter enhancements
- [ ] Pagination for large lists

### P3 (Low Priority) - Future
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Export reports to CSV/Excel
- [ ] SMS notifications
- [ ] Video call link sharing between doctors and patients

## Configuration Required
1. **SendGrid API Key** - Configure in Admin > SMTP Settings for email functionality
2. **Payment Details** - Configure in Admin > Payment Settings for donation workflow

---
*Last Updated: January 10, 2026*
