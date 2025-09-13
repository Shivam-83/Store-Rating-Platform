import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be at most 50 characters')
    .required('Password is required'),
  role: yup.string().required('Role is required')
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      // Transform form data to match backend expectations
      const userData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: data.role,
        address: '' // Optional field
      };
      
      const result = await registerUser(userData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('root', {
          message: result.error || 'Registration failed'
        });
      }
    } catch (error) {
      setError('root', {
        message: error.response?.data?.error || 'Registration failed'
      });
    }
  };

  const roleOptions = [
    {
      value: 'Normal User',
      label: 'Normal User',
      description: 'Browse and rate stores',
      icon: <PersonIcon />,
      color: 'primary'
    },
    {
      value: 'Store Owner',
      label: 'Store Owner',
      description: 'Manage your store and view analytics',
      icon: <StoreIcon />,
      color: 'success'
    },
    {
      value: 'System Administrator',
      label: 'System Administrator',
      description: 'Manage users, stores and platform analytics',
      icon: <PersonIcon />,
      color: 'error'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper 
          elevation={24} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Join Our Platform
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create your account and start exploring stores
            </Typography>
          </Box>
          
          {errors.root && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errors.root.message}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  {...register('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                  Choose Your Role
                </Typography>
                <Grid container spacing={2}>
                  {roleOptions.map((role) => (
                    <Grid item xs={12} sm={6} key={role.value}>
                      <Card 
                        variant={selectedRole === role.value ? "elevation" : "outlined"}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: selectedRole === role.value ? 2 : 1,
                          borderColor: selectedRole === role.value ? 'primary.main' : 'grey.300',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => setValue('role', role.value)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Box sx={{ color: `${role.color}.main`, mb: 2 }}>
                            {React.cloneElement(role.icon, { sx: { fontSize: 40 } })}
                          </Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {role.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {role.description}
                          </Typography>
                          {selectedRole === role.value && (
                            <Chip 
                              label="Selected" 
                              color="primary" 
                              size="small"
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {errors.role && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors.role.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                mt: 4, 
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
