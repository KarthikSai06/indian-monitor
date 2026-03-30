import React from 'react';

export default function SkeletonCard({ featured = false }) {
  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <div className={`skeleton ${featured ? 'h-48' : 'h-36'}`} />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-20 rounded ml-auto" />
        </div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-full rounded mt-1" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-6 w-20 rounded mt-1" />
      </div>
    </div>
  );
}
