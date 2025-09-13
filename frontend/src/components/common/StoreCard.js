import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  RateReview as ReviewIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

const StoreCard = ({ 
  store, 
  onRate, 
  userRole, 
  showRatingButton = true,
  elevation = 1 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const getStoreInitial = (name) => {
    return name?.charAt(0).toUpperCase() || 'S';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Zoom in={true} timeout={300}>
      <Card
        elevation={isHovered ? 8 : elevation}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            '& .store-actions': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {/* Favorite Button */}
        <IconButton
          onClick={handleFavoriteToggle}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.1)'
            }
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ color: 'error.main' }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'grey.500' }} />
          )}
        </IconButton>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Store Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                backgroundColor: 'primary.main',
                mr: 2,
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              {getStoreInitial(store.name)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {store.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {store.address}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Rating Section */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating
                value={parseFloat(store.averageRating) || 0}
                precision={0.1}
                readOnly
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                {parseFloat(store.averageRating || 0).toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'})
              </Typography>
            </Box>
            
            {/* User's Rating (if applicable) */}
            {store.userRating && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  icon={<StarIcon />}
                  label={`Your rating: ${store.userRating}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>

          {/* Store Owner Info */}
          {store.ownerEmail && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                Owner: {store.ownerEmail}
              </Typography>
            </Box>
          )}

          {/* Store Stats */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`ID: ${store.storeId}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            <Chip
              label={`Since ${formatDate(store.createdAt)}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </CardContent>

        {/* Action Buttons */}
        {showRatingButton && userRole === 'Normal User' && (
          <Fade in={true}>
            <CardActions
              className="store-actions"
              sx={{
                pt: 0,
                px: 2,
                pb: 2,
                opacity: 0.7,
                transform: 'translateY(4px)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Button
                variant="contained"
                startIcon={<ReviewIcon />}
                onClick={() => onRate(store)}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1
                }}
              >
                {store.userRating ? 'Update Rating' : 'Rate Store'}
              </Button>
            </CardActions>
          </Fade>
        )}
      </Card>
    </Zoom>
  );
};

export default StoreCard;
