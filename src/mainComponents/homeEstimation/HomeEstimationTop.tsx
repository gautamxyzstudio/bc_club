/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Icons } from "@/src/app/exports";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  User,
  Mail,
  Maximize2,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  X,
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
    className="w-5 h-3.5 rounded-[2px] shadow-xs object-cover shrink-0"
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
}

const HomeEstimationTop = () => {
  const router = useRouter();
  const { isLoggedIn, username } = useAuthContext();
  const { data: me } = useGetMe();

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
    formState: { errors },
  } = useForm<HomeEvaluationFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      propertySizeInSquareFeet: "",
    },
    mode: "onBlur",
  });

  const watchAddress = watch("address");
  const watchPhone = watch("phoneNumber");

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

  // Form submission handler
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
    reset({
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      propertySizeInSquareFeet: "",
    });
    setFormAddressQuery("");
    setSelectedPropertyId(null);
  };

  const handleSelectFormAddress = (item: any) => {
    setValue("address", item.address, { shouldValidate: true });
    setFormAddressQuery(item.address);
    setShowFormAddressDropdown(false);
    setSelectedPropertyId(item.documentId || item.id || null);

    if (item.floorArea || item.sqft || item.buildingSize) {
      setValue(
        "propertySizeInSquareFeet",
        String(item.floorArea || item.sqft || item.buildingSize),
        { shouldValidate: true },
      );
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
              <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-foreground">
                In the meantime, you can also <strong>explore and search BC Assessment property records</strong> and comparative market trends below!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  setNavigatingText("Redirecting to Home Assessment…");
                  setNavigating(true);
                  router.push("/?tab=home-assessment");
                }}
                className="w-full py-3.5 px-6 bg-primary hover:bg-primary2 text-white font-bold rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore BC Assessment Properties</span>
                <ArrowRight size={18} />
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
          content="Fill out form below to receive your personalized property valuation report."
          customClasses="xl:mt-5 mt-4 text-center mx-6"
        />

        <div className="xl:mt-8 mt-5 md:w-[82%] lg:w-[76%] xl:w-[70%] w-full md:p-8 p-5 sm:p-6 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] border border-borderColor/60 rounded-2xl flex flex-col gap-y-6 bg-background z-10">
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-y-4.5"
          >
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

              {/* Row 2: Canadian Phone Number + Property Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Property Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs md:text-sm font-semibold text-foreground">
                    Property Size (Sq Ft) <span className="text-primary">*</span>
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
              </div>

              {/* Row 3: Property Address with Autocomplete Suggestions */}
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

              {/* Submit Area */}
              <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-2">
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
            </form>
        </div>

        <Image
          title="image title"
          src={Icons.bgWaveLine}
          alt="Wave line"
          className="w-full md:h-65.5 h-29.5 absolute object-contain bottom-0 z-0 left-0"
          width={100}
          height={100}
        />
      </section>
    </>
  );
};

export default HomeEstimationTop;
