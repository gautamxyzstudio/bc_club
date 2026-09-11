"use client";
import CustomButton from "@/src/components/button/CustomButton";
import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import { login } from "@/src/api/auth/authApi";
import { useAuthContext } from "./AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { isAdminUser } from "@/src/utilities/authUtils";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onOpenForgot: () => void;
  openReactiveAccount: () => void;
}

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
    defaultValues: { email: "", password: "", keepLoggedIn: false },
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
        console.log("response.user?.email", response.user?.email, data.email);
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
        console.log("response.user?.email", data.email);
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
          body: JSON.stringify({ idToken }),
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
    <CustomDialog
      open={open}
      onClose={onClose}
      title="WelCome Back"
      description="Log in to continue your home search"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
        {/* Email */}

        <TextField
          label="Email"
          type="email"
          className="w-full"
          {...register("email", { required: "Email is required" })}
          error={!!errors.email}
          helperText={errors.email?.message as string}
          slotProps={{
            input: {
              style: {
                paddingTop: "3px",
              },
            },
          }}
        />

        {/* Password */}
        <div className="relative mt-4">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            className="w-full"
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: {
                  paddingTop: "3px",
                },
              },
            }}
          />
        </div>

        {/* Keep me logged in */}
        <div className="flex justify-between items-center mt-3">
          <FormControlLabel
            control={<Checkbox {...register("keepLoggedIn")} size="small" />}
            label={
              <span className="text-[14px] text-[#9b9a9a]">
                Keep me logged in
              </span>
            }
            sx={{ margin: 0 }}
          />

          <button
            type="button"
            onClick={onOpenForgot}
            className="text-[#22558B] text-sm hover:underline"
          >
            Forgot password
          </button>
        </div>

        <CustomButton
          label={loading ? "Logging in..." : "Login"}
          buttonType="primary"
          customClasses="w-full  mt-5"
          type="submit"
        />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-[#000F0D] text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <div className="flex justify-center flex-col items-center gap-2 py-3 px-13 rounded-md">
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

        <p className="text-center text-gray-600 text-sm mt-4">
          Need an account?
          <span
            onClick={onOpenSignup}
            className="text-yellow-500 font-medium hover:underline cursor-pointer"
          >
            Create one
          </span>
        </p>
      </form>
    </CustomDialog>
  );
};

export default LoginPopup;
