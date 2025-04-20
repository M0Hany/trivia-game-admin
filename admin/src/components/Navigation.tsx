import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  QuestionAnswer as QuestionIcon,
  Collections as CollectionsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  LibraryBooks as LibraryBooksIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { getAuth, signOut } from 'firebase/auth';

interface NavigationProps {
  open: boolean;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleNavigation = (path: string) => {
    navigate(path);
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Question Packs', icon: <LibraryBooksIcon />, path: '/admin/packs' },
    { text: 'Questions', icon: <QuestionIcon />, path: '/admin/questions' },
    { text: 'Avatar Sets', icon: <CollectionsIcon />, path: '/admin/avatar-sets' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/admin/help' },
  ];

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
          Trivia Admin
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              onClick={handleMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.text} 
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1 }}>{item.icon}</Box>
                    {item.text}
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}><LogoutIcon /></Box>
                  Logout
                </Box>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  mx: 1,
                  borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  borderRadius: 0
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
          {!isMobile && (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ ml: 1 }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 