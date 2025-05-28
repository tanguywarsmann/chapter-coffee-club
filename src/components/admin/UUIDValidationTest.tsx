
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { 
  isValidUUID, 
  isValidUUIDAny, 
  isUuidV4, 
  generateUUID, 
  uuidSchema 
} from "@/utils/validation";
import { z } from "zod";

export function UUIDValidationTest() {
  const [testUuid, setTestUuid] = useState("");
  const [validationResults, setValidationResults] = useState<{
    isValidUUID: boolean;
    isValidUUIDAny: boolean;
    isUuidV4: boolean;
    zodValidation: { success: boolean; error?: string };
  } | null>(null);

  // Cas de test prédéfinis
  const testCases = [
    {
      name: "UUID v4 valide",
      value: "123e4567-e89b-12d3-a456-426614174000",
      expected: { valid: true }
    },
    {
      name: "UUID v4 généré",
      value: generateUUID(),
      expected: { valid: true }
    },
    {
      name: "UUID mal formé (caractères invalides)",
      value: "123e4567-e89b-12d3-a456-42661417400g",
      expected: { valid: false }
    },
    {
      name: "UUID trop court",
      value: "123e4567-e89b-12d3-a456",
      expected: { valid: false }
    },
    {
      name: "UUID avec mauvais tirets",
      value: "123e4567_e89b_12d3_a456_426614174000",
      expected: { valid: false }
    },
    {
      name: "Chaîne vide",
      value: "",
      expected: { valid: false }
    },
    {
      name: "UUID v1 (non v4)",
      value: "123e4567-e89b-12d3-a456-426614174000".replace('4', '1'),
      expected: { valid: false }
    }
  ];

  const validateUuid = (uuid: string) => {
    try {
      const zodResult = uuidSchema.safeParse(uuid);
      
      setValidationResults({
        isValidUUID: isValidUUID(uuid),
        isValidUUIDAny: isValidUUIDAny(uuid),
        isUuidV4: isUuidV4(uuid),
        zodValidation: {
          success: zodResult.success,
          error: zodResult.success ? undefined : zodResult.error.issues[0]?.message
        }
      });
    } catch (error) {
      setValidationResults({
        isValidUUID: false,
        isValidUUIDAny: false,
        isUuidV4: false,
        zodValidation: {
          success: false,
          error: "Erreur lors de la validation"
        }
      });
    }
  };

  const generateNewUuid = () => {
    const newUuid = generateUUID();
    setTestUuid(newUuid);
    validateUuid(newUuid);
  };

  const runTestCase = (testCase: typeof testCases[0]) => {
    setTestUuid(testCase.value);
    validateUuid(testCase.value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Test de validation UUID
          </CardTitle>
          <CardDescription>
            Testez les validations UUID pour s'assurer qu'aucun UUID malformé ne peut être enregistré
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Générateur d'UUID */}
          <div className="flex gap-2">
            <Button onClick={generateNewUuid} variant="outline">
              Générer un UUID v4 valide
            </Button>
          </div>

          {/* Input de test */}
          <div className="space-y-2">
            <label htmlFor="uuid-test" className="text-sm font-medium">
              UUID à tester :
            </label>
            <div className="flex gap-2">
              <Input
                id="uuid-test"
                value={testUuid}
                onChange={(e) => setTestUuid(e.target.value)}
                placeholder="Entrez un UUID à valider..."
                className="flex-1"
              />
              <Button onClick={() => validateUuid(testUuid)}>
                Valider
              </Button>
            </div>
          </div>

          {/* Résultats de validation */}
          {validationResults && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Résultats de validation :</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {validationResults.isValidUUID ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">isValidUUID</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {validationResults.isValidUUIDAny ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">isValidUUIDAny</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {validationResults.isUuidV4 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">isUuidV4</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {validationResults.zodValidation.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Zod Schema</span>
                </div>
              </div>

              {validationResults.zodValidation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erreur Zod : {validationResults.zodValidation.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cas de test prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle>Cas de test prédéfinis</CardTitle>
          <CardDescription>
            Cliquez sur un cas de test pour le charger et voir les résultats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {testCases.map((testCase, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{testCase.name}</span>
                  <Badge variant={testCase.expected.valid ? "default" : "destructive"}>
                    {testCase.expected.valid ? "Valide" : "Invalide"}
                  </Badge>
                </div>
                <code className="text-xs bg-muted p-1 rounded block mb-2 break-all">
                  {testCase.value || "(vide)"}
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => runTestCase(testCase)}
                  className="w-full"
                >
                  Tester
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
