import React from 'react';
import { Card, CardContent, CardHeader, Avatar, Typography, Chip, Button } from '@mui/material';
import { Mail, MapPin, Award, BookOpen } from 'lucide-react';
import type { Profile } from '../../lib/types';

interface ProfileCardProps {
  profile: Profile;
  isCurrentUser?: boolean;
}

export default function ProfileCard({ profile, isCurrentUser = false }: ProfileCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader
        avatar={
          <Avatar 
            src={profile.avatar_url || undefined} 
            className="w-16 h-16"
            sx={{ width: 64, height: 64 }}
          >
            {profile.full_name?.[0] || 'U'}
          </Avatar>
        }
        title={
          <Typography variant="h5" className="font-bold">
            {profile.full_name || 'Anonymous User'}
          </Typography>
        }
        subheader={
          <div className="flex items-center text-gray-600 mt-1">
            {profile.specialty && (
              <div className="flex items-center mr-4">
                <BookOpen size={16} className="mr-1" />
                <span>{profile.specialty}</span>
              </div>
            )}
            {profile.institution && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                <span>{profile.institution}</span>
              </div>
            )}
          </div>
        }
        action={
          isCurrentUser && (
            <Button 
              variant="outlined" 
              size="small"
              className="mt-2"
            >
              Edit Profile
            </Button>
          )
        }
      />
      <CardContent>
        {profile.bio && (
          <div className="mb-4">
            <Typography variant="body1">{profile.bio}</Typography>
          </div>
        )}
        
        <div className="flex items-center mb-4">
          <Award className="text-blue-600 mr-2" size={20} />
          <Typography variant="subtitle1" className="font-medium">
            Reputation: {profile.reputation || 0}
          </Typography>
        </div>
        
        {profile.research_interests && profile.research_interests.length > 0 && (
          <div>
            <Typography variant="subtitle2" className="font-medium mb-2">
              Research Interests
            </Typography>
            <div className="flex flex-wrap gap-1">
              {profile.research_interests.map((interest) => (
                <Chip 
                  key={interest} 
                  label={interest} 
                  size="small" 
                  className="mr-1 mb-1"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}