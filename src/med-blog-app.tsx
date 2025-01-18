// src/components/MedBlogApp.js

import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, Tabs, Tab, TextField, Dialog,
  DialogTitle, DialogContent, Button, AppBar, Toolbar, Typography,
  IconButton, Grid, Avatar, Chip, Menu, MenuItem, Drawer, List,
  ListItem, ListItemIcon, ListItemText, CardActions, Snackbar,
  Alert, CircularProgress, Divider, Box, useMediaQuery, useTheme,
  Container, Paper, SpeedDial, SpeedDialAction, TablePagination,
  Badge, Rating, LinearProgress, Accordion, AccordionSummary,
  AccordionDetails, Tooltip, Stack,
  ListItemAvatar,
  Collapse,
  DialogActions
} from '@mui/material';
import {
  Book as BookOpen, Search, Brightness4 as Sun, Brightness7 as Moon,
  Add as Plus, Note as StickyNote, AccountCircle, Favorite,
  FavoriteBorder, Share, Comment, BookmarkBorder, Bookmark,
  Menu as MenuIcon, FilterList, Sort, Delete, Edit, PostAdd,
  Forum, Science, UploadFile, ThumbUp, ThumbDown, AttachFile,
  PictureAsPdf, Link as LinkIcon, Code, Notifications as NotificationsIcon,
  Timeline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PDFViewer } from '@react-pdf/renderer';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

// Initial Data
const initialCategories = [
  'All',
  'Neurology',
  'Cardiology',
  'Oncology',
  'Pediatrics',
  'Surgery',
  'Research',
  'Technology',
  'Education'
];

const initialBlogPosts: {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  likes: number;
  comments: { id: number; content: string; author: string; date: string }[];
  image: string;
  tags: string[];
  isBookmarked: boolean;
  isLiked: boolean;
}[] = [
  {
    id: 1,
    title: 'Understanding Neuroplasticity',
    content: 'Recent advances in neuroscience have revealed fascinating insights into brain plasticity...',
    author: 'Dr. Sarah Johnson',
    date: '2023-08-15',
    category: 'Neurology',
    likes: 156,
    comments: [],
    image: 'https://source.unsplash.com/random/800x600/?brain',
    tags: ['neuroscience', 'research', 'brain'],
    isBookmarked: false,
    isLiked: false,
  },
  {
    id: 2,
    title: 'Modern Approaches to Cancer Treatment',
    content: 'Innovative cancer treatments are revolutionizing oncology...',
    author: 'Dr. Michael Chen',
    date: '2023-08-16',
    category: 'Oncology',
    likes: 203,
    comments: [],
    image: 'https://source.unsplash.com/random/800x600/?medical',
    tags: ['cancer', 'treatment', 'research'],
    isBookmarked: false,
    isLiked: false,
  },
];

const initialDiscussions: {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  replies: { id: number; content: string; author: string; date: string; votes: number }[];
  votes: number;
  tags: string[];
  userVote: 'up' | 'down' | null;
}[] = [
  {
    id: 1,
    title: 'Treatment approaches for resistant hypertension',
    content: 'What are your experiences with managing resistant hypertension?',
    author: 'Dr. Michael Chen',
    date: '2023-08-16',
    category: 'Cardiology',
    replies: [],
    votes: 45,
    tags: ['hypertension', 'cardiology', 'treatment'],
    userVote: null,
  },
  // Add more initial discussions...
];

const initialResearchPapers = [
  {
    id: 1,
    title: 'Novel Approaches in Cancer Immunotherapy',
    authors: ['Dr. Emily White', 'Dr. James Brown'],
    abstract: 'This study explores innovative immunotherapy techniques...',
    date: '2023-08-01',
    category: 'Oncology',
    impactFactor: 4.5,
    citations: 23,
    discussions: 8,
    pdfUrl: '/papers/immunotherapy-study.pdf',
  },
  // Add more initial research papers...
];

