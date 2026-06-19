'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/app/components/admin/Toast';
import { Upload, Trash2, Save, Image as ImageIcon, Plus, Check, Video } from 'lucide-react';

interface ImageAsset {
  id: string;
  key: string;
  url: string;
  title: string | null;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

interface GalleryVideo {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminImages() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'sections' | 'gallery' | 'videos'>('sections');
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Gallery form state
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Videos form state
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [videoUploadType, setVideoUploadType] = useState<'upload' | 'url'>('upload');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoFileWarning, setVideoFileWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, galleryRes, videosRes] = await Promise.all([
        fetch('/api/admin/assets'),
        fetch('/api/admin/gallery'),
        fetch('/api/admin/videos')
      ]);

      if (assetsRes.ok && galleryRes.ok && videosRes.ok) {
        const assetsData = await assetsRes.json();
        const galleryData = await galleryRes.json();
        const videosData = await videosRes.json();
        setAssets(assetsData);
        setGallery(galleryData);
        setVideos(videosData);
      } else {
        showToast('Failed to load image & video configurations', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while fetching media data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetUrlChange = (key: string, value: string) => {
    setAssets(prev =>
      prev.map(asset => (asset.key === key ? { ...asset, url: value } : asset))
    );
  };

  const handleAssetSave = async (asset: ImageAsset) => {
    try {
      const res = await fetch('/api/admin/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: asset.key,
          url: asset.url,
          title: asset.title
        })
      });

      if (res.ok) {
        showToast(`Asset "${asset.title || asset.key}" updated successfully`, 'success');
        fetchData();
      } else {
        showToast('Failed to update asset', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving asset', 'error');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (key) {
      setUploadingKey(key);
    } else {
      setGalleryUploading(true);
    }

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (key) {
          handleAssetUrlChange(key, data.url);
          showToast('Image uploaded successfully', 'success');
        } else {
          setNewGalleryUrl(data.url);
          showToast('Gallery image uploaded successfully', 'success');
        }
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading file', 'error');
    } finally {
      setUploadingKey(null);
      setGalleryUploading(false);
    }
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl || !newGalleryTitle) {
      showToast('Please provide both an image and a title', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newGalleryUrl,
          title: newGalleryTitle
        })
      });

      if (res.ok) {
        showToast('Image added to gallery', 'success');
        setNewGalleryTitle('');
        setNewGalleryUrl('');
        fetchData();
      } else {
        showToast('Failed to add image to gallery', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error adding to gallery', 'error');
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm('Are you sure you want to remove this image from the gallery?')) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Image removed from gallery', 'success');
        fetchData();
      } else {
        showToast('Failed to delete gallery image', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting gallery image', 'error');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 400MB
    const maxSizeBytes = 400 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setVideoFileWarning('File size exceeds 400MB. Larger videos will take a long time to load and may fail to save. Consider using a YouTube link or CDN URL instead.');
      if (file.size > 500 * 1024 * 1024) {
        showToast('File is too large (exceeds 500MB limit for database storage)', 'error');
        return;
      }
    } else {
      setVideoFileWarning(null);
    }

    setVideoUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        setNewVideoUrl(base64Url);
        showToast('Video processed successfully. Enter a title and click "Add Video" to save.', 'success');
        setVideoUploading(false);
      };
      reader.onerror = () => {
        showToast('Failed to read video file', 'error');
        setVideoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showToast('Error uploading video', 'error');
      setVideoUploading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl || !newVideoTitle) {
      showToast('Please provide both a video source and a title', 'error');
      return;
    }

    let url = newVideoUrl;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/;
      const match = url.match(watchRegex);
      if (match && match[1]) {
        url = `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    setVideoUploading(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title: newVideoTitle
        })
      });

      if (res.ok) {
        showToast('Video added successfully', 'success');
        setNewVideoTitle('');
        setNewVideoUrl('');
        setVideoFileWarning(null);
        fetchData();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to add video', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error adding video', 'error');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video from the gallery?')) return;

    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Video removed successfully', 'success');
        fetchData();
      } else {
        showToast('Failed to delete video', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting video', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#C9A84C' }}>
        <p>Loading image configurations...</p>
      </div>
    );
  }

  // Helper to map keys to user friendly labels
  const getAssetLabel = (key: string) => {
    switch (key) {
      case 'hero_bg':
        return 'Hero Section Background Image';
      case 'about_plating':
        return 'About Section Plating Image';
      case 'package_snacks':
        return 'Signature Menu - Snacks & Starters';
      case 'package_biryani':
        return 'Signature Menu - Signature Biryani';
      case 'package_buffet':
        return 'Signature Menu - Buffet Service';
      default:
        return key;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A84C', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Manage Website Images
          </h1>
          <p style={{ color: '#A3A3A3', fontSize: '0.95rem' }}>
            Change general website background/section images or upload new photography to the public gallery section.
          </p>
        </div>
      </div>

      {/* Tabs bar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
        <button
          onClick={() => setActiveTab('sections')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sections' ? '2px solid #C9A84C' : '2px solid transparent',
            color: activeTab === 'sections' ? '#C9A84C' : '#A3A3A3',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          Website Sections
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'gallery' ? '2px solid #C9A84C' : '2px solid transparent',
            color: activeTab === 'gallery' ? '#C9A84C' : '#A3A3A3',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          Gallery Section
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'videos' ? '2px solid #C9A84C' : '2px solid transparent',
            color: activeTab === 'videos' ? '#C9A84C' : '#A3A3A3',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          Video Gallery
        </button>
      </div>

      {activeTab === 'sections' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {assets.map(asset => (
            <div
              key={asset.id}
              style={{
                backgroundColor: '#111',
                border: '1px solid rgba(201, 168, 76, 0.1)',
                borderRadius: '8px',
                padding: '2rem',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Image Preview */}
              <div
                style={{
                  width: '240px',
                  height: '160px',
                  backgroundColor: '#050505',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {asset.url ? (
                  <img
                    src={asset.url}
                    alt={asset.key}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                    <ImageIcon size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.8rem' }}>No image set (using default gradient)</p>
                  </div>
                )}
              </div>

              {/* Form Controls */}
              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F5F0E8', marginBottom: '1rem' }}>
                    {getAssetLabel(asset.key)}
                  </h3>
                  
                  {/* URL Input */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Image URL</label>
                    <input
                      type="text"
                      value={asset.url}
                      onChange={e => handleAssetUrlChange(asset.key, e.target.value)}
                      placeholder="Paste image URL here"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#050505',
                        border: '1px solid rgba(201, 168, 76, 0.2)',
                        borderRadius: '4px',
                        color: '#F5F0E8',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* File Upload Button */}
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#F5F0E8',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: '0.3s'
                    }}
                  >
                    <Upload size={16} />
                    {uploadingKey === asset.key ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleUpload(e, asset.key)}
                      style={{ display: 'none' }}
                      disabled={uploadingKey !== null}
                    />
                  </label>

                  {/* Save Button */}
                  <button
                    onClick={() => handleAssetSave(asset)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#C9A84C',
                      color: '#000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: 'none',
                      transition: '0.3s'
                    }}
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          {/* Add to Gallery Form */}
          <div
            style={{
              backgroundColor: '#111',
              border: '1px solid rgba(201, 168, 76, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '3rem'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C9A84C', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Add Image to Gallery
            </h3>
            
            <form onSubmit={handleAddGalleryImage} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Image Title</label>
                <input
                  type="text"
                  value={newGalleryTitle}
                  onChange={e => setNewGalleryTitle(e.target.value)}
                  placeholder="e.g. Wedding buffet spread"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid rgba(201, 168, 76, 0.2)',
                    borderRadius: '4px',
                    color: '#F5F0E8',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Image URL</label>
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste URL or upload file below"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid rgba(201, 168, 76, 0.2)',
                    borderRadius: '4px',
                    color: '#F5F0E8',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* File Upload for Gallery */}
                <label
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#F5F0E8',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: '0.3s',
                    textAlign: 'center'
                  }}
                >
                  <Upload size={16} />
                  {galleryUploading ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleUpload(e, null)}
                    style={{ display: 'none' }}
                    disabled={galleryUploading}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#C9A84C',
                    color: '#000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: 'none',
                    transition: '0.3s'
                  }}
                >
                  <Plus size={16} />
                  Add Image
                </button>
              </div>
            </form>
          </div>

          {/* Gallery Grid */}
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F5F0E8', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Current Gallery Images ({gallery.length})
          </h3>
          
          {gallery.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#A3A3A3' }}>
              <ImageIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No gallery images uploaded yet. Use the form above to add some!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {gallery.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '200px', backgroundColor: '#050505', position: 'relative' }}>
                    <img
                      src={item.url}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#F5F0E8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeleteGalleryImage(item.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: '0.3s'
                      }}
                      title="Delete Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div>
          {/* Add to Video Gallery Form */}
          <div
            style={{
              backgroundColor: '#111',
              border: '1px solid rgba(201, 168, 76, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '3rem'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C9A84C', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Add Video to Gallery
            </h3>

            {/* Video Source Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setVideoUploadType('upload');
                  setNewVideoUrl('');
                  setVideoFileWarning(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: videoUploadType === 'upload' ? '#C9A84C' : '#A3A3A3',
                  borderBottom: videoUploadType === 'upload' ? '2px solid #C9A84C' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                Upload Video File (MP4)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUploadType('url');
                  setNewVideoUrl('');
                  setVideoFileWarning(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: videoUploadType === 'url' ? '#C9A84C' : '#A3A3A3',
                  borderBottom: videoUploadType === 'url' ? '2px solid #C9A84C' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                External URL (YouTube / Direct MP4 Link)
              </button>
            </div>
            
            <form onSubmit={handleAddVideo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Video Title</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={e => setNewVideoTitle(e.target.value)}
                  placeholder="e.g. Fine dining plating experience"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#050505',
                    border: '1px solid rgba(201, 168, 76, 0.2)',
                    borderRadius: '4px',
                    color: '#F5F0E8',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {videoUploadType === 'url' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Video URL</label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or direct .mp4 link"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#050505',
                      border: '1px solid rgba(201, 168, 76, 0.2)',
                      borderRadius: '4px',
                      color: '#F5F0E8',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3A3A3', marginBottom: '0.5rem' }}>Select Video File (MP4)</label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#050505',
                      color: newVideoUrl ? '#C9A84C' : '#A3A3A3',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      border: '1px solid rgba(201, 168, 76, 0.2)',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Upload size={16} />
                    {newVideoUrl ? 'Video Loaded (Ready to Add)' : 'Upload MP4 File'}
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={handleVideoUpload}
                      style={{ display: 'none' }}
                      disabled={videoUploading}
                    />
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={videoUploading || !newVideoUrl}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: (videoUploading || !newVideoUrl) ? '#333' : '#C9A84C',
                    color: (videoUploading || !newVideoUrl) ? '#888' : '#000',
                    borderRadius: '4px',
                    cursor: (videoUploading || !newVideoUrl) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: 'none',
                    transition: '0.3s'
                  }}
                >
                  {videoUploading ? 'Processing...' : <><Plus size={16} /> Add Video</>}
                </button>
              </div>
            </form>

            {videoFileWarning && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.3)', borderRadius: '4px', color: '#C9A84C', fontSize: '0.85rem' }}>
                {videoFileWarning}
              </div>
            )}
          </div>

          {/* Videos Grid */}
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F5F0E8', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Current Gallery Videos ({videos.length})
          </h3>
          
          {videos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#A3A3A3' }}>
              <Video size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No gallery videos uploaded yet. Use the form above to add some!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {videos.map(item => {
                const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
                let displayUrl = item.url;
                if (isYoutube) {
                  const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/;
                  const match = item.url.match(watchRegex);
                  if (match && match[1]) {
                    displayUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=0&mute=1&controls=1`;
                  } else if (!item.url.includes('autoplay=')) {
                    displayUrl = `${item.url}?autoplay=0&mute=1&controls=1`;
                  }
                }
                
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#111',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ height: '180px', backgroundColor: '#050505', position: 'relative' }}>
                      {isYoutube ? (
                        <iframe
                          src={displayUrl}
                          title={item.title}
                          frameBorder="0"
                          style={{ width: '100%', height: '100%', display: 'block' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={item.url}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          controls
                          muted
                          preload="metadata"
                        />
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#F5F0E8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: '#A3A3A3' }}>
                          {isYoutube ? 'YouTube Embed' : item.url.startsWith('data:') ? 'Uploaded File (Base64)' : 'External Direct URL'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(item.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: '0.3s'
                        }}
                        title="Delete Video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
