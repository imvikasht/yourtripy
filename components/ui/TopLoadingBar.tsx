import React, { useEffect, useState } from 'react';

const TopLoadingBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress at 15% immediately
    const initialTimer = setTimeout(() => setProgress(15), 50);
    
    // Gradually increase up to 90%
    const intervalTimer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          clearInterval(intervalTimer);
          return 90;
        }
        // Increment by a random amount to make it feel NProgress-like
        const increment = Math.random() * 5 + 2; 
        return oldProgress + increment;
      });
    }, 300);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none bg-brand-deep/20 backdrop-blur-[1px]">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-[101]">
        <div 
          className="h-1 bg-brand-primary shadow-[0_0_15px_#FACC15] transition-all duration-300 ease-out rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Centered Optional Loading Indicator */}
      <div className="hidden sm:flex flex-1 items-center justify-center">
         <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shadow-[0_0_15px_rgba(250,204,21,0.3)]"></div>
      </div>
    </div>
  );
};

export default TopLoadingBar;
