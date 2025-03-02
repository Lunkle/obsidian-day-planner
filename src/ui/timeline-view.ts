import { ItemView, WorkspaceLeaf } from "obsidian";

import { viewTypeTimeline } from "../constants";
import type { DayPlannerSettings } from "../settings";
import { ComponentContext } from "../types";

import TimelineWithControls from "./components/timeline-with-controls.svelte";

export default class TimelineView extends ItemView {
  private timeline: TimelineWithControls;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly settings: () => DayPlannerSettings,
    private readonly componentContext: ComponentContext,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return viewTypeTimeline;
  }

  getDisplayText(): string {
    return "Day Planner Timeline";
  }

  getIcon() {
    return this.settings().timelineIcon;
  }

  async onOpen() {
    const contentEl = this.containerEl.children[1];
    this.timeline = new TimelineWithControls({
      target: contentEl,
      context: this.componentContext,
    });
  }

  async onClose() {
    this.timeline?.$destroy();
  }
}
