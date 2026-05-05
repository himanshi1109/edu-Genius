# 🎓 EduGenius — AI-Powered Learning Management System

![EduGenius Banner](https://img.shields.io/badge/EduGenius-AI--Powered%20LMS-285A48?style=for-the-badge&logo=google-gemini&logoColor=B0E4CC)
![Version](https://img.shields.io/badge/version-1.0.0-468A73?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-B0E4CC?style=for-the-badge)

**EduGenius** is a sophisticated, premium Learning Management System (LMS) that leverages Artificial Intelligence to create a personalized and interactive educational experience. From automated quiz generation to smart progress tracking, EduGenius is designed for the modern learner.

---

## ✨ Features

### 🤖 AI-Driven Intelligence
- **Dynamic Quiz Generation**: Automatically generate challenging quizzes based on lesson content using Google Gemini.
- **Smart Flashcards**: AI-curated flashcards for efficient active recall and spaced repetition.
- **Automated Summaries**: Get the gist of complex lessons instantly.

### 👨‍🎓 Student Experience
- **Interactive Workspace**: A clean, distraction-free environment for deep learning.
- **Skill Mastery Dashboard**: Real-time progress bars and "Learning Stats" to keep you motivated.
- **Achievement System**: Earn verified certificates upon course completion.

### 👨‍🏫 Instructor & Admin Tools
- **Intuitive Course Builder**: Seamlessly create courses, modules, and lessons.
- **Platform Oversight**: Advanced administrative dashboard for user and course management.
- **Content Approval**: Robust workflow for maintaining high educational standards.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI Engine** | Google Gemini API |
| **Media** | Cloudinary Integration |
| **Styling** | Custom Glassmorphism & Emerald Theme |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Google Gemini API Key
- Cloudinary Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/edu-genius.git
   cd edu-genius
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=8080
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

---

## 📂 Project Structure

```text
edu-Genius/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI & Layout
│   │   ├── pages/         # Role-based dashboards (Admin, Instructor, Student)
│   │   ├── store/         # Redux state management
│   │   └── services/      # API abstraction layer
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Mongoose Schemas
│   │   └── routes/        # API Endpoints
└── uploads/               # Local fallback for media
```

---

## 🎨 Design Philosophy

EduGenius follows a **Cinematic Dark Emerald** aesthetic, utilizing:
- **Glassmorphism**: Subtle transparency and blur effects for depth.
- **Glow Borders**: Dynamic, animated borders that react to user interaction.
- **3D Elements**: Interactive Three.js components (like the Geodesic Floating Orb) for a premium feel.

---

## 📄 License

This project is licensed under the **ISC License**.

---

Developed with ❤️ by **Himanshi Khatri**
