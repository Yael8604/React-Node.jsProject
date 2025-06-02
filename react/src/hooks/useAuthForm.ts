// src/hooks/useAuthForm.ts
import { useState } from 'react';

// סוג כללי לנתוני טופס, מאפשר גמישות לכל טופס
type FormData = {
  [key: string]: string;
};

// סוג כללי לשגיאות טופס, מאפשר גמישות לכל טופס
type FormErrors<T extends FormData> = {
  [K in keyof T]?: string;
};

// סוג פונקציית ולידציה
type Validator<T extends FormData> = (formData: T) => FormErrors<T>;

// סוג פונקציית הגשת טופס (שליחה לשרת)
type SubmitHandler<T extends FormData> = (formData: T) => Promise<any>;

interface UseAuthFormProps<T extends FormData> {
  initialData: T;
  validator: Validator<T>;
  submitHandler: SubmitHandler<T>;
  onSuccess: (data: any) => void;
  onFailure: (error: string) => void;
}

function useAuthForm<T extends FormData>({
  initialData,
  validator,
  submitHandler,
  onSuccess,
  onFailure,
}: UseAuthFormProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the specific field when user starts typing
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validator(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Stop if there are validation errors
    }

    setIsLoading(true);
    try {
      const data = await submitHandler(formData);
      onSuccess(data);
    } catch (error: any) {
      const errorMessage = error.message || 'שגיאה כללית';
      onFailure(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
}

export default useAuthForm;