import { AnimatePresence, motion } from "motion/react";
import CalculatorPage from "./CalculatorPage";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <AnimatePresence mode="wait">
        <motion.div
          key="calculator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          <CalculatorPage />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
