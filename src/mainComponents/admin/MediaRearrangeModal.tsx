"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Star,
  Trash2,
  Plus,
  Save,
  Loader2,
  ImageIcon,
  GripVertical,
  RotateCcw,
  Check,
} from "lucide-react";
import { useUpdateRealEstateListing } from "@/src/hooks/listing/useRealEstateListingQueries";
import { toast } from "react-toastify";

interface MediaRearrangeModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onSuccess?: () => void;
}

export default function MediaRearrangeModal({
  open,
  onClose,
  property,
  onSuccess,
}: MediaRearrangeModalProps) {
  const updateMutation = useUpdateRealEstateListing();

  // Array of image URLs
  const [imageList, setImageList] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (property) {
      const extracted: string[] = [];
      if (Array.isArray(property.media_url)) {
        extracted.push(...property.media_url);
      } else if (typeof property.media_url === "string") {
        extracted.push(property.media_url);
      } else if (Array.isArray(property.media)) {
        property.media.forEach((m: any) => {
          const u = m?.MediaURL || m?.url || m?.src;
          if (u) extracted.push(u);
        });
      }
      setImageList(extracted);
      setHasChanges(false);
    }
  }, [property]);

  if (!open || !property) return null;

  // Move item in array helper
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageList.length) return;
    const updated = [...imageList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImageList(updated);
    setHasChanges(true);
  };

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Make cover (move to index 0)
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    moveItem(index, 0);
  };

  // Delete image
  const handleDeleteImage = (index: number) => {
    const updated = imageList.filter((_, i) => i !== index);
    setImageList(updated);
    setHasChanges(true);
  };

  // Add new image URL
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith("http://") && !newImageUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL");
      return;
    }
    setImageList((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setHasChanges(true);
  };

  // Reset to original
  const handleReset = () => {
    const extracted: string[] = [];
    if (Array.isArray(property.media_url)) {
      extracted.push(...property.media_url);
    } else if (typeof property.media_url === "string") {
      extracted.push(property.media_url);
    } else if (Array.isArray(property.media)) {
      property.media.forEach((m: any) => {
        const u = m?.MediaURL || m?.url || m?.src;
        if (u) extracted.push(u);
      });
    }
    setImageList(extracted);
    setHasChanges(false);
  };

  // Save updated order to backend
  const handleSave = async () => {
    const id = property.documentId || property.id || property.listing_id;
    if (!id) return;

    // Create updated media array representation
    const updatedMedia = imageList.map((url, idx) => ({
      MediaURL: url,
      Order: idx,
      MediaCategory: "Photo",
    }));

    const payload = {
      media_url: imageList,
      media: updatedMedia,
    };

    try {
      await updateMutation.mutateAsync({ id: String(id), data: payload });
      setHasChanges(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      // Handled by query mutation error handler
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Rearrange Media Images</h2>
              <p className="text-xs text-gray-500">
                Drag cards or use arrow buttons to change order. Photo #1 will be the primary Cover Photo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar & Add Image */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span>Total Images: {imageList.length}</span>
            {hasChanges && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Order
            </button>

            {/* Add Image input */}
            <form onSubmit={handleAddImage} className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Image URL..."
                className="w-48 sm:w-64 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary2 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image
              </button>
            </form>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {imageList.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-600">No images available for this property</p>
              <p className="text-xs text-gray-400 mt-1">Use the URL input above to add property photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageList.map((url, index) => {
                const isCover = index === 0;
                return (
                  <div
                    key={`${url}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative rounded-xl border overflow-hidden bg-white shadow-xs transition-all duration-200 flex flex-col ${
                      isCover
                        ? "border-amber-400 ring-2 ring-amber-300/40 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    } ${draggedIndex === index ? "opacity-40 scale-95 border-dashed border-primary" : ""}`}
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing">
                      <Image
                        src={url}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover pointer-events-none"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      />

                      {/* Position & Cover Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-extrabold shadow-sm flex items-center gap-1 ${
                            isCover
                              ? "bg-amber-500 text-white"
                              : "bg-black/70 text-white backdrop-blur-xs"
                          }`}
                        >
                          {isCover && <Star className="w-3 h-3 fill-white" />}
                          #{index + 1} {isCover && "• COVER"}
                        </span>
                      </div>

                      {/* Drag Handle indicator */}
                      <div className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded opacity-60 hover:opacity-100">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-1">
                      {/* Move Left / Right */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveItem(index, index - 1)}
                          disabled={index === 0}
                          title="Move Left"
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(index, index + 1)}
                          disabled={index === imageList.length - 1}
                          title="Move Right"
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Make Cover Button */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleMakeCover(index)}
                          title="Set as Cover Photo"
                          className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-lg transition flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          Set Cover
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        title="Delete photo"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            {hasChanges
              ? "You have unsaved changes. Click 'Save Order' to persist."
              : "Image order is up to date."}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending || (!hasChanges && imageList.length === 0)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary2 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Order...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Image Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
