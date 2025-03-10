import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box, Button, Typography, Grid, CircularProgress } from '@mui/material';
import { Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileEditor from '../components/profile/ProfileEditor';
import BlogList from '../components/blog/BlogList';
import ResearchList from '../components/research/ResearchList';
import DiscussionList from '../components/discussion/DiscussionList';
import type { Profile } from '../lib/types';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = user?.id === (id || user?.id);
  const profileId = id || user?.id;

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [profileId]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!profileId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', profileId);

      if (error) throw error;
      
      // Refresh profile data
      fetchProfile(profileId);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

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
          onClick={() => fetchProfile(profileId || '')}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <div className="sticky top-24">
            <ProfileCard profile={profile!} isCurrentUser={isCurrentUser} />
            
            {isCurrentUser && (
              <Button
                variant="contained"
                startIcon={<Edit size={16} />}
                fullWidth
                className="mt-4"
                onClick={() => setEditorOpen(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Posts" />
              <Tab label="Research" />
              <Tab label="Discussions" />
              <Tab label="Activity" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && (
            <div>
              <BlogList authorId={profileId} />
            </div>
          )}
          
          {activeTab === 1 && (
            <div>
              <ResearchList authorId={profileId} />
            </div>
          )}
          
          {activeTab === 2 && (
            <div>
              <DiscussionList authorId={profileId} />
            </div>
          )}
          
          {activeTab === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <Typography variant="h6" className="mb-4">Recent Activity</Typography>
              <div className="text-center text-gray-500 py-8">
                <Typography>Activity tracking coming soon</Typography>
              </div>
            </div>
          )}
        </Grid>
      </Grid>
      
      <ProfileEditor 
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}