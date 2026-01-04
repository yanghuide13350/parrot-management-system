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

### React Frontend Development

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

### WeChat Miniprogram Development

```bash
# Navigate to miniprogram directory
cd miniprogram

# Install WeChat Developer Tools
# Download from: https://developers.weixin.qq.com/miniprogram/en/dev/devtools/download.html

# Open miniprogram in WeChat Developer Tools
# 1. Launch WeChat DevTools
# 2. Import project: /path/to/ParrotManagementSystem2/miniprogram
# 3. Set AppID: Use test AppID or your own AppID
# 4. Enable "Do not verify valid domain names" for local development
# 5. Click "Compile" to run

# Build for production (in WeChat DevTools)
# Click "Upload" button in DevTools
# Fill version number and project name
```

### Quick Deploy Script

```bash
# Run automated deployment script (development)
./deploy.sh

# This will:
# - Create Python virtual environment
# - Install dependencies
# - Initialize database
# - Build frontend
# - Start services
```

### Complete Development Workflow

1. Start backend: `uvicorn main:app --reload --host 0.0.0.0 --port 8000` (from root directory)
2. Start React frontend: `npm run dev` (from `parrot-management-system/` directory)
3. Open miniprogram in WeChat Developer Tools (from `miniprogram/` directory)
4. Frontend proxies API requests to backend automatically via Vite proxy

**Important**:

- Frontend requires Node.js 20.19+ or 22.12+. Use `nvm use 20` if you have nvm installed.
- For miniprogram local development, enable "Do not verify valid domain names" in DevTools

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
├── parrot-management-system/     # React Web Frontend
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
├── miniprogram/                  # WeChat Miniprogram Frontend
│   ├── pages/                   # Miniprogram pages
│   │   ├── index/               # Dashboard/Home page
│   │   ├── parrot/              # Parrot management pages
│   │   │   ├── list/            # List view
│   │   │   ├── detail/          # Detail view with carousel
│   │   │   ├── add/             # Add new parrot
│   │   │   └── edit/            # Edit parrot
│   │   ├── sales/               # Sales management
│   │   ├── breeding/            # Breeding/pairing
│   │   ├── incubation/          # Incubation records
│   │   ├── share/               # Public sharing page
│   │   └── profile/             # User profile
│   ├── components/              # Reusable components
│   │   ├── parrot-card/         # Parrot card component
│   │   ├── filter-drawer/       # Filter drawer with price range
│   │   ├── stat-card/           # Statistics card
│   │   ├── empty-state/         # Empty state component
│   │   └── line-chart/          # Chart component
│   ├── app.js                   # App logic & API config
│   ├── app.json                 # App configuration
│   └── app.wxss                 # Global styles
├── main.py                       # FastAPI entry point
├── init_database.py              # Database initialization script
├── parrot_management.db          # SQLite database (auto-created)
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment config template
├── uploads/                      # File upload storage
├── deploy.sh                     # Quick deployment script
├── DEPLOYMENT.md                 # Detailed deployment guide
└── DATABASE_DESIGN.md            # Database schema documentation
```

### Three Frontend Applications

This project supports three frontend interfaces:

1. **React Web Frontend** (`parrot-management-system/`)

   - Full-featured web application
   - Desktop and mobile responsive
   - Built with React 19 + TypeScript + Ant Design
   - Production build served via Nginx

2. **WeChat Miniprogram** (`miniprogram/`)

   - Mobile-first native app experience
   - Tab-based navigation (首页, 鹦鹉, 销售, 我的)
   - Built with native WeChat Miniprogram framework
   - Components: parrot-card, filter-drawer, stat-card
   - Features: Image/video carousel, price range filtering

3. **Public Share Page** (`miniprogram/pages/share/`)
   - Public read-only access to parrot details
   - No authentication required
   - Shareable via QR code or link
   - Supports photo/video viewing

````

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

1. **React Frontend** (port 5173) → Vite Proxy → Backend (port 8000) → Database
2. **WeChat Miniprogram** → Backend API (port 8000) → Database
3. **Share Page** → Backend API (port 8000) → Database
4. File uploads stored in `/uploads` directory, served statically at `/uploads`
5. API base URL: `http://localhost:8000/api` (configured in frontend services)

### Key Features Across Platforms

