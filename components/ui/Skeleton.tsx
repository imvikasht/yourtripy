import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/50 dark:bg-gray-800/50 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
