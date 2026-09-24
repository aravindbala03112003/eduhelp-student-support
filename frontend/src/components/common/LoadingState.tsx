import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 bg-card rounded-xl border border-border animate-pulse flex flex-col gap-3 shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 bg-muted rounded" />
            <div className="w-8 h-8 bg-muted rounded-lg" />
          </div>
          <div className="w-16 h-8 bg-muted rounded" />
          <div className="w-32 h-3 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-12 bg-muted/60 border-b border-border flex items-center px-4 gap-4">
        <div className="w-24 h-4 bg-muted rounded" />
        <div className="w-48 h-4 bg-muted rounded" />
        <div className="w-20 h-4 bg-muted rounded ml-auto" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 flex items-center px-4 gap-4">
            <div className="w-28 h-4 bg-muted rounded" />
            <div className="w-64 h-4 bg-muted rounded" />
            <div className="w-20 h-6 bg-muted rounded-full ml-auto" />
            <div className="w-24 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
