"use client";
import { Icons } from "@/src/app/exports";
import { newsletterApi } from "@/src/api/newsletter/newsletterApi";
import Image from "next/image";
import React, { useState } from "react";
import RippleButton from "@/src/components/button/RippleButton";
import { toast } from "react-toastify";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    try {
      const res = await newsletterApi({ email });

      if (res?.message === "Subscription received!") {
        toast.success("Email subscribed successfully");
        setEmail("");
      } else {
        toast.error("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };
  return (
    <div className="bg-primary p-5 md:py-6 md:px-4 xl:py-7 xl:px-9 rounded w-full flex flex-col gap-y-2.5 md:gap-y-5 xl:gap-x-10 xl:flex-nowrap xl:flex-row xl:justify-between xl:items-center-safe">
      <div className="w-full xl:w-[55%] flex flex-col md:gap-y-2 gap-y-1.5">
        <span className="text-2xl font-bold">Newsletter</span>
        <span className="opacity-80 md:text-base text-sm">
           Monthly market numbers for your city, free
        </span>
      </div>
      <div className="w-full xl:w-[35%] flex flex-col relative">
        <div className="w-full border rounded-xl pl-4 md:p-1.5 py-5 flex items-center-safe justify-between xl:mb-0 md:mb-3">
          <div className="flex flex-1/2 flex-row gap-x-1 items-center-safe">
            <Image
              title="image title"
              src={Icons.emailIcon}
              alt="email"
              width={100}
              height={100}
              loading="eager"
              className="w-5 h-5 object-contain"
            />
            <input
              className="outline-none placeholder:text-background w-[90%]"
              type="email"
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={onChangeEmail}
            />
          </div>
          <RippleButton
            onClick={handleSubscribe}
            title="Submit"
            buttonType="quaternary"
            customClassName="py-3.5 px-8.5 !rounded-lg md:!flex !hidden"
            textClassName="!font-bold !text-base"
          />
        </div>
        <RippleButton
          onClick={handleSubscribe}
          title="Submit"
          buttonType="quaternary"
          customClassName="py-3.5 px-8.5 !rounded-lg my-5 md:hidden block w-fit"
          textClassName="!font-bold !text-base"
        />
        {error && (
          <p className="text-red-500 absolute md:-bottom-4.5 -bottom-2 mt-3 text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsLetter;
