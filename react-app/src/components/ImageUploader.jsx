import { useState } from 'react';

export default function ImageUploader({ groundId, onUploadComplete, notify }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      notify('Maximum 5 images allowed', true);
      return;
    }

    setSelectedFiles(files);

    // Generate previews
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleUpload = async () => {
    if (!groundId) {
      notify('Please create the ground first', true);
      return;
    }

    if (selectedFiles.length === 0) {
      notify('Please select images to upload', true);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('is_primary', index === 0 ? 'true' : 'false');
        formData.append('caption', file.name);

        const response = await fetch(
          `https://bookmyground.pythonanywhere.com/api/v1/grounds/${groundId}/images/`,
          {
            method: 'POST',
            headers: {
              Authorization: `Token ${localStorage.getItem('bmg_token')}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || `Failed to upload ${file.name}`);
        }

        return await response.json();
      });

      await Promise.all(uploadPromises);
      notify(`Successfully uploaded ${selectedFiles.length} image(s)`);
      
      // Clear selection
      setSelectedFiles([]);
      setPreviews([]);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      notify(err.message, true);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>
        Upload Images (Max 5)
      </label>
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ marginBottom: 12 }}
        disabled={!groundId}
      />

      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 12 }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              <button
                type="button"
                onClick={() => handleRemovePreview(index)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
              {index === 0 && (
                <span style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                }}>
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || !groundId}
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
        </button>
      )}

      {!groundId && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          Save the ground first to enable image uploads
        </p>
      )}
    </div>
  );
}
