import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      } else {
        res.status(400).json({ message: 'Invalid request data' });
      }
    }
  };
};
