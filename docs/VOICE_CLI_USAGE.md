# DivyaVaani Voice Agent CLI - Usage Guide

## Overview

The enhanced Voice Agent CLI now supports natural conversation! You can type your questions naturally without memorizing specific commands.

## Getting Started

### Running the CLI

```bash
python src/rag/voice_agent/simple_voice_agent.py
```

### First Time Setup

Make sure you have run the pipeline to generate the required artifacts:

```bash
python -m src.pipeline.build_pipeline
```

## Features

### 1. Natural Conversation

Just type your question naturally - no commands needed!

```
You > What is the meaning of dharma?

⏳ Processing your question...

🤖 Krishna:
Dharma represents your sacred duty and righteous path in life...

📚 Sources: Bhagavad Gita 2.31, 3.35, 18.47
⚡ 🟢 Confidence: 0.89 | Time: 1.2s

You > How can I find inner peace?

⏳ Processing your question...

🤖 Krishna:
Inner peace comes from understanding your true nature...
```

### 2. Commands

Use commands for system functions:

#### Help Command
```
You > /help

🎤 DivyaVaani Voice Agent - Help
================================

💬 Natural Conversation:
   Just type your question naturally! No commands needed.
   ...
```

#### History Command
```
You > /history

📜 Conversation History (Last 10 exchanges)
============================================================

1. [14:23:15] 🟢
   You: What is dharma?
   Krishna: Dharma is your sacred duty...

2. [14:25:42] 🟢
   You: How do I find peace?
   Krishna: Peace comes from within...
```

You can also specify a limit:
```
You > /history 5
```

#### Language Command

Get current language:
```
You > /lang

🌍 Current language: English (en)
```

Change language:
```
You > /lang hi

✅ Language changed from English to Hindi
```

Supported languages:
- `en` - English
- `hi` - Hindi
- `sa` - Sanskrit
- `bn` - Bengali
- `te` - Telugu
- `ta` - Tamil
- `mr` - Marathi
- `gu` - Gujarati
- `kn` - Kannada
- `ml` - Malayalam
- `pa` - Punjabi
- `or` - Odia

#### Clear Command
```
You > /clear

✅ Cleared 5 conversation exchanges.
```

#### Quit Command
```
You > /quit

🙏 Namaste! Thank you for seeking wisdom.

📊 Session Summary:
   Questions asked: 12
   Average confidence: 0.87
   Languages used: en, hi

May the teachings of the Bhagavad Gita guide you. Goodbye! 🙏
```

### 3. Legacy Commands

For backward compatibility, these commands still work:

```
You > speak Hello, this is a test

🗣️ Text-to-speech (mock): 'Hello, this is a test'
🔊 Audio would be played here...
```

```
You > listen

🎧 Voice input (mock): Listening...
💡 Tip: In mock mode, voice input is simulated.
```

```
You > quit

🙏 Namaste! Goodbye!
```

## Tips & Tricks

### 1. Follow-up Questions

The CLI maintains conversation context, so you can ask follow-up questions:

```
You > What is karma?
🤖 Krishna: Karma is the law of cause and effect...

You > How does it relate to dharma?
🤖 Krishna: Karma and dharma are interconnected...
```

### 2. Multi-language Support

Switch languages anytime during your conversation:

```
You > What is dharma?
🤖 Krishna: Dharma is your sacred duty...

You > /lang hi

You > कर्म क्या है?
🤖 Krishna: कर्म कारण और प्रभाव का नियम है...
```

### 3. Review Your Learning

Use `/history` to review what you've learned:

```
You > /history

📜 Conversation History...
```

### 4. Processing Indicators

The CLI shows you when it's working:

```
You > What is the purpose of life?

⏳ Processing your question...
⏳ Processing your question (still working...)

🤖 Krishna: ...
```

## Troubleshooting

### QA System Not Initialized

If you see this error:
```
❌ Missing required artifact files:
  - artifacts/verses.parquet
  - artifacts/embeddings.npy
  ...

💡 Please run the pipeline to generate artifacts first.
```

**Solution**: Run the pipeline:
```bash
python -m src.pipeline.build_pipeline
```

### Command Not Recognized

If you type a command and it's treated as a query:
```
You > help

🤖 Krishna: [Tries to answer about "help"]
```

**Solution**: Use the `/` prefix for commands:
```
You > /help
```

### Empty Response

If you get an empty or error response:
```
❌ Error processing query: ...
💡 Please try rephrasing your question or type /help for assistance.
```

**Solution**: 
- Try rephrasing your question
- Check your internet connection (for API calls)
- Use `/help` to see available commands

## Examples

### Example Session 1: Learning About Dharma

```
You > What is dharma?
🤖 Krishna: Dharma represents your sacred duty...

You > Can you give me an example?
🤖 Krishna: For a warrior like Arjuna, dharma means...

You > /history
📜 Conversation History (Last 2 exchanges)...

You > /quit
🙏 Namaste! Goodbye!
```

### Example Session 2: Multi-language Exploration

```
You > What is karma?
🤖 Krishna: Karma is the law of cause and effect...

You > /lang hi
✅ Language changed to Hindi

You > कर्म और धर्म में क्या संबंध है?
🤖 Krishna: कर्म और धर्म परस्पर जुड़े हुए हैं...

You > /lang en
✅ Language changed to English

You > Thank you
🤖 Krishna: You're welcome...
```

## Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `/help` | Show help information | `/help` |
| `/history [limit]` | Show conversation history | `/history 10` |
| `/lang [code]` | Get/set language | `/lang hi` |
| `/clear` | Clear conversation history | `/clear` |
| `/quit` | Exit the application | `/quit` |
| `speak <text>` | Text-to-speech (mock) | `speak hello` |
| `listen` | Voice input (mock) | `listen` |
| `quit` | Exit (alternative) | `quit` |

## Advanced Features

### Conversation Context

The CLI automatically maintains context from your last 3 exchanges, allowing for more natural follow-up questions.

### Confidence Indicators

Responses show confidence levels:
- 🟢 High confidence (> 0.7)
- 🟡 Medium confidence (0.5 - 0.7)
- 🔴 Low confidence (< 0.5)

### Session Statistics

When you quit, you'll see statistics about your session:
- Total questions asked
- Average confidence score
- Languages used
- Average processing time

## Development Mode

The CLI currently runs in development mode with mock voice processing. The text-to-text conversation works fully with the RAG system.

To enable real voice processing, configure the appropriate STT/TTS providers in your `.env` file.

## Support

For issues or questions:
1. Check this documentation
2. Use `/help` in the CLI
3. Review the conversation history with `/history`
4. Check the logs for detailed error messages

---

**Namaste! 🙏 May the wisdom of the Bhagavad Gita guide your journey.**
