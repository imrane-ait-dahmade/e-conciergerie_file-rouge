"use client";

/**
 * Couches animées (bleu #3B82F6 + ambre #FBBF24) pour les pages login / signup.
 * Rendu client uniquement — ne bloque pas le SSR du contenu.
 */
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BLUE = "#3B82F6";
const AMBER = "#FBBF24";

export function AuthPageBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <Blob
        reduceMotion={reduceMotion}
        className="-left-[15%] top-[5%] size-[min(28rem,85vw)] blur-[72px]"
        style={{ backgroundColor: BLUE, opacity: 0.38 }}
        animate={{
          x: [0, 36, -12, 0],
          y: [0, 24, 8, 0],
          scale: [1, 1.06, 0.98, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <Blob
        reduceMotion={reduceMotion}
        className="-right-[10%] bottom-[8%] size-[min(26rem,80vw)] blur-[68px]"
        style={{ backgroundColor: AMBER, opacity: 0.36 }}
        animate={{
          x: [0, -28, 16, 0],
          y: [0, -20, 12, 0],
          scale: [1, 1.05, 1.02, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      />
      <Blob
        reduceMotion={reduceMotion}
        className="left-[35%] top-[45%] size-[min(18rem,55vw)] blur-[56px]"
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${AMBER} 100%)`,
          opacity: 0.22,
        }}
        animate={{
          x: [0, -20, 24, 0],
          y: [0, 32, -16, 0],
          rotate: [0, 8, -6, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />
    </div>
  );
}

type BlobProps = {
  reduceMotion: boolean | null;
  className: string;
  style: CSSProperties;
  animate: Record<string, number[]>;
  transition: Record<string, unknown>;
};

function Blob({ reduceMotion, className, style, animate, transition }: BlobProps) {
  const classNames = `absolute rounded-full ${className}`;
  if (reduceMotion) {
    return <div className={classNames} style={style} />;
  }
  return (
    <motion.div
      className={classNames}
      style={style}
      animate={animate}
      transition={transition}
    />
  );
}
