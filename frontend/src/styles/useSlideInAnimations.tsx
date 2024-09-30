import useSlideFadeIn from "./useSlideFadeIn";

const useSlideInAnimations = () => {
  const animations = {
    slideInTopDelay0: useSlideFadeIn("top", 0),
    slideInTopDelay100: useSlideFadeIn("top", 100),
    slideInTopDelay200: useSlideFadeIn("top", 200),
    slideInTopDelay300: useSlideFadeIn("top", 300),
    slideInTopDelay400: useSlideFadeIn("top", 400),
    slideInTopDelay500: useSlideFadeIn("top", 500),
    slideInTopDelay600: useSlideFadeIn("top", 600),

    slideInBottomDelay0: useSlideFadeIn("bottom", 0),
    slideInBottomDelay100: useSlideFadeIn("bottom", 100),
    slideInBottomDelay200: useSlideFadeIn("bottom", 200),
    slideInBottomDelay300: useSlideFadeIn("bottom", 300),
    slideInBottomDelay400: useSlideFadeIn("bottom", 400),
    slideInBottomDelay500: useSlideFadeIn("bottom", 500),
    slideInBottomDelay600: useSlideFadeIn("bottom", 600),

    slideInLeftDelay0: useSlideFadeIn("left", 0),
    slideInLeftDelay100: useSlideFadeIn("left", 100),
    slideInLeftDelay200: useSlideFadeIn("left", 200),
    slideInLeftDelay300: useSlideFadeIn("left", 300),
    slideInLeftDelay400: useSlideFadeIn("left", 400),
    slideInLeftDelay500: useSlideFadeIn("left", 500),
    slideInLeftDelay600: useSlideFadeIn("left", 600),

    slideInRightDelay0: useSlideFadeIn("right", 0),
    slideInRightDelay100: useSlideFadeIn("right", 100),
    slideInRightDelay200: useSlideFadeIn("right", 200),
    slideInRightDelay300: useSlideFadeIn("right", 300),
    slideInRightDelay400: useSlideFadeIn("right", 400),
    slideInRightDelay500: useSlideFadeIn("right", 500),
    slideInRightDelay600: useSlideFadeIn("right", 600),
  };

  return animations;
};

export default useSlideInAnimations;
