import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(3, { message: 'שם משתמש חייב להכיל לפחות 3 תווים' })
    .nonempty('שם משתמש הוא שדה חובה'),
  password: z.string()
    .min(6, { message: 'סיסמה חייבת להכיל לפחות 6 תווים' })
    .nonempty('סיסמה היא שדה חובה'),
  confirmPassword: z.string()
    .nonempty('אימות סיסמה הוא שדה חובה'),
  name: z.string()
    .nonempty('שם מלא הוא שדה חובה'),
  email: z.string()
    .email({ message: 'כתובת אימייל לא תקינה' })
    .optional() // אימייל אינו שדה חובה בטופס שלך
    .or(z.literal('')), // מאפשר גם מחרוזת ריקה אם השדה לא חובה
  phone: z.string().optional().or(z.literal('')), // טלפון אינו שדה חובה
  birthDate: z.string()
    .nonempty('תאריך לידה הוא שדה חובה'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'הסיסמאות לא תואמות',
  path: ['confirmPassword'], // ה-path של השגיאה יהיה על שדה confirmPassword
});

export type RegisterFormData = z.infer<typeof registerSchema>;