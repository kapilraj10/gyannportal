"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Transition delay in ms. */
  delay?: number;
  /** Vertical offset (px) the content slides up from. */
  y?: number;
  style?: CSSProperties;
}

/**
 * Scroll-reveal wrapper driven by IntersectionObserver + CSS transitions.
 * Animations are disabled entirely for users with reduced motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transitionStyle: CSSProperties = {
    transitionProperty: "opacity, transform",
    transitionDuration: "720ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : `translateY(${y}px)`,
    willChange: visible ? "auto" : "transform, opacity",
    ...style,
  };

  return (
    <div ref={ref} className={className} style={transitionStyle}>
      {children}
    </div>
  );
}