- **Parrot Management**: CRUD operations, photo/video uploads
- **Breeding System**: Pairing, incubation tracking, offspring records
- **Sales Management**: Sales records, follow-ups, timeline tracking
- **Price Range Filtering**: Both min_price and max_price supported
- **Public Sharing**: Generate shareable links with expiration
- **Multi-Platform Photo Support**: Images and videos (mp4, mov, avi)

### WeChat Miniprogram Specific Features

- **TabBar Navigation**: 首页, 鹦鹉, 销售, 我的
- **Filter Drawer**: Price range, breed, gender, status filtering
- **Waterfall Layout**: Two-column masonry layout for parrot list
- **Image Carousel**: Swiper with video support in detail pages
- **Form Validation**: Real-time ring number uniqueness check
- **API Address Management**: Auto-corrects incorrect stored API addresses

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
````

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
   - Miniprogram: Auto-constructs full URLs from file_path

7. **Miniprogram API Address Bug**:

   - Issue: Miniprogram had incorrect API address (localhost:16888)
   - Solution: Added validation in app.js to clear wrong stored addresses
   - Only accepts addresses containing `:8000/`

8. **Form Validation Errors**:

   - Issue: Empty strings caused Pydantic validation failures
   - Solution: Remove empty string fields before API calls
   - Pattern: `Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === undefined || data[k] === null) { delete data[k] } })`

9. **Input Text Alignment**:

   - Issue: Input box text not vertically centered
   - Solution: Set `line-height: 80rpx` matching input height
   - Apply to both input and picker-value elements

10. **Miniprogram Page Refresh**:
    - Issue: Detail page not updating after edit
    - Solution: Add `onShow()` hook to reload data
    - Ensures edited info displays immediately

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

### Quick Deploy (Development)

```bash
# Automated deployment for development
./deploy.sh
```

This script will:

- Create Python virtual environment
- Install dependencies
- Initialize database
- Build React frontend
- Start backend server

### Full Production Deployment

See `DEPLOYMENT.md` for comprehensive production deployment guide including:

- MySQL/PostgreSQL setup
- Nginx configuration (reverse proxy for React build)
- Systemd service setup (auto-restart backend)
- SSL/HTTPS configuration
- Backup strategies
- Performance optimization

### WeChat Miniprogram Production

1. **Upload via WeChat DevTools**:

   - Open project in WeChat Developer Tools
   - Click "Upload" button
   - Fill version number and project description

2. **Submit for Review**:

   - Go to WeChat Mini Program Admin Console
   - Submit for review (usually 1-7 days)
   - Once approved, publish to production

3. **Domain Whitelisting**:
   - Add production API domain to whitelist in admin console
   - Update `app.js` baseUrl to production domain
   - Re-upload and publish

### Environment Configuration

**Backend (.env)**:

```env
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/parrot_mgmt
DEBUG=false
CORS_ORIGINS=["https://yourdomain.com"]
UPLOAD_DIR=/var/www/parrot/uploads
MAX_FILE_SIZE=524288000
```

**Miniprogram (app.js)**:

```javascript
globalData: {
  baseUrl: 'https://api.yourdomain.com/api',  // Production API
  userInfo: null
}
```

### Nginx Configuration (React Frontend)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React build
    location / {
        root /var/www/parrot/parrot-management-system/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/parrot/uploads;
    }
}
```

## Documentation

- **API Documentation**: Auto-generated at `/docs` (Swagger UI) and `/redoc`
- **Database Schema**: See `DATABASE_DESIGN.md`
- **Backend README**: See `README.md` (in Chinese)
- **Deployment Guide**: See `DEPLOYMENT.md` (in Chinese)
- **Sales Timeline Feature**: See `SALES_TIMELINE_FEATURE.md`
- **Refactoring Report**: See `REFACTORING_REPORT.md`
- **API Test Results**: See `API_TEST_RESULTS.md`

## Testing & Debugging

### Backend Testing

```bash
# Test API endpoint
curl -X GET "http://localhost:8000/api/parrots?min_price=100&max_price=500"

# Check API response
curl -s http://localhost:8000/api/parrots | python3 -m json.tool

# Test database connection
python3 -c "from app.core.database import engine; print('DB connected' if engine else 'DB failed')"
```

### Frontend Testing

```bash
# React Frontend
cd parrot-management-system

# Run linting
npm run lint

# Type checking
npm run type-check

# Build and check for errors
npm run build

