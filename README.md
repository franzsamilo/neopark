# Neopark - Parking Management System

A modern parking management system built with Next.js, Prisma, and Mapbox.

## Features

### Admin Dashboard (Desktop Only)

- **Add Pins**: Click on the map to create parking lot pins
- **Edit Pins**: Modify existing parking lot information
- **Delete Pins**: Remove parking lots from the system
- **Pin Details**: Click on pins to view detailed information
- **Parking Layout Creation**: Prepare for future parking space layout editor

### User Dashboard (Mobile-First)

- **Search Location**: Search for parking locations with geocoding
- **Interactive Map**: View parking lots with color-coded availability
- **Bottom Sheet**: Draggable component showing parking lots and details
- **Real-time Updates**: Live parking availability information

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Maps**: Mapbox GL JS
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom animations

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard (desktop)
│   ├── dashboard/         # User dashboard (mobile)
│   └── api/              # API routes
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── dashboard/        # User dashboard components
│   └── providers/        # Context providers
├── constants/            # Type definitions and enums
│   ├── types/           # TypeScript interfaces
│   └── enums/           # Enum definitions
└── lib/                 # Utility functions
```

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Add your Mapbox token and database URL:

   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   DATABASE_URL=your_database_url
   ```

3. **Set up the database**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - User Dashboard: http://localhost:3000/dashboard
   - Admin Dashboard: http://localhost:3000/admin

## Current Status

### ✅ Completed

- Basic project setup with Next.js and Prisma
- Mapbox integration for both admin and user maps
- Admin dashboard with pin management
- User dashboard with search and bottom sheet
- Type definitions and constants organization
- Mobile-first responsive design

### 🚧 In Progress

- Parking layout editor for admins
- Real-time parking space management
- User authentication and authorization
- API integration for parking data

### 📋 Planned

- Real-time parking space updates
- Payment integration
- User reservations
- Analytics dashboard
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
