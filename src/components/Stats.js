import React from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Total Volume", value: 0, prefix: "$" },
  { label: "Total Trades", value: 0 },
  { label: "Users Connected", value: 0 },
  { label: "Pairs Supported", value: 0 },
];

function CountUp({ end, prefix = "" }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setVal(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setVal(end);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [end]);
  return <>{prefix}{val.toLocaleString()}</>;
}

export default function Stats() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-xl p-8 flex flex-col items-center shadow-lg border border-cyan-400/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="text-3xl md:text-4xl font-extrabold text-cyan-400 drop-shadow-glow"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
            >
              <CountUp end={s.value} prefix={s.prefix} />
            </motion.span>
            <span className="text-white/80 text-base mt-2">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 