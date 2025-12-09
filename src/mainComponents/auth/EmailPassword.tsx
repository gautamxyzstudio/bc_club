import CustomDialog from "@/src/components/common/customDialog/CustomDialog"

 interface EmailPasswordProps{
    open:boolean;
    onClose:() => void
 }

const EmailPassword = ({open ,onClose}:EmailPasswordProps) => {
  return (
    <CustomDialog open={open} onClose={onClose} title="" description="">

        <div>
            EmailPassword
        </div>
    </CustomDialog>
  )
}

export default EmailPassword