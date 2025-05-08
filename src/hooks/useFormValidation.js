import { useState, useCallback } from 'react';
import * as Yup from 'yup';

export const commonValidations = {
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, dots and underscores')
    .required('Username is required'),
  
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),
  
  aadhaar: Yup.string()
    .matches(/^\d{12}$/, 'Aadhaar number must be 12 digits')
    .required('Aadhaar number is required'),
};

export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback(async (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    try {
      // Validate single field
      await validationSchema.validateAt(name, values);
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err.name === 'ValidationError') {
        setErrors(prev => ({ ...prev, [name]: err.message }));
      }
    }
  }, [values, validationSchema]);

  const validateField = useCallback(async (name) => {
    try {
      await validationSchema.validateAt(name, values);
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return true;
    } catch (err) {
      if (err.name === 'ValidationError') {
        setErrors(prev => ({ ...prev, [name]: err.message }));
      }
      return false;
    }
  }, [values, validationSchema]);

  const validateForm = useCallback(async () => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldTouched,
    isValid: Object.keys(errors).length === 0,
  };
};