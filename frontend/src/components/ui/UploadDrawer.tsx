import React, { useState } from "react";
import BottomDrawer from "./BottomDrawer";
import ImagePreview from "../WeightGraph/ImagePreview";
import TriggerWrapper, { TriggerProps } from "./TriggerWrapper";

interface UploadDrawerProps {
  trigger: TriggerProps;
}

const UploadDrawer: React.FC<UploadDrawerProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  console.log("open", open);

  return (
    <>
      <TriggerWrapper trigger={trigger} setOpen={() => setOpen(true)} />

      <BottomDrawer key={open.valueOf()} open={open} onClose={onClose}>
        <ImagePreview handleClose={onClose} />
      </BottomDrawer>
    </>
  );
};

export default UploadDrawer;
