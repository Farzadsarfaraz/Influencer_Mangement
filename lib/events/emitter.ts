import "server-only";

import { EventEmitter } from "node:events";
import { after } from "next/server";

import type { DomainEvent } from "@/lib/events/types";

const bus = new EventEmitter();
bus.setMaxListeners(50);

/**
 * Subscribes a handler to a domain event type. Registered once, at server
 * boot, via instrumentation.ts. Handlers own their own error handling —
 * a thrown/rejected handler never propagates back to the action that
 * emitted the event.
 */
export function onDomainEvent<T extends DomainEvent["type"]>(
  type: T,
  handler: (event: Extract<DomainEvent, { type: T }>) => Promise<void>,
) {
  bus.on(type, (event: Extract<DomainEvent, { type: T }>) => {
    handler(event).catch((error: unknown) => {
      console.error(`[domain-event] handler for "${type}" failed`, error);
    });
  });
}

/**
 * Called from Server Actions right after a mutation commits. Dispatch is
 * deferred via `after()` so notification writes and email enqueueing never
 * add latency to the action's response — see docs/ARCHITECTURE.md §7.
 */
export function emitDomainEvent(event: DomainEvent) {
  after(() => {
    bus.emit(event.type, event);
  });
}
