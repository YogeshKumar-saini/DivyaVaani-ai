'use client';

import { useEffect, useState } from 'react';
import { Language, VolumeUp } from '@mui/icons-material';
import { voiceService } from '@/lib/api/voice-service';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress, useTheme, Paper } from '@mui/material';

interface STTLanguages {
  supported_languages: string[];
  supported_formats: string[];
}

interface TTSVoices {
  voices: Record<string, string[]>;
  supported_languages: string[];
  supported_formats: string[];
}

export function VoiceSettings() {
  const [sttLanguages, setSttLanguages] = useState<STTLanguages | null>(null);
  const [ttsVoices, setTtsVoices] = useState<TTSVoices | null>(null);
  const [selectedInputLanguage, setSelectedInputLanguage] = useState('auto');
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadVoiceSettings();
  }, []);

  const loadVoiceSettings = async () => {
    try {
      const [sttData, ttsData] = await Promise.all([
        voiceService.getSupportedSTTLanguages(),
        voiceService.getAvailableTTSVoices()
      ]);
      setSttLanguages(sttData);
      setTtsVoices(ttsData);
    } catch (err) {
      console.error('Voice settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'hi': 'हिंदी',
      'sa': 'संस्कृत',
      'bn': 'বাংলা',
      'te': 'తెలుగు',
      'ta': 'தமிழ்',
      'auto': 'Auto-detect'
    };
    return languageMap[code] || code;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="body2" color="text.secondary">
            Loading voice settings...
          </Typography>
        </Box>
        {[1, 2, 3].map((i) => (
          <Paper key={i} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.04)' }}>
            <Box sx={{ height: 56, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 1 }} />
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Input Language */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Language sx={{ fontSize: 20, color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Speech Recognition
          </Typography>
        </Box>
        <FormControl fullWidth>
          <InputLabel>Input Language</InputLabel>
          <Select
            value={selectedInputLanguage}
            onChange={(e) => setSelectedInputLanguage(e.target.value)}
            label="Input Language"
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <MenuItem value="auto">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                🧠 Auto-detect
              </Box>
            </MenuItem>
            {sttLanguages?.supported_languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {getLanguageName(lang)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Language for understanding your voice
        </Typography>
      </Box>

      {/* Output Language */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VolumeUp sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Voice Synthesis
          </Typography>
        </Box>
        <FormControl fullWidth>
          <InputLabel>Output Language</InputLabel>
          <Select
            value={selectedOutputLanguage}
            onChange={(e) => {
              setSelectedOutputLanguage(e.target.value);
              setSelectedVoice('default');
            }}
            label="Output Language"
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          >
            {ttsVoices?.supported_languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {getLanguageName(lang)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Language for AI voice responses
        </Typography>
      </Box>

      {/* Voice */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          AI Voice Character
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Voice</InputLabel>
          <Select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            label="Voice"
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <MenuItem value="default">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                🕉️ Divine Wisdom (Recommended)
              </Box>
            </MenuItem>
            {ttsVoices?.voices[selectedOutputLanguage]?.map((voice) => (
              <MenuItem key={voice} value={voice}>
                {voice.charAt(0).toUpperCase() + voice.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Choose your spiritual guide&apos;s voice
        </Typography>
      </Box>
    </Box>
  );
}
