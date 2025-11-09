"""Question-answering system using RAG."""

import os
from typing import Dict, Any, List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain.memory import ConversationBufferMemory
from src.retrieval import HybridRetriever
from src.utils.logger import log


class QASystem:
    """Question-answering system with RAG."""
    
    def __init__(
        self,
        retriever: HybridRetriever,
        groq_api_key: str,
        temperature: float = 0.3,
        max_tokens: int = 1000
    ):
        self.retriever = retriever
        self.groq_api_key = groq_api_key
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=False
        )

        # Set API key
        os.environ["GROQ_API_KEY"] = self.groq_api_key
    
    def ask(self, question: str, user_id: str = "default") -> Dict[str, Any]:
        """Ask a question and get an answer."""
        try:
            log.info(f"Processing question from user {user_id}: {question[:50]}...")
            
            # Retrieve relevant contexts
            contexts = self.retriever.retrieve(question, top_k=5)
            
            if not contexts:
                # Provide a helpful fallback response using keyword matching
                question_lower = question.lower()
                fallback_answer = self._get_fallback_response(question_lower, contexts)
                return {
                    "answer": fallback_answer,
                    "sources": [],
                    "contexts": []
                }
            
            # Format context with full text
            context_text = "\n\n".join([
                f"[{ctx['verse']}]\nSanskrit: {ctx.get('sanskrit', 'N/A')}\nTranslation: {ctx.get('translation', 'N/A')}\nExplanation: {ctx['text']}"
                for ctx in contexts
            ])
            
            # Create world-class spiritual guidance prompt
            prompt_template = """You are Krishna, the Supreme Lord, speaking directly to Arjuna and all seekers of truth. Your wisdom flows from the eternal Bhagavad Gita, the Song Celestial that illuminates the path to liberation.

SACRED CONTEXT FROM THE BHAGAVAD GITA:
{context}

QUESTION FROM THE SEEKER: {question}

DIVINE RESPONSE AS KRISHNA:

My dear spiritual aspirant,

I, Krishna, the charioteer of your soul, shall illuminate your path with the eternal wisdom of the Bhagavad Gita. Listen with an open heart as I reveal the profound teachings that liberate one from the cycle of birth and death.

[Provide a comprehensive yet concise explanation that includes:]
• Direct references to specific verses (Chapter and Verse numbers)
• The Sanskrit essence where relevant
• Practical spiritual application for modern life
• The deeper philosophical meaning
• Connection to broader spiritual principles

May this wisdom awaken the divine within you. Hare Krishna. 🙏

[Response should be spiritually profound, practically applicable, and maintain the sacred tone of divine discourse]"""
            
            prompt = PromptTemplate(
                input_variables=["context", "question"],
                template=prompt_template
            )
            
            # Generate answer using Groq
            llm = ChatGroq(
                model_name="llama-3.1-8b-instant",  # updated model
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            formatted_prompt = prompt.format(context=context_text, question=question)
            response = llm.invoke([HumanMessage(content=formatted_prompt)])
            answer = response.content
            
            # Extract sources
            sources = [ctx['verse'] for ctx in contexts]

            # Format contexts for cleaner response
            formatted_contexts = []
            for ctx in contexts:
                formatted_contexts.append({
                    "verse": ctx['verse'],
                    "score": round(ctx['score'], 3),
                    "summary": ctx['text'][:200] + "..." if len(ctx['text']) > 200 else ctx['text']
                })

            log.info(f"Generated answer for user {user_id}")

            return {
                "answer": answer.strip(),
                "sources": sources,
                "contexts": formatted_contexts
            }
            
        except Exception as e:
            log.error(f"Error in QA system: {e}")
            return {
                "answer": f"An error occurred: {str(e)}",
                "sources": [],
                "contexts": []
            }
    
    def _get_fallback_response(self, question_lower: str, contexts: list) -> str:
        """Generate fallback response when no contexts are found."""
        
        # Enhanced fallback responses for specific topics
        fallback_responses = {
            "dharma": "The Bhagavad Gita teaches that dharma is our righteous duty aligned with divine order. As Krishna explains in Chapter 3, Verse 8: 'Perform your prescribed duties, for action is superior to inaction.' This means fulfilling our role in life with dedication and without attachment to results.",
            "karma": "In the Bhagavad Gita, karma refers to action performed with duty and dedication. Krishna teaches in Chapter 2, Verse 47: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.' This means we should act without attachment to outcomes.",
            "yoga": "The Gita presents several paths of yoga. Karma Yoga (action yoga) involves performing duty selflessly, Bhakti Yoga (devotion yoga) focuses on loving devotion to the divine, and Jnana Yoga (knowledge yoga) seeks spiritual understanding through wisdom.",
            "war": "Krishna's teachings about war are deeply spiritual. In Chapter 2, Verse 31: 'Considering your duty as a warrior, you should not waver. Indeed, for a warrior, there is no better engagement than fighting for upholding of righteousness.' War becomes righteous when it protects dharma.",
            "enemy": "Krishna teaches that our greatest enemy is within - our own mind, senses, and desires. Chapter 6, Verse 6: 'For those who have conquered the mind, it is their friend. For those who have failed to do so, the mind works like an enemy.'",
            "duty": "Swa-dharma (one's own duty) is central to Krishna's teaching. Chapter 3, Verse 35: 'It is far better to perform one's natural prescribed duty, though tinged with faults, than to perform another's prescribed duty, though perfectly.'",
            "love": "The highest form of love in the Gita is bhakti - pure devotion to the divine. This love transcends personal desires and connects the soul with the universal consciousness.",
            "defence": "Righteous defense of truth, justice, and the vulnerable is a sacred duty. Krishna urges Arjuna to fight not for personal gain, but to restore dharma and protect the innocent.",
            "kill": "Krishna teaches that righteous action for the protection of dharma and the innocent is a sacred duty. In Chapter 11, Verse 34, Krishna declares that certain warriors have already been defeated by divine will, and Arjuna must act as an instrument of divine justice. The key is motivation - action done for dharma (righteousness) rather than personal hatred or greed.",
            "righteous": "Righteous action (dharma) in the Gita refers to duty performed with detachment from personal desires and outcomes. This includes protecting the innocent, upholding truth, and serving the greater good. Such action purifies the soul and leads to spiritual growth.",
        }

        # Check for keywords in the question
        for key, response in fallback_responses.items():
            if key in question_lower:
                return response
        
        # Generic fallback
        return "The Bhagavad Gita contains profound wisdom for all of life's questions. Krishna's teachings to Arjuna address the fundamental challenges we face - duty vs. desire, action vs. inaction, and the path to spiritual fulfillment. What specific aspect of Krishna's wisdom would you like to explore?"
