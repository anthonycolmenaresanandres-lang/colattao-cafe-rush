import { validateMenu, type EditableItem, type MenuDocument, type OwnerRole } from "./menu-model";
import type { RecoveryDraft } from "./draft-recovery";

export type DraftResult = { ok: true; revision: number; version: number | null } | { ok: false; error: string; reloadRequired?: boolean };
export type MenuOperation = "save" | "publish" | "restore";
export type MenuMutation = (operation: MenuOperation, revision: number, content?: unknown, restoreVersion?: number) => Promise<DraftResult>;
export type Scheduler = (callback: () => void, delay: number) => () => void;
const schedule: Scheduler = (callback, delay) => { const timer = setTimeout(callback, delay); return () => clearTimeout(timer); };

export type DraftState = {
  menu: MenuDocument; savedJson: string; revision: number; version: number | null;
  dirty: boolean; phase: "idle" | MenuOperation; blocked: boolean; paused: boolean;
  status: string; recovery: RecoveryDraft | null; storageWarning: boolean;
};

/** UI-independent state machine: one request at a time, with testable clocks/failures. */
export class DraftController {
  private state: DraftState;
  private readonly initial: DraftState;
  private listeners = new Set<() => void>();
  private cancelSave?: () => void;
  private active = false;

  constructor(
    initial: { menu: MenuDocument; revision: number; publishedVersion: number | null; role: OwnerRole; publicEnabled: boolean },
    private mutate: MenuMutation,
    private clock: Scheduler = schedule,
  ) {
    this.role = initial.role;
    this.publicEnabled = initial.publicEnabled;
    this.state = { menu: structuredClone(initial.menu), savedJson: JSON.stringify(initial.menu), revision: initial.revision, version: initial.publishedVersion, dirty: false, phase: "idle", blocked: false, paused: false, status: "Saved draft loaded. Changes autosave privately; publishing is always your choice.", recovery: null, storageWarning: false };
    this.initial = this.state;
  }
  private role: OwnerRole;
  private publicEnabled: boolean;
  getSnapshot = () => this.state;
  getServerSnapshot = () => this.initial;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  activate() { this.active = true; this.queue(); }
  suspend() { this.active = false; this.cancelSave?.(); }
  private update(patch: Partial<DraftState>) {
    this.state = { ...this.state, ...patch };
    this.state.dirty = JSON.stringify(this.state.menu) !== this.state.savedJson;
    for (const listener of this.listeners) listener();
  }
  private queue() {
    this.cancelSave?.();
    if (!this.active || !this.state.dirty || this.state.phase !== "idle" || this.state.blocked || this.state.paused || this.state.recovery || this.role === "viewer") return;
    this.cancelSave = this.clock(() => { void this.run("save"); }, 1200);
  }
  editItem(id: string, changes: Partial<EditableItem>) {
    if (this.role === "viewer" || this.state.blocked || this.state.recovery || !["idle", "save"].includes(this.state.phase)) return;
    const menu = { ...this.state.menu, categories: this.state.menu.categories.map((category) => ({ ...category, items: category.items.map((item) => item.id === id ? { ...item, ...changes } : item) })) };
    this.update({ menu, paused: false, status: this.state.phase === "save" ? "Saving an earlier edit. Your latest typing will save next." : "Unsaved changes. Autosave starts after you pause typing." });
    this.queue();
  }
  offerRecovery(recovery: RecoveryDraft | null) {
    if (this.state.dirty || this.state.phase !== "idle") return;
    if (recovery && JSON.stringify(recovery.menu) !== this.state.savedJson) {
      this.cancelSave?.();
      this.update({ recovery, status: "Interrupted edits found in this tab. Review them before continuing." });
    }
  }
  recover() {
    const recovery = this.state.recovery;
    if (!recovery || recovery.revision !== this.state.revision || this.role === "viewer" || this.state.phase !== "idle" || this.state.blocked) return false;
    this.update({ menu: structuredClone(recovery.menu), recovery: null, paused: false, status: "Recovered edits loaded. They will autosave as a private draft." });
    this.queue();
    return true;
  }
  discardRecovery() { this.update({ recovery: null, status: "Continuing with the saved server draft." }); }
  storageFailed() { if (!this.state.storageWarning) this.update({ storageWarning: true }); }

  async run(operation: MenuOperation, restoreVersion?: number): Promise<boolean> {
    if (this.state.phase !== "idle" || this.state.blocked || this.state.recovery || this.role === "viewer" || (operation !== "save" && (this.role !== "owner" || this.state.dirty))) return false;
    if (operation === "save" && !this.state.dirty) return false;
    this.cancelSave?.();
    const snapshot = structuredClone(this.state.menu);
    if (operation === "save") {
      try { validateMenu(snapshot); } catch (error) {
        this.update({ paused: true, status: error instanceof Error ? error.message : "Check your menu fields." });
        return false;
      }
    }
    this.update({ phase: operation, paused: false, status: operation === "save" ? "Saving your private draft…" : "Confirming publication…" });
    let cancelTimeout: (() => void) | undefined;
    try {
      const timeout = new Promise<DraftResult>((resolve) => {
        cancelTimeout = this.clock(() => resolve({ ok: false, reloadRequired: true, error: "The server has not confirmed the change. Your edits are still here. Reload to check the saved version before retrying." }), 30_000);
      });
      const result = await Promise.race([this.mutate(operation, this.state.revision, operation === "save" ? snapshot : undefined, restoreVersion), timeout]);
      if (!result.ok) {
        this.update({ phase: "idle", paused: true, blocked: result.reloadRequired === true, status: result.error });
        return false;
      }
      if (!Number.isSafeInteger(result.revision) || result.revision <= this.state.revision || !(result.version === null || (Number.isSafeInteger(result.version) && result.version > 0))) throw new Error("Invalid acknowledgement");
      this.update({ revision: result.revision, version: result.version, savedJson: JSON.stringify(snapshot), phase: "idle", status: operation === "save" ? "Draft saved. Customers still see the published menu." : this.publicEnabled ? `Publication ${result.version} saved. Open the customer menu to verify it.` : `Publication ${result.version} saved for setup testing. Customer-menu delivery is disabled.` });
      if (operation === "restore") {
        // The replacement content must be fetched from the server before editing again.
        this.update({ blocked: true, status: "Version restored. Reloading the saved draft…" });
      } else {
        if (this.state.dirty) this.update({ status: "Earlier edits saved. Autosaving your latest changes next." });
        this.queue();
      }
      return true;
    } catch {
      this.update({ phase: "idle", paused: true, blocked: true, status: "Connection interrupted. Your edits are still here. Reload to check the saved version before retrying." });
      return false;
    } finally { cancelTimeout?.(); }
  }
}
