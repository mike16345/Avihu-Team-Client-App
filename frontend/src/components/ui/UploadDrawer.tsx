import React from "react";
import BottomDrawer from "./BottomDrawer";
import ImagePreview from "../WeightGraph/ImagePreview";

interface UploadDrawerProps {
  open: boolean;
  onClose: () => void;
}

const UploadDrawer: React.FC<UploadDrawerProps> = ({ onClose, open }) => {
  return (
    <BottomDrawer open={open} onClose={onClose}>
      <ImagePreview handleClose={onClose} />
    </BottomDrawer>
  );
};

export default UploadDrawer;
