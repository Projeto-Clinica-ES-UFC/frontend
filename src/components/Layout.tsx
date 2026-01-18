import { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ColorModeContext } from '../contexts/ThemeContext';
import { useNotifications, type INotification } from '../contexts/NotificationContext';

// Importações do Material-UI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
// AttachMoneyIcon e AssessmentIcon foram removidos

import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidthOpen = 240;
const drawerWidthClosed = 60;

// Lista de navegação atualizada (Sem Financeiro e Relatórios)
const navItems = [
  { text: 'Início', icon: <HomeIcon />, path: '/' },
  { text: 'Agendamentos', icon: <CalendarTodayIcon />, path: '/agendamentos' },
  { text: 'Pacientes', icon: <PeopleIcon />, path: '/pacientes' },
  { text: 'Profissionais', icon: <EngineeringIcon />, path: '/profissionais' },
];

export const Layout = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { notificacoes, unreadCount, markAllAsRead, clearAll, markAsRead } = useNotifications();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleDesktopDrawerToggle = () => setIsDrawerOpen(!isDrawerOpen);
  const handleMobileDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => setNotificationAnchorEl(event.currentTarget);
  const handleCloseNotificationMenu = () => setNotificationAnchorEl(null);
  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);

  const handleOpenNotificationModal = (notification: INotification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
    handleCloseNotificationMenu();
  };
  const handleCloseNotificationModal = () => setIsNotificationModalOpen(false);

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isDrawerOpen && (
          <>
            <img src="/logo_ame.jpeg" alt="Logo Clínica AME" style={{ height: 40, marginRight: 8, transition: 'opacity 0.2s' }} />
            <Typography variant="h6" noWrap>Clínica AME</Typography>
          </>
        )}
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={!isDrawerOpen ? item.text : ''} placement="right">
              <ListItemButton component={NavLink} to={item.path} sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5, '&.active': { backgroundColor: 'primary.light', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}>
                <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: isDrawerOpen ? 1 : 0 }} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={!isDrawerOpen ? "Configuração" : ''} placement="right">
            <ListItemButton component={NavLink} to="/configuracoes" sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Configuração" sx={{ opacity: isDrawerOpen ? 1 : 0 }} />
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={!isDrawerOpen ? "Sair" : ''} placement="right">
            <ListItemButton onClick={logout} sx={{ minHeight: 48, justifyContent: isDrawerOpen ? 'initial' : 'center', px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: isDrawerOpen ? 3 : 'auto', justifyContent: 'center' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" sx={{ opacity: isDrawerOpen ? 1 : 0 }} />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        className="no-print"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          width: { sm: `calc(100% - ${isDrawerOpen ? drawerWidthOpen : drawerWidthClosed}px)` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDesktopDrawerToggle}
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={theme.palette.mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificações">
            <IconButton color="inherit" onClick={handleOpenNotificationMenu}>
              <Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Menu do Utilizador">
            <IconButton sx={{ p: 0, ml: 2 }} onClick={handleOpenProfileMenu}>
              <Avatar alt={user?.name} src={user?.photoURL}>{user?.name?.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleCloseNotificationMenu}
        PaperProps={{ style: { width: 360, maxHeight: 400 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Notificações</Typography>
          <Typography variant="caption">{unreadCount} novas</Typography>
        </Box>
        <Divider />

        {notificacoes.length > 0 ? (
          notificacoes.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleOpenNotificationModal(notification)}
              sx={{ fontWeight: notification.read ? 'normal' : 'bold', whiteSpace: 'normal' }}
            >
              {notification.text}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ justifyContent: 'center' }}>Nenhuma notificação</MenuItem>
        )}

        {notificacoes.length > 0 && (
          <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
              <Button size="small" onClick={markAllAsRead}>Marcar todas como lidas</Button>
              <Button size="small" color="error" onClick={clearAll}>Limpar todas</Button>
            </Box>
          </Box>
        )}
      </Menu>

      <Menu anchorEl={profileAnchorEl} open={Boolean(profileAnchorEl)} onClose={handleCloseProfileMenu}>
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </Box>
        <MenuItem onClick={() => { handleCloseProfileMenu(); navigate('/meu-perfil'); }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleCloseProfileMenu(); logout(); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon> Sair
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className="no-print"
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidthOpen },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        className="no-print"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: isDrawerOpen ? drawerWidthOpen : drawerWidthClosed,
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          marginLeft: { sm: `${isDrawerOpen ? drawerWidthOpen : drawerWidthClosed}px` },
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>

      <Dialog open={isNotificationModalOpen} onClose={handleCloseNotificationModal}>
        <DialogTitle>Detalhes da Notificação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedNotification?.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotificationModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};