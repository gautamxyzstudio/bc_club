/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Dialog } from "@mui/material";
import { useForm } from "react-hook-form";
import { login } from "@/src/api/auth/authApi";
import { useAuthContext } from "./AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { isAdminUser } from "@/src/utilities/authUtils";
import "../auth/index.css"

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onOpenForgot: () => void;
  openReactiveAccount: () => void;
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

const LoginPopup = ({
  open,
  onClose,
  onOpenSignup,
  onOpenForgot,
  openReactiveAccount,
}: LoginModalProps) => {
  const router = useRouter();
  const { loginUser, setResetEmail } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { email: "", password: "", keepLoggedIn: true },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await login({
        identifier: data.email,
        password: data.password,
      });

      if (response.user?.isVowRegistrant && !response.user?.isVowActive) {
        setResetEmail(response.user?.email);
        toast.error(
          "Your VOW access has expired. Please reset your password to reactivate.",
        );
        onClose();
        reset();
        openReactiveAccount();
        return;
      }

      loginUser(
        response.user,
        response?.jwt || response?.token,
        data.keepLoggedIn,
      );
      toast.success("Login successful!");
      onClose();
      reset();

      if (isAdminUser(response.user)) {
        router.push("/admin/dashboard/active");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to login";

      if (message.toLowerCase().includes("vow")) {
        setResetEmail(data.email);
        toast.error(message);
        onClose();
        reset();
        openReactiveAccount();
        return;
      }

      setErrorMsg(message);
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
            acceptedVowTerms: true,
            acceptedVowVersion: "2026-07",
          }),
        },
      );

      const data = await res.json();

      if (data.message && !data.jwt) {
        if (data.message.toLowerCase().includes("vow")) {
          setResetEmail(data.user.email);
          toast.error(data.message);
          onClose();
          openReactiveAccount();
          return;
        }

        toast.info(data.message);
        return;
      }

      if (data.message && data.jwt) {
        if (data.user?.isVowRegistrant && !data.user?.isVowActive) {
          toast.error(
            "Your VOW access has expired. Please reset your password to reactivate.",
          );
          setResetEmail(data.user.email);
          onClose();
          openReactiveAccount();
          return;
        }
        localStorage.setItem("token", data.jwt);
        loginUser(data.user, data.jwt, true);
        onClose();
        toast.success("Login successful!");
        if (isAdminUser(data.user)) {
          router.push("/admin/dashboard/active");
        }
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
            maxWidth: "500px",
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
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 w-11 h-11 border-0 bg-transparent rounded-full flex items-center justify-center text-[#374151] hover:bg-black/5 transition cursor-pointer z-10"
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

        {/* Modal Body */}
        <div className="p-6 sm:p-7 pt-7 flex flex-col gap-3">
          {/* Badge */}
          <span className="self-start inline-block bg-[#F5B800] text-[#111827] text-xs font-extrabold tracking-wider px-3 py-1.5 rounded-full uppercase">
            100% FREE · ALWAYS
          </span>

          {/* Heading & Subtitle */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] tracking-tight leading-tight m-0">
              Welcome back
            </h2>
            <p className="text-sm sm:text-[15px] leading-relaxed text-[#4B5563] m-0">
              Sign in to pick up your home search. Everything below is free for members.
            </p>
          </div>

          {/* Free Features Pills */}
          <ul
            className="flex flex-wrap gap-1.5 list-none m-0 p-0"
            aria-label="Included free"
          >
            {FREE_FEATURES.map((item) => (
              <li
                key={item}
                className="bg-[#EEF3F9] text-[#1F4F86] text-xs sm:text-[13px] font-bold px-2.5 py-1.5 rounded-full"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Google Login Button */}
          <div className="w-full flex justify-center overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const idToken = credentialResponse.credential;
                if (idToken) handleGoogleLogin(idToken);
              }}
              onError={() => {
                setErrorMsg("Google Login Failed");
              }}
              text="continue_with"
              shape="pill"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            <span className="flex-1 h-px bg-gray-200"></span>
            <span>or use email</span>
            <span className="flex-1 h-px bg-gray-200"></span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="si-email"
                className="text-[13px] font-semibold text-[#374151]"
              >
                Email
              </label>
              <input
                id="si-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full h-12.5 border-[1.5px] ${
                  errors.email
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-[#D1D5DB]"
                } rounded-xl px-3.5 text-base text-[#111827] placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#1F4F86] focus:ring-4 focus:ring-[#1F4F86]/15 transition`}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium m-0">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="si-pw"
                  className="text-[13px] font-semibold text-[#374151]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgot}
                  className="text-[13px] font-semibold text-[#1F4F86] hover:text-[#163A63] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="si-pw"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={`w-full h-12.5 border-[1.5px] ${
                    errors.password
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-[#D1D5DB]"
                  } rounded-xl pl-3.5 pr-12 text-base text-[#111827] placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#1F4F86] focus:ring-4 focus:ring-[#1F4F86]/15 transition`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1 w-11 h-11 border-0 bg-transparent cursor-pointer flex items-center justify-center text-[#4B5563] hover:text-gray-800 transition"
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
                      <line x1="1" y1="1" x2="23" y2="23" />
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
                <p className="text-xs text-red-500 font-medium m-0">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Keep me signed in */}
            <label className="flex items-center gap-2.5 text-sm text-[#374151] cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-[#1F4F86] accent-[#1F4F86] cursor-pointer"
                {...register("keepLoggedIn")}
              />
              <span>Keep me signed in</span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13.5 rounded-xl bg-[#1F4F86] hover:bg-[#163A63] text-white text-[17px] font-bold flex items-center justify-center transition shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border-0 mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Switch link */}
          <p className="m-0 text-center text-[15px] text-[#4B5563] pt-1">
            New here?{" "}
            <button
              type="button"
              onClick={onOpenSignup}
              className="font-bold text-[#111827] underline decoration-[#F5B800] decoration-[3px] underline-offset-4 hover:text-[#1F4F86] transition cursor-pointer bg-transparent border-0 p-0"
            >
              Create a free account
            </button>
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default LoginPopup;
