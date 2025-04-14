import React, { useState } from 'react';
import './UploadPDF.css';

function UploadPDF({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF!');
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('https://wccbackendoffl.onrender.com/api/scorecard/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      alert(data.message || 'Uploaded successfully!');
      setFile(null);
      onUpload(); // Trigger reload
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
}

export default UploadPDF;
