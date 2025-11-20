# Elite Digital Academy - Complete Project Structure

## 🎯 Overview
Full-stack e-learning platform with DSA roadmap, video courses, payment integration, and certificate generation.

## 📦 Tech Stack
- **Frontend**: React 19.2.0 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Payment**: Razorpay Integration
- **Authentication**: JWT-based auth system
- **State Management**: Redux Toolkit

---

## 📁 Project Root Structure

```
elite-digital-academy/
├── 📂 backend/                    # Node.js/Express backend
├── 📂 components/                 # Shared React components
├── 📂 pages/                      # Main application pages
├── 📂 public/                     # Static assets
├── 📂 src/                        # Core frontend source
├── 📄 App.tsx                     # Main app component with routing
├── 📄 index.tsx                   # React entry point
├── 📄 index.html                  # HTML template
├── 📄 package.json                # Frontend dependencies
├── 📄 vite.config.ts              # Vite configuration
├── 📄 tailwind.config.js          # Tailwind CSS config
├── 📄 tsconfig.json               # TypeScript config
├── 📄 types.ts                    # Global TypeScript types
├── 📄 vercel.json                 # Vercel deployment config
├── 📄 render.yaml                 # Render deployment config
└── 📄 README.md                   # Project documentation
```

---

## 🎨 Frontend Structure

### `/pages/` - Application Pages (30 pages)

```
pages/
├── 📄 HomePage.tsx                # Landing page with featured courses
├── 📄 AuthPage.tsx                # Login page (old version)
├── 📄 AuthPageNew.tsx             # Modern login/register page
├── 📄 AuthPageNew_backup.tsx      # Backup of auth page
├── 📄 CoursesPage.tsx             # Course catalog with filters
├── 📄 CourseDetailsPage.tsx       # Generic course details (uses API)
├── 📄 DSACourseLandingPage.tsx    # Dedicated DSA course landing
├── 📄 DSARoadmapPage.tsx          # DSA roadmap with problems
├── 📄 LearningPage.tsx            # Video learning interface
├── 📄 ProblemEditorPage.tsx       # Code editor for DSA problems
├── 📄 StudentDashboard.tsx        # Student dashboard with progress
├── 📄 AdminDashboard.tsx          # Admin panel for management
├── 📄 ProfilePage.tsx             # User profile settings
├── 📄 CartPage.tsx                # Shopping cart
├── 📄 CheckoutPage.tsx            # Payment checkout
├── 📄 WishlistPage.tsx            # Saved courses
├── 📄 CertificatesPage.tsx        # User certificates
├── 📄 CertificateVerificationPage.tsx  # Verify certificates
├── 📄 AboutPage.tsx               # About us
├── 📄 BlogPage.tsx                # Blog/articles
├── 📄 BecomeInstructorPage.tsx    # Instructor application
├── 📄 HelpCenterPage.tsx          # Help center
├── 📄 FAQPage.tsx                 # Frequently asked questions
├── 📄 PrivacyPolicyPage.tsx       # Privacy policy
├── 📄 TermsConditionsPage.tsx     # Terms and conditions
└── 📄 RefundPolicyPage.tsx        # Refund policy
```

### `/components/` - Shared Components

```
components/
└── 📄 SEO.tsx                     # SEO meta tags component
```

### `/src/` - Core Source Code

```
src/
├── 📂 components/                 # Reusable UI components
│   ├── 📂 ui/                     # Base UI components
│   ├── 📄 Navbar.tsx              # Navigation bar
│   ├── 📄 Footer.tsx              # Footer component
│   └── 📄 PageTransition.tsx      # Page transition animations
│
├── 📂 contexts/                   # React contexts
│   └── ...                        # Context providers
│
├── 📂 services/                   # API service layer
│   ├── 📄 courseService.ts        # Course API calls
│   └── 📄 paymentService.ts       # Payment API calls
│
├── 📂 store/                      # Redux store
│   ├── 📄 index.ts                # Store configuration
│   └── 📂 slices/                 # Redux slices
│       └── 📄 authSlice.ts        # Authentication state
│
├── 📂 styles/                     # Global styles
│   └── 📄 globals.css             # Global CSS
│
├── 📂 utils/                      # Utility functions
│   ├── 📄 api.ts                  # Axios instance
│   └── 📄 toast.ts                # Toast notifications
│
└── 📄 vite-env.d.ts               # Vite type definitions
```

