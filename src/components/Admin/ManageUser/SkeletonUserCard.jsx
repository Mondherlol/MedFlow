import React from 'react';

/**
 * Skeleton placeholder that mirrors the layout of UserCard.jsx
 * Supports two variants: 'tile' (default) and 'line' (compact list).
 */
export default function SkeletonUserCard({ variant = 'tile' }) {
  if (variant === 'line') {
    return (
      <div className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="ml-2 h-5 w-20 rounded bg-slate-200" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="h-3 w-40 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-200" />
            <div className="h-8 w-8 rounded-lg bg-slate-200" />
            <div className="h-8 w-8 rounded-lg bg-red-200" />
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1">
          <div className="h-3 w-48 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  // tile variant (card)
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="flex flex-col">
            <div className="h-4 w-40 rounded bg-slate-200 mb-1" />
            <div className="h-3 w-36 rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-6 w-24 rounded bg-slate-200" />
      </div>

      <div className="px-4 pb-3">
        <div className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs">
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
        <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1">
          <div className="h-3 w-52 rounded bg-slate-200" />
        </div>
      </div>

      {/* footer actions */}
      <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-end gap-2 bg-white">
        <div className="h-9 w-24 rounded-lg bg-slate-200" />
        <div className="h-9 w-18 rounded-lg bg-slate-200" />
        <div className="h-9 w-28 rounded-lg bg-red-200" />
      </div>

      {/* soft glow */}
      <span className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl" />
    </div>
  );
}
