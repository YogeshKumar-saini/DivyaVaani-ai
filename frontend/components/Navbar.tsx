'use client';

import { useState, useEffect } from "react";
import { Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Avatar } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";
import { HealthIndicator } from "@/components/shared/HealthIndicator";

const navLinks = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.CHAT, label: 'Chat' },
  { href: ROUTES.VOICE, label: 'Voice' },
  { href: ROUTES.ANALYTICS, label: 'Analytics' },
  { href: ROUTES.ABOUT, label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.2);
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 600);
      setIsDesktopView(width >= 900);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDrawerToggle = () => setMobileMenuOpen((prev) => !prev);

  return (
    <>
      {/* GLASSY NAVBAR - NO BOX COMPONENT */}
      <nav
        style={{
          position: 'sticky',
          top: 1,
          
          zIndex: 1200,
          height: isScrolled ? 64 : 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'all 0.35s ease',

          // GLASS EFFECT - CUSTOM NOT MUI
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(22px) saturate(150%)',
          WebkitBackdropFilter: 'blur(22px) saturate(150%)',
          borderRadius: '0 0 16px 16px',
          border: '1px solid rgba(255,255,255,0.3)',

          // SMOOTH SHADOW
          boxShadow: isScrolled
            ? '0 8px 24px rgba(0,0,0,0.15)'
            : '0 3px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* LOGO */}
        <Link href={ROUTES.HOME} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 42,
                height: 42,
                mr: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                ॐ
              </Typography>
            </Avatar>
            <div style={{ display: isMobileView ? 'none' : 'block' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                DivyaVaani AI
              </Typography>
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div style={{
          display: isDesktopView ? 'flex' : 'none',
          gap: 8
        }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                variant={isActive ? 'contained' : 'text'}
                color={isActive ? 'primary' : 'inherit'}
                size="small"
                sx={{
                  borderRadius: 3,
                  textTransform: 'capitalize',
                  transition: 'all 0.25s ease',
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  boxShadow: isActive
                    ? '0 3px 12px rgba(0,0,0,0.2)'
                    : 'none',
                  '&:hover': {
                    backgroundColor: isActive
                      ? 'primary.dark'
                      : 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <HealthIndicator variant="badge" showText={false} />
          <IconButton sx={{ display: { md: 'none' } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleDrawerToggle}
        sx={{ '& .MuiDrawer-paper': { width: 260 } }}
      >
        <List>
          {navLinks.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton component={Link} href={link.href}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
