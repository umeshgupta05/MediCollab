import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, Tab, Box } from '@mui/material';
import { BookOpen, MessageCircle, FileText } from 'lucide-react';
import BlogList from '../components/blog/BlogList';
import ResearchList from '../components/research/ResearchList';
import DiscussionList from '../components/discussion/DiscussionList';

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState('BLOGS');

  return (
    <div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['BLOGS', 'DISCUSSIONS', 'RESEARCH'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                border-b-2 py-4 px-1 text-sm font-medium
                ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'BLOGS' && <BlogList />}
        {activeTab === 'DISCUSSIONS' && <DiscussionList />}
        {activeTab === 'RESEARCH' && <ResearchList />}
      </motion.div>
    </div>
  );
}