import React from 'react';
import { CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <CircularProgress size={48} />
      </div>
    </motion.div>
  );
}