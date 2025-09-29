import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";

const Context = () => {
  // Renamed states for better clarity (e.g., loading -> isLoading)
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmbeddingRunning, setIsEmbeddingRunning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/files?t=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await resp.json();
      if (!resp.ok) {
        console.error("List files error:", data);
        alert(data?.error || "Failed to load documents");
        setPdfs([]);
      } else {
        setPdfs(Array.isArray(data.files) ? data.files : []);
      }
    } catch (e) {
      console.error("Network error loading files", e);
      alert("Network error while loading documents");
      setPdfs([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * FIX: Rewritten to handle multiple files sequentially and provide a summary.
   */
  const handleFileUpload = async (files) => {
    // FIX: Prevent new uploads while another operation is in progress.
    if (isUploading || isEmbeddingRunning) {
      alert("Please wait for the current operation to finish.");
      return;
    }

    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please select PDF files only.");
      return;
    }

    setIsUploading(true);

    const successfulUploads = [];
    const failedUploads = [];

    // Process files one by one to avoid overwhelming the server
    for (const file of pdfFiles) {
      try {
        const form = new FormData();
        form.append("file", file);

        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
          method: "POST",
          body: form,
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.error || `Failed to upload ${file.name}`);
        }
        successfulUploads.push(file.name);
      } catch (e) {
        console.error(`Upload error for ${file.name}:`, e);
        failedUploads.push({ name: file.name, reason: e.message });
      }
    }

    setIsUploading(false);

    // FIX: Provide a clear summary of the upload results.
    let summaryMessage = "";
    if (successfulUploads.length > 0) {
      summaryMessage += `${successfulUploads.length} file(s) uploaded successfully.`;
    }
    if (failedUploads.length > 0) {
      const failures = failedUploads
        .map((f) => `- ${f.name} (${f.reason})`)
        .join("\n");
      summaryMessage += `\n${failedUploads.length} file(s) failed to upload:\n${failures}`;
    }
    if (summaryMessage) {
      alert(summaryMessage.trim());
    }

    // If at least one file was uploaded successfully, refresh the list and update embeddings.
    if (successfulUploads.length > 0) {
      await loadPDFs();
      runCreateEmbeddings();
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
      // Reset file input to allow re-uploading the same file
      e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  /**
   * FIX: Simplified logic to prevent double-calling runCreateEmbeddings and improved error handling.
   */
  const handleDeletePDF = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;

    const previousPdfs = pdfs;
    setPdfs((currentPdfs) => currentPdfs.filter((p) => p.id !== id));

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/files/${id}`,
        { method: "DELETE" }
      );

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const errorMessage =
          data?.error || resp.statusText || "Failed to delete file";
        console.error("Delete error:", errorMessage);
        alert(errorMessage);
        setPdfs(previousPdfs); // Rollback on failure
      } else {
        runCreateEmbeddings(); // Success
      }
    } catch (error) {
      console.error("Network error deleting PDF:", error);
      alert("Network error while deleting file. Please try again.");
      setPdfs(previousPdfs); // Rollback on network error
    }
  };

  /**
   * FIX: Made more robust. It now checks if context deletion was successful before proceeding.
   */
  const runCreateEmbeddings = async () => {
    setIsEmbeddingRunning(true);
    try {
      const deleteResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/deleteContext`,
        { method: "DELETE" }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse
          .text()
          .catch(() => "Failed to clear old context.");
        throw new Error(errorText);
      }

      const createResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/createVectorEmbeddings`,
        { method: "POST" }
      );

      const responseText = await createResponse.text();
      if (!createResponse.ok) {
        throw new Error(responseText || "Failed to create vector embeddings");
      }

      alert(responseText || "Context has been updated successfully.");
    } catch (e) {
      console.error("Embedding error:", e);
      alert(`Error updating context: ${e.message}`);
    } finally {
      setIsEmbeddingRunning(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 MB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleViewPDF = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId);
    if (pdf?.url) {
      window.open(pdf.url, "_blank", "noopener,noreferrer");
    } else {
      alert("Unable to open file URL.");
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
              {isEmbeddingRunning && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-white text-sm mb-2">
                    Creating vector embeddings...
                  </p>
                  <div className="w-full bg-gray-600 h-2 rounded overflow-hidden">
                    <div className="bg-green-500 h-2 w-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Documents
                </h3>
                {isLoading ? (
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
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleViewPDF(pdf.id)}
                            className="text-blue-400 hover:text-blue-300 text-left hover:underline truncate"
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
                          disabled={isEmbeddingRunning || isUploading}
                          className="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm ml-4 flex-shrink-0"
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
                    isDragOver
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
                    disabled={isUploading || isEmbeddingRunning}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isEmbeddingRunning}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {isUploading ? "Uploading..." : "Choose PDF Files"}
                  </button>
                  {isUploading && (
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
