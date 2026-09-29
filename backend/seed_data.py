from typing import List, Dict, Any
from datetime import datetime, timezone

SEED_HISTORICAL_INCIDENTS = [
    {
        "incident_id": "INC-1042",
        "title": "API Gateway Timeout",
        "similarity_percentage": 92,
        "service": "API Gateway",
        "root_cause": "Database connection pool exhausted",
        "previous_resolution": "Increased connection pool from 100 → 250 and restarted API instances",
        "runbook_id": "DB-CONNECTION-04",
        "date": "2026-08-14",
        "hindsight_fact": "INC-1042: API Gateway latency spiked to 12s due to postgres connection pool saturation. Resolved by adjusting pool size to 250 via DB-CONNECTION-04."
    },
    {
        "incident_id": "INC-982",
        "title": "API 504 Errors",
        "similarity_percentage": 87,
        "service": "API Gateway",
        "root_cause": "Database connection saturation under flash traffic",
        "previous_resolution": "Restarted API instances and increased pool capacity",
        "runbook_id": "DB-CONNECTION-04",
        "date": "2026-07-22",
        "hindsight_fact": "INC-982: 504 Gateway Timeouts under sudden traffic spike. Root cause: connection queue bottleneck. Mitigated using DB-CONNECTION-04."
    },
    {
        "incident_id": "INC-874",
        "title": "Payment Gateway DB Connection Stall",
        "similarity_percentage": 78,
        "service": "Payment Service",
        "root_cause": "Unclosed connections causing pool leak",
        "previous_resolution": "Recycled connection pool and applied connection leak fix",
        "runbook_id": "DB-CONNECTION-04",
        "date": "2026-06-11",
        "hindsight_fact": "INC-874: Pool exhaustion caused transaction latency. Resolution involved cycling pooler and increasing max connections."
    },
    {
        "incident_id": "INC-715",
        "title": "Auth Token Refresh Spike",
        "similarity_percentage": 64,
        "service": "Authentication",
        "root_cause": "Redis connection limit reached during peak token refresh",
        "previous_resolution": "Increased Redis maxclients and flushed stale connection pool",
        "runbook_id": "REDIS-FAILOVER-01",
        "date": "2026-05-03",
        "hindsight_fact": "INC-715: Auth service degraded due to connection saturation in cache layer. Resolved with REDIS-FAILOVER-01."
    }
]

