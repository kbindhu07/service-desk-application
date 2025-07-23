import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Alert,
} from "@mui/material";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin?.();
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, margin: "auto", mt: 6 }}>
      <Typography variant="h5" mb={3}>
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleLogin} noValidate>
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
          required
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          sx={{ mt: 3 }}
          size="large"
        >
          Login
        </Button>
      </Box>
    </Paper>
  );
}
