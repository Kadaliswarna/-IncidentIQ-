import asyncio
import logging
from typing import List, Dict, Any, Optional
from hindsight_client import Hindsight
from config import settings

logger = logging.getLogger("hindsight_service")

class HindsightService:
    def __init__(self):
        self.api_key = settings.HINDSIGHT_API_KEY
        self.base_url = settings.HINDSIGHT_BASE_URL
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self.client: Optional[Hindsight] = None
        self.initialized = False
        self._initialize_client()

    def _initialize_client(self):
        if not self.api_key:
            logger.warning("HINDSIGHT_API_KEY not configured!")
            return
        try:
            self.client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=30.0
            )
            self.initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize Hindsight client: {e}")
            self.initialized = False

    def is_healthy(self) -> bool:
        return self.initialized and self.client is not None

    async def ensure_bank(self):
        if not self.client:
            return
        def _create():
            try:
                self.client.create_bank(
                    bank_id=self.bank_id,
                    name="IncidentIQ Production Memory",
                    mission="Incident response memory bank for storing post-mortems, root-cause patterns, and resolution runbooks."
                )
                logger.info(f"Memory bank '{self.bank_id}' ensured.")
            except Exception as e:
                logger.info(f"Bank already exists or checked: {e}")
        await asyncio.to_thread(_create)

    async def retain_incident(
        self,
        incident_id: str,
        title: str,
        service: str,
        severity: str,
        root_cause: str,
        resolution: str,
        runbook_id: Optional[str] = None,
        lessons_learned: Optional[str] = None,
        post_mortem_text: Optional[str] = None,
        symptoms: Optional[str] = None,
        error_message: Optional[str] = None,
        affected_components: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Real retain operation storing structured incident learnings in Hindsight.
        Executed in thread pool to prevent event loop collision.
        """
        if not self.client:
            raise RuntimeError("Hindsight client is unavailable or unconfigured.")

        components_str = ", ".join(affected_components) if affected_components else "None"
        content_lines = [
            f"INCIDENT REPORT: {incident_id} - {title}",
            f"Service: {service} | Severity: {severity}",
            f"Symptoms: {symptoms or 'High latency / system degradation'}",
            f"Error: {error_message or '504 / Service unavailable'}",
            f"Affected Components: {components_str}",
            f"Root Cause: {root_cause}",
            f"Successful Resolution: {resolution}",
            f"Associated Runbook: {runbook_id or 'None'}",
            f"Lessons Learned: {lessons_learned or 'Ensure alerts trigger earlier and auto-scaling rules are adjusted.'}",
        ]
        if post_mortem_text:
            content_lines.append(f"Post-Mortem Details:\n{post_mortem_text}")

        full_content = "\n".join(content_lines)

        def _do_retain():
            return self.client.retain(
                bank_id=self.bank_id,
                content=full_content,
                document_id=f"incident-{incident_id.lower()}",
                metadata={
                    "incident_id": incident_id,
                    "service": service,
                    "severity": severity,
                    "runbook_id": runbook_id or "",
                    "type": "incident_postmortem"
                },
                tags=[service.lower(), severity.lower(), "incident-postmortem"]
            )

        try:
            response = await asyncio.to_thread(_do_retain)
            return {
                "success": True,
                "bank_id": self.bank_id,
                "incident_id": incident_id,
                "retained_length": len(full_content),
                "response": str(response)
            }
        except Exception as e:
            logger.error(f"Error during Hindsight retain: {e}")
            raise RuntimeError(f"Hindsight Retain failed: {str(e)}")

    async def recall_incidents(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Real recall operation querying historical memories from Hindsight.
        Executed in thread pool to prevent event loop collision.
        """
        if not self.client:
            raise RuntimeError("Hindsight client is unavailable or unconfigured.")

        def _do_recall():
            return self.client.recall(
                bank_id=self.bank_id,
                query=query,
                max_tokens=2048,
                budget="mid"
            )

        try:
            recall_response = await asyncio.to_thread(_do_recall)
            raw_results = getattr(recall_response, "results", [])
            extracted = []
            for item in raw_results:
                text = getattr(item, "text", str(item))
                item_id = getattr(item, "id", "")
                item_type = getattr(item, "type", "world")
                extracted.append({
                    "id": item_id,
                    "type": item_type,
                    "text": text
                })
            return extracted
        except Exception as e:
            logger.error(f"Error during Hindsight recall: {e}")
            raise RuntimeError(f"Hindsight Recall failed: {str(e)}")

hindsight_service = HindsightService()
