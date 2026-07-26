import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  allAssets,
  allExpressions,
  applyBatchMutation,
  createActor,
  createExpression,
  createOutfit,
  createPose,
  inspectProfile,
} from "../model";
import type {
  ActorProfile,
  BatchMutation,
  CharacterProfileV1,
  ExpressionState,
  LumiStageSettingsV1,
  OutfitFolder,
  PoseState,
  StageAsset,
  StudioView,
} from "../types";
import type { LumiStageClient } from "./client";
import { Icon, type IconName } from "./icons";
import { Media } from "./media";
import { cleanList, showImportModal, showQuickPicker, showTextPrompt } from "./modals";
import {
  Button,
  EmptyState,
  Field,
  IconButton,
  InlineNotice,
  ProgressNotice,
  SearchInput,
  SectionTitle,
  Segmented,
  Status,
  Surface,
  Toggle,
  Toolbar,
  ViewHeader,
  useClientState,
} from "./primitives";

const NAV: Array<{ id: StudioView; label: string; icon: IconName }> = [
  { id: "stage", label: "Stage", icon: "stage" },
  { id: "library", label: "Library", icon: "library" },
  { id: "batch", label: "Batch", icon: "batch" },
  { id: "automation", label: "Automation", icon: "automation" },
  { id: "appearance", label: "Appearance", icon: "appearance" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "diagnostics", label: "Diagnostics", icon: "diagnostics" },
];
const PRIMARY_NAV = NAV.slice(0, 3);
const SECONDARY_NAV = NAV.slice(3);

function activeNodes(profile: CharacterProfileV1 | null, actorId?: string, outfitId?: string, poseId?: string) {
  const actor = profile?.actors.find((item) => item.id === actorId) ?? profile?.actors[0] ?? null;
  const outfit = actor?.outfits.find((item) => item.id === outfitId) ?? actor?.outfits[0] ?? null;
  const pose = outfit?.poses.find((item) => item.id === poseId) ?? outfit?.poses[0] ?? null;
  return { actor, outfit, pose };
}

function assetLocation(profile: CharacterProfileV1, assetId: string): {
  actor: ActorProfile;
  outfit: OutfitFolder;
  pose: PoseState;
  expression: ExpressionState;
  asset: StageAsset;
} | null {
  for (const actor of profile.actors) for (const outfit of actor.outfits) for (const pose of outfit.poses) {
    for (const expression of pose.expressions) {
      const asset = expression.assets.find((item) => item.id === assetId);
      if (asset) return { actor, outfit, pose, expression, asset };
    }
  }
  return null;
}

function ContextAvatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase();
  return <span class="ls2-context-avatar">{initials || "LS"}</span>;
}

