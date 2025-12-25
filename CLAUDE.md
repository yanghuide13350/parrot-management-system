# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Backend Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Initialize database (creates tables)
python init_database.py

# Run development server (port 8000)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Access API documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Frontend Development
```bash
# Navigate to frontend directory
cd parrot-management-system

# Install dependencies (requires Node.js 20.19+ or 22.12+)
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Complete Development Workflow
1. Start backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000` (from root directory)
2. Start frontend: `npm run dev` (from `parrot-management-system/` directory)
3. Frontend proxies API requests to backend automatically via Vite proxy

**Important**: Frontend requires Node.js 20.19+ or 22.12+. Use `nvm use 20` if you have nvm installed.

## High-Level Architecture

### Project Structure
```
parrot-management-system2/
├── app/                          # FastAPI Backend
│   ├── api/                      # API route handlers
│   │   ├── parrots.py           # Parrot CRUD operations
│   │   ├── photos.py            # Photo upload/management
│   │   ├── statistics.py        # Statistics/reporting
│   │   └── incubation.py        # Incubation/breeding records
│   ├── core/                     # Core configuration
│   │   ├── config.py            # App settings (loads from .env)
│   │   ├── database.py          # DB connection & sessions
│   │   └── exceptions.py        # Global exception handlers
│   ├── models/                   # SQLAlchemy models
│   │   ├── parrot.py            # Parrot entity (with mate_id, paired_at)
│   │   ├── photo.py             # Photo entity
│   │   ├── incubation_record.py # Incubation records
│   │   ├── follow_up.py         # Follow-up records
│   │   └── sales_history.py     # Sales history
│   ├── schemas/                  # Pydantic schemas
│   │   ├── parrot.py            # Parrot validation schemas
│   │   └── photo.py             # Photo validation schemas
│   └── utils/                    # Utilities
│       └── file_upload.py        # File upload helper
├── parrot-management-system/     # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ParrotListPage.tsx  # Parrot listing with filters
│   │   │   └── BreedingManagementPage.tsx  # Breeding/pairing
│   │   ├── services/            # API client services
│   │   │   ├── api.ts           # Axios client config
│   │   │   └── parrotService.ts
│   │   └── types/               # TypeScript types
│   └── dist/                    # Production build output
├── main.py                       # FastAPI entry point
├── init_database.py              # Database initialization script
├── parrot_management.db          # SQLite database (auto-created)
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment config template
└── uploads/                      # File upload storage
```

### Technology Stack

**Backend (FastAPI)**
- Framework: FastAPI 0.115.5 (Python 3.9+)
- ORM: SQLAlchemy 2.0.36
- Validation: Pydantic 2.10.3
- Server: Uvicorn 0.32.1
- Database: SQLite (development) / MySQL/PostgreSQL (production)
- File Upload: Python-multipart, Aiofiles

**Frontend (React)**
- Framework: React 19.2.0 with TypeScript
- Build Tool: Vite 7.2.2 (requires Node.js 20.19+)
- UI Library: Ant Design 5.28.1
- Routing: React Router DOM 7.9.6
- HTTP Client: Axios 1.13.2
- State Management: Zustand 4.3.6
- Styling: TailwindCSS 4.1.17

### Communication Flow
1. Frontend (port 5173) → Vite Proxy → Backend (port 8000) → Database
2. File uploads stored in `/uploads` directory, served statically at `/uploads`
3. API base URL: `http://localhost:8000/api` (configured in frontend services)

## Database Schema

### Main Tables

**parrots** - Core parrot information
- id, breed, price, min_price, max_price
- gender (公/母/未验卡), birth_date, ring_number (unique)
- status (available/sold/returned/breeding)
- health_notes, created_at, updated_at
- sold_at, returned_at, return_reason
- **mate_id** (self-referencing foreign key for pairing)
- **paired_at** (配对时间)

**photos** - Parrot photos/videos
- id, parrot_id (FK), file_path, file_name, file_type, sort_order
- Cascade delete when parrot is deleted

**incubation_records** - Breeding/incubation tracking
- id, male_id, female_id, start_date, expected_hatch_date
- status, notes, created_at, updated_at

**chicks** - Offspring records
- id, incubation_record_id, hatch_date, ring_number
- status, notes

**follow_ups** - Follow-up records for sold parrots
- id, parrot_id, follow_up_date, notes

**sales_history** - Sales transaction records
- id, parrot_id, sale_date, sale_price, customer_info

### Key Features
- Self-referencing relationship for parrot pairing (mate_id field)
- Automatic table creation on startup via `Base.metadata.create_all()`
- Cascade delete for photos when parrot is deleted
- Indexed fields: breed, status, ring_number

## API Endpoints

### Core Parrot Management
- `GET /api/parrots` - List parrots with filtering (breed, gender, status, price range, age)
- `POST /api/parrots` - Create new parrot (with duplicate ring_number validation)
- `GET /api/parrots/{id}` - Get parrot details
- `PUT /api/parrots/{id}` - Update parrot info
- `DELETE /api/parrots/{id}` - Delete parrot
- `PUT /api/parrots/{id}/status` - Update parrot status
- `GET /api/parrots/ring-number/{ring_number}/exists` - Check ring number uniqueness

### Breeding Management
- `GET /api/parrots/{id}/mate` - Get mate information
- `POST /api/parrots/pair` - Pair two parrots (公 with 母)
- `GET /api/parrots/eligible-females/{male_id}` - Get available females for pairing
- `POST /api/parrots/unpair/{id}` - Cancel pairing

