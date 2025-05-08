import React from 'react';
import { FileText } from 'lucide-react';

const AppLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-7 w-7 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">
        Resume<span className="text-primary">Mate</span>
      </h1>
    </div>
  );
};

export default AppLogo;
