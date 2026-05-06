import express from 'express';
import {
  requestCertificate,
  getMyCertificates,
  getInstructorCertificates,
  updateCertificateStatus,
  getCertificateById,
} from '../controllers/certificateController.js';

import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student routes
router.post('/request/:courseId', protect, requestCertificate);
router.get('/my', protect, getMyCertificates);
router.get('/:id', protect, getCertificateById);


// Instructor routes
router.get(
  '/instructor/pending',
  protect,
  authorize('instructor', 'admin'),
  getInstructorCertificates
);
router.patch(
  '/status/:id',
  protect,
  authorize('instructor', 'admin'),
  updateCertificateStatus
);

export default router;
