import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Alert,
} from "@mui/material";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role: "user",
      });
      alert("Account created! Please login.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already registered. Please login."
          : err.message
      );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, margin: "auto", mt: 6 }}>
      <Typography variant="h5" mb={3}>
        Sign Up
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSignup} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{ minLength: 6 }}
          required
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          sx={{ mt: 3 }}
          size="large"
        >
          Create Account
        </Button>
      </Box>
    </Paper>
  );
}
