import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button, Container, Typography } from "@mui/material";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import UserDashboard from "./Components/Dashboard";
import AdminPanel from "./Components/AdminPanel";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setRole(userDoc.exists() ? userDoc.data().role : "user");
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Typography textAlign="center">Loading...</Typography>;

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        {showSignup ? (
          <>
            <Signup />
            <Typography textAlign="center" mt={2}>
              Already have an account?{" "}
              <Button onClick={() => setShowSignup(false)}>Login here</Button>
            </Typography>
          </>
        ) : (
          <>
            <Login onLogin={() => {}} />
            <Typography textAlign="center" mt={2}>
              Don't have an account?{" "}
              <Button onClick={() => setShowSignup(true)}>Sign Up</Button>
            </Typography>
          </>
        )}
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.email}
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mb: 3 }}
          onClick={() => signOut(auth)}
        >
          Logout
        </Button>

        {role === "admin" ? (
          <AdminPanel user={user} />
        ) : (
          <UserDashboard user={user} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
