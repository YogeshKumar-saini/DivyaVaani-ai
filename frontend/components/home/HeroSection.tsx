'use client';

import { useRouter } from 'next/navigation';
import { ROUTES, APP_TITLE, APP_TAGLINE } from '@/lib/utils/constants';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Mic as MicIcon,
  MenuBook as BookIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as SparklesIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

export function HeroSection() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleStartChat = () => {
    router.push(ROUTES.CHAT);
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: LanguageIcon, text: '12+ Languages', color: theme.palette.secondary.main },
    { icon: MicIcon, text: 'Voice AI', color: theme.palette.success.main },
    { icon: BookIcon, text: 'Universal Wisdom', color: theme.palette.primary.main },
    { icon: BoltIcon, text: 'Instant Response', color: theme.palette.warning.main },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}10 0%, transparent 50%)`,
          zIndex: -1,
        },
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          filter: 'brightness(0.4) contrast(0.8)',
        }}
        src="/background.mp4"
      />


      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>

        {/* Title */}
        <Typography
          variant={isMobile ? "h3" : "h1"}
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {APP_TITLE}
        </Typography>

        {/* Tagline */}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontWeight: 500,
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          {APP_TAGLINE}
        </Typography>

        {/* Description */}
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 6,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Experience divine wisdom from all spiritual traditions through advanced AI.
          Ask questions in multiple languages and receive personalized spiritual guidance from universal teachings.
        </Typography>

        {/* CTA Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            mb: 8,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleStartChat}
            startIcon={<SparklesIcon />}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Your Spiritual Journey
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleLearnMore}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                bgcolor: theme.palette.primary.main,
                color: 'white',
              },
            }}
          >
            Learn More
          </Button>
        </Box>

        {/* Features Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, maxWidth: 800, mx: 'auto' }}>
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={idx}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 48,
                    color: feature.color,
                    mb: 2,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {feature.text}
                </Typography>
              </Card>
            );
          })}
        </Box>
      </Container>

      {/* Scroll Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite',
          cursor: 'pointer',
        }}
        onClick={handleLearnMore}
      >
        <Box
          sx={{
            width: 24,
            height: 40,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pt: 1,
          }}
        >
          <KeyboardArrowDownIcon
            sx={{
              color: theme.palette.primary.main,
              animation: 'pulse 2s infinite',
            }}
          />
        </Box>
      </Box>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-10px) translateX(-50%); }
          60% { transform: translateY(-5px) translateX(-50%); }
        }
      `}</style>
    </Box>
  );
}
