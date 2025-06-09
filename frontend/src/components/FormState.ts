export type FormState<T> = T & {
  dirtyFields?: Set<keyof T>;
  errors?: Partial<Record<keyof T, string>>;
};

export const handleFormChange = <T>(
  key: keyof T,
  value: unknown,
  validateForm: (form: FormState<T>) => Partial<Record<keyof T, string>>,
  setFormState: (value: React.SetStateAction<FormState<T>>) => void,
) => {
  setFormState((prev) => {
    const dirtyFields = new Set(prev.dirtyFields);
    dirtyFields.add(key);

    const updatedVals = {
      ...prev,
      [key]: value,
      dirtyFields,
    };

    const errors = validateForm(updatedVals);
    return {
      ...updatedVals,
      errors: errors,
    };
  });
};
export const getValue = <T>(formState: FormState<T>): T => {
  const { dirtyFields, errors, ...values } = formState;
  return values as T;
};
