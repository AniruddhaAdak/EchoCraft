import { Copyright } from "lucide-react";

export const AnimatedFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-50 to-purple-100 mt-12 py-6 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Copyright className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-purple-600">
              {new Date().getFullYear()} EchoCraft. All rights reserved.
            </p>
          </div>
          <p className="text-xs text-purple-500 text-center">
            Powered by AssemblyAI and OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
};