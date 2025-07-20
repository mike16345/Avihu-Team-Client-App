import arrowLeft from "@assets/icons/arrowLeft.svg";
import arrowRoundDown from "@assets/icons/arrowRoundDown.svg";
import arrowRoundLeftSoftSmall from "@assets/icons/arrowRoundLeftSoftSmall.svg";
import arrowRoundRightSmall from "@assets/icons/arrowRoundRightSmall.svg";
import arrowRoundUp from "@assets/icons/arrowRoundUp.svg";
import bell from "@assets/icons/bell.svg";
import calendar from "@assets/icons/calendar.svg";
import camera from "@assets/icons/camera.svg";
import chat from "@assets/icons/chat.svg";
import chefHat from "@assets/icons/chefHat.svg";
import chevronDown from "@assets/icons/chevronDown.svg";
import chevronLeftSoft from "@assets/icons/chevronLeftSoft.svg";
import chevronRightBig from "@assets/icons/chevronRightBig.svg";
import chevronRightSoft from "@assets/icons/chevronRightSoft.svg";
import chevronUp from "@assets/icons/chevronUp.svg";
import clock from "@assets/icons/clock.svg";
import close from "@assets/icons/close.svg";
import closeSoft from "@assets/icons/closeSoft.svg";
import documentText from "@assets/icons/documentText.svg";
import dumbbell from "@assets/icons/dumbbell.svg";
import elipse from "@assets/icons/elipse.svg";
import elipseSoft from "@assets/icons/elipseSoft.svg";
import error from "@assets/icons/error.svg";
import eye from "@assets/icons/eye.svg";
import eyeClose from "@assets/icons/eyeClose.svg";
import gallery from "@assets/icons/gallery.svg";
import graph from "@assets/icons/graph.svg";
import growthIndicator from "@assets/icons/growthIndicator.svg";
import home from "@assets/icons/home.svg";
import info from "@assets/icons/info.svg";
import like from "@assets/icons/like.svg";
import loader from "@assets/icons/loader.svg";
import sideBar from "@assets/icons/sideBar.svg";
import twinkle from "@assets/icons/twinkle.svg";
import upload from "@assets/icons/upload.svg";
import check from "@assets/icons/check.svg";

const icons = {
  arrowLeft,
  arrowRoundDown,
  arrowRoundLeftSoftSmall,
  arrowRoundRightSmall,
  arrowRoundUp,
  bell,
  calendar,
  camera,
  chat,
  chefHat,
  chevronDown,
  chevronLeftSoft,
  chevronRightBig,
  chevronRightSoft,
  chevronUp,
  clock,
  close,
  closeSoft,
  documentText,
  dumbbell,
  elipse,
  elipseSoft,
  error,
  eye,
  eyeClose,
  gallery,
  graph,
  growthIndicator,
  home,
  info,
  like,
  loader,
  sideBar,
  twinkle,
  upload,
  check,
} as const;

export type IconName = keyof typeof icons;

export default icons;
