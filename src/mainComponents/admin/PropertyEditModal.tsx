"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  DollarSign,
  Home,
  Layers,
  FileText,
  Building,
} from "lucide-react";
import { useUpdateRealEstateListing } from "@/src/hooks/listing/useRealEstateListingQueries";

interface PropertyEditModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onSuccess?: () => void;
}

export default function PropertyEditModal({
  open,
  onClose,
  property,
  onSuccess,
}: PropertyEditModalProps) {
  const updateMutation = useUpdateRealEstateListing();

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

  useEffect(() => {
    if (property) {
      const raw = property.raw_data || {};
      setFormData({
        price: property.price ? String(property.price) : "",
        old_price: property.old_price ? String(property.old_price) : "",
        standard_status: property.standard_status || property.status || "Active",
        property_sub_type: property.property_sub_type || "",
        structure_type: property.structure_type || "",
        address: property.address || "",
        city: property.city || "",
        state: property.state || "British Columbia",
        postal_code: property.postal_code || "",
        office_name: property.office_name || "",
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
        bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
        Living_area: property.Living_area != null ? String(property.Living_area) : "",
        living_area_units: property.living_area_units || "square feet",
        lot_size_area: property.lot_size_area != null ? String(property.lot_size_area) : "",
        lot_size_units: property.lot_size_units || "square feet",
        YearBuilt: raw.YearBuilt != null ? String(raw.YearBuilt) : "",
        fee: property.fee != null ? String(property.fee) : raw.AssociationFee != null ? String(raw.AssociationFee) : "",
        annual_tax: property.annual_tax != null ? String(property.annual_tax) : "",
        public_remarks: property.public_remarks || raw.PublicRemarks || "",
        heating: Array.isArray(raw.Heating) ? raw.Heating.join(", ") : raw.Heating || "",
        cooling: Array.isArray(raw.Cooling) ? raw.Cooling.join(", ") : raw.Cooling || "",
        view: Array.isArray(raw.View) ? raw.View.join(", ") : raw.View || "",
        appliances: Array.isArray(raw.Appliances) ? raw.Appliances.join(", ") : raw.Appliances || "",
      });
    }
  }, [property]);

  if (!open || !property) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = property.documentId || property.id || property.listing_id;
    if (!id) return;

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
      lot_size_area: formData.lot_size_area ? Number(formData.lot_size_area) : null,
      lot_size_units: formData.lot_size_units,
      fee: formData.fee ? Number(formData.fee) : 0,
      annual_tax: formData.annual_tax ? Number(formData.annual_tax) : 0,
      public_remarks: formData.public_remarks,
      raw_data: {
        ...(property.raw_data || {}),
        YearBuilt: formData.YearBuilt ? Number(formData.YearBuilt) : null,
        AssociationFee: formData.fee ? Number(formData.fee) : 0,
        Heating: formData.heating ? formData.heating.split(",").map((s) => s.trim()) : [],
        Cooling: formData.cooling ? formData.cooling.split(",").map((s) => s.trim()) : [],
        View: formData.view ? formData.view.split(",").map((s) => s.trim()) : [],
        Appliances: formData.appliances ? formData.appliances.split(",").map((s) => s.trim()) : [],
      },
    };

    try {
      await updateMutation.mutateAsync({ id: String(id), data: payload });
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
            <h2 className="text-lg font-bold text-gray-900">Edit Property Details</h2>
            <p className="text-xs text-gray-500">
              Listing ID: {property.listing_id || property.documentId} • {property.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="edit-property-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: STATUS & CLASSIFICATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Status & Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status *</label>
                <select
                  name="standard_status"
                  value={formData.standard_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="Active">Active / For Sale</option>
                  <option value="Sold">Sold</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Property Sub Type</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Structure Type</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($) *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Old / Original Price ($)</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Maintenance / HOA Fee ($)</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Property Tax ($)</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Address *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">City / Municipality</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Province / State</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Listing Office Name</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Living Area (sqft)</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Year Built</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lot Size Area</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lot Size Units</label>
                <select
                  name="lot_size_units"
                  value={formData.lot_size_units}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Heating</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cooling</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">View</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appliances</label>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-property-form"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary2 rounded-xl shadow-xs transition disabled:opacity-50"
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
