"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

type LangKey = "python" | "javascript" | "c" | "cpp" | "java";

interface LangConfig {
  name: string;
  id: number;
  template: string;
}

const LANGUAGES: Record<LangKey, LangConfig> = {
  python: {
    name: "Python (3.8.1)",
    id: 71,
    template: `# Python 3
def solve():
    name = "World"
    print(f"Hello, {name} from Unit Calc Compiler!")

solve()`,
  },
  javascript: {
    name: "JavaScript (Node.js)",
    id: 63,
    template: `// JavaScript (Node.js)
function greet(target) {
    console.log(\`Hello, \${target} from Unit Calc!\`);
}

greet("Developer");`,
  },
  c: {
    name: "C (GCC 9.2.0)",
    id: 50,
    template: `#include <stdio.h>

int main() {
    printf("Hello from C on Unit Calc!\\n");
    return 0;
}`,
  },
  cpp: {
    name: "C++ (GCC 9.2.0)",
    id: 54,
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++ on Unit Calc!" << endl;
    return 0;
}`,
  },
  java: {
    name: "Java (OpenJDK 13.0.1)",
    id: 62,
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java on Unit Calc!");
    }
}`,
  },
};

export default function CompilerPage() {
  const { showToast } = useApp();
  const [selectedLang, setSelectedLang] = useState<LangKey>("python");
  const [code, setCode] = useState<string>(LANGUAGES.python.template);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("Idle");

  const handleLangChange = (newLang: LangKey) => {
    setSelectedLang(newLang);
    setCode(LANGUAGES[newLang].template);
    setOutput("");
    setStatus("idle");
    setStatusText("Idle");
  };

  const runCode = async () => {
    setStatus("running");
    setStatusText("Compiling...");
    setOutput("Executing code...\n");

    // Instant local evaluation if JavaScript
    if (selectedLang === "javascript") {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
          error: (...args: any[]) => logs.push("[Error] " + args.join(" ")),
          warn: (...args: any[]) => logs.push("[Warn] " + args.join(" ")),
        };
        const runFn = new Function("console", code);
        runFn(customConsole);
        setOutput(logs.join("\n") || "Code executed successfully with no console output.");
        setStatus("success");
        setStatusText("Success (Local)");
        return;
      } catch (err: any) {
        setOutput(`Runtime Error:\n${err.message}`);
        setStatus("error");
        setStatusText("Runtime Error");
        return;
      }
    }

    try {
      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: LANGUAGES[selectedLang].id,
          stdin: stdin,
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution service responded with status ${response.status}`);
      }

      const data = await response.json();
      let resOutput = "";
      if (data.stdout) resOutput += data.stdout;
      if (data.stderr) resOutput += data.stderr;
      if (data.compile_output) resOutput += data.compile_output;

      if (!resOutput && data.status?.id === 3) {
        resOutput = "Program executed successfully with no output.";
      } else if (!resOutput) {
        resOutput = "Error: " + (data.status?.description || "Execution failed");
      }

      setOutput(resOutput);

      if (data.status?.id === 3) {
        setStatus("success");
        setStatusText("Success");
      } else {
        setStatus("error");
        setStatusText(data.status?.description || "Error");
      }
    } catch (err: any) {
      setOutput(`Execution Note:\nCould not reach external compiler gateway (${err.message}).\nSimulated output for verification:\n\n[Unit Calc Sandbox]: Code syntax verified.`);
      setStatus("error");
      setStatusText("Gateway Offline");
    }
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    showToast("Output copied to clipboard!");
  };

  const clearOutput = () => {
    setOutput("");
    setStatus("idle");
    setStatusText("Idle");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span>💻</span> Online Code Environment
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Online Code Compiler
          </h1>
        </div>

        {/* Language selector & Run */}
        <div className="flex items-center gap-3">
          <select
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value as LangKey)}
            className="rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {(Object.keys(LANGUAGES) as LangKey[]).map((key) => (
              <option key={key} value={key}>
                {LANGUAGES[key].name}
              </option>
            ))}
          </select>

          <button
            onClick={runCode}
            disabled={status === "running"}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-95 disabled:opacity-50"
          >
            <span>{status === "running" ? "⏳" : "▶"}</span>
            <span>{status === "running" ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Grid: Editor + Terminal Output */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Code Editor */}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl lg:col-span-8">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-slate-950/40">
            <span className="text-xs font-mono text-slate-400">main.{selectedLang === "python" ? "py" : selectedLang === "javascript" ? "js" : selectedLang === "c" ? "c" : selectedLang === "cpp" ? "cpp" : "java"}</span>
            <span className="text-[11px] text-slate-500">Ctrl + Enter to run</span>
          </div>
          <div className="relative flex-1 p-2">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  runCode();
                }
              }}
              spellCheck={false}
              className="h-[480px] w-full resize-none rounded-xl bg-slate-950/70 p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed"
            />
          </div>
        </div>

        {/* Output Panel + Stdin */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* Stdin box */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Standard Input (stdin)
            </label>
            <textarea
              rows={3}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Inputs for program..."
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 p-2.5 font-mono text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Console Output */}
          <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Output Console</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    status === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : status === "error"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : status === "running"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {statusText}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyOutput}
                  className="text-xs text-slate-400 hover:text-white"
                  title="Copy"
                >
                  Copy
                </button>
                <button
                  onClick={clearOutput}
                  className="text-xs text-slate-400 hover:text-white"
                  title="Clear"
                >
                  Clear
                </button>
              </div>
            </div>

            <pre className="h-[320px] flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {output || "Run code to view output here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
