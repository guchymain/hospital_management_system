# Hospital Management System

A full-featured Hospital Management System comprising a **Node.js / Express.js / PostgreSQL RESTful API** backend and a **React / Tailwind CSS** Single-Page Application (SPA) frontend.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Database Architecture & Schema](#database-architecture--schema)
- [Authentication & Role-Based Access Control (RBAC)](#authentication--role-based-access-control-rbac)
- [API Reference](#api-reference)
  - [Authentication (`/api/auth`)](#authentication-apiauth)
  - [Users (`/api/users`)](#users-apiusers)
  - [Departments (`/api/departments`)](#departments-apidepartments)
  - [Doctors (`/api/doctors`)](#doctors-apidoctors)
  - [Patients (`/api/patients`)](#patients-apipatients)
  - [Appointments (`/api/appointments`)](#appointments-apiappointments)
  - [Medical Records (`/api/medical-records`)](#medical-records-apimedical-records)
  - [Prescriptions (`/api/prescriptions`)](#prescriptions-apiprescriptions)
- [Project Directory Structure](#project-directory-structure)
- [Environment Configuration](#environment-configuration)
- [Database Migrations & Seeding](#database-migrations--seeding)
- [Running the Application](#running-the-application)
- [Running Automated Tests](#running-automated-tests)

---

## Overview

The **Hospital Management System** manages clinical and operational workflows:
- **Staff & User Management:** User registration, password hashing (`bcrypt`), JWT authentication, and role-based access control for **Admin**, **Doctor**, **Nurse**, and **Receptionist**.
- **Clinical Data:** Patient directory, clinical departments, doctor directory, consultation schedules, medical records, and multi-item prescriptions.
- **Normalized Relational Architecture:** The `doctors` table references `users` via a strict 1-to-1 foreign key (`userId`). Personal information (`name`, `email`, `phone`) exists solely in `users` as a single source of truth, updating dynamically everywhere across the system.
- **Appointment Ownership & Immutability:** Doctors only view and manage their own appointments. Completed appointments are locked from doctor modifications, while Administrators retain full authority to edit any appointment.
- **Scoped Patient Directory:** Doctors view only patients assigned to their care in the directory, while clinical medical records remain accessible hospital-wide for authorized medical staff.

---

## Architecture & Tech Stack

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js
- **Database:** PostgreSQL (relational constraints, foreign keys, unique indexes, cascading deletes)
- **ORM:** Sequelize 6 & Sequelize CLI (migrations, seeders, associations, transactions)
- **Validation:** Zod schemas
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt`

### Frontend
- **Framework:** React 18 / Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios (centralized configuration with token interceptors)
- **State Management:** React Context API (`AuthContext`)

---

## Database Architecture & Schema

### Entity-Relationship Model

```text
               +------------------+
               |      users       |
               +------------------+
               | id (PK)          |
               | name (NOT NULL)  |
               | email (UNIQUE)   |
               | phone (NOT NULL) |
               | password (HASH)  |
               | role (CHECK)     |
               +--------+---------+
                        | 1
                        |
                        | 1 (ON DELETE CASCADE, UNIQUE)
+------------------+   +v-----------------+
|   departments    |   |     doctors      |
+------------------+   +------------------+
| id (PK)          |   | id (PK)          |
| name (UNIQUE)    |   | userId (FK, NOTN)|
| description      |   | departmentId (FK)|
+--------+---------+   | specialization   |
         | 1           +--------+---------+
         |                      | 1
         | N (RESTRICT)         |
         +------------>+--------+
                       |
        +--------------+----------------+
        | 1                             | 1
        |                               |
        | N (RESTRICT)                  | N (RESTRICT)
+-------v----------+           +--------v---------+           +------------------+
|   appointments   |           | medical_records  |           |  prescriptions   |
+------------------+           +------------------+           +------------------+
| id (PK)          |           | id (PK)          |           | id (PK)          |
| patientId (FK)   |           | patientId (FK)   |           | patientId (FK)   |
| doctorId (FK)    |           | doctorId (FK)    |           | doctorId (FK)    |
| appointmentDate  |           | diagnosis        |           | appointmentId(FK)|
| status (CHECK)   |           | symptoms         |           | notes            |
| reason           |           | treatment        |           | prescriptionDate |
+--------^---------+           | notes            |           +--------+---------+
         |                     | date (DEFAULT)   |                    | 1
         | N (CASCADE)         +--------^---------+                    |
         |                              |                              | N (CASCADE)
+--------+---------+                    |                              |
|     patients     |                    | N (CASCADE)         +--------v---------+
|------------------+                    |                     |prescription_items|
| id (PK)          |                    |                     +------------------+
| name (NOT NULL)  |                    |                     | id (PK)          |
| dateOfBirth      |--------------------+                     |prescriptionId(FK)|
| gender (CHECK)   |                                          | medicationName   |
| phone (NOT NULL) |                                          | dosage           |
| email (UNIQUE)   |----------------------------------------->| frequency        |
| address (NOT N)  |                N (CASCADE)               | duration         |
+------------------+                                          | quantity (CHECK) |
                                                              | instructions     |
                                                              +------------------+
```

---

## Authentication & Role-Based Access Control (RBAC)

All private endpoints require a Bearer token in the `Authorization` header:
```text
Authorization: Bearer <your_jwt_token>
```

| Resource / Action | Admin | Doctor | Nurse | Receptionist |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Users** (`GET`, `POST`, `DELETE`) | Allowed | Denied | Denied | Denied |
| **Departments** (`POST`, `PUT`, `DELETE`) | Allowed | Denied | Denied | Denied |
| **Departments** (`GET`) | Allowed | Allowed | Allowed | Allowed |
| **Doctors** (`POST`, `DELETE`) | Allowed | Denied | Denied | Denied |
| **Doctors** (`PUT /:id`) | Allowed | Own Profile | Denied | Denied |
| **Doctors** (`GET`) | Allowed | Allowed | Allowed | Allowed |
| **Patient Directory** (`GET`) | All Patients | Own Patients | All Patients | All Patients |
| **Patient Management** (`POST`, `PUT`, `DELETE`) | Allowed | Denied | Denied | Allowed |
| **Appointments** (`GET`) | All Doctors | Own Only | Own / All | All Doctors |
| **Appointments** (`POST`) | Allowed | Allowed | Denied | Allowed |
| **Appointments** (`PUT /:id`) | All (incl. Completed) | Own (Active only) | Denied | Scheduled |
| **Appointments** (`DELETE /:id`) | Allowed | Denied | Denied | Allowed |
| **Medical Records** (`GET`) | Allowed | Allowed | Allowed | Denied |
| **Medical Records** (`POST`, `PUT`, `DELETE`)| Allowed | Allowed | Denied | Denied |
| **Prescriptions** (`GET`) | Allowed | Allowed | Allowed | Denied |
| **Prescriptions** (`POST`, `PUT`, `DELETE`)| Allowed | Allowed | Denied | Denied |

---

## API Reference

All routes are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | List all system users |
| `GET` | `/api/users/:id` | Admin or Self | Retrieve user by ID |
| `POST` | `/api/users` | Admin | Create system user with assigned role |
| `PUT` | `/api/users/:id` | Admin or Self | Update user details (name, email, phone) |
| `DELETE`| `/api/users/:id` | Admin | Delete user |

### Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Authenticated | List departments with doctor counts |
| `GET` | `/api/departments/:id` | Authenticated | Get department and staff details |
| `POST` | `/api/departments` | Admin | Create clinical department |
| `PUT` | `/api/departments/:id` | Admin | Update department information |
| `DELETE`| `/api/departments/:id` | Admin | Delete department (restricted if doctors assigned) |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Authenticated | List doctors (filter: `?departmentId=`) |
| `GET` | `/api/doctors/:id` | Authenticated | Get doctor details joined with user profile |
| `POST` | `/api/doctors` | Admin | Create doctor profile linked to user account |
| `PUT` | `/api/doctors/:id` | Admin or Self | Update doctor specialization and contact info |
| `DELETE`| `/api/doctors/:id` | Admin | Delete doctor profile |

### Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | Authenticated | List patients (filtered to doctor's patients for doctor role; `?scope=all` for clinical forms) |
| `GET` | `/api/patients/:id` | Authenticated | Get patient profile with full clinical chart |
| `POST` | `/api/patients` | Admin, Receptionist | Register new patient |
| `PUT` | `/api/patients/:id` | Admin, Receptionist | Update patient demographics |
| `DELETE`| `/api/patients/:id` | Admin, Receptionist | Delete patient record |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Authenticated | List appointments (doctors strictly see only their appointments) |
| `GET` | `/api/appointments/:id` | Authenticated | Get appointment details |
| `POST` | `/api/appointments` | Admin, Receptionist, Doctor | Book new appointment |
| `PUT` | `/api/appointments/:id` | Admin, Receptionist, Doctor | Update appointment (doctors locked from editing completed appointments; admin full override) |
| `DELETE`| `/api/appointments/:id` | Admin, Receptionist | Cancel and delete appointment |

### Medical Records (`/api/medical-records`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medical-records` | Admin, Doctor, Nurse | List hospital clinical records |
| `GET` | `/api/medical-records/:id`| Admin, Doctor, Nurse | Get clinical record details |
| `POST` | `/api/medical-records` | Admin, Doctor | Create medical record with diagnosis and treatment |
| `PUT` | `/api/medical-records/:id`| Admin, Doctor | Update medical record |
| `DELETE`| `/api/medical-records/:id`| Admin, Doctor | Delete medical record |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/prescriptions` | Admin, Doctor, Nurse | List prescriptions with itemized medications |
| `GET` | `/api/prescriptions/:id` | Admin, Doctor, Nurse | Get prescription with all medication line items |
| `POST` | `/api/prescriptions` | Admin, Doctor | Atomically create prescription with multiple medication items |
| `PUT` | `/api/prescriptions/:id` | Admin, Doctor | Atomically update prescription and medication lines |
| `DELETE`| `/api/prescriptions/:id` | Admin, Doctor | Delete prescription (cascades to items) |

---

## Project Directory Structure

```text
Hospital Management System/
├── package.json                         # Root workspace scripts
├── README.md                            # Project documentation
├── .gitignore                           # Git ignore rules
├── backend/                             # Express & PostgreSQL Backend
│   ├── config/
│   │   └── config.js                    # Database credentials & schema configuration
│   ├── migrations/                      # DDL migrations with relational constraints
│   ├── models/                          # Sequelize models and relational associations
│   ├── seeders/                         # Database seeders with sequence reset
│   ├── src/
│   │   ├── controllers/                 # REST controllers with transaction handling
│   │   ├── middleware/                  # Authentication, Authorization, Validation, Errors
│   │   ├── routes/                      # API route definitions
│   │   ├── utils/                       # Helpers, AppError, bcrypt wrapper
│   │   ├── validators/                  # Zod validation schemas
│   │   ├── app.js                       # Express application setup
│   │   └── server.js                    # Server startup script
│   ├── test/
│   │   └── api.test.js                  # Automated integration test suite
│   ├── .env                             # Backend environment variables
│   ├── .env.example                     # Environment template (keys only)
│   └── package.json
└── frontend/                            # React & Tailwind CSS Frontend SPA
    ├── src/
    │   ├── components/                  # UI components (Button, Modal, DataTable, etc.)
    │   ├── context/                     # AuthContext for session & role state
    │   ├── layouts/                     # DashboardLayout & AuthLayout
    │   ├── pages/                       # Module pages (Dashboard, Patients, Doctors, etc.)
    │   ├── services/                    # Axios API client
    │   ├── App.jsx                      # Route configuration & ProtectedRoute guards
    │   └── main.jsx
    ├── .env                             # Frontend environment variables
    ├── .env.example                     # Environment template (keys only)
    └── package.json
```

---

## Environment Configuration

### Backend (`backend/.env`)

Configure the following keys in `backend/.env`:

```env
PORT=
NODE_ENV=
JWT_SECRET=
JWT_EXPIRES_IN=
SALT_ROUNDS=

DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=
DB_PORT=
DB_DIALECT=
DB_SCHEMA=
```

### Frontend (`frontend/.env`)

Configure the following key in `frontend/.env`:

```env
VITE_API_URL=
```

> **Security Notice:** Do not commit `.env` files to source control. Use the provided `.env.example` templates to configure local environments.

---

## Database Migrations & Seeding

From the project root:

```bash
# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

---

## Running the Application

### 1. Start Backend API Server
```bash
npm run dev:backend
```
The API runs at `http://localhost:<PORT>/api`.

### 2. Start Frontend Application
In a separate terminal:
```bash
npm run dev:frontend
```
The React development server runs at `http://localhost:3000`.

### 3. Build Frontend for Production
```bash
npm run build:frontend
```

---

## Running Automated Tests

Run the backend integration test suite against PostgreSQL:

```bash
npm run test:backend
```

The test runner validates:
- Database connectivity and schema integrity across all 8 tables.
- JWT authentication and token validation.
- Role-based authorization boundaries.
- Relational normalization (modifying user updates doctor profile dynamically).
- Doctor appointment ownership and isolation.
- Completed appointment immutability for doctors and administrator override.
- Scoped patient directory for doctors.
- Multi-item atomic prescription transactions and cascading deletions.
