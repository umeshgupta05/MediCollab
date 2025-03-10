import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Stethoscope, 
  Users, 
  Brain, 
  Microscope, 
  Laptop2, 
  GraduationCap,
  User,
  BookOpen,
  Home
} from 'lucide-react';
import { Button, Divider, Tooltip } from '@mui/material';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, fetchSettings, error } = useSettingsStore();
  const { user } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, fetchSettings]);

  const mainLinks = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'My Profile', icon: User, path: '/profile' },
    { name: 'Blogs', icon: BookOpen, path: '/blogs' },
    { name: 'Discussions', icon: MessageSquare, path: '/discussions' },
    { name: 'Research', icon: FileText, path: '/research' },
  ];

  const categories = [
    { name: 'Neurology', icon: Brain },
    { name: 'Cardiology', icon: Stethoscope },
    { name: 'Oncology', icon: Microscope },
    { name: 'Pediatrics', icon: Users },
    { name: 'Surgery', icon: FileText },
    { name: 'Research', icon: Microscope },
    { name: 'Technology', icon: Laptop2 },
    { name: 'Education', icon: GraduationCap },
  ];

  const customQuickLinks = settings?.quick_links as Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
  }> || [];

  return (
    <div className="w-64 bg-white min-h-[calc(100vh-64px)] p-4 border-r sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-500 uppercase text-xs tracking-wider">Main</h3>
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                    isActive(link.path) ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-500 uppercase text-xs tracking-wider">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className={`flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                    isActive(`/category/${category.name.toLowerCase()}`) ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Custom Quick Links */}
        {customQuickLinks.length > 0 && (
          <>
            <Divider />
            <div>
              <h3 className="font-semibold mb-3 text-gray-500 uppercase text-xs tracking-wider">Quick Links</h3>
              <div className="space-y-1">
                {customQuickLinks.map((link) => (
                  <Tooltip key={link.id} title={link.url} placement="right">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      <span className="truncate">{link.title}</span>
                    </a>
                  </Tooltip>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Create Content Button */}
        <div className="pt-4">
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={() => navigate('/dashboard')}
            className="normal-case"
          >
            Create Content
          </Button>
        </div>
      </div>
    </div>
  );
}