import { render } from "preact";
import type { ComponentChildren, JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createId } from "../ids";
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
  ActorStageState,
  BatchMutation,
  CharacterProfileV1,
  ExpressionState,
  ImportLayout,
  LumiStageSettingsV1,
  ManualOverride,
  OutfitFolder,
  PoseState,
  StageAsset,
  StudioView,
} from "../types";
import type { ClientUiState, LumiStageClient } from "./client";

const STAGE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 4h16M6 4v5m12-5v5M5 20h14" />
    <path d="M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z" />
    <path d="M10 14c.8.7 3.2.7 4 0" />
  </svg>
);

function useClientState(client: LumiStageClient): ClientUiState {
  const [state, setState] = useState<ClientUiState>(() => client.getSnapshot());
  useEffect(() => client.subscribe(() => setState(client.getSnapshot())), [client]);
  return state;
}

function Button(props: {
  children: ComponentChildren;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "warm" | "danger";
  title?: string;
  type?: "button" | "submit";
}) {
  const tone = props.tone ? ` ls-button-${props.tone}` : "";
  return <button type={props.type ?? "button"} class={`ls-button${tone}`} onClick={props.onClick} disabled={props.disabled} title={props.title}>{props.children}</button>;
}

function Toggle(props: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string }) {
  return (
    <div class="ls-switch-row">
      <div class="ls-switch-copy"><strong>{props.label}</strong>{props.hint && <span>{props.hint}</span>}</div>
      <button type="button" class="ls-switch" role="switch" aria-checked={props.checked} aria-label={props.label} onClick={() => props.onChange(!props.checked)} />
    </div>
  );
}

function Field(props: { label: string; children: ComponentChildren }) {
  return <label class="ls-field"><span class="ls-field-label">{props.label}</span>{props.children}</label>;
}

function SectionHead(props: { title: string; note: string; actions?: ComponentChildren }) {
  return (
    <div class="ls-section-head">
      <div><h2 class="ls-section-title">{props.title}</h2><p class="ls-section-note">{props.note}</p></div>
      {props.actions && <div class="ls-toolbar">{props.actions}</div>}
    </div>
  );
}

