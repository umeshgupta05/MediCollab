import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  IconButton, 
  Button, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip
} from '@mui/material';
import { Search, Bell, Settings, LogOut, User, BookOpen, MessageCircle, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';
import NotificationPanel from './notifications/NotificationPanel';
import SettingsPanel from './settings/SettingsPanel';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { settings, fetchSettings } = useSettingsStore();
  
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchSettings();
    }
  }, [user, fetchNotifications, fetchSettings]);

  // Apply theme from settings
  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.classList.remove('light', 'dark');
      if (settings.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(settings.theme);
      }
    }
  }, [settings?.theme]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const navigateToProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  return (
    <nav className="bg-[#1976d2] text-white py-2 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center">
          <BookOpen className="mr-2" />
          MediCollab
        </Link>

        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search medical content..."
              className="w-full px-4 py-2 pl-10 rounded-lg text-gray-900 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Bell className="w-5 h-5" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </IconButton>
          </Tooltip>
          
          {user && (
            <Tooltip title="Profile">
              <IconButton 
                onClick={handleProfileMenuOpen}
                className="ml-2"
              >
                <Avatar 
                  sx={{ width: 32, height: 32 }}
                  className="bg-blue-700"
                >
                  {user.email?.[0].toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      <NotificationPanel
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
      />
      
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={navigateToProfile}>
          <ListItemIcon>
            <User size={18} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          navigate('/dashboard');
          handleProfileMenuClose();
        }}>
          <ListItemIcon>
            <MessageCircle size={18} />
          </ListItemIcon>
          <ListItemText>My Posts</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          navigate('/dashboard');
          handleProfileMenuClose();
        }}>
          <ListItemIcon>
            <FileText size={18} />
          </ListItemIcon>
          <ListItemText>My Research</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </nav>
  );
}