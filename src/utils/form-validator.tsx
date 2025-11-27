import { z } from "zod";

export const validateFormData = (
  schema: z.ZodSchema<any>,
  data: any,
): { isValid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formErrors: Record<string, string> = {};

      error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!formErrors[field]) {
          formErrors[field] = issue.message;
        }
      });

      return { isValid: false, errors: formErrors };
    }
    return { isValid: false, errors: {} };
  }
};
