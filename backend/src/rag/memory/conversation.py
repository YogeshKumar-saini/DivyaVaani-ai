"""Conversation memory implementation using LangChain."""

from typing import Optional, List, Dict, Any
from langchain_classic.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage

from .base import BaseMemory, MemoryConfig


class ConversationMemory(BaseMemory):
    """LangChain-based conversation memory."""

    def __init__(self, config: MemoryConfig, groq_api_key: str, memory_type: str = "buffer"):
        self.config = config
        self.memory_type = memory_type
        self.groq_api_key = groq_api_key
        self._initialize_memory()

    def _initialize_memory(self):
        """Initialize the appropriate memory type."""
        if self.memory_type == "summary":
            try:
                llm = ChatGroq(
                    model_name="llama-3.1-8b-instant",
                    temperature=0.1,
                    groq_api_key=self.groq_api_key
                )
                self.memory = ConversationSummaryBufferMemory(
                    llm=llm,
                    max_token_limit=self.config.max_token_limit,
                    memory_key=self.config.memory_key,
                    return_messages=self.config.return_messages
                )
            except Exception as e:
                # Fallback to buffer memory
                self.memory = ConversationBufferMemory(
                    memory_key=self.config.memory_key,
                    return_messages=self.config.return_messages
                )
        else:
            self.memory = ConversationBufferMemory(
                memory_key=self.config.memory_key,
                return_messages=self.config.return_messages
            )

    def save_context(self, question: str, answer: str) -> None:
        """Save conversation context."""
        try:
            self.memory.save_context(
                {"input": question},
                {"output": answer}
            )
        except Exception as e:
            # Memory save failed, but don't break the flow
            pass

    def get_context(self) -> Optional[str]:
        """Get conversation context for prompt inclusion."""
        try:
            if hasattr(self.memory, 'load_memory_variables'):
                memory_vars = self.memory.load_memory_variables({})
                if memory_vars.get(self.config.memory_key):
                    recent_history = memory_vars[self.config.memory_key][-6:]  # Last 3 Q&A pairs
                    context_parts = []
                    for msg in recent_history:
                        if hasattr(msg, 'content'):
                            content = msg.content
                        else:
                            content = str(msg)

                        if isinstance(msg, HumanMessage):
                            context_parts.append(f"Previous Q: {content}")
                        elif isinstance(msg, AIMessage):
                            context_parts.append(f"Previous A: {content}")

                    if context_parts:
                        return "\n\nRECENT CONVERSATION CONTEXT:\n" + "\n".join(context_parts)

            return None
        except Exception as e:
            return None

    def clear(self) -> None:
        """Clear all memory."""
        try:
            if hasattr(self.memory, 'clear'):
                self.memory.clear()
            else:
                # Reinitialize memory
                self._initialize_memory()
        except Exception as e:
            pass

    def get_memory_type(self) -> str:
        """Get memory type identifier."""
        return f"conversation_{self.memory_type}"
