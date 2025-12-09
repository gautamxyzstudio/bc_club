import CustomDialog from "@/src/components/common/customDialog/CustomDialog";

 interface ForgotCodeProps{
    open:boolean;
    onClose:() =>void

 }

const ForgotCode = ({open, onClose}:ForgotCodeProps) => {
  return (
    <CustomDialog open={open} onClose={onClose}  title="" description="" >

        <div>
            forgot code 
        </div>
    </CustomDialog>
  )
}

export default ForgotCode