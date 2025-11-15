'use client';

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";
import { HealthIndicator } from "@/components/shared/HealthIndicator";

interface HeaderProps {
  isOnline: boolean;
}

const navLinks = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.CHAT, label: 'Chat' },
  { href: ROUTES.VOICE, label: 'Voice' },
  { href: ROUTES.ANALYTICS, label: 'Analytics' },
  { href: ROUTES.ABOUT, label: 'About' },
];

export function Header({ isOnline }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === ROUTES.HOME;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component={Link}
                href={link.href}
                selected={isActive}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box component={Link} href={ROUTES.HOME} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                mr: 2,
                position: 'relative',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                ॐ
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 12,
                  height: 12,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }}
              />
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Bhagavad Gita AI
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Divine Spiritual Intelligence
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isHomePage && !isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    variant={isActive ? "contained" : "text"}
                    color={isActive ? "primary" : "inherit"}
                    size="small"
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Health Status Indicator */}
            <HealthIndicator variant="badge" showText={false} />

            {/* Mobile Menu Button */}
            {!isHomePage && isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
