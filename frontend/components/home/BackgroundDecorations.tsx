import { Box } from '@mui/material';

export function BackgroundDecorations() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.1,
      }}
    >
      {/* Subtle Sacred Symbols */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          fontSize: '4rem',
          color: 'primary.main',
          animation: 'gentleFloat 8s ease-in-out infinite',
          '@keyframes gentleFloat': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-10px) rotate(5deg)' },
          },
        }}
      >
        ॐ
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '12%',
          fontSize: '2.5rem',
          color: 'secondary.main',
          animation: 'gentleFloat 10s ease-in-out infinite reverse',
        }}
      >
        🪷
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          fontSize: '3.5rem',
          color: 'warning.main',
          animation: 'gentleFloat 12s ease-in-out infinite',
        }}
      >
        ❖
      </Box>

      {/* Minimal Sacred Geometry */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '25%',
          width: 8,
          height: 8,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          animation: 'slowPulse 6s ease-in-out infinite',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '35%',
          right: '30%',
          width: 6,
          height: 6,
          bgcolor: 'secondary.main',
          borderRadius: '50%',
          animation: 'slowPulse 8s ease-in-out infinite reverse',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '40%',
          width: 4,
          height: 4,
          bgcolor: 'warning.main',
          borderRadius: '50%',
          animation: 'slowPulse 10s ease-in-out infinite',
        }}
      />
    </Box>
  );
}
