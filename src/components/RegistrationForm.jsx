import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useFormValidation } from '../hooks/useFormValidation';
import * as Yup from 'yup';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const phoneRegExp = /^[0-9]{10}$/;

const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Full name is required')
    .min(3, 'Name must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  address: Yup.string()
    .required('Address is required')
    .min(10, 'Please enter complete address'),
});

const studentSchema = registrationSchema.shape({
  grade: Yup.string().required('Grade is required'),
  school: Yup.string().required('School name is required'),
  parentName: Yup.string().required('Parent/Guardian name is required'),
  parentPhone: Yup.string()
    .matches(phoneRegExp, 'Phone number must be 10 digits')
    .required('Parent/Guardian phone is required'),
});

const teacherSchema = registrationSchema.shape({
  qualification: Yup.string().required('Qualification is required'),
  experience: Yup.number()
    .required('Years of experience is required')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Please enter valid years of experience'),
  subjects: Yup.string().required('Subjects are required'),
});

const grades = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  '11th - Science', '11th - Commerce', '11th - Arts',
  '12th - Science', '12th - Commerce', '12th - Arts',
];

export function RegistrationForm({
  type,
  onSubmit,
  loading,
  error,
  requiredDocuments = [],
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [documents, setDocuments] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const schema = type === 'student' ? studentSchema : teacherSchema;
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    ...(type === 'student' ? {
      grade: '',
      school: '',
      parentName: '',
      parentPhone: '',
    } : {
      qualification: '',
      experience: '',
      subjects: '',
    }),
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    setFieldValue,
  } = useFormValidation(initialValues, schema);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (isValid) {
      const formData = {
        ...values,
        documents,
        type,
      };
      onSubmit(formData);
    }
  };

  const handleFileUpload = async (fieldName, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Start progress indicator
    setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

    try {
      // Store file object to be uploaded later during form submission
      setDocuments(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Simulate upload progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min((prev[fieldName] || 0) + 10, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
          }
          return { ...prev, [fieldName]: newProgress };
        });
      }, 100);

    } catch (error) {
      console.error('File selection error:', error);
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography component="h1" variant="h5" gutterBottom align="center">
          {type === 'student' ? 'Student Registration' : 'Teacher Registration'}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }} align="center">
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />
            </Grid>

            {type === 'student' ? (
              // Student-specific fields
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Grade"
                    name="grade"
                    value={values.grade}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.grade && Boolean(errors.grade)}
                    helperText={touched.grade && errors.grade}
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="School Name"
                    name="school"
                    value={values.school}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.school && Boolean(errors.school)}
                    helperText={touched.school && errors.school}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Name"
                    name="parentName"
                    value={values.parentName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.parentName && Boolean(errors.parentName)}
                    helperText={touched.parentName && errors.parentName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Phone"
                    name="parentPhone"
                    value={values.parentPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.parentPhone && Boolean(errors.parentPhone)}
                    helperText={touched.parentPhone && errors.parentPhone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Board"
                    name="board" 
                  />
                  </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject" 
                  />
                  </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Suitable Time and Days"
                    name="suitableTimeDays" 
                  />
                  </Grid>
              </>
            ) : (
              // Teacher-specific fields
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={values.qualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.qualification && Boolean(errors.qualification)}
                    helperText={touched.qualification && errors.qualification}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={values.experience}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.experience && Boolean(errors.experience)}
                    helperText={touched.experience && errors.experience}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subjects (comma-separated)"
                    name="subjects"
                    value={values.subjects}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.subjects && Boolean(errors.subjects)}
                    helperText={touched.subjects && errors.subjects}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parents Name"
                    name="parentsName" 
                  />
                  </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Suitable Time and Days"
                    name="suitableTimeDays" 
                  />
                  </Grid>
              </>
            )}

            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Required Documents
              </Typography>
              <Grid container spacing={2}>
                {type === 'student' ? (
                  // Student document - Only Passport Photo
                  <Grid item xs={12} sm={6}>
                    <Button
                      component="label"
                      variant="outlined"
                      color="primary"
                      startIcon={<PhotoCameraIcon />}
                      sx={{ 
                        width: '100%', 
                        height: '56px',
                        borderWidth: '2px',
                        borderStyle: 'dashed'
                      }}
                    >
                      {documents.photo ? 'Photo Uploaded' : 'Upload Passport Size Photo *'}
                      <input
                        type="file"
                        hidden
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('photo', e)}
                      />
                    </Button>
                    {uploadProgress.photo && (
                      <Box sx={{ position: 'relative', mt: 1, display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={uploadProgress.photo}
                          size={24}
                          color="success"
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {uploadProgress.photo === 100 ? 'Upload Complete' : `${uploadProgress.photo}%`}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Please upload a recent passport-sized photograph with a plain background.
                    </Typography>
                  </Grid>
                ) : (
                  // Teacher documents
                  <>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ width: '100%', height: '56px' }}
                      >
                        {documents.resume ? 'Resume Uploaded' : 'Upload Resume'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('resume', e)}
                        />
                      </Button>
                      {uploadProgress.resume && (
                        <Box sx={{ position: 'relative', mt: 1 }}>
                          <CircularProgress
                            variant="determinate"
                            value={uploadProgress.resume}
                            size={24}
                          />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            {uploadProgress.resume}%
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ width: '100%', height: '56px' }}
                      >
                        {documents.certificates ? 'Certificates Uploaded' : 'Upload Certificates'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('certificates', e)}
                        />
                      </Button>
                      {uploadProgress.certificates && (
                        <Box sx={{ position: 'relative', mt: 1 }}>
                          <CircularProgress
                            variant="determinate"
                            value={uploadProgress.certificates}
                            size={24}
                          />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            {uploadProgress.certificates}%
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        sx={{ width: '100%', height: '56px' }}
                      >
                        {documents.photo ? 'Photo Uploaded' : 'Upload Passport Photo'}
                        <input
                          type="file"
                          hidden
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('photo', e)}
                        />
                      </Button>
                      {uploadProgress.photo && (
                        <Box sx={{ position: 'relative', mt: 1 }}>
                          <CircularProgress
                            variant="determinate"
                            value={uploadProgress.photo}
                            size={24}
                          />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            {uploadProgress.photo}%
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || (type === 'student' && !documents.photo)}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
              {type === 'student' && !documents.photo && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  Please upload a passport size photograph to continue
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                Already have an account?{' '}
                <Button
                  component={RouterLink}
                  to={type === 'student' ? '/student-login' : '/teacher-login'}
                  color="primary"
                >
                  Sign In
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}