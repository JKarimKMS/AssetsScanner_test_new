import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileUpload({ onFileUpload, uploadedFile, uploading = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      onFileUpload(file);
    } else if (file) {
      alert("Invalid file type. Please upload a .xlsx file.");
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      onFileUpload(file);
    } else if (file) {
      alert("Invalid file type. Please upload a .xlsx file.");
    }
  };

  const handleRemoveFile = () => {
    onFileUpload(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={uploading}
      />
      {!uploadedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
          onClick={() => !uploading && inputRef.current.click()}
        >
          <div className="flex flex-col items-center space-y-4 text-gray-600">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="font-semibold">Uploading template...</p>
                <p className="text-sm">Please wait while we save your template</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-gray-400" />
                <p className="font-semibold">
                  Drag & drop your .xlsx template here
                </p>
                <p className="text-sm">or</p>
                <Button type="button" variant="outline" size="sm">
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <File className="w-10 h-10 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 break-all">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">{formatBytes(uploadedFile.size)}</p>
              </div>
            </div>
            {!uploading && (
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="mt-4 flex items-center space-x-2 text-sm">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-emerald-700">Uploading and saving template...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Ready to upload. Click anywhere to select a different file.</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}