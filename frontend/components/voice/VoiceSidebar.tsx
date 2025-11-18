'use client';

import { useState } from 'react';
import { Close, Mic, VolumeUp, Language, GraphicEq } from '@mui/icons-material';
import { Box, IconButton, Typography, Select, MenuItem, FormControl, Switch, FormControlLabel, Slider, Button, Divider } from '@mui/material';

interface VoiceSidebarProps {
  onClose: () => void;
}

export function VoiceSidebar({ onClose }: VoiceSidebarProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [voiceVolume, setVoiceVolume] = useState(70);
  const [micSensitivity, setMicSensitivity] = useState(60);
  const [noiseReduction, setNoiseReduction] = useState(true);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GraphicEq />
          Voice Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Settings Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Language Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language fontSize="small" />
            Language
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <MenuItem value="auto">Auto-detect</MenuItem>
              <MenuItem value="en">🇺🇸 English</MenuItem>
              <MenuItem value="hi">🇮🇳 हिन्दी (Hindi)</MenuItem>
              <MenuItem value="sa">🕉️ संस्कृत (Sanskrit)</MenuItem>
              <MenuItem value="bn">🇮🇳 বাংলা (Bengali)</MenuItem>
              <MenuItem value="te">🇮🇳 తెలుగు (Telugu)</MenuItem>
              <MenuItem value="ta">🇮🇳 தமிழ் (Tamil)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Voice Volume */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUp fontSize="small" />
            Voice Volume: {voiceVolume}%
          </Typography>
          <Slider
            value={voiceVolume}
            onChange={(_, value) => setVoiceVolume(value as number)}
            min={10}
            max={100}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Microphone Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mic fontSize="small" />
            Microphone
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sensitivity: {micSensitivity}%
              </Typography>
              <Slider
                value={micSensitivity}
                onChange={(_, value) => setMicSensitivity(value as number)}
                min={20}
                max={100}
                size="small"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={noiseReduction}
                  onChange={(e) => setNoiseReduction(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Noise Reduction</Typography>}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Voice Test */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Voice Test
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Test your current voice settings
          </Typography>
          <Button variant="outlined" size="small" fullWidth>
            Play Sample Audio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
