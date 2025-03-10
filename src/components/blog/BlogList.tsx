import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, TextField, MenuItem, CircularProgress, Typography, Button } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useBlogStore } from '../../store/blogStore';
import { categories } from '../../lib/types';
import BlogPost from './BlogPost';

interface BlogListProps {
  authorId?: string;
}

export default function BlogList({ authorId }: BlogListProps) {
  const { posts, loading, error, fetchPosts, fetchPostsByAuthor, fetchPostsByCategory } = useBlogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (authorId) {
      fetchPostsByAuthor(authorId);
    } else {
      fetchPosts();
    }
  }, [fetchPosts, fetchPostsByAuthor, authorId]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      if (authorId) {
        fetchPostsByAuthor(authorId);
      } else {
        fetchPosts();
      }
    } else {
      fetchPostsByCategory(category);
    }
  };

  const filteredPosts = posts.filter(post => {
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
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
          onClick={() => authorId ? fetchPostsByAuthor(authorId) : fetchPosts()}
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
            placeholder="Search blogs..."
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

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No posts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : authorId 
                ? "This user hasn't published any posts yet" 
                : "Be the first to create a post!"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            className="mt-4"
          >
            Create Post
          </Button>
        </div>
      ) : (
        <Grid container spacing={3}>
          {filteredPosts.map((post, index) => (
            <Grid item xs={12} md={6} key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <BlogPost post={post} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}