import json
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from config import settings

logger = logging.getLogger("groq_service")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.client: Optional[Groq] = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.api_key:
            logger.warning("GROQ_API_KEY not configured!")
            return
        try:
            self.client = Groq(api_key=self.api_key)
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")

    def is_healthy(self) -> bool:
        return self.client is not None

    def analyze_incident(
        self,
        incident_data: Dict[str, Any],
        recalled_memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Synthesize incident details + Hindsight recalled memory into
        likely root cause, confidence score, actionable resolution steps, and runbook.
        """
        if not self.client:
            raise RuntimeError("Groq client is unavailable or unconfigured.")

        memories_text = "\n".join([f"- Memory: {m.get('text')}" for m in recalled_memories]) if recalled_memories else "No historical memories found."

        prompt = f"""You are IncidentIQ, an elite autonomous SRE and Incident Response Agent.
Analyze the following active incident using historical memories recalled from Hindsight memory bank.

=== ACTIVE INCIDENT ===
Title: {incident_data.get('title')}
Service: {incident_data.get('service')}
Severity: {incident_data.get('severity')}
Description: {incident_data.get('description')}
Error Message: {incident_data.get('error_message')}
Affected Components: {', '.join(incident_data.get('affected_components', []))}

=== RECALLED MEMORIES FROM HINDSIGHT ===
{memories_text}

=== INSTRUCTIONS ===
1. Compare symptoms and error messages against historical memory.
2. Determine the likely root cause.
3. Assign a realistic confidence percentage (0-100) based on memory match.
4. Recommend 5-6 ordered interactive resolution steps.
5. Identify or recommend the most relevant Runbook ID (e.g. DB-CONNECTION-04).
6. Return ONLY valid JSON matching this schema:
{{
  "likely_root_cause": "Detailed likely root cause statement",
  "confidence": 94,
  "analysis_summary": "1-2 concise sentences summarizing the error pattern and match with Hindsight memory",
  "recommended_runbook_id": "DB-CONNECTION-04",
  "resolution_steps": [
    "Check database connection pool usage",
    "Verify active database connections",
    "Increase connection pool if exhausted",
    "Restart affected API instances",
    "Monitor API latency",
    "Verify recovery"
  ]
}}
"""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a DevOps Incident Response AI. Output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw_content = chat_completion.choices[0].message.content.strip()
            parsed = json.loads(raw_content)
            return parsed
        except Exception as e:
            logger.error(f"Error calling Groq for incident analysis: {e}")
            raise RuntimeError(f"Groq analysis error: {str(e)}")

    def chat_response(
        self,
        incident_context: Dict[str, Any],
        recalled_memories: List[Dict[str, Any]],
        history: List[Dict[str, str]],
        user_message: str
    ) -> Dict[str, Any]:
        """
        Chat with the Incident Response Agent grounded in the active incident and Hindsight memory.
        """
        if not self.client:
            raise RuntimeError("Groq client is unavailable or unconfigured.")

        memories_text = "\n".join([f"- [Hindsight Memory]: {m.get('text')}" for m in recalled_memories]) if recalled_memories else "None."

        system_prompt = f"""You are IncidentIQ Response Agent, an expert AI Site Reliability Engineer assisting an on-call engineer during an incident.
Use the active incident context and recalled Hindsight memories to answer questions accurately, concisely, and authoritatively.

Active Incident:
- Title: {incident_context.get('title')}
- Service: {incident_context.get('service')}
- Severity: {incident_context.get('severity')}
- Error: {incident_context.get('error_message')}
- Status: {incident_context.get('status')}

Historical Knowledge Recalled from Hindsight:
{memories_text}

Rules:
- Be concise, direct, and actionable.
- Cite specific historical incidents (like INC-1042 or INC-982) and runbooks (like DB-CONNECTION-04) if relevant.
- Clearly differentiate between confirmed facts from memory and likely hypotheses.
"""
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        try:
            completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.3,
                max_tokens=600
            )
            content = completion.choices[0].message.content.strip()
            
            # Extract citations if mentioned
            citations = []
            if "INC-1042" in content or "INC-1042" in memories_text:
                citations.append("INC-1042 (Hindsight Memory)")
            if "INC-982" in content or "INC-982" in memories_text:
                citations.append("INC-982 (Hindsight Memory)")
            if "DB-CONNECTION-04" in content:
                citations.append("Runbook DB-CONNECTION-04")

            return {
                "role": "assistant",
                "content": content,
                "citations": list(set(citations))
            }
        except Exception as e:
            logger.error(f"Error in Groq chat: {e}")
            raise RuntimeError(f"Groq chat failed: {str(e)}")

    def generate_post_mortem(
        self,
        incident_data: Dict[str, Any],
        timeline: List[Dict[str, Any]],
        resolution_steps: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive post-mortem document.
        """
        if not self.client:
            raise RuntimeError("Groq client is unavailable or unconfigured.")

        prompt = f"""You are the Incident Commander. Generate a blameless post-mortem report for the following resolved incident.

Incident:
Title: {incident_data.get('title')}
Service: {incident_data.get('service')}
Severity: {incident_data.get('severity')}
Description: {incident_data.get('description')}
Likely Root Cause: {incident_data.get('likely_root_cause')}

Timeline events:
{json.dumps(timeline, indent=2)}

Completed resolution steps:
{json.dumps(resolution_steps, indent=2)}

Return ONLY valid JSON with this exact structure:
{{
  "summary": "Executive summary of the incident and impact",
  "impact": "Detailed business and service impact (e.g. 504 errors on API Gateway, elevated P99 latency to 12s)",
  "timeline": [
    "08:42 - Incident detected by automated monitoring",
    "08:44 - Hindsight searched and 4 similar incidents recalled",
    "08:46 - Database connection pool exhaustion identified as root cause",
    "08:49 - Engineer initiated DB-CONNECTION-04 runbook",
    "08:53 - Connection pool capacity scaled from 100 to 250",
    "08:56 - Service recovered and API latency normalized"
  ],
  "root_cause": "Comprehensive technical description of root cause",
  "contributing_factors": [
    "Traffic spike from marketing campaign",
    "Default connection pool limit unadjusted after microservice deployment"
  ],
  "resolution": "Applied Runbook DB-CONNECTION-04: Scaled max pool size and performed rolling restart.",
  "what_worked": [
    "Hindsight memory recall immediately matched INC-1042",
    "Automated runbook steps reduced MTTR by 65%"
  ],
  "what_didnt_work": [
    "Alert threshold fired 3 minutes after degradation began"
  ],
  "lessons_learned": [
    "Connection pool metrics must have proactive predictive alerts",
    "Runbook commands should be added to automated self-healing scripts"
  ],
  "preventive_actions": [
    "Implement auto-scaling for DB connection pool limits",
    "Add load test test cases for connection saturation"
  ]
}}
"""
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an SRE Post-Mortem generator. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw = completion.choices[0].message.content.strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Error generating post-mortem: {e}")
            raise RuntimeError(f"Post-mortem generation error: {str(e)}")

groq_service = GroqService()
