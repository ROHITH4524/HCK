# RouteMind - Architecture & Technical Design

RouteMind is an enterprise AI adaptive route optimization platform engineered for complex supply chains, modeled on the **Amazon Last Mile Routing Research Challenge** dataset and optimized for hyper-local Indian logistics constraints.

---

## 1. System Architecture

```mermaid
graph TD
    UserClient[React + Leaflet Glassmorphism UI] <-->|REST & WebSockets| FastAPIGateway[FastAPI Gateway Engine]
    FastAPIGateway <--> AuthEngine[JWT Security & Role-Based Access]
    FastAPIGateway <--> DB[(SQLAlchemy ORM - PostgreSQL / SQLite)]

    subgraph AI Core Optimization Suite
        FastAPIGateway <--> VRP[Google OR-Tools VRPTW Engine]
        FastAPIGateway <--> Constraints[Indian Logistics Constraint Engine]
        FastAPIGateway <--> ETAModel[RandomForest / XGBoost ETA Predictor]
        FastAPIGateway <--> DynamicReplan[Sub-30s Dynamic Replanner]
        FastAPIGateway <--> Explainer[Natural Language Explainability Engine]
        FastAPIGateway <--> CostEngine[Operational Cost & Carbon Estimator]
        FastAPIGateway <--> Benchmarker[Algorithmic Benchmark Suite]
    end

    subgraph Amazon Dataset Pipeline
        RawData[(Amazon Last Mile Dataset JSON)] --> Loader[Data Loader & Haversine Matrix]
        Loader --> VRP
        Loader --> ETAModel
    end
```

---

## 2. AI Workflow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Driver/Supervisor
    participant UI as React Map Frontend
    participant API as FastAPI Backend
    participant AI as Dynamic Replanning Engine
    participant Exp as Explainability Engine
    participant DB as Database

    Driver/Supervisor->>UI: Triggers Live Disruption Event (Traffic / Pickup)
    UI->>API: POST /api/v1/replan (event_type, route_id)
    API->>AI: Execute Sub-30s Partial Re-sequencing
    AI->>AI: Evaluate Nearest-Neighbor & Distance Matrix
    AI->>Exp: Generate Plain English Explanation & Metrics Diff
    Exp-->>API: Return Rationale + Distance/Time/Cost Saved
    API->>DB: Save LiveEvent & AIDecision (Status: PENDING_APPROVAL)
    API-->>UI: Broadcast Real-Time WebSocket Notification
    UI->>Supervisor: Present Side-by-Side Before vs. After Modal
    Supervisor->>UI: Clicks "Approve Proposal"
    UI->>API: POST /api/v1/approve (decision_id, approve=true)
    API->>DB: Mutate Active Route Stop Sequence
    API-->>Driver: Push Updated Turn-by-Turn Navigation
```

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    HUBS ||--o{ VEHICLES : operates
    VEHICLES ||--o{ ROUTES : assigned_to
    DRIVERS ||--o{ ROUTES : drives
    ROUTES ||--|{ STOPS : contains
    LIVE_EVENTS ||--o{ AI_DECISIONS : triggers
    AI_DECISIONS ||--o| SUPERVISOR_APPROVALS : evaluates

    HUBS {
        string hub_id PK
        string name
        float lat
        float lng
    }

    VEHICLES {
        string vehicle_id PK
        string name
        float max_capacity_kg
        float max_cod_limit_inr
        string status
    }

    ROUTES {
        string route_id PK
        string vehicle_id FK
        float total_distance_km
        float total_duration_minutes
        float total_fuel_cost_inr
    }

    STOPS {
        string stop_id PK
        string route_id FK
        int sequence_order
        float lat
        float lng
        boolean is_cod
        float cod_amount_inr
    }

    AI_DECISIONS {
        string decision_id PK
        string event_id FK
        float distance_saved_km
        float time_saved_min
        text explanation
        string status
    }
```
