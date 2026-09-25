"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";

export default function MapEngageHint({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute left-1/2 top-[4.75rem] z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md"
        >
          <MousePointerClick size={14} />
          Click the map to zoom with your scroll wheel
        </motion.div>
      )}
    </AnimatePresence>
  );
}
