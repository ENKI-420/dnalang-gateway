"""
Supabase Client for AURA Multi-Agent System
Σₛ = dna::}{::lang
"""

import os
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from datetime import datetime
import json


class SupabaseClient:
    """Singleton Supabase client for authentication and data persistence"""

    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            url = os.environ.get('SUPABASE_URL')
            key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_ANON_KEY')

            if not url or not key:
                raise RuntimeError("Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_KEY")

            self._client = create_client(url, key)

    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            raise RuntimeError("Supabase client not initialized")
        return self._client

    # ==========================================
    # Authentication Methods
    # ==========================================

    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and return user data

        Args:
            token: JWT token from Authorization header

        Returns:
            User data if valid, None otherwise
        """
        try:
            user = self.client.auth.get_user(token)
            return user.user.model_dump() if user.user else None
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Failed to get user: {e}")
            return None

    # ==========================================
    # Session Management
    # ==========================================

    async def create_session(self, user_id: str, session_type: str = "aura_chat") -> Dict[str, Any]:
        """
        Create a new AURA session

        Args:
            user_id: User ID
            session_type: Type of session (aura_chat, quantum_exec, etc.)

        Returns:
            Session data
        """
        session_data = {
            'user_id': user_id,
            'session_type': session_type,
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'metadata': {}
        }

        response = self.client.table('aura_sessions').insert(session_data).execute()
        return response.data[0] if response.data else None

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID"""
        try:
            response = self.client.table('aura_sessions').select('*').eq('id', session_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Failed to get session: {e}")
            return None

    async def update_session(self, session_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update session data"""
        response = self.client.table('aura_sessions').update(updates).eq('id', session_id).execute()
        return response.data[0] if response.data else None

    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """Mark session as ended"""
        return await self.update_session(session_id, {
            'status': 'ended',
            'ended_at': datetime.utcnow().isoformat()
        })

    # ==========================================
    # Conversation/Message Storage
    # ==========================================

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        agent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Save a message to the conversation

        Args:
            session_id: Session ID
            role: Message role (user, assistant, system, agent)
            content: Message content
            agent_id: Optional agent ID if message from specific agent
            metadata: Optional metadata (metrics, traces, etc.)

        Returns:
            Message data
        """
        message_data = {
            'session_id': session_id,
            'role': role,
            'content': content,
            'agent_id': agent_id,
            'metadata': metadata or {},
            'created_at': datetime.utcnow().isoformat()
        }

        response = self.client.table('aura_messages').insert(message_data).execute()
        return response.data[0] if response.data else None

    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a session"""
        try:
            response = (
                self.client.table('aura_messages')
                .select('*')
                .eq('session_id', session_id)
                .order('created_at', desc=False)
                .limit(limit)
                .execute()
            )
            return response.data or []
        except Exception as e:
            print(f"Failed to get conversation history: {e}")
            return []

    # ==========================================
    # Agent State & Memory
    # ==========================================

    async def save_agent_state(
        self,
        session_id: str,
        agent_id: str,
        agent_type: str,
        state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Save agent state

        Args:
            session_id: Session ID
            agent_id: Agent ID
            agent_type: Agent type (architect, engineer, reviewer, etc.)
            state: Agent state data

        Returns:
            Saved state data
        """
        state_data = {
            'session_id': session_id,
            'agent_id': agent_id,
            'agent_type': agent_type,
            'state': state,
            'updated_at': datetime.utcnow().isoformat()
        }

        # Upsert based on session_id + agent_id
        response = self.client.table('aura_agent_states').upsert(state_data).execute()
        return response.data[0] if response.data else None

    async def get_agent_state(self, session_id: str, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent state"""
        try:
            response = (
                self.client.table('aura_agent_states')
                .select('*')
                .eq('session_id', session_id)
                .eq('agent_id', agent_id)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Failed to get agent state: {e}")
            return None

    async def get_all_agent_states(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all agent states for a session"""
        try:
            response = (
                self.client.table('aura_agent_states')
                .select('*')
                .eq('session_id', session_id)
                .execute()
            )
            return response.data or []
        except Exception as e:
            print(f"Failed to get agent states: {e}")
            return []

    # ==========================================
    # Usage Tracking
    # ==========================================

    async def log_usage(
        self,
        user_id: str,
        session_id: str,
        usage_type: str,
        quantity: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Log usage for billing

        Args:
            user_id: User ID
            session_id: Session ID
            usage_type: Type of usage (agent_call, quantum_exec, message, etc.)
            quantity: Quantity used
            metadata: Additional metadata

        Returns:
            Usage record
        """
        usage_data = {
            'user_id': user_id,
            'session_id': session_id,
            'usage_type': usage_type,
            'quantity': quantity,
            'metadata': metadata or {},
            'created_at': datetime.utcnow().isoformat()
        }

        response = self.client.table('aura_usage').insert(usage_data).execute()
        return response.data[0] if response.data else None

    async def get_user_usage(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get user usage records"""
        try:
            query = self.client.table('aura_usage').select('*').eq('user_id', user_id)

            if start_date:
                query = query.gte('created_at', start_date)
            if end_date:
                query = query.lte('created_at', end_date)

            response = query.execute()
            return response.data or []
        except Exception as e:
            print(f"Failed to get usage: {e}")
            return []


# Global instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client singleton"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client
