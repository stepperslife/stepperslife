"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Trash2,
  Send,
  Play,
  Bot,
  Cloud,
  Server,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { getExtractionConfidence } from "@/lib/ai-merge";

// AI Provider types
type AIProvider = "auto" | "ollama" | "gemini";

interface ProviderStatus {
  available: boolean;
  url?: string;
  model: string;
}

interface ProvidersInfo {
  ollama: ProviderStatus;
  gemini: ProviderStatus;
  defaultProvider: string;
  recommendation: string;
}

interface UploadedFlyer {
  id: string;
  flyerId?: Id<"uploadedFlyers">;
  file: File;
  preview: string;
  filepath?: string;
  status: "pending" | "uploading" | "success" | "extracting" | "extracted" | "error";
  errorMessage?: string;
  optimizedSize?: number;
  extractedData?: any;
  extractionProgress?: string;
  provider?: string;
  fallbackUsed?: boolean;
}

// Event categories
const EVENT_CATEGORIES = [
  "Set",
  "Workshop",
  "Save the Date",
  "Cruise",
  "Outdoor",
  "Holiday Event",
  "Weekend Event",
  "Comedy Shows",
  "Trips",
  "Concerts",
];

// Event types
const EVENT_TYPES = [
  { value: "TICKETED_EVENT", label: "Ticketed Event" },
  { value: "FREE_EVENT", label: "Pay at the door" },
  { value: "SAVE_THE_DATE", label: "📅 Save the Date" },
];

