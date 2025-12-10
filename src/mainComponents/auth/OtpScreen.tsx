import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import OTPInput from "react-otp-input";
import { useState } from "react";
import CustomButton from "@/src/components/button/CustomButton";

interface OtpScreenProps {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

const OtpScreen = ({ open, onClose, onVerified }: OtpScreenProps) => {
  const [otp, setOtp] = useState("");

  const handleOtpChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    setOtp(numeric);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("Text");
    if (!/^\d*$/.test(paste)) e.preventDefault();
  };

  const handleVerify = () => {
    if (otp.length < 5) {
      alert("Please enter the 5-digit code.");
      return;
    }
    onVerified?.();
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Check Your Email"
      description="Enter the 5-digit code sent to your email."
    >
      <div className="flex justify-center mt-6">
        <OTPInput
          value={otp}
          onChange={handleOtpChange}
          numInputs={5}
          shouldAutoFocus  
          renderInput={(props) => (
            <input
              {...props}
              inputMode="numeric"
              pattern="[0-9]*"
              onPaste={handlePaste}
              style={{
                width: "50%",
                height: "54px",
                margin: "0 6px",
                fontSize: "22px",
                borderRadius: "8px",
                border: "1px solid #30548729",
                outline: "none",
                background: "#fff",
                textAlign: "center",
              }}
              className="focus:border-blue-600 focus:ring-1 focus:ring-blue-300"
            />
          )}
        />
      </div>

      <CustomButton
        label="Verify Code"
        buttonType="primary"
        customClasses="w-full mt-6"
        onClick={handleVerify}
      />
    </CustomDialog>
  );
};

export default OtpScreen;
