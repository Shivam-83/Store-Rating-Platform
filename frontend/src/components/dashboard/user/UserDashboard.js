import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Avatar,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Store as StoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/apiService';
import StoreCard from '../../common/StoreCard';
import StoreList from './StoreList';
import PasswordUpdate from '../common/PasswordUpdate';

const UserDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalStores, setTotalStores] = useState(0);
  
  // Search and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Rating dialog
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: 1,
        limit: 50,
        name: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder.toUpperCase()
      };
      
      const response = await api.get('/stores', { params });
      setStores(response.data.stores);
      setTotalStores(response.data.pagination.totalStores);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleRatingUpdate = () => {
    setSuccess('Rating updated successfully!');
    fetchStores(); // Refresh the stores list
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setRating(store.userRating || 0);
    setReview('');
    setRatingDialogOpen(true);
  };

  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
    setSelectedStore(null);
    setRating(0);
    setReview('');
  };

  const handleSubmitRating = async () => {
    try {
      await api.post(`/ratings/${selectedStore.id}`, {
        rating_value: rating
      });
      setSuccess('Rating submitted successfully!');
      handleCloseRatingDialog();
      fetchStores();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
          Discover Amazing Stores
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Find, rate, and review your favorite local businesses
        </Typography>
        
        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <StoreIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stores.length}
                </Typography>
                <Typography variant="body2">
                  Stores Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <StarIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stores.reduce((sum, store) => sum + (store.totalRatings || 0), 0)}
                </Typography>
                <Typography variant="body2">
                  Total Reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stores.length > 0 ? (stores.reduce((sum, store) => sum + parseFloat(store.averageRating || 0), 0) / stores.length).toFixed(1) : '0.0'}
                </Typography>
                <Typography variant="body2">
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
      
      {/* Search and Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search & Filter Stores
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search stores..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth
              variant="contained" 
              onClick={fetchStores}
              size="large"
              sx={{ py: 1.5 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Stores Grid */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Available Stores
        </Typography>
        
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="80%" height={28} />
                        <Skeleton variant="text" width="60%" height={20} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 2, borderRadius: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : stores.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              backgroundColor: 'grey.50',
              borderRadius: 3
            }}
          >
            <StoreIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No stores found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or check back later for new stores.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {stores.map((store, index) => (
              <Grid item xs={12} sm={6} md={4} key={store.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <div>
                    <StoreCard
                      store={store}
                      onRate={handleRateStore}
                      userRole="Normal User"
                      showRatingButton={true}
                    />
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Rate {selectedStore?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              How would you rate this store?
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitRating} 
            variant="contained"
            disabled={!rating}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;
