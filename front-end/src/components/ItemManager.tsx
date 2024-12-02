// src/components/ItemManager/ItemManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
//import { useAuthenticator } from '@aws-amplify/ui-react';

import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ApiService } from '../services/api.service.ts' 
import { ApiError, Item } from '../models/api.types.ts';


import { 
  Box, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const ItemManager: React.FC = () => {
  //const { user } = useAuthenticator();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedItems = await ApiService.getItems();
      setItems(fetchedItems);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const createdItem = await ApiService.createItem(newItem);
      setItems(prevItems => [...prevItems, createdItem]);
      setNewItem({ name: '', description: '' });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleUpdateItem = async (id: string, updatedData: Partial<Item>) => {
    setLoading(true);
    try {
      const updatedItem = await ApiService.updateItem(id, updatedData);
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? updatedItem : item)
      );
      setEditingItem(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setLoading(true);
    try {
      await ApiService.deleteItem(id);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Item Manager
      </Typography>

      {/* Create Item Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleCreateItem}>
          <TextField
            fullWidth
            label="Name"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Description"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
            disabled={loading}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || !newItem.name}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Item'}
          </Button>
        </form>
      </Paper>

      {/* Items List */}
      <Paper>
        {loading && items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {items.map((item) => (
              <ListItem key={item.id}>
                {editingItem?.id === item.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        name: e.target.value 
                      })}
                      margin="dense"
                      disabled={loading}
                    />
                    <TextField
                      fullWidth
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        description: e.target.value 
                      })}
                      margin="dense"
                      disabled={loading}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Button 
                        onClick={() => handleUpdateItem(item.id, editingItem)}
                        variant="contained" 
                        size="small" 
                        sx={{ mr: 1 }}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button 
                        onClick={() => setEditingItem(null)}
                        variant="outlined" 
                        size="small"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {item.description}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption">
                            Created: {new Date(item.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => setEditingItem(item)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => setDeleteConfirm(item.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm(null)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => deleteConfirm && handleDeleteItem(deleteConfirm)}
            color="error"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemManager;
