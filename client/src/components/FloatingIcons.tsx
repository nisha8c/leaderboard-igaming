import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const icons = ['🎲', '🃏', '🎰', '💰', '🪙', '♠️', '♦️', '♣️', '♥️'];

const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)];
const getRandomPosition = () => `${Math.floor(Math.random() * 90)}%`;
const getRandomDuration = () => Math.random() * 3 + 2;

const FloatingIcons = () => {
  const [floatingItems, setFloatingItems] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = {
        id: Math.random().toString(36).substring(2),
        icon: getRandomIcon(),
        left: Math.random() > 0.5 ? getRandomPosition() : undefined,
        right: Math.random() <= 0.5 ? getRandomPosition() : undefined,
        top: getRandomPosition(),
        duration: getRandomDuration(),
      };
      setFloatingItems((prev) => [...prev, newItem]);

      setTimeout(() => {
        setFloatingItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, newItem.duration * 1000);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {floatingItems.map((item) => (
        <motion.div
          key={item.id}
          style={{
            position: 'fixed',
            top: item.top,
            left: item.left,
            right: item.right,
            fontSize: '2rem',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-30, 30, -20], opacity: [0, 1, 0] }}
          transition={{ duration: item.duration, ease: 'easeInOut' }}
        >
          {item.icon}
        </motion.div>
      ))}
    </>
  );
};

export default FloatingIcons;
