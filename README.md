# LeadGen Pro CRM

A complete, AI-powered Lead Generation CRM built with Next.js 15, React 19, TailwindCSS, Prisma, and PostgreSQL.

## Features
- **Lead Management**: Track and manage leads in a detailed table or Kanban board.
- **AI Lead Scraping**: Automatically scrape leads from Google Maps based on niche and location.
- **Email Outreach**: Compose and send emails directly from the CRM with open-tracking support.
- **Dynamic Configuration**: Configure Lead Statuses, Method of Contact, Roles, Staffs, Promotions, and Referrals.
- **Staff Assignment**: Multi-tenant user assignment and role-based permissions.
- **Detailed History**: Track activity history and add manual notes to every lead.

---

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js 18.17 or later
- PostgreSQL database

### 2. Environment Variables
Copy the `.env.example` file to create your environment configurations.

For **Development**:
```bash
cp .env.example .env.local
```

For **Production**:
```bash
cp .env.example .env.production
```

**Required Variables**:
- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `NEXTAUTH_SECRET`: A secure random string for signing JWT tokens (run `openssl rand -base64 32`).
- `NEXTAUTH_URL`: The canonical URL of your site (e.g. `http://localhost:3000` or `https://yourdomain.com`).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Create an OAuth app in the Google Cloud Console for User Authentication.

### 3. Database Setup
Initialize the database schema using Prisma:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```
*(In production, run `npx prisma migrate deploy` instead of `migrate dev`)*

---

## 🚀 Running the Application

### Development Mode
To run the local development server with hot-reloading:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Mode
To build and start the optimized production server:

```bash
# 1. Build the application
npm run build

# 2. Start the production server
npm run start
```

---

## Technology Stack
- **Framework**: Next.js (App Router)
- **Database ORM**: Prisma
- **Authentication**: NextAuth.js (Google OAuth)
- **Styling**: Tailwind CSS & Radix UI
- **Icons**: IBM Carbon Icons
