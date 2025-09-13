import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel
} from '@mui/material';
import { Add, Visibility, Search, Clear } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { storeService, userService } from '../../../services/apiService';

const storeSchema = yup.object({
  name: yup.string().required('Store name is required').max(255, 'Name must not exceed 255 characters'),
  address: yup.string().max(400, 'Address must not exceed 400 characters'),
  owner_id: yup.number().nullable()
});

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStores, setTotalStores] = useState(0);
  
  // Filters and Sorting
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(storeSchema),
    defaultValues: {
      name: '',
      address: '',
      owner_id: null
    }
  });

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [page, rowsPerPage, filters, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };
      
      const response = await storeService.getStores(params);
      setStores(response.data.stores);
      setTotalStores(response.data.pagination.totalStores);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await userService.getUsers({ role: 'Store Owner', limit: 100 });
      setStoreOwners(response.data.users);
    } catch (error) {
      console.error('Failed to fetch store owners:', error);
    }
  };

  const handleCreateStore = async (data) => {
    try {
      const storeData = {
        ...data,
        owner_id: data.owner_id || undefined
      };
      await storeService.createStore(storeData);
      setSuccess('Store created successfully');
      setOpenDialog(false);
      reset();
      fetchStores();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create store');
    }
  };

  const handleViewStore = async (storeId) => {
    try {
      const response = await storeService.getStoreById(storeId);
      setSelectedStore(response.data.store);
      setViewDialog(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch store details');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ name: '', address: '' });
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'ASC';
    setSortOrder(isAsc ? 'DESC' : 'ASC');
    setSortBy(field);
  };

  const getOwnerName = (ownerId) => {
    const owner = storeOwners.find(owner => owner.id === ownerId);
    return owner ? owner.name : 'Unassigned';
  };

  const getOwnerEmail = (ownerEmail) => {
    return ownerEmail || 'N/A';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Store Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Store
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Filters</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            label="Store Name"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
          <TextField
            size="small"
            label="Address"
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
          />
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {/* Stores Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder.toLowerCase() : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'address'}
                  direction={sortBy === 'address' ? sortOrder.toLowerCase() : 'asc'}
                  onClick={() => handleSort('address')}
                >
                  Address
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'average_rating'}
                  direction={sortBy === 'average_rating' ? sortOrder.toLowerCase() : 'asc'}
                  onClick={() => handleSort('average_rating')}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No stores found
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{getOwnerEmail(store.ownerEmail)}</TableCell>
                  <TableCell>{store.address || 'N/A'}</TableCell>
                  <TableCell>{store.averageRating} ⭐ ({store.totalRatings} reviews)</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewStore(store.id)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalStores}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Create Store Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Store</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateStore)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Store Name"
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Address"
                  margin="normal"
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />
            <Controller
              name="owner_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Store Owner (Optional)</InputLabel>
                  <Select {...field} label="Store Owner (Optional)">
                    <MenuItem value="">Unassigned</MenuItem>
                    {storeOwners.map((owner) => (
                      <MenuItem key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Store Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Store Details</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Box>
              <Typography><strong>Name:</strong> {selectedStore.name}</Typography>
              <Typography><strong>Address:</strong> {selectedStore.address || 'N/A'}</Typography>
              <Typography><strong>Owner:</strong> {getOwnerName(selectedStore.ownerId)}</Typography>
              <Typography><strong>Average Rating:</strong> {selectedStore.averageRating} ⭐</Typography>
              <Typography><strong>Total Ratings:</strong> {selectedStore.totalRatings}</Typography>
              <Typography><strong>Created:</strong> {new Date(selectedStore.createdAt).toLocaleString()}</Typography>
              <Typography><strong>Updated:</strong> {new Date(selectedStore.updatedAt).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreManagement;
