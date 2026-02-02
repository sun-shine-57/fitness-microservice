import { Button, Box, Typography, Card, CardContent, Stack, Grid } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { setCredentials } from "./store/authSlice";
import ActivityForm from "./Components/ActivityForm";
import ActivityList from "./Components/ActivityList";
import ActivityDetail from "./Components/ActivityDetail";
import { getActivities } from "./services/api";

// Combined ActivitiesPage
const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await getActivities();
        setActivities(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, []);

  const handleActivityAdded = (newActivity) => {
    setActivities(prev => [newActivity, ...prev]); 
  };

  return (
    <Box sx={{ p: 2 }}>
      <ActivityForm onActivityAdded={handleActivityAdded} />
      <ActivityList activities={activities} />
    </Box>
  );
};

function AppContent() {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
      localStorage.setItem("token", token); 
    }
  }, [token, tokenData, dispatch]);

  if (!token) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f7fa",
        }}
      >
        <Card sx={{ minWidth: 360, p: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Fitness Tracker 🏃‍♂️
            </Typography>

            <Typography sx={{ mb: 4 }}>
              Track your activities and stay consistent
            </Typography>

            <Stack spacing={2}>
              <Button variant="contained" size="large" onClick={() => logIn()}>
                Login
              </Button>

              <Button
                variant="outlined" size="large" onClick={() => logIn()}>
                Register
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" color="secondary" onClick={logOut}>
        Logout
      </Button>

      <Routes>
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/" element={<Navigate to="/activities" replace />} />
      </Routes>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