export default function BulkFlyerUploadPage() {
  const [flyers, setFlyers] = useState<UploadedFlyer[]>([]);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [duplicateHash, setDuplicateHash] = useState<string | null>(null);
  const [duplicateFile, setDuplicateFile] = useState<File | null>(null);
  const [autoProcess, setAutoProcess] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("auto");
  const [providersInfo, setProvidersInfo] = useState<ProvidersInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlyers, setSelectedFlyers] = useState<Set<string>>(new Set());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingFlyer, setSavingFlyer] = useState<string | null>(null);

  const logFlyer = useMutation(api.flyers.mutations.logUploadedFlyer);
  const updateExtractedData = useMutation(api.flyers.mutations.updateFlyerWithExtractedData);
  const autoCreateEvent = useMutation(api.flyers.mutations.autoCreateEventFromExtractedData);
  const deleteFlyer = useAction(api.flyers.mutations.deleteFlyerWithCleanup);

  const flyerStats = useQuery(api.admin.queries.getFlyerUploadStats);
  const draftFlyers = useQuery(api.flyers.queries.getDraftFlyers);

  // Query for duplicate flyer when we detect one
  const duplicateFlyer = useQuery(
    api.flyers.queries.getFlyerByHash,
    duplicateHash ? { fileHash: duplicateHash } : "skip"
  );

  // Fetch provider status on mount
  useEffect(() => {
    async function fetchProviderStatus() {
      try {
        const response = await fetch("/api/ai/extract-flyer-data");
        if (response.ok) {
          const data = await response.json();
          setProvidersInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch provider status:", error);
      }
    }
    fetchProviderStatus();
  }, []);

  // Initialize editedData when draftFlyers loads
  useEffect(() => {
    if (draftFlyers) {
      const initialData: Record<string, any> = {};
      draftFlyers.forEach((flyer) => {
        if (!editedData[flyer._id]) {
          initialData[flyer._id] = { ...flyer.extractedData };
        }
      });
      if (Object.keys(initialData).length > 0) {
        setEditedData((prev) => ({ ...prev, ...initialData }));
      }
    }
  }, [draftFlyers]);

  // Auto-dismiss duplicate alert after 5 seconds
  useEffect(() => {
    if (duplicateHash) {
      const timer = setTimeout(() => {
        setDuplicateHash(null);
        setDuplicateFile(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [duplicateHash]);

  // Filter drafts based on search
  const filteredDrafts = draftFlyers?.filter((flyer) => {
    if (!searchQuery) return true;
    const data = editedData[flyer._id] || flyer.extractedData;
    const searchLower = searchQuery.toLowerCase();
    return (
      flyer.filename.toLowerCase().includes(searchLower) ||
      data?.eventName?.toLowerCase().includes(searchLower) ||
      data?.city?.toLowerCase().includes(searchLower) ||
      data?.venueName?.toLowerCase().includes(searchLower)
    );
  });

  const processFlyer = async (flyer: UploadedFlyer) => {
    setFlyers((prev) => prev.map((f) => (f.id === flyer.id ? { ...f, status: "uploading" } : f)));

    try {
      const formData = new FormData();
      formData.append("file", flyer.file);

      const response = await fetch("/api/admin/upload-flyer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.isDuplicate) {
          if (errorData.fileHash) {
            setDuplicateHash(errorData.fileHash);
            setDuplicateFile(flyer.file);
          }

          setTimeout(() => {
            setFlyers((prev) => prev.filter((f) => f.id !== flyer.id));
          }, 2000);

          throw new Error(
            errorData.message || "Duplicate flyer - this file has already been uploaded"
          );
        }
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      const logResult = await logFlyer({
        filename: data.filename,
        fileHash: data.hash,
        filepath: data.path,
        originalSize: data.originalSize,
        optimizedSize: data.optimizedSize,
      });

      setFlyers((prev) =>
        prev.map((f) =>
          f.id === flyer.id
            ? {
                ...f,
                status: "extracting",
                optimizedSize: data.optimizedSize,
                flyerId: logResult.flyerId,
                filepath: data.path,
              }
            : f
        )
      );

      // Extract with selected provider
      try {
        const providerLabel =
          selectedProvider === "auto"
            ? "AI (auto-select)"
            : selectedProvider === "ollama"
              ? "Ollama"
              : "Gemini";

        setFlyers((prev) =>
          prev.map((f) =>
            f.id === flyer.id
              ? {
                  ...f,
                  status: "extracting",
                  extractionProgress: `Reading flyer with ${providerLabel}...`,
                }
              : f
          )
        );

        const extractUrl =
          selectedProvider === "auto"
            ? "/api/ai/extract-flyer-data"
            : `/api/ai/extract-flyer-data?provider=${selectedProvider}`;

        const extractResponse = await fetch(extractUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filepath: data.path }),
        });

        const extractData = await extractResponse.json();

        let extractedData: any;
        let provider = extractData.provider;
        let fallbackUsed = extractData.fallbackUsed;

        if (!extractResponse.ok && extractData.error === "INCOMPLETE_FLYER_DATA") {
          if (extractData.partialData && Object.keys(extractData.partialData).length > 0) {
            extractedData = extractData.partialData;
          } else {
            throw new Error(extractData.message || "AI extraction failed: Missing required fields");
          }
        } else if (!extractResponse.ok) {
          throw new Error(extractData.details || extractData.error || "AI extraction failed");
        } else {
          extractedData = extractData.extractedData;
        }

        // Save extracted data to database
        await updateExtractedData({
          flyerId: logResult.flyerId,
          extractedData: extractedData,
        });

        // Initialize editable data for this flyer
        setEditedData((prev) => ({
          ...prev,
          [logResult.flyerId]: { ...extractedData },
        }));

        setFlyers((prev) =>
          prev.map((f) =>
            f.id === flyer.id
              ? {
                  ...f,
                  status: "success",
                  extractedData: extractedData,
                  extractionProgress: undefined,
                  provider,
                  fallbackUsed,
                }
              : f
          )
        );

        if (autoProcess) {
          try {
            await autoCreateEvent({ flyerId: logResult.flyerId });
          } catch (publishError) {
            console.error("Auto-publish failed:", publishError);
          }
        }

        setTimeout(() => {
          setFlyers((prev) => prev.filter((f) => f.id !== flyer.id));
        }, 2000);
      } catch (aiError) {
        setFlyers((prev) =>
          prev.map((f) =>
            f.id === flyer.id
              ? {
                  ...f,
                  status: "error",
                  errorMessage: aiError instanceof Error ? aiError.message : "AI processing failed",
                  extractionProgress: undefined,
                }
              : f
          )
        );
      }
    } catch (error) {
      setFlyers((prev) =>
        prev.map((f) =>
          f.id === flyer.id
            ? {
                ...f,
                status: "error",
                errorMessage: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFlyers = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));
      setFlyers((prev) => [...prev, ...newFlyers]);

      if (autoProcess) {
        for (const flyer of newFlyers) {
          processFlyer(flyer);
        }
      }
    },
    [autoProcess, selectedProvider]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const removeFlyer = (id: string) => {
    setFlyers((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDeleteFlyer = async (flyerId: Id<"uploadedFlyers">) => {
    try {
      await deleteFlyer({ flyerId });
      // Remove from editedData
      setEditedData((prev) => {
        const newData = { ...prev };
        delete newData[flyerId];
        return newData;
      });
      setDuplicateHash(null);
      setDuplicateFile(null);
    } catch (error) {
      console.error("Failed to delete flyer:", error);
      alert(
        "Failed to delete flyer: " + (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleSaveAndPublish = async (flyerId: Id<"uploadedFlyers">) => {
    const dataToSave = editedData[flyerId];
    if (!dataToSave) return;

    setSavingFlyer(flyerId);

    try {
      // First save the edited data
      await updateExtractedData({
        flyerId,
        extractedData: dataToSave,
      });

      // Then create the event
      await autoCreateEvent({ flyerId });

      // Remove from editedData after successful publish
      setEditedData((prev) => {
        const newData = { ...prev };
        delete newData[flyerId];
        return newData;
      });
    } catch (error) {
      alert(
        "Failed to publish event: " + (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setSavingFlyer(null);
    }
  };

  const handleRetryExtraction = async (flyerId: Id<"uploadedFlyers">, filepath: string) => {
    try {
      const extractUrl =
        selectedProvider === "auto"
          ? "/api/ai/extract-flyer-data"
          : `/api/ai/extract-flyer-data?provider=${selectedProvider}`;

      const extractResponse = await fetch(extractUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filepath }),
      });

      const extractData = await extractResponse.json();

      let extractedData: any;

      if (!extractResponse.ok && extractData.error === "INCOMPLETE_FLYER_DATA") {
        if (extractData.partialData && Object.keys(extractData.partialData).length > 0) {
          extractedData = extractData.partialData;
        } else {
          throw new Error(extractData.message || "AI extraction failed: Missing required fields");
        }
      } else if (!extractResponse.ok) {
        throw new Error(extractData.details || extractData.error || "AI extraction failed");
      } else {
        extractedData = extractData.extractedData;
      }

      await updateExtractedData({
        flyerId: flyerId,
        extractedData: extractedData,
      });

      // Update local edited data
      setEditedData((prev) => ({
        ...prev,
        [flyerId]: { ...extractedData },
      }));
    } catch (error) {
      alert("Retry failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleBulkPublish = async () => {
    for (const flyerId of selectedFlyers) {
      const dataToSave = editedData[flyerId];
      if (dataToSave) {
        try {
          await updateExtractedData({
            flyerId: flyerId as Id<"uploadedFlyers">,
            extractedData: dataToSave,
          });
          await autoCreateEvent({ flyerId: flyerId as Id<"uploadedFlyers"> });
        } catch (error) {
          console.error(`Failed to publish ${flyerId}:`, error);
        }
      }
    }
    setSelectedFlyers(new Set());
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFlyers.size} flyer(s)?`)) return;

    for (const flyerId of selectedFlyers) {
      try {
        await deleteFlyer({ flyerId: flyerId as Id<"uploadedFlyers"> });
      } catch (error) {
        console.error(`Failed to delete ${flyerId}:`, error);
      }
    }
    setSelectedFlyers(new Set());
  };

  const toggleFlyerSelection = (flyerId: string) => {
    const newSelection = new Set(selectedFlyers);
    if (newSelection.has(flyerId)) {
      newSelection.delete(flyerId);
    } else {
      newSelection.add(flyerId);
    }
    setSelectedFlyers(newSelection);
  };

  const updateField = (flyerId: string, field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [flyerId]: {
        ...prev[flyerId],
        [field]: value,
      },
    }));
  };

  const toggleCategory = (flyerId: string, category: string) => {
    const currentCategories = editedData[flyerId]?.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    updateField(flyerId, "categories", newCategories);
  };

  // Confidence badge component
  const ConfidenceBadge = ({ data }: { data: any }) => {
    if (!data) return null;
    const confidence = getExtractionConfidence(data);
    const color =
      confidence >= 80
        ? "bg-green-100 text-green-700"
        : confidence >= 50
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        {confidence}% confidence
      </span>
    );
  };

  // Provider badge component
  const ProviderBadge = ({ provider, fallback }: { provider?: string; fallback?: boolean }) => {
    if (!provider) return null;
    const isGemini = provider.includes("gemini");
    const icon = isGemini ? <Cloud className="w-3 h-3" /> : <Server className="w-3 h-3" />;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        {icon}
        {isGemini ? "Gemini" : "Ollama"}
        {fallback && " (fallback)"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                AI Flyer Manager
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Upload flyers, review AI-extracted data, edit fields, and publish events
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* AI Provider Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
                <label className="text-xs font-medium text-slate-500 block mb-1">AI Provider</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                    className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="auto">Auto (Ollama → Gemini)</option>
                    <option value="ollama" disabled={!providersInfo?.ollama.available}>
                      Ollama {providersInfo?.ollama.available ? "" : "(offline)"}
                    </option>
                    <option value="gemini" disabled={!providersInfo?.gemini.available}>
                      Gemini {providersInfo?.gemini.available ? "" : "(no key)"}
                    </option>
                  </select>
                  {providersInfo && (
                    <div className="flex gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${providersInfo.ollama.available ? "bg-green-400" : "bg-red-400"}`}
                        title={providersInfo.ollama.available ? "Ollama online" : "Ollama offline"}
                      />
                      <span
                        className={`w-2 h-2 rounded-full ${providersInfo.gemini.available ? "bg-green-400" : "bg-gray-300"}`}
                        title={
                          providersInfo.gemini.available
                            ? "Gemini configured"
                            : "Gemini not configured"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-Process Toggle */}
              <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Auto-Process</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {autoProcess ? "ON" : "OFF"}
                  </p>
                </div>
                <button
                  onClick={() => setAutoProcess(!autoProcess)}
                  className={`
                    relative w-14 h-8 rounded-full transition-all duration-300 flex items-center
                    ${autoProcess ? "bg-green-500" : "bg-slate-300"}
                  `}
                >
                  <div
                    className={`
                      absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300
                      ${autoProcess ? "translate-x-7" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {flyerStats && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <p className="text-sm font-medium text-slate-500">Total Uploaded</p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {flyerStats.flyers.totalUploaded}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <p className="text-sm font-medium text-slate-500">AI Processed</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {flyerStats.flyers.aiProcessed}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <p className="text-sm font-medium text-slate-500">Pending Review</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{draftFlyers?.length || 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-slate-500">Events Created</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {flyerStats.flyers.eventsCreated}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upload Dropzone */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-500" />
            Upload New Flyers
          </h2>

          <div
            {...(getRootProps() as React.HTMLAttributes<HTMLDivElement>)}
            className={`
              border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all
              ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                  : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
              }
            `}
          >
            <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
            <Upload
              className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${isDragActive ? "text-indigo-500" : "text-slate-400"}`}
            />
            {isDragActive ? (
              <p className="text-lg sm:text-xl text-indigo-600 font-semibold">
                Drop your flyers here!
              </p>
            ) : (
              <>
                <p className="text-lg sm:text-xl text-slate-700 font-semibold mb-2">
                  Drag & Drop Flyers
                </p>
                <p className="text-sm text-slate-500 mb-3">or click to browse your computer</p>
                <p className="text-xs text-slate-400">
                  JPG, PNG, WEBP • Multiple files OK • Will use{" "}
                  {selectedProvider === "auto" ? "Ollama (with Gemini fallback)" : selectedProvider}
                </p>
              </>
            )}
          </div>

          {/* Duplicate Alert */}
          <AnimatePresence>
            {duplicateHash && duplicateFlyer && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-800">
                      Duplicate Flyer Detected
                    </h3>
                    <p className="text-sm text-amber-700">
                      This flyer has already been uploaded. Check the drafts below.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDuplicateHash(null);
                      setDuplicateFile(null);
                    }}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Queue */}
          {flyers.length > 0 && (
            <div className="mt-6 space-y-3">
              <AnimatePresence>
                {flyers.map((flyer) => (
                  <motion.div
                    key={flyer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <img
                      src={flyer.preview}
                      alt={flyer.file.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {flyer.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(flyer.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {flyer.extractionProgress && (
                        <p className="text-xs text-indigo-600 mt-1">{flyer.extractionProgress}</p>
                      )}
                      {flyer.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{flyer.errorMessage}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {flyer.status === "pending" && !autoProcess && (
                        <button
                          onClick={() => processFlyer(flyer)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Process
                        </button>
                      )}
                      {flyer.status === "pending" && (
                        <button
                          onClick={() => removeFlyer(flyer.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {(flyer.status === "uploading" || flyer.status === "extracting") && (
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      )}
                      {flyer.status === "success" && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <ProviderBadge provider={flyer.provider} fallback={flyer.fallbackUsed} />
                        </div>
                      )}
                      {flyer.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Draft Flyers Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Review & Edit Extracted Data ({filteredDrafts?.length || 0})
            </h2>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Bulk Actions */}
              {selectedFlyers.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{selectedFlyers.size} selected</span>
                  <button
                    onClick={handleBulkPublish}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Publish All
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </button>
                </div>
              )}
            </div>
          </div>

          {!filteredDrafts || filteredDrafts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">No draft flyers</p>
              <p className="text-sm text-slate-400">Upload flyers above to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDrafts.map((flyer) => {
                const data = editedData[flyer._id] || flyer.extractedData || {};
                const isSelected = selectedFlyers.has(flyer._id);
                const isSaving = savingFlyer === flyer._id;

                return (
                  <motion.div
                    key={flyer._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                      isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"
                    }`}
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-0">
                      {/* Flyer Image */}
                      <div className="xl:col-span-3 bg-slate-100 p-4 flex flex-col items-center relative">
                        {/* Selection Checkbox */}
                        <div className="absolute top-4 left-4 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFlyerSelection(flyer._id)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="w-full max-w-xs">
                          <img
                            src={flyer.filepath}
                            alt={flyer.filename}
                            className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setImagePreview(flyer.filepath)}
                          />
                          <div className="flex flex-col items-center gap-2 mt-3">
                            <button
                              onClick={() => setImagePreview(flyer.filepath)}
                              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View full size
                            </button>
                            <ConfidenceBadge data={data} />
                          </div>
                        </div>
                      </div>

                      {/* Editable Form Fields */}
                      <div className="xl:col-span-9 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-4">
                            {/* Event Name */}
                            <div>
                              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Event Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={data.eventName || ""}
                                onChange={(e) => updateField(flyer._id, "eventName", e.target.value)}
                                placeholder="e.g., Chicago Summer Steppers Set 2025"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                              />
                            </div>

                            {/* Event Type */}
                            <div>
                              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-slate-400" />
                                Event Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={data.eventType || "TICKETED_EVENT"}
                                onChange={(e) => updateField(flyer._id, "eventType", e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                              >
                                {EVENT_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={data.eventDate || data.date || ""}
                                  onChange={(e) => updateField(flyer._id, "eventDate", e.target.value)}
                                  placeholder="e.g., Saturday, January 25, 2025"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={data.eventTime || data.time || ""}
                                  onChange={(e) => updateField(flyer._id, "eventTime", e.target.value)}
                                  placeholder="e.g., 8:00 PM"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                            </div>

                            {/* End Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  End Date
                                </label>
                                <input
                                  type="text"
                                  value={data.eventEndDate || ""}
                                  onChange={(e) => updateField(flyer._id, "eventEndDate", e.target.value)}
                                  placeholder="For multi-day events"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  End Time
                                </label>
                                <input
                                  type="text"
                                  value={data.eventEndTime || ""}
                                  onChange={(e) => updateField(flyer._id, "eventEndTime", e.target.value)}
                                  placeholder="e.g., 2:00 AM"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                            </div>

                            {/* Capacity & Door Price */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  Capacity
                                </label>
                                <input
                                  type="text"
                                  value={data.capacity || ""}
                                  onChange={(e) => updateField(flyer._id, "capacity", e.target.value)}
                                  placeholder="e.g., 500"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4 text-slate-400" />
                                  Door Price
                                </label>
                                <input
                                  type="text"
                                  value={data.doorPrice || data.ageRestriction || ""}
                                  onChange={(e) => updateField(flyer._id, "doorPrice", e.target.value)}
                                  placeholder="e.g., $20 at the door"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            {/* Venue */}
                            <div>
                              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Venue Name
                              </label>
                              <input
                                type="text"
                                value={data.venueName || ""}
                                onChange={(e) => updateField(flyer._id, "venueName", e.target.value)}
                                placeholder="e.g., The Grand Ballroom"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                              />
                            </div>

                            {/* Address */}
                            <div>
                              <label className="text-sm font-medium text-slate-700 mb-1 block">
                                Street Address
                              </label>
                              <input
                                type="text"
                                value={data.address || ""}
                                onChange={(e) => updateField(flyer._id, "address", e.target.value)}
                                placeholder="123 Main Street"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                              />
                            </div>

                            {/* City, State, ZIP */}
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  City <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={data.city || ""}
                                  onChange={(e) => updateField(flyer._id, "city", e.target.value)}
                                  placeholder="Chicago"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  State <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={data.state || ""}
                                  onChange={(e) => updateField(flyer._id, "state", e.target.value)}
                                  placeholder="IL"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                  ZIP Code
                                </label>
                                <input
                                  type="text"
                                  value={data.zipCode || ""}
                                  onChange={(e) => updateField(flyer._id, "zipCode", e.target.value)}
                                  placeholder="60601"
                                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                              </div>
                            </div>

                            {/* Categories */}
                            <div>
                              <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Categories (Select all that apply)
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {EVENT_CATEGORIES.map((category) => {
                                  const isActive = (data.categories || []).includes(category);
                                  return (
                                    <button
                                      key={category}
                                      type="button"
                                      onClick={() => toggleCategory(flyer._id, category)}
                                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        isActive
                                          ? "bg-indigo-600 text-white"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      {category}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description - Full Width */}
                        <div className="mt-6">
                          <label className="text-sm font-medium text-slate-700 mb-1 block">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={data.description || ""}
                            onChange={(e) => updateField(flyer._id, "description", e.target.value)}
                            placeholder="Describe your event, what attendees can expect, special guests, etc..."
                            rows={6}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-y"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                          <button
                            onClick={() => handleSaveAndPublish(flyer._id)}
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                Save & Publish Event
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRetryExtraction(flyer._id, flyer.filepath)}
                            className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-all flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Re-scan with AI
                          </button>
                          <button
                            onClick={() => handleDeleteFlyer(flyer._id)}
                            className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setImagePreview(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={imagePreview}
              alt="Flyer Preview"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
