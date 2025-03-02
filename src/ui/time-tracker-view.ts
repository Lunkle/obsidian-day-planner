import { ItemView, WorkspaceLeaf } from "obsidian";

import { viewTypeTimeTracker } from "../constants";
import type { DayPlannerSettings } from "../settings";
import { ComponentContext } from "../types";

import TimeTracker from "./components/time-tracker/time-tracker.svelte";

export default class TimeTrackerView extends ItemView {
  private timeTracker: TimeTracker;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly settings: () => DayPlannerSettings,
    private readonly componentContext: ComponentContext,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return viewTypeTimeTracker;
  }

  getDisplayText(): string {
    return "Time Tracker";
  }

  getIcon() {
    return "timer";
  }

  async onOpen() {
    const contentEl = this.containerEl.children[1];
    this.timeTracker = new TimeTracker({
      target: contentEl,
      context: this.componentContext,
    });
  }

  async onClose() {
    this.timeTracker?.$destroy();
  }
}
