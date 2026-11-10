import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  restaurantId: string;
}

export function ImageUpload({ value, onChange, restaurantId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get signature from backend
      const sigRes = await fetch('/api/v1/uploads/signature', {
        method: 'POST',
        headers: { 'x-restaurant-id': restaurantId },
      });
      
      if (!sigRes.ok) {
        const error = await sigRes.json();
        throw new Error(error.error?.message || 'Cloudinary is not configured.');
      }

      const { data: sigData } = await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const uploadData = await uploadRes.json();
      onChange(uploadData.secure_url);
      toast.success('Image uploaded');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-ink-700 block mb-1">Image</label>
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-ink-200 group">
          <img src={value} alt="Upload" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-ink-600 hover:text-danger shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-ink-300 rounded-lg flex flex-col items-center justify-center text-ink-500 hover:bg-ink-50 hover:border-brand-400 cursor-pointer transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-brand-600" />
          ) : (
            <UploadCloud className="h-6 w-6 mb-2" />
          )}
          <span className="text-sm">{isUploading ? 'Uploading...' : 'Click to upload'}</span>
          <span className="text-xs text-ink-400 mt-1">JPG, PNG or WebP (max 5MB)</span>
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}