function Notice({ client }: { client: LumiStageClient }) {
  const { notice, progress } = useClientState(client);
  if (!notice && !progress) return null;
  return (
    <div class="ls-notice" data-tone={notice?.tone ?? "info"} role="status">
      {notice?.message ?? progress?.message}
      {progress && progress.total > 0 && (
        <div class="ls-progress" style={{ marginTop: 6 }}>
          <div class="ls-progress-bar" style={{ width: `${Math.min(100, (progress.completed / progress.total) * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

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

function Media({ src, kind, label, className = "ls-asset-media" }: { src: string | null; kind: "image" | "video"; label: string; className?: string }) {
  if (!src) return <div class={`${className} ls-live-avatar-fallback`} aria-label={`${label} media unavailable`}>?</div>;
  if (kind === "video") return <video class={className} src={src} muted loop playsInline autoPlay aria-label={label} />;
  return <img class={className} src={src} alt={label} loading="lazy" draggable={false} />;
}

function LiveView({ client, openQuick }: { client: LumiStageClient; openQuick: () => void }) {
  const { backend } = useClientState(client);
  const actors = Object.values(backend.snapshot?.actors ?? {}).sort((a, b) => Number(b.focused) - Number(a.focused));
  const statusTone = backend.lastDetection.status === "error" ? "error" : backend.lastDetection.status === "success" ? "success" : backend.lastDetection.status === "running" ? "warning" : "info";
  return (
    <section class="ls-section">
      <SectionHead
        title="Live Stage"
        note="The current independent stage state for this chat."
        actions={<><Button onClick={openQuick} disabled={!backend.activeChatId}>Quick select</Button><Button tone="primary" onClick={() => client.analyzeNow()} disabled={!backend.activeChatId}>Analyze now</Button></>}
      />
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Detector</h3><span class="ls-badge" data-tone={statusTone}>{backend.lastDetection.status}</span></div>
        <p class="ls-section-note">{backend.lastDetection.message}</p>
        {backend.queueDepth > 0 && <div class="ls-progress" style={{ marginTop: 9 }}><div class="ls-progress-bar" style={{ width: "72%" }} /></div>}
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Ensemble</h3><span class="ls-badge">{actors.length} actors</span></div>
        {actors.length === 0 ? <div class="ls-empty"><div><strong>The stage is waiting</strong>Import media in Library, then analyze a completed reply or choose a state manually.</div></div> : (
          <div class="ls-live-list">
            {actors.map((actor) => {
              const view = actor.assetId ? backend.assetViews[actor.assetId] : null;
              return (
                <div class="ls-live-row" key={actor.actorId}>
                  <Media src={view?.thumbUrl ?? view?.url ?? null} kind={view?.mediaKind ?? "image"} label={actor.label} className="ls-live-avatar" />
                  <div style={{ minWidth: 0 }}><div class="ls-live-name">{actor.label.split(" · ")[0]}</div><div class="ls-live-state">{actor.label.split(" · ").slice(1).join(" / ")}</div></div>
                  <span class="ls-badge" data-tone={actor.focused ? "success" : "info"}>{actor.focused ? "focus" : `${Math.round(actor.confidence * 100)}%`}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div class="ls-stat-grid">
        <div class="ls-stat"><strong>{backend.stageProfiles.reduce((sum, profile) => sum + profile.actors.length, 0)}</strong><span>Actors</span></div>
        <div class="ls-stat"><strong>{backend.stageProfiles.reduce((sum, profile) => sum + allAssets(profile).length, 0)}</strong><span>Media</span></div>
        <div class="ls-stat"><strong>{Object.keys(backend.timeline?.manualOverrides ?? {}).length}</strong><span>Locks</span></div>
      </div>
    </section>
  );
}

function LibraryView(props: {
  client: LumiStageClient;
  profile: CharacterProfileV1 | null;
  update: (mutator: (draft: CharacterProfileV1) => void) => void;
  selected: Set<string>;
  setSelected: (selection: Set<string>) => void;
  importMedia: () => void;
}) {
  const { backend } = useClientState(props.client);
  const [actorId, setActorId] = useState<string | undefined>(props.profile?.actors[0]?.id);
  const [outfitId, setOutfitId] = useState<string | undefined>();
  const [poseId, setPoseId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const lastIndex = useRef<number | null>(null);
  const { actor, outfit, pose } = activeNodes(props.profile, actorId, outfitId, poseId);

  useEffect(() => {
    if (!actorId && props.profile?.actors[0]) setActorId(props.profile.actors[0].id);
  }, [props.profile, actorId]);
  useEffect(() => {
    if (actor && !actor.outfits.some((item) => item.id === outfitId)) setOutfitId(actor.outfits[0]?.id);
  }, [actor, outfitId]);
  useEffect(() => {
    if (outfit && !outfit.poses.some((item) => item.id === poseId)) setPoseId(outfit.poses[0]?.id);
  }, [outfit, poseId]);

  const rows = useMemo(() => {
    if (!actor || !outfit || !pose) return [];
    const needle = query.trim().toLocaleLowerCase();
    return pose.expressions.flatMap((expression) =>
      expression.assets.map((asset) => ({ expression, asset }))
    ).filter(({ expression, asset }) => !needle || [expression.name, asset.fileName, ...expression.tags, ...expression.aliases].join(" ").toLocaleLowerCase().includes(needle));
  }, [actor, outfit, pose, query]);
  const pageSize = 96;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
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

  function addActor() {
    const name = window.prompt("Actor name");
    if (!name) return;
    props.update((profile) => {
      const next = createActor(name);
      next.order = profile.actors.length;
      profile.actors.push(next);
    });
  }
  function addOutfit() {
    const name = window.prompt("Outfit folder name");
    if (!name || !actor) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id);
      if (!target) return;
      const next = createOutfit(name);
      next.order = target.outfits.length;
      target.outfits.push(next);
      target.defaultOutfitId ??= next.id;
      setOutfitId(next.id);
    });
  }
  function addPose() {
    const name = window.prompt("Pose name");
    if (!name || !actor || !outfit) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id);
      if (!target) return;
      const next = createPose(name);
      next.order = target.poses.length;
      target.poses.push(next);
      target.defaultPoseId ??= next.id;
      setPoseId(next.id);
    });
  }
  function addExpression() {
    const name = window.prompt("Expression name");
    if (!name || !actor || !outfit || !pose) return;
    props.update((profile) => {
      const target = profile.actors.find((item) => item.id === actor.id)
        ?.outfits.find((item) => item.id === outfit.id)
        ?.poses.find((item) => item.id === pose.id);
      if (!target) return;
      const next = createExpression(name);
      next.order = target.expressions.length;
      target.expressions.push(next);
      target.defaultExpressionId ??= next.id;
    });
  }

  function reorderNodes(kind: "outfit" | "pose", sourceId: string, targetId: string) {
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

  const listValue = (values: string[]) => values.join(", ");
  const parseList = (value: string) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

  if (!props.profile) return <section class="ls-section"><SectionHead title="Library" note="Open a character or chat to edit its LumiStage profile." /><div class="ls-empty"><div><strong>No character selected</strong>Choose a character in Lumiverse, then return to LumiStage.</div></div></section>;

  return (
    <section class="ls-section">
      <SectionHead title="Library" note="Layer media through actor, outfit, pose, and expression folders." actions={<><Button onClick={props.importMedia} tone="primary">Import media</Button><Button onClick={addActor}>+ Actor</Button></>} />
      <div class="ls-card">
        <div class="ls-grid-2">
          <Field label="Actor"><select class="ls-select" value={actor?.id} onChange={(event) => setActorId(event.currentTarget.value)}>{props.profile.actors.map((item) => <option value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Search this pose"><input class="ls-input" value={query} onInput={(event) => setQuery(event.currentTarget.value)} placeholder="Names, aliases, tags…" /></Field>
        </div>
      </div>
      <div class="ls-library-layout">
        <div class="ls-card ls-library-tree">
          <div class="ls-card-head"><h3 class="ls-card-title">Outfits</h3><button class="ls-icon-btn" type="button" onClick={addOutfit} aria-label="Add outfit">+</button></div>
          <div class="ls-tree">
            {actor?.outfits.map((item) => (
              <div class="ls-tree-row" key={item.id} draggable onDragStart={() => setDraggedNode(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedNode) reorderNodes("outfit", draggedNode, item.id); setDraggedNode(null); }}>
                <button type="button" class="ls-tree-btn" data-active={item.id === outfit?.id} onClick={() => setOutfitId(item.id)}>
                  <span>{item.name}</span><span class="ls-tree-count">{item.poses.reduce((sum, value) => sum + value.expressions.reduce((n, expression) => n + expression.assets.length, 0), 0)}</span>
                </button>
              </div>
            ))}
          </div>
          <div class="ls-card-head" style={{ marginTop: 12 }}><h3 class="ls-card-title">Poses</h3><button class="ls-icon-btn" type="button" onClick={addPose} aria-label="Add pose">+</button></div>
          <div class="ls-tree">
            {outfit?.poses.map((item) => (
              <div class="ls-tree-row" key={item.id} draggable onDragStart={() => setDraggedNode(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedNode) reorderNodes("pose", draggedNode, item.id); setDraggedNode(null); }}><button type="button" class="ls-tree-btn" data-active={item.id === pose?.id} onClick={() => setPoseId(item.id)}><span>{item.name}</span><span class="ls-tree-count">{item.expressions.length}</span></button></div>
            ))}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div class="ls-toolbar" style={{ marginBottom: 8 }}>
            <span class="ls-badge">{rows.length} media · page {safePage + 1}/{pageCount}</span>
            <Button onClick={addExpression}>+ Empty expression</Button>
            <Button onClick={() => props.setSelected(new Set(pageRows.map((row) => row.asset.id)))} disabled={!pageRows.length}>Select page</Button>
            <Button onClick={() => props.setSelected(new Set(rows.map((row) => row.asset.id)))} disabled={!rows.length}>Select all filtered</Button>
            <Button onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>←</Button>
            <Button onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} disabled={safePage >= pageCount - 1}>→</Button>
          </div>
          {rows.length === 0 ? <div class="ls-empty"><div><strong>No media in this pose</strong>Import images or video, or create an empty expression slot.</div></div> : (
            <div class="ls-asset-grid">
              {pageRows.map(({ expression, asset }, index) => {
                const view = backend.assetViews[asset.id];
                return (
                  <article class="ls-asset" data-selected={props.selected.has(asset.id)} key={asset.id} onClick={(event) => select(pageStart + index, asset.id, event.shiftKey)}>
                    <input class="ls-asset-check" type="checkbox" checked={props.selected.has(asset.id)} onClick={(event) => event.stopPropagation()} onChange={() => select(pageStart + index, asset.id, false)} aria-label={`Select ${expression.name}`} />
                    <Media src={view?.thumbUrl ?? view?.url ?? null} kind={asset.mediaKind} label={expression.name} />
                    <div class="ls-asset-meta"><div class="ls-asset-name">{expression.name}</div><div class="ls-asset-kind">{asset.mediaKind} · priority {asset.priority}</div></div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {actor && outfit && pose && (
        <div class="ls-card" style={{ marginTop: 10 }}>
          <div class="ls-card-head"><h3 class="ls-card-title">Folder direction metadata</h3><span class="ls-badge">aliases · cues · defaults</span></div>
          <div class="ls-grid-2">
            <Field label="Actor aliases"><input class="ls-input" value={listValue(actor.aliases)} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id); if (node) node.aliases = parseList(event.currentTarget.value); })} /></Field>
            <Field label="Outfit aliases"><input class="ls-input" value={listValue(outfit.aliases)} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.aliases = parseList(event.currentTarget.value); })} /></Field>
            <Field label="Outfit cue phrases"><input class="ls-input" value={listValue(outfit.cues)} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.cues = parseList(event.currentTarget.value); })} /></Field>
            <Field label="Pose cue phrases"><input class="ls-input" value={listValue(pose.cues)} onChange={(event) => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id)?.poses.find((item) => item.id === pose.id); if (node) node.cues = parseList(event.currentTarget.value); })} /></Field>
          </div>
          <div class="ls-toolbar" style={{ marginTop: 9 }}>
            <Button onClick={() => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id); if (node) node.defaultOutfitId = outfit.id; })}>Set default outfit</Button>
            <Button onClick={() => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.defaultPoseId = pose.id; })}>Set default pose</Button>
            <Button onClick={() => props.update((profile) => { const node = profile.actors.find((item) => item.id === actor.id)?.outfits.find((item) => item.id === outfit.id); if (node) node.allowAutoSwitch = !node.allowAutoSwitch; })}>{outfit.allowAutoSwitch ? "Disable outfit automation" : "Enable outfit automation"}</Button>
          </div>
        </div>
      )}
    </section>
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
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [tags, setTags] = useState("");
  const [aliases, setAliases] = useState("");
  const [destination, setDestination] = useState("");
  const selectedExpressions = useMemo(() => {
    if (!props.profile) return [];
    return [...new Set([...props.selected].map((assetId) => assetLocation(props.profile!, assetId)?.expression.id).filter((id): id is string => !!id))];
  }, [props.profile, props.selected]);
  const profile = props.profile;
  const expressionNames = profile ? [...new Set(allExpressions(profile).map((item) => item.name))] : [];
  const poses = profile?.actors.flatMap((actor) => actor.outfits.flatMap((outfit) => outfit.poses)) ?? [];
  const destinations = profile?.actors.flatMap((actor) => actor.outfits.flatMap((outfit) =>
    outfit.poses.map((pose) => ({
      key: `${outfit.id}|${pose.id}`,
      outfitId: outfit.id,
      poseId: pose.id,
      label: `${actor.name} / ${outfit.name} / ${pose.name}`,
    })),
  )) ?? [];
  const selectedDestination = destinations.find((item) => item.key === destination) ?? null;
  return (
    <section class="ls-section">
      <SectionHead title="Batch Lab" note="Preview and apply reversible changes across selected media." actions={<><Button onClick={props.undo} disabled={!props.canUndo}>Undo</Button><Button onClick={props.redo} disabled={!props.canRedo}>Redo</Button></>} />
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Selection</h3><span class="ls-badge">{props.selected.size} media · {selectedExpressions.length} expressions</span></div>
        <div class="ls-toolbar">
          <Button onClick={() => profile && props.setSelected(new Set(allAssets(profile).map((asset) => asset.id)))} disabled={!profile}>Select all</Button>
          <Button onClick={() => props.setSelected(new Set())} disabled={!props.selected.size}>Clear</Button>
          <Button onClick={() => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: true })} disabled={!props.selected.size}>Enable</Button>
          <Button onClick={() => props.mutate({ type: "set-enabled", assetIds: [...props.selected], enabled: false })} disabled={!props.selected.size}>Disable</Button>
          <Button onClick={() => props.mutate({ type: "duplicate", assetIds: [...props.selected] })} disabled={!props.selected.size}>Duplicate</Button>
          <Button tone="danger" onClick={() => props.mutate({ type: "delete", assetIds: [...props.selected] })} disabled={!props.selected.size}>Session trash</Button>
        </div>
        <p class="ls-section-note" style={{ marginTop: 8 }}>Session trash is recoverable with Undo until the library is saved.</p>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Priority</h3></div>
        <div class="ls-grid-2">
          <Field label="Asset priority"><input class="ls-input" type="number" value={priority} onInput={(event) => setPriority(Number(event.currentTarget.value))} /></Field>
          <div class="ls-toolbar" style={{ alignItems: "end" }}><Button tone="primary" disabled={!props.selected.size} onClick={() => props.mutate({ type: "set-priority", assetIds: [...props.selected], priority })}>Apply priority</Button></div>
        </div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Tags and aliases</h3></div>
        <div class="ls-grid-2">
          <Field label="Tags (comma separated)"><input class="ls-input" value={tags} onInput={(event) => setTags(event.currentTarget.value)} placeholder="smile, joy, bright" /></Field>
          <Field label="Aliases (comma separated)"><input class="ls-input" value={aliases} onInput={(event) => setAliases(event.currentTarget.value)} placeholder="grin, cheerful" /></Field>
        </div>
        <div class="ls-toolbar" style={{ marginTop: 9 }}>
          <Button disabled={!selectedExpressions.length || !tags.trim()} onClick={() => props.mutate({ type: "add-tags", expressionIds: selectedExpressions, tags: tags.split(",") })}>Add tags</Button>
          <Button disabled={!selectedExpressions.length || !aliases.trim()} onClick={() => props.mutate({ type: "add-aliases", expressionIds: selectedExpressions, aliases: aliases.split(",") })}>Add aliases</Button>
        </div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Move / reassign</h3></div>
        <div class="ls-grid-2">
          <Field label="Destination pose"><select class="ls-select" value={destination} onChange={(event) => setDestination(event.currentTarget.value)}><option value="">Choose destination…</option>{destinations.map((item) => <option value={item.key}>{item.label}</option>)}</select></Field>
          <div class="ls-toolbar" style={{ alignItems: "end" }}><Button tone="primary" disabled={!props.selected.size || !selectedDestination} onClick={() => selectedDestination && props.mutate({ type: "move", assetIds: [...props.selected], outfitId: selectedDestination.outfitId, poseId: selectedDestination.poseId })}>Move selected media</Button></div>
        </div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Rename expressions</h3><span class="ls-badge">preview: {find ? `${find} → ${replace || "∅"}` : "enter text"}</span></div>
        <div class="ls-grid-2"><Field label="Find"><input class="ls-input" value={find} onInput={(event) => setFind(event.currentTarget.value)} /></Field><Field label="Replace"><input class="ls-input" value={replace} onInput={(event) => setReplace(event.currentTarget.value)} /></Field></div>
        <div class="ls-toolbar" style={{ marginTop: 9 }}><Button disabled={!find || !selectedExpressions.length} onClick={() => props.mutate({ type: "rename", expressionIds: selectedExpressions, find, replace })}>Apply rename</Button></div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Completeness matrix</h3><span class="ls-badge">{poses.length} poses</span></div>
        {poses.length && expressionNames.length ? (
          <div style={{ overflowX: "auto" }}>
            <table class="ls-matrix"><thead><tr><th>Pose</th>{expressionNames.map((name) => <th>{name}</th>)}</tr></thead><tbody>{poses.map((pose) => <tr><th>{pose.name}</th>{expressionNames.map((name) => {
              const expression = pose.expressions.find((item) => item.name === name);
              const complete = !!expression?.assets.some((asset) => asset.enabled);
              return <td data-complete={complete}>{complete ? "●" : "○"}</td>;
            })}</tr>)}</tbody></table>
          </div>
        ) : <div class="ls-empty"><div><strong>No matrix yet</strong>Add outfits, poses, expressions, and media to see coverage.</div></div>}
      </div>
    </section>
  );
}

function AutomationView({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = useState<LumiStageSettingsV1>(backend.settings);
  useEffect(() => setDraft(backend.settings), [backend.settings.revision]);
  const detection = draft.detection;
  const missing = [
    !backend.permissions.generation && "Generation",
    !backend.permissions.chats && "Chats",
    !backend.permissions.chatMutation && "Chat History",
  ].filter(Boolean);
  return (
    <section class="ls-section">
      <SectionHead title="Automation" note="One structured post-reply classification, independent from Lumiverse’s built-in detector." actions={<Button tone="primary" onClick={() => void client.saveSettings(draft)}>Save</Button>} />
      {missing.length > 0 && <div class="ls-notice" data-tone="warning">Automation is waiting for: {missing.join(", ")}.</div>}
      <div class="ls-card">
        <Toggle checked={detection.enabled} onChange={(enabled) => setDraft({ ...draft, detection: { ...detection, enabled } })} label="Automatic post-reply detection" hint="Runs after a successfully saved assistant reply. Errors and stopped generations leave the stage unchanged." />
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Controller</h3><span class="ls-badge">temperature {detection.temperature.toFixed(2)}</span></div>
        <div class="ls-grid-2">
          <Field label="Connection profile ID"><input class="ls-input" value={detection.connectionId ?? ""} placeholder="Blank uses active connection" onInput={(event) => setDraft({ ...draft, detection: { ...detection, connectionId: event.currentTarget.value || null } })} /></Field>
          <Field label="Model override"><input class="ls-input" value={detection.model ?? ""} placeholder="Connection default" onInput={(event) => setDraft({ ...draft, detection: { ...detection, model: event.currentTarget.value || null } })} /></Field>
          <Field label={`Context messages · ${detection.contextMessages}`}><input class="ls-range" type="range" min="1" max="20" value={detection.contextMessages} onInput={(event) => setDraft({ ...draft, detection: { ...detection, contextMessages: Number(event.currentTarget.value) } })} /></Field>
          <Field label={`Temperature · ${detection.temperature.toFixed(2)}`}><input class="ls-range" type="range" min="0" max="1" step=".05" value={detection.temperature} onInput={(event) => setDraft({ ...draft, detection: { ...detection, temperature: Number(event.currentTarget.value) } })} /></Field>
        </div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Confidence gates</h3></div>
        <div class="ls-grid-2">
          <Field label={`Pose / expression · ${Math.round(detection.stateConfidence * 100)}%`}><input class="ls-range" type="range" min=".3" max=".95" step=".05" value={detection.stateConfidence} onInput={(event) => setDraft({ ...draft, detection: { ...detection, stateConfidence: Number(event.currentTarget.value) } })} /></Field>
          <Field label={`Sticky outfit · ${Math.round(detection.outfitConfidence * 100)}%`}><input class="ls-range" type="range" min=".5" max="1" step=".05" value={detection.outfitConfidence} onInput={(event) => setDraft({ ...draft, detection: { ...detection, outfitConfidence: Number(event.currentTarget.value) } })} /></Field>
        </div>
        <p class="ls-section-note">An outfit still requires an explicit clothing cue and an outfit folder that permits automatic switching.</p>
      </div>
    </section>
  );
}

function AppearanceView({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const [chatScoped, setChatScoped] = useState(Boolean(backend.timeline?.layoutOverride));
  const [draft, setDraft] = useState<LumiStageSettingsV1>({
    ...backend.settings,
    appearance: client.effectiveAppearance(),
  });
  useEffect(() => {
    setChatScoped(Boolean(backend.timeline?.layoutOverride));
    setDraft({ ...backend.settings, appearance: client.effectiveAppearance() });
  }, [backend.settings.revision, backend.timeline?.revision]);
  const appearance = draft.appearance;
  const patch = (value: Partial<typeof appearance>) => setDraft({ ...draft, appearance: { ...appearance, ...value } });
  async function save() {
    if (chatScoped) {
      await client.saveChatLayout(appearance);
      return;
    }
    if (backend.timeline?.layoutOverride) await client.saveChatLayout(null);
    await client.saveSettings(draft);
  }
  return (
    <section class="ls-section">
      <SectionHead title="Appearance" note="Tune the chromeless stage while preserving the active Lumiverse theme." actions={<Button tone="primary" onClick={() => void save()}>Save</Button>} />
      <div class="ls-card">
        <Toggle checked={chatScoped} onChange={setChatScoped} label="Chat-specific stage layout" hint="Store this stage geometry and appearance on LumiStage’s private chat timeline instead of the global default." />
        {!backend.activeChatId && <p class="ls-section-note">Open a chat to enable a chat-specific layout.</p>}
      </div>
      <div class="ls-card">
        <div class="ls-grid-2">
          <Field label="Transition"><select class="ls-select" value={appearance.transition} onChange={(event) => patch({ transition: event.currentTarget.value as typeof appearance.transition })}><option value="crossfade">Crossfade</option><option value="lift">Lift</option><option value="cut">Cut</option></select></Field>
          <Field label={`Duration · ${appearance.transitionMs}ms`}><input class="ls-range" type="range" min="0" max="1000" step="20" value={appearance.transitionMs} onInput={(event) => patch({ transitionMs: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Stage opacity · ${Math.round(appearance.opacity * 100)}%`}><input class="ls-range" type="range" min=".1" max="1" step=".05" value={appearance.opacity} onInput={(event) => patch({ opacity: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Idle actors · ${Math.round(appearance.idleOpacity * 100)}%`}><input class="ls-range" type="range" min=".05" max="1" step=".05" value={appearance.idleOpacity} onInput={(event) => patch({ idleOpacity: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Focus scale · ${appearance.focusedScale.toFixed(2)}×`}><input class="ls-range" type="range" min=".8" max="1.3" step=".01" value={appearance.focusedScale} onInput={(event) => patch({ focusedScale: Number(event.currentTarget.value) })} /></Field>
          <Field label={`Ensemble overlap · ${Math.round(appearance.ensembleOverlap * 100)}%`}><input class="ls-range" type="range" min="0" max=".8" step=".02" value={appearance.ensembleOverlap} onInput={(event) => patch({ ensembleOverlap: Number(event.currentTarget.value) })} /></Field>
        </div>
      </div>
      <div class="ls-card">
        <Toggle checked={appearance.showChrome} onChange={(showChrome) => patch({ showChrome })} label="Cinematic stage frame" hint="Adds a subtle themed frame and lighting well." />
        <Toggle checked={appearance.showCaptions} onChange={(showCaptions) => patch({ showCaptions })} label="State captions" hint="Shows actor, outfit, pose, and expression labels." />
        <Toggle checked={appearance.visible} onChange={(visible) => patch({ visible })} label="Stage visible" hint="The drawer and quick selector remain available while hidden." />
      </div>
      <div class="ls-card"><div class="ls-grid-2"><Field label="Width"><input class="ls-input" type="number" min="180" max="1200" value={appearance.width} onInput={(event) => patch({ width: Number(event.currentTarget.value) })} /></Field><Field label="Height"><input class="ls-input" type="number" min="220" max="1000" value={appearance.height} onInput={(event) => patch({ height: Number(event.currentTarget.value) })} /></Field></div></div>
    </section>
  );
}

function DiagnosticsView({ client, profile }: { client: LumiStageClient; profile: CharacterProfileV1 | null }) {
  const { backend } = useClientState(client);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const issues = profile ? inspectProfile(profile) : [];
  async function refresh() {
    try { setReport(await client.diagnostics()); } catch (error) { client.notify("error", error instanceof Error ? error.message : "Diagnostics failed."); }
  }
  async function copy() {
    const text = JSON.stringify(report, null, 2);
    await navigator.clipboard.writeText(text);
    client.notify("success", "Privacy-safe diagnostics copied.");
  }
  return (
    <section class="ls-section">
      <SectionHead title="Diagnostics" note="Catalog and runtime health without transcript text or raw detector output." actions={<><Button onClick={() => void refresh()}>Refresh</Button><Button onClick={() => void copy()} disabled={!report}>Copy report</Button></>} />
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Permissions</h3><span class="ls-badge">{Object.values(backend.permissions).filter(Boolean).length}/6 granted</span></div>
        <div class="ls-toolbar">{Object.entries(backend.permissions).map(([name, granted]) => <span class="ls-badge" data-tone={granted ? "success" : "error"}>{name}</span>)}</div>
      </div>
      <div class="ls-card">
        <div class="ls-card-head"><h3 class="ls-card-title">Catalog integrity</h3><span class="ls-badge" data-tone={issues.some((item) => item.severity === "error") ? "error" : issues.length ? "warning" : "success"}>{issues.length} findings</span></div>
        {issues.length ? <div class="ls-live-list">{issues.slice(0, 40).map((issue) => <div class="ls-live-row" style={{ gridTemplateColumns: "auto 1fr" }}><span class="ls-badge" data-tone={issue.severity}>{issue.severity}</span><div class="ls-live-state">{issue.message}</div></div>)}</div> : <p class="ls-section-note">No catalog issues found.</p>}
      </div>
      {report && <pre class="ls-diagnostic">{JSON.stringify(report, null, 2)}</pre>}
    </section>
  );
}

function openImportModal(client: LumiStageClient, profile: CharacterProfileV1 | null) {
  const modal = client.ctx.ui.showModal({ title: "Import LumiStage media", width: 560, maxHeight: 650, persistent: true });
  function ImportBody() {
    const [files, setFiles] = useState<File[]>([]);
    const [layout, setLayout] = useState<ImportLayout>("outfit-pose-expression");
    const [actorId, setActorId] = useState(profile?.defaultActorId ?? profile?.actors[0]?.id ?? "");
    const [working, setWorking] = useState(false);
    async function run() {
      setWorking(true);
      try {
        await client.importFiles(files, layout, actorId || undefined);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
      } finally { setWorking(false); }
    }
    return (
      <div class="ls-modal-root">
        <label class="ls-file-drop">
          <input type="file" multiple accept=".zip,image/png,image/jpeg,image/webp,image/gif,video/webm,video/mp4" onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))} />
          <div><strong>{files.length ? `${files.length} file(s) selected` : "Choose images, video, or a ZIP archive"}</strong><p class="ls-section-note">PNG, JPEG, WebP, GIF, WebM, MP4, and .lumistage.zip are supported.</p></div>
        </label>
        <Field label="Folder mapping"><select class="ls-select" value={layout} onChange={(event) => setLayout(event.currentTarget.value as ImportLayout)}><option value="outfit-pose-expression">Outfit / Pose / Expression</option><option value="actor-outfit-pose-expression">Actor / Outfit / Pose / Expression</option></select></Field>
        {layout === "outfit-pose-expression" && profile && <Field label="Target actor"><select class="ls-select" value={actorId} onChange={(event) => setActorId(event.currentTarget.value)}>{profile.actors.map((actor) => <option value={actor.id}>{actor.name}</option>)}</select></Field>}
        <div class="ls-card"><p class="ls-section-note">Shallower paths receive explicit Default outfit/pose levels. Unsafe paths, unsupported codecs, duplicates, oversized entries, and archive bombs are rejected before the profile is committed.</p></div>
        <div class="ls-modal-actions"><Button onClick={() => modal.dismiss()}>Cancel</Button><Button tone="primary" disabled={!files.length || working} onClick={() => void run()}>{working ? "Importing…" : "Import"}</Button></div>
      </div>
    );
  }
  render(<ImportBody />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export function showQuickPicker(client: LumiStageClient) {
  const modal = client.ctx.ui.showModal({ title: "LumiStage quick select", width: 520, maxHeight: 660 });
  function Picker() {
    const { backend } = useClientState(client);
    const profiles = backend.stageProfiles;
    const actors = profiles.flatMap((profile) => profile.actors.map((actor) => ({ profile, actor })));
    const [actorId, setActorId] = useState(actors[0]?.actor.id ?? "");
    const entry = actors.find((item) => item.actor.id === actorId) ?? actors[0];
    const current = backend.snapshot?.actors[entry?.actor.id ?? ""];
    const [outfitId, setOutfitId] = useState(current?.outfitId ?? entry?.actor.defaultOutfitId ?? entry?.actor.outfits[0]?.id ?? "");
    const outfit = entry?.actor.outfits.find((item) => item.id === outfitId) ?? entry?.actor.outfits[0];
    const [poseId, setPoseId] = useState(current?.poseId ?? outfit?.defaultPoseId ?? outfit?.poses[0]?.id ?? "");
    const pose = outfit?.poses.find((item) => item.id === poseId) ?? outfit?.poses[0];
    const [expressionId, setExpressionId] = useState(current?.expressionId ?? pose?.defaultExpressionId ?? pose?.expressions[0]?.id ?? "");
    const [scope, setScope] = useState<"once" | "locked">("locked");
    useEffect(() => {
      const nextOutfit = entry?.actor.outfits[0];
      setOutfitId(current?.outfitId ?? nextOutfit?.id ?? "");
      setPoseId(current?.poseId ?? nextOutfit?.poses[0]?.id ?? "");
      setExpressionId(current?.expressionId ?? nextOutfit?.poses[0]?.expressions[0]?.id ?? "");
    }, [actorId]);
    async function apply() {
      if (!entry) return;
      const override: ManualOverride = { actorId: entry.actor.id, outfitId, poseId, expressionId, scope, createdAt: Date.now() };
      try { await client.applyManual(override); modal.dismiss(); } catch (error) { client.notify("error", error instanceof Error ? error.message : "Could not apply state."); }
    }
    return (
      <div class="ls-modal-root">
        {!actors.length ? <div class="ls-empty"><div><strong>No configured actors</strong>Import media in Library first.</div></div> : <>
          <Field label="Actor"><select class="ls-select" value={entry?.actor.id} onChange={(event) => setActorId(event.currentTarget.value)}>{actors.map((item) => <option value={item.actor.id}>{item.actor.name}</option>)}</select></Field>
          <div class="ls-grid-2">
            <Field label="Outfit"><select class="ls-select" value={outfit?.id} onChange={(event) => { setOutfitId(event.currentTarget.value); const next = entry?.actor.outfits.find((item) => item.id === event.currentTarget.value); setPoseId(next?.defaultPoseId ?? next?.poses[0]?.id ?? ""); setExpressionId(next?.poses[0]?.defaultExpressionId ?? next?.poses[0]?.expressions[0]?.id ?? ""); }}>{entry?.actor.outfits.map((item) => <option value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Pose"><select class="ls-select" value={pose?.id} onChange={(event) => { setPoseId(event.currentTarget.value); const next = outfit?.poses.find((item) => item.id === event.currentTarget.value); setExpressionId(next?.defaultExpressionId ?? next?.expressions[0]?.id ?? ""); }}>{outfit?.poses.map((item) => <option value={item.id}>{item.name}</option>)}</select></Field>
          </div>
          <Field label="Expression"><select class="ls-select" value={expressionId} onChange={(event) => setExpressionId(event.currentTarget.value)}>{pose?.expressions.map((item) => <option value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Override scope"><select class="ls-select" value={scope} onChange={(event) => setScope(event.currentTarget.value as "once" | "locked")}><option value="locked">Locked until cleared</option><option value="once">Apply through the next detector pass</option></select></Field>
          {current && <div class="ls-card"><p class="ls-section-note">Current: {current.label}</p></div>}
          <div class="ls-modal-actions">
            {backend.timeline?.manualOverrides[entry?.actor.id ?? ""] && <Button tone="danger" onClick={() => void client.clearManual(entry.actor.id).then(() => modal.dismiss())}>Clear lock</Button>}
            <Button onClick={() => modal.dismiss()}>Cancel</Button><Button tone="primary" onClick={() => void apply()}>Set stage</Button>
          </div>
        </>}
      </div>
    );
  }
  render(<Picker />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export function Studio({ client }: { client: LumiStageClient }) {
  const state = useClientState(client);
  const [view, setView] = useState<StudioView>("stage");
  const [draft, setDraft] = useState<CharacterProfileV1 | null>(state.backend.profile);
  const [dirty, setDirty] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const undoRef = useRef<CharacterProfileV1[]>([]);
  const redoRef = useRef<CharacterProfileV1[]>([]);
  const [, forceHistoryRender] = useState(0);

  useEffect(() => {
    if (!dirty || state.backend.profile?.revision !== draft?.revision) {
      setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null);
      setDirty(false);
      undoRef.current = [];
      redoRef.current = [];
      forceHistoryRender((value) => value + 1);
    }
  }, [state.backend.profile?.revision]);

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
    forceHistoryRender((value) => value + 1);
  }
  function mutate(mutation: BatchMutation) {
    if (!draft) return;
    undoRef.current.push(structuredClone(draft));
    redoRef.current = [];
    setDraft(applyBatchMutation(draft, mutation));
    setDirty(true);
    forceHistoryRender((value) => value + 1);
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous || !draft) return;
    redoRef.current.push(structuredClone(draft));
    setDraft(previous); setDirty(true); forceHistoryRender((value) => value + 1);
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next || !draft) return;
    undoRef.current.push(structuredClone(draft));
    setDraft(next); setDirty(true); forceHistoryRender((value) => value + 1);
  }
  async function save() {
    if (!draft) return;
    try { await client.saveProfile(draft); setDirty(false); client.notify("success", "LumiStage library saved."); }
    catch (error) { client.notify("error", error instanceof Error ? error.message : "Save failed."); }
  }
  const views: Array<{ id: StudioView; label: string }> = [
    { id: "stage", label: "Live Stage" },
    { id: "library", label: "Library" },
    { id: "batch", label: "Batch Lab" },
    { id: "automation", label: "Automation" },
    { id: "appearance", label: "Appearance" },
    { id: "diagnostics", label: "Diagnostics" },
  ];
  return (
    <div class="ls-root">
      <div class="ls-shell">
        <header class="ls-mast">
          <div class="ls-brand"><div class="ls-mark">{STAGE_ICON}</div><div class="ls-brand-copy"><p class="ls-eyebrow">Independent sprite direction</p><h1 class="ls-title">LumiStage</h1><p class="ls-subtitle">Layer outfits, poses, expressions, and ensemble cues without touching Lumiverse’s built-in system.</p></div></div>
        </header>
        <Notice client={client} />
        <nav class="ls-nav" aria-label="LumiStage studio">{views.map((item) => <button class="ls-nav-btn" type="button" aria-selected={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
        <main class="ls-main">
          {view === "stage" && <LiveView client={client} openQuick={() => showQuickPicker(client)} />}
          {view === "library" && <LibraryView client={client} profile={draft} update={update} selected={selected} setSelected={setSelected} importMedia={() => openImportModal(client, draft)} />}
          {view === "batch" && <BatchView profile={draft} selected={selected} setSelected={setSelected} mutate={mutate} undo={undo} redo={redo} canUndo={undoRef.current.length > 0} canRedo={redoRef.current.length > 0} />}
          {view === "automation" && <AutomationView client={client} />}
          {view === "appearance" && <AppearanceView client={client} />}
          {view === "diagnostics" && <DiagnosticsView client={client} profile={draft} />}
        </main>
        {(dirty || view === "library" || view === "batch") && (
          <div class="ls-selectbar">
            <span class="ls-badge" data-tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Library saved"}</span>
            <span style={{ flex: 1 }} />
            <Button onClick={() => { setDraft(state.backend.profile ? structuredClone(state.backend.profile) : null); setDirty(false); }} disabled={!dirty}>Revert</Button>
            <Button tone="primary" onClick={() => void save()} disabled={!dirty || state.busy}>Save library</Button>
          </div>
        )}
        <footer class="ls-footer"><span>{state.backend.activeCharacterName ?? "No character selected"}</span><span>v1.0.0</span></footer>
      </div>
    </div>
  );
}

function useStableMedia(src: string | null, kind: "image" | "video") {
  const [displayed, setDisplayed] = useState<string | null>(src);
  useEffect(() => {
    if (!src || src === displayed) return;
    if (kind === "image") {
      const image = new Image();
      image.onload = () => setDisplayed(src);
      image.src = src;
      return () => { image.onload = null; };
    }
    const video = document.createElement("video");
    video.muted = true;
    video.oncanplay = () => setDisplayed(src);
    video.src = src;
    video.load();
    return () => { video.oncanplay = null; video.src = ""; };
  }, [src, kind, displayed]);
  return displayed;
}

function StageSprite({ state, client }: { state: ActorStageState; client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const view = state.assetId ? backend.assetViews[state.assetId] : null;
  const src = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  return (
    <div class="ls-sprite" data-focused={state.focused} data-transition={backend.settings.appearance.transition}>
      {src && (view?.mediaKind === "video"
        ? <video key={src} class="ls-sprite-media" src={src} muted loop playsInline autoPlay aria-label={state.label} />
        : <img key={src} class="ls-sprite-media" src={src} alt={state.label} draggable={false} />)}
      {backend.settings.appearance.showCaptions && <div class="ls-sprite-caption">{state.label}</div>}
    </div>
  );
}

export function Stage(props: {
  client: LumiStageClient;
  onFullscreen: () => void;
  onHide: () => void;
  onQuick: () => void;
  onResize: (width: number, height: number, commit: boolean) => void;
}) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const actors = Object.values(backend.snapshot?.actors ?? {}).filter((actor) => !!actor.assetId)
    .sort((a, b) => Number(a.focused) - Number(b.focused));
  const style = {
    "--ls-stage-opacity": appearance.opacity,
    "--ls-transition-ms": `${appearance.transitionMs}ms`,
    "--ls-focused-scale": appearance.focusedScale,
    "--ls-idle-opacity": appearance.idleOpacity,
    "--ls-overlap": appearance.ensembleOverlap,
  } as JSX.CSSProperties;
  const startResize = (event: JSX.TargetedPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = appearance.width;
    const startHeight = appearance.height;
    let width = startWidth;
    let height = startHeight;
    const move = (next: PointerEvent) => {
      width = Math.max(180, Math.min(1200, Math.round(startWidth + next.clientX - startX)));
      height = Math.max(220, Math.min(1000, Math.round(startHeight + next.clientY - startY)));
      props.onResize(width, height, false);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      props.onResize(width, height, true);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
  };
  return (
    <div class="ls-stage-root" style={style}>
      <div class="ls-stage" data-chrome={appearance.showChrome}>
        <div class="ls-stage-rig" />
        <div class="ls-stage-toolbar">
          <span class="ls-stage-title">{backend.activeCharacterName ?? "LumiStage"}</span>
          <button type="button" class="ls-stage-btn" onClick={props.onQuick} title="Quick select" aria-label="Quick select">✦</button>
          <button type="button" class="ls-stage-btn" onClick={props.onFullscreen} title="Toggle fullscreen" aria-label="Toggle fullscreen">□</button>
          <button type="button" class="ls-stage-btn" onClick={props.onHide} title="Hide stage" aria-label="Hide stage">×</button>
        </div>
        {actors.length ? <div class="ls-stage-ensemble">{actors.map((actor) => <StageSprite key={actor.actorId} state={actor} client={props.client} />)}</div> : <div class="ls-stage-empty">LumiStage is ready.<br />Import media or choose a state from the quick selector.</div>}
        <button type="button" class="ls-stage-resize" onPointerDown={startResize} aria-label="Resize LumiStage" title="Resize stage" />
      </div>
    </div>
  );
}

export function CharacterSetup({ client, characterId, onOpenStudio }: { client: LumiStageClient; characterId: string; onOpenStudio: () => void }) {
  const { backend } = useClientState(client);
  const profile = backend.profile?.characterId === characterId ? backend.profile : null;
  useEffect(() => client.send({ type: "character-editor", characterId }), [characterId]);
  if (!profile) return <div class="ls-root"><div class="ls-main"><div class="ls-empty"><div><strong>Loading LumiStage profile…</strong></div></div></div></div>;
  const assetCount = allAssets(profile).length;
  return (
    <div class="ls-root">
      <div class="ls-main ls-section">
        <SectionHead title="LumiStage Profile" note="This independent profile never reads or writes the built-in expression configuration." />
        <div class="ls-stat-grid"><div class="ls-stat"><strong>{profile.actors.length}</strong><span>Actors</span></div><div class="ls-stat"><strong>{profile.actors.reduce((sum, actor) => sum + actor.outfits.length, 0)}</strong><span>Outfits</span></div><div class="ls-stat"><strong>{assetCount}</strong><span>Media</span></div></div>
        <div class="ls-card"><p class="ls-section-note">Use the full LumiStage drawer for hierarchical editing, batch operations, archive transfer, detector settings, and diagnostics.</p><div class="ls-toolbar" style={{ marginTop: 9 }}><Button tone="primary" onClick={onOpenStudio}>Open LumiStage</Button><Button onClick={() => openImportModal(client, profile)}>Import media</Button></div></div>
      </div>
    </div>
  );
}
