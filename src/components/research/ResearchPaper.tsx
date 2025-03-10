import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Typography,
  Chip,
  Rating,
} from '@mui/material';
import {
  Download,
  FileText,
  Share2,
  MessageCircle,
} from 'lucide-react';
import type { ResearchPaper as ResearchPaperType } from '../../lib/types';

interface ResearchPaperProps {
  paper: ResearchPaperType;
}

export default function ResearchPaper({ paper }: ResearchPaperProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        avatar={
          <Avatar>
            {paper.profiles?.full_name?.[0] || 'U'}
          </Avatar>
        }
        title={paper.title}
        subheader={`${paper.profiles?.full_name} • ${formatDistanceToNow(new Date(paper.created_at), { addSuffix: true })}`}
      />
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <Rating value={paper.impact_factor} precision={0.1} readOnly />
          <Typography variant="body2" color="text.secondary">
            Impact Factor: {paper.impact_factor}
          </Typography>
        </div>
        <Typography variant="body1" className="line-clamp-3 mb-4">
          {paper.abstract}
        </Typography>
        <div className="flex flex-wrap gap-1">
          {paper.tags?.map((tag) => (
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
        <Button
          startIcon={<Download size={20} />}
          href={paper.file_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </Button>
        <Button startIcon={<FileText size={20} />}>
          Cite ({paper.citations})
        </Button>
        <Button startIcon={<MessageCircle size={20} />}>
          Discuss
        </Button>
        <Button startIcon={<Share2 size={20} />}>
          Share
        </Button>
      </CardActions>
    </Card>
  );
}