import React, { useState } from "react";
import BottomDrawer from "./BottomDrawer";
import ImagePreview from "../WeightGraph/ImagePreview";
import TriggerWrapper, { TriggerProps } from "./TriggerWrapper";

export interface UploadDrawerProps {
  trigger: TriggerProps;
  handleUpload: (images: string[]) => Promise<void>;
  loading?: boolean;
  imageCap?: number;
}

const UploadDrawer: React.FC<UploadDrawerProps> = ({
  trigger,
  handleUpload,
  loading,
  imageCap,
}) => {
  const [open, setOpen] = useState(false);

  const onUpload = async (images: string[]) => {
    await handleUpload(images);

    onClose();
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TriggerWrapper trigger={trigger} setOpen={() => setOpen(true)} />

      <BottomDrawer key={String(open.valueOf())} open={open} onClose={onClose}>
        <ImagePreview loading={loading} imageCap={imageCap} handleUpload={onUpload} />
      </BottomDrawer>
    </>
  );
};

export default UploadDrawer;
