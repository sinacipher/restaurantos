import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireTenant } from '../../middleware/require-tenant.js';
import { generateUploadSignature } from '../../providers/cloudinary.js';

export const uploadsRouter = Router();

uploadsRouter.post('/signature', requireAuth, requireTenant, (req, res, next) => {
  try {
    // Enforce folder isolation per restaurant
    const folder = `restaurantos/${req.tenant!.restaurantId}`;
    const signatureData = generateUploadSignature(folder);
    res.json({ data: signatureData });
  } catch (err) {
    next(err);
  }
});