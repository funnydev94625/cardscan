# Credit Card Database Dashboard

## Overview

This is a full-stack web application that provides a comprehensive dashboard for managing and visualizing credit card data. The application features a React frontend with a Node.js/Express backend, using PostgreSQL as the database with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request logging

### Data Layer
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for database connectivity

## Key Components

### Database Schema
The application centers around a single `credit_cards` table with the following structure:
- Basic card information (number, expiry, CVV, holder name)
- Address details (address, city, state, zip, country)
- Contact information (phone, email)
- Geographic data (latitude, longitude for mapping)
- Bank information (bank name, BIN number)
- Optimized with indexes on frequently queried fields (state, city, BIN, bank)

### API Endpoints
- `GET /api/credit-cards` - Paginated credit card listing with filtering
- `GET /api/credit-cards/:id` - Individual credit card details
- `GET /api/credit-cards-stats` - Statistical data for dashboard
- `GET /api/map-data` - Geographic data for map visualization

### Frontend Components
- **Dashboard**: Main application page with tabbed interface
- **CreditCardTable**: Data table with sorting, filtering, and pagination
- **FiltersSidebar**: Advanced filtering interface
- **CreditCardMap**: Interactive map using Leaflet for geographic visualization
- **BankLogo**: Component for displaying bank logos with BIN lookup

### UI System
- Comprehensive component library from shadcn/ui
- Consistent design tokens through CSS custom properties
- Responsive design with mobile-first approach
- Dark mode support (configured but not actively used)

## Data Flow

1. **Client Request**: React components use TanStack Query to make API requests
2. **API Processing**: Express routes handle requests, validate filters, and call storage layer
3. **Data Retrieval**: Storage layer (mock data currently) processes queries and returns results
4. **Response Handling**: API returns JSON responses with proper error handling
5. **UI Updates**: React Query manages caching and updates UI components automatically

### Filtering System
- Multi-criteria filtering (search, location, bank, expiry dates)
- Real-time filter application with debouncing
- Persistent filter state in URL parameters
- Optimized queries with proper indexing

## External Dependencies

### Development Tools
- **Vite**: Build tool with React plugin and runtime error overlay
- **TypeScript**: Type checking and compilation
- **ESBuild**: Backend bundling for production

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Leaflet**: Interactive mapping library

### Data Management
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation and schema parsing

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

## Deployment Strategy

### Development
- **Server**: `tsx` for TypeScript execution with hot reloading
- **Client**: Vite dev server with HMR (Hot Module Replacement)
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Client**: Vite builds optimized static assets to `dist/public`
- **Server**: ESBuild bundles Node.js application to `dist/index.js`
- **Database**: PostgreSQL with connection pooling via Neon

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development/production mode switching via `NODE_ENV`
- Replit-specific optimizations for cloud deployment

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **Mock Data**: Currently uses in-memory mock data for demonstration, designed to easily switch to real database
3. **Type Safety**: Shared TypeScript types between client and server via shared schema definitions
4. **Modern Tooling**: Vite and ESBuild for fast development and optimized production builds
5. **Component Architecture**: Composable UI components with proper separation of concerns
6. **Query Optimization**: Strategic database indexes and efficient filtering logic