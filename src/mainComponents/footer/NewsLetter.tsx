"use client";
import { Icons } from "@/app/exports";
import { newsletterApi } from "@/src/api/newsletter/newsletterApi";
import { AxiosError } from "axios";
import Image from "next/image";
import React, { useState } from "react";

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

      if (res) {
        alert("Email subscribed successfully");
        setEmail("");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.status === 400) {
        alert("Email already subscribed");
      } else {
        alert("something went wrong");
      }
    }
  };
  return (
    <div className="bg-primary p-5 md:py-6 md:px-4 xl:py-7 xl:px-9 rounded w-full flex flex-col gap-y-2.5 md:gap-y-5 xl:gap-x-10 xl:flex-nowrap xl:flex-row xl:justify-between xl:items-center-safe">
      <div className="w-full xl:w-[55%] flex flex-col md:gap-y-2 gap-y-1.5">
        <span className="text-2xl font-bold">NewsLetter</span>
        <span className="text-lightWhite md:text-base text-sm">
          Be the first one to know about discounts, offers and events
        </span>
      </div>
      <div className="w-full xl:w-[45%] flex flex-col relative">
        <div className="w-full border rounded-xl pl-4 md:p-1.5 py-5 flex items-center-safe justify-between xl:mb-0 md:mb-3">
          <div className="flex flex-row gap-x-1 items-center-safe">
            <Image
              src={Icons.emailIcon}
              alt="email"
              width={100}
              height={100}
              className="w-5 h-5 object-contain"
            />
            <input
              className="outline-none placeholder:text-background"
              type="email"
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={onChangeEmail}
            />
          </div>
          <button
            onClick={handleSubscribe}
            className="bg-background text-primary font-bold text-base py-3.5 px-8.5 rounded-lg md:flex hidden"
          >
            Submit
          </button>
        </div>
        <button
          onClick={handleSubscribe}
          className="bg-background text-primary font-bold text-base py-3.5 px-8.5 rounded-lg my-5 md:hidden block w-fit "
        >
          Submit
        </button>
        {error && <p className="text-red-500 absolute md:-bottom-4 -bottom-2 mt-3 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default NewsLetter;
