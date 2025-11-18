# src/rag/voice_agent/livekit_agent.py

import os
import asyncio
import numpy as np
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

# Direct OpenAI imports to avoid LiveKit plugin issues
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    print("✅ OpenAI client available")
except ImportError:
    OPENAI_AVAILABLE = False
    print("❌ OpenAI client not available")

# Try to import LiveKit core components only (avoiding plugins)
LIVEKIT_CORE_AVAILABLE = False
try:
    from livekit.agents import Agent, JobContext, WorkerOptions, cli
    LIVEKIT_CORE_AVAILABLE = True
    print("✅ LiveKit core available")
except ImportError as e:
    LIVEKIT_CORE_AVAILABLE = False
    print(f"❌ LiveKit core not available: {e}")

# Check if we can at least import the basic LiveKit functionality
if not LIVEKIT_CORE_AVAILABLE:
    print("⚠️  LiveKit core not available. Agent will not function.")
    # Create dummy classes for import compatibility
    class Agent:
        pass
    class JobContext:
        pass
    class WorkerOptions:
        pass
    def cli():
        pass

# Import your own Divine/DivyaVaani modules
from src.config import settings
from src.embeddings import EmbeddingGenerator
from src.vectorstore import FAISSStore, BM25Store
from src.retrieval import HybridRetriever
from src.rag.multilingual_qa_system import MultilingualQASystem
from src.utils.logger import log

load_dotenv()

# Global variables for system components
qa_system = None

async def initialize_system():
    """Initialize the QA system components."""
    global qa_system

    if qa_system is not None:
        return qa_system

    try:
        log.info("Initializing QA system components for voice agent...")

        # Load dataframe
        df_path = settings.artifact_path / "verses.parquet"
        if not df_path.exists():
            raise FileNotFoundError(f"Data file not found: {df_path}")

        df = pd.read_parquet(df_path)
        log.info(f"Loaded {len(df)} verses")

        # Load embeddings
        embeddings_path = settings.artifact_path / "embeddings.npy"
        if not embeddings_path.exists():
            raise FileNotFoundError(f"Embeddings file not found: {embeddings_path}")

        embeddings = np.load(embeddings_path)
        log.info(f"Loaded embeddings with shape {embeddings.shape}")

        # Initialize components
        embedding_generator = EmbeddingGenerator(settings.embedding_model, settings.use_api_embeddings)
        embedding_generator.load_model()

        faiss_store = FAISSStore(settings.faiss_index_path)
        faiss_store.load()

        bm25_store = BM25Store(str(settings.artifact_path / "bm25.pkl"))
        bm25_store.load()

        # Create retriever
        retriever = HybridRetriever(
            faiss_store=faiss_store,
            bm25_store=bm25_store,
            embedding_generator=embedding_generator,
            dataframe=df,
            embeddings=embeddings
        )

        # Create enhanced multilingual QA system
        qa_system = MultilingualQASystem(
            retriever=retriever,
            groq_api_key=settings.groq_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            enable_caching=True,
            cache_size=settings.cache_max_size,
            enable_memory=True,
            memory_type="summary"
        )

        log.info("QA system initialized successfully for voice agent")
        return qa_system

    except Exception as e:
        log.error(f"Failed to initialize QA system for voice agent: {e}")
        raise

class DivyaVaaniAssistant(Agent):
    """DivyaVaani AI spiritual assistant using LiveKit Agents."""

    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are DivyaVaani AI, a multilingual spiritual assistant inspired by the Bhagavad Gita. "
                "You eagerly assist users with their spiritual questions by providing wisdom from Hindu scriptures. "
                "Respond with calm, devotion, and clarity. Your responses are concise and spiritually profound. "
                "You are curious, compassionate, and have deep spiritual understanding."
            )
        )

    async def query_divine_wisdom(self, query: str) -> str:
        """
        Query the DivyaVaani RAG system for spiritual wisdom from Bhagavad Gita and Hindu scriptures.
        Use this tool when users ask spiritual questions.
        """
        global qa_system

        if qa_system is None:
            await initialize_system()

        print(f"🙏 Spiritual query: {query}")
        try:
            response = qa_system.ask(query, user_id="livekit_voice_agent")
            answer = response.get("answer", "Unable to find spiritual guidance for this question.")
            return f"According to divine wisdom: {answer}"
        except Exception as e:
            log.error(f"Error in spiritual query: {e}")
            return "I apologize, but I encountered an error while seeking divine guidance. Please try again."


async def entrypoint(ctx: JobContext):
    """Main entrypoint for LiveKit voice agent."""

    print("🚀 Starting DivyaVaani LiveKit Voice Agent...")
    print("📚 Initializing Bhagavad Gita QA system...")

    # Initialize the QA system
    try:
        qa_system = await initialize_system()
        print("✅ QA system initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize QA system: {e}")
        return

    print("🎯 Agent is ready to provide spiritual guidance!")
    print("💭 The agent will respond to spiritual questions using Bhagavad Gita wisdom")

    # For now, just keep the agent running
    # In a real implementation, this would handle LiveKit room connections
    try:
        while True:
            await asyncio.sleep(60)  # Keep alive
            print("🕉️  DivyaVaani agent is active and ready for spiritual conversations...")
    except KeyboardInterrupt:
        print("🛑 Agent shutting down gracefully...")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
