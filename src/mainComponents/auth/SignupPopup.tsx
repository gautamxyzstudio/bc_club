import { Icons } from "@/app/exports";
import CustomButton from "@/src/components/button/CustomButton";
import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Image from "next/image";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React from "react";

interface SignupPopupProps {
  open: boolean;
  onClose: () => void;
}

const SignupPopup = ({ open, onClose }: SignupPopupProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <CustomDialog open={open} onClose={onClose} title="" description="">
      <TextField label="Email" type="email" className="w-full" />

      {/* Password */}
      <div className="relative mt-4">
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          className="w-full"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Keep me logged in */}
      <div className="flex justify-between items-center mt-3">
        <label className="flex items-center gap-2 text-[14px] text-[#9b9a9a] ">
          <input type="checkbox" />
          Keep me logged in
        </label>

        <button className="text-[#22558B] text-sm hover:underline">
          Forget password
        </button>
      </div>

      <CustomButton
        label="Login"
        buttonType="primary"
        customClasses="w-full mt-5"
      />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-[#000F0D] text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      <div className="bg-[#F3F3F3] flex justify-center gap-2 py-3 px-[52px] rounded-md">
        <button className="flex hover:bg-gray-50 transition text-[#232323]">
          Continue with
        </button>

        <Image
          width={100}
          height={100}
          alt="google"
          src={Icons.google}
          className="w-6 h-6 object-contain"
        />
      </div>

      <p className="text-center text-gray-600 text-sm mt-4">
        Need an account?{" "}
        <span className="text-yellow-500 font-medium hover:underline cursor-pointer">
          Create one
        </span>
      </p>
    </CustomDialog>
  );
};

export default SignupPopup;
