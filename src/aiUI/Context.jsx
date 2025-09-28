import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";

const Context = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    console.log("Loaded");
  };

  const handleFileUpload = async (files) => {
    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please select PDF files only.");
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", pdfFiles[0]);

      const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/upload", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error("Upload error:", data);
        alert(data?.error || "Upload failed");
      } else {
        console.log("Uploaded", data);
        // Optionally refresh list here when you implement loadPDFs()
      }
    } catch (e) {
      console.error("Network/upload error", e);
      alert("Network error while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeletePDF = async (id) => {
    if (window.confirm("Are you sure you want to delete this PDF?")) {
      try {
        await pdfStorage.deletePDF(id);
        await loadPDFs();
      } catch (error) {
        console.error("Error deleting PDF:", error);
        alert("Error deleting file. Please try again.");
      }
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleViewPDF = async (pdfId) => {
    try {
      const pdfData = await pdfStorage.getPDF(pdfId);
      if (pdfData) {
        const pdfUrl = pdfStorage.createPDFBlobURL(pdfData);
        window.open(pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Error opening PDF. Please try again.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header />
      <div className="flex-1 overflow-y-auto bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-4">
              Context Management
            </h1>
            <p className="text-gray-300 mb-6">
              Manage your document context and settings here.
            </p>

            <div className="space-y-4">
              {/* Uploaded Documents */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Documents
                </h3>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading documents...</p>
                  </div>
                ) : pdfs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No documents uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center justify-between bg-gray-600 rounded p-3"
                      >
                        <div className="flex-1">
                          <button
                            onClick={() => handleViewPDF(pdf.id)}
                            className="text-blue-400 hover:text-blue-300 text-left hover:underline"
                          >
                            {pdf.name}
                          </button>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatFileSize(pdf.size)} •{" "}
                            {new Date(pdf.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePDF(pdf.id)}
                          className="text-red-400 hover:text-red-300 text-sm ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload New Document */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Upload New Document
                </h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver
                      ? "border-blue-500 bg-blue-900 bg-opacity-20"
                      : "border-gray-500"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <p className="text-gray-400 mb-4">
                    Drag and drop PDF files here, or click to select
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {uploading ? "Uploading..." : "Choose PDF Files"}
                  </button>
                  {uploading && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Context;
