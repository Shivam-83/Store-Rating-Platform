import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const PasswordUpdate = ({ onSuccess, onError }) => {
  const { updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setLocalError('');
      setLocalSuccess('');

      const result = await updatePassword(data.currentPassword, data.newPassword);

      if (result.success) {
        setLocalSuccess('Password updated successfully!');
        reset();
        if (onSuccess) onSuccess();
      } else {
        setLocalError(result.error);
        if (onError) onError(result.error);
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setLocalError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Update Password
        </Typography>
        
        {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
        {localSuccess && <Alert severity="success" sx={{ mb: 2 }}>{localSuccess}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            margin="normal"
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            margin="normal"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PasswordUpdate;
