"use client";

/** Kaydırma ile görünüme girince yumuşakça beliren sarmalayıcı — micro-animasyon standardı. */
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.65, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