function StageOnboarding({
  client,
  navigate,
  actorCount,
  mediaCount,
}: {
  client: LumiStageClient;
  navigate: (view: StudioView) => void;
  actorCount: number;
  mediaCount: number;
}) {
  const { backend } = useClientState(client);
  const hasCharacter = Boolean(backend.activeCharacterId);
  const automationReady = backend.settings.detection.enabled && backend.permissions.generation && backend.permissions.chats;
  const steps = [
    { icon: "actors" as IconName, title: "Choose the cast", detail: hasCharacter ? backend.activeCharacterName ?? "Character linked" : "Open a character or conversation", done: hasCharacter, action: () => navigate("library") },
    { icon: "image" as IconName, title: "Build the visual library", detail: mediaCount ? `${mediaCount} media across ${actorCount} actor${actorCount === 1 ? "" : "s"}` : "Import a folder or add states manually", done: mediaCount > 0, action: () => navigate("library") },
    { icon: "automation" as IconName, title: "Set the cue logic", detail: automationReady ? "Automatic direction is armed" : "Choose how replies change the stage", done: automationReady, action: () => navigate("automation") },
  ];
  const completed = steps.filter((step) => step.done).length;

  return (
    <div class="ls2-onboarding">
      <section class="ls2-onboarding-stage">
        <div class="ls2-rig" aria-hidden="true">
          <span class="ls2-rig-bar" />
          <i class="ls2-rig-lamp ls2-rig-lamp-left" />
          <i class="ls2-rig-lamp ls2-rig-lamp-center" />
          <i class="ls2-rig-lamp ls2-rig-lamp-right" />
          <span class="ls2-rig-beam ls2-rig-beam-left" />
          <span class="ls2-rig-beam ls2-rig-beam-center" />
          <span class="ls2-rig-beam ls2-rig-beam-right" />
          <span class="ls2-rig-mark"><Icon name="stage" size={22} /></span>
          <span class="ls2-rig-floor" />
        </div>
        <div class="ls2-onboarding-copy">
          <span class="ls2-kicker"><span />Stage uncast</span>
          <h3>Give every reply a visual performance.</h3>
          <p>Build a private cast library, then direct it yourself or let LumiStage resolve outfits, poses, and expressions after each reply.</p>
          <div class="ls2-onboarding-actions">
            <Button icon="upload" variant="primary" onClick={() => showImportModal(client, backend.profile)}>Import a folder</Button>
            <Button icon="library" onClick={() => navigate("library")}>Build manually</Button>
          </div>
        </div>
      </section>

      <section class="ls2-cue-sheet">
        <div class="ls2-cue-sheet-head">
          <div><span class="ls2-eyebrow">Opening cues</span><strong>Ready the stage</strong></div>
          <span>{completed} / {steps.length}</span>
        </div>
        <div class="ls2-cue-progress"><span style={{ width: `${completed / steps.length * 100}%` }} /></div>
        <div class="ls2-cue-steps">
          {steps.map((step, index) => (
            <button type="button" data-done={step.done} onClick={step.action}>
              <span class="ls2-cue-index">{step.done ? <Icon name="check" size={14} /> : String(index + 1).padStart(2, "0")}</span>
              <span class="ls2-cue-icon"><Icon name={step.icon} size={17} /></span>
              <span class="ls2-cue-copy"><strong>{step.title}</strong><small>{step.detail}</small></span>
              <Icon name="chevronRight" size={16} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LiveView({ client, navigate }: { client: LumiStageClient; navigate: (view: StudioView) => void }) {
  const { backend } = useClientState(client);
  const actors = Object.values(backend.snapshot?.actors ?? {}).sort((a, b) => Number(b.focused) - Number(a.focused));
  const actorCount = backend.stageProfiles.reduce((sum, profile) => sum + profile.actors.length, 0);
  const mediaCount = backend.stageProfiles.reduce((sum, profile) => sum + allAssets(profile).length, 0);
  const lockCount = Object.keys(backend.timeline?.manualOverrides ?? {}).length;
  const statusTone = backend.lastDetection.status === "error" ? "danger" : backend.lastDetection.status === "success" ? "success" : backend.lastDetection.status === "running" ? "accent" : "neutral";
  return (
    <div class="ls2-view">
      <ViewHeader
        eyebrow="Live direction"
        title="Live Stage"
        description="The resolved visual state for this conversation."
        actions={backend.activeChatId ? <><Button icon="sparkles" onClick={() => showQuickPicker(client)}>Direct</Button><Button icon="play" variant="primary" onClick={() => client.analyzeNow()}>Run cue</Button></> : undefined}
      />

      <section class="ls2-cue-monitor" data-tone={statusTone}>
        <span class="ls2-cue-monitor-light" />
        <div class="ls2-detector-state">
          <div><span class="ls2-cue-monitor-label">Cue monitor · {backend.lastDetection.status}</span><strong>{backend.lastDetection.message}</strong></div>
        </div>
        <span class="ls2-cue-monitor-meta">{backend.queueDepth ? `${backend.queueDepth} queued` : backend.activeChatId ? "Watching replies" : "Awaiting chat"}</span>
        {backend.activeChatId && <IconButton icon="refresh" label="Analyze latest reply" onClick={() => client.analyzeNow()} />}
      </section>

      {actors.length ? (
        <Surface padding="none" class="ls2-scene">
          <div class="ls2-scene-head">
            <div><span class="ls2-eyebrow">Now playing</span><h3>{backend.activeCharacterName ?? "Ensemble"}</h3></div>
            <span>{actors.length} actor{actors.length === 1 ? "" : "s"}</span>
          </div>
          <div class="ls2-scene-cast">
            {actors.map((actor) => {
              const view = actor.assetId ? backend.assetViews[actor.assetId] : null;
              const parts = actor.label.split(" · ");
              return (
                <article class="ls2-scene-actor" data-focused={actor.focused}>
                  <div class="ls2-scene-media">
                    <Media src={view?.url ?? view?.thumbUrl ?? null} kind={view?.mediaKind ?? "image"} label={actor.label} class="ls2-scene-media-file" contain />
                    {actor.focused && <span class="ls2-focus-flag"><Icon name="sparkles" size={12} />Focus</span>}
                  </div>
                  <div class="ls2-scene-actor-copy"><strong>{parts[0]}</strong><span>{parts.slice(1).join(" / ")}</span></div>
                </article>
              );
            })}
          </div>
        </Surface>
      ) : (
        <StageOnboarding client={client} navigate={navigate} actorCount={actorCount} mediaCount={mediaCount} />
      )}

      <div class="ls2-metric-grid">
        <div><Icon name="actors" size={18} /><span><strong>{actorCount}</strong>Actors</span></div>
        <div><Icon name="image" size={18} /><span><strong>{mediaCount}</strong>Media</span></div>
        <div><Icon name="lock" size={18} /><span><strong>{lockCount}</strong>Locks</span></div>
      </div>
    </div>
  );
}

function FolderButton(props: { icon: IconName; label: string; count: number; active: boolean; onClick: () => void; draggable?: boolean; onDragStart?: () => void; onDrop?: () => void }) {
  return (
    <button
      type="button"
      class="ls2-folder-button"
      data-active={props.active}
      onClick={props.onClick}
      draggable={props.draggable}
      onDragStart={props.onDragStart}
      onDragOver={(event) => props.draggable && event.preventDefault()}
      onDrop={props.onDrop}
    >
      <span class="ls2-folder-icon"><Icon name={props.icon} size={16} /></span>
      <span><strong>{props.label}</strong><small>{props.count}</small></span>
    </button>
  );
}

function LibraryView(props: {
  client: LumiStageClient;
  profile: CharacterProfileV1 | null;
  update: (mutator: (draft: CharacterProfileV1) => void) => void;
  selected: Set<string>;
  setSelected: (selection: Set<string>) => void;
}) {
  const { backend } = useClientState(props.client);
  const [actorId, setActorId] = useState(props.profile?.defaultActorId ?? props.profile?.actors[0]?.id ?? "");
  const [outfitId, setOutfitId] = useState("");
  const [poseId, setPoseId] = useState("");
  const [expressionId, setExpressionId] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [dragged, setDragged] = useState<string | null>(null);
  const lastIndex = useRef<number | null>(null);
  const { actor, outfit, pose } = activeNodes(props.profile, actorId, outfitId, poseId);

  useEffect(() => {
    if (props.profile && !props.profile.actors.some((item) => item.id === actorId)) setActorId(props.profile.defaultActorId ?? props.profile.actors[0]?.id ?? "");
  }, [props.profile?.revision, actorId]);
  useEffect(() => {
    if (actor && !actor.outfits.some((item) => item.id === outfitId)) setOutfitId(actor.defaultOutfitId ?? actor.outfits[0]?.id ?? "");
  }, [actor?.id, outfitId]);
  useEffect(() => {
    if (outfit && !outfit.poses.some((item) => item.id === poseId)) setPoseId(outfit.defaultPoseId ?? outfit.poses[0]?.id ?? "");
  }, [outfit?.id, poseId]);

  const rows = useMemo(() => {
    if (!pose) return [];
    const needle = query.trim().toLocaleLowerCase();
    return pose.expressions.flatMap((expression) => expression.assets.map((asset) => ({ expression, asset })))
      .filter(({ expression, asset }) => !needle || [expression.name, asset.fileName, ...expression.tags, ...expression.aliases, ...expression.cues].join(" ").toLocaleLowerCase().includes(needle));
  }, [pose, query]);
  const pageSize = 72;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const inspectedExpression = pose?.expressions.find((item) => item.id === expressionId) ?? null;
  useEffect(() => setPage(0), [actor?.id, outfit?.id, pose?.id, query]);

  function select(index: number, assetId: string, shift: boolean) {
    const next = new Set(props.selected);
    if (shift && lastIndex.current !== null) {
      const [start, end] = [lastIndex.current, index].sort((a, b) => a - b);
      for (let cursor = start; cursor <= end; cursor += 1) next.add(rows[cursor].asset.id);
    } else if (next.has(assetId)) next.delete(assetId);
    else next.add(assetId);
    lastIndex.current = index;
    props.setSelected(next);
  }

  function reorder(kind: "outfit" | "pose", sourceId: string, targetId: string) {
    if (!actor || sourceId === targetId) return;
    props.update((profile) => {
      const targetActor = profile.actors.find((item) => item.id === actor.id);
      if (kind === "outfit") {
        const list = targetActor?.outfits;
        if (!list) return;
        const from = list.findIndex((item) => item.id === sourceId);
        const to = list.findIndex((item) => item.id === targetId);
        if (from < 0 || to < 0) return;
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        list.forEach((item, index) => { item.order = index; });
      } else {
        const list = targetActor?.outfits.find((item) => item.id === outfit?.id)?.poses;
        if (!list) return;
        const from = list.findIndex((item) => item.id === sourceId);
        const to = list.findIndex((item) => item.id === targetId);
        if (from < 0 || to < 0) return;
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        list.forEach((item, index) => { item.order = index; });
      }
    });
  }

  function addActor() {
    showTextPrompt(props.client, { title: "New actor", label: "Actor name", placeholder: "e.g. Aster" }, (name) => props.update((profile) => {
      const next = createActor(name);
      next.order = profile.actors.length;
      profile.actors.push(next);
      profile.defaultActorId ??= next.id;
      setActorId(next.id);
    }));
  }
  function addOutfit() {
    if (!actor) return;
    showTextPrompt(props.client, { title: "New outfit folder", label: "Outfit name", placeholder: "e.g. Evening wear" }, (name) => props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id);
      if (!target) return;
      const next = createOutfit(name);
      next.order = target.outfits.length;
      target.outfits.push(next);
      target.defaultOutfitId ??= next.id;
      setOutfitId(next.id);
    }));
  }
  function addPose() {
    if (!actor || !outfit) return;
    showTextPrompt(props.client, { title: "New pose folder", label: "Pose name", placeholder: "e.g. Seated" }, (name) => props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
      if (!target) return;
      const next = createPose(name);
      next.order = target.poses.length;
      target.poses.push(next);
      target.defaultPoseId ??= next.id;
      setPoseId(next.id);
    }));
  }
  function addExpression() {
    if (!actor || !outfit || !pose) return;
    showTextPrompt(props.client, { title: "New expression", label: "Expression name", placeholder: "e.g. Relieved" }, (name) => props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id)?.poses.find((item) => item.id === pose.id);
      if (!target) return;
      const next = createExpression(name);
      next.order = target.expressions.length;
      target.expressions.push(next);
      target.defaultExpressionId ??= next.id;
      setExpressionId(next.id);
    }));
  }

  if (!props.profile) {
    return <div class="ls2-view"><ViewHeader eyebrow="Asset direction" title="Library" description="Build visual profiles for the active character." /><Surface><EmptyState icon="actors" title="No character selected" description="Open a character or conversation in Lumiverse to begin." /></Surface></div>;
  }

  return (
    <div class="ls2-view">
      <ViewHeader
        eyebrow="Asset direction"
        title="Library"
        description="Organize actors, outfits, poses, expressions, and media."
        actions={<><Button icon="upload" variant="primary" onClick={() => showImportModal(props.client, props.profile)}>Import</Button><IconButton icon="plus" label="Add actor" onClick={addActor} /></>}
      />

      <Surface class="ls2-library-context" padding="small">
        <ContextAvatar name={props.profile.characterName} />
        <div><strong>{props.profile.characterName}</strong><span>{props.profile.actors.length} actors · {allAssets(props.profile).length} media</span></div>
        <select class="ls2-select ls2-actor-select" value={actor?.id} aria-label="Actor" onChange={(event) => setActorId(event.currentTarget.value)}>
          {props.profile.actors.map((item) => <option value={item.id}>{item.name}</option>)}
        </select>
      </Surface>

      <div class="ls2-folder-section">
        <SectionTitle title="Outfits" description="Drag to reorder" trailing={<IconButton icon="plus" label="Add outfit" onClick={addOutfit} />} />
        <div class="ls2-folder-strip">
          {actor?.outfits.map((item) => (
            <FolderButton
              icon="outfit"
              label={item.name}
              count={item.poses.reduce((sum, value) => sum + value.expressions.reduce((total, expression) => total + expression.assets.length, 0), 0)}
              active={item.id === outfit?.id}
              onClick={() => setOutfitId(item.id)}
              draggable
              onDragStart={() => setDragged(item.id)}
              onDrop={() => { if (dragged) reorder("outfit", dragged, item.id); setDragged(null); }}
            />
          ))}
        </div>
      </div>

      <div class="ls2-folder-section">
        <SectionTitle title="Poses" trailing={<IconButton icon="plus" label="Add pose" onClick={addPose} />} />
        <div class="ls2-folder-strip">
          {outfit?.poses.map((item) => (
            <FolderButton
              icon="pose"
              label={item.name}
              count={item.expressions.reduce((sum, expression) => sum + expression.assets.length, 0)}
              active={item.id === pose?.id}
              onClick={() => setPoseId(item.id)}
              draggable
              onDragStart={() => setDragged(item.id)}
              onDrop={() => { if (dragged) reorder("pose", dragged, item.id); setDragged(null); }}
            />
          ))}
        </div>
      </div>

      <Surface class="ls2-library-workspace" padding="none">
        <div class="ls2-library-toolbar">
          <SearchInput value={query} onInput={setQuery} placeholder="Search names, aliases, tags, cues…" />
          <Toolbar>
            <Button icon="plus" size="small" onClick={addExpression}>Expression</Button>
            <Button size="small" onClick={() => props.setSelected(new Set(pageRows.map((row) => row.asset.id)))} disabled={!pageRows.length}>Select page</Button>
          </Toolbar>
        </div>
        <div class="ls2-library-subbar">
          <span>{rows.length} media</span>
          <span>{props.selected.size} selected</span>
          <div class="ls2-pagination">
            <IconButton icon="chevronLeft" label="Previous page" disabled={safePage === 0} onClick={() => setPage(Math.max(0, safePage - 1))} />
            <span>{safePage + 1} / {pageCount}</span>
            <IconButton icon="chevronRight" label="Next page" disabled={safePage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} />
          </div>
        </div>
        {pageRows.length ? (
          <div class="ls2-asset-grid">
            {pageRows.map(({ expression, asset }, index) => {
              const view = backend.assetViews[asset.id];
              return (
                <article class="ls2-asset-card" data-selected={props.selected.has(asset.id)} data-inspected={expression.id === expressionId}>
                  <button type="button" class="ls2-asset-main" onClick={(event) => { select(pageStart + index, asset.id, event.shiftKey); setExpressionId(expression.id); }}>
                    <Media src={view?.thumbUrl ?? view?.url ?? null} kind={asset.mediaKind} label={expression.name} class="ls2-asset-media" />
                    <span class="ls2-asset-overlay"><strong>{expression.name}</strong><small>{asset.mediaKind} · P{asset.priority}</small></span>
                    <span class="ls2-asset-check"><Icon name={props.selected.has(asset.id) ? "check" : "plus"} size={12} /></span>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="image" title="No media in this pose" description="Import media or create an empty expression to start building this pose." action={<Button icon="upload" variant="primary" onClick={() => showImportModal(props.client, props.profile)}>Import media</Button>} />
        )}
      </Surface>

      {inspectedExpression && actor && outfit && pose && (
        <Surface class="ls2-inspector">
          <SectionTitle title="Expression inspector" description={`${actor.name} / ${outfit.name} / ${pose.name}`} trailing={<Status tone={inspectedExpression.enabled ? "success" : "neutral"}>{inspectedExpression.enabled ? "Enabled" : "Disabled"}</Status>} />
          <div class="ls2-form-grid">
            <Field label="Name"><input class="ls2-input" value={inspectedExpression.name} onChange={(event) => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.name = event.currentTarget.value; })} /></Field>
            <Field label="Priority"><input class="ls2-input" type="number" value={inspectedExpression.priority} onChange={(event) => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.priority = Number(event.currentTarget.value); })} /></Field>
            <Field label="Aliases" hint="Comma separated"><input class="ls2-input" value={inspectedExpression.aliases.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.aliases = cleanList(event.currentTarget.value); })} /></Field>
            <Field label="Cue phrases" hint="Comma separated"><input class="ls2-input" value={inspectedExpression.cues.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.cues = cleanList(event.currentTarget.value); })} /></Field>
            <Field label="Tags" hint="Comma separated" class="ls2-field-wide"><input class="ls2-input" value={inspectedExpression.tags.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.tags = cleanList(event.currentTarget.value); })} /></Field>
          </div>
          <Toolbar>
            <Button icon="check" onClick={() => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id); if (node) node.defaultExpressionId = inspectedExpression.id; })}>Set as default</Button>
            <Button icon={inspectedExpression.enabled ? "eyeOff" : "eye"} onClick={() => props.update((profile) => { const node = profile.actors.find((a) => a.id === actor.id)?.outfits.find((o) => o.id === outfit.id)?.poses.find((p) => p.id === pose.id)?.expressions.find((e) => e.id === inspectedExpression.id); if (node) node.enabled = !node.enabled; })}>{inspectedExpression.enabled ? "Disable" : "Enable"}</Button>
          </Toolbar>
        </Surface>
      )}

      {actor && outfit && pose && (
        <details class="ls2-disclosure">
          <summary><span><Icon name="settings" size={16} />Folder direction</span><Icon name="chevronDown" size={15} /></summary>
          <div class="ls2-disclosure-body">
            <div class="ls2-form-grid">
              <Field label="Actor aliases"><input class="ls2-input" value={actor.aliases.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id); if (node) node.aliases = cleanList(event.currentTarget.value); })} /></Field>
              <Field label="Outfit aliases"><input class="ls2-input" value={outfit.aliases.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.aliases = cleanList(event.currentTarget.value); })} /></Field>
              <Field label="Outfit cues"><input class="ls2-input" value={outfit.cues.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.cues = cleanList(event.currentTarget.value); })} /></Field>
              <Field label="Pose cues"><input class="ls2-input" value={pose.cues.join(", ")} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id)?.poses.find((item) => item.id === pose.id); if (node) node.cues = cleanList(event.currentTarget.value); })} /></Field>
            </div>
            <Toggle checked={outfit.allowAutoSwitch} onChange={(value) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.allowAutoSwitch = value; })} label="Allow automatic outfit switching" hint="Still requires an explicit cue and the configured confidence threshold." />
            <Toolbar><Button onClick={() => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id); if (node) node.defaultOutfitId = outfit.id; })}>Default outfit</Button><Button onClick={() => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.defaultPoseId = pose.id; })}>Default pose</Button></Toolbar>
          </div>
        </details>
      )}
    </div>
  );
}