### Incubation Management
- `GET /api/incubation` - List incubation records
- `POST /api/incubation` - Create incubation record
- `GET /api/incubation/{id}` - Get incubation details
- `PUT /api/incubation/{id}` - Update incubation record
- `DELETE /api/incubation/{id}` - Delete incubation record

### Photo Management
- `POST /api/parrots/{id}/photos` - Upload photo/video (max 500MB)
- `GET /api/parrots/{id}/photos` - Get parrot's photos
- `DELETE /api/photos/{id}` - Delete photo
- Allowed formats: png, jpg, jpeg, gif, mp4, mov, avi, mkv, webm

### Statistics
- `GET /api/statistics` - Dashboard statistics (total parrots, sales, revenue, breed counts)

## Configuration Files

### Backend Configuration
- **`.env`**: Environment variables (copy from `.env.example`)
  - `DATABASE_URL`: Database connection string
  - `DEBUG`: Debug mode (true/false)
  - `CORS_ORIGINS`: Allowed CORS origins
  - `UPLOAD_DIR`: File upload directory
  - `MAX_FILE_SIZE`: Max file size in bytes (default: 500MB)
- **`main.py`**: FastAPI app initialization, CORS setup, static file serving
- **`app/core/config.py`**: Settings class that loads from .env
- **`app/core/database.py`**: SQLAlchemy engine, SessionLocal factory

### Frontend Configuration
- **`parrot-management-system/package.json`**: Dependencies, build scripts
- **`parrot-management-system/tsconfig.json`**: TypeScript config (strict mode, ES2022 target)
- **`parrot-management-system/vite.config.ts`**: Dev server proxy to backend
- **`parrot-management-system/tailwind.config.js`**: TailwindCSS configuration
- **`parrot-management-system/src/index.css`**: Global styles (Tailwind imports)

## Development Notes

### Environment Setup

1. **Backend Setup**:
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your database settings
   # For development, SQLite is used by default

   # Install dependencies
   pip install -r requirements.txt

   # Initialize database
   python init_database.py
   ```

2. **Frontend Setup**:
   ```bash
   cd parrot-management-system

   # Ensure Node.js 20.19+ is installed
   node --version  # Should be 20.19+ or 22.12+

   # If using nvm:
   nvm use 20

   npm install
   ```

### Common Issues & Solutions

1. **Node.js Version Error**:
   - Error: "Vite requires Node.js version 20.19+ or 22.12+"
   - Solution: Use `nvm use 20` or upgrade Node.js to version 20+

2. **CSS Import Order Warning**:
   - Warning: "@import must precede all other statements"
   - Fixed: `@import` statements now come before `@tailwind` directives in `src/index.css`

3. **Ring Number Duplicates**:
   - Backend validates ring_number uniqueness in real-time via `/api/parrots/ring-number/{ring_number}/exists`

4. **Price Range Filtering**:
   - Both `min_price` and `max_price` parameters supported in `GET /api/parrots`

5. **Breeding Management**:
   - Only parrots with status="breeding" can be paired
   - Gender validation: 公 (male) + 母 (female) only
   - Cross-breed pairing supported (not limited to same breed)
   - After pairing, both parrots show mate info with pairing duration

6. **File Uploads**:
   - Stored in `/uploads` directory
   - Served at `http://localhost:8000/uploads/{filename}`
   - Vite proxy forwards `/uploads` requests to backend
   - Max file size: 500MB (configurable in .env)

### Database Management

**Development (SQLite)**:
- Default database: `parrot_management.db` in project root
- Automatic table creation on first run
- Use `python init_database.py` to reinitialize

**Production (MySQL/PostgreSQL)**:
- Configure `DATABASE_URL` in `.env`
- MySQL: `mysql+pymysql://user:password@localhost:3306/dbname`
- PostgreSQL: `postgresql://user:password@localhost:5432/dbname`
- Run `python init_database.py` to create tables
- See `DEPLOYMENT.md` for full production setup

**Database Migrations**:
- Alembic is configured but not actively used
- Current approach: Auto-creation via SQLAlchemy models
- For production, consider using Alembic migrations

### Type Definitions
Key TypeScript interfaces in `parrot-management-system/src/types/parrot.ts`:
- `Parrot` interface includes `mate_id` and `paired_at` fields
- `FilterParams` includes `min_price` and `max_price` for filtering

### Error Handling
- Global exception handler in `app/core/exceptions.py`
- FastAPI automatically generates OpenAPI documentation
- Frontend uses Axios interceptors for error handling

### API Proxy Configuration
Vite dev server automatically proxies:
- `/api/*` → `http://localhost:8000/api/*`
- `/uploads/*` → `http://localhost:8000/uploads/*`

This allows frontend to use relative URLs without CORS issues.

## Production Deployment

See `DEPLOYMENT.md` for comprehensive production deployment guide including:
- MySQL/PostgreSQL setup
- Nginx configuration
- Systemd service setup
- SSL/HTTPS configuration
- Backup strategies
- Performance optimization

Quick deploy script available: `./deploy.sh`

## Documentation
- API Documentation: Auto-generated at `/docs` (Swagger UI) and `/redoc`
- Database Schema: See `DATABASE_DESIGN.md`
- Backend README: See `README.md` (in Chinese)
- Deployment Guide: See `DEPLOYMENT.md` (in Chinese)
