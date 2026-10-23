/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Icons } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CANADIAN_CITY_NAMES,
} from "@/src/utilities/canadianCities";
import {
  MapPin,
  User,
  Mail,
  Maximize2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Building2,
  Navigation,
  Bed,
  Bath,
  ChevronDown,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetAssessmentPropertiesList,
  useGetMe,
} from "@/src/hooks/listing/useListingQueries";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";
import {
  validateCanadianPhoneNumber,
  formatCanadianPhoneInput,
} from "@/src/utilities/phoneValidation";
import {
  submitHomeEvaluationRequest,
  HomeEvaluationPayload,
} from "@/src/api/homeEvaluation/homeEvaluationApi";

// High-resolution Canadian Flag SVG
const CanadaFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className="w-5 h-3.5 rounded-xs shadow-xs object-cover shrink-0"
  >
    <path fill="#d52b1e" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M160 0h320v480H160z" />
    <path
      fill="#d52b1e"
      d="m320 70 17 52 35-15-13 46 45 3-28 37 32 30-49 4-3 48-36-32v57h-10v-57l-36 32-3-48-49-4 32-30-28-37 45-3-13-46 35 15z"
    />
  </svg>
);

interface HomeEvaluationFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  propertySizeInSquareFeet: string;
  lotSize?: string;
  yearBuilt: string;
  city: string;
  postal_code: string;
  bedrooms: string;
  bathrooms: string;
  consent?: boolean;
}