function BatchView(props: {
  profile: CharacterProfileV1 | null;
  selected: Set<string>;
  setSelected: (selection: Set<string>) => void;
  mutate: (mutation: BatchMutation) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const [priority, setPriority] = useState(0);
  const [tags, setTags] = useState("");
  const [aliases, setAliases] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [destination, setDestination] = useState("");
  const profile = props.profile;
  const selectedExpressions = useMemo(() => {
    if (!profile) return [];
    return [...new Set([...props.selected].map((assetId) => assetLocation(profile, assetId)?.expression.id).filter((id): id is string => !!id))];
  }, [profile, props.selected]);
  const destinations = profile?.actors.flatMap((actor) => actor.outfits.flatMap((outfit) => outfit.poses.map((pose) => ({ key: `${outfit.id}|${pose.id}`, outfitId: outfit.id, poseId: pose.id, label: `${actor.name} / ${outfit.name} / ${pose.name}` })))) ?? [];
  const selectedDestination = destinations.find((item) => item.key === destination) ?? null;
  const preview = profile ? allExpressions(profile).filter((item) => selectedExpressions.includes(item.id)).slice(0, 5).map((item) => ({ before: item.name, after: find ? item.name.split(find).join(replace) : item.name })) : [];
  const expressionNames = profile ? [...new Set(allExpressions(profile).map((item) => item.name))] : [];
  const poses = profile?.actors.flatMap((actor) => actor.outfits.flatMap((outfit) => outfit.poses)) ?? [];

  return (
    <div class="ls2-view">
      <ViewHeader eyebrow="Multi-edit workspace" title="Batch Lab" description="Make deliberate, reversible changes across selected media." actions={<><IconButton icon="undo" label="Undo" disabled={!props.canUndo} onClick={props.undo} /><IconButton icon="redo" label="Redo" disabled={!props.canRedo} onClick={props.redo} /></>} />
      <Surface class="ls2-selection-hero" tone={props.selected.size ? "accent" : "default"}>
        <div class="ls2-selection-icon"><Icon name="batch" size={22} /></div>
        <div><strong>{props.selected.size ? `${props.selected.size} media selected` : "No media selected"}</strong><span>{props.selected.size ? `${selectedExpressions.length} expressions are in scope` : "Select media in Library or choose the full profile."}</span></div>
        <Toolbar><Button size="small" onClick={() => profile && props.setSelected(new Set(allAssets(profile).map((asset) => asset.id)))} disabled={!profile}>Select all</Button><Button size="small" variant="ghost" onClick={() => props.setSelected(new Set())} disabled={!props.selected.size}>Clear</Button></Toolbar>
      </Surface>

      <div class="ls2-action-grid">
        <Surface>
          <SectionTitle title="Availability" description="Control what the resolver may choose." />
          <Toolbar><Button icon="eye" disabled={!props.selected.size} onClick={() => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: true })}>Enable</Button><Button icon="eyeOff" disabled={!props.selected.size} onClick={() => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: false })}>Disable</Button></Toolbar>
        </Surface>
        <Surface>
          <SectionTitle title="Priority" description="Higher values win among equivalent media." />
          <div class="ls2-inline-field"><input class="ls2-input" type="number" value={priority} onInput={(event) => setPriority(Number(event.currentTarget.value))} /><Button variant="primary" disabled={!props.selected.size} onClick={() => props.mutate({ type: "set-priority", assetIds: [...props.selected], priority })}>Apply</Button></div>
        </Surface>
      </div>

      <Surface>
        <SectionTitle title="Taxonomy" description="Add searchable language without replacing existing metadata." />
        <div class="ls2-form-grid">
          <Field label="Tags"><input class="ls2-input" value={tags} onInput={(event) => setTags(event.currentTarget.value)} placeholder="bright, smile, joy" /></Field>
          <Field label="Aliases"><input class="ls2-input" value={aliases} onInput={(event) => setAliases(event.currentTarget.value)} placeholder="grin, cheerful" /></Field>
        </div>
        <Toolbar><Button icon="tag" disabled={!selectedExpressions.length || !tags.trim()} onClick={() => props.mutate({ type: "add-tags", expressionIds: selectedExpressions, tags: tags.split(",") })}>Add tags</Button><Button icon="tag" disabled={!selectedExpressions.length || !aliases.trim()} onClick={() => props.mutate({ type: "add-aliases", expressionIds: selectedExpressions, aliases: aliases.split(",") })}>Add aliases</Button></Toolbar>
      </Surface>

      <Surface>
        <SectionTitle title="Rename transform" description="Preview expression names before applying." />
        <div class="ls2-form-grid">
          <Field label="Find"><input class="ls2-input" value={find} onInput={(event) => setFind(event.currentTarget.value)} /></Field>
          <Field label="Replace"><input class="ls2-input" value={replace} onInput={(event) => setReplace(event.currentTarget.value)} /></Field>
        </div>
        {preview.length > 0 && <div class="ls2-rename-preview">{preview.map((item) => <div><span>{item.before}</span><Icon name="chevronRight" size={13} /><strong>{item.after}</strong></div>)}</div>}
        <Button variant="primary" disabled={!find || !selectedExpressions.length} onClick={() => props.mutate({ type: "rename", expressionIds: selectedExpressions, find, replace })}>Apply rename</Button>
      </Surface>

      <Surface>
        <SectionTitle title="Reassign and duplicate" description="Move media while preserving its expression identity." />
        <Field label="Destination pose"><select class="ls2-select" value={destination} onChange={(event) => setDestination(event.currentTarget.value)}><option value="">Choose a destination…</option>{destinations.map((item) => <option value={item.key}>{item.label}</option>)}</select></Field>
        <Toolbar>
          <Button icon="move" disabled={!props.selected.size || !selectedDestination} onClick={() => selectedDestination && props.mutate({ type: "move", assetIds: [...props.selected], outfitId: selectedDestination.outfitId, poseId: selectedDestination.poseId })}>Move</Button>
          <Button icon="copy" disabled={!props.selected.size} onClick={() => props.mutate({ type: "duplicate", assetIds: [...props.selected] })}>Duplicate</Button>
          <Button icon="trash" variant="danger" disabled={!props.selected.size} onClick={() => props.mutate({ type: "delete", assetIds: [...props.selected] })}>Session trash</Button>
        </Toolbar>
        <p class="ls2-help">Session trash remains recoverable with Undo until the library is saved.</p>
      </Surface>

      <Surface>
        <SectionTitle title="Completeness matrix" description="Enabled media coverage across every pose." trailing={<span class="ls2-count">{poses.length} poses</span>} />
        {poses.length && expressionNames.length ? (
          <div class="ls2-table-wrap"><table class="ls2-matrix"><thead><tr><th>Pose</th>{expressionNames.map((name) => <th>{name}</th>)}</tr></thead><tbody>{poses.map((pose) => <tr><th>{pose.name}</th>{expressionNames.map((name) => { const expression = pose.expressions.find((item) => item.name === name); const complete = !!expression?.assets.some((asset) => asset.enabled); return <td data-complete={complete}>{complete ? <Icon name="check" size={13} /> : "—"}</td>; })}</tr>)}</tbody></table></div>
        ) : <EmptyState icon="batch" title="No coverage data yet" description="Add poses, expressions, and media to build the matrix." />}
      </Surface>
    </div>
  );
}

