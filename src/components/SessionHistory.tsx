import { History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryEntry } from "@/utils/historyUtils";

interface SessionHistoryProps {
  entries: HistoryEntry[];
  onLoadEntry: (entry: HistoryEntry) => void;
}

export const SessionHistory = ({ entries, onLoadEntry }: SessionHistoryProps) => {
  return (
    <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <History className="h-5 w-5 text-fuchsia-600" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-fuchsia-200 bg-fuchsia-50/70 p-4 text-sm text-slate-600">
            Your recent transcripts will appear here after the first successful run.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onLoadEntry(entry)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{entry.fileName}</p>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-slate-600">{entry.transcript}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-fuchsia-700">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Load this session
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
