---
name: testing-automation
description: High-velocity testing, test harness generation, unit, integration, and E2E verification using Vitest, Jest, Playwright, and Pytest. Use when ensuring bulletproof reliability and zero-regression code delivery.
---

# Testing & Quality Assurance Automation

Accelerated protocol for automated test harness creation, verification, and regression prevention.

## Core Protocols

1. **Test Strategy Selection**:
   - Unit Testing: Fast, isolated verification for utility functions, math algorithms, state reducers, and data transformers.
   - Component Testing: Testing UI components for correct rendering, event handling, and conditional states.
   - Integration & API Testing: Verifying end-to-end endpoints, status codes, payload structures, and error responses.
   - Browser E2E: Interactive user journeys via rowser_subagent or Playwright.

2. **Zero-Flake Test Design**:
   - Mock external network requests, third-party APIs, and non-deterministic time sources.
   - Use deterministic test fixtures and realistic synthetic mock data.
   - Avoid hardcoded timeouts; await explicit conditions or state transitions.

3. **Execution & Coverage**:
   - Run localized tests with single-file targeting to minimize runtime.
   - Ensure all edge cases (null inputs, boundary values, network failures, empty responses) are tested and accounted for.
