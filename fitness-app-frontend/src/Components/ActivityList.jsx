import { Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

const ActivityList = ({ activities }) => {
  const navigate = useNavigate();

  if (!activities || activities.length === 0) {
    return <Typography sx={{ mt: 2, textAlign: 'center' }}>No activities yet</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {activities.map((activity) => (
        <Grid
          key={activity.id || Date.now()}
          item
          xs={12}
          sm={6}
          md={4}
        >
          <Card
            sx={{ cursor: 'pointer', height: '100%' }}
            onClick={() => navigate(`/activities/${activity.id}` )}
          >
            <CardContent>
              <Typography variant="h6">{activity.type}</Typography>
              <Typography>Duration: {activity.duration} min</Typography>
              <Typography>Calories: {activity.caloriesBurned}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ActivityList;
