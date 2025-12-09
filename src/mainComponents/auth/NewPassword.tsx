import CustomDialog from "@/src/components/common/customDialog/CustomDialog";

interface NewPasswordProps {
  open: boolean;
  onClose: () => void;
}
const NewPassword = ({ open, onClose }: NewPasswordProps) => {
  return (
    <CustomDialog open={open} onClose={onClose} title="" description="">
      NewPassword
    </CustomDialog>
  );
};

export default NewPassword;
