<script lang="ts">
  import { range } from "lodash/fp";
  import {
    Settings,
    ArrowLeft,
    ArrowRight,
    FileInput,
    HelpCircle,
    Table2,
    Filter,
    FilterX,
    AlertTriangle,
    Info,
  } from "lucide-svelte";
  import { getContext } from "svelte";

  import { obsidianContext } from "../../constants";
  import { settings } from "../../global-store/settings";
  import { visibleDayInTimeline } from "../../global-store/visible-day-in-timeline";
  import type { ObsidianContext } from "../../types";
  import { createDailyNoteIfNeeded } from "../../util/daily-notes";
  import { useDataviewSource } from "../hooks/use-dataview-source";

  import ControlButton from "./control-button.svelte";
  import ErrorReport from "./error-report.svelte"
  import Dropdown from "./obsidian/dropdown.svelte";
  import SettingItem from "./obsidian/setting-item.svelte";

  const {
    obsidianFacade,
    initWeeklyView,
    refreshTasks,
    dataviewLoaded,
    showReleaseNotes,
  } = getContext<ObsidianContext>(obsidianContext);

  const {
    sourceIsEmpty,
    errorMessage: dataviewErrorMessage,
    dataviewSourceInput,
  } = useDataviewSource({ refreshTasks });

  const startHourOptions = range(0, 13).map(String);
  const zoomLevelOptions = range(1, 9).map(String);

  let settingsVisible = false;
  let helpVisible = false;
  let filterVisible = false;

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }

  function toggleHelp() {
    helpVisible = !helpVisible;
  }

  function toggleFilter() {
    filterVisible = !filterVisible;
  }

  async function goBack() {
    const previousDay = $visibleDayInTimeline.clone().subtract(1, "day");

    const previousNote = await createDailyNoteIfNeeded(previousDay);
    await obsidianFacade.openFileInEditor(previousNote);

    $visibleDayInTimeline = previousDay;
  }

  async function goForward() {
    const nextDay = $visibleDayInTimeline.clone().add(1, "day");

    const nextNote = await createDailyNoteIfNeeded(nextDay);
    await obsidianFacade.openFileInEditor(nextNote);

    $visibleDayInTimeline = nextDay;
  }

  async function goToToday() {
    const noteForToday = await createDailyNoteIfNeeded(window.moment());
    await obsidianFacade.openFileInEditor(noteForToday);
  }

  function handleStartHourInput(event: Event) {
    // @ts-expect-error
    $settings.startHour = Number(event.currentTarget.value);
  }

  function handleZoomLevelInput(event: Event) {
    // @ts-expect-error
    $settings.zoomLevel = Number(event.currentTarget.value);
  }
</script>

