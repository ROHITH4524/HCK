# RouteMind - 8-Minute Hackathon Presentation & Live Demo Script

## Timeline & Presentation Agenda (Total: 8 Minutes)

### Minute 0:00 - 1:00: Problem & Supply Chain Context
- **Presenter**: "Good morning judges. Supply chain logistics in emerging markets like India face severe friction: unpredictable traffic gridlock, No-Truck peak hour prohibitions, high Cash-on-Delivery (COD) cash risk, and sudden customer pickups. Traditional static VRP algorithms fail when real-world disruptions strike."
- **Slide / Visual**: Show problem slide highlighting urban Indian congestion and Amazon Last Mile challenge complexity.

### Minute 1:00 - 2:30: The RouteMind Solution & Dataset Integration
- **Presenter**: "Enter **RouteMind** – an adaptive, AI-powered route optimization and real-time replanning platform built on the **Amazon Last Mile Routing Research Challenge** dataset."
- **Action**: Open Executive Dashboard. Point to real-time KPIs (Fuel saved ₹1,420, ETA accuracy 95.8%, 3 active EV/Diesel fleet vehicles).
- **Highlight**: Point out the Peenya Central Depot and 40 Indian delivery stops visualised on the dark-mode OpenStreetMap.

### Minute 2:30 - 4:00: AI Route Optimization & Indian Constraint Engine
- **Presenter**: "Let's run our AI Route Planner. Powered by **Google OR-Tools VRPTW**, RouteMind doesn't just calculate shortest paths; it enforces hyper-local constraints:"
  1. **No-Truck Zone Restrictions**: Prohibiting heavy vehicles in commercial corridors like Indiranagar during 08:00-11:00 AM & 17:00-20:00 PM.
  2. **COD Safety Limits**: Capping cumulative cash per driver at ₹50,000 to prevent theft.
  3. **Vehicle Weight & Volume**: Matching Tata Ace EV and Bolero Pickup payload limits.
- **Action**: Click `Execute AI Optimization`. Show sub-second generation of 3 optimized vehicle manifests with precise ETAs and cost breakdowns.

### Minute 4:00 - 5:30: Live Dynamic Replanning (<30 Seconds) & Explainability
- **Presenter**: "Now, let's simulate a real-time disruption. An unexpected traffic jam gridlocks Indiranagar 100ft Road."
- **Action**: Click `Simulate Dynamic Replan` button on Live Map.
- **Result**: Show instant (<1 second) response. WebSocket broadcasts alert: `AI Replanning Proposal Generated`.
- **Explainability**: Open the **Supervisor Approval Modal**. Highlight:
  - **Before vs. After**: Original 48.5 km route re-sequenced to 42.1 km.
  - **Metrics Saved**: 6.4 km distance saved, 14 minutes time saved, ₹25.60 fuel saved.
  - **Natural Language Explanation**: Plain English narrative explaining *why* the AI re-ordered remaining stops using spatial nearest-neighbor heuristic.

### Minute 5:30 - 6:30: Supervisor Sign-Off & Driver Mobile View
- **Presenter**: "Human-in-the-loop control is vital for enterprise trust. The Fleet Supervisor reviews the proposal and clicks `Approve`."
- **Action**: Click `Approve & Update Driver Sequence`.
- **Driver View**: Switch to **Driver Mobile View**. Point out how Ramesh's mobile screen instantly receives the updated sequence, updated ETA, customer phone numbers, and Cash-on-Delivery collection badge.

### Minute 6:30 - 7:30: Algorithmic Benchmarks & Financial ROI
- **Presenter**: "How does RouteMind perform against baseline algorithms?"
- **Action**: Navigate to **Analytics & Benchmarks** page.
- **Benchmark Chart**:
  - **Greedy Baseline**: 185.0 km
  - **Nearest Neighbor**: 162.4 km
  - **Standard OR-Tools**: 142.9 km
  - **RouteMind AI**: **130.0 km (29.7% total cost savings vs baseline)**
- **Financial Impact**: Over a 50-vehicle fleet, RouteMind saves **₹1.8 Lakhs/month** in fuel and labor while reducing daily CO2 emissions by **18.5 kg**.

### Minute 7:30 - 8:00: Conclusion & Q&A
- **Presenter**: "RouteMind combines enterprise architecture, Google OR-Tools VRP, dynamic machine learning ETA models, and human-centric explainability. Thank you, and we welcome your questions!"
