import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

export function ConfettiTester() {
  const testConfetti = () => {
    console.log("🎊 TEST CONFETTI BUTTON CLICKED");
    
    // Test 1: Appel direct
    try {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
      console.log("✅ Confetti direct call successful");
    } catch (error) {
      console.error("❌ Confetti error:", error);
    }
    
    // Test 2: Via window
    if (window.confetti) {
      setTimeout(() => {
        window.confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 500);
    }
  };

  return (
    <Button 
      onClick={testConfetti}
      className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700"
    >
      🎊 Test Confettis
    </Button>
  );
}