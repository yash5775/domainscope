import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 }
  }
};

export default function MetricsBar({ stats, activeFilter, onSelectFilter }) {
  return (
    <motion.div 
      className="stats-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Card */}
      <motion.div 
        className={`stat-card ${activeFilter === 'all' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('all')}
        title="Click to view all checked domains"
        variants={cardVariants}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="stat-title">Total Checked</span>
        <motion.span 
          key={stats.total}
          className="stat-value"
          initial={{ scale: 1.15, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {stats.total}
        </motion.span>
      </motion.div>

      {/* Available Card */}
      <motion.div 
        className={`stat-card stat-available ${activeFilter === 'available' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('available')}
        title="Click to view available domains only"
        variants={cardVariants}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="stat-title">Available</span>
        <motion.span 
          key={stats.available}
          className="stat-value text-available"
          initial={{ scale: 1.2, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {stats.available}
        </motion.span>
      </motion.div>

      {/* Registered Card */}
      <motion.div 
        className={`stat-card stat-taken ${activeFilter === 'taken' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('taken')}
        title="Click to view registered domains only"
        variants={cardVariants}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="stat-title">Registered</span>
        <motion.span 
          key={stats.taken}
          className="stat-value"
          initial={{ scale: 1.15, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {stats.taken}
        </motion.span>
      </motion.div>

      {/* Errors / Rate Limit Card */}
      <motion.div 
        className="stat-card stat-errors"
        title="Domains that encountered registry rate limit or network timeouts"
        variants={cardVariants}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
      >
        <span className="stat-title">Errors / Rate Limit</span>
        <motion.span 
          key={stats.errors}
          className="stat-value"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {stats.errors}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