SEED_RUNBOOKS = [
    {
        "id": "DB-CONNECTION-04",
        "title": "Database Connection Pool Recovery",
        "service": "API Gateway",
        "problem": "Database connection pool exhaustion leading to 504 Gateway Timeouts and request queueing.",
        "prerequisites": [
            "kubectl access to the production cluster (namespace: gateway-prod)",
            "Elevated SRE permissions on PostgreSQL connection pooler (PgBouncer)",
            "Datadog / Prometheus dashboard access for DB pool saturation metrics"
        ],
        "steps": [
            "Inspect current pool saturation metrics via pg_stat_activity and connection pool logs",
            "Verify active and queued database connections to identify long-running queries",
            "Increase connection pool max limit from 100 to 250 in the gateway config map / deployment",
            "Perform rolling restart of affected API Gateway pod replicas",
            "Monitor API latency and error rate for 5 minutes post-restart",
            "Verify recovery and report status to the incident channel"
        ],
        "commands": [
            "kubectl get pods -n gateway-prod -l app=api-gateway",
            "psql -h pg-bouncer.prod.internal -p 6432 -U pgbouncer -c 'SHOW POOLS;'",
            "kubectl set env deployment/api-gateway DB_POOL_MAX_SIZE=250 -n gateway-prod",
            "kubectl rollout restart deployment/api-gateway -n gateway-prod",
            "kubectl rollout status deployment/api-gateway -n gateway-prod --timeout=120s",
            "curl -s -w '%{time_total}s (HTTP %{http_code})\n' -o /dev/null https://api.production.internal/health"
        ],
        "verification": "API Gateway P99 latency drops below 200ms; active pool utilization drops below 60%; 0 queued queries in PgBouncer.",
        "rollback": "If database CPU exceeds 85%, immediately revert DB_POOL_MAX_SIZE=100 and engage Database DBA on-call.",
        "usage_count": 18,
        "success_rate": 96
    },
    {
        "id": "KUBE-POD-OOM-02",
        "title": "Kubernetes Memory Limit & Pod Restart",
        "service": "Payment Service",
        "problem": "Pod OOMKilled errors and container crash loops during high payload volume.",
        "prerequisites": [
            "Kubernetes cluster admin privileges",
            "Access to Grafana JVM / Container memory dashboards"
        ],
        "steps": [
            "Identify failing pods with OOMKilled exit code 137",
            "Bump container memory request from 2Gi to 4Gi and limit to 6Gi",
            "Scale deployment by +2 replicas to distribute memory load",
            "Verify heap utilization stabilizes below 75%"
        ],
        "commands": [
            "kubectl get pods -n payment-prod | grep -E 'OOMKilled|CrashLoopBackOff'",
            "kubectl set resources deployment/payment-svc -n payment-prod --limits=memory=6Gi --requests=memory=4Gi",
            "kubectl scale deployment/payment-svc -n payment-prod --replicas=6"
        ],
        "verification": "Pod restarts cease; memory utilization remains stable below 75%.",
        "rollback": "Scale back to original replicas if downstream DB experiences thread contention.",
        "usage_count": 12,
        "success_rate": 92
    },
    {
        "id": "REDIS-FAILOVER-01",
        "title": "Redis Sentinel Primary Failover & Cache Flush",
        "service": "Authentication",
        "problem": "Cache connection saturation, high eviction rate, or unresponsive Redis master node.",
        "prerequisites": [
            "Sentinel CLI access",
            "Session service monitoring access"
        ],
        "steps": [
            "Check Redis Sentinel master status and lag",
            "Trigger manual sentinel failover to healthy replica",
            "Flush degraded temporary session cache keys",
            "Verify client reconnects to new master seamlessly"
        ],
        "commands": [
            "redis-cli -p 26379 sentinel master mymaster",
            "redis-cli -p 26379 sentinel failover mymaster",
            "redis-cli -p 6379 info replication"
        ],
        "verification": "Sentinel confirms new primary; auth token latency drops under 40ms.",
        "rollback": "Manually re-promote original master node if replication sync fails.",
        "usage_count": 14,
        "success_rate": 94
    },
    {
        "id": "AUTH-TOKEN-LEAK-05",
        "title": "Revoke Stale JWTs & Rotate Signing Key",
        "service": "Authentication",
        "problem": "Suspected token leakage or signature verification bottleneck.",
        "prerequisites": [
            "KMS Admin key access",
            "Auth Service secret manager access"
        ],
        "steps": [
            "Generate new RSA signing key pair in AWS KMS / HashiCorp Vault",
            "Publish new public key to JWKS discovery endpoint",
            "Gracefully rotate active signer while keeping old key for validation grace period",
            "Invalidate compromised token revocation list in distributed cache"
        ],
        "commands": [
            "aws kms create-key --description 'IncidentIQ JWT Rotation'",
            "vault write secret/jwt-keys/current key=@new_private.pem",
            "curl -s https://auth.production.internal/.well-known/jwks.json | jq ."
        ],
        "verification": "New tokens signed with KeyID v2; JWKS verifies successfully.",
        "rollback": "Restore previous KeyID from backup secret store.",
        "usage_count": 6,
        "success_rate": 100
    }
]

