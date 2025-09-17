// Debug instrumentation - Patch console + fetch pour tracer le flux Joker/Validation
let installed = (window as any).__VREAD_DEBUG_INSTALLED__;
if (!installed) {
  (window as any).__VREAD_DEBUG_INSTALLED__ = true;
  console.info("[DEBUG] 🔍 Console/Network instrumentation active");

  const logs: any[] = [];
  const push = (t: string, ...args: any[]) => {
    logs.push({ t, ts: new Date().toISOString(), args });
    // garde l'affichage normal
    (console as any)[t]?.apply(console, args);
  };

  ["log","info","warn","error"].forEach(k => {
    const orig = (console as any)[k];
    (console as any)[k] = (...args: any[]) => { push(k, ...args); return orig.apply(console, args); };
  });

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : (input as any).url ?? String(input);
    const isEdge = /\/functions\/v1\/joker-reveal/.test(url);
    const isValidation = /\/rest\/v1\/rpc\//.test(url) || /validate.*segment/.test(url);
    const startedAt = performance.now();
    
    try {
      const res = await origFetch(input as any, init);
      
      if (isEdge || isValidation) {
        const clone = res.clone();
        let body: any = null;
        try { body = await clone.json(); } catch {}
        
        const logData = {
          method: (init?.method ?? "GET"),
          status: res.status,
          headers: Object.fromEntries((init?.headers ? new Headers(init.headers) : new Headers()).entries()),
          requestBody: init?.body ? JSON.parse(init.body as string) : null,
          responseBody: body,
          duration_ms: Math.round(performance.now() - startedAt),
        };
        
        if (isEdge) {
          push("info", "[NET] joker-reveal", logData);
        } else if (isValidation) {
          push("info", "[NET] validation-call", logData);
        }
      }
      return res;
    } catch (e) {
      if (isEdge) push("error", "[NET] joker-reveal FAILED", { error: String(e) });
      if (isValidation) push("error", "[NET] validation FAILED", { error: String(e) });
      throw e;
    }
  };

  (window as any).__VREAD_DEBUG_DUMP__ = () => {
    const dump = { when: new Date().toISOString(), logs };
    console.info("[DEBUG-DUMP]", dump);
    return dump;
  };

  // Helper to analyze joker flow
  (window as any).__VREAD_DEBUG_ANALYZE__ = () => {
    const jokerCalls = logs.filter(l => l.args[0]?.includes?.("joker-reveal"));
    const validationCalls = logs.filter(l => l.args[0]?.includes?.("validation") || l.args[0]?.includes?.("validate"));
    
    console.group("[JOKER FLOW ANALYSIS]");
    console.log("Joker calls:", jokerCalls.length);
    console.log("Validation calls:", validationCalls.length);
    
    if (jokerCalls.length > 1) {
      console.warn("⚠️ MULTIPLE JOKER CALLS DETECTED");
    }
    
    // Detect validation calls after joker calls
    let doubleValidationDetected = false;
    jokerCalls.forEach((jokerCall, i) => {
      const jokerTime = new Date(jokerCall.ts).getTime();
      const followingValidations = validationCalls.filter(valCall => {
        const valTime = new Date(valCall.ts).getTime();
        return valTime > jokerTime && valTime - jokerTime < 5000; // Within 5 seconds
      });
      
      if (followingValidations.length > 0) {
        console.warn(`⚠️ DOUBLE VALIDATION DETECTED after joker call ${i + 1}`);
        doubleValidationDetected = true;
      }
      
      console.log(`Joker call ${i + 1}:`, jokerCall.args[1]);
    });
    
    validationCalls.forEach((call, i) => {
      console.log(`Validation call ${i + 1}:`, call.args[1]);
    });
    
    console.groupEnd();
    
    return { jokerCalls, validationCalls, doubleValidationDetected };
  };

  // Import audit report generator and test scenarios
  Promise.all([
    import("@/debug/auditReport").then(({ runJokerAudit }) => {
      (window as any).__VREAD_FULL_AUDIT__ = runJokerAudit;
      return "audit";
    }),
    import("@/debug/testScenarios").then(({ logAllTestScenarios }) => {
      (window as any).__VREAD_TEST_SCENARIOS__ = logAllTestScenarios;
      return "scenarios";
    })
  ]).then(loaded => {
    console.info("[DEBUG] 📊 Available functions:");
    console.info("• window.__VREAD_DEBUG_DUMP__() - Get collected logs");
    console.info("• window.__VREAD_DEBUG_ANALYZE__() - Analyze joker flow");
    console.info("• window.__VREAD_FULL_AUDIT__() - Run complete audit");
    console.info("• window.__VREAD_TEST_SCENARIOS__() - Show test scenarios");
  }).catch(e => {
    console.warn("[DEBUG] Some debug modules not available:", e);
  });
}