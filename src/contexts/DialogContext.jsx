import { createContext, useContext, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

const DialogContext = createContext({});

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'confirm', // 'confirm' | 'alert'
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error' | 'warning' | 'info' | 'success'
    autoHideDuration: 6000,
  });

  const showDialog = useCallback(({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    type = 'confirm',
  }) => {
    setDialog({
      open: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm: () => {
        onConfirm?.();
        setDialog(prev => ({ ...prev, open: false }));
      },
      onCancel: () => {
        onCancel?.();
        setDialog(prev => ({ ...prev, open: false }));
      },
      type,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, open: false }));
  }, []);

  const showAlert = useCallback(({
    title,
    message,
    confirmLabel = 'OK',
    onConfirm,
  }) => {
    showDialog({
      title,
      message,
      confirmLabel,
      onConfirm,
      type: 'alert',
    });
  }, [showDialog]);

  const showConfirm = useCallback(({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  }) => {
    showDialog({
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel,
      type: 'confirm',
    });
  }, [showDialog]);

  const showSnackbar = useCallback(({
    message,
    severity = 'info',
    autoHideDuration = 6000,
  }) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <DialogContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSnackbar,
      }}
    >
      {children}

      {/* Global Dialog */}
      <Dialog
        open={dialog.open}
        onClose={dialog.type === 'confirm' ? dialog.onCancel : dialog.onConfirm}
      >
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {dialog.type === 'confirm' && (
            <Button onClick={dialog.onCancel}>
              {dialog.cancelLabel}
            </Button>
          )}
          <Button onClick={dialog.onConfirm} autoFocus variant="contained">
            {dialog.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DialogContext.Provider>
  );
}