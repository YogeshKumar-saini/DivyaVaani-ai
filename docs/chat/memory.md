# Chat System: Memory (LTM & STM)

DivyaVaani AI implements a sophisticated memory system that combines **Short-Term Memory (STM)** and **Long-Term Memory (LTM)** to provide deeply contextual spiritual guidance.

## 1. Short-Term Memory (STM)

STM handles the immediate "flow" of a conversation. It ensures the AI understands follow-up questions like *"Can you explain that in more detail?"*.

- **Implementation**: The system captures the last **N messages** (usually 5-10) from the current active conversation.
- **Workflow**: 
  1. The frontend or backend retrieves the recent message history.
  2. These messages are serialized and prepended to the current query context.
  3. The LLM receives a prompt that includes: `[Recent Conversation History] + [Retrieved Scripture Context] + [User Question]`.

## 2. Long-Term Memory (LTM)

LTM allows the system to recall overarching themes and past insights from older sessions or the beginning of a long conversation.

- **Conversation Summaries**: Every conversation eventually undergoes summarization (either triggered manually or automatically).
- **Daily Insights**: The system aggregates all conversations from a specific date into a **Daily Summary**, capturing dominant moods, topics, and spiritual progress.
- **Retrieval**: When a session is resumed, the system hits `GET /conversations/{id}/context`, which returns the conversation's high-level summary. This summary is then injected into the LLM's system instructions to provide context.

## 3. The Memory Logic

When a user asks a question, the backend orchestration follows this sequence to build the memory-augmented prompt:

1. **Check for History**: If `conversation_history` is provided in the request, it is used as primary context.
2. **Retrieve Context**: If no history is provided, but a `conversation_id` exists, the system fetches the summary (LTM) and recent messages (STM).
3. **Augment Prompt**: 
   - Current scriptures retrieved from Pinecone are added.
   - The memory block is prepended.
4. **Processing**: The LLM is invoked with the final augmented prompt.
   - **Important**: If RAG retrieves 0 scriptures but memory exists, the system *still* processes the query using the LLM to allow for purely conversational follow-ups.

## Memory Endpoints

- `GET /conversations/{id}/context`: Returns the STM (recent messages) and LTM (summary) for a specific conversation.
- `GET /conversations/users/{user_id}/daily-summaries`: Retrieves aggregated summaries for analytics and spiritual reflection.
