"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Save,
  Loader2,
  DollarSign,
  Home,
  Layers,
  FileText,
  Building,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useUpdateRealEstateListing,
  useGetRealEstateListingById,
  applyPropertyOverrides,
} from "@/src/hooks/listing/useRealEstateListingQueries";

interface PropertyEditModalProps {
  open: boolean;
  onClose: () => void;
  property?: any;
  documentId?: string;
  onSuccess?: () => void;
}

export default function PropertyEditModal({
  open,
  onClose,
  property,
  documentId,
  onSuccess,
}: PropertyEditModalProps) {
  const updateMutation = useUpdateRealEstateListing();

  // Resolve target document ID from prop or property object
  const docId = useMemo(() => {
    return (
      documentId ||
      (typeof property === "string"
        ? property
        : property?.documentId ||
          property?.real_estate_board?.documentId ||
          property?.realEstateDocId ||
          property?.id)
    );
  }, [documentId, property]);

  // Fetch complete details by documentId
  const {
    data: fetchedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetRealEstateListingById((docId as string) || "", {
    select: (res: any) => {
      const raw = res?.data || res;
      if (raw?.attributes) {
        return {
          id: raw.id,
          documentId: raw.documentId || raw.id,
          ...raw.attributes,
        };
      }
      return raw;
    },
    enabled: open && !!docId,
  });

  // Active property with local overrides applied
  const currentProperty = useMemo(() => {
    const base =
      fetchedData || (typeof property === "object" ? property : null);
    return applyPropertyOverrides(base);
  }, [fetchedData, property]);

  const [formData, setFormData] = useState({
    price: "",
    old_price: "",
    standard_status: "Active",
    property_sub_type: "",
    structure_type: "",
    address: "",
    city: "",
    state: "British Columbia",
    postal_code: "",
    office_name: "",
    bedrooms: "",
    bathrooms: "",
    Living_area: "",
    living_area_units: "square feet",
    lot_size_area: "",
    lot_size_units: "square feet",
    YearBuilt: "",
    fee: "",
    annual_tax: "",
    public_remarks: "",
    heating: "",
    cooling: "",
    view: "",
    appliances: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [lastPopulatedDocId, setLastPopulatedDocId] = useState<string | null>(null);

  // Populate form from currentProperty
  useEffect(() => {
    if (!open) {
      setIsDirty(false);
      setLastPopulatedDocId(null);
      return;
    }

    if (currentProperty && (!isDirty || lastPopulatedDocId !== docId)) {
      const raw = currentProperty.raw_data || {};
      setFormData({
        price: currentProperty.price ? String(currentProperty.price) : "",
        old_price: currentProperty.old_price ? String(currentProperty.old_price) : "",
        standard_status:
          currentProperty.standard_status || currentProperty.status || "Active",
        property_sub_type: currentProperty.property_sub_type || "",
        structure_type: currentProperty.structure_type || "",
        address: currentProperty.address || "",
        city: currentProperty.city || "",
        state: currentProperty.state || "British Columbia",
        postal_code: currentProperty.postal_code || "",
        office_name: currentProperty.office_name || "",
        bedrooms:
          currentProperty.bedrooms != null ? String(currentProperty.bedrooms) : "",
        bathrooms:
          currentProperty.bathrooms != null
            ? String(currentProperty.bathrooms)
            : "",
        Living_area:
          currentProperty.Living_area != null
            ? String(currentProperty.Living_area)
            : "",
        living_area_units: currentProperty.living_area_units || "square feet",
        lot_size_area:
          currentProperty.lot_size_area != null
            ? String(currentProperty.lot_size_area)
            : "",
        lot_size_units: currentProperty.lot_size_units || "square feet",
        YearBuilt: raw.YearBuilt != null ? String(raw.YearBuilt) : "",
        fee:
          currentProperty.fee != null
            ? String(currentProperty.fee)
            : raw.AssociationFee != null
            ? String(raw.AssociationFee)
            : "",
        annual_tax:
          currentProperty.annual_tax != null
            ? String(currentProperty.annual_tax)
            : "",
        public_remarks:
          currentProperty.public_remarks || raw.PublicRemarks || "",
        heating: Array.isArray(raw.Heating)
          ? raw.Heating.join(", ")
          : raw.Heating || "",
        cooling: Array.isArray(raw.Cooling)
          ? raw.Cooling.join(", ")
          : raw.Cooling || "",
        view: Array.isArray(raw.View) ? raw.View.join(", ") : raw.View || "",
        appliances: Array.isArray(raw.Appliances)
          ? raw.Appliances.join(", ")
          : raw.Appliances || "",
      });
      setLastPopulatedDocId(docId || null);
    }
  }, [open, docId, currentProperty, isDirty, lastPopulatedDocId]);

  if (!open) return null;

  // Loading state when initial property data is not yet available
  if (!currentProperty && isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 border border-gray-100">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Loading Property Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Fetching details for Document ID:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {docId || "..."}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Error state when no property could be loaded
  if (!currentProperty && error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 border border-gray-100">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Failed to Load Property Details
            </h3>
            <p className="text-xs text-rose-600 mt-1">
              {error?.message || "Could not fetch details by documentId."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary2 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProperty) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId =
      docId ||
      currentProperty.documentId ||
      currentProperty.id ||
      currentProperty.listing_id;
    if (!targetId) return;

    // Prepare update payload
    const payload: any = {
      price: formData.price,
      old_price: formData.old_price,
      standard_status: formData.standard_status,
      property_sub_type: formData.property_sub_type,
      structure_type: formData.structure_type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      office_name: formData.office_name,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      Living_area: formData.Living_area ? Number(formData.Living_area) : null,
      living_area_units: formData.living_area_units,
      lot_size_area: formData.lot_size_area
        ? Number(formData.lot_size_area)
        : null,
      lot_size_units: formData.lot_size_units,
      fee: formData.fee ? Number(formData.fee) : 0,
      annual_tax: formData.annual_tax ? Number(formData.annual_tax) : 0,
      public_remarks: formData.public_remarks,
      raw_data: {
        ...(currentProperty.raw_data || {}),
        YearBuilt: formData.YearBuilt ? Number(formData.YearBuilt) : null,
        AssociationFee: formData.fee ? Number(formData.fee) : 0,
        Heating: formData.heating
          ? formData.heating.split(",").map((s) => s.trim())
          : [],
        Cooling: formData.cooling
          ? formData.cooling.split(",").map((s) => s.trim())
          : [],
        View: formData.view
          ? formData.view.split(",").map((s) => s.trim())
          : [],
        Appliances: formData.appliances
          ? formData.appliances.split(",").map((s) => s.trim())
          : [],
      },
    };

    try {
      await updateMutation.mutateAsync({ id: String(targetId), data: payload });
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      // Handled by onError in hook
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Edit Property Details
              </h2>
              {isFetching && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" /> Syncing Details...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Document ID:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {currentProperty.documentId || docId}
              </span>{" "}
              • {currentProperty.address || "No Address"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="edit-property-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* SECTION 1: STATUS & CLASSIFICATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Status & Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="standard_status"
                  value={formData.standard_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
                >
                  <option value="Active">Active / For Sale</option>
                  <option value="Sold">Sold</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Property Sub Type
                </label>
                <input
                  type="text"
                  name="property_sub_type"
                  value={formData.property_sub_type}
                  onChange={handleChange}
                  placeholder="e.g. Single Family, Condo, Townhouse"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Structure Type
                </label>
                <input
                  type="text"
                  name="structure_type"
                  value={formData.structure_type}
                  onChange={handleChange}
                  placeholder="e.g. Townhouse, Apartment, House"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & FINANCIALS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Pricing & Financials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="850000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Old / Original Price ($)
                </label>
                <input
                  type="number"
                  name="old_price"
                  value={formData.old_price}
                  onChange={handleChange}
                  placeholder="890000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Maintenance / HOA Fee ($)
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="350"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Annual Property Tax ($)
                </label>
                <input
                  type="number"
                  name="annual_tax"
                  value={formData.annual_tax}
                  onChange={handleChange}
                  placeholder="3200"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION & BROKERAGE */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Location & Office
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Example Street"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City / Municipality
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Vancouver"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="V8R 3B7"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Province / State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="British Columbia"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Listing Office Name
                </label>
                <input
                  type="text"
                  name="office_name"
                  value={formData.office_name}
                  onChange={handleChange}
                  placeholder="Real Broker B.C. Ltd."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SPECIFICATIONS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="3"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Living Area (sqft)
                </label>
                <input
                  type="number"
                  name="Living_area"
                  value={formData.Living_area}
                  onChange={handleChange}
                  placeholder="1450"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  name="YearBuilt"
                  value={formData.YearBuilt}
                  onChange={handleChange}
                  placeholder="2020"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lot Size Area
                </label>
                <input
                  type="number"
                  name="lot_size_area"
                  value={formData.lot_size_area}
                  onChange={handleChange}
                  placeholder="5500"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lot Size Units
                </label>
                <select
                  name="lot_size_units"
                  value={formData.lot_size_units}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
                >
                  <option value="square feet">square feet</option>
                  <option value="acres">acres</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 5: FEATURES & AMENITIES */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Features (Comma Separated)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Heating
                </label>
                <input
                  type="text"
                  name="heating"
                  value={formData.heating}
                  onChange={handleChange}
                  placeholder="Heat Pump, Baseboard, Electric"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cooling
                </label>
                <input
                  type="text"
                  name="cooling"
                  value={formData.cooling}
                  onChange={handleChange}
                  placeholder="Air Conditioned, Central Air"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  View
                </label>
                <input
                  type="text"
                  name="view"
                  value={formData.view}
                  onChange={handleChange}
                  placeholder="Mountain view, Ocean view, City view"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Appliances
                </label>
                <input
                  type="text"
                  name="appliances"
                  value={formData.appliances}
                  onChange={handleChange}
                  placeholder="Washer, Dryer, Dishwasher, Microwave"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: PUBLIC REMARKS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Description / Public Remarks
            </h3>
            <div>
              <textarea
                name="public_remarks"
                value={formData.public_remarks}
                onChange={handleChange}
                rows={5}
                placeholder="Enter complete marketing description of the property..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-property-form"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary2 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