---

## 🔧 Backend Structure

### `/backend/` - Server-side Application

```
backend/
├── 📂 config/                     # Configuration files
│   └── 📄 db.js                   # MongoDB connection
│
├── 📂 controllers/                # Route controllers (14 controllers)
│   ├── 📄 adminController.js      # Admin operations
│   ├── 📄 authController.js       # Authentication logic
│   ├── 📄 bookmarkController.js   # Bookmarks management
│   ├── 📄 certificateController.js # Certificate generation
│   ├── 📄 courseController.js     # Course CRUD operations
│   ├── 📄 discussionController.js # Discussion forums
│   ├── 📄 noteController.js       # Student notes
│   ├── 📄 paymentController.js    # Payment processing
│   ├── 📄 progressController.js   # Learning progress
│   ├── 📄 reviewController.js     # Course reviews
│   ├── 📄 roadmapController.js    # DSA roadmap logic
│   ├── 📄 roadmapProgressController.js # Roadmap progress
│   ├── 📄 submissionController.js # Code submissions
│   ├── 📄 uploadController.js     # File uploads
│   └── 📄 userController.js       # User management
│
├── 📂 middleware/                 # Express middleware
│   ├── 📄 auth.js                 # JWT authentication
│   └── 📄 error.js                # Error handling
│
├── 📂 models/                     # MongoDB schemas (11 models)
│   ├── 📄 Bookmark.js             # Bookmarked lessons
│   ├── 📄 Certificate.js          # Course certificates
│   ├── 📄 CodeSubmission.js       # DSA code submissions
│   ├── 📄 Course.js               # Course data model
│   ├── 📄 Discussion.js           # Discussion threads
│   ├── 📄 Enrollment.js           # Course enrollments
│   ├── 📄 Note.js                 # Student notes
│   ├── 📄 Progress.js             # Learning progress
│   ├── 📄 Review.js               # Course reviews
│   ├── 📄 Roadmap.js              # DSA roadmap structure
│   └── 📄 User.js                 # User accounts
│
├── 📂 routes/                     # API routes (15 route files)
│   ├── 📄 adminRoutes.js          # Admin endpoints
│   ├── 📄 authRoutes.js           # Auth endpoints
│   ├── 📄 bookmarkRoutes.js       # Bookmark endpoints
│   ├── 📄 certificateRoutes.js    # Certificate endpoints
│   ├── 📄 courseRoutes.js         # Course endpoints
│   ├── 📄 discussionRoutes.js     # Discussion endpoints
│   ├── 📄 noteRoutes.js           # Notes endpoints
│   ├── 📄 paymentRoutes.js        # Payment endpoints
│   ├── 📄 progressRoutes.js       # Progress endpoints
│   ├── 📄 reviewRoutes.js         # Review endpoints
│   ├── 📄 roadmapRoutes.js        # Roadmap endpoints
│   ├── 📄 roadmapProgressRoutes.js # Roadmap progress
│   ├── 📄 submissionRoutes.js     # Submission endpoints
│   ├── 📄 uploadRoutes.js         # Upload endpoints
│   └── 📄 userRoutes.js           # User endpoints
│
├── 📂 scripts/                    # Utility scripts (8 scripts)
│   ├── 📄 cleanOldEnrollments.js  # Clean up enrollments
│   ├── 📄 createAdmin.js          # Create admin user
│   ├── 📄 createTestUser.js       # Create test user
│   ├── 📄 listCourses.js          # List all courses
│   ├── 📄 listRoadmaps.js         # List all roadmaps
│   ├── 📄 markCourseComplete.js   # Mark course complete
│   ├── 📄 seedDSACourse.js        # Seed DSA course data
│   └── 📄 seedDSARoadmap.js       # Seed DSA roadmap data
│
├── 📂 utils/                      # Backend utilities
│   └── ...                        # Helper functions
│
├── 📄 server.js                   # Express server entry point
├── 📄 package.json                # Backend dependencies
├── 📄 .env                        # Environment variables (gitignored)
├── 📄 .gitignore                  # Git ignore rules
├── 📄 render.yaml                 # Render deployment config
└── 📄 DEPLOYMENT.md               # Deployment guide
```

---

## 🗄️ Database Structure (MongoDB)

### Collections

1. **users**
   - User accounts (students, instructors, admins)
   - Fields: name, email, password, role, enrolledCourses, avatar

2. **courses**
   - Video courses with sections and lessons
   - Fields: title, description, instructor, sections, price, ratings

3. **roadmaps**
   - DSA roadmap with coding problems
   - Fields: title, description, sections, problems, course (ref)

4. **enrollments**
   - User course enrollments
   - Fields: user, course, progress, completedLessons, paymentInfo

5. **certificates**
   - Generated course certificates
   - Fields: user, course, certificateId, issuedAt

6. **progress**
   - Detailed learning progress
   - Fields: user, course, completedLessons, lastAccessed

7. **codesubmissions**
   - DSA problem code submissions
   - Fields: user, problem, code, language, status, testResults

8. **discussions**
   - Discussion forums
   - Fields: course, user, title, content, replies

9. **reviews**
   - Course reviews and ratings
   - Fields: course, user, rating, comment

10. **notes**
    - Student lesson notes
    - Fields: user, lesson, content

11. **bookmarks**
    - Bookmarked lessons
    - Fields: user, lesson, course

---

## 🚀 Key Features by Module

### 1. Authentication System
- **Files**: `authController.js`, `authRoutes.js`, `authSlice.ts`, `AuthPageNew.tsx`
- **Features**: JWT-based auth, login, register, password reset
- **Routes**: `/api/auth/register`, `/api/auth/login`

### 2. Course Management
- **Files**: `courseController.js`, `courseRoutes.js`, `Course.js`, `CourseDetailsPage.tsx`
- **Features**: CRUD operations, filtering, search, ratings
- **Routes**: `/api/courses`, `/api/courses/:id`

### 3. DSA Roadmap System
- **Files**: `roadmapController.js`, `Roadmap.js`, `DSARoadmapPage.tsx`, `ProblemEditorPage.tsx`
- **Features**: 150+ coding problems, code editor, test cases, progress tracking
- **Routes**: `/api/roadmaps`, `/api/roadmap-progress`

### 4. Payment Integration
- **Files**: `paymentController.js`, `paymentService.ts`, `CheckoutPage.tsx`
- **Features**: Razorpay integration, free enrollment, order creation
- **Routes**: `/api/payment/create-order`, `/api/payment/verify`, `/api/payment/enroll-free`

### 5. Learning Interface
- **Files**: `LearningPage.tsx`, `progressController.js`, `Progress.js`
- **Features**: Video player, lesson tracking, notes, bookmarks
- **Routes**: `/api/progress`, `/api/notes`, `/api/bookmarks`

### 6. Certificate System
- **Files**: `certificateController.js`, `Certificate.js`, `CertificatesPage.tsx`
- **Features**: Auto-generate certificates on completion, verification
- **Routes**: `/api/certificates`, `/api/certificates/verify/:id`

### 7. Admin Dashboard
- **Files**: `AdminDashboard.tsx`, `adminController.js`
- **Features**: User management, course management, analytics
- **Routes**: `/api/admin/*`

---

## 🔑 Environment Variables

### Backend `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elite-digital-academy
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=rzp_live_Rhf4A5RGJeSN8C
RAZORPAY_KEY_SECRET=aDUHUoQGBEbVtTNRUHKpGsIZ
```

---

## 🌐 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id` - Get roadmap by ID
- `POST /api/roadmaps` - Create roadmap (admin)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/enroll-free` - Enroll in free course

### Progress
- `GET /api/progress/enrollments` - Get user enrollments
- `POST /api/progress/lesson/complete` - Mark lesson complete
- `GET /api/progress/course/:courseId` - Get course progress

### Certificates
- `GET /api/certificates` - Get user certificates
- `POST /api/certificates/generate/:courseId` - Generate certificate
- `GET /api/certificates/verify/:certificateId` - Verify certificate

### Roadmap Progress
- `GET /api/roadmap-progress/:roadmapId` - Get roadmap progress
- `POST /api/roadmap-progress/problem/complete` - Mark problem complete

### Code Submissions
- `POST /api/submissions` - Submit code for problem
- `GET /api/submissions/problem/:problemId` - Get submissions for problem

---

## 📊 Current Database Content

### Courses (1 course)
- **DSA Course**: "Data Structures & Algorithms Mastery"
  - ID: `691ecb7a6ee4a56d59c403a9`
  - Price: FREE (₹0)
  - Sections: 3 (Basic, Medium, Advanced)
  - Lessons: 15 total (video lessons)

### Roadmaps (1 roadmap)
- **DSA Roadmap**: "Complete DSA Roadmap"
  - ID: `691ccdbc02fb072a93942a0d`
  - Sections: 4 (Basic, Medium, Advanced, Expert)
  - Problems: 150+ coding problems
  - Linked to: DSA Course

### Test User
- **Email**: gourishanker0408@gmail.com
- **Password**: 123456789
- **Status**: Enrolled in DSA course (100% complete for testing)

---

## 🎯 Routing Configuration

### Frontend Routes (Hash-based routing)
```typescript
/ or #/                           → HomePage
#/auth                            → AuthPageNew
#/courses                         → CoursesPage
#/course/:id                      → CourseDetailsPage
#/dsa-course                      → DSACourseLandingPage
#/dsa-roadmap                     → DSARoadmapPage
#/learn/:courseId                 → LearningPage (protected)
#/problem/:problemId              → ProblemEditorPage
#/dashboard                       → StudentDashboard (protected)
#/admin                           → AdminDashboard (protected, admin only)
#/profile                         → ProfilePage (protected)
#/cart                            → CartPage
#/checkout                        → CheckoutPage (protected)
#/wishlist                        → WishlistPage (protected)
#/certificates                    → CertificatesPage (protected)
#/certificate/verify/:id          → CertificateVerificationPage
#/about                           → AboutPage
#/blog                            → BlogPage
#/become-instructor               → BecomeInstructorPage
#/help                            → HelpCenterPage
#/faq                             → FAQPage
#/privacy-policy                  → PrivacyPolicyPage
#/terms-conditions                → TermsConditionsPage
#/refund-policy                   → RefundPolicyPage
```

---

## 🚀 Running the Project

### Development Setup

**1. Start MongoDB**
```bash
mongod
```

**2. Start Backend Server**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

**3. Start Frontend**
```bash
cd elite-digital-academy
npm install
npm run dev
# App runs on http://localhost:5174
```

### Important Notes
- Frontend runs on port **5174** (not 5173)
- Backend runs on port **5000**
- Database: `mongodb://localhost:27017/elite-digital-academy`

---

## 📝 Recent Updates

### Latest Changes
1. ✅ Removed all fake/hardcoded courses from homepage
2. ✅ Implemented dynamic course fetching from API
3. ✅ Fixed DSA course redirect to landing page
4. ✅ Updated CourseDetailsPage to fetch real data
5. ✅ Fixed array validation to prevent TypeError

### Known Issues
- Both servers need restart (currently exit code 1)
- Multiple node processes may be running (cleanup needed)

---

## 📦 Dependencies

### Frontend Main Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-redux": "^9.0.0",
  "@reduxjs/toolkit": "^2.0.0",
  "axios": "^1.6.0",
  "framer-motion": "^10.0.0",
  "react-icons": "^4.12.0",
  "tailwindcss": "^3.4.0"
}
```

### Backend Main Dependencies
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.0.0",
  "razorpay": "^2.9.0",
  "cors": "^2.8.5"
}
```

---

## 🎓 Feature Highlights

### For Students
- 📚 Browse courses with advanced filtering
- 🎥 Watch video lessons with progress tracking
- 💻 Solve DSA problems in interactive code editor
- 📝 Take notes during lessons
- 🔖 Bookmark important lessons
- 📊 Track learning progress
- 🏆 Earn certificates on completion
- 💬 Participate in discussions

### For Admins
- 👥 Manage users and enrollments
- 📖 Create and update courses
- 🗺️ Manage DSA roadmaps
- 📈 View analytics and reports
- ✅ Moderate discussions and reviews

### Technical Features
- 🔐 Secure JWT authentication
- 💳 Razorpay payment integration
- 📱 Responsive design (mobile-first)
- 🌙 Dark mode support
- ⚡ Fast performance with Vite
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time progress updates
- 🎯 Hash-based routing (SPA)

---

## 📞 Support & Documentation

- **Deployment Guide**: `backend/DEPLOYMENT.md`
- **Theme System**: `THEME_SYSTEM.md`
- **Main README**: `README.md`

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
