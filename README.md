# AI-Powered-Hospital-Patient-Management-System
Hospital Patient Management System (Hospital PMS) is a full-stack web application developed to digitize and streamline operations of a multi-department hospital in Bangladesh. Built with Django 6.0.5, DRF, React 19, Tailwind CSS, and PostgreSQL 15, the system runs in a local environment using PyCharm and pgAdmin 4. for backend and frontend tasks.

# 🏥 Hospital Patient Management System (Hospital PMS)

> A full-stack web application for managing hospital operations — built with Django REST Framework + React + PostgreSQL, designed specifically for Bangladesh healthcare settings.

![Django](https://img.shields.io/badge/Django-6.0.5-092E20?style=flat&logo=django)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwindcss)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Bangladesh-Specific Features](#bangladesh-specific-features)

---

## Overview

Hospital PMS is a complete hospital management system that handles:

- Patient registration and records
- Doctor appointments and scheduling
- Billing and payments (bKash, Nagad, Rocket, Cash, Card)
- Digital prescriptions
- Lab & diagnostic orders
- Reports and analytics

Built as a **full-stack web application** with a Django REST API backend and a React frontend, connected to a PostgreSQL database.

---

## Features

### ✅ Completed Modules

| Module | Description |
|---|---|
| 🔐 **Authentication** | JWT-based login with 5 role types |
| 👥 **Patients** | Registration, records, auto Patient ID |
| 📅 **Appointments** | Book, manage, filter by date/status |
| 💰 **Billing** | Create invoices, collect payments, print PDF |
| 💊 **Prescriptions** | Digital Rx with medicine details |
| 🔬 **Lab & Diagnostics** | Order tests, track sample-to-result workflow |
| 📊 **Reports** | Revenue analytics, patient stats, departments |

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Django | 6.0.5 | Web framework |
| djangorestframework | 3.17.1 | REST API |
| djangorestframework-simplejwt | 5.5.1 | JWT authentication |
| django-cors-headers | 4.9.0 | CORS support for React |
| django-filter | 25.2 | Query filtering |
| psycopg2-binary | 2.9.12 | PostgreSQL driver |
| python-decouple | 3.8 | Environment variables |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19+ | UI library |
| Vite | 8+ | Build tool |
| Tailwind CSS | v4 | Styling |
| Redux Toolkit | 2+ | State management |
| React Router DOM | 7+ | Client-side routing |
| Axios | 1+ | HTTP requests |

---

## Project Structure

```
hospital_pms/
│
├── server/                          # Django Backend
│   ├── config/
│   │   ├── settings.py              # DB, JWT, CORS, installed apps
│   │   ├── urls.py                  # Root URL routing
│   │   └── wsgi.py
│   │
│   ├── authentication/              # User model + JWT auth
│   │   ├── models.py                # Custom User with roles
│   │   ├── serializers.py
│   │   ├── views.py                 # Login, Logout, Register, Profile
│   │   └── urls.py
│   │
│   ├── patients/                    # Patient management
│   │   ├── models.py                # Patient + auto ID generation
│   │   ├── serializers.py
│   │   ├── views.py                 # CRUD + search
│   │   └── urls.py
│   │
│   ├── appointments/                # Appointment scheduling
│   │   ├── models.py                # Department, Doctor, Appointment
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── billing/                     # Invoice & payments
│   │   ├── models.py                # Invoice + InvoiceItem
│   │   ├── serializers.py
│   │   ├── views.py                 # Create, Pay, Collect
│   │   └── urls.py
│   │
│   ├── prescriptions/               # Digital prescriptions
│   │   ├── models.py                # Prescription + PrescriptionItem
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── lab/                         # Lab & diagnostics
│   │   ├── models.py                # LabTest, LabOrder, LabOrderItem
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                         # Environment variables
│
└── client/                          # React Frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js              # Axios + JWT interceptor
    │   ├── store/
    │   │   ├── index.js              # Redux store
    │   │   └── authSlice.js          # Auth state
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Layout.jsx        # Main layout wrapper
    │   │       └── Sidebar.jsx       # Navigation sidebar
    │   ├── pages/
    │   │   ├── auth/LoginPage.jsx
    │   │   ├── dashboard/Dashboard.jsx
    │   │   ├── patients/PatientList.jsx
    │   │   ├── appointments/Appointments.jsx
    │   │   ├── billing/Billing.jsx
    │   │   ├── prescriptions/Prescriptions.jsx
    │   │   ├── lab/Lab.jsx
    │   │   └── reports/Reports.jsx
    │   ├── App.jsx                   # Routes + PrivateRoute
    │   ├── main.jsx                  # Entry point
    │   └── index.css                 # Tailwind v4 import
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Python | 3.12+ | [python.org](https://python.org/downloads) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org/download) |
| pgAdmin 4 | latest | Bundled with PostgreSQL |
| PyCharm | any | [jetbrains.com](https://jetbrains.com/pycharm) |

---

## Installation & Setup

### Step 1 — Clone or create the project folder

```bash
cd D:\Lessons\ICT_Soft_Engg
mkdir hospital_pms
cd hospital_pms
```

### Step 2 — Set up the database

1. Open **pgAdmin 4**
2. Right-click **Databases → Create → Database**
3. Name it `hospital_pms`
4. Click **Save**

### Step 3 — Set up Django backend

```bash
cd server

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
copy .env.example .env
# Edit .env and set your PostgreSQL password

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Step 4 — Set up React frontend

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 5 — Configure .env file

Edit `server/.env`:

```env
SECRET_KEY=django-insecure-hospital-pms-secret-key-2026-bangladesh
DEBUG=True
DB_NAME=hospital_pms
DB_USER=postgres
DB_PASSWORD=your_postgresql_password_here
DB_HOST=localhost
DB_PORT=5432
FRONTEND_URL=http://localhost:5173
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASS=your_store_pass
SSLCOMMERZ_SANDBOX=True
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=HOSPITAL
```

---

## Running the Project

You need **two terminals** running simultaneously:

### Terminal 1 — Django Backend

```bash
cd hospital_pms/server
venv\Scripts\activate
python manage.py runserver
```

Backend available at: **http://127.0.0.1:8000**
Admin panel at: **http://127.0.0.1:8000/admin**

### Terminal 2 — React Frontend

```bash
cd hospital_pms/client
npm run dev
```

Frontend available at: **http://localhost:5173**

### Default Login

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `1234` |
| Role | ADMIN |

> ⚠️ Change the password in production!

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header except `/api/auth/login/`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/logout/` | Logout, blacklist token |
| GET | `/api/auth/profile/` | Get current user |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patients/` | List all patients |
| POST | `/api/patients/` | Register new patient |
| GET | `/api/patients/<id>/` | Get patient detail |
| PUT | `/api/patients/<id>/` | Update patient |
| DELETE | `/api/patients/<id>/` | Soft-delete patient |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments/` | List appointments |
| POST | `/api/appointments/` | Book appointment |
| GET | `/api/appointments/today/` | Today's appointments |
| GET | `/api/appointments/departments/` | List departments |
| GET | `/api/appointments/doctors/` | List doctors |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/billing/` | List invoices |
| POST | `/api/billing/` | Create invoice |
| POST | `/api/billing/<id>/pay/` | Collect payment |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/prescriptions/` | List prescriptions |
| POST | `/api/prescriptions/` | Create prescription |
| GET | `/api/prescriptions/<id>/` | Get prescription detail |

### Lab
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lab/tests/` | List lab tests |
| GET | `/api/lab/orders/` | List lab orders |
| POST | `/api/lab/orders/` | Create lab order |
| PUT | `/api/lab/orders/<id>/` | Update order status |

---

## Database

**Database:** `hospital_pms`
**Engine:** PostgreSQL 15
**Tool:** pgAdmin 4

### Tables

| Table | Description |
|---|---|
| `authentication_user` | Users with roles |
| `patients_patient` | Patient records |
| `appointments_department` | Hospital departments |
| `appointments_doctor` | Doctor profiles |
| `appointments_appointment` | Appointments |
| `billing_invoice` | Invoices |
| `billing_invoiceitem` | Invoice line items |
| `prescriptions_prescription` | Prescriptions |
| `prescriptions_prescriptionitem` | Medicines in prescriptions |
| `lab_labtest` | Lab test catalogue |
| `lab_laborder` | Lab orders |
| `lab_laborderitem` | Tests in a lab order |

---

## User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access to all modules |
| `DOCTOR` | Prescriptions, appointments, lab orders |
| `RECEPTIONIST` | Patients, appointments, billing |
| `NURSE` | View patients and appointments |
| `LAB_TECHNICIAN` | Lab orders and results |

---

## Screenshots

| Page | URL |
|---|---|
| Login | `http://localhost:5173/login` |
| Dashboard | `http://localhost:5173/` |
| Patients | `http://localhost:5173/patients` |
| Appointments | `http://localhost:5173/appointments` |
| Billing | `http://localhost:5173/billing` |
| Prescriptions | `http://localhost:5173/prescriptions` |
| Lab | `http://localhost:5173/lab` |
| Reports | `http://localhost:5173/reports` |

---

## Bangladesh-Specific Features

- 🇧🇩 **Bengali UI** — Bengali text throughout the interface (`হাসপাতাল ব্যবস্থাপনা সিস্টেম`)
- 💳 **bKash / Nagad / Rocket** — Mobile banking payment support via SSLCommerz
- 📱 **SMS Gateway** — SSL Wireless Bangladesh integration for appointment reminders
- 🏠 **Districts** — Bangladesh district selector for patient registration (Dhaka, Chittagong, Sylhet, etc.)
- 🕐 **Timezone** — Set to `Asia/Dhaka` (UTC+6)
- 💱 **Currency** — Bengali Taka (৳) used throughout billing
- 🆔 **NID** — National ID number field for patient verification
- 🏥 **BMDC** — Doctor license number field following Bangladesh Medical and Dental Council format

---

## Development Notes

### Adding a new doctor

1. Go to `http://127.0.0.1:8000/admin`
2. Create a **User** with role `DOCTOR`
3. Use the **Doctors API** to create their doctor profile linked to a department

### Running migrations after model changes

```bash
python manage.py makemigrations <app_name>
python manage.py migrate
```

### Collecting static files (production)

```bash
python manage.py collectstatic
```

---

## License

This project was built for educational purposes as a Hospital Management System for Bangladesh.

---

*Built with ❤️ for Bangladesh Healthcare | হাসপাতাল ব্যবস্থাপনা সিস্টেম*
