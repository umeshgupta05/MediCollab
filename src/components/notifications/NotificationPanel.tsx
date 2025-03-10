import React from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Badge,
  Divider,
} from '@mui/material';
import { Check, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function NotificationPanel({ anchorEl, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 360, maxHeight: 480 },
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="h6">Notifications</Typography>
          <Button
            size="small"
            onClick={() => markAllAsRead()}
            startIcon={<Check size={16} />}
          >
            Mark all as read
          </Button>
        </div>
        <Divider />
        <List className="divide-y">
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                className={`${!notification.read ? 'bg-blue-50' : ''}`}
                secondaryAction={
                  <div className="flex gap-1">
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check size={16} />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                }
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" display="block">
                        {notification.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </div>
    </Popover>
  );
}