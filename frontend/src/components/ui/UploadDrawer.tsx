import React, { useState } from "react";
import BottomDrawer from "./BottomDrawer";
import ImagePreview from "../WeightGraph/ImagePreview";
import TriggerWrapper, { TriggerProps } from "./TriggerWrapper";

export interface UploadDrawerProps {
  trigger: TriggerProps;
  handleUpload: (images: string[]) => Promise<void>;
  images?: string[];
  loading?: boolean;
  imageCap?: number;
  confirmTitle?: string;
  hint?: React.ReactNode;
}

const UploadDrawer: React.FC<UploadDrawerProps> = ({
  trigger,
  handleUpload,
  images,
  loading,
  imageCap,
  hint,
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
        <ImagePreview
          images={images}
          loading={loading}
          imageCap={imageCap}
          handleUpload={onUpload}
          confirmTitle="שמירה"
          hint={hint}
        />
      </BottomDrawer>
    </>
  );
};

export default UploadDrawer;
