// Test Scenarios for Joker Audit
export interface TestScenario {
  name: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
  checkpoints: string[];
}

export const JOKER_TEST_SCENARIOS: TestScenario[] = [
  {
    name: "S1: Wrong Answer → Joker Success",
    description: "User gives wrong answer, uses joker successfully",
    steps: [
      "1. Open a quiz with available jokers",
      "2. Enter wrong answer and submit",
      "3. Click 'Utiliser un joker' in confirmation modal",
      "4. Verify answer is revealed",
      "5. Click 'Valider avec Joker' to complete"
    ],
    expectedOutcome: "Single joker-reveal call (200), no additional validation calls, confetti on success",
    checkpoints: [
      "Only 1 POST /functions/v1/joker-reveal",
      "Response status: 200",
      "Response body contains: { answer: '...' }",
      "Authorization header present",
      "No validation calls after joker",
      "Success modal shows with confetti"
    ]
  },
  {
    name: "S2: Correct Answer Direct",
    description: "User gives correct answer immediately",
    steps: [
      "1. Open a quiz",
      "2. Enter correct answer",
      "3. Submit answer"
    ],
    expectedOutcome: "Single validation call, success modal with confetti, no joker calls",
    checkpoints: [
      "0 calls to joker-reveal",
      "1 validation call only", 
      "Success modal appears",
      "Confetti animation triggers"
    ]
  },
  {
    name: "S3: Joker Quota Exhausted",
    description: "User tries to use joker when quota is exhausted",
    steps: [
      "1. Use all available jokers for a book",
      "2. Open quiz and give wrong answer",
      "3. Try to use another joker"
    ],
    expectedOutcome: "joker-reveal returns 403, user-friendly error message, no validation created",
    checkpoints: [
      "joker-reveal call returns 403",
      "Error message: 'Plus aucun joker disponible'",
      "No validation record created",
      "No success modal or confetti"
    ]
  }
];

export function logTestScenario(scenario: TestScenario): void {
  console.group(`🧪 [TEST SCENARIO] ${scenario.name}`);
  
  console.log("📝 Description:", scenario.description);
  
  console.group("Steps:");
  scenario.steps.forEach(step => console.log(step));
  console.groupEnd();
  
  console.log("🎯 Expected Outcome:", scenario.expectedOutcome);
  
  console.group("Checkpoints:");
  scenario.checkpoints.forEach(checkpoint => console.log(`☐ ${checkpoint}`));
  console.groupEnd();
  
  console.log("⏰ After completing this scenario, run: window.__VREAD_DEBUG_DUMP__()");
  
  console.groupEnd();
}

export function logAllTestScenarios(): void {
  console.group("🧪 JOKER AUDIT TEST SCENARIOS");
  
  console.log("Run these scenarios in order, checking console/network after each:");
  console.log("");
  
  JOKER_TEST_SCENARIOS.forEach(scenario => {
    logTestScenario(scenario);
    console.log("");
  });
  
  console.log("🔍 After all scenarios:");
  console.log("1. Run window.__VREAD_FULL_AUDIT__()");
  console.log("2. Check for critical issues and proposed fixes");
  
  console.groupEnd();
}

// Expose to window
if (typeof window !== 'undefined') {
  (window as any).__VREAD_TEST_SCENARIOS__ = {
    logAll: logAllTestScenarios,
    logScenario: logTestScenario,
    scenarios: JOKER_TEST_SCENARIOS
  };
}