"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, getDocs, query, limit, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, Database, CheckCircle2, XCircle } from "lucide-react";

export default function TestFirebasePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [firestoreStatus, setFirestoreStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testData, setTestData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const testAuth = async () => {
    setAuthStatus("loading");
    try {
      await signInAnonymously(auth);
      setAuthStatus("success");
      toast.success("Auth: Signed in anonymously!");
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthStatus("error");
      toast.error(`Auth Error: ${error.message}`);
    }
  };

  const testFirestore = async () => {
    if (!user) {
      toast.error("Please sign in first!");
      return;
    }
    setFirestoreStatus("loading");
    try {
      // Write test
      const docRef = await addDoc(collection(db, "test_connections"), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        message: "Firebase test from FlexiStudy-Web",
      });
      console.log("Document written with ID: ", docRef.id);

      // Read test
      const q = query(collection(db, "test_connections"), limit(1));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setTestData(data);
      setFirestoreStatus("success");
      toast.success("Firestore: Read/Write successful!");
    } catch (error: any) {
      console.error("Firestore error:", error);
      setFirestoreStatus("error");
      toast.error(`Firestore Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-20 mx-auto px-4">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Firebase Integration Test</h1>
          <p className="text-muted-foreground mt-2">Verify Auth and Firestore connectivity in real-time.</p>
        </div>

        <div className="grid gap-6">
          {/* Auth Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                Firebase Authentication
              </CardTitle>
              <CardDescription>Test anonymous sign-in functionality.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium">
                  Status: {user ? <span className="text-green-600 font-bold uppercase">Logged In</span> : <span className="text-gray-500">Not Authenticated</span>}
                </div>
                {user && <div className="text-[10px] font-mono text-muted-foreground">UID: {user.uid.substring(0, 10)}...</div>}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testAuth} 
                disabled={authStatus === "loading" || !!user}
                className="w-full"
              >
                {authStatus === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {user ? "Authenticated" : "Sign In Anonymously"}
                {authStatus === "success" && <CheckCircle2 className="ml-2 w-4 h-4" />}
                {authStatus === "error" && <XCircle className="ml-2 w-4 h-4" />}
              </Button>
            </CardFooter>
          </Card>

          {/* Firestore Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                Cloud Firestore
              </CardTitle>
              <CardDescription>Test Write/Read operations to the database.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium">
                  Connection: {firestoreStatus === "success" ? <span className="text-green-600 font-bold uppercase">Success</span> : <span className="text-gray-500 italic">Pending test...</span>}
                </div>
              </div>
              {testData.length > 0 && (
                <div className="p-3 border rounded-md bg-background text-[11px] font-mono">
                  <div className="font-bold text-xs mb-1">Latest Test Doc:</div>
                  <pre>{JSON.stringify(testData[0], null, 2)}</pre>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testFirestore} 
                variant="secondary"
                disabled={firestoreStatus === "loading" || !user}
                className="w-full"
              >
                {firestoreStatus === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Run Write/Read Test
                {firestoreStatus === "success" && <CheckCircle2 className="ml-2 w-4 h-4" />}
                {firestoreStatus === "error" && <XCircle className="ml-2 w-4 h-4" />}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
