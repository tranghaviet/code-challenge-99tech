import express from 'express';
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from '../controllers/resourceController';
import { validateRequest } from '../middlewares/validateRequest';
import { ResourceSchema, ResourceUpdateSchema } from '../models/Resource';

const router = express.Router();

// Create a new resource
router.post('/', validateRequest(ResourceSchema), createResource);

// Get all resources (with optional filtering)
router.get('/', getAllResources);

// Get a specific resource by ID
router.get('/:id', getResourceById);

// Update a resource by ID
router.put('/:id', validateRequest(ResourceUpdateSchema), updateResource);

// Delete a resource by ID
router.delete('/:id', deleteResource);

export default router;
