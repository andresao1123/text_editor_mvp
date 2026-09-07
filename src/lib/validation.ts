import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title is too long'),
  contentHtml: z.string().optional().default('<p></p>'),
  plainText: z.string().optional().default(''),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title is too long').optional(),
  contentHtml: z.string().optional(),
  plainText: z.string().optional(),
});

export const shareDocumentSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['viewer', 'editor'], {
    errorMap: () => ({ message: "Role must be 'viewer' or 'editor'" }),
  }),
}).refine((data) => data.userId || data.email, {
  message: 'Either userId or email must be provided',
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
});
