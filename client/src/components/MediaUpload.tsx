import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image, Video, FileText, Loader2 } from 'lucide-react';

interface MediaFile {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface MediaUploadProps {
  value?: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxImages?: number;
  maxVideos?: number;
  maxDocuments?: number;
  maxImageSize?: number; // in MB
  maxVideoSize?: number; // in MB
  maxDocumentSize?: number; // in MB
  acceptedImageTypes?: string[];
  acceptedVideoTypes?: string[];
  acceptedDocumentTypes?: string[];
  uploadEndpoint?: string;
}

const DEFAULT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const DEFAULT_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function MediaUpload({
  value = [],
  onChange,
  maxImages = 10,
  maxVideos = 3,
  maxDocuments = 5,
  maxImageSize = 5,
  maxVideoSize = 50,
  maxDocumentSize = 10,
  acceptedImageTypes = DEFAULT_IMAGE_TYPES,
  acceptedVideoTypes = DEFAULT_VIDEO_TYPES,
  acceptedDocumentTypes = DEFAULT_DOCUMENT_TYPES,
  uploadEndpoint = '/api/upload',
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = value.filter(f => f.type === 'image');
  const videos = value.filter(f => f.type === 'video');
  const documents = value.filter(f => f.type === 'document');

  const getFileType = (mimeType: string): 'image' | 'video' | 'document' | null => {
    if (acceptedImageTypes.includes(mimeType)) return 'image';
    if (acceptedVideoTypes.includes(mimeType)) return 'video';
    if (acceptedDocumentTypes.includes(mimeType)) return 'document';
    return null;
  };

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file.type);
    if (!fileType) {
      return `File type ${file.type} is not supported`;
    }

    const sizeMB = file.size / (1024 * 1024);
    
    if (fileType === 'image') {
      if (images.length >= maxImages) return `Maximum ${maxImages} images allowed`;
      if (sizeMB > maxImageSize) return `Image size must be less than ${maxImageSize}MB`;
    } else if (fileType === 'video') {
      if (videos.length >= maxVideos) return `Maximum ${maxVideos} videos allowed`;
      if (sizeMB > maxVideoSize) return `Video size must be less than ${maxVideoSize}MB`;
    } else if (fileType === 'document') {
      if (documents.length >= maxDocuments) return `Maximum ${maxDocuments} documents allowed`;
      if (sizeMB > maxDocumentSize) return `Document size must be less than ${maxDocumentSize}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<MediaFile | null> => {
    const fileType = getFileType(file.type);
    if (!fileType) return null;

    // For demo purposes, create a local URL
    // In production, this would upload to your server/S3
    const url = URL.createObjectURL(file);
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fileType,
      url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };

    // Production upload code:
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch(uploadEndpoint, {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();
    // return data;
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const newFiles: MediaFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const uploaded = await uploadFile(file);
        if (uploaded) {
          newFiles.push(uploaded);
        }
      } catch (err) {
        errors.push(`${file.name}: Upload failed`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      onChange([...value, ...newFiles]);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    onChange(value.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const allAcceptedTypes = [
    ...acceptedImageTypes,
    ...acceptedVideoTypes,
    ...acceptedDocumentTypes,
  ].join(',');

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allAcceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-gray-500">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <span className="text-primary font-medium">Click to upload</span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <div className="text-xs text-gray-400">
              Images (max {maxImages}), Videos (max {maxVideos}), Documents (max {maxDocuments})
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Images Preview */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {file.fileName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Preview */}
      {videos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videos.length}/{maxVideos})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((file) => (
              <div key={file.id} className="relative group">
                <video
                  src={file.url}
                  className="w-full h-32 object-cover rounded-lg border bg-black"
                  controls
                />
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {file.fileName} ({formatFileSize(file.fileSize)})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Preview */}
      {documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documents.length}/{maxDocuments})
          </h4>
          <div className="space-y-2">
            {documents.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{file.fileName}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Upload Guidelines</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Images: JPG, PNG, WEBP (max {maxImageSize}MB each)</li>
          <li>• Videos: MP4, MOV (max {maxVideoSize}MB each)</li>
          <li>• Documents: PDF, DOC, DOCX (max {maxDocumentSize}MB each)</li>
          <li>• Upload clear photos of your cargo for better carrier understanding</li>
        </ul>
      </div>
    </div>
  );
}

export default MediaUpload;
