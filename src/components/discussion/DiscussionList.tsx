import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, TextField, MenuItem, CircularProgress, Typography, Button } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useDiscussionStore } from '../../store/discussionStore';
import { categories } from '../../lib/types';
import Discussion from './Discussion';

interface DiscussionListProps {
  authorId?: string;
}

export default function DiscussionList({ authorId }: DiscussionListProps) {
  const { discussions, loading, error, fetchDiscussions, fetchDiscussionsByAuthor, fetchDiscussionsByCategory } = useDiscussionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (authorId) {
      fetchDiscussionsByAuthor(authorId);
    } else {
      fetchDiscussions();
    }
  }, [fetchDiscussions, fetchDiscussionsByAuthor, authorId]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      if (authorId) {
        fetchDiscussionsByAuthor(authorId);
      } else {
        fetchDiscussions();
      }
    } else {
      fetchDiscussionsByCategory(category);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    return discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <Typography variant="h6" color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => authorId ? fetchDiscussionsByAuthor(authorId) : fetchDiscussions()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <TextField
            fullWidth
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ '& .MuiInputBase-root': { paddingLeft: '2.5rem' } }}
          />
        </div>
        <TextField
          select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {categories.map(category => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {filteredDiscussions.length === 0 ? (
        <div className="text-center py-12">
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No discussions found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : authorId 
                ? "This user hasn't started any discussions yet" 
                : "Be the first to start a discussion!"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            className="mt-4"
          >
            Start Discussion
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Discussion discussion={discussion} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}