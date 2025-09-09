import React, { useState } from "react";
import { quickSenderTest } from "../utils/emailSenderTest";

const EmailDebug: React.FC = () => {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runTest = async (): Promise<void> => {
    setIsRunning(true);
    setOutput("Running sender test...\n");
    try {
      const logLines: string[] = [];
      const originalLog = console.log;
      console.log = (...args: unknown[]): void => {
        logLines.push(args.map(String).join(" "));
        originalLog(...args);
      };

      try {
        await quickSenderTest();
      } finally {
        console.log = originalLog;
      }

      setOutput((prev) => prev + logLines.join("\n"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput((prev) => prev + `\nError: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>Email Debug</h1>
      <p>Run a built-in test that signs up a temporary user to trigger a confirmation email.</p>
      <button onClick={runTest} disabled={isRunning}>
        {isRunning ? "Testing..." : "Run Sender Test"}
      </button>
      <pre style={{ marginTop: 16, padding: 12, background: "#111827", color: "#e5e7eb", borderRadius: 6, whiteSpace: "pre-wrap" }}>
        {output || "Output will appear here..."}
      </pre>
      <p style={{ marginTop: 12 }}>
        After running, check the inbox of the printed test email and Spam folder.
      </p>
    </div>
  );
};

export default EmailDebug;


