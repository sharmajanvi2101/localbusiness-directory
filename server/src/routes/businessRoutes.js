import express from 'express';
import {
    getBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    verifyBusiness,
    deleteBusiness,
    getBusinessesInRadius
} from '../controllers/businessController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// IMPORTANT: /near must be defined BEFORE /:id to avoid being matched as an ID
router.get('/near', getBusinessesInRadius);

router
    .route('/')
    .get(getBusinesses)
    .post(protect, authorize('owner', 'admin'), createBusiness);

router
    .route('/:id')
    .get(getBusinessById)
    .put(protect, authorize('owner', 'admin'), updateBusiness)
    .delete(protect, authorize('owner', 'admin'), deleteBusiness);

router.put('/:id/verify', protect, authorize('admin', 'subadmin'), verifyBusiness);

export default router;
