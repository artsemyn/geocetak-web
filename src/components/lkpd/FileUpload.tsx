// src/components/lkpd/FileUpload.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Close,
  CheckCircle
} from '@mui/icons-material';

interface FileUploadProps {
  file: string | null;
  fileName: string | null;
  onChange: (fileData: { file: string; fileName: string } | null) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export function FileUpload({
  file,
  fileName,
  onChange,
  acceptedFormats = '.stl',
  maxSizeMB = 50,
  label = 'Upload File',
  helperText = '',
  required = false
}: FileUploadProps) {
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedFormats = acceptedFormats.split(',').map(f => f.trim().toLowerCase());

    if (!allowedFormats.includes(fileExtension)) {
      setError(`Format file tidak valid. Hanya menerima: ${acceptedFormats}`);
      event.target.value = '';
      return;
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Ukuran file tidak boleh lebih dari ${maxSizeMB}MB (File Anda: ${fileSizeMB.toFixed(2)}MB)`);
      event.target.value = '';
      return;
    }

    // Convert to base64
    try {
      const base64 = await convertToBase64(selectedFile);
      onChange({
        file: base64 as string,
        fileName: selectedFile.name
      });
    } catch (err) {
      console.error('Error converting file:', err);
      setError('Gagal memproses file');
    }

    // Reset input
    event.target.value = '';
  };

  const convertToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemove = () => {
    onChange(null);
    setError('');
  };

  const formatFileSize = (base64String: string): string => {
    // Estimate size from base64 (roughly 3/4 of base64 string length)
    const sizeBytes = (base64String.length * 3) / 4;
    const sizeMB = sizeBytes / (1024 * 1024);

    if (sizeMB < 1) {
      return `${(sizeBytes / 1024).toFixed(2)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        {label} {required && <span style={{ color: '#E74C3C' }}>*</span>}
      </Typography>

      {helperText && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {helperText}
        </Typography>
      )}

      {/* Upload Button */}
      {!file && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          sx={{
            mb: 2,
            borderStyle: 'dashed',
            borderWidth: 2,
            py: 1.5,
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: 2
            }
          }}
        >
          Pilih File
          <input
            type="file"
            hidden
            accept={acceptedFormats}
            onChange={handleFileSelect}
          />
        </Button>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* File Preview Card */}
      {file && fileName ? (
        <Card sx={{ mb: 2, bgcolor: '#F0F8FF', border: '2px solid #4A90E2' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
                <InsertDriveFile sx={{ fontSize: 40, color: '#4A90E2' }} />
                <Box flexGrow={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {fileName}
                    </Typography>
                    <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={formatFileSize(file)}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={acceptedFormats.toUpperCase()}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
              </Box>
              <IconButton
                onClick={handleRemove}
                sx={{
                  color: '#E74C3C',
                  '&:hover': {
                    bgcolor: '#E74C3C20'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            border: '2px dashed #E0E0E0',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: '#FAFAFA'
          }}
        >
          <InsertDriveFile sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Belum ada file
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Format: {acceptedFormats}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Maksimal {maxSizeMB}MB
          </Typography>
        </Box>
      )}
    </Box>
  );
}
