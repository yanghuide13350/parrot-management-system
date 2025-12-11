# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Backend Development
```bash
# Install Python dependencies
pip install -r requirements.txt

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

# Install dependencies
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
1. Start backend: `uvicorn main:app --reload` (from root directory)
2. Start frontend: `npm run dev` (from `parrot-management-system/` directory)
3. Frontend proxies API requests to backend automatically via Vite proxy

## High-Level Architecture

### Project Structure
```
parrot-management-system2/
├── app/                          # FastAPI Backend
│   ├── api/                      # API route handlers
│   │   ├── parrots.py           # Parrot CRUD operations
│   │   ├── photos.py            # Photo upload/management
│   │   └── statistics.py        # Statistics/reporting
│   ├── core/                     # Core configuration
│   │   ├── config.py            # App settings
│   │   ├── database.py          # DB connection & sessions
│   │   └── exceptions.py        # Global exception handlers
│   ├── models/                   # SQLAlchemy models
│   │   ├── parrot.py            # Parrot entity (with mate_id, paired_at for breeding)
│   │   └── photo.py             # Photo entity
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
│   │   │   ├── ParrotListPage.tsx  # Parrot listing with gender/price filters
│   │   │   └── BreedingManagementPage.tsx  # Breeding/pairing management
│   │   ├── services/            # API client services
│   │   │   ├── api.ts           # Axios client config
│   │   │   └── parrotService.ts
│   │   └── types/               # TypeScript types
│   └── dist/                    # Production build output
├── main.py                       # FastAPI entry point
├── parrot_management.db          # SQLite database (auto-created)
├── requirements.txt              # Python dependencies
└── uploads/                      # File upload storage
```

### Technology Stack

**Backend (FastAPI)**
- Framework: FastAPI 0.115.5 (Python)
- ORM: SQLAlchemy 2.0.36
- Validation: Pydantic 2.10.3
- Server: Uvicorn 0.32.1
- Database: SQLite (development) / MySQL (production ready)
- File Upload: Python-multipart, Aiofiles

**Frontend (React)**
- Framework: React 19.2.0 with TypeScript
- Build Tool: Vite 7.2.2
- UI Library: Ant Design 5.28.1
- Routing: React Router DOM 7.9.6
- HTTP Client: Axios 1.13.2
- State Management: Zustand 4.3.6
- Styling: TailwindCSS 4.1.17

### Communication Flow
1. Frontend (port 5173) → Vite Proxy → Backend (port 8000) → SQLite Database
2. File uploads stored in `/uploads` directory, served statically at `/uploads`
3. API base URL: `http://localhost:8000/api` (configured in frontend services)

## Database Schema

### Main Tables

**parrots** - Core parrot information
- id, breed, price, min_price, max_price
- gender (公/母/未验卡), birth_date, ring_number
- status (available/sold/returned/breeding)
- health_notes, created_at, updated_at
- sold_at, returned_at, return_reason
- **mate_id** (self-referencing foreign key for pairing)
- **paired_at** (配对时间，用于 breeding management)

**photos** - Parrot photos
- id, parrot_id (FK), file_path, file_name, file_type, sort_order

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

### Breeding Management
- `GET /api/parrots/{id}/mate` - Get mate information
- `POST /api/parrots/pair` - Pair two parrots (公 with 母)
- `GET /api/parrots/eligible-females/{male_id}` - Get available females for pairing
- `POST /api/parrots/unpair/{id}` - Cancel pairing

### Photo Management
- `POST /api/parrots/{id}/photos` - Upload photo/video (max 500MB)
- `GET /api/parrots/{id}/photos` - Get parrot's photos
- Allowed formats: png, jpg, jpeg, gif, mp4, mov, avi, mkv, webm

### Statistics
- `GET /api/statistics` - Dashboard statistics

## Configuration Files

### Backend Configuration
- **`main.py`**: FastAPI app initialization, CORS setup, static file serving
- **`app/core/config.py`**: Database URL, file upload limits, CORS origins
- **`app/core/database.py`**: SQLAlchemy engine, SessionLocal factory

### Frontend Configuration
- **`parrot-management-system/package.json`**: Dependencies, build scripts
- **`parrot-management-system/tsconfig.json`**: TypeScript config (strict mode, ES2022 target)
- **`parrot-management-system/vite.config.ts`**: Dev server proxy to backend
- **`parrot-management-system/tailwind.config.js`**: TailwindCSS configuration

## Development Notes

### Common Issues & Solutions

1. **Ring Number Duplicates**: Backend validates ring_number uniqueness in real-time via `/api/parrots/ring-number/{ring_number}/exists`

2. **Price Range Filtering**: Both `min_price` and `max_price` parameters supported in `GET /api/parrots`

3. **Breeding Management**:
   - Only parrots with status="breeding" can be paired
   - Gender validation: 公 (male) + 母 (female) only
   - Cross-breed pairing supported (not limited to same breed)
   - After pairing, both parrots show mate info with pairing duration

4. **File Uploads**:
   - Stored in `/uploads` directory
   - Served at `http://localhost:8000/uploads/{filename}`
   - Vite proxy forwards `/uploads` requests to backend

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

## Database Migration
Currently using auto-creation via SQLAlchemy models. For production, consider setting up Alembic migrations as referenced in documentation.

## Documentation
- API Documentation: Auto-generated at `/docs` and `/redoc`
- Database Schema: See `DATABASE_DESIGN.md`
- Backend README: See `README.md` (in Chinese)
