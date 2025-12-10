import { useState } from "react";
import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import CustomButton from "@/src/components/button/CustomButton";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface NewPasswordProps {
  open: boolean;
  onClose: () => void;
}

const NewPassword = ({ open, onClose }: NewPasswordProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false); // 👈 Separate state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 Separate state

  const handleSubmit = () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log("New Password:", newPassword);
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Set New Password"
      description="Enter your new password and confirm it below."
    >
      <div className="flex flex-col gap-4 mt-4">
        {/* New Password */}
        <TextField
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          className="w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          className="w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <CustomButton
          label="Update Password"
          buttonType="primary"
          customClasses="w-full mt-4"
          onClick={handleSubmit}
        />
      </div>
    </CustomDialog>
  );
};

export default NewPassword;