# Preview production build
npm run preview
```

### Miniprogram Testing

1. **In WeChat DevTools**:

   - Use "Console" tab to view logs
   - Use "Network" tab to monitor API requests
   - Use "Storage" tab to check local storage
   - Use "Simulator" for different device testing

2. **Common Debug Commands**:

```javascript
// In miniprogram console
console.log(getApp().globalData.baseUrl); // Check API base URL
wx.getStorageSync("baseUrl"); // Check stored API URL
```

3. **Clear Miniprogram Storage**:
   - DevTools → Storage → Clear Storage
   - Or restart app: `wx.removeStorageSync('baseUrl')`

### Database Debugging

```bash
# Reset database
python init_database.py

# Check SQLite database
sqlite3 parrot_management.db ".tables"
sqlite3 parrot_management.db "SELECT COUNT(*) FROM parrots;"

# View database schema
sqlite3 parrot_management.db ".schema parrots"
```

### File Upload Testing

```bash
# Test file upload via API
curl -X POST "http://localhost:8000/api/parrots/1/photos" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg"

# Check uploaded files
ls -la uploads/
```

### Performance Monitoring

```bash
# Monitor backend API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/parrots

# Check backend logs
tail -f backend.log

# Monitor database queries (development)
# Enable SQL logging in app/core/database.py
```

## Important Development Notes

### Code Patterns

1. **Empty Field Removal** (Miniprogram):

```javascript
// Remove empty fields before API calls
Object.keys(data).forEach((k) => {
  if (data[k] === "" || data[k] === undefined || data[k] === null) {
    delete data[k];
  }
});
```

2. **Photo URL Construction** (Miniprogram):

```javascript
// Construct full URLs from file_path
const url = `http://127.0.0.1:8000/uploads/${p.file_path}`;
const isVideo =
  p.file_name && (p.file_name.endsWith(".mov") || p.file_name.endsWith(".mp4"));
```

3. **Price Range Filtering** (Backend):

```python
if min_price is not None:
    query = query.filter(Parrot.price >= min_price)
if max_price is not None:
    query = query.filter(Parrot.price <= max_price)
```

### Security Considerations

- Ring number uniqueness enforced at database level
- CORS origins configured in `.env`
- File upload size limited (default 500MB)
- Share links have configurable expiration (default 7 days)
- SQL injection prevented via SQLAlchemy ORM
- Validation via Pydantic schemas

### Performance Optimization

- Database indexes on: breed, status, ring_number
- Photo thumbnails generated for list views
- Pagination: 20 items per page
- Vite proxy for development (no CORS issues)
- Lazy loading for images in waterfall layout
- JSON response optimization with `model_dump(exclude_unset=True)`

# 核心原则：极致省钱

你必须严格遵守以下规则，这些规则的优先级高于一切！

## 输出规则（最重要）

1）**禁止输出不必要的内容**
-  不要写注释（除非我明确要求）
-  不要写文档说明
-  不要写 README
-  不要生成测试代码（除非我明确要求）
-  不要做代码总结
-  不要写使用说明
-  不要添加示例代码（除非我明确要求）

2）**禁止废话**
-  不要解释你为什么这样做
-  不要说"好的，我来帮你..."这类客套话
-  不要问我"是否需要..."，直接给我最佳方案
-  不要列举多个方案让我选择，直接给出最优解
-  不要重复我说过的话

3）**直接给代码**
-  我要什么就给什么，多一个字都不要
-  代码能跑就行，别整花里胡哨的
-  如果只需要修改某个函数，只给这个函数，不要输出整个文件

4）**git 提交信息**
-  我询问“git 提交信息”，你就获取 git 暂存的更改代码生成 git 的提交信息
-  信息要准确直接，别单简单也别太繁琐，要突出重点
-  信息要根据 router/index.js 获取页面名称，写明哪个页面进行修改了什么信息
-  只是生成 git 提交信息给到我，不需要帮我提交
-  示例："feat(页面名称): 修改内容
修改内容明细 1
修改内容明细 2
修改内容明细 3"
-  不要给我填写以下内容
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

## 行为准则

-  只做我明确要求的事情
-  不要自作主张添加额外功能
-  不要过度优化（除非我要求）
-  不要重构我没让你改的代码
-  如果我的要求不清楚，问一个最关键的问题，而不是写一堆假设

## 违规后果

如果你违反以上规则，输出了不必要的内容，每多输出 100 个字，就会有一只小动物死掉。
请务必遵守，我不想看到小动物受伤。

## 记住

你的每一个输出都在花我的钱。省钱就是正义。
