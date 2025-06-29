import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .nonempty('שם משתמש הוא שדה חובה'),
  password: z.string()
    .nonempty('סיסמה היא שדה חובה'),
});

export type LoginFormData = z.infer<typeof loginSchema>;