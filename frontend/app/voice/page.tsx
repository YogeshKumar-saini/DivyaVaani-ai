'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/voice/VoiceChat';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { HealthIndicator } from '@/components/shared/HealthIndicator';
import { Mic, Menu } from 'lucide-react';
import { Button, Box, Container, Paper, Typography, useTheme, Dialog, Slide, useMediaQuery } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function VoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mic style={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Voice Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI Voice Conversations
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HealthIndicator variant="badge" showText={false} />
              <Button
                variant="contained"
                startIcon={<Menu />}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Settings
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{
            display: { xs: 'block', md: 'flex' },
            minHeight: 500,
            position: 'relative'
          }}>
            {/* Voice Chat */}
            <Box sx={{
              flex: 1,
              p: 3,
              width: '100%'
            }}>
              <VoiceChat />
            </Box>

            {/* Desktop Sidebar - Split Layout */}
            {!isMobile && sidebarOpen && (
              <Box sx={{
                width: 320,
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0
              }}>
                <VoiceSidebar onClose={() => setSidebarOpen(false)} />
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Mobile Sidebar - Modal Overlay */}
      <Dialog
        fullScreen={isMobile}
        open={sidebarOpen && isMobile}
        onClose={() => setSidebarOpen(false)}
        TransitionComponent={Transition}
        sx={{
          display: { xs: 'block', md: 'none' }
        }}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '70vh',
            margin: 0,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <VoiceSidebar onClose={() => setSidebarOpen(false)} />
      </Dialog>
    </Box>
  );
}
