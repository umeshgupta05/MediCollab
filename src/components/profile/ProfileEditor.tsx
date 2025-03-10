import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import { X, Upload, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';

interface ProfileEditorProps {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  onSave: (profile: Partial<Profile>) => Promise<void>;
}

export default function ProfileEditor({ open, onClose, profile, onSave }: ProfileEditorProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [interests, setInterests] = useState<string[]>(profile?.research_interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: profile?.full_name || '',
      specialty: profile?.specialty || '',
      institution: profile?.institution || '',
      bio: profile?.bio || '',
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let avatarUrl = profile?.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Save profile
      await onSave({
        ...data,
        avatar_url: avatarUrl,
        research_interests: interests,
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-4">
              <Avatar 
                src={avatarPreview || undefined} 
                sx={{ width: 80, height: 80 }}
                className="mb-2"
              >
                {profile?.full_name?.[0] || 'U'}
              </Avatar>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Upload size={16} />}
                size="small"
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Button>
            </div>

            {/* Name */}
            <Controller
              name="full_name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message as string}
                />
              )}
            />

            {/* Specialty */}
            <Controller
              name="specialty"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Specialty"
                  fullWidth
                />
              )}
            />

            {/* Institution */}
            <Controller
              name="institution"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Institution"
                  fullWidth
                />
              )}
            />

            {/* Bio */}
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bio"
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />

            {/* Research Interests */}
            <div>
              <div className="flex gap-2 mb-2">
                <TextField
                  label="Research Interests"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                />
                <IconButton 
                  onClick={handleAddInterest}
                  disabled={!newInterest.trim()}
                  color="primary"
                >
                  <Plus size={20} />
                </IconButton>
              </div>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onDelete={() => handleRemoveInterest(interest)}
                    className="mb-1"
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}