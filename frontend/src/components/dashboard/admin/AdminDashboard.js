import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People,
  Store,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { dashboardService } from '../../../services/apiService';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getAdminDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboardData?.statistics?.totalUsers || 0}
            icon={<People fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stores"
            value={dashboardData?.statistics?.totalStores || 0}
            icon={<Store fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Ratings"
            value={dashboardData?.statistics?.totalRatings || 0}
            icon={<Star fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Rating"
            value={dashboardData?.topRatedStores?.length > 0 
              ? (dashboardData.topRatedStores.reduce((sum, store) => sum + parseFloat(store.averageRating), 0) / dashboardData.topRatedStores.length).toFixed(1)
              : '0.0'
            }
            icon={<TrendingUp fontSize="large" />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Management Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="User Management" />
            <Tab label="Store Management" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>
        
        <CardContent>
          {tabValue === 0 && <UserManagement />}
          {tabValue === 1 && <StoreManagement />}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Analytics
              </Typography>
              
              {/* User Distribution */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  User Distribution by Role
                </Typography>
                {dashboardData?.userDistribution?.map((item) => (
                  <Box key={item.role} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography>{item.role}:</Typography>
                    <Typography fontWeight="bold">{item.count}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Top Rated Stores */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Top Rated Stores
                </Typography>
                {dashboardData?.topRatedStores?.map((store, index) => (
                  <Box key={store.id} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography>
                      {index + 1}. {store.name}
                    </Typography>
                    <Typography fontWeight="bold">
                      {store.averageRating} ⭐ ({store.totalRatings} ratings)
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Recent Activity */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Ratings
                </Typography>
                {dashboardData?.recentActivity?.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>{activity.userName}</strong> rated <strong>{activity.storeName}</strong> 
                      {' '}{activity.ratingValue} stars
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
