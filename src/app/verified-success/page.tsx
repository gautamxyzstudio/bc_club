"use client";
import CustomButton from "@/src/components/button/CustomButton";
import { useAuthContext } from "@/src/mainComponents/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const { setOpenLogin, isLoggedIn } = useAuthContext();
  const navigate = useRouter();
  useEffect(() => {
    if (isLoggedIn) {
      navigate.push("/");
    }
  }, [isLoggedIn]);

  return (
    <section className="max-w-lg mx-auto flex justify-center items-center md:h-170 h-140 px-6">
      <div className="flex flex-col md:p-10 p-5 md:rounded-2xl rounded-xl text-center shadow-primary shadow-2xl">
        <h2 className="xl:text-4xl md:text-3xl text-2xl font-semibold mb-4">
          Confirm your account
        </h2>
        <p className="mb-4 xl:text-xl md:text-lg text-lightWhite">
          Your account has been confirmed. You can now sign in to BC Real Estate Market.
        </p>
        <p className="mb-4 xl:text-xl md:text-lg">
          Account confirm successfully.
        </p>
        <CustomButton
          label="Go to Login"
          buttonType="primary"
          onClick={() => setOpenLogin(true)}
        />
      </div>
    </section>
  );
};

export default page;