function AutomationView({ client, openSettings }: { client: LumiStageClient; openSettings: () => void }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = useState<LumiStageSettingsV1>(backend.settings);
  useEffect(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const missing = [!backend.permissions.generation && "Generation", !backend.permissions.chats && "Chats", !backend.permissions.chatMutation && "Chat History"].filter(Boolean);
  return (
    <div class="ls2-view">
      <ViewHeader eyebrow="Post-reply direction" title="Automation" description="Classify the completed reply once, then resolve it against your catalog." actions={<Button icon="check" variant="primary" onClick={() => void client.saveSettings(draft)}>Save changes</Button>} />
      {missing.length > 0 && <InlineNotice tone="warning"><strong>Automation is paused.</strong><span>Grant {missing.join(", ")} permissions to enable detection.</span></InlineNotice>}
      <Surface>
        <Toggle checked={detection.enabled} onChange={(enabled) => setDraft({ ...draft, detection: { ...detection, enabled } })} label="Automatic stage direction" hint="Runs only after a successful, saved assistant reply. Stopped or failed generations do not change the stage." />
      </Surface>
      <Surface class="ls2-route-summary">
        <span class="ls2-route-icon"><Icon name="aperture" size={20} /></span>
        <div><span class="ls2-eyebrow">Detector route</span><strong>{detection.connectionId ? "Pinned connection" : "Active Lumiverse connection"}</strong><small>{detection.model ?? "Connection default model"}</small></div>
        <Button icon="settings" onClick={openSettings}>Configure</Button>
      </Surface>
      <Surface>
        <SectionTitle title="Confidence policy" description="Uncertain predictions preserve the previous stage." />
        <div class="ls2-range-stack">
          <Field label={`Pose and expression · ${Math.round(detection.stateConfidence * 100)}%`}><input class="ls2-range" type="range" min=".3" max=".95" step=".05" value={detection.stateConfidence} onInput={(event) => setDraft({ ...draft, detection: { ...detection, stateConfidence: Number(event.currentTarget.value) } })} /></Field>
          <Field label={`Outfit change · ${Math.round(detection.outfitConfidence * 100)}%`} hint="Also requires an explicit clothing cue."><input class="ls2-range" type="range" min=".5" max="1" step=".05" value={detection.outfitConfidence} onInput={(event) => setDraft({ ...draft, detection: { ...detection, outfitConfidence: Number(event.currentTarget.value) } })} /></Field>
        </div>
      </Surface>
    </div>
  );
}

function SettingsView({ client }: { client: LumiStageClient }) {
  const { backend, busy } = useClientState(client);
  const [draft, setDraft] = useState<LumiStageSettingsV1>(backend.settings);
  useEffect(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const selected = detection.connectionId
    ? backend.connections.find((connection) => connection.id === detection.connectionId) ?? null
    : backend.connections.find((connection) => connection.isDefault) ?? backend.connections[0] ?? null;
  const configured = backend.connections.filter((connection) => connection.hasApiKey).length;
  const missingPermissions = Object.entries(backend.permissions).filter(([, granted]) => !granted).map(([name]) => name);

  const patchDetection = (patch: Partial<typeof detection>) => setDraft({ ...draft, detection: { ...detection, ...patch } });
  async function save() {
    try {
      await client.saveSettings(draft);
      client.notify("success", "LumiStage settings saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save settings.");
    }
  }
  async function requestPermissions() {
    try {
      await client.ctx.permissions.request(["generation", "chats", "chat_mutation", "characters", "images", "ui_panels"]);
      const active = client.ctx.getActiveChat();
      client.refresh(active.chatId, active.characterId);
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Permission request was not completed.");
    }
  }

  return (
    <div class="ls2-view">
      <ViewHeader eyebrow="Extension configuration" title="Settings" description="Provider routing, detector defaults, permissions, and LumiStage-owned data." actions={<Button icon="check" variant="primary" disabled={busy} onClick={() => void save()}>Save settings</Button>} />

      <Surface class="ls2-settings-route" padding="none">
        <div class="ls2-settings-route-hero">
          <span class="ls2-settings-route-icon"><Icon name="aperture" size={24} /></span>
          <div><span class="ls2-eyebrow">API connection</span><strong>{selected?.name ?? "Follow active connection"}</strong><small>{selected ? `${selected.provider} · ${detection.model ?? selected.model ?? "Default model"}` : "Uses whichever LLM connection is active in Lumiverse"}</small></div>
          <Status tone={selected?.hasApiKey || (!detection.connectionId && configured > 0) ? "success" : "warning"}>{selected?.hasApiKey || (!detection.connectionId && configured > 0) ? "Available" : "Needs setup"}</Status>
        </div>
        <div class="ls2-settings-route-form">
          <Field label="Connection profile" hint="Choosing Active follows Lumiverse whenever its active connection changes.">
            <select class="ls2-select" value={detection.connectionId ?? ""} onChange={(event) => patchDetection({ connectionId: event.currentTarget.value || null })}>
              <option value="">Active Lumiverse connection</option>
              {detection.connectionId && !backend.connections.some((connection) => connection.id === detection.connectionId) && <option value={detection.connectionId}>Unavailable saved connection</option>}
              {backend.connections.map((connection) => <option value={connection.id}>{connection.name} · {connection.provider}</option>)}
            </select>
          </Field>
          <Field label="Model override" hint="Leave blank to use the selected connection’s configured model.">
            <input class="ls2-input" value={detection.model ?? ""} placeholder={selected?.model || "Connection default"} onInput={(event) => patchDetection({ model: event.currentTarget.value.trim() || null })} />
          </Field>
          <Button icon="settings" onClick={() => client.send({ type: "open-connections" })}>Manage connections in Lumiverse</Button>
        </div>
      </Surface>

      <Surface>
        <SectionTitle title="Available connections" description="LumiStage receives safe profile metadata only. API keys are never exposed." trailing={<span class="ls2-count">{configured} ready</span>} />
        {backend.connections.length ? (
          <div class="ls2-connection-list">
            {backend.connections.map((connection) => (
              <button type="button" data-selected={connection.id === detection.connectionId} onClick={() => patchDetection({ connectionId: connection.id })}>
                <span class="ls2-connection-mark">{connection.name.slice(0, 2).toLocaleUpperCase()}</span>
                <span><strong>{connection.name}</strong><small>{connection.provider} · {connection.model || "Default model"}</small></span>
                <span class="ls2-connection-state" data-ready={connection.hasApiKey}>{connection.isDefault ? "Default" : connection.hasApiKey ? "Ready" : "No key"}</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon="aperture" title="No LLM connections available" description="Create an API connection in Lumiverse, then return here to choose it for expression detection." action={<Button icon="settings" variant="primary" onClick={() => client.send({ type: "open-connections" })}>Open Connections</Button>} />
        )}
      </Surface>

      <Surface>
        <SectionTitle title="Detector defaults" description="Applied to LumiStage’s private classification request." />
        <div class="ls2-range-stack">
          <Field label={`Conversation context · ${detection.contextMessages} messages`} hint="The detector receives only this trailing window."><input class="ls2-range" type="range" min="1" max="20" value={detection.contextMessages} onInput={(event) => patchDetection({ contextMessages: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Adjacent media preload · ${draft.preloadAdjacent}`} hint="More preloading improves transitions but uses additional bandwidth."><input class="ls2-range" type="range" min="0" max="10" value={draft.preloadAdjacent} onInput={(event) => setDraft({ ...draft, preloadAdjacent: Number(event.currentTarget.value) })} /></Field>
        </div>
        <div class="ls2-locked-value"><Icon name="lock" size={14} /><span>Classification temperature is fixed at <strong>0.10</strong> for repeatable decisions.</span></div>
      </Surface>

      <Surface>
        <SectionTitle title="Permissions" description={missingPermissions.length ? `${missingPermissions.length} required permission${missingPermissions.length === 1 ? "" : "s"} unavailable.` : "Every requested LumiStage capability is available."} trailing={<Status tone={missingPermissions.length ? "warning" : "success"}>{missingPermissions.length ? "Review" : "Ready"}</Status>} />
        <div class="ls2-permission-strip">
          {Object.entries(backend.permissions).map(([name, granted]) => <span data-granted={granted}><Icon name={granted ? "check" : "warning"} size={13} />{name.replace(/([A-Z])/g, " $1")}</span>)}
        </div>
        {missingPermissions.length > 0 && <Button icon="lock" onClick={() => void requestPermissions()}>Review permissions</Button>}
      </Surface>

      <Surface>
        <SectionTitle title="LumiStage data" description="Profiles and timelines stay in extension-owned user storage. Archives include only LumiStage metadata and media." />
        <Toolbar>
          <Button icon="download" disabled={!backend.profile} onClick={() => void client.exportProfile()}>Export active profile</Button>
          <Button icon="upload" onClick={() => showImportModal(client, backend.profile)}>Import archive</Button>
        </Toolbar>
      </Surface>

    </div>
  );
}

function AppearanceView({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const [chatScoped, setChatScoped] = useState(Boolean(backend.timeline?.layoutOverride));
  const [draft, setDraft] = useState<LumiStageSettingsV1>({ ...backend.settings, appearance: client.effectiveAppearance() });
  useEffect(() => {
    setChatScoped(Boolean(backend.timeline?.layoutOverride));
    setDraft({ ...backend.settings, appearance: client.effectiveAppearance() });
  }, [backend.settings.revision, backend.timeline?.revision]);
  const appearance = draft.appearance;
  const patch = (value: Partial<typeof appearance>) => setDraft({ ...draft, appearance: { ...appearance, ...value } });
  async function save() {
    if (chatScoped) await client.saveChatLayout(appearance);
    else {
      if (backend.timeline?.layoutOverride) await client.saveChatLayout(null);
      await client.saveSettings(draft);
    }
  }
  return (
    <div class="ls2-view">
      <ViewHeader eyebrow="Stage presentation" title="Appearance" description="LumiStage inherits Lumiverse colors, glass, radii, shadows, font, and UI scaling." actions={<Button icon="check" variant="primary" onClick={() => void save()}>Save changes</Button>} />
      <Surface class="ls2-appearance-preview" padding="none">
        <div class="ls2-preview-window">
          <div class="ls2-preview-toolbar"><span /><span /><span /></div>
          <div class="ls2-preview-actors"><i /><i data-focus /></div>
          <div class="ls2-preview-caption">Focused actor · Outfit / Pose / Expression</div>
        </div>
        <div class="ls2-preview-copy"><strong>Live preview language</strong><span>Every surface and accent shown here comes from the active Lumiverse theme.</span></div>
      </Surface>
      <Surface>
        <Toggle checked={chatScoped} disabled={!backend.activeChatId} onChange={setChatScoped} label="Chat-specific layout" hint="Store geometry and presentation on this LumiStage timeline instead of the global default." />
      </Surface>
      <Surface>
        <SectionTitle title="Motion and composition" />
        <div class="ls2-form-grid">
          <Field label="Transition"><select class="ls2-select" value={appearance.transition} onChange={(event) => patch({ transition: event.currentTarget.value as typeof appearance.transition })}><option value="crossfade">Crossfade</option><option value="lift">Lift</option><option value="cut">Cut</option></select></Field>
          <Field label={`Duration · ${appearance.transitionMs} ms`}><input class="ls2-range" type="range" min="0" max="1000" step="20" value={appearance.transitionMs} onInput={(event) => patch({ transitionMs: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Focused actor · ${appearance.focusedScale.toFixed(2)}×`}><input class="ls2-range" type="range" min=".8" max="1.3" step=".01" value={appearance.focusedScale} onInput={(event) => patch({ focusedScale: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Ensemble overlap · ${Math.round(appearance.ensembleOverlap * 100)}%`}><input class="ls2-range" type="range" min="0" max=".8" step=".02" value={appearance.ensembleOverlap} onInput={(event) => patch({ ensembleOverlap: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Stage opacity · ${Math.round(appearance.opacity * 100)}%`}><input class="ls2-range" type="range" min=".1" max="1" step=".05" value={appearance.opacity} onInput={(event) => patch({ opacity: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Background actors · ${Math.round(appearance.idleOpacity * 100)}%`}><input class="ls2-range" type="range" min=".05" max="1" step=".05" value={appearance.idleOpacity} onInput={(event) => patch({ idleOpacity: Number(event.currentTarget.value) })} /></Field>
        </div>
      </Surface>
      <Surface>
        <SectionTitle title="Stage chrome" />
        <Toggle checked={appearance.showChrome} onChange={(showChrome) => patch({ showChrome })} label="Floating window frame" hint="Use Lumiverse glass, border, and shadow tokens around the stage." />
        <Toggle checked={appearance.showCaptions} onChange={(showCaptions) => patch({ showCaptions })} label="State captions" hint="Show actor, outfit, pose, and expression below each sprite." />
        <Toggle checked={appearance.visible} onChange={(visible) => patch({ visible })} label="Stage visible" hint="The drawer and quick selector remain available while hidden." />
      </Surface>
      <Surface>
        <SectionTitle title="Window size" />
        <div class="ls2-form-grid"><Field label="Width"><input class="ls2-input" type="number" min="200" max="1200" value={appearance.width} onInput={(event) => patch({ width: Number(event.currentTarget.value) })} /></Field><Field label="Height"><input class="ls2-input" type="number" min="240" max="1000" value={appearance.height} onInput={(event) => patch({ height: Number(event.currentTarget.value) })} /></Field></div>
      </Surface>
    </div>
  );
}

function DiagnosticsView({ client, profile }: { client: LumiStageClient; profile: CharacterProfileV1 | null }) {
  const { backend } = useClientState(client);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const issues = profile ? inspectProfile(profile) : [];
  async function refresh() {
    try { setReport(await client.diagnostics()); }
    catch (error) { client.notify("error", error instanceof Error ? error.message : "Diagnostics failed."); }
  }
  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    client.notify("success", "Privacy-safe diagnostics copied.");
  }
  return (
    <div class="ls2-view">
      <ViewHeader eyebrow="System health" title="Diagnostics" description="Runtime, catalog, storage, and permission health without transcripts or raw model output." actions={<><Button icon="refresh" onClick={() => void refresh()}>Refresh</Button><Button icon="copy" variant="primary" disabled={!report} onClick={() => void copy()}>Copy report</Button></>} />
      <div class="ls2-health-grid">
        {Object.entries(backend.permissions).map(([name, granted]) => <div data-good={granted}><span><Icon name={granted ? "success" : "warning"} size={16} /></span><div><strong>{name.replace(/([A-Z])/g, " $1")}</strong><small>{granted ? "Granted" : "Unavailable"}</small></div></div>)}
      </div>
      <Surface>
        <SectionTitle title="Catalog integrity" description={issues.length ? `${issues.length} finding${issues.length === 1 ? "" : "s"} need review.` : "No structural issues found."} trailing={<Status tone={issues.some((item) => item.severity === "error") ? "danger" : issues.length ? "warning" : "success"}>{issues.length ? "Review" : "Healthy"}</Status>} />
        {issues.length > 0 && <div class="ls2-issue-list">{issues.slice(0, 40).map((issue) => <div data-tone={issue.severity}><Icon name={issue.severity === "error" ? "warning" : "info"} size={15} /><span>{issue.message}</span></div>)}</div>}
      </Surface>
      <InlineNotice tone="success"><strong>Privacy boundary active.</strong><span>Generated reports exclude transcript content and raw provider responses.</span></InlineNotice>
      {report && <pre class="ls2-diagnostic-output">{JSON.stringify(report, null, 2)}</pre>}
    </div>
  );
}

export function Studio({ client }: { client: LumiStageClient }) {
  const state = useClientState(client);
  const [view, setView] = useState<StudioView>("stage");
  const [moreOpen, setMoreOpen] = useState(false);
  const [draft, setDraft] = useState<CharacterProfileV1 | null>(state.backend.profile);
  const [dirty, setDirty] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const undoRef = useRef<CharacterProfileV1[]>([]);
  const redoRef = useRef<CharacterProfileV1[]>([]);
  const [, renderHistory] = useState(0);

  useEffect(() => {
    if (!dirty || state.backend.profile?.revision !== draft?.revision) {
      setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
      setDirty(false);
      undoRef.current = [];
      redoRef.current = [];
      renderHistory((value) => value + 1);
    }
  }, [state.backend.profile?.revision]);
  useEffect(() => {
    if (!moreOpen) return;
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [moreOpen]);

  function update(mutator: (profile: CharacterProfileV1) => void) {
    if (!draft) return;
    const next = structuredClone(draft);
    mutator(next);
    undoRef.current.push(structuredClone(draft));
    if (undoRef.current.length > 50) undoRef.current.shift();
    redoRef.current = [];
    next.updatedAt = Date.now();
    setDraft(next);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function mutate(mutation: BatchMutation) {
    if (!draft) return;
    undoRef.current.push(structuredClone(draft));
    redoRef.current = [];
    setDraft(applyBatchMutation(draft, mutation));
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous || !draft) return;
    redoRef.current.push(structuredClone(draft));
    setDraft(previous);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next || !draft) return;
    undoRef.current.push(structuredClone(draft));
    setDraft(next);
    setDirty(true);
    renderHistory((value) => value + 1);
  }
  async function save() {
    if (!draft) return;
    try {
      await client.saveProfile(draft);
      setDirty(false);
      client.notify("success", "LumiStage library saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Save failed.");
    }
  }

  return (
    <div class="ls2-root">
      <div class="ls2-drawer">
        <nav class="ls2-nav" aria-label="LumiStage workspace">
          <div class="ls2-nav-primary">
            {PRIMARY_NAV.map((item) => <button type="button" data-active={view === item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => { setView(item.id); setMoreOpen(false); }}><Icon name={item.icon} size={17} /><span>{item.label}</span></button>)}
            <button type="button" data-active={SECONDARY_NAV.some((item) => item.id === view)} aria-expanded={moreOpen} aria-haspopup="menu" onClick={() => setMoreOpen((value) => !value)}><Icon name="menu" size={17} /><span>More</span></button>
          </div>
          {moreOpen && (
            <div class="ls2-nav-menu" role="menu">
              <div class="ls2-nav-menu-head"><span>Workspace</span><IconButton icon="close" label="Close menu" onClick={() => setMoreOpen(false)} /></div>
              {SECONDARY_NAV.map((item) => (
                <button type="button" role="menuitem" data-active={view === item.id} aria-current={view === item.id ? "page" : undefined} onClick={() => { setView(item.id); setMoreOpen(false); }}>
                  <span class="ls2-nav-menu-icon"><Icon name={item.icon} size={18} /></span>
                  <span><strong>{item.label}</strong><small>{item.id === "automation" ? "Detection and confidence" : item.id === "appearance" ? "Stage layout and motion" : item.id === "settings" ? "Connections and extension data" : "Health and privacy report"}</small></span>
                  <Icon name="chevronRight" size={16} />
                </button>
              ))}
            </div>
          )}
        </nav>

        <ProgressNotice client={client} />
        <main class="ls2-content">
          {view === "stage" && <LiveView client={client} navigate={setView} />}
          {view === "library" && <LibraryView client={client} profile={draft} update={update} selected={selected} setSelected={setSelected} />}
          {view === "batch" && <BatchView profile={draft} selected={selected} setSelected={setSelected} mutate={mutate} undo={undo} redo={redo} canUndo={undoRef.current.length > 0} canRedo={redoRef.current.length > 0} />}
          {view === "automation" && <AutomationView client={client} openSettings={() => setView("settings")} />}
          {view === "appearance" && <AppearanceView client={client} />}
          {view === "settings" && <SettingsView client={client} />}
          {view === "diagnostics" && <DiagnosticsView client={client} profile={draft} />}
        </main>

        {(dirty || view === "library" || view === "batch") && (
          <div class="ls2-savebar" data-dirty={dirty}>
            <div><span class="ls2-save-dot" /><span>{dirty ? "Unsaved library changes" : "Library is up to date"}</span></div>
            <Toolbar>
              <Button size="small" variant="ghost" disabled={!dirty} onClick={() => { setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null); setDirty(false); }}>Revert</Button>
              <Button size="small" variant="primary" icon="check" disabled={!dirty || state.busy} onClick={() => void save()}>Save</Button>
            </Toolbar>
          </div>
        )}
      </div>
    </div>
  );
}

export function CharacterSetup({ client, characterId, onOpenStudio }: { client: LumiStageClient; characterId: string; onOpenStudio: () => void }) {
  const { backend } = useClientState(client);
  const profile = backend.profile?.characterId === characterId ? backend.profile : null;
  useEffect(() => client.send({ type: "character-editor", characterId }), [characterId]);
  if (!profile) return <div class="ls2-root ls2-character-panel"><div class="ls2-loading"><span /><strong>Loading LumiStage profile…</strong></div></div>;
  const assets = allAssets(profile);
  const outfits = profile.actors.reduce((sum, actor) => sum + actor.outfits.length, 0);
  return (
    <div class="ls2-root ls2-character-panel">
      <div class="ls2-character-hero">
        <ContextAvatar name={profile.characterName} />
        <div><span class="ls2-eyebrow">Independent visual profile</span><h2>{profile.characterName}</h2><p>Actor, outfit, pose, and expression direction owned entirely by LumiStage.</p></div>
      </div>
      <div class="ls2-metric-grid"><div><Icon name="actors" size={18} /><span><strong>{profile.actors.length}</strong>Actors</span></div><div><Icon name="outfit" size={18} /><span><strong>{outfits}</strong>Outfits</span></div><div><Icon name="image" size={18} /><span><strong>{assets.length}</strong>Media</span></div></div>
      <Surface><SectionTitle title="Manage this profile" description="Open the full studio for visual libraries, batch operations, automation, archives, and diagnostics." /><Toolbar><Button icon="stage" variant="primary" onClick={onOpenStudio}>Open LumiStage</Button><Button icon="upload" onClick={() => showImportModal(client, profile)}>Import media</Button></Toolbar></Surface>
    </div>
  );
}
