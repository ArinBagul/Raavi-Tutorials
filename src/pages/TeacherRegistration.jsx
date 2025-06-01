import React, { useState } from "react";
// import bcrypt from "bcryptjs";
import supabase from "../utils/supabase";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  InputLabel,
  FormControl,
  OutlinedInput,
} from '@mui/material';
import { FileCopy } from '@mui/icons-material';


function RegistrationTeacher() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    address: "",
    parents_name: "",
    qualification: "",
    experience: "",
    subjects: [],
    time_and_days: "",
    resume: null,
    certificate: null,
    passport_photo: null,
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prevData) => ({
        ...prevData,
        [name]: file, // Store the first selected file
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const timestamp = Date.now(); // Declare early so it's usable later

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    const subjectsArray = formData.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter((subject) => subject.length > 0);

    try {
      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password, // Use raw password
        });

      if (signUpError) {
        console.error("Error during registration:", signUpError);
        alert("Failed to register user.");
        return;
      }

      console.log("User registered:", signUpData);

      // Step 2: Upload documents
      const { name: photoName } = formData.passport_photo;
      const photoExt = photoName.split(".").pop();

      const { data: resumeData, error: resumeError } = await supabase.storage
        .from("documents")
        .upload(`teacher_docs/resume_${timestamp}.pdf`, formData.resume);

      if (resumeError) throw resumeError;

      const { data: certData, error: certError } = await supabase.storage
        .from("documents")
        .upload(
          `teacher_docs/certificate_${timestamp}.pdf`,
          formData.certificate
        );

      if (certError) throw certError;

      const { data: photoData, error: photoError } = await supabase.storage
        .from("documents")
        .upload(
          `teacher_docs/passport_photo_${timestamp}.${photoExt}`,
          formData.passport_photo
        );

      if (photoError) throw photoError;

      // Step 3: Get public URLs
      const resumeUrl = supabase.storage
        .from("documents")
        .getPublicUrl(`teacher_docs/resume_${timestamp}.pdf`).data.publicUrl;

      const certUrl = supabase.storage
        .from("documents")
        .getPublicUrl(`teacher_docs/certificate_${timestamp}.pdf`)
        .data.publicUrl;

      const photoUrl = supabase.storage
        .from("documents")
        .getPublicUrl(`teacher_docs/passport_photo_${timestamp}.${photoExt}`)
        .data.publicUrl;

      // console.log("Uploaded files:", {
      //   resumeUrl,
      //   certUrl,
      //   photoUrl,
      // });

      // Step 4: Insert into teacher table
      const { data, error } = await supabase
        .from("teacher")
        .insert([
          {
            name: formData.name,
            parents_name: formData.parents_name,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            qualification: formData.qualification,
            experience: formData.experience,
            subjects: subjectsArray,
            time_and_days: formData.time_and_days,
            resume: resumeUrl,
            certificate: certUrl,
            passport_photo: photoUrl,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        alert("User registered but failed to save details.");
        return;
      }
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        phone: "",
        address: "",
        parents_name: "",
        qualification: "",
        experience: "",
        subjects: "",
        time_and_days: "",
        resume: null,
        certificate: null,
        passport_photo: null,
      });

      alert("Registration complete!");
      setLoading(false);
      console.log("Teacher record inserted:", data);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const fields = [
    { id: "name", label: "Full Name" },
    { id: "parents_name", label: "Parents Name" },
    { id: "username", label: "Username" },
    { id: "email", label: "Email", type: "email" },
    { id: "phone", label: "Phone", type: "tel" },
    { id: "password", label: "Password", type: "password" },
    { id: "confirm_password", label: "Confirm Password", type: "password" },
    { id: "address", label: "Address" },
    { id: "qualification", label: "Qualification" },
    { id: "experience", label: "Experience in years", type: "number" },
    { id: "subjects", label: "Comfortable Subjects (Comma separated)" },
    { id: "time_and_days", label: "Suitable time and days" },
  ];

  const files = [
    { id: "resume", label: "Resume (PDF)", accept: "application/pdf" },
    { id: "certificate", label: "Certificate (PDF)", accept: "application/pdf" },
    { id: "passport_photo", label: "Passport Photo (PNG/JPG/JPEG)", accept: "image/png, image/jpeg" },
  ];


  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#002661" gutterBottom>
          Tutor's Registration
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome to the tutor's registration page. Please fill out the form below to register as a tutor.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {fields.map(({ id, label, type = "text" }) => (
              <Grid item xs={12} sm={6} key={id}>
                <TextField
                  label={label}
                  type={type}
                  name={id}
                  id={id}
                  required
                  value={formData[id]}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused': {
                      '& fieldset': { borderColor: '#E20188' },
                    },
                    '& label.Mui-focused': { color: '#E20188' },
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="#002661"
                fontWeight="600"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
              >
                <FileCopy sx={{ color: '#E20188' }} />
                Required Documents
              </Typography>
            </Grid>

            {files.map(({ id, label, accept }) => (
              <Grid item xs={12} sm={6} key={id}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel shrink htmlFor={id}>
                    {label}
                  </InputLabel>
                  <OutlinedInput
                    id={id}
                    name={id}
                    type="file"
                    inputProps={{ accept }}
                    onChange={handleChange}
                    notched
                    label={label}
                  />
                </FormControl>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#E20188',
                  '&:hover': { backgroundColor: '#c90074' },
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: 2,
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default RegistrationTeacher;
