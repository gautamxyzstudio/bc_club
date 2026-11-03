/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { signup } from "@/src/api/auth/authApi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import "../auth/index.css"

interface SignupPopupProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenAccCreation: () => void;
}

const FREE_FEATURES = [
  "Sold prices",
  "Foreclosures",
  "Floodplain maps",
  "Lot lines",
  "Map tools",
  "School rankings",
  "Catchments",
];

const SignupPopup = ({
  open,
  onClose,
  onOpenLogin,
  onOpenAccCreation,
}: SignupPopupProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuthContext();
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsViewed, setTermsViewed] = useState(false);
  const [acceptedVowTerms, setAcceptedVowTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (!acceptedVowTerms) {
        setErrorMsg("Please review and accept the VOW Terms of Use.");
        return;
      }
      const response = await signup({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        role: "Admin",
        acceptedVowTerms: true,
        acceptedVowVersion: "2026-07",
      });
      if (response.message) {
        onOpenAccCreation();
        reset();
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            acceptedVowTerms,
            acceptedVowVersion: "2026-07",
          }),
        },
      );

      const data = await res.json();

      if (data.message && !data.jwt) {
        toast.info(data.message);
        return;
      }

      if (data.message && data.jwt) {
        localStorage.setItem("token", data.jwt);
        loginUser(data.user, data.jwt, true);
        onClose();
        toast.success("Login successful!");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Google Login Failed:", error);
      setErrorMsg("Google Login Failed");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            boxShadow: "0 24px 60px rgba(0,0,0,.3)",
            maxWidth: "580px",
            width: "100%",
            margin: { xs: "16px", sm: "24px" },
            backgroundColor: "#fff",
            maxHeight: { xs: "calc(100dvh - 32px)", sm: "calc(100dvh - 48px)" },
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            WebkitOverflowScrolling: "touch",
          },
        },
      }}
    >
      <div className="relative w-full bg-white text-[#111827]">
        {/* Navy Header */}
        <div className="bg-[#1F4F86] text-white p-5 sm:p-6 pb-4.5 sm:pb-4.5 flex flex-col gap-2.5 relative rounded-t-3xl">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 w-11 h-11 border-0 bg-transparent rounded-full flex items-center justify-center text-white hover:bg-white/12 transition cursor-pointer z-10"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <span className="self-start inline-block bg-[#F5B800] text-[#111827] text-xs font-extrabold tracking-wider px-3 py-1.5 rounded-full uppercase">
            FREE ACCOUNT
          </span>

          <h2
            id="bc-signup-title"
            className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight leading-tight m-0 pr-9"
          >
            Unlock everything. Pay nothing.
          </h2>

          <ul
            className="grid grid-cols-2 gap-x-3 gap-y-1.5 list-none m-0 p-0 text-[13px] font-semibold text-[#E5ECF5]"
            aria-label="Included free"
          >
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 flex-none text-[#F5B800]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12l5 5 9-10" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 pt-4.5 sm:pt-4.5 flex flex-col gap-3.5">
          {/* Google Sign Up */}
          <div className="flex justify-center w-full">
            {!acceptedVowTerms ? (
              <button
                type="button"
                onClick={() => {
                  setTermsOpen(true);
                  toast.info(
                    "Please review and accept the VOW Terms of Use before signing up with Google.",
                  );
                }}
                className="w-fit px-3 py-2 flex items-center justify-center gap-2 border-[1.5px] border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] rounded-[14px] text-base font-mediumtext-[#111827] cursor-pointer transition shadow-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.6 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
                  />
                </svg>
                Sign up with Google
              </button>
            ) : (
              <div className="w-full flex justify-center ">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const idToken = credentialResponse.credential;
                    if (idToken) handleGoogleLogin(idToken);
                  }}
                  onError={() => {
                    setErrorMsg("Google Login Failed");
                  }}
                  text="signup_with"
                  shape="pill"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-[#6B7280] text-[13px]">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span>or with email</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-3"
          >
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="su-first"
                  className="text-[13px] font-semibold text-[#1F2937]"
                >
                  First name
                </label>
                <input
                  id="su-first"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jordan"
                  className={`w-full h-12.5 border-[1.5px] ${
                    errors.firstName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-[#D1D5DB] focus:border-[#1F4F86] focus:ring-[#1F4F86]/20"
                  } rounded-xl px-3.5 text-base text-[#111827] placeholder:text-[#6B7280] bg-white outline-none focus:ring-4 transition`}
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <span className="text-xs text-red-500">
                    {errors.firstName.message as string}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="su-last"
                  className="text-[13px] font-semibold text-[#1F2937]"
                >
                  Last name
                </label>
                <input
                  id="su-last"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Lee"
                  className={`w-full h-12.5 border-[1.5px] ${
                    errors.lastName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-[#D1D5DB] focus:border-[#1F4F86] focus:ring-[#1F4F86]/20"
                  } rounded-xl px-3.5 text-base text-[#111827] placeholder:text-[#6B7280] bg-white outline-none focus:ring-4 transition`}
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <span className="text-xs text-red-500">
                    {errors.lastName.message as string}
                  </span>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="su-email"
                className="text-[13px] font-semibold text-[#1F2937]"
              >
                Email
              </label>
              <input
                id="su-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full h-12.5 border-[1.5px] ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-[#D1D5DB] focus:border-[#1F4F86] focus:ring-[#1F4F86]/20"
                } rounded-xl px-3.5 text-base text-[#111827] placeholder:text-[#6B7280] bg-white outline-none focus:ring-4 transition`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message as string}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="su-pw"
                className="text-[13px] font-semibold text-[#1F2937]"
              >
                Create a password
              </label>
              <div className="relative">
                <input
                  id="su-pw"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="8+ characters"
                  className={`w-full h-12.5 border-[1.5px] ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-[#D1D5DB] focus:border-[#1F4F86] focus:ring-[#1F4F86]/20"
                  } rounded-xl pl-3.5 pr-12 text-base text-[#111827] placeholder:text-[#6B7280] bg-white outline-none focus:ring-4 transition`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                      message:
                        "Password must include uppercase, lowercase, number, and special character",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1 w-11 h-11 border-0 bg-transparent flex items-center justify-center text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="23" x2="23" y2="1" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">
                  {errors.password.message as string}
                </span>
              )}
            </div>

            {/* VOW Terms Checkbox */}
            <div
              className={`rounded-[14px] p-3 sm:p-3.5 flex flex-col gap-1.5 transition ${
                !acceptedVowTerms && errorMsg
                  ? "bg-[#FEF2F2] border border-[#FCA5A5]"
                  : "bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <label className="flex items-start gap-2.5 text-sm leading-[1.45] text-[#1F2937] cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="su-vow"
                  checked={acceptedVowTerms}
                  disabled={!termsViewed}
                  onChange={(e) => setAcceptedVowTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-[#1F4F86] flex-none rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="font-bold text-[#1F4F86] underline hover:text-[#163A63] cursor-pointer bg-transparent border-0 p-0 inline"
                  >
                    VOW Terms of Use
                  </button>
                </span>
              </label>
              <p className="m-0 ml-7.5 text-xs leading-[1.45] text-[#4B5563]">
                BC board rules ask for this one-time check before showing sold
                data. It doesn&apos;t cost anything.
              </p>
              {!termsViewed && (
                <p className="m-0 ml-7.5 text-xs text-red-600 font-medium">
                  Please view the VOW Terms before agreeing.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !acceptedVowTerms}
              className="w-full h-13.5 flex items-center justify-center gap-2 border-0 rounded-[14px] bg-[#1F4F86] hover:bg-[#163A63] text-white text-[17px] font-bold cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account..." : "Create my free account"}
            </button>
          </form>

          {/* Fine print & Switch */}
          <p className="m-0 text-center text-[13px] text-[#4B5563]">
            No credit card · No spam · Unsubscribe anytime
          </p>
          <p className="m-0 text-center text-[15px] text-[#4B5563]">
            Already a member?{" "}
            <button
              type="button"
              onClick={onOpenLogin}
              className="font-bold text-[#111827] underline decoration-[#F5B800] decoration-[3px] underline-offset-4 hover:opacity-80 cursor-pointer bg-transparent border-0 p-0"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <Dialog
        open={termsOpen}
        onClose={() => {
          setTermsOpen(false);
          setAcceptedVowTerms(true);
          setTermsViewed(true);
        }}
        maxWidth="md"
        fullWidth
        sx={{
          scrollbarWidth: "none",
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          VOW Terms of Use
        </DialogTitle>

        <DialogContent
          sx={{
            px: 5,
          }}
        >
          <div className="w-full space-y-10 text-sm">
            <Heading
              tagType="h1"
              type={IHeadingTypes.heading20}
              content="Terms & Conditions"
              customClasses="text-center"
            />
            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="1. Binding Agreement & Privacy Acceptance"
              />
              <div className="space-y-3">
                <p>
                  Welcome to{" "}
                  <a
                    href="/"
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    bcrealestatemarket.com
                  </a>{" "}
                  (the “Website” or “Platform”). By creating an account,
                  authenticating your credentials, or otherwise accessing or
                  using any part of this Website, its mapping systems, school
                  databases, parcel data, or historical listing systems, you
                  (the “Participant,” “Registrant,” or “User”) explicitly affirm
                  your acceptance of and agreement to these Terms of Use
                  (&quot;Terms&quot;) and our Privacy Policy.
                </p>
                <p>
                  This agreement constitutes a legally binding contract
                  governing your interaction with the Platform. If you do not
                  agree entirely with these Terms, you must immediately stop
                  using the Platform and close your browser window. Continued
                  use constitutes absolute acceptance of these Terms and any
                  future revisions made by us.
                </p>
                <div className="ml-9 space-y-2">
                  <p>
                    <strong>
                      ⚠️ Critical Notice: No Financial Obligation or Agency
                      Created
                    </strong>
                  </p>
                  <p>
                    This Terms of Use agreement does not impose any financial
                    obligation on you, nor does it establish a formal real
                    estate brokerage client relationship or representation
                    agreement between you and the Platform operators. Any
                    agreement that creates a financial obligation or formal
                    client representation must be established completely
                    separately from these Terms, must be prominently labeled as
                    a separate contract, and cannot be accepted solely by a
                    standard website registration or mouse click.
                  </p>
                </div>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="2. Eligibility & Account Security"
              />

              <ul className="list-disc list-outside ml-9 space-y-1.5">
                <li>
                  <strong>Age of Majority:</strong> You must be at least 19
                  years old (the legal age of majority in British Columbia) to
                  register an account and access restricted market intelligence
                  data on this Platform
                </li>
                <li>
                  <strong>Credential Responsibility:</strong> If you are
                  provided with a username, password, or verification code to
                  access historical sold data or proprietary maps, you are
                  solely responsible for maintaining its absolute
                  confidentiality. You agree not to share your access
                  credentials with any third party.
                </li>
                <li>
                  <strong>Access Restriction:</strong> We reserve the absolute
                  right, at our sole discretion and without prior notice, to
                  restrict, suspend, or permanently terminate access to certain
                  areas or data layers of the Website for any user suspected of
                  violating these provisions.
                </li>
              </ul>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="3. Strict Prohibitions Against Scraping & Data Manipulation"
              />
              <div className="space-y-3">
                <p>
                  This Platform provides a high-utility provincial property
                  intelligence engine. To safeguard our custom code, layout
                  design, compiled boundaries, and database investments, you are
                  strictly granted a limited, revocable, non-exclusive license
                  for personal, non-commercial use only.
                </p>
                <p>
                  You are explicitly and legally prohibited from performing, or
                  assisting others in performing, the following actions:
                </p>
                <ul className="list-disc list-outside ml-9 space-y-1.5">
                  <li>
                    <strong>Automated Data Extraction:</strong> You will not
                    scrape, crawl, spider, harvest, or extract data from{" "}
                    <a
                      href="/"
                      className="text-blue-600 underline"
                      target="_blank"
                    >
                      bcrealestatemarket.com
                    </a>
                    , whether manually or through automated software tools. The
                    prohibited uses expressly include &quot;screen scraping,&quot;
                    &quot;database scraping,&quot; &quot;data mining,&quot; or any other mechanism
                    intended to collect, store, re-organize, summarize, or
                    manipulate our property intelligence or listing information.
                  </li>
                  <li>
                    <strong>Systematic Redistribution:</strong> You will not,
                    directly or indirectly, display, post, disseminate,
                    distribute, publish, broadcast, transfer, sell, or
                    sublicense any part of the data, school catchment borders,
                    parcel metrics, or listing information to another
                    individual, entity, or public forum.
                  </li>
                  <li>
                    <strong>Commercial Exploitation:</strong> You may not use
                    any data obtained from this Platform to build secondary
                    databases, commercial valuation tools, or consumer real
                    estate search engines.
                  </li>
                </ul>
                <p>
                  <i>
                    Note: This restriction does not apply to authorized, secure
                    AI integrations, such as an approved Model Context Protocol
                    (MCP) server configuration deployed and certified explicitly
                    by the operators of{" "}
                    <a
                      href="/"
                      className="text-blue-600 underline"
                      target="_blank"
                    >
                      bcrealestatemarket.com
                    </a>{" "}
                    for your personal use.
                  </i>
                </p>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="4. Consent to Personal Information Collection & Board Auditing"
              />
              <div className="space-y-3">
                <p>
                  By registering an account to view protected real estate
                  tracking metrics or historical data, you provide your explicit
                  consent for the Platform operators to collect, use, and
                  securely process your personal information (including your
                  first and last name, phone number, and email address).
                </p>
                <ul className="list-disc list-outside ml-9">
                  <li>
                    <strong>Board Audits & Compliance:</strong> You expressly
                    acknowledge and consent to the fact that your registration
                    data and personal information may be shared securely with
                    regional real estate boards, as well as their legal
                    representatives, for auditing, monitoring, and legal
                    compliance verification purposes.
                  </li>
                  <li>
                    <strong>Platform Tracking:</strong> We utilize advanced
                    monitoring systems to evaluate API call frequencies and user
                    behavior to detect unauthorized commercial data scraping.
                  </li>
                </ul>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="5. General Disclaimers & Limitation of Liability"
              />
              <ul className="list-disc list-outside ml-9">
                <li>
                  <strong>General Information Only:</strong> All contents of
                  this Website—including historical trends, property boundaries,
                  and neighborhood analytics—are provided for general
                  information and consumer evaluation purposes only. They do not
                  constitute formal investment, legal, or professional real
                  estate advice.
                </li>
                <li>
                  <strong>No Warranties:</strong> This Website and all data
                  streams are provided strictly on an &quot;as is&quot; and &quot;as available&quot;
                  basis. No parties involved in the creation or maintenance of
                  this site guarantee the absolute accuracy, timeliness,
                  performance, completeness, or suitability of the content. You
                  acknowledge that data errors, lagging updates, or system
                  inaccuracies may exist.
                </li>
                <li>
                  <strong>Exclusion of Liability:</strong> Your use of any
                  information, maps, or analytics on this site is entirely at
                  your own risk. The platform owners and any contributing real
                  estate board or data provider hold zero liability for
                  financial choices, investment outcomes, or transactional
                  consequences arising from the use or performance of this
                  Website.
                </li>
              </ul>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="6. MLS® VOW (Virtual Office Website) Terms of Use & Regional BC Board Disclaimers"
              />
              <div className="space-y-2">
                <p>
                  <strong>
                    A. Core Property Data Disclaimers & Territorial Scope
                  </strong>
                </p>
                <p>
                  The real estate listing data, historical market analytics, and
                  sold records displayed on this Virtual Office Website (MLS®
                  VOW) originate in part from the MLS® Systems and Reciprocity
                  programs of the participating real estate boards across
                  British Columbia and Canada.
                </p>
                <p>
                  By utilizing this Platform, you acknowledge that the data is
                  subject to the unique rules of cooperation, regulations, and
                  copyright protections of the respective regional jurisdiction
                  where the property is located, specifically:
                </p>
                <ul className="list-disc list-outside ml-9">
                  <li>
                    <strong>Greater Vancouver REALTORS® (GVR):</strong>{" "}
                    Governing data across the Greater Vancouver metropolitan
                    area.
                  </li>
                  <li>
                    <strong>
                      The Fraser Valley Real Estate Board (FVREB):
                    </strong>{" "}
                    Governing data across Surrey, North Delta, Langley,
                    Abbotsford, and surrounding areas.
                  </li>
                  <li>
                    <strong>
                      The Chilliwack and District Real Estate Board (CADREB):
                    </strong>{" "}
                    Governing data across Chilliwack and surrounding Fraser
                    Valley regional pockets.
                  </li>
                  <li>
                    <strong>
                      The Vancouver Island Real Estate Board (VIREB):
                    </strong>{" "}
                    Governing island-specific property data layers.
                  </li>
                </ul>
                <p>
                  Real estate listings held by participating brokerage firms are
                  uniquely marked with the MLS® Reciprocity logo or data tags,
                  which explicitly include the identity of the listing
                  brokerage.
                </p>
                <p className="lg:ml-15 ml-8">
                  <strong>Information Notice for Properties Shown:</strong> This
                  representation is based in whole or in part on data generated
                  by Greater Vancouver REALTORS®, the Fraser Valley Real Estate
                  Board, the Chilliwack and District Real Estate Board, the
                  Vancouver Island Real Estate Board, or the Canadian Real
                  Estate Association, which assume no responsibility for its
                  accuracy. This information is deemed reliable but not guaranteed accurate by those organizations or the platform
                  operators.
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>
                    B. Mandatory Consumer Commitments & Restrictive Covenants
                  </strong>
                </p>
                <p>
                  By registering an account, verifying your email address, and
                  creating secure access credentials on this Platform, you agree, acknowledge, and agree to the
                  following terms mandated by FVREB, GVR, CADREB, and VIREB:
                </p>
                <ol className="list-decimal list-outside ml-9">
                  <li>
                    <strong>Consumer Disclosures:</strong> You confirm that you
                    have received, read, and understand the Privacy Notice and
                    Consent brochure published by the British Columbia Real
                    Estate Association (BCREA) and the Disclosure of
                    Representation in Trading Services (DORTS) document
                    published by the BC Financial Services Authority (BCFSA).
                  </li>
                  <li>
                    <strong>Lawful Consumer Relationship:</strong> You
                    acknowledge that these Terms establish a lawful, regulatory
                    REALTOR® / Consumer relationship between you and the
                    platform operators, and not a binding client representation
                    agency agreement or financial obligation.
                  </li>
                  <li>
                    <strong>Bona Fide Real Estate Interest:</strong> You certify
                    that you possess an authentic, bona fide interest in the
                    personal purchase, sale, or lease of real estate of the type
                    being browsed or tracked on this Platform.
                  </li>
                  <li>
                    <strong>Absolute Prohibition on Data Exploitation:</strong>{" "}
                    You will not yourself, and will not permit, assist, or code
                    workflows for others to, directly or indirectly:
                    <ul className="list-disc list-outside lg:ml-15 ml-8">
                      <li>
                        Copy, redistribute, retransmit, reformat, disseminate,
                        publish, broadcast, transfer, sell, or sublicense any
                        part of the MLS® VOW Data, historic sold records, or
                        listing information to any other person, entity, or
                        public forum.
                      </li>
                      <li>
                        Engage in automated or programmatic &quot;Scraping&quot;
                        (including screen scraping and database scraping), &quot;data
                        mining,&quot; or any other activity intended to collect,
                        store, re-organize, summarize, or manipulate any MLS®
                        VOW Data or any related property indices.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Validation of Board Intellectual Property:</strong>{" "}
                    You explicitly recognize and validate the respective
                    regional Real Estate Boards&apos; absolute ownership of, and the
                    validity of the Boards&apos; proprietary rights, database rights,
                    and copyrights in the MLS® VOW Data, MLS® Systems, and
                    listing compilations.
                  </li>
                  <li>
                    <strong>Explicit Board Authorization to Audit:</strong> You
                    expressly authorize the Fraser Valley Real Estate Board,
                    Greater Vancouver REALTORS®, the Chilliwack and District
                    Real Estate Board, and their duly authorized compliance
                    representatives to log into, monitor, and access this VOW
                    platform and the information you provide to the platform
                    operator for the strict purposes of verifying systemic
                    compliance, tracking listing display privileges, and
                    ensuring the structural enforcement of these Terms of Use,
                    board bylaws, and provincial laws.
                  </li>
                </ol>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="7. Intellectual Property, Trademarks, and Copyrights"
              />
              <ul className="list-disc list-outside ml-9">
                <li>
                  <strong>Platform IP:</strong> The entire contents of this
                  site—including custom text components, map interfaces,
                  graphics, brand layouts, data indexing frameworks, and backend
                  source code—belong strictly to the owners of
                  bcrealestatemarket.com and are guarded under intellectual
                  property and copyright laws. Copying, distributing, or
                  modifying this content for free or commercial gain is
                  fundamentally illegal.
                </li>
                <li>
                  <strong>CREA Trademarks:</strong> The trademarks REALTOR®,
                  REALTORS®, and the REALTOR® logo are controlled and owned by
                  REALTOR® Canada Inc. and licensed exclusively to The Canadian
                  Real Estate Association (CREA). These marks pinpoint real
                  estate professionals who are active members of CREA and adhere
                  to its rigorous Code of Ethics. The terms Multiple Listing
                  Service®, MLS®, and their associated logos are owned by CREA
                  and denote the quality of professional real estate services
                  provided under license.
                </li>
              </ul>
            </div>

            <div className="space-y-2 mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="8. Dispute Resolution, Governing Law, and Open Data Acknowledgements"
              />
              <ul className="list-disc list-inside ml-4">
                <li>
                  <strong>Governing Law:</strong> This agreement, its
                  interpretation, and any technical or legal friction arising
                  from the Platform are governed strictly by the federal laws of
                  Canada and the provincial laws of British Columbia.
                </li>
                <li>
                  <strong>Binding Arbitration:</strong> Any dispute that cannot
                  be sorted out through amicable discussion shall be resolved
                  exclusively through final and binding arbitration in the City
                  of Vancouver, BC, under the provincial Arbitration Act.
                </li>
                <li>
                  <strong>Open Government Licensing:</strong> To build our
                  extensive property intelligence framework, this site safely
                  integrates public datasets licensed under the Open Government
                  Licence – British Columbia, as well as localized municipal and
                  regional open data frameworks courtesy of the following
                  jurisdictions:
                </li>
              </ul>
              <p>
                <strong>Integrated Municipal & Regional Data Registries</strong>
              </p>
              <ul className="grid grid-cols-2 list-disc list-outside ml-4">
                <li>City of Surrey</li>
                <li>City of Vancouver</li>
                <li>Township of Langley</li>
                <li>Sunshine Valley</li>
                <li>City of Abbotsford</li>
                <li>City of Burnaby</li>
                <li>City of Delta</li>
                <li>City of Chilliwack</li>
                <li>City of Kelowna</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="9. Regulatory Disclosure & Corporate Operator Identity"
              />
              <div className="space-y-2">
                <p>
                  This real estate property intelligence platform, located at{" "}
                  <a
                    href="/"
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    bcrealestatemarket.com
                  </a>{" "}
                  , is proudly presented, maintained, and operated exclusively
                  by:
                </p>
                <p>
                  <strong>
                    Harjit Sidhu Personal Real Estate Corporation (PREC)
                  </strong>
                </p>
                <p>
                  Representing <strong>The Sidhu Team</strong> at{" "}
                  <strong>Planet Group Realty Inc.</strong>
                </p>
                <p>
                  <i>Office Location: Surrey, British Columbia, Canada</i>
                </p>
                <p>
                  In accordance with British Columbia real estate advertising
                  regulations and licensing rules, the Participant acknowledges
                  that by using this VOW (Virtual Office Website) platform, they
                  are interacting with services overseen by the licensed
                  brokerages and professionals identified above.
                </p>
                <p>
                  All communications, data inquiries, opt-out requests for
                  matched-audience marketing, or licensing questions regarding
                  our custom mapping and automated features must be processed
                  directly through our Surrey administration team. Unauthorized
                  use of this website or its contents may give rise to a
                  substantial claim for monetary damages and/or be treated as a
                  legal offense enforceable by local and federal jurisdictions.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            px: 5,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTermsOpen(false);
              setTermsViewed(true);
              setAcceptedVowTerms(true);
            }}
            className="my-2 w-full bg-[#22558B] text-white py-3 rounded-md font-semibold self-center sticky bottom-0"
          >
            I Have Reviewed the Terms
          </button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default SignupPopup;
