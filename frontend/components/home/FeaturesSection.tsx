import { useRouter } from 'next/navigation';
import { Globe, Mic, BookOpen, Zap, LucideIcon } from 'lucide-react';
import { FEATURES, ROUTES } from '@/lib/utils/constants';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Mic,
  BookOpen,
  Zap,
};

export function FeaturesSection() {
  const theme = useTheme();
  const router = useRouter();

  const handleExplore = () => {
    router.push(ROUTES.CHAT);
  };

  return (
    <Box
      id="features"
      sx={{
        py: 8,
        px: 4,
        position: 'relative',
        // background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}05 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Title Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful Features
          </Typography>

          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Experience spiritual wisdom through cutting-edge AI technology and divine guidance
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.warning.main})`,
                borderRadius: 1,
                opacity: 0.6,
              }}
            />
          </Box>
        </Box>

        {/* Features Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: '1fr 1fr 1fr 1fr'
            },
            gap: 3,
            mb: 6,
          }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap] || Globe;

            return (
              <Paper
                key={feature.id}
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,255,255,0.8) 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {/* Icon */}
                <IconButton
                  sx={{
                    mb: 2,
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.warning.main})`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.warning.dark})`,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <Icon fontSize="medium" />
                </IconButton>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.text.primary,
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                    flexGrow: 1,
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            );
          })}
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Paper
            sx={{
              display: 'inline-block',
              px: 4,
              py: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,255,255,0.9) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[4],
            }}
          >
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: theme.palette.text.secondary,
                maxWidth: 500,
                mx: 'auto',
                fontWeight: 500,
              }}
            >
              Experience the ancient wisdom that has guided millions through the ages
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleExplore}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.warning.main})`,
                color: 'white',
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.warning.dark})`,
                  boxShadow: theme.shadows[8],
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Explore Spiritual Wisdom
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