SEED_SERVICES = [
    {
        "id": "api-gateway",
        "name": "API Gateway",
        "status": "Degraded",
        "latency_ms": 10420,
        "error_rate": 14.8,
        "active_incidents": 1,
        "historical_incident_count": 9,
        "common_root_causes": [
            "Database connection pool exhaustion",
            "Upstream ingress queue timeout",
            "Network thread contention"
        ],
        "related_runbooks": ["DB-CONNECTION-04", "KUBE-POD-OOM-02"]
    },
    {
        "id": "payment-service",
        "name": "Payment Service",
        "status": "Operational",
        "latency_ms": 142,
        "error_rate": 0.02,
        "active_incidents": 0,
        "historical_incident_count": 4,
        "common_root_causes": [
            "Stripe API timeout",
            "Idempotency store lock",
            "Postgres replica read lag"
        ],
        "related_runbooks": ["KUBE-POD-OOM-02"]
    },
    {
        "id": "database",
        "name": "Database (Postgres)",
        "status": "High Load",
        "latency_ms": 480,
        "error_rate": 1.2,
        "active_incidents": 1,
        "historical_incident_count": 14,
        "common_root_causes": [
            "Connection pool exhaustion (PgBouncer)",
            "Unindexed query table lock",
            "WAL disk space pressure"
        ],
        "related_runbooks": ["DB-CONNECTION-04"]
    },
    {
        "id": "auth-service",
        "name": "Authentication",
        "status": "Operational",
        "latency_ms": 88,
        "error_rate": 0.01,
        "active_incidents": 0,
        "historical_incident_count": 6,
        "common_root_causes": [
            "Redis session cache saturation",
            "JWKS key rotation lag",
            "OAuth provider rate limit"
        ],
        "related_runbooks": ["REDIS-FAILOVER-01", "AUTH-TOKEN-LEAK-05"]
    },
    {
        "id": "notifications",
        "name": "Notifications",
        "status": "Operational",
        "latency_ms": 65,
        "error_rate": 0.0,
        "active_incidents": 0,
        "historical_incident_count": 3,
        "common_root_causes": [
            "Kafka partition consumer lag",
            "Sendgrid delivery quota exceeded"
        ],
        "related_runbooks": []
    }
]

SEED_ACTIVE_INCIDENT = {
    "id": "INC-2048",
    "title": "API Gateway Latency Spike",
    "service": "API Gateway",
    "severity": "Critical",
    "status": "Investigating",
    "description": "API requests are taking more than 10 seconds. Ingress gateway is throwing 504 Gateway Timeouts. Database connection utilization is reporting 98%.",
    "error_message": "504 Gateway Timeout: upstream request timeout / DB connection pool saturated",
    "affected_components": ["api-gateway", "database", "postgres-pooler"],
    "duration": "08:32",
    "impact": "High",
    "likely_root_cause": "Database connection pool exhaustion.",
    "confidence": 94,
    "recommended_runbook_id": "DB-CONNECTION-04",
    "recalled_incidents": SEED_HISTORICAL_INCIDENTS[:2],
    "resolution_steps": [
        {
            "id": "step-1",
            "text": "Check database connection pool usage",
            "completed": True,
            "completed_at": "08:47:12",
            "completed_by": "Alex Chen (On-Call SRE)"
        },
        {
            "id": "step-2",
            "text": "Verify active database connections",
            "completed": True,
            "completed_at": "08:48:40",
            "completed_by": "Alex Chen (On-Call SRE)"
        },
        {
            "id": "step-3",
            "text": "Increase connection pool if exhausted",
            "completed": False,
            "completed_at": None,
            "completed_by": None
        },
        {
            "id": "step-4",
            "text": "Restart affected API instances",
            "completed": False,
            "completed_at": None,
            "completed_by": None
        },
        {
            "id": "step-5",
            "text": "Monitor API latency",
            "completed": False,
            "completed_at": None,
            "completed_by": None
        },
        {
            "id": "step-6",
            "text": "Verify recovery",
            "completed": False,
            "completed_at": None,
            "completed_by": None
        }
    ],
    "timeline": [
        {
            "id": "tl-1",
            "time": "08:42",
            "title": "Incident detected",
            "description": "Synthetic canary check flagged P99 latency > 10,000ms and 504 status codes.",
            "category": "detection",
            "author": "Canary Monitor",
            "timestamp": "2026-09-29T08:42:00Z"
        },
        {
            "id": "tl-2",
            "time": "08:44",
            "title": "Hindsight searched",
            "description": "IncidentIQ dispatched semantic query across historical incidents in Hindsight memory.",
            "category": "ai",
            "author": "IncidentIQ Agent",
            "timestamp": "2026-09-29T08:44:10Z"
        },
        {
            "id": "tl-3",
            "time": "08:44",
            "title": "4 similar incidents recalled",
            "description": "Matched INC-1042 (92% similarity) and INC-982 (87% similarity) with matching DB pool signature.",
            "category": "memory",
            "author": "Hindsight Memory Engine",
            "timestamp": "2026-09-29T08:44:35Z"
        },
        {
            "id": "tl-4",
            "time": "08:46",
            "title": "Database connection issue identified",
            "description": "AI analysis correlated 504 errors with PgBouncer connection queue exhaustion.",
            "category": "ai",
            "author": "Groq AI Reasoning",
            "timestamp": "2026-09-29T08:46:15Z"
        },
        {
            "id": "tl-5",
            "time": "08:49",
            "title": "Engineer started DB-CONNECTION-04",
            "description": "On-call SRE initiated Database Connection Pool Recovery runbook procedures.",
            "category": "action",
            "author": "Alex Chen (On-Call SRE)",
            "timestamp": "2026-09-29T08:49:00Z"
        },
        {
            "id": "tl-6",
            "time": "08:53",
            "title": "Connection pool increased",
            "description": "DB_POOL_MAX_SIZE updated from 100 to 250 in deployment configuration.",
            "category": "action",
            "author": "Alex Chen (On-Call SRE)",
            "timestamp": "2026-09-29T08:53:22Z"
        },
        {
            "id": "tl-7",
            "time": "08:56",
            "title": "API latency returned to normal",
            "description": "Canary latency normalized to 145ms; 504 errors ceased completely.",
            "category": "resolution",
            "author": "Canary Monitor",
            "timestamp": "2026-09-29T08:56:00Z"
        }
    ],
    "created_at": "2026-09-29T08:42:00Z",
    "resolved_at": None,
    "post_mortem_id": None
}