<div class="controls">
  <ErrorReport />
  <div class="header">
    <ControlButton label="Open today's daily note" on:click={goToToday}>
      <FileInput class="svg-icon" />
    </ControlButton>

    <ControlButton label="Open week planner" on:click={initWeeklyView}>
      <Table2 class="svg-icon" />
    </ControlButton>

    <ControlButton
      --grid-column-start="4"
      --justify-self="flex-end"
      label="Go to previous day"
      on:click={goBack}
    >
      <ArrowLeft class="svg-icon" />
    </ControlButton>

    <ControlButton
      label="Go to file"
      on:click={async () => {
        const note = await createDailyNoteIfNeeded($visibleDayInTimeline);
        await obsidianFacade.openFileInEditor(note);
      }}
    >
      <span class="date"
        >{$visibleDayInTimeline.format($settings.timelineDateFormat)}</span
      >
    </ControlButton>

    <ControlButton
      --justify-self="flex-start"
      label="Go to next day"
      on:click={goForward}
    >
      <ArrowRight class="svg-icon" />
    </ControlButton>

    <ControlButton
      isActive={filterVisible}
      label="Dataview source"
      on:click={toggleFilter}
    >
      {#if $sourceIsEmpty}
        <FilterX class="svg-icon" />
      {:else}
        <Filter class="svg-icon active-filter" />
      {/if}
    </ControlButton>
    <ControlButton isActive={helpVisible} label="Help" on:click={toggleHelp}>
      <HelpCircle class="svg-icon" />
    </ControlButton>
    <ControlButton
      isActive={settingsVisible}
      label="Settings"
      on:click={toggleSettings}
    >
      <Settings class="svg-icon" />
    </ControlButton>
  </div>
  {#if !$dataviewLoaded}
    <div class="info-container">
      <AlertTriangle class="svg-icon mod-error" />
      <span
        >You need to install and enable
        <a href="https://github.com/blacksmithgu/obsidian-dataview">Dataview</a>
        for the day planner to work.</span
      >
    </div>
  {/if}
  {#if filterVisible}
    <div class="stretcher">
      Include additional files, folders and tags with a Dataview source:
      <input
        placeholder={`-#archived and -"notes/personal"`}
        spellcheck="false"
        type="text"
        bind:value={$dataviewSourceInput}
      />
      {#if $sourceIsEmpty}
        <div class="info-container">
          <AlertTriangle class="svg-icon" />
          Tasks are pulled only from daily notes
        </div>
      {/if}
      {#if $dataviewErrorMessage.length > 0}
        <div class="info-container">
<!--          TODO: move out -->
          <pre class="error-message">{$dataviewErrorMessage}</pre>
        </div>
      {/if}
      <div class="info-container">
        <Info class="svg-icon" />
        <a
          href="https://blacksmithgu.github.io/obsidian-dataview/reference/sources/"
          >Dataview source reference</a
        >
      </div>
    </div>
  {/if}
  {#if helpVisible}
    <div class="help">
      <p class="help-item"><strong>Advanced editing:</strong></p>
      <p class="help-item">Hold <strong>Shift</strong> and drag to copy</p>
      <p class="help-item">
        Hold <strong>Control</strong> and drag/resize to push neighboring tasks
      </p>
      <button class="release-notes-button" on:click={showReleaseNotes}
        >Show release notes
      </button>
    </div>
  {/if}
  {#if settingsVisible}
    <div class="settings">
      <SettingItem>
        <svelte:fragment slot="name">Start hour</svelte:fragment>
        <Dropdown
          slot="control"
          value={String($settings.startHour)}
          values={startHourOptions}
          on:input={handleStartHourInput}
        />
      </SettingItem>

      <SettingItem>
        <svelte:fragment slot="name">Zoom</svelte:fragment>
        <Dropdown
          slot="control"
          value={String($settings.zoomLevel)}
          values={zoomLevelOptions}
          on:input={handleZoomLevelInput}
        />
      </SettingItem>
      <SettingItem>
        <svelte:fragment slot="name">Auto-scroll to now</svelte:fragment>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          slot="control"
          class="checkbox-container mod-small"
          class:is-enabled={$settings.centerNeedle}
          on:click={() => {
            $settings.centerNeedle = !$settings.centerNeedle;
          }}
        >
          <input tabindex="0" type="checkbox" />
        </div>
      </SettingItem>

      <SettingItem>
        <svelte:fragment slot="name">Show completed tasks</svelte:fragment>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          slot="control"
          class="checkbox-container mod-small"
          class:is-enabled={$settings.showCompletedTasks}
          on:click={() => {
            $settings.showCompletedTasks = !$settings.showCompletedTasks;
          }}
        >
          <input tabindex="0" type="checkbox" />
        </div>
      </SettingItem>

      <SettingItem>
        <svelte:fragment slot="name"
          >Show subtasks in task blocks
        </svelte:fragment>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          slot="control"
          class="checkbox-container mod-small"
          class:is-enabled={$settings.showSubtasksInTaskBlocks}
          on:click={() => {
            // We create a new object to trigger immediate update in the timeline view
            settings.update((previous) => ({
              ...previous,
              showSubtasksInTaskBlocks: !previous.showSubtasksInTaskBlocks,
            }));
          }}
        >
          <input tabindex="0" type="checkbox" />
        </div>
      </SettingItem>

      <div class="controls-section">Unscheduled tasks</div>

      <SettingItem>
        <svelte:fragment slot="name">Show unscheduled tasks</svelte:fragment>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          slot="control"
          class="checkbox-container mod-small"
          class:is-enabled={$settings.showUncheduledTasks}
          on:click={() => {
            $settings.showUncheduledTasks = !$settings.showUncheduledTasks;
          }}
        >
          <input tabindex="0" type="checkbox" />
        </div>
      </SettingItem>

      {#if $settings.showUncheduledTasks}
        <SettingItem>
          <svelte:fragment slot="name"
            >Show unscheduled sub-tasks as separate blocks
          </svelte:fragment>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            slot="control"
            class="checkbox-container mod-small"
            class:is-enabled={$settings.showUnscheduledNestedTasks}
            on:click={() => {
              $settings.showUnscheduledNestedTasks =
                !$settings.showUnscheduledNestedTasks;
            }}
          >
            <input tabindex="0" type="checkbox" />
          </div>
        </SettingItem>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(.active-filter) {
    color: var(--text-success);
  }

  .stretcher {
    display: flex;
    flex-direction: column;
    gap: var(--size-4-2);

    font-size: var(--font-ui-small);
    color: var(--text-muted);
  }

  :global(.mod-error) {
    color: var(--text-error);
  }

  .stretcher input {
    font-family: var(--font-monospace);
  }

  .info-container {
    display: flex;
    gap: var(--size-4-1);
    margin: var(--size-4-2);
  }

  .info-container :global(.svg-icon) {
    flex-shrink: 0;
  }

  .error-message {
    overflow-x: auto;
    padding: var(--size-4-1);
    border: 1px solid var(--text-error);
    border-radius: var(--radius-s);
  }

  .controls-section {
    margin: var(--size-4-2) 0;
    font-size: var(--font-ui-small);
    font-weight: var(--font-medium);
  }

  .help-item {
    font-size: var(--font-ui-small);
    color: var(--text-muted);
  }

  .date {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: var(--font-ui-small);
    font-weight: var(--font-medium);
    color: var(--text-normal);
  }

  .settings {
    margin: var(--size-4-1) 0;
  }

  .controls {
    overflow: hidden;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;

    padding: var(--size-4-2);

    border-bottom: 1px solid var(--background-modifier-border);
  }

  .header {
    display: grid;
    grid-template-columns: repeat(3, var(--size-4-8)) repeat(3, 1fr) repeat(
        3,
        var(--size-4-8)
      );
  }

  .help {
    display: flex;
    flex-direction: column;
    margin: var(--size-2-3) 0;
  }
</style>
