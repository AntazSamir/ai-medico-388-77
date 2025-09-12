import { useMemo } from "react";
import { Activity, FileText, HeartPulse, Microscope, Stethoscope } from "lucide-react";

interface AnalyzerLoaderProps {
  progress?: number; // 0-100
  stage?: string;
  subtle?: boolean;
}

export default function AnalyzerLoader({ progress = 0, stage, subtle = false }: AnalyzerLoaderProps) {
  const message = useMemo(() => {
    if (progress < 25) return stage || "Preparing secure analysis";
    if (progress < 50) return stage || "Reading and enhancing document";
    if (progress < 75) return stage || "Extracting key medical data";
    if (progress < 95) return stage || "Verifying and structuring results";
    return stage || "Finalizing";
  }, [progress, stage]);

  return (
    <div className={`analyzer-loader ${subtle ? "analyzer-loader--subtle" : ""}`}>
      <div className="analyzer-loader__visual">
        <div className="scan-orbit">
          <div className="scan-orbit__ring"></div>
          <div className="scan-orbit__ring scan-orbit__ring--delay"></div>
          <div className="scan-orbit__pulse"></div>
        </div>

        <div className="doc-scan">
          <div className="doc-scan__card">
            <div className="doc-scan__line doc-scan__line--1" />
            <div className="doc-scan__line doc-scan__line--2" />
            <div className="doc-scan__line doc-scan__line--3" />
            <div className="doc-scan__beam" />
          </div>
        </div>

        <div className="icon-seq">
          <div className="icon-seq__item"><Stethoscope className="icon-seq__svg" /></div>
          <div className="icon-seq__item"><Microscope className="icon-seq__svg" /></div>
          <div className="icon-seq__item"><Activity className="icon-seq__svg" /></div>
          <div className="icon-seq__item"><HeartPulse className="icon-seq__svg" /></div>
          <div className="icon-seq__item"><FileText className="icon-seq__svg" /></div>
        </div>
      </div>

      <div className="analyzer-loader__meta">
        <div className="analyzer-loader__progress">
          <div className="analyzer-loader__bar" style={{ width: `${Math.max(5, Math.min(100, progress))}%` }} />
        </div>
        <div className="analyzer-loader__labels">
          <span className="analyzer-loader__message">{message}</span>
          <span className="analyzer-loader__percent" aria-live="polite">{Math.round(progress)}%</span>
        </div>
        <p className="analyzer-loader__note">Securely analyzing your report. This won’t be shared.</p>
      </div>
    </div>
  );
}