// Custom Form Select Component with modern floating menu
const CustomFormSelect = ({
  icon,
  value,
  placeholder,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full pl-10 pr-9 py-3 bg-gray/15 hover:bg-background focus:bg-background border border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10 rounded-xl text-sm md:text-base text-foreground outline-none transition-all duration-200 cursor-pointer flex items-center justify-between text-left"
      >
        <span className="absolute left-3.5 text-lightWhite pointer-events-none">
          {icon}
        </span>
        <span
          className={
            value
              ? "text-foreground font-medium"
              : "text-lightWhite/70 text-xs md:text-sm"
          }
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={17}
          className={`absolute right-3.5 text-lightWhite transition-transform duration-200 pointer-events-none ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 sm:w-48 bg-background border border-borderColor rounded-xl shadow-lg z-30 p-1 animate-in fade-in zoom-in-95 duration-150 scrollbar-hide">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-lightWhite hover:bg-primary/5 hover:text-primary rounded-lg transition flex items-center justify-between cursor-pointer"
          >
            <span>{placeholder}</span>
            {!value && <Check size={13} className="text-primary" />}
          </button>
          <div className="my-0.5 border-t border-borderColor/60" />
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm rounded-lg transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check size={14} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Searchable Canadian City Combobox (Dropdown + Manual Typing)
const CityCombobox = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return CANADIAN_CITY_NAMES;
    }
    return CANADIAN_CITY_NAMES.filter((name) =>
      name.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (cityName: string) => {
    setQuery(cityName);
    onChange(cityName);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!open) setOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <Building2
          size={17}
          className="absolute left-3.5 text-lightWhite pointer-events-none z-10"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder="e.g. Vancouver"
          className="w-full pl-10 pr-16 py-3 bg-gray/15 hover:bg-background focus:bg-background border border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10 rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200"
        />
        <div className="absolute right-2.5 flex items-center gap-1 z-10">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-lightWhite hover:text-foreground rounded-full hover:bg-gray/40 transition cursor-pointer"
              title="Clear city"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="p-1 text-lightWhite hover:text-primary transition cursor-pointer"
            title="Toggle Canadian cities"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                open ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 sm:w-48 bg-background border border-borderColor rounded-xl shadow-lg z-40 max-h-56 overflow-y-auto scrollbar-hide p-1 animate-in fade-in zoom-in-95 duration-150">
          {filteredCities.length > 0 ? (
            filteredCities.slice(0, 60).map((cityName) => {
              const isSelected =
                value?.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(cityName);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm rounded-lg transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <span className="truncate">{cityName}</span>
                  {isSelected && (
                    <Check size={14} className="text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-lightWhite text-center">
              No city found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HomeEstimationTop = () => {
  const router = useRouter();
  const { isLoggedIn, username, setOpenLogin } = useAuthContext();
  const { data: me } = useGetMe();

  // Step state (1: Property Info, 2: User Info)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form submission state
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<HomeEvaluationFormValues | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // Address suggestions in form
  const [formAddressQuery, setFormAddressQuery] = useState("");
  const [debouncedFormAddress, setDebouncedFormAddress] = useState("");
  const [showFormAddressDropdown, setShowFormAddressDropdown] = useState(false);

  // Navigation loading state
  const [navigating, setNavigating] = useState(false);
  const [navigatingText, setNavigatingText] = useState("Loading…");

  // Prevent background scrolling when thank you modal is open
  useEffect(() => {
    if (showThankYouModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showThankYouModal]);

  // Form Hook
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm<HomeEvaluationFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      propertySizeInSquareFeet: "",
      lotSize: "",
      yearBuilt: "",
      city: "",
      postal_code: "",
      bedrooms: "",
      bathrooms: "",
      consent: false,
    },
    mode: "onBlur",
  });

  const watchAddress = watch("address");
  const watchPhone = watch("phoneNumber");
  const watchCity = watch("city");
  const watchBedrooms = watch("bedrooms");
  const watchBathrooms = watch("bathrooms");
  const watchPropertySize = watch("propertySizeInSquareFeet");
  const watchYearBuilt = watch("yearBuilt");

  // Sync debounced form address query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFormAddress(formAddressQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [formAddressQuery]);

  // Queries
  const { data: formAddressSuggestions } = useGetAssessmentPropertiesList(
    { address: debouncedFormAddress },
    { enabled: debouncedFormAddress.length > 1 },
  );

  // Normalize results lists
  const formSuggestionsList = Array.isArray(formAddressSuggestions?.data)
    ? formAddressSuggestions.data
    : Array.isArray(formAddressSuggestions)
      ? formAddressSuggestions
      : [];

  useEffect(() => {
    if (debouncedFormAddress.length > 1 && formSuggestionsList.length > 0) {
      setShowFormAddressDropdown(true);
    } else if (debouncedFormAddress.length <= 1) {
      setShowFormAddressDropdown(false);
    }
  }, [debouncedFormAddress, formSuggestionsList]);

  // Auto-fill fullName and email if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const detectedFullName =
        me?.fullName ||
        (me?.firstName && me?.lastName
          ? `${me.firstName} ${me.lastName}`.trim()
          : "") ||
        username?.fullName ||
        username?.name ||
        username?.username ||
        "";

      const detectedEmail = me?.email || username?.email || "";
      const detectedPhone =
        me?.phoneNumber ||
        me?.phone ||
        username?.phoneNumber ||
        username?.phone ||
        "";

      if (detectedFullName && !getValues("fullName")) {
        setValue("fullName", detectedFullName, { shouldValidate: true });
      }
      if (detectedEmail && !getValues("email")) {
        setValue("email", detectedEmail, { shouldValidate: true });
      }
      if (detectedPhone && !getValues("phoneNumber")) {
        setValue("phoneNumber", formatCanadianPhoneInput(detectedPhone), {
          shouldValidate: true,
        });
      }
    }
  }, [isLoggedIn, me, username, setValue, getValues]);

  // Format phone number live as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCanadianPhoneInput(rawVal);
    setValue("phoneNumber", formatted, { shouldValidate: true });
  };

  // Step navigation validator
  const handleNextStep = async () => {
    const isValid = await trigger([
      "address",
      "propertySizeInSquareFeet",
      "yearBuilt",
    ]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  // Form submission handler (Called after Step 2)
  const onFormSubmit = async (data: HomeEvaluationFormValues) => {
    setSubmitting(true);
    try {
      const payload: HomeEvaluationPayload = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber.trim().startsWith("+1")
          ? data.phoneNumber.trim()
          : `+1 ${data.phoneNumber.trim()}`,
        address: data.address.trim(),
        propertySizeInSquareFeet: data.propertySizeInSquareFeet.trim(),
        lotSize: data.lotSize?.trim() || undefined,
        yearBuilt: data.yearBuilt?.trim() || undefined,
        city: data.city?.trim() || undefined,
        postal_code: data.postal_code?.trim() || undefined,
        bedrooms: data.bedrooms?.trim() || undefined,
        bathrooms: data.bathrooms?.trim() || undefined,
      };

      await submitHomeEvaluationRequest(payload);

      logPropertySearchActivity({
        propertySearchType: "property_evaluation",
        searchTerm: data.address,
        propertyId: selectedPropertyId || undefined,
      });

      setSubmittedData(data);
      setShowThankYouModal(true);
    } catch (err: any) {
      console.error("Home evaluation submission error:", err);
      toast.error(
        err?.message ||
          "Failed to submit evaluation request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowThankYouModal(false);
    setCurrentStep(1);
    reset({
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      propertySizeInSquareFeet: "",
      lotSize: "",
      yearBuilt: "",
      city: "",
      postal_code: "",
      bedrooms: "",
      bathrooms: "",
      consent: false,
    });
    setFormAddressQuery("");
    setSelectedPropertyId(null);
  };

  const handleSelectFormAddress = (item: any) => {
    setValue("address", item.address || item.title || "", { shouldValidate: true });
    setFormAddressQuery(item.address || item.title || "");
    setShowFormAddressDropdown(false);
    setSelectedPropertyId(item.documentId || item.id || null);

    if (item.floorArea || item.sqft || item.buildingSize) {
      setValue(
        "propertySizeInSquareFeet",
        String(item.floorArea || item.sqft || item.buildingSize),
        { shouldValidate: true },
      );
    }

    const detectedLotSize =
      item.lot_size_area ||
      item.lotSize ||
      item.lotSizeArea ||
      item.raw_data?.LotSizeArea;
    if (detectedLotSize) {
      setValue("lotSize", String(detectedLotSize), {
        shouldValidate: true,
      });
    }

    const detectedYearBuilt =
      item.year_built ||
      item.yearBuilt ||
      item.YearBuilt ||
      item.raw_data?.YearBuilt;
    if (detectedYearBuilt) {
      setValue("yearBuilt", String(detectedYearBuilt), {
        shouldValidate: true,
      });
    }

    if (item.city || item.neighbourhood) {
      setValue("city", item.city || item.neighbourhood || "", {
        shouldValidate: true,
      });
    }

    if (item.postalCode || item.postal_code || item.zip) {
      setValue(
        "postal_code",
        item.postalCode || item.postal_code || item.zip || "",
        { shouldValidate: true },
      );
    }

    if (item.bedrooms || item.beds || item.bedroom) {
      const b = parseInt(String(item.bedrooms || item.beds || item.bedroom), 10);
      const val = !isNaN(b) ? (b >= 5 ? "5+" : String(Math.max(1, b))) : String(item.bedrooms || item.beds || item.bedroom);
      setValue("bedrooms", ["1", "2", "3", "4", "5+"].includes(val) ? val : "", {
        shouldValidate: true,
      });
    }

    if (item.bathrooms || item.baths || item.bathroom) {
      const b = parseInt(String(item.bathrooms || item.baths || item.bathroom), 10);
      const val = !isNaN(b) ? (b >= 5 ? "5+" : String(Math.max(1, b))) : String(item.bathrooms || item.baths || item.bathroom);
      setValue("bathrooms", ["1", "2", "3", "4", "5+"].includes(val) ? val : "", {
        shouldValidate: true,
      });
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {navigating && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full"
            style={{
              border: "3px solid #e5e7eb",
              borderTopColor: "var(--primary)",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <p className="text-sm font-semibold text-primary">{navigatingText}</p>
        </div>
      )}

      {/* Thank You Popup Modal */}
      {showThankYouModal && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-borderColor flex flex-col items-center text-center gap-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-lightWhite hover:text-foreground p-1 rounded-full hover:bg-gray/50 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mt-1">
              <CheckCircle2 size={36} />
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-foreground">
              Thank You! Request Submitted
            </h3>

            <p className="text-sm text-black70 leading-relaxed">
              Your home evaluation request has been successfully received. A detailed property valuation report and market details will be sent directly to your email at{" "}
              <span className="text-primary font-semibold">
                {submittedData?.email}
              </span>
              .
            </p>

            <div className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/20 text-left flex items-start gap-3 mt-1">
              <p className="text-xs md:text-sm text-foreground">
                In the meantime, you can also <strong>explore and search BC Assessment property records</strong> and comparative market trends below!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-center mt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary2 text-white font-bold rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .estimation-dropdown { animation: dropdownSlide 0.18s ease-out both; }
        .estimation-item { transition: background 0.15s ease, padding-left 0.15s ease; }
        .estimation-item:hover { background: rgba(34,85,139,0.07); padding-left: 20px; }
      `}</style>

      <section className="xl:max-w-screen-2xl mx-auto w-full relative xl:pt-53.5 xl:pb-31 md:pt-38.75 md:pb-29 pt-26.5 pb-17 px-6 flex flex-col items-center-safe">
        <h1 className="xl:text-5xl xl:leading-17 md:text-5xl md:leading-14 text-[40px] leading-12 font-bold text-center">
          Get Your Free <span className="text-primary">Home Evaluation</span>
        </h1>

        <Description
          type={IDescriptionTypes.dec16}
          content="Fill out the form below to receive your personalized property valuation report."
          customClasses="xl:mt-5 mt-4 text-center mx-6"
        />

        <div className="xl:mt-8 mt-5 md:w-[82%] lg:w-[76%] xl:w-[70%] w-full md:p-8 p-5 sm:p-6 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] border border-borderColor/60 rounded-2xl flex flex-col gap-y-6 bg-background z-10">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between border-b border-borderColor/60 pb-5">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition cursor-pointer text-left ${
                  currentStep === 1
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:text-primary font-medium"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    currentStep === 1
                      ? "bg-primary text-white shadow-xs"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {currentStep > 1 ? <Check size={14} /> : "1"}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold leading-tight">
                    Property Info
                  </span>
                  <span className="text-[10px] text-lightWhite hidden sm:inline">
                    Specs & address
                  </span>
                </div>
              </button>

              {/* Progress Connector */}
              <div
                className={`w-8 sm:w-12 h-0.5 transition-colors ${
                  currentStep === 2 ? "bg-primary" : "bg-borderColor/80"
                }`}
              />

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={async () => {
                  if (currentStep === 1) {
                    await handleNextStep();
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition text-left ${
                  currentStep === 2
                    ? "bg-primary/10 text-primary font-bold cursor-default"
                    : "text-lightWhite hover:text-foreground font-medium cursor-pointer"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    currentStep === 2
                      ? "bg-primary text-white shadow-xs"
                      : "bg-gray/40 text-foreground"
                  }`}
                >
                  2
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold leading-tight">
                    User Info
                  </span>
                  <span className="text-[10px] text-lightWhite hidden sm:inline">
                    Contact details
                  </span>
                </div>
              </button>
            </div>

            {/* Step Counter Badge */}
            <span className="text-xs font-semibold px-3 py-1 bg-gray/20 rounded-full text-foreground shrink-0">
              Step {currentStep} of 2
            </span>
          </div>

          <form
            onSubmit={(e) => {
              if (currentStep === 1) {
                e.preventDefault();
                handleNextStep();
                return;
              }
              handleSubmit(onFormSubmit)(e);
            }}
            className="flex flex-col gap-y-4.5"
          >
            {/* STEP 1: PROPERTY INFO */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-y-4.5 animate-in fade-in duration-200">
                {/* Row 1: Property Address with Autocomplete Suggestions */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs md:text-sm font-semibold text-foreground">
                    Property Address <span className="text-primary">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin
                      size={18}
                      className="absolute left-3.5 text-primary pointer-events-none"
                    />
                    <input
                      type="text"
                      value={watchAddress || ""}
                      placeholder="Enter property address"
                      className={`w-full pl-10 pr-10 py-3.5 bg-gray/15 hover:bg-background focus:bg-background border rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 ${
                        errors.address
                          ? "border-red-500 ring-2 ring-red-500/20"
                          : "border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10"
                      }`}
                      {...register("address", {
                        required: "Property address is required",
                        onChange: (e) => {
                          setFormAddressQuery(e.target.value);
                          if (e.target.value.trim().length > 1) {
                            setShowFormAddressDropdown(true);
                          } else {
                            setShowFormAddressDropdown(false);
                          }
                        },
                      })}
                      onFocus={() => {
                        if (formSuggestionsList.length > 0) {
                          setShowFormAddressDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowFormAddressDropdown(false), 250);
                      }}
                    />
                  </div>

                  {errors.address && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.address.message}
                    </p>
                  )}

                  {/* Dropdown suggestions */}
                  {showFormAddressDropdown && formSuggestionsList.length > 0 && (
                    <div
                      className="estimation-dropdown absolute left-0 w-full bg-background z-30 max-h-60 overflow-y-auto scrollbar-hide rounded-xl"
                      style={{
                        top: "100%",
                        border: "1px solid var(--borderColor)",
                        marginTop: "6px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                      }}
                    >
                      {formSuggestionsList.map((item: any, index: number) => (
                        <div
                          key={item.documentId || item.id || index}
                          onMouseDown={() => handleSelectFormAddress(item)}
                          className="estimation-item cursor-pointer px-4 py-3 flex items-start gap-3 hover:bg-primary/5"
                          style={{
                            borderBottom:
                              index + 1 < formSuggestionsList.length
                                ? "1px solid var(--borderColor)"
                                : "none",
                          }}
                        >
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {item.address || item.title || item.name}
                            </span>
                            {(item.city || item.neighbourhood) && (
                              <span className="text-xs text-lightWhite mt-0.5">
                                {item.city || item.neighbourhood}
                                {item.floorArea || item.sqft
                                  ? ` • ${item.floorArea || item.sqft} sq ft`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 2: City + Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      City
                    </label>
                    <CityCombobox
                      value={watchCity || ""}
                      onChange={(val) =>
                        setValue("city", val, { shouldValidate: true })
                      }
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Postal Code
                    </label>
                    <div className="relative flex items-center">
                      <Navigation
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="text"
                        {...register("postal_code")}
                        placeholder="e.g. V6B 2W9"
                        className="w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10 rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Property Size + Lot Size Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Size */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Property Size (sq ft) <span className="text-primary">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Maximize2
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="text"
                        {...register("propertySizeInSquareFeet", {
                          required: "Property size is required",
                        })}
                        placeholder="e.g. 1,850"
                        className={`w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 ${
                          errors.propertySizeInSquareFeet
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10"
                        }`}
                      />
                    </div>
                    {errors.propertySizeInSquareFeet && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.propertySizeInSquareFeet.message}
                      </p>
                    )}
                  </div>

                  {/* Lot Size Area (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm font-semibold text-foreground">
                        Lot Size Area
                      </label>
                      <span className="text-[11px] text-lightWhite">Optional</span>
                    </div>
                    <div className="relative flex items-center">
                      <Layers
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="text"
                        {...register("lotSize")}
                        placeholder="e.g. 3,420 sq ft"
                        className="w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10 rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Year Built + Bedrooms + Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year Built (Required) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Year Built <span className="text-primary">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Calendar
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="text"
                        {...register("yearBuilt", {
                          required: "Year built is required",
                          pattern: {
                            value: /^\d{4}$/,
                            message: "Enter a valid 4-digit year (e.g. 2003)",
                          },
                        })}
                        placeholder="e.g. 2003"
                        maxLength={4}
                        className={`w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 ${
                          errors.yearBuilt
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10"
                        }`}
                      />
                    </div>
                    {errors.yearBuilt && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.yearBuilt.message}
                      </p>
                    )}
                  </div>

                  {/* Bedrooms */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Bedrooms
                    </label>
                    <CustomFormSelect
                      icon={<Bed size={17} />}
                      value={watchBedrooms || ""}
                      placeholder="Select Bedrooms"
                      options={["1", "2", "3", "4", "5+"]}
                      onChange={(val) =>
                        setValue("bedrooms", val, { shouldValidate: true })
                      }
                    />
                  </div>

                  {/* Bathrooms */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Bathrooms
                    </label>
                    <CustomFormSelect
                      icon={<Bath size={17} />}
                      value={watchBathrooms || ""}
                      placeholder="Select Bathrooms"
                      options={["1", "2", "3", "4", "5+"]}
                      onChange={(val) =>
                        setValue("bathrooms", val, { shouldValidate: true })
                      }
                    />
                  </div>
                </div>

                {/* Step 1 Next Button */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary2 text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Contact Info</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: USER INFO */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-y-4.5 animate-in fade-in duration-200">
                {/* Selected Property Summary Chip */}
                <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <div className="truncate text-xs sm:text-sm">
                      <span className="font-bold text-foreground">
                        {watchAddress || "Property Selected"}
                      </span>
                      {(watchPropertySize || watchYearBuilt) && (
                        <span className="text-lightWhite ml-2 hidden sm:inline">
                          {watchPropertySize ? `• ${watchPropertySize} sq ft` : ""}
                          {watchYearBuilt ? ` • Built ${watchYearBuilt}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-primary hover:underline shrink-0 ml-3 cursor-pointer"
                  >
                    Edit Property
                  </button>
                </div>

                {/* Row 1: Full Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="text"
                        {...register("fullName", {
                          required: "Full name is required",
                        })}
                        placeholder="Enter full name"
                        className={`w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 ${
                          errors.fullName
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10"
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        size={17}
                        className="absolute left-3.5 text-lightWhite pointer-events-none"
                      />
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Enter a valid email",
                          },
                        })}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-4 py-3 bg-gray/15 hover:bg-background focus:bg-background border rounded-xl text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70 outline-none transition-all duration-200 ${
                          errors.email
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-borderColor/80 focus:border-primary focus:ring-3 focus:ring-primary/10"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Canadian Phone Number with Flag SVG */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-semibold text-foreground">
                      Phone Number <span className="text-primary">*</span>
                    </label>
                    <div
                      className={`flex items-center bg-gray/15 hover:bg-background focus-within:bg-background border rounded-xl overflow-hidden transition-all duration-200 ${
                        errors.phoneNumber
                          ? "border-red-500 ring-2 ring-red-500/20"
                          : "border-borderColor/80 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 pl-3.5 pr-3 py-3 bg-gray/30 border-r border-borderColor/80 shrink-0 select-none">
                        <CanadaFlag />
                        <span className="text-xs md:text-sm font-bold text-foreground">
                          +1
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={watchPhone || ""}
                        placeholder="(604) 555-0123"
                        className="w-full px-3.5 py-3 outline-none bg-transparent text-sm md:text-base text-foreground placeholder:text-xs md:placeholder:text-sm placeholder:text-lightWhite/70"
                        {...register("phoneNumber", {
                          required: "Phone number is required",
                          validate: (value) => {
                            const res = validateCanadianPhoneNumber(value);
                            if (!res.isValid) {
                              return (
                                res.error || "Must be a valid Canadian phone number"
                              );
                            }
                            return true;
                          },
                          onChange: handlePhoneChange,
                        })}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Trust / Confidentiality Note */}
                  <div className="p-3.5 bg-gray/10 border border-borderColor/60 rounded-xl flex items-center gap-2.5 text-xs text-lightWhite">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span>
                      Your information is kept 100% confidential. Your custom valuation report will be sent to the contact details provided.
                    </span>
                  </div>
                </div>

                {/* Consent Checkbox (CASL-compliant, unticked by default) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      {...register("consent")}
                      defaultChecked={false}
                      className="mt-0.5 w-4 h-4 rounded border-borderColor/80 text-primary focus:ring-primary/20  accent-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-foreground/85 leading-snug group-hover:text-foreground transition-colors">
                      Send me my estimate and follow up by email or phone. I can unsubscribe anytime.
                    </span>
                  </label>
                </div>

                {/* Step 2 Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-6 py-3.5 border border-borderColor/80 hover:bg-gray/20 text-foreground font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={17} />
                    <span>Back to Property Info</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary2 text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
                          style={{ animation: "spin 0.75s linear infinite" }}
                        />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Home Evaluation</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Brokerage line under the form */}
          <div className="pt-4 border-t border-borderColor/60 text-center">
            <p className="text-xs sm:text-sm text-lightWhite">
              Provided by{" "}
              <span className="font-semibold text-foreground">
                Harjit Sidhu PREC, The Sidhu Team, Planet Group Realty Inc.
              </span>
            </p>
          </div>
        </div>

        <Image
          title="image title"
          src={Icons.bgWaveLine}
          alt="Wave line"
          className="w-full md:h-65.5 h-29.5 absolute object-contain bottom-0 z-0 left-0"
          width={100}
          height={100}
          loading="eager"
        />
      </section>
    </>
  );
};

export default HomeEstimationTop;
