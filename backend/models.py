from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TimelineEvent(BaseModel):
    id: str
    time: str
    title: str
    description: str
    category: str  # 'detection' | 'ai' | 'memory' | 'action' | 'resolution'
    author: Optional[str] = "IncidentIQ System"
    timestamp: Optional[str] = None

class ResolutionStep(BaseModel):
    id: str
    text: str
    completed: bool = False
    completed_at: Optional[str] = None
    completed_by: Optional[str] = None

class HistoricalIncidentRecall(BaseModel):
    incident_id: str
    title: str
    similarity_percentage: int
    service: str
    root_cause: str
    previous_resolution: str
    runbook_id: Optional[str] = None
    date: Optional[str] = None
    hindsight_fact: Optional[str] = None

class IncidentCreate(BaseModel):
    title: str
    service: str
    severity: str  # 'Critical' | 'High' | 'Medium' | 'Low'
    description: str
    error_message: str
    affected_components: List[str] = []

class Incident(BaseModel):
    id: str
    title: str
    service: str
    severity: str
    status: str  # 'Active' | 'Investigating' | 'Mitigating' | 'Resolved'
    description: str
    error_message: str
    affected_components: List[str] = []
    duration: str = "00:00"
    impact: str = "High"
    likely_root_cause: Optional[str] = None
    confidence: Optional[int] = None
    recalled_incidents: List[HistoricalIncidentRecall] = []
    resolution_steps: List[ResolutionStep] = []
    recommended_runbook_id: Optional[str] = None
    timeline: List[TimelineEvent] = []
    created_at: str
    resolved_at: Optional[str] = None
    post_mortem_id: Optional[str] = None

class Runbook(BaseModel):
    id: str
    title: str
    service: str
    problem: str
    prerequisites: List[str]
    steps: List[str]
    commands: List[str]
    verification: str
    rollback: str
    usage_count: int
    success_rate: int

class PostMortemCreate(BaseModel):
    incident_id: str
    summary: str
    impact: str
    timeline: List[str]
    root_cause: str
    contributing_factors: List[str]
    resolution: str
    what_worked: List[str]
    what_didnt_work: List[str]
    lessons_learned: List[str]
    preventive_actions: List[str]

class PostMortem(PostMortemCreate):
    id: str
    created_at: str
    retained_in_hindsight: bool = False
    hindsight_memory_id: Optional[str] = None

class ServiceHealth(BaseModel):
    id: str
    name: str
    status: str  # 'Operational' | 'Degraded' | 'High Load' | 'Critical'
    latency_ms: int
    error_rate: float
    active_incidents: int
    historical_incident_count: int
    common_root_causes: List[str]
    related_runbooks: List[str]

class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    timestamp: Optional[str] = None
    citations: Optional[List[str]] = []

class ChatRequest(BaseModel):
    incident_id: str
    message: str
    history: List[ChatMessage] = []

class RetainRequest(BaseModel):
    incident_id: str
    title: str
    service: str
    severity: str
    root_cause: str
    resolution: str
    runbook: Optional[str] = None
    lessons_learned: Optional[str] = None
    post_mortem_text: Optional[str] = None

class RecallRequest(BaseModel):
    query: str
    service: Optional[str] = None
    limit: Optional[int] = 5
