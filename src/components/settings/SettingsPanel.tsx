import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { useSettingsStore } from '../../store/settingsStore';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, error } = useSettingsStore();

  const handleSave = async () => {
    if (settings) {
      await updateSettings(settings);
    }
    onClose();
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <div className="space-y-6">
          {/* Appearance */}
          <section>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.theme}
                label="Theme"
                onChange={(e) => updateSettings({ theme: e.target.value })}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </section>

          <Divider />

          {/* Notifications */}
          <section>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <div className="space-y-3">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_notifications}
                    onChange={(e) =>
                      updateSettings({ email_notifications: e.target.checked })
                    }
                  />
                }
                label="Email Notifications"
              />
              <div className="pl-4 space-y-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notification_preferences?.mentions ?? true}
                      onChange={(e) =>
                        updateSettings({
                          notification_preferences: {
                            ...settings.notification_preferences,
                            mentions: e.target.checked,
                          },
                        })
                      }
                      disabled={!settings.email_notifications}
                    />
                  }
                  label="Mentions and Replies"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notification_preferences?.research_updates ?? true}
                      onChange={(e) =>
                        updateSettings({
                          notification_preferences: {
                            ...settings.notification_preferences,
                            research_updates: e.target.checked,
                          },
                        })
                      }
                      disabled={!settings.email_notifications}
                    />
                  }
                  label="Research Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notification_preferences?.collaboration_requests ?? true}
                      onChange={(e) =>
                        updateSettings({
                          notification_preferences: {
                            ...settings.notification_preferences,
                            collaboration_requests: e.target.checked,
                          },
                        })
                      }
                      disabled={!settings.email_notifications}
                    />
                  }
                  label="Collaboration Requests"
                />
              </div>
            </div>
          </section>

          <Divider />

          {/* Privacy */}
          <section>
            <Typography variant="h6" gutterBottom>
              Privacy
            </Typography>
            <div className="space-y-3">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy?.profile_visible ?? true}
                    onChange={(e) =>
                      updateSettings({
                        privacy: {
                          ...settings.privacy,
                          profile_visible: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Public Profile Visibility"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy?.show_online_status ?? true}
                    onChange={(e) =>
                      updateSettings({
                        privacy: {
                          ...settings.privacy,
                          show_online_status: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Show Online Status"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy?.allow_research_contact ?? true}
                    onChange={(e) =>
                      updateSettings({
                        privacy: {
                          ...settings.privacy,
                          allow_research_contact: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Allow Research Collaboration Requests"
              />
            </div>
          </section>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}