import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";

export const ConfirmDialog = ({open, title, children, onAccept, onCancel, onAcceptText = "OK", onCancelText = "Отмена"}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {children}
      </DialogContent>
      {Boolean(onAccept || onCancel) && (
        <DialogActions style={{justifyContent: 'center'}}>
            {onAccept && (
              <Button variant="contained" onClick={onAccept}>
                {onAcceptText}
              </Button>
            )}
            {onCancel && (
              <Button variant="text" onClick={onCancel}>
                {onCancelText}
              </Button>
            )}
        </DialogActions>
      )}
    </Dialog>
  )
}
