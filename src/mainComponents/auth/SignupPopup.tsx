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
  onOpenLogin: () => void;
}

const SignupPopup = ({ open, onClose, onOpenLogin }: SignupPopupProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Create an Account"
      description="Enter your information to create a BCclub"
    >
      <div className="flex gap-4 mb-[31px]">
        <TextField label="First Name" type="name" className="w-full " />
        <TextField label="Last Name" type="name" className="w-full" />
      </div>
      {/* <TextField label="Email" type="email" className="w-full " /> */}
      <TextField
        label="Email"
        type="email"
        className="w-full"
        sx={{
          "& .MuiOutlinedInput-input":{
            height:'auto',
            padding:2,
          }
        }}
      />

      {/* Password */}
      <div className="relative mt-4">
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          className="w-full p-4"
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

      <CustomButton
        label="Sign Up"
        buttonType="primary"
        customClasses="w-full mt-5"
      />

      <div className="flex items-center gap-3 mt-5 mb-2.5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-[#000F0D] text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      <div className="bg-[#F3F3F3] flex justify-center gap-1 py-3 px-[52px] rounded-md">
        <button className="flex   transition text-[#232323]">
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

      <p className="text-center flex justify-center text-gray-600 text-sm mt-4 gap-1.5">
        Already have an account?
        <span
          onClick={onOpenLogin}
          className="text-yellow-500 font-medium hover:underline cursor-pointer"
        >
          sign in{" "}
        </span>
      </p>
    </CustomDialog>
  );
};

export default SignupPopup;
