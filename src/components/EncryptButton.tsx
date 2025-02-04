import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

const TARGET_TEXT = "Pay Now";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

export const EncryptButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [text, setText] = useState(TARGET_TEXT);

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setText(TARGET_TEXT);
  };

  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      whileHover={{
        scale: 1.025,
      }}
      whileTap={{
        scale: 0.975,
      }}
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
      className={`w-full relative group overflow-hidden rounded-lg border border-white/20 
        bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] bg-[length:200%_200%] 
        px-4 py-3 font-mono font-medium text-white transition-all duration-300
        disabled:opacity-75 disabled:cursor-not-allowed
        hover:shadow-lg hover:border-white/40`}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4" />
        <span>{isSubmitting ? "Processing..." : text}</span>
      </div>
      <motion.span
        initial={{
          y: "100%",
        }}
        animate={{
          y: "-100%",
        }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 1,
          ease: "linear",
        }}
        className="duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t 
          from-white/0 from-40% via-white/10 to-white/0 to-60% 
          opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.button>
  );
};