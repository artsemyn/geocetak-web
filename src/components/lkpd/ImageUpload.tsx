// src/components/lkpd/ImageUpload.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  Grid,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Close,
  Image as ImageIcon
} from '@mui/icons-material';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 3,
  maxSizeMB = 5,
  label = 'Upload Gambar',
  helperText = '',
  required = false
}: ImageUploadProps) {
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError('');

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      setError(`Maksimal ${maxImages} gambar`);
      return;
    }

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPG, PNG, dll)');
        continue;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`Ukuran file tidak boleh lebih dari ${maxSizeMB}MB`);
        continue;
      }

      // Convert to base64
      try {
        const base64 = await convertToBase64(file);
        newImages.push(base64 as string);
      } catch (err) {
        console.error('Error converting image:', err);
        setError('Gagal memproses gambar');
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
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

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setError('');
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
      {images.length < maxImages && (
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
          Pilih Gambar ({images.length}/{maxImages})
          <input
            type="file"
            hidden
            accept="image/*"
            multiple
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

      {/* Image Grid Preview */}
      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={image}
                  alt={`Upload ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                <IconButton
                  onClick={() => handleRemove(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)'
                    }
                  }}
                  size="small"
                >
                  <Close fontSize="small" />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
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
          <ImageIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Belum ada gambar
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Maksimal {maxImages} gambar, masing-masing {maxSizeMB}MB
          </Typography>
        </Box>
      )}
    </Box>
  );
}
