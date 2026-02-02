import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Card, CardContent, Typography, Stack } from '@mui/material';
import React, { useState } from 'react';
import { addActivity } from '../services/api';

const ActivityForm = ({ onActivityAdded }) => {
  const [activity, setActivity] = useState({
    type: "RUNNING",
    duration: '',
    caloriesBurned: '',
    additionalMetrics: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...activity,
        type: activity.type === "OTHER" ? "OTHER" : activity.type
      };

      const addedActivity = await addActivity(payload);

      const fullActivity = {
        id: addedActivity.data.id || Date.now(),
        type: addedActivity.data.type,
        duration: addedActivity.data.duration || activity.duration,
        caloriesBurned: addedActivity.data.caloriesBurned || activity.caloriesBurned,
        additionalMetrics: addedActivity.data.additionalMetrics || {}
      };

      onActivityAdded(fullActivity);

      // Reset form
      setActivity({ type: "RUNNING", duration: '', caloriesBurned: '', additionalMetrics: {} });

    } catch (error) {
      console.error(error);
    }
  };

  const isFormValid = activity.duration && activity.caloriesBurned;

  return (
    <Card sx={{ mb: 4, p: 2, maxWidth: 500, mx: 'auto', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add a New Activity
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={activity.type}
                onChange={(e) => setActivity({ ...activity, type: e.target.value })}
              >
                <MenuItem value="RUNNING">Running</MenuItem>
                <MenuItem value="WALKING">Walking</MenuItem>
                <MenuItem value="CYCLING">Cycling</MenuItem>
                <MenuItem value="SWIMMING">Swimming</MenuItem>
                <MenuItem value="YOGA">Yoga</MenuItem>
                <MenuItem value="HIIT">HIIT</MenuItem>
                <MenuItem value="CARDIO">Cardio</MenuItem>
                <MenuItem value="STRETCHING">Stretching</MenuItem>
                <MenuItem value="WEIGHT_TRAINING">Weight Training</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Duration (Minutes)"
              type="number"
              value={activity.duration}
              onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
            />

            <TextField
              fullWidth
              label="Calories Burned"
              type="number"
              value={activity.caloriesBurned}
              onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isFormValid}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              Add Activity
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;
