"use client";

import { useSyncExternalStore } from "react";

type RequestFeedbackState = {
  activeRequestCount: number;
  blockingCount: number;
};

const initialState: RequestFeedbackState = {
  activeRequestCount: 0,
  blockingCount: 0,
};

let state = initialState;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(partial: Partial<RequestFeedbackState>) {
  state = { ...state, ...partial };
  emitChange();
}

export function beginNetworkRequest() {
  setState({ activeRequestCount: state.activeRequestCount + 1 });
}

export function endNetworkRequest() {
  setState({ activeRequestCount: Math.max(0, state.activeRequestCount - 1) });
}

export function beginBlockingActivity() {
  setState({ blockingCount: state.blockingCount + 1 });
}

export function endBlockingActivity() {
  setState({ blockingCount: Math.max(0, state.blockingCount - 1) });
}

export function subscribeToRequestFeedback(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRequestFeedbackSnapshot() {
  return state;
}

export function useRequestFeedback() {
  return useSyncExternalStore(
    subscribeToRequestFeedback,
    getRequestFeedbackSnapshot,
    getRequestFeedbackSnapshot
  );
}
