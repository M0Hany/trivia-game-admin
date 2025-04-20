import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { getDashboardStats, subscribeToActiveGames } from '../services/firebase';

interface DashboardStats {
  totalGames: number;
  activeGames: number;
  activePlayers: number;
  questionsCreated: number;
  averageScore: number;
  mostPopularCategory: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Subscribe to real-time game updates
    const unsubscribe = subscribeToActiveGames((games) => {
      setStats(prev => prev ? {
        ...prev,
        activeGames: games.length
      } : null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Total Games
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.totalGames || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Active Players
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.activePlayers || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Questions Created
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.questionsCreated || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
          <CardContent>
            <Typography variant="h5" component="div">
              Active Games
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.activeGames || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Most Popular Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats?.mostPopularCategory || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
