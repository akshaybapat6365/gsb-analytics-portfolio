"use client";

import React from "react";

type VizErrorBoundaryProps = {
  children: React.ReactNode;
  fallbackTitle: string;
  fallbackMessage: string;
  height: number;
};

type VizErrorBoundaryState = {
  hasError: boolean;
};

export class VizErrorBoundary extends React.Component<
  VizErrorBoundaryProps,
  VizErrorBoundaryState
> {
  state: VizErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): VizErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex items-center justify-center px-6 text-center"
        style={{ height: this.props.height }}
      >
        <div className="max-w-lg space-y-2 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {this.props.fallbackTitle}
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            {this.props.fallbackMessage}
          </p>
        </div>
      </div>
    );
  }
}
