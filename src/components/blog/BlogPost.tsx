import React from 'react';
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
} from '@mui/material';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useBlogStore } from '../../store/blogStore';
import type { BlogPost as BlogPostType } from '../../lib/types';

interface BlogPostProps {
  post: BlogPostType;
}

export default function BlogPost({ post }: BlogPostProps) {
  const { likePost, bookmarkPost } = useBlogStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        avatar={
          <Avatar>
            {post.profiles?.full_name?.[0] || 'U'}
          </Avatar>
        }
        title={post.title}
        subheader={`${post.profiles?.full_name} • ${formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}`}
      />
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="flex-grow">
        <Typography variant="body1" className="line-clamp-3 mb-4">
          {post.content}
        </Typography>
        <div className="flex flex-wrap gap-1">
          {post.tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              className="mr-1 mb-1"
            />
          ))}
        </div>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={() => likePost(post.id)}>
          <Heart className={post.likes > 0 ? 'fill-red-500 stroke-red-500' : ''} size={20} />
        </IconButton>
        <Typography variant="caption" className="mr-2">
          {post.likes}
        </Typography>
        <IconButton>
          <MessageCircle size={20} />
        </IconButton>
        <IconButton>
          <Share2 size={20} />
        </IconButton>
        <IconButton
          onClick={() => bookmarkPost(post.id)}
          className="ml-auto"
        >
          {post.bookmarked ? (
            <BookmarkCheck className="fill-blue-500 stroke-blue-500" size={20} />
          ) : (
            <Bookmark size={20} />
          )}
        </IconButton>
      </CardActions>
    </Card>
  );
}