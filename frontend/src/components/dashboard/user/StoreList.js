import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { ratingService } from '../../../services/apiService';

const StoreCard = ({ store, onRatingUpdate }) => {
  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(store.userRating || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (store.userRating) {
        // Update existing rating
        await ratingService.updateRating(store.id, { rating_value: selectedRating });
      } else {
        // Submit new rating
        await ratingService.submitRating(store.id, { rating_value: selectedRating });
      }

      setRatingDialog(false);
      onRatingUpdate();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const openRatingDialog = () => {
    setSelectedRating(store.userRating || 0);
    setError('');
    setRatingDialog(true);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {store.name}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {store.address || 'No address provided'}
          </Typography>
          
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <Rating
              value={parseFloat(store.averageRating)}
              readOnly
              precision={0.1}
              emptyIcon={<StarBorder fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {store.averageRating} ({store.totalRatings} reviews)
            </Typography>
          </Box>
          
          {store.userRating && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Your Rating: ${store.userRating} ⭐`}
                color="primary"
                size="small"
              />
            </Box>
          )}
          
          <Button
            variant={store.userRating ? "outlined" : "contained"}
            fullWidth
            onClick={openRatingDialog}
          >
            {store.userRating ? 'Update Rating' : 'Rate Store'}
          </Button>
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)}>
        <DialogTitle>
          {store.userRating ? 'Update Rating' : 'Rate Store'}: {store.name}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              How would you rate this store?
            </Typography>
            <Rating
              value={selectedRating}
              onChange={(event, newValue) => setSelectedRating(newValue)}
              size="large"
              emptyIcon={<StarBorder fontSize="inherit" />}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {selectedRating === 0 && 'Select a rating'}
              {selectedRating === 1 && 'Poor'}
              {selectedRating === 2 && 'Fair'}
              {selectedRating === 3 && 'Good'}
              {selectedRating === 4 && 'Very Good'}
              {selectedRating === 5 && 'Excellent'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRatingSubmit}
            variant="contained"
            disabled={submitting || selectedRating === 0}
          >
            {submitting ? <CircularProgress size={20} /> : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const StoreList = ({
  stores,
  loading,
  totalStores,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRatingUpdate
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (stores.length === 0) {
    return (
      <Box textAlign="center" sx={{ py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No stores found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your search criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.id}>
            <StoreCard store={store} onRatingUpdate={onRatingUpdate} />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <TablePagination
          component="div"
          count={totalStores}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10));
            onPageChange(0);
          }}
          rowsPerPageOptions={[6, 12, 24]}
        />
      </Box>
    </Box>
  );
};

export default StoreList;