const MedBlogApp = () => {
  // State Management
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [view, setView] = useState('blogs');
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [blogs, setBlogs] = useState(initialBlogPosts);
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [researchPapers, setResearchPapers] = useState(initialResearchPapers);
  const [newPost, setNewPost] = useState<{
    type: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
    attachments: any[];
  }>({
    type: '',
    title: '',
    content: '',
    tags: [],
    category: '',
    attachments: [],
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: 1,
    name: 'Dr. John Doe',
    specialty: 'Neurology',
    avatar: '/avatars/doctor.jpg',
    reputation: 4.8,
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    document.body.style.backgroundColor =
      currentTheme === 'dark' ? '#121212' : '#ffffff';
  }, [currentTheme]);

  // Handlers
  const handleThemeToggle = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleNewPost = (type) => {
    setNewPost({ ...newPost, type });
    setDialogOpen(true);
  };

  // Continuing MedBlogApp.js...

  // Handlers
  const handlePostSubmit = async () => {
    setLoading(true);
    try {
      const newContent = {
        id: Date.now(),
        ...newPost,
        author: user.name,
        date: new Date().toISOString(),
        likes: 0,
        comments: [],
        isBookmarked: false,
        isLiked: false,
        image: 'https://source.unsplash.com/random/800x600/?medical', // Add a default image or handle it dynamically
      };

      switch (newPost.type) {
        case 'blog':
          setBlogs([newContent, ...blogs]);
          break;
        case 'discussion':
          setDiscussions([{
            ...newContent,
            replies: [],
            votes: 0,
            userVote: null
          }, ...discussions]);
          break;
        case 'research':
          setResearchPapers([{
            ...newContent,
            authors: [user.name],
            abstract: newPost.content,
            impactFactor: 0,
            citations: 0,
            discussions: 0,
            pdfUrl: newPost.attachments[0]?.url || '',
          }, ...researchPapers]);
          break;
        default:
          break;
      }

      setSnackbar({
        open: true,
        message: 'Post published successfully!',
        severity: 'success',
      });
      setDialogOpen(false);
      setNewPost({
        type: '',
        title: '',
        content: '',
        tags: [],
        category: '',
        attachments: [],
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error publishing post',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (postId) => {
    setBlogs(blogs.map(blog => 
      blog.id === postId ? { ...blog, isBookmarked: !blog.isBookmarked } : blog
    ));
  };

  const handleLike = (postId) => {
    setBlogs(blogs.map(blog =>
      blog.id === postId ? { 
        ...blog, 
        isLiked: !blog.isLiked,
        likes: blog.isLiked ? blog.likes - 1 : blog.likes + 1 
      } : blog
    ));
  };

  const handleCommentOpen = (postId) => {
    setBlogs(blogs.map(blog =>
      blog.id === postId ? { ...blog, showComments: !blog.comments } : blog
    ));
  };

  const handleAddComment = (postId, content) => {
    const newComment = {
      id: Date.now(),
      content,
      author: user.name,
      date: new Date().toISOString()
    };

    setBlogs(blogs.map(blog =>
      blog.id === postId ? {
        ...blog,
        comments: [...(blog.comments || []), newComment]
      } : blog
    ));
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `${post.title}\n\n${post.content}\n\n${window.location.href}`
        );
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error sharing content',
        severity: 'error'
      });
    }
  };

  const handleVote = (discussionId, voteType) => {
    setDiscussions(discussions.map(discussion =>
      discussion.id === discussionId ? {
        ...discussion,
        votes: voteType === 'up' 
          ? discussion.votes + (discussion.userVote === 'up' ? -1 : 1)
          : discussion.votes + (discussion.userVote === 'down' ? 1 : -1),
        userVote: discussion.userVote === voteType ? null : voteType
      } : discussion
    ));
  };

  const handleDownloadPaper = async (paperId) => {
    setLoading(true);
    try {
      // Simulate paper download
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: 'Paper downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error downloading paper',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Components
  const BlogList = () => {
    const filteredBlogs = blogs.filter(
      blog =>
        (selectedCategory === 'All' || blog.category === selectedCategory) &&
        (blog.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
         blog.content.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    return (
      <Grid container spacing={3}>
        {filteredBlogs.map(blog => (
          <Grid item xs={12} md={6} key={blog.id}>
            <BlogPost post={blog} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const BlogPost = ({ post }) => (
    <StyledCard>
      <CardHeader
        avatar={<Avatar>{post.author[0]}</Avatar>}
        title={post.title}
        subheader={`${post.author} • ${new Date(post.date).toLocaleDateString()}`}
        action={
          <IconButton onClick={() => handleBookmark(post.id)}>
            {post.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        }
      />
      {post.image && (
        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      )}
      <CardContent>
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {post.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => setSearchFilter(tag)}
              sx={{ marginBottom: 1 }}
            />
          ))}
        </Stack>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={() => handleLike(post.id)}>
          {post.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="caption">{post.likes}</Typography>
        <IconButton onClick={() => handleCommentOpen(post.id)}>
          <Comment />
        </IconButton>
        <Typography variant="caption">
          {post.comments?.length || 0}
        </Typography>
        <IconButton onClick={() => handleShare(post)}>
          <Share />
        </IconButton>
      </CardActions>
      {post.showComments && (
        <CommentSection postId={post.id} comments={post.comments} />
      )}
    </StyledCard>
  );

  const CommentSection = ({ postId, comments = [] }: { postId: number, comments: { id: number, content: string, author: string, date: string }[] }) => {
    const [newComment, setNewComment] = useState('');

    const handleCommentSubmit = (e) => {
      e.preventDefault();
      if (newComment.trim()) {
        handleAddComment(postId, newComment);
        setNewComment('');
      }
    };

    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <form onSubmit={handleCommentSubmit}>
          <TextField
            fullWidth
            size="small"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Button
                  type="submit"
                  size="small"
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              ),
            }}
          />
        </form>
        <List>
          {comments.map(comment => (
            <ListItem key={comment.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{comment.author[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={comment.author}
                secondary={
                  <>
                    <Typography variant="body2" color="text.primary">
                      {comment.content}
                    </Typography>
                    <Typography variant="caption">
                      {new Date(comment.date).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  // Continuing MedBlogApp.js...

  // Discussion Components
  const DiscussionList = () => {
    const filteredDiscussions = discussions.filter(
      discussion =>
        (selectedCategory === 'All' || discussion.category === selectedCategory) &&
        (discussion.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
         discussion.content.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    return (
      <Stack spacing={2}>
        {filteredDiscussions.map(discussion => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </Stack>
    );
  };

  const DiscussionCard = ({ discussion }) => {
    const [expanded, setExpanded] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = () => {
      if (replyContent.trim()) {
        const newReply = {
          id: Date.now(),
          content: replyContent,
          author: user.name,
          date: new Date().toISOString(),
          votes: 0,
        };

        setDiscussions(discussions.map(d =>
          d.id === discussion.id
            ? { ...d, replies: [...(d.replies || []), newReply] }
            : d
        ));
        setReplyContent('');
        setSnackbar({
          open: true,
          message: 'Reply posted successfully!',
          severity: 'success'
        });
      }
    };

    return (
      <StyledCard>
        <CardHeader
          avatar={<Avatar>{discussion.author[0]}</Avatar>}
          title={discussion.title}
          subheader={`${discussion.author} • ${new Date(discussion.date).toLocaleDateString()}`}
          action={
            <Chip label={discussion.category} color="primary" size="small" />
          }
        />
        <CardContent>
          <Typography variant="body1" paragraph>
            {discussion.content}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {discussion.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onClick={() => setSearchFilter(tag)}
                sx={{ marginBottom: 1 }}
              />
            ))}
          </Stack>
        </CardContent>
        <CardActions>
          <IconButton onClick={() => handleVote(discussion.id, 'up')}>
            <ThumbUp color={discussion.userVote === 'up' ? 'primary' : 'inherit'} />
          </IconButton>
          <Typography>{discussion.votes}</Typography>
          <IconButton onClick={() => handleVote(discussion.id, 'down')}>
            <ThumbDown color={discussion.userVote === 'down' ? 'error' : 'inherit'} />
          </IconButton>
          <Button
            startIcon={<Comment />}
            onClick={() => setExpanded(!expanded)}
          >
            Replies ({discussion.replies?.length || 0})
          </Button>
        </CardActions>
        <Collapse in={expanded}>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              disabled={!replyContent.trim()}
              onClick={handleReplySubmit}
            >
              Post Reply
            </Button>
            <List>
              {discussion.replies?.map(reply => (
                <ListItem key={reply.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{reply.author[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={reply.author}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary">
                          {reply.content}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(reply.date).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Collapse>
      </StyledCard>
    );
  };

  // Research Components
  const ResearchList = () => {
    const filteredPapers = researchPapers.filter(
      paper =>
        (selectedCategory === 'All' || paper.category === selectedCategory) &&
        (paper.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
         paper.abstract.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    return (
      <Grid container spacing={3}>
        {filteredPapers.map(paper => (
          <Grid item xs={12} md={6} key={paper.id}>
            <ResearchCard paper={paper} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const ResearchCard = ({ paper }) => {
    const [showAbstract, setShowAbstract] = useState(false);

    return (
      <StyledCard>
        <CardHeader
          avatar={
            <Avatar>
              <Science />
            </Avatar>
          }
          title={paper.title}
          subheader={`Authors: ${paper.authors.join(', ')}`}
        />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              label={`Impact Factor: ${paper.impactFactor}`}
              color="primary"
            />
            <Chip label={paper.category} />
            <Chip label={`Citations: ${paper.citations}`} />
          </Stack>
          <Collapse in={showAbstract}>
            <Typography variant="body2" paragraph>
              {paper.abstract}
            </Typography>
          </Collapse>
          <Button
            size="small"
            onClick={() => setShowAbstract(!showAbstract)}
          >
            {showAbstract ? 'Show Less' : 'Show Abstract'}
          </Button>
        </CardContent>
        <CardActions>
          <Button
            startIcon={<PictureAsPdf />}
            onClick={() => handleDownloadPaper(paper.id)}
          >
            Download PDF
          </Button>
          <Button
            startIcon={<LinkIcon />}
            onClick={() => {
              navigator.clipboard.writeText(
                `${paper.authors.join(', ')}. (${new Date(paper.date).getFullYear()}). ${paper.title}`
              );
              setSnackbar({
                open: true,
                message: 'Citation copied to clipboard!',
                severity: 'success'
              });
            }}
          >
            Cite
          </Button>
          <Button
            startIcon={<Forum />}
            onClick={() => {
              setView('discussions');
              handleNewPost('discussion');
            }}
          >
            Discuss
          </Button>
        </CardActions>
      </StyledCard>
    );
  };

  // Dialog Components
  const CreatePostDialog = () => {
    const [files, setFiles] = useState<File[]>([]);
    const quillRef = React.useRef<ReactQuill | null>(null);

    const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles as File[]]);
    };

    const handleRemoveFile = (index) => {
      setFiles(files.filter((_, i) => i !== index));
    };

    return (
      <Dialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {newPost.type === 'blog'
            ? 'Write Blog'
            : newPost.type === 'discussion'
            ? 'Start Discussion'
            : 'Share Research Paper'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newPost.title}
            onChange={(e) =>
              setNewPost({ ...newPost, title: e.target.value })
            }
            margin="normal"
            variant="outlined"
          />

          {newPost.type !== 'research' ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <ReactQuill
                ref={quillRef}
                value={newPost.content}
                onChange={(content) =>
                  setNewPost({ ...newPost, content })
                }
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image', 'code-block'],
                    ['clean'],
                  ],
                }}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFile />}
                  fullWidth
                >
                  Upload PDF
                </Button>
              </label>
            </Box>
          )}

          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={newPost.tags.join(', ')}
            onChange={(e) =>
              setNewPost({
                ...newPost,
                tags: e.target.value.split(',').map((tag) => tag.trim()),
              })
            }
            margin="normal"
            variant="outlined"
          />

          <TextField
            select
            fullWidth
            label="Category"
            value={newPost.category}
            onChange={(e) =>
              setNewPost({ ...newPost, category: e.target.value })
            }
            margin="normal"
            variant="outlined"
          >
            {initialCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Attachments:</Typography>
              <List>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <AttachFile />
                    </ListItemIcon>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePostSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Continuing MedBlogApp.js...

  // Layout Components
  const Sidebar = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <List>
        {initialCategories.map((category) => (
          <ListItem
            button
            key={category}
            selected={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Quick Links
      </Typography>
      <List>
        <ListItem button onClick={() => setView('blogs')}>
          <ListItemIcon><PostAdd /></ListItemIcon>
          <ListItemText primary="Latest Blogs" />
        </ListItem>
        <ListItem button onClick={() => setView('discussions')}>
          <ListItemIcon><Forum /></ListItemIcon>
          <ListItemText primary="Active Discussions" />
        </ListItem>
        <ListItem button onClick={() => setView('research')}>
          <ListItemIcon><Science /></ListItemIcon>
          <ListItemText primary="Recent Papers" />
        </ListItem>
      </List>
    </Paper>
  );

  const SearchBar = () => (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: { xs: '100%', sm: 400 },
        maxWidth: '100%',
      }}
    >
      <IconButton sx={{ p: '10px' }}>
        <Search />
      </IconButton>
      <TextField
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search medical content..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        variant="standard"
        InputProps={{ disableUnderline: true }}
      />
      {searchFilter && (
        <IconButton onClick={() => setSearchFilter('')}>
          <Delete />
        </IconButton>
      )}
    </Paper>
  );

  const NotificationSystem = () => {
    const [notifications, setNotifications] = useState<{ id: number; title: string; message: string }[]>([]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const handleNotificationClick = (event) => {
      setNotificationAnchor(event.currentTarget);
    };

    return (
      <>
        <IconButton color="inherit" onClick={handleNotificationClick}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem>No new notifications</MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  handleNotificationClick(notification);
                  setNotificationAnchor(null);
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                />
              </MenuItem>
            ))
          )}
        </Menu>
      </>
    );
  };

  const UserProfile = () => {
    const [profileStats, setProfileStats] = useState({
      posts: blogs.filter(blog => blog.author === user.name).length,
      discussions: discussions.filter(disc => disc.author === user.name).length,
      papers: researchPapers.filter(paper => paper.authors.includes(user.name)).length,
      reputation: 4.5,
    });

    return (
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={user.avatar}
              sx={{ width: 56, height: 56 }}
            >
              {user.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.specialty}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{profileStats.posts}</Typography>
                <Typography color="text.secondary">Blog Posts</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{profileStats.discussions}</Typography>
                <Typography color="text.secondary">Discussions</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{profileStats.papers}</Typography>
                <Typography color="text.secondary">Research Papers</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reputation
            </Typography>
            <Rating
              value={profileStats.reputation}
              readOnly
              precision={0.5}
            />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Timeline>
              {/* Add recent activity items here */}
            </Timeline>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  // Main Content Section
  const MainContent = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Sidebar />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {view === 'blogs' && <BlogList />}
              {view === 'discussions' && <DiscussionList />}
              {view === 'research' && <ResearchList />}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );

  // Final Render
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            MedStudent Hub
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar />
          </Box>
          <NotificationSystem />
          <IconButton color="inherit" onClick={handleThemeToggle}>
            {currentTheme === 'light' ? <Moon /> : <Sun />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setProfileDialogOpen(true)}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
        <Tabs
          value={view}
          onChange={(e, newValue) => setView(newValue)}
          centered
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab label="Blogs" value="blogs" />
          <Tab label="Discussions" value="discussions" />
          <Tab label="Research" value="research" />
        </Tabs>
      </AppBar>
      <Toolbar /> {/* Spacing for fixed AppBar */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Sidebar />
        </Box>
      </Drawer>
      
      <MainContent />

      <StyledSpeedDial
        ariaLabel="Create new content"
        icon={<Plus />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        <SpeedDialAction
          icon={<PostAdd />}
          tooltipTitle="Write Blog"
          onClick={() => handleNewPost('blog')}
        />
        <SpeedDialAction
          icon={<Forum />}
          tooltipTitle="Start Discussion"
          onClick={() => handleNewPost('discussion')}
        />
        <SpeedDialAction
          icon={<Science />}
          tooltipTitle="Share Research"
          onClick={() => handleNewPost('research')}
        />
      </StyledSpeedDial>

      <CreatePostDialog />
      <UserProfile />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedBlogApp;
  