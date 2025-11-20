# DoFlow Academy - Premium Learning Management System

A modern, feature-rich online learning platform built with React, TypeScript, and Node.js.

## ✨ Features

### 🎓 Course Management
- Browse and filter courses by category, level, and rating
- Detailed course pages with preview videos
- Module-based curriculum with lesson tracking
- Real-time progress tracking

### 💳 Payment Integration
- Razorpay integration for secure payments
- Support for credit/debit cards, UPI, net banking
- Automatic enrollment after successful payment
- Payment history tracking

### 🏆 Certificates
- Automatic certificate generation on course completion (100% progress)
- Professional certificate template with QR codes
- PDF download functionality
- Public certificate verification
- Share to LinkedIn and WhatsApp

### 👤 User Features
- User authentication with JWT
- Student dashboard with course progress
- Personalized recommendations
- Bookmarks and notes
- Course reviews and ratings

### 🎨 UI/UX
- Mobile-first responsive design
- Dark/Light theme support
- Smooth page transitions with Framer Motion
- Modern, minimal design aesthetic
- Animated components and counters

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Razorpay account (for payments)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

3. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Start backend server:
```bash
npm start
```

## 📖 User Flow

### 1. Authentication
- New users sign up with name, email, and password
- Existing users log in with email and password
- JWT tokens stored in localStorage for persistence

### 2. Browse Courses
- View featured DSA course on homepage
- Browse all courses on `/courses` page
- Filter by category, level, and sort by popularity/rating
- Click course card to view details

### 3. Enroll in Course
- **Guest users**: Clicking "Enroll Free" or "Buy Now" redirects to login page
- **Free courses** (price = 0):
  - Clicking "Enroll Free" instantly enrolls user
  - No payment required
  - Immediate access to course content
- **Paid courses**:
  - Clicking "Buy Now" opens Razorpay payment modal
  - Complete payment with preferred method (card/UPI/netbanking)
  - Automatic enrollment on successful payment
- Redirected to dashboard after enrollment

### 4. Learn
- Access enrolled courses from dashboard
- Click "Continue Learning" to open course player
- Watch video lessons and mark as complete
- Take notes and bookmark important lessons
- Track progress percentage

### 5. Certificate
- Certificate automatically available at 100% course completion
- Click "Get Certificate" button in dashboard
- View certificate with unique ID and QR code
- Download as PDF
- Share on LinkedIn or WhatsApp
- Verify certificates at `/certificate-verification`

## 🔒 Authentication Flow

The authentication system uses JWT tokens with localStorage persistence:

1. **Login/Signup**: User submits credentials → Backend validates → Returns JWT token
2. **Token Storage**: Frontend stores token in localStorage
3. **API Requests**: Axios interceptor automatically adds `Authorization: Bearer ${token}` header
4. **Protected Routes**: Backend middleware verifies token before allowing access
5. **Auto Logout**: If token expires (401 response), user is redirected to login

### Why Authentication Was Not Persisting

The issue was that `CourseDetailsPage` was using mock data and didn't check authentication before attempting enrollment. The fixed flow:

1. User clicks "Buy Now"
2. Frontend checks `isAuthenticated` from Redux state
3. If not authenticated → redirects to `/auth`
4. If authenticated → proceeds with Razorpay payment
5. Payment success → verifies with backend → creates enrollment

## 📁 Project Structure

```
elite-digital-academy/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Express app entry
├── pages/               # React page components
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context providers
│   ├── services/        # API service functions
│   ├── store/           # Redux store and slices
│   └── utils/           # Helper functions
└── public/              # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Razorpay** - Payment gateway
- **html2canvas + jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Razorpay SDK** - Payment processing
- **QRCode** - Certificate verification

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Backend (Render)
See `backend/DEPLOYMENT.md` for detailed instructions.

## 📄 License

This project is licensed under the MIT License.

## 👥 Credits

Developed by **Elite Digital Solutions**
