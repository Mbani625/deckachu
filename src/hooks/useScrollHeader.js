// hooks/useScrollHeader.js
import { useEffect, useRef, useState } from "react";

export default function useScrollHeader(threshold = 100, hasSearched = true) {
  const [showHeader, setShowHeader] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollDirection = useRef("down");
  const scrollUpDistance = useRef(0);

  useEffect(() => {
    if (!hasSearched) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const delta = scrollTop - lastScrollTop.current;

      if (delta > 0) {
        scrollDirection.current = "down";
        scrollUpDistance.current = 0;
        setShowHeader(false);
      } else if (delta < 0) {
        if (scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          scrollUpDistance.current = 50;
        }

        scrollUpDistance.current += Math.abs(delta);

        if (scrollUpDistance.current > threshold) {
          setShowHeader(true);
        }
      }

      setShowBackToTop(scrollTop > 30);
      lastScrollTop.current = Math.max(scrollTop, 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, hasSearched]);

  return { showHeader, showBackToTop };
}
