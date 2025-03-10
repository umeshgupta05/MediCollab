import React, { useState } from 'react';
import { 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Alert
} from '@mui/material';
import { PenSquare, MessageCircle, FileText, X, Plus, Upload } from 'lucide-react';
import { categories } from '../lib/types';
import { useBlogStore } from '../store/blogStore';
import { useDiscussionStore } from '../store/discussionStore';
import { useResearchStore } from '../store/researchStore';
import { useAuthStore } from '../store/authStore';

type ContentType = 'blog' | 'discussion' | 'research';

interface BlogFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  image?: File;
}

interface DiscussionFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface ResearchFormData {
  title: string;
  abstract: string;
  methodology: string;
  results: string;
  conclusion: string;
  category: string;
  tags: string[];
  paper?: File;
  supplementaryFiles: File[];
}

const initialBlogForm: BlogFormData = {
  title: '',
  content: '',
  category: '',
  tags: [],
};

const initialDiscussionForm: DiscussionFormData = {
  title: '',
  content: '',
  category: '',
  tags: [],
};

const initialResearchForm: ResearchFormData = {
  title: '',
  abstract: '',
  methodology: '',
  results: '',
  conclusion: '',
  category: '',
  tags: [],
  supplementaryFiles: [],
};

export default function CreateContentFab() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [blogForm, setBlogForm] = useState<BlogFormData>(initialBlogForm);
  const [discussionForm, setDiscussionForm] = useState<DiscussionFormData>(initialDiscussionForm);
  const [researchForm, setResearchForm] = useState<ResearchFormData>(initialResearchForm);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { createPost } = useBlogStore();
  const { createDiscussion } = useDiscussionStore();
  const { createPaper, uploadFile } = useResearchStore();

  const actions = [
    { icon: <PenSquare />, name: 'Write Blog', type: 'blog' },
    { icon: <MessageCircle />, name: 'Start Discussion', type: 'discussion' },
    { icon: <FileText />, name: 'Share Research', type: 'research' }
  ];

  const handleSpeedDialAction = (type: ContentType) => {
    setContentType(type);
    setDialogOpen(true);
    setOpen(false);
    setError(null);
  };

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && currentTag.trim()) {
      event.preventDefault();
      const newTag = currentTag.trim();
      
      switch (contentType) {
        case 'blog':
          if (!blogForm.tags.includes(newTag)) {
            setBlogForm(prev => ({
              ...prev,
              tags: [...prev.tags, newTag]
            }));
          }
          break;
        case 'discussion':
          if (!discussionForm.tags.includes(newTag)) {
            setDiscussionForm(prev => ({
              ...prev,
              tags: [...prev.tags, newTag]
            }));
          }
          break;
        case 'research':
          if (!researchForm.tags.includes(newTag)) {
            setResearchForm(prev => ({
              ...prev,
              tags: [...prev.tags, newTag]
            }));
          }
          break;
      }
      
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    switch (contentType) {
      case 'blog':
        setBlogForm(prev => ({
          ...prev,
          tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
        break;
      case 'discussion':
        setDiscussionForm(prev => ({
          ...prev,
          tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
        break;
      case 'research':
        setResearchForm(prev => ({
          ...prev,
          tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
        break;
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'paper' | 'supplementary') => {
    try {
      if (!file) return;

      // Validate file type and size
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (type === 'image' && !isImage) {
        throw new Error('Please upload an image file (JPEG, PNG)');
      }

      if ((type === 'paper' || type === 'supplementary') && !isPDF) {
        throw new Error('Please upload a PDF file');
      }

      if (file.size > maxSize) {
        throw new Error('File size should be less than 5MB');
      }

      if (type === 'image') {
        setBlogForm(prev => ({ ...prev, image: file }));
      } else if (type === 'paper') {
        setResearchForm(prev => ({ ...prev, paper: file }));
      } else {
        setResearchForm(prev => ({
          ...prev,
          supplementaryFiles: [...prev.supplementaryFiles, file]
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error uploading file');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);

    try {
      switch (contentType) {
        case 'blog': {
          let imageUrl;
          if (blogForm.image) {
            imageUrl = await uploadFile(blogForm.image);
          }

          await createPost({
            ...blogForm,
            image_url: imageUrl,
            author_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          break;
        }
        case 'discussion':
          await createDiscussion({
            ...discussionForm,
            author_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          break;
        case 'research': {
          let paperUrl;
          let supplementaryUrls = [];

          if (researchForm.paper) {
            paperUrl = await uploadFile(researchForm.paper);
          }

          for (const file of researchForm.supplementaryFiles) {
            const url = await uploadFile(file);
            supplementaryUrls.push(url);
          }

          await createPaper({
            title: researchForm.title,
            abstract: researchForm.abstract,
            content: `
              # Methodology
              ${researchForm.methodology}

              # Results
              ${researchForm.results}

              # Conclusion
              ${researchForm.conclusion}
            `,
            category: researchForm.category,
            tags: researchForm.tags,
            file_url: paperUrl,
            supplementary_files: supplementaryUrls,
            author_id: user.id,
            impact_factor: 0,
            citations: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          break;
        }
      }

      setDialogOpen(false);
      setBlogForm(initialBlogForm);
      setDiscussionForm(initialDiscussionForm);
      setResearchForm(initialResearchForm);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error creating content');
    }
  };

  const renderForm = () => {
    switch (contentType) {
      case 'blog':
        return (
          <>
            <TextField
              fullWidth
              label="Title"
              value={blogForm.title}
              onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={6}
              value={blogForm.content}
              onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4">
              <InputLabel>Category</InputLabel>
              <Select
                value={blogForm.category}
                label="Category"
                onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0] as File, 'image')}
              className="mb-4"
            />
          </>
        );

      case 'discussion':
        return (
          <>
            <TextField
              fullWidth
              label="Title"
              value={discussionForm.title}
              onChange={(e) => setDiscussionForm(prev => ({ ...prev, title: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Topic Description"
              multiline
              rows={6}
              value={discussionForm.content}
              onChange={(e) => setDiscussionForm(prev => ({ ...prev, content: e.target.value }))}
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4">
              <InputLabel>Category</InputLabel>
              <Select
                value={discussionForm.category}
                label="Category"
                onChange={(e) => setDiscussionForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );

      case 'research':
        return (
          <>
            <TextField
              fullWidth
              label="Title"
              value={researchForm.title}
              onChange={(e) => setResearchForm(prev => ({ ...prev, title: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Abstract"
              multiline
              rows={4}
              value={researchForm.abstract}
              onChange={(e) => setResearchForm(prev => ({ ...prev, abstract: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Methodology"
              multiline
              rows={4}
              value={researchForm.methodology}
              onChange={(e) => setResearchForm(prev => ({ ...prev, methodology: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Results"
              multiline
              rows={4}
              value={researchForm.results}
              onChange={(e) => setResearchForm(prev => ({ ...prev, results: e.target.value }))}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Conclusion"
              multiline
              rows={4}
              value={researchForm.conclusion}
              onChange={(e) => setResearchForm(prev => ({ ...prev, conclusion: e.target.value }))}
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4">
              <InputLabel>Category</InputLabel>
              <Select
                value={researchForm.category}
                label="Category"
                onChange={(e) => setResearchForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="mb-4">
              <p className="mb-2">Upload Research Paper (PDF)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files?.[0] as File, 'paper')}
              />
            </div>
            <div className="mb-4">
              <p className="mb-2">Upload Supplementary Files (PDF)</p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(file => {
                    handleFileUpload(file, 'supplementary');
                  });
                }}
              />
            </div>
          </>
        );
    }
  };

  const getCurrentTags = () => {
    switch (contentType) {
      case 'blog':
        return blogForm.tags;
      case 'discussion':
        return discussionForm.tags;
      case 'research':
        return researchForm.tags;
    }
  };

  return (
    <>
      <SpeedDial
        ariaLabel="Create Content"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<Plus />} openIcon={<X />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.type}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleSpeedDialAction(action.type as ContentType)}
          />
        ))}
      </SpeedDial>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {contentType === 'blog' && 'Write a Blog Post'}
          {contentType === 'discussion' && 'Start a Discussion'}
          {contentType === 'research' && 'Share Research Paper'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <div className="space-y-4 mt-4">
            {renderForm()}
            
            <div>
              <TextField
                fullWidth
                label="Add tags (press Enter)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleAddTag}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {getCurrentTags().map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {contentType === 'blog' && 'Publish Post'}
            {contentType === 'discussion' && 'Start Discussion'}
            {contentType === 'research' && 'Share Paper'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}