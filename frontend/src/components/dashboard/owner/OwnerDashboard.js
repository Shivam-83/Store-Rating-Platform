import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Star,
  TrendingUp,
  People,
  Assessment
} from '@mui/icons-material';
import { dashboardService } from '../../../services/apiService';
import PasswordUpdate from '../common/PasswordUpdate';

const OwnerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (tabValue === 0) {
      fetchDashboardData();
    }
  }, [tabValue]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getOwnerDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  if (loading && tabValue === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Store Owner Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Store Analytics" />
            <Tab label="Account Settings" />
          </Tabs>
        </Box>
        
        <CardContent>
          {tabValue === 0 && dashboardData && (
            <Box>
              {/* Store Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Store Information
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {dashboardData.store.name}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {dashboardData.store.address || 'No address provided'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Store since: {new Date(dashboardData.store.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Average Rating"
                    value={`${dashboardData.statistics.averageRating} ⭐`}
                    subtitle={`Based on ${dashboardData.statistics.totalRatings} reviews`}
                    icon={<Star fontSize="large" />}
                    color="primary.main"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Total Reviews"
                    value={dashboardData.statistics.totalRatings}
                    icon={<People fontSize="large" />}
                    color="success.main"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Rating Trend"
                    value={dashboardData.statistics.averageRating >= 3.5 ? "Positive" : "Needs Improvement"}
                    icon={<TrendingUp fontSize="large" />}
                    color={dashboardData.statistics.averageRating >= 3.5 ? "success.main" : "warning.main"}
                  />
                </Grid>
              </Grid>

              {/* Rating Distribution */}
              {dashboardData.ratingDistribution.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Rating Distribution
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const distribution = dashboardData.ratingDistribution.find(d => d.rating === rating);
                          const count = distribution ? distribution.count : 0;
                          const percentage = dashboardData.statistics.totalRatings > 0 
                            ? ((count / dashboardData.statistics.totalRatings) * 100).toFixed(1)
                            : 0;
                          
                          return (
                            <Grid item xs={12} key={rating}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="body2" sx={{ minWidth: '60px' }}>
                                  {rating} Star{rating !== 1 ? 's' : ''}
                                </Typography>
                                <Box 
                                  sx={{ 
                                    flexGrow: 1, 
                                    height: 8, 
                                    bgcolor: 'grey.200', 
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${percentage}%`,
                                      bgcolor: getRatingColor(rating) + '.main',
                                      transition: 'width 0.3s ease'
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ minWidth: '80px' }}>
                                  {count} ({percentage}%)
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Customer Reviews */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Customer Reviews
                </Typography>
                {dashboardData.raters.length === 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" color="textSecondary" textAlign="center">
                        No reviews yet. Encourage customers to rate your store!
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.raters.map((rater) => (
                          <TableRow key={rater.userId}>
                            <TableCell>{rater.name}</TableCell>
                            <TableCell>{rater.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${rater.ratingValue} ⭐`}
                                color={getRatingColor(rater.ratingValue)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(rater.ratedAt).toLocaleDateString()}
                              {rater.updatedAt !== rater.ratedAt && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  Updated: {new Date(rater.updatedAt).toLocaleDateString()}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          )}
          
          {tabValue === 1 && (
            <PasswordUpdate 
              onSuccess={() => setSuccess('Password updated successfully!')}
              onError={setError}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerDashboard;
