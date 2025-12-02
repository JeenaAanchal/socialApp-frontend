import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]"
    >
      {/* Fade-in icon */}
      <motion.img
        src="/lynk-icon.png"
        alt="Lynk Icon"
        className="w-20 h-20 mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Fade-in text */}
      <motion.p
        className="text-gray-600 text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