SEED_POSTMORTEMS = [
    {
        "id": "PM-1042",
        "incident_id": "INC-1042",
        "created_at": "2026-08-14T11:30:00Z",
        "retained_in_hindsight": True,
        "hindsight_memory_id": "mem-inc-1042-hsk",
        "summary": "API Gateway experienced severe latency degradation and 504 timeouts due to PostgreSQL connection pool exhaustion during a flash traffic surge.",
        "impact": "Approximately 4,200 requests timed out with 504 status codes over a 14-minute window. P99 latency peaked at 12,400ms.",
        "timeline": [
            "10:14 - Latency spike detected by Prometheus alert",
            "10:16 - SRE team paged via PagerDuty",
            "10:18 - Hindsight recalled past incident INC-982",
            "10:21 - Scaled PgBouncer max connections from 100 to 250",
            "10:25 - Rolling restart of API Gateway pods",
            "10:28 - P99 latency returned to baseline (<180ms)"
        ],
        "root_cause": "The default connection pool limit of 100 was insufficient for concurrent API Gateway worker pods during marketing campaign traffic.",
        "contributing_factors": [
            "Unannounced marketing campaign email blast",
            "Lack of predictive connection pool autoscaling"
        ],
        "resolution": "Applied Runbook DB-CONNECTION-04: Scaled DB_POOL_MAX_SIZE from 100 to 250 and performed rolling restart.",
        "what_worked": [
            "Hindsight recall immediately surfaced connection saturation hypothesis",
            "Runbook DB-CONNECTION-04 provided exact commands to scale pool without database downtime"
        ],
        "what_didnt_work": [
            "Canary alerts fired 3 minutes after degradation started due to 5-minute aggregation window"
        ],
        "lessons_learned": [
            "All core services must have connection pool telemetry with alerting at 80% saturation",
            "Postgres connection limits should dynamically scale with pod replica count"
        ],
        "preventive_actions": [
            "Set up PgBouncer pool saturation alerts at 80% threshold",
            "Update CI/CD helm charts with default DB_POOL_MAX_SIZE=250"
        ]
    }
]
