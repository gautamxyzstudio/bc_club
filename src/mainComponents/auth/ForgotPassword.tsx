import CustomButton from "@/src/components/button/CustomButton";
import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import { TextField } from "@mui/material";

interface ForgotPasswordProps {
  open: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onOpenForgot: () => void;
  onOpenOtp: () => void;
}

const ForgotPassword = ({ open, onClose,onOpenOtp }: ForgotPasswordProps) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Forgot password"
      description="Please enter your email to reset the password"
    >
      <TextField label="Email" type="email" className="w-full" />
      <CustomButton
        onClick={() => {
          onClose();  
          onOpenOtp();  
        }}
        label="Reset Password"
        buttonType="primary"
        customClasses="w-full mt-5"
      />
    </CustomDialog>
  );
};

export default ForgotPassword;
