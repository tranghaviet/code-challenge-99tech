import { z } from 'zod';

export const ResourceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
});
export const ResourceUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
});

export type Resource = {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
} & z.infer<typeof ResourceSchema>; // Combine with Zod schema
