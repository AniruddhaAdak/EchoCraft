import { Copyright } from "lucide-react";

export const AnimatedFooter = () => {
  return (
    <footer className="mt-12 border-t border-white/40 bg-gradient-to-r from-fuchsia-50 via-white to-sky-50 py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Copyright className="h-4 w-4 text-fuchsia-600" />
            <p className="text-sm text-fuchsia-700">
              {new Date().getFullYear()} EchoCraft. All rights reserved.
            </p>
          </div>
          <p className="max-w-xl text-center text-xs text-slate-500">
            Powered by AssemblyAI and Gemini. Built for creators who want to turn spoken ideas into polished content faster.
          </p>
        </div>
      </div>
    </footer>
  );
};