# Development & Documentation Protocol 

> **Purpose**: To provide a repeatable, context-aware workflow for providing comprehensive context for a software development agent. 

## Core Principle: No Task Without a Ticket  
No code modification shall be initiated without a corresponding artifact in the `/tasks` directory.

**Commit Message Format**: When revising an Implementation Plan, use commit messages like  
`FT-42-plan-revision-1: reason-for-change` to preserve traceability.

## Workflow Selection
Upon receiving a request, first classify it:
1.  **Major Feature / Complex Task**: Follow the **Standard Protocol**, which generates a complete **Task Package**.
2.  **Minor Fix / Tweak**: Follow the **Lightweight Protocol**, which generates a single **Fix Ticket**.

---

### 2. Standard Protocol (Major Features)

This protocol is for substantial work that requires architectural consideration and detailed planning. It produces a `Task Package`—a dedicated directory containing all necessary artifacts for the task.

-  **Stage 0: Directory**. Create a directory called as a fueature name (includes short name, a ticker, that will apply for corrsponding tasks) in the project in the folder 'features' 
-   **Stage 1: Request**. Create an Request in `tasks/features/{ticker-feature_name}/` (`ticker` is a short form of the feature_name by analogy with the stock exchange, usually doesn't contain any numbers). The Request focuses on the "what" and "why", not the technical implementation. Await user approval.
-   **Stage 2: Implementation Plan**. Create a plan in `tasks/features/{ticker-feature_name}/`. The plan MUST include:
    1.  Architectural Analysis (cross-reference existing docs as mandated by `architecture-analysis.mdc`).
    2.  List of tasks. The boundry of the task should be designed such that the requestor could test the application and check the correctness.
    3.  A "Documentation Impact" section listing all `/docs` files to be updated upon completion AND a separate task in this section for updating the documentation.
    Await user approval.
-   **Stage 3: Execution & Logging**.  
    Execute one task at a time. Await user validation after each task unless the user explicitly enables Batch approval mode for this stage.  
    - Pause immediately upon deviation discovery. Classify as Minor or Significant.  
    - Edit this Implementation Plan in place (update task list, architectural analysis, documentation impact). Seek user re-approval before resuming.
-   **Stage 4: Finalization**.  
    After all tasks are complete, update all documents listed in the "Documentation Impact" section of the plan according to a corresponding task.  
    Then, update `CHANGELOG.md`—record only the completed sub-tasks; cancelled items are visible via Git history.

### Lightweight Protocol (Bug Fixes)

1.  **Create Fix Ticket**: Create a single markdown file in `tasks/fixes/BUG-ID-short-description.md`.  
2.  **Content**: The ticket must contain: (1) Problem Description, (2) Root Cause Analysis, (3.1) Proposed Fix.  
3.  **Await Approval**: Get user approval for the proposed fix.  
4.  **Deviation Handling**: If a deviation occurs during fix implementation, update the same Fix Ticket to reflect the new understanding and obtain re-approval.  
5.  **Update Changelog**: Append a new line to `CHANGELOG.md` with status ✅ and a concise result comment.
   
