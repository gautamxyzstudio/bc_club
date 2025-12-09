import CustomDialog from "@/src/components/common/customDialog/CustomDialog"

 

interface ForgotPasswordProps {
    open :boolean;
    onClose: () => void;
}

const ForgotPassword = ({open, onClose}:ForgotPasswordProps) => {
  return (
    <CustomDialog open={open} onClose={onClose} title="" description="">
        <div>
            forgot password
        </div>
    </CustomDialog>
  )
}

export default ForgotPassword