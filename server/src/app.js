import express from 'express';
import cors from 'cors';
import path from 'path';

// Import cloudinary config (side-effect: configures cloudinary)
import './config/cloudinary.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Body parser & CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads (for local development fallback)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// ── Static File Serving & SPA Routing ──
const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Health check for development
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'EduGenius API is running (Development Mode)' });
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
