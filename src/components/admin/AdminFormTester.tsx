
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, TestTube, AlertTriangle } from "lucide-react";
import { 
  isValidUUID, 
  isValidUUIDAny, 
  isUuidV4, 
  generateUUID, 
  uuidTestCases,
  addBookSchema,
  addQuestionSchema,
  bookMetadataSchema
} from "@/utils/validation";
import { z } from "zod";

interface ValidationResult {
  isValidUUID: boolean;
  isValidUUIDAny: boolean;
  isUuidV4: boolean;
  zodValidation: { success: boolean; error?: string };
}

interface FormTestResult {
  schema: string;
  data: any;
  success: boolean;
  errors: string[];
}

export function AdminFormTester() {
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [formTestResults, setFormTestResults] = useState<FormTestResult[]>([]);

  // Test UUID validation avec tous les cas de test
  const testAllUUIDs = () => {
    const results = uuidTestCases.map(testCase => {
      const zodResult = z.string().refine(isUuidV4, { message: "UUID invalide" }).safeParse(testCase.value);
      
      return {
        ...testCase,
        results: {
          isValidUUID: isValidUUID(testCase.value),
          isValidUUIDAny: isValidUUIDAny(testCase.value),
          isUuidV4: isUuidV4(testCase.value),
          zodValidation: {
            success: zodResult.success,
            error: zodResult.success ? undefined : zodResult.error.issues[0]?.message
          }
        }
      };
    });

    console.log("Résultats des tests UUID:", results);
    return results;
  };

  // Test des schémas de formulaires avec des données valides et invalides
  const testFormSchemas = () => {
    const testResults: FormTestResult[] = [];

    // Test du schéma addBookSchema
    const bookTestCases = [
      {
        name: "Livre valide",
        data: {
          title: "Test Book",
          author: "Test Author",
          total_pages: 300,
          description: "Une description valide",
          cover_url: "https://example.com/cover.jpg",
          is_published: true
        },
        expectedValid: true
      },
      {
        name: "Livre sans titre",
        data: {
          title: "",
          author: "Test Author",
          total_pages: 300,
          is_published: true
        },
        expectedValid: false
      },
      {
        name: "Livre avec pages négatives",
        data: {
          title: "Test Book",
          author: "Test Author",
          total_pages: -10,
          is_published: true
        },
        expectedValid: false
      }
    ];

    bookTestCases.forEach(testCase => {
      const result = addBookSchema.safeParse(testCase.data);
      testResults.push({
        schema: `addBookSchema - ${testCase.name}`,
        data: testCase.data,
        success: result.success,
        errors: result.success ? [] : result.error.issues.map(issue => issue.message)
      });
    });

    // Test du schéma addQuestionSchema
    const questionTestCases = [
      {
        name: "Question valide",
        data: {
          book_slug: "test-book",
          segment: 1,
          question: "Quelle est la couleur du ciel ?",
          answer: "bleu"
        },
        expectedValid: true
      },
      {
        name: "Question avec réponse multiple",
        data: {
          book_slug: "test-book",
          segment: 1,
          question: "Quelle est la couleur du ciel ?",
          answer: "bleu clair"
        },
        expectedValid: false
      },
      {
        name: "Question avec segment négatif",
        data: {
          book_slug: "test-book",
          segment: -1,
          question: "Test question",
          answer: "test"
        },
        expectedValid: false
      }
    ];

    questionTestCases.forEach(testCase => {
      const result = addQuestionSchema.safeParse(testCase.data);
      testResults.push({
        schema: `addQuestionSchema - ${testCase.name}`,
        data: testCase.data,
        success: result.success,
        errors: result.success ? [] : result.error.issues.map(issue => issue.message)
      });
    });

    // Test du schéma bookMetadataSchema
    const metadataTestCases = [
      {
        name: "Métadonnées valides",
        data: {
          total_pages: 250,
          description: "Description mise à jour",
          is_published: false
        },
        expectedValid: true
      },
      {
        name: "Métadonnées avec pages nulles",
        data: {
          total_pages: 0,
          description: "Test",
          is_published: true
        },
        expectedValid: false
      }
    ];

    metadataTestCases.forEach(testCase => {
      const result = bookMetadataSchema.safeParse(testCase.data);
      testResults.push({
        schema: `bookMetadataSchema - ${testCase.name}`,
        data: testCase.data,
        success: result.success,
        errors: result.success ? [] : result.error.issues.map(issue => issue.message)
      });
    });

    setFormTestResults(testResults);
    console.log("Résultats des tests de formulaires:", testResults);
  };

  // Test de génération d'UUID et validation immédiate
  const testUUIDGeneration = () => {
    const generatedUUIDs = Array.from({ length: 10 }, () => generateUUID());
    const validationResults = generatedUUIDs.map(uuid => ({
      uuid,
      isValid: isUuidV4(uuid),
      isValidAny: isValidUUIDAny(uuid)
    }));

    console.log("UUIDs générés et leurs validations:", validationResults);
    return validationResults;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testeur de formulaires admin
          </CardTitle>
          <CardDescription>
            Testez la validation UUID et les schémas Zod dans tous les formulaires admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="uuid-tests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="uuid-tests">Tests UUID</TabsTrigger>
              <TabsTrigger value="form-schemas">Schémas Formulaires</TabsTrigger>
              <TabsTrigger value="generation">Génération UUID</TabsTrigger>
            </TabsList>

            <TabsContent value="uuid-tests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tests de validation UUID</h3>
                <Button onClick={testAllUUIDs}>
                  Exécuter tous les tests UUID
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uuidTestCases.map((testCase, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{testCase.name}</span>
                      <Badge variant={testCase.expected.valid ? "default" : "destructive"}>
                        {testCase.expected.valid ? "Devrait être valide" : "Devrait être invalide"}
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {testCase.value || "(vide)"}
                    </code>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {isUuidV4(testCase.value) ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>isUuidV4: {isUuidV4(testCase.value) ? "✓" : "✗"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {isValidUUIDAny(testCase.value) ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>isValidUUIDAny: {isValidUUIDAny(testCase.value) ? "✓" : "✗"}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="form-schemas" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tests des schémas de formulaires</h3>
                <Button onClick={testFormSchemas}>
                  Tester tous les schémas
                </Button>
              </div>

              {formTestResults.length > 0 && (
                <div className="space-y-3">
                  {formTestResults.map((result, index) => (
                    <Card key={index} className={`p-4 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{result.schema}</span>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Valide" : "Invalide"}
                        </Badge>
                      </div>
                      
                      <div className="text-xs bg-muted p-2 rounded mb-2">
                        <strong>Données testées:</strong>
                        <pre className="mt-1">{JSON.stringify(result.data, null, 2)}</pre>
                      </div>

                      {!result.success && result.errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Erreurs:</strong>
                            <ul className="mt-1 list-disc list-inside">
                              {result.errors.map((error, errorIndex) => (
                                <li key={errorIndex}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="generation" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Test de génération d'UUID</h3>
                <Button onClick={testUUIDGeneration}>
                  Générer et tester 10 UUIDs
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ce test génère plusieurs UUIDs v4 et vérifie immédiatement leur validité.
                  Tous devraient être valides si la fonction generateUUID() fonctionne correctement.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
