import { motion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1];

/**
 * PageTransition
 * A subtle fade + 8px slide-in used on every route mount.
 * It respects reduced-motion automatically via the user's OS setting.
 */
export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease }}
    >
      {children}
    </motion.div>
  );
}