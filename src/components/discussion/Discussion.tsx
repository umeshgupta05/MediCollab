import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Chip,
  Button,
  TextField,
  Collapse,
} from '@mui/material';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { useDiscussionStore } from '../../store/discussionStore';
import type { Discussion as DiscussionType } from '../../lib/types';

interface DiscussionProps {
  discussion: DiscussionType;
}

export default function Discussion({ discussion }: DiscussionProps) {
  const { voteDiscussion, addComment } = useDiscussionStore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(discussion.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            {discussion.profiles?.full_name?.[0] || 'U'}
          </Avatar>
        }
        title={discussion.title}
        subheader={`${discussion.profiles?.full_name} • ${formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}`}
      />
      <CardContent>
        <Typography variant="body1" paragraph>
          {discussion.content}
        </Typography>
        <div className="flex flex-wrap gap-1">
          {discussion.tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              className="mr-1 mb-1"
            />
          ))}
        </div>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => voteDiscussion(discussion.id, 'up')}>
          <ThumbsUp
            className={discussion.userVote === 'up' ? 'fill-green-500 stroke-green-500' : ''}
            size={20}
          />
        </IconButton>
        <Typography variant="body2" className="mx-1">
          {discussion.votes}
        </Typography>
        <IconButton onClick={() => voteDiscussion(discussion.id, 'down')}>
          <ThumbsDown
            className={discussion.userVote === 'down' ? 'fill-red-500 stroke-red-500' : ''}
            size={20}
          />
        </IconButton>
        <Button
          startIcon={<MessageCircle size={20} />}
          onClick={() => setShowComments(!showComments)}
        >
          Comments ({discussion.comments?.length || 0})
        </Button>
        <IconButton className="ml-auto">
          <Share2 size={20} />
        </IconButton>
      </CardActions>
      <Collapse in={showComments}>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <TextField
              fullWidth
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </div>
          <div className="space-y-4">
            {discussion.comments?.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  {comment.profiles?.full_name?.[0] || 'U'}
                </Avatar>
                <div>
                  <Typography variant="subtitle2">
                    {comment.profiles?.full_name}
                  </Typography>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Collapse>
    </Card>
  );
}