# LiveKit Voice Agent Setup for DivyaVaani

This guide explains how to set up and run the LiveKit voice agent for DivyaVaani AI spiritual assistant.

## 🚀 Quick Start

### 1. Install LiveKit CLI
```bash
# Install LiveKit CLI
curl -sSL https://get.livekit.io/cli | bash

# Or using Homebrew
brew install livekit-cli

# Authenticate with your LiveKit Cloud project
lk cloud auth
```

### 2. Install Dependencies
```bash
# Install LiveKit agent dependencies
pip install livekit-agents livekit-plugins-openai livekit-plugins-cartesia livekit-plugins-silero
```

### 3. Environment Setup
The LiveKit configuration is already set up in your `.env` and `.env.local` files:

```env
# .env.local (LiveKit specific)
LIVEKIT_API_KEY=APIEweCjmYQrySz
LIVEKIT_API_SECRET=S0aHUGcmvlFBxS04m6cWPe9DgU5qTClPuGeSD5JT2SY
LIVEKIT_URL=wss://livekit.mymanah.com
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Voice Agent

#### Development Mode (recommended for testing)
```bash
# Run in development mode
python -m src.rag.voice_agent.livekit_agent dev
```

#### Console Mode (terminal-only)
```bash
# Run in console mode for local testing
python -m src.rag.voice_agent.livekit_agent console
```

#### Production Mode
```bash
# Deploy to LiveKit Cloud
lk agent create
```

## 🎯 Features

### AI Pipeline
- **Speech-to-Text**: OpenAI Whisper (high accuracy)
- **Language Model**: GPT-4o (intelligent conversation)
- **Text-to-Speech**: Cartesia Sonic-2 (natural voice)
- **Voice Activity Detection**: Silero VAD
- **Turn Detection**: Multilingual turn detection
- **Noise Cancellation**: Background noise reduction

### Spiritual Intelligence
- **DivyaVaani RAG**: Integrated Bhagavad Gita knowledge base
- **Multilingual Support**: English, Hindi, Sanskrit responses
- **Contextual Wisdom**: Personalized spiritual guidance
- **Memory**: Conversation context preservation

## 🛠️ Configuration

### Voice Settings
```python
# In livekit_agent.py
session = AgentSession(
    stt=openai.STT(model="whisper-1", api_key=settings.openai_api_key),
    llm=openai.LLM(model="gpt-4o", api_key=settings.openai_api_key),
    tts=cartesia.TTS(model="sonic-2", voice="custom_voice_id", api_key=settings.cartesia_api_key),
    vad=silero.VAD.load(),
    turn_detection=MultilingualModel(),
)
```

### Agent Personality
```python
agent = DivyaVaaniAssistant(
    instructions="You are DivyaVaani AI, a multilingual spiritual assistant inspired by the Bhagavad Gita..."
)
```

## 🌐 Connecting to Frontend

### Web Frontend Integration
```javascript
import { Room } from 'livekit-client';

// Connect to LiveKit room
const room = new Room();
await room.connect('wss://livekit.mymanah.com', token);

// The voice agent will automatically handle:
// - Real-time voice input/output
// - Spiritual Q&A using DivyaVaani RAG
// - Multilingual conversation
```

### React Component Example
```jsx
import { useRoom } from '@livekit/react-components';

function SpiritualVoiceChat() {
  const { room } = useRoom();

  return (
    <div>
      <h2>🕉️ Divine Conversation with DivyaVaani AI</h2>
      <p>Speak your spiritual questions and receive divine guidance</p>
      {/* Voice interface components */}
    </div>
  );
}
```

## 📊 Monitoring & Analytics

### LiveKit Cloud Dashboard
- View active sessions
- Monitor voice quality metrics
- Track usage analytics
- Debug conversation logs

### Agent Logs
```bash
# View agent logs
lk agent logs <agent-name>

# Monitor performance
lk agent metrics <agent-name>
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Errors
```bash
# Install missing dependencies
pip install livekit-agents[silero,turn-detector] livekit-plugins-noise-cancellation
```

#### 2. API Key Issues
```bash
# Verify API keys in .env.local
echo $LIVEKIT_API_KEY
echo $OPENAI_API_KEY
```

#### 3. Connection Issues
```bash
# Test LiveKit connection
lk room list
lk agent list
```

#### 4. Audio Issues
```bash
# Test audio devices
python -c "import sounddevice as sd; print(sd.query_devices())"
```

### Performance Optimization

#### Model Selection
- Use `gpt-4o-mini` for faster responses
- Use `sonic-2` for better voice quality
- Enable caching for repeated queries

#### Resource Management
```python
# Configure session limits
session = AgentSession(
    max_concurrent_sessions=10,
    session_timeout=300,  # 5 minutes
)
```

## 🚀 Advanced Features

### Custom Voice Training
```python
# Use custom trained voice
tts=cartesia.TTS(
    model="sonic-2",
    voice="your_custom_voice_id"
)
```

### Multi-language Support
```python
# Enhanced language detection
stt=openai.STT(
    model="whisper-1",
    language="auto"  # Auto-detect language
)
```

### Real-time Translation
```python
# Add translation capabilities
@cli.function_tool
async def translate_spiritual_text(self, text: str, target_lang: str) -> str:
    # Implement translation logic
    pass
```

## 📚 Next Steps

1. **Test Locally**: Run `python -m src.rag.voice_agent.livekit_agent console`
2. **Deploy to Cloud**: Use `lk agent create` for production deployment
3. **Frontend Integration**: Connect your web app to LiveKit rooms
4. **Custom Voices**: Train custom voices for authentic spiritual experience
5. **Analytics**: Monitor user engagement and satisfaction

## 🆘 Support

- **LiveKit Documentation**: https://docs.livekit.io
- **DivyaVaani Issues**: Check project GitHub issues
- **Community**: Join LiveKit Discord for community support

---

**🎊 Your LiveKit voice agent is ready to provide divine spiritual guidance through natural voice conversations! 🕉️🤖✨**
