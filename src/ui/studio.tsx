import type { ComponentChildren, JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  allVariants,
  applyBatchMutation,
  createExpression,
  createOutfit,
  inspectProfile,
  suggestMergedExpressionName,
} from "../model";
import { cleanName, normalizedKey } from "../ids";
import type {
  BatchMutationV2,
  CharacterProfileV2,
  ExpressionSlotV2,
  LumiStageSettingsPatchV2,
  LumiStageSettingsV2,
  OutfitFolderV2,
  StageVariantV2,
  StudioView,
} from "../types";
import type { LumiStageClient } from "./client";
import {
  HostBadge,
  HostModelPicker,
  HostNumber,
  HostPagination,
  HostRange,
  HostSelect,
  HostSwitch,
} from "./host-controls";
import { Icon } from "./icons";
import { Media } from "./media";
import { showImportModal, showQuickPicker, showRestoreArchiveModal, showTextPrompt } from "./modals";
import {
  Button,
  EmptyState,
  Field,
  IconButton,
  ProgressNotice,
  SearchInput,
  Status,
  Toolbar,
  useClientState,
} from "./primitives";

function firstVariant(expression: ExpressionSlotV2 | null | undefined): StageVariantV2 | null {
  return expression
    ? [...expression.variants].sort((a, b) => a.order - b.order)[0] ?? null
    : null;
}

function selectedOutfit(
  profile: CharacterProfileV2 | null,
  outfitId: string,
): OutfitFolderV2 | null {
  return profile?.outfits.find((item) => item.id === outfitId)
    ?? profile?.outfits.find((item) => item.id === profile.defaultOutfitId)
    ?? profile?.outfits[0]
    ?? null;
}

function countExpressions(profile: CharacterProfileV2 | null): number {
  return profile?.outfits.reduce((sum, outfit) => sum + outfit.expressions.length, 0) ?? 0;
}

function stop(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

function WorkspaceTitle(props: {
  kicker: string;
  title: string;
  description: string;
  actions?: ComponentChildren;
}) {
  return (
    <header class="ls-workspace-title">
      <div>
        <span class="ls-kicker">{props.kicker}</span>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      {props.actions && <div class="ls-workspace-actions">{props.actions}</div>}
    </header>
  );
}

function SettingRow(props: {
  title: string;
  description: string;
  children: ComponentChildren;
}) {
  return (
    <div class="ls-setting-row">
      <div><strong>{props.title}</strong><span>{props.description}</span></div>
      <div>{props.children}</div>
    </div>
  );
}

function CurrentPreview({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const focusedId = backend.snapshot?.focusedCharacterIds[0];
  const state = focusedId
    ? backend.snapshot?.characters[focusedId]
    : Object.values(backend.snapshot?.characters ?? {})[0];
  const view = state?.variantId ? backend.variantViews[state.variantId] : null;
  if (!state || !view) {
    return (
      <div class="ls-current-preview ls-current-preview-empty">
        <span><Icon name="stage" size={24} /></span>
        <div><strong>Stage awaiting direction</strong><small>Choose a sprite or complete a reply.</small></div>
      </div>
    );
  }
  return (
    <div class="ls-current-preview">
      <Media
        src={view.thumbUrl ?? view.url}
        kind={view.mediaKind}
        label={state.label}
        class="ls-current-preview-media"
        contain
      />
      <div>
        <span class="ls-kicker">On stage</span>
        <strong>{state.label.split(" · ")[0]}</strong>
        <small>{state.label.split(" · ").slice(1).join(" / ")}</small>
      </div>
    </div>
  );
}

export function DrawerDashboard(props: {
  client: LumiStageClient;
  onOpenStudio: () => void;
}) {
  const { backend } = useClientState(props.client);
  const appearance = props.client.effectiveAppearance();
  const profile = backend.profile ?? backend.stageProfiles[0] ?? null;
  const variantCount = profile ? allVariants(profile).length : 0;
  const connection = backend.settings.detection.connectionId
    ? backend.connections.find((item) => item.id === backend.settings.detection.connectionId)
    : backend.connections.find((item) => item.isDefault);
  const ready = backend.lastDetection.status !== "error";

  return (
    <div class="ls-drawer">
      <ProgressNotice client={props.client} />
      <div class="ls-drawer-cue-line">
        <span class="ls-drawer-cue-rule" aria-hidden="true" />
        <small>{backend.activeChatId ? "LIVE CHAT" : "CHARACTER WORKSPACE"}</small>
        <Status tone={ready ? "success" : "warning"}>{ready ? "Ready" : "Attention"}</Status>
      </div>

      <section class="ls-drawer-context">
        <div>
          <span class="ls-kicker">{profile ? "Active profile" : "No profile selected"}</span>
          <h2>{profile?.characterName ?? "LumiStage"}</h2>
          <p>
            {profile
              ? `${profile.outfits.length} outfits · ${countExpressions(profile)} expressions · ${variantCount} sprites`
              : "Open a character or chat to begin building its sprite library."}
          </p>
        </div>
        {profile && <HostBadge client={props.client} text={`${variantCount} sprites`} color={variantCount ? "primary" : "neutral"} />}
      </section>

      <CurrentPreview client={props.client} />

      <div class="ls-drawer-status">
        <div>
          <span class="ls-status-icon"><Icon name="automation" size={16} /></span>
          <span>
            <strong>{backend.settings.detection.enabled ? "Automatic direction" : "Manual direction"}</strong>
            <small>{connection ? `${connection.name}${backend.settings.detection.model ? ` · ${backend.settings.detection.model}` : ""}` : "No default Lumiverse connection"}</small>
          </span>
        </div>
        <span class="ls-cue-dot" data-live={backend.settings.detection.enabled} />
      </div>

      <div class="ls-drawer-primary-actions">
        <Button
          variant="primary"
          icon="expand"
          onClick={props.onOpenStudio}
        >
          Open Studio
        </Button>
        <Button
          icon="sparkles"
          disabled={!backend.activeChatId || !backend.stageProfiles.length}
          onClick={() => showQuickPicker(props.client)}
        >
          Direct
        </Button>
      </div>

      <div class="ls-drawer-utility">
        <button
          type="button"
          onClick={() => void props.client.saveAppearance({ visible: !appearance.visible }).catch(() => undefined)}
        >
          <Icon name={appearance.visible ? "eyeOff" : "eye"} size={16} />
          <span>{appearance.visible ? "Hide floating stage" : "Show floating stage"}</span>
        </button>
        <button
          type="button"
          disabled={!backend.activeChatId}
          onClick={() => void props.client.analyzeNow().catch(() => undefined)}
        >
          <Icon name="refresh" size={16} />
          <span>Analyze current reply</span>
        </button>
      </div>

      {!profile && (
        <div class="ls-drawer-empty">
          <Icon name="library" size={20} />
          <span>Select a character in Lumiverse to create its independent outfit library.</span>
        </div>
      )}
    </div>
  );
}

interface LibraryProps {
  client: LumiStageClient;
  profile: CharacterProfileV2;
  update: (mutator: (profile: CharacterProfileV2) => void) => void;
  replace: (profile: CharacterProfileV2) => void;
  acceptCommitted: (profile: CharacterProfileV2) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function ExpressionCard(props: {
  client: LumiStageClient;
  expression: ExpressionSlotV2;
  selected: boolean;
  inspected: boolean;
  isDefault: boolean;
  batchMode: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onDragStart: (event: JSX.TargetedDragEvent<HTMLElement>) => void;
  onDrop: (event: JSX.TargetedDragEvent<HTMLElement>) => void;
}) {
  const { backend } = useClientState(props.client);
  const preview = firstVariant(props.expression);
  const view = preview ? backend.variantViews[preview.id] : null;
  return (
    <article
      class="ls-expression-card"
      data-selected={props.selected}
      data-inspected={props.inspected}
      data-batch={props.batchMode}
      draggable={!props.batchMode}
      onDragStart={props.onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={props.onDrop}
    >
      <button
        type="button"
        class="ls-expression-card-hit"
        aria-pressed={props.batchMode ? props.selected : props.inspected}
        onClick={props.batchMode ? props.onToggle : props.onOpen}
      >
        <div class="ls-expression-stack" data-count={Math.min(3, props.expression.variants.length)}>
          <span class="ls-stack-back ls-stack-back-two" />
          <span class="ls-stack-back ls-stack-back-one" />
          <Media
            src={view?.thumbUrl ?? view?.url ?? null}
            kind={view?.mediaKind ?? "image"}
            label={props.expression.name}
            class="ls-expression-media"
            contain
          />
          {props.batchMode && (
            <span class="ls-card-check" data-selected={props.selected}>
              {props.selected && <Icon name="check" size={13} />}
            </span>
          )}
          {props.isDefault && <span class="ls-default-flag">Default</span>}
          <span class="ls-variant-count">{props.expression.variants.length}</span>
        </div>
        <span class="ls-expression-copy">
          <strong>{props.expression.name}</strong>
          <small>{props.expression.variants.length} variant{props.expression.variants.length === 1 ? "" : "s"}</small>
        </span>
      </button>
    </article>
  );
}

function VariantTray(props: {
  client: LumiStageClient;
  profile: CharacterProfileV2;
  outfit: OutfitFolderV2;
  expression: ExpressionSlotV2;
  update: LibraryProps["update"];
  acceptCommitted: LibraryProps["acceptCommitted"];
  close: () => void;
}) {
  const { backend } = useClientState(props.client);
  const rename = (name: string) => props.update((profile) => {
    const expression = profile.outfits
      .find((item) => item.id === props.outfit.id)
      ?.expressions.find((item) => item.id === props.expression.id);
    if (expression) expression.name = name;
  });

  function reorder(variantId: string, direction: -1 | 1) {
    props.update((profile) => {
      const variants = profile.outfits
        .find((item) => item.id === props.outfit.id)
        ?.expressions.find((item) => item.id === props.expression.id)
        ?.variants;
      if (!variants) return;
      const index = variants.findIndex((item) => item.id === variantId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= variants.length) return;
      [variants[index], variants[target]] = [variants[target], variants[index]];
      variants.forEach((item, order) => { item.order = order; });
    });
  }

  async function removeVariant(variant: StageVariantV2) {
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: "Remove sprite variant?",
      message: `${variant.fileName} will be removed from this expression. Its Lumiverse asset is deleted only when no LumiStage profile references it.`,
      variant: "danger",
      confirmLabel: "Remove",
    });
    if (!confirmed) return;
    props.update((profile) => {
      const expression = profile.outfits
        .find((item) => item.id === props.outfit.id)
        ?.expressions.find((item) => item.id === props.expression.id);
      if (expression) expression.variants = expression.variants.filter((item) => item.id !== variant.id);
    });
  }

  return (
    <aside class="ls-variant-tray">
      <div class="ls-tray-head">
        <div><span class="ls-kicker">Expression slot</span><h3>{props.expression.name}</h3></div>
        <IconButton icon="close" label="Close variant tray" onClick={props.close} />
      </div>
      <Field label="Expression name">
        <input
          class="ls-input"
          value={props.expression.name}
          onInput={(event) => rename(event.currentTarget.value)}
        />
      </Field>
      <div class="ls-tray-actions">
        <Button
          size="small"
          icon="upload"
          onClick={() => showImportModal(props.client, props.profile, {
            outfitId: props.outfit.id,
            expressionId: props.expression.id,
          }, props.acceptCommitted)}
        >
          Add variants
        </Button>
        <Button
          size="small"
          icon="check"
          disabled={props.outfit.defaultExpressionId === props.expression.id}
          onClick={() => props.update((profile) => {
            const outfit = profile.outfits.find((item) => item.id === props.outfit.id);
            if (outfit) outfit.defaultExpressionId = props.expression.id;
          })}
        >
          Set default
        </Button>
      </div>
      <div class="ls-variant-list">
        {props.expression.variants.map((variant, index) => {
          const view = backend.variantViews[variant.id];
          return (
            <div key={variant.id} class="ls-variant-row">
              <button
                type="button"
                class="ls-variant-preview"
                onClick={() => {
                  const modal = props.client.ctx.ui.showModal({
                    title: variant.fileName,
                    width: 760,
                    maxHeight: 820,
                  });
                  const root = document.createElement("div");
                  root.className = "ls-lightbox";
                  const media = variant.mediaKind === "video"
                    ? document.createElement("video")
                    : document.createElement("img");
                  media.setAttribute("src", view?.url ?? "");
                  media.setAttribute("aria-label", variant.fileName);
                  if (media instanceof HTMLVideoElement) {
                    media.muted = true;
                    media.loop = true;
                    media.autoplay = true;
                    media.playsInline = true;
                    media.controls = true;
                  }
                  root.appendChild(media);
                  modal.root.appendChild(root);
                }}
              >
                <Media
                  src={view?.thumbUrl ?? view?.url ?? null}
                  kind={variant.mediaKind}
                  label={variant.fileName}
                  contain
                />
              </button>
              <span><strong>{variant.fileName}</strong><small>{variant.mediaKind} · {variant.mimeType}</small></span>
              <div>
                <IconButton icon="chevronLeft" label="Move variant earlier" disabled={index === 0} onClick={() => reorder(variant.id, -1)} />
                <IconButton icon="chevronRight" label="Move variant later" disabled={index === props.expression.variants.length - 1} onClick={() => reorder(variant.id, 1)} />
                <IconButton icon="trash" label="Remove variant" danger onClick={() => void removeVariant(variant)} />
              </div>
            </div>
          );
        })}
        {!props.expression.variants.length && (
          <div class="ls-tray-empty">
            <Icon name="image" size={20} />
            <span>No variants yet. Upload one or more sprites for this expression.</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function BatchBar(props: {
  client: LumiStageClient;
  profile: CharacterProfileV2;
  selected: Set<string>;
  filteredIds: string[];
  outfit: OutfitFolderV2;
  mutate: (mutation: BatchMutationV2) => void;
  clear: () => void;
  selectAll: () => void;
  exit: () => void;
}) {
  const [destination, setDestination] = useState(
    props.profile.outfits.find((item) => item.id !== props.outfit.id)?.id ?? "",
  );
  async function remove() {
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: `Delete ${props.selected.size} expression${props.selected.size === 1 ? "" : "s"}?`,
      message: "The selected expression slots and their variants will be removed. You can undo until the Studio is closed.",
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (confirmed) props.mutate({ type: "delete", expressionIds: [...props.selected] });
  }
  function merge() {
    const expressions = props.outfit.expressions.filter((expression) =>
      props.selected.has(expression.id)
    );
    if (expressions.length < 2) return;
    const variantCount = new Set(
      expressions.flatMap((expression) =>
        expression.variants.map((variant) => variant.contentHash)
      ),
    ).size;
    showTextPrompt(
      props.client,
      {
        title: `Merge ${expressions.length} expressions`,
        label: "Merged expression name",
        hint: `This will combine ${variantCount} unique sprite variant${variantCount === 1 ? "" : "s"} into one expression. You can undo the merge until the Studio is closed.`,
        placeholder: "Happy",
        initial: suggestMergedExpressionName(expressions),
        submitLabel: "Merge expressions",
      },
      (value) => {
        const name = cleanName(value, suggestMergedExpressionName(expressions));
        const conflict = props.outfit.expressions.find(
          (expression) =>
            !props.selected.has(expression.id)
            && normalizedKey(expression.name) === normalizedKey(name),
        );
        if (conflict) {
          throw new Error(
            `"${conflict.name}" already exists in this outfit. Include it in the selection or choose another name.`,
          );
        }
        props.mutate({
          type: "merge",
          expressionIds: expressions.map((expression) => expression.id),
          outfitId: props.outfit.id,
          name,
        });
      },
    );
  }
  return (
    <div class="ls-batch-bar" role="toolbar" aria-label="Expression batch actions">
      <div class="ls-batch-count">
        <span>{props.selected.size}</span>
        <strong>selected</strong>
        <small>of {props.filteredIds.length} filtered</small>
      </div>
      <div class="ls-batch-select-links">
        <button type="button" onClick={props.selectAll}>Select all filtered</button>
        <button type="button" onClick={props.clear}>Deselect all</button>
      </div>
      <div class="ls-batch-destination">
        <HostSelect
          client={props.client}
          label="Destination outfit"
          value={destination}
          onChange={setDestination}
          placeholder="Choose outfit"
          compact
          options={props.profile.outfits.map((item) => ({
            value: item.id,
            label: item.name,
            sublabel: item.id === props.outfit.id ? "Current outfit" : `${item.expressions.length} expressions`,
          }))}
        />
      </div>
      <Toolbar>
        <Button
          size="small"
          icon="move"
          disabled={!props.selected.size || !destination}
          onClick={() => props.mutate({ type: "move", expressionIds: [...props.selected], outfitId: destination })}
        >
          Move
        </Button>
        <Button
          size="small"
          icon="copy"
          disabled={!props.selected.size || !destination}
          onClick={() => props.mutate({ type: "copy", expressionIds: [...props.selected], outfitId: destination })}
        >
          Copy
        </Button>
        <Button
          size="small"
          icon="merge"
          disabled={props.selected.size < 2}
          title="Combine selected expression slots into one"
          onClick={merge}
        >
          Merge
        </Button>
        <Button
          size="small"
          icon="trash"
          variant="danger"
          disabled={!props.selected.size}
          onClick={() => void remove()}
        >
          Delete
        </Button>
        <IconButton icon="close" label="Exit batch mode" onClick={props.exit} />
      </Toolbar>
    </div>
  );
}

function LibraryView(props: LibraryProps) {
  const [outfitId, setOutfitId] = useState(props.profile.defaultOutfitId ?? props.profile.outfits[0]?.id ?? "");
  const [expressionId, setExpressionId] = useState("");
  const [query, setQuery] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(48);
  const outfit = selectedOutfit(props.profile, outfitId);
  const filtered = useMemo(() => (outfit?.expressions ?? []).filter((expression) => {
    const needle = query.trim().toLocaleLowerCase();
    return !needle
      || expression.name.toLocaleLowerCase().includes(needle)
      || expression.variants.some((variant) => variant.fileName.toLocaleLowerCase().includes(needle));
  }), [outfit, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const clampedPage = Math.min(page, pages);
  const visible = filtered.slice((clampedPage - 1) * perPage, clampedPage * perPage);
  const inspected = outfit?.expressions.find((item) => item.id === expressionId) ?? null;

  useEffect(() => {
    if (!props.profile.outfits.some((item) => item.id === outfitId)) {
      setOutfitId(props.profile.defaultOutfitId ?? props.profile.outfits[0]?.id ?? "");
    }
  }, [props.profile.revision, props.profile.outfits.length, outfitId]);
  useEffect(() => setPage(1), [outfitId, query, perPage]);
  useEffect(() => setPage((current) => Math.min(current, pages)), [pages]);
  useEffect(() => {
    setSelected(new Set());
    setBatchMode(false);
    setExpressionId("");
  }, [outfitId]);

  function selectOutfit(id: string) {
    setOutfitId(id);
  }

  function addOutfit() {
    showTextPrompt(
      props.client,
      { title: "New outfit folder", label: "Outfit name", placeholder: "Evening wear", submitLabel: "Create outfit" },
      (name) => props.update((profile) => {
        const outfit = createOutfit(name);
        outfit.order = profile.outfits.length;
        profile.outfits.push(outfit);
        profile.defaultOutfitId ??= outfit.id;
        setOutfitId(outfit.id);
      }),
    );
  }

  function addExpression() {
    if (!outfit) return;
    showTextPrompt(
      props.client,
      { title: "New expression", label: "Expression name", placeholder: "Happy", submitLabel: "Create expression" },
      (name) => props.update((profile) => {
        const target = profile.outfits.find((item) => item.id === outfit.id);
        if (!target) return;
        const expression = createExpression(name);
        expression.order = target.expressions.length;
        target.expressions.push(expression);
        target.defaultExpressionId ??= expression.id;
        setExpressionId(expression.id);
      }),
    );
  }

  async function deleteOutfit() {
    if (!outfit) return;
    const { confirmed } = await props.client.ctx.ui.showConfirm({
      title: `Delete ${outfit.name}?`,
      message: `This removes ${outfit.expressions.length} expression slots and all of their variants from this profile.`,
      variant: "danger",
      confirmLabel: "Delete outfit",
    });
    if (!confirmed) return;
    props.update((profile) => {
      profile.outfits = profile.outfits.filter((item) => item.id !== outfit.id);
      profile.outfits.forEach((item, order) => { item.order = order; });
      if (profile.defaultOutfitId === outfit.id) profile.defaultOutfitId = profile.outfits[0]?.id ?? null;
      setOutfitId(profile.defaultOutfitId ?? profile.outfits[0]?.id ?? "");
    });
  }

  function reorderOutfit(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    props.update((profile) => {
      const sourceIndex = profile.outfits.findIndex((item) => item.id === sourceId);
      const targetIndex = profile.outfits.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [moving] = profile.outfits.splice(sourceIndex, 1);
      profile.outfits.splice(targetIndex, 0, moving);
      profile.outfits.forEach((item, order) => { item.order = order; });
    });
  }

  function reorderExpression(sourceId: string, targetId: string) {
    if (!outfit || sourceId === targetId) return;
    props.update((profile) => {
      const expressions = profile.outfits.find((item) => item.id === outfit.id)?.expressions;
      if (!expressions) return;
      const sourceIndex = expressions.findIndex((item) => item.id === sourceId);
      const targetIndex = expressions.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [moving] = expressions.splice(sourceIndex, 1);
      expressions.splice(targetIndex, 0, moving);
      expressions.forEach((item, order) => { item.order = order; });
    });
  }

  function runBatch(mutation: BatchMutationV2) {
    if (
      mutation.type !== "delete"
      && !props.profile.outfits.some((candidate) => candidate.id === mutation.outfitId)
    ) {
      props.client.notify("error", "Choose a valid destination outfit.");
      return;
    }
    props.replace(applyBatchMutation(props.profile, mutation));
    setSelected(new Set());
    if (mutation.type === "delete") setExpressionId("");
  }

  return (
    <div class="ls-library-view">
      <aside class="ls-outfit-rail">
        <div class="ls-outfit-rail-head">
          <div><span class="ls-kicker">Wardrobe</span><strong>Outfits</strong></div>
          <IconButton icon="plus" label="Add outfit" onClick={addOutfit} />
        </div>
        <div class="ls-outfit-list">
          {props.profile.outfits.map((item) => (
            <button
              key={item.id}
              type="button"
              data-active={item.id === outfit?.id}
              draggable
              onDragStart={(event) => event.dataTransfer?.setData("text/lumistage-outfit", item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                stop(event);
                reorderOutfit(event.dataTransfer?.getData("text/lumistage-outfit") ?? "", item.id);
              }}
              onClick={() => selectOutfit(item.id)}
            >
              <Icon name="outfit" size={16} />
              <span><strong>{item.name}</strong><small>{item.expressions.length} expressions</small></span>
              {props.profile.defaultOutfitId === item.id && <i>Default</i>}
            </button>
          ))}
        </div>
        <div class="ls-outfit-rail-foot">
          <span><Icon name="move" size={13} />Drag to reorder</span>
        </div>
      </aside>

      <main class="ls-library-main">
        <div class="ls-library-toolbar">
          <div class="ls-outfit-title">
            <span class="ls-kicker">{props.profile.characterName}</span>
            <input
              value={outfit?.name ?? ""}
              aria-label="Outfit folder name"
              onInput={(event) => {
                const name = event.currentTarget.value;
                props.update((profile) => {
                  const target = profile.outfits.find((item) => item.id === outfit?.id);
                  if (target) target.name = name;
                });
              }}
            />
            <span>{filtered.length} expression{filtered.length === 1 ? "" : "s"}</span>
          </div>
          <Toolbar>
            <Button
              size="small"
              icon="check"
              disabled={!outfit || props.profile.defaultOutfitId === outfit.id}
              onClick={() => props.update((profile) => { profile.defaultOutfitId = outfit?.id ?? null; })}
            >
              Set default
            </Button>
            <IconButton icon="trash" label="Delete outfit" danger disabled={props.profile.outfits.length <= 1} onClick={() => void deleteOutfit()} />
          </Toolbar>
        </div>

        <div class="ls-library-command-row">
          <SearchInput value={query} onInput={setQuery} placeholder="Search expressions and sprite filenames…" />
          <Toolbar>
            <IconButton icon="undo" label="Undo" disabled={!props.canUndo} onClick={props.undo} />
            <IconButton icon="redo" label="Redo" disabled={!props.canRedo} onClick={props.redo} />
            <Button
              size="small"
              icon="batch"
              variant={batchMode ? "primary" : "default"}
              onClick={() => {
                setBatchMode(!batchMode);
                setSelected(new Set());
                setExpressionId("");
              }}
            >
              Select
            </Button>
            <Button size="small" icon="plus" onClick={addExpression}>New expression</Button>
            <Button
              size="small"
              icon="upload"
              variant="primary"
              onClick={() => showImportModal(
                props.client,
                props.profile,
                { outfitId: outfit?.id },
                props.acceptCommitted,
              )}
            >
              Import
            </Button>
          </Toolbar>
        </div>

        {batchMode && outfit && (
          <BatchBar
            client={props.client}
            profile={props.profile}
            outfit={outfit}
            selected={selected}
            filteredIds={filtered.map((item) => item.id)}
            mutate={runBatch}
            clear={() => setSelected(new Set())}
            selectAll={() => setSelected(new Set(filtered.map((item) => item.id)))}
            exit={() => { setBatchMode(false); setSelected(new Set()); }}
          />
        )}

        <div class="ls-expression-scroll">
          {visible.length ? (
            <div class="ls-expression-grid" role="list" aria-label={`${outfit?.name} expressions`}>
              {visible.map((expression) => (
                <ExpressionCard
                  key={expression.id}
                  client={props.client}
                  expression={expression}
                  selected={selected.has(expression.id)}
                  inspected={expression.id === inspected?.id}
                  isDefault={outfit?.defaultExpressionId === expression.id}
                  batchMode={batchMode}
                  onOpen={() => setExpressionId(expression.id)}
                  onToggle={() => setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(expression.id)) next.delete(expression.id);
                    else next.add(expression.id);
                    return next;
                  })}
                  onDragStart={(event) => event.dataTransfer?.setData("text/lumistage-expression", expression.id)}
                  onDrop={(event) => {
                    stop(event);
                    reorderExpression(event.dataTransfer?.getData("text/lumistage-expression") ?? "", expression.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="expression"
              title={query ? "No expressions match" : "This outfit is empty"}
              description={query ? "Try another name or sprite filename." : "Create an expression slot or import a folder of sprites."}
              action={!query && <Button icon="plus" variant="primary" onClick={addExpression}>New expression</Button>}
            />
          )}
        </div>
        {filtered.length > perPage && (
          <HostPagination
            client={props.client}
            page={Math.min(page, pages)}
            pages={pages}
            total={filtered.length}
            perPage={perPage}
            onPage={setPage}
            onPerPage={(value) => { setPerPage(value); setPage(1); }}
          />
        )}
      </main>

      {outfit && inspected && (
                <VariantTray
          client={props.client}
          profile={props.profile}
          outfit={outfit}
          expression={inspected}
                  update={props.update}
                  acceptCommitted={props.acceptCommitted}
          close={() => setExpressionId("")}
        />
      )}
    </div>
  );
}

function LiveStageView({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const appearance = client.effectiveAppearance();
  const characters = Object.values(backend.snapshot?.characters ?? {});
  return (
    <div class="ls-page ls-live-page">
      <WorkspaceTitle
        kicker="Live direction"
        title="Live Stage"
        description="The resolved visual state for the current chat, including exact sprite variants and locks."
        actions={(
          <Toolbar>
            <Button icon="refresh" disabled={!backend.activeChatId} onClick={() => void client.analyzeNow().catch(() => undefined)}>Analyze now</Button>
            <Button icon="sparkles" variant="primary" disabled={!backend.activeChatId} onClick={() => showQuickPicker(client)}>Direct stage</Button>
          </Toolbar>
        )}
      />
      <section class="ls-live-stage-board">
        <div class="ls-stage-board-grid">
          {characters.map((state) => {
            const view = state.variantId ? backend.variantViews[state.variantId] : null;
            const lock = backend.timeline?.manualOverrides[state.characterId];
            return (
              <article key={state.characterId} data-focused={state.focused}>
                <div class="ls-live-character-media">
                  <Media
                    src={view?.url ?? null}
                    kind={view?.mediaKind ?? "image"}
                    label={state.label}
                    contain
                  />
                </div>
                <div class="ls-live-character-copy">
                  <span class="ls-kicker">{state.focused ? "Focused" : "Ensemble"}</span>
                  <strong>{state.label.split(" · ")[0]}</strong>
                  <small>{state.label.split(" · ").slice(1).join(" / ")}</small>
                  <div>
                    <span>{Math.round(state.confidence * 100)}% confidence</span>
                    {lock && <span><Icon name="lock" size={12} />{lock.lock === "outfit" ? "Outfit locked" : "State locked"}</span>}
                  </div>
                </div>
              </article>
            );
          })}
          {!characters.length && (
            <EmptyState
              icon="stage"
              title="Nothing is on stage yet"
              description="Direct a state manually or complete a generated reply after importing sprites."
              action={<Button icon="sparkles" variant="primary" onClick={() => showQuickPicker(client)}>Direct stage</Button>}
            />
          )}
        </div>
      </section>
      <div class="ls-live-controls">
        <section>
          <div><span class="ls-kicker">Floating stage</span><h3>Presentation</h3></div>
          <SettingRow title="Stage visibility" description="Show the resizable sprite stage over the chat.">
            <HostSwitch client={client} label="Stage visibility" checked={appearance.visible} onChange={(visible) => void client.saveAppearance({ visible }).catch(() => undefined)} />
          </SettingRow>
          <SettingRow title="Captions" description="Show character, outfit, and expression beneath each sprite.">
            <HostSwitch client={client} label="Stage captions" checked={appearance.showCaptions} onChange={(showCaptions) => void client.saveAppearance({ showCaptions }).catch(() => undefined)} />
          </SettingRow>
        </section>
        <section>
          <div><span class="ls-kicker">Conversation</span><h3>Chat overrides</h3></div>
          <p>Stage size and placement can follow global defaults or be saved specifically for this chat.</p>
          <Toolbar>
            <Button
              disabled={!backend.activeChatId}
              onClick={() => void client.saveChatLayout({ ...appearance }).catch(() => undefined)}
            >
              Save layout for chat
            </Button>
            <Button
              variant="ghost"
              disabled={!backend.timeline?.layoutOverride}
              onClick={() => void client.saveChatLayout(null).catch(() => undefined)}
            >
              Use global layout
            </Button>
          </Toolbar>
        </section>
      </div>
    </div>
  );
}

function DiagnosticsPanel({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  async function refresh() {
    setLoading(true);
    try {
      setReport(await client.diagnostics());
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Diagnostics failed.");
    } finally {
      setLoading(false);
    }
  }
  const permissions = Object.entries(backend.permissions);
  return (
    <section class="ls-settings-card ls-diagnostics-card">
      <div class="ls-settings-card-head">
        <div><span class="ls-kicker">Runtime health</span><h3>Diagnostics</h3><p>Permission, queue, catalog, and requested detector connection/model without transcript content.</p></div>
        <Button size="small" icon="refresh" disabled={loading} onClick={() => void refresh()}>{loading ? "Checking…" : "Run report"}</Button>
      </div>
      <div class="ls-permission-grid">
        {permissions.map(([name, granted]) => (
          <span key={name} data-granted={granted}><Icon name={granted ? "success" : "warning"} size={14} />{name}</span>
        ))}
      </div>
      <div class="ls-diagnostic-summary">
        <div><span>Detector</span><strong>{backend.lastDetection.status}</strong><small>{backend.lastDetection.message}</small></div>
        <div><span>Queue</span><strong>{backend.queueDepth}</strong><small>pending jobs</small></div>
        <div><span>Catalog</span><strong>{backend.profile ? inspectProfile(backend.profile).length : 0}</strong><small>integrity notices</small></div>
      </div>
      {report && <pre>{JSON.stringify(report, null, 2)}</pre>}
    </section>
  );
}

function mergeSettingsPatches(
  first: LumiStageSettingsPatchV2,
  second: LumiStageSettingsPatchV2,
): LumiStageSettingsPatchV2 {
  return {
    ...(first.detection || second.detection
      ? { detection: { ...first.detection, ...second.detection } }
      : {}),
    ...(first.appearance || second.appearance
      ? { appearance: { ...first.appearance, ...second.appearance } }
      : {}),
    ...("preloadAdjacent" in second
      ? { preloadAdjacent: second.preloadAdjacent }
      : "preloadAdjacent" in first
        ? { preloadAdjacent: first.preloadAdjacent }
        : {}),
  };
}

function applySettingsPatch(
  settings: LumiStageSettingsV2,
  patch: LumiStageSettingsPatchV2,
): LumiStageSettingsV2 {
  return {
    ...structuredClone(settings),
    detection: patch.detection
      ? { ...settings.detection, ...patch.detection }
      : settings.detection,
    appearance: patch.appearance
      ? { ...settings.appearance, ...patch.appearance }
      : settings.appearance,
    preloadAdjacent: patch.preloadAdjacent ?? settings.preloadAdjacent,
  };
}

function hasSettingsPatch(patch: LumiStageSettingsPatchV2): boolean {
  return !!(
    (patch.detection && Object.keys(patch.detection).length)
    || (patch.appearance && Object.keys(patch.appearance).length)
    || "preloadAdjacent" in patch
  );
}

function SettingsView({ client }: { client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const [draft, setDraft] = useState<LumiStageSettingsV2>(() => structuredClone(backend.settings));
  const [section, setSection] = useState<"detection" | "stage" | "data">("detection");
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const draftRef = useRef(draft);
  const pendingPatch = useRef<LumiStageSettingsPatchV2>({});
  const queuedPatches = useRef<LumiStageSettingsPatchV2[]>([]);
  const inFlightPatch = useRef<LumiStageSettingsPatchV2>({});
  const saveTail = useRef<Promise<void>>(Promise.resolve());
  const saveTimer = useRef<number | null>(null);
  const mounted = useRef(true);
  draftRef.current = draft;

  const combinedPendingPatch = () => {
    const queued = queuedPatches.current.reduce(
      (combined, patch) => mergeSettingsPatches(combined, patch),
      inFlightPatch.current,
    );
    return mergeSettingsPatches(queued, pendingPatch.current);
  };

  const reconcileDraft = (settings: LumiStageSettingsV2) => {
    const next = applySettingsPatch(settings, combinedPendingPatch());
    draftRef.current = next;
    if (mounted.current) setDraft(next);
  };

  const flushSettings = async (): Promise<void> => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const patch = pendingPatch.current;
    if (!hasSettingsPatch(patch)) {
      await saveTail.current;
      return;
    }
    pendingPatch.current = {};
    queuedPatches.current.push(patch);
    const run = async () => {
      const queuedIndex = queuedPatches.current.indexOf(patch);
      if (queuedIndex >= 0) queuedPatches.current.splice(queuedIndex, 1);
      inFlightPatch.current = patch;
      if (mounted.current) setSaveState("saving");
      try {
        const saved = await client.patchSettings(patch);
        inFlightPatch.current = {};
        reconcileDraft(saved);
        const stillPending = hasSettingsPatch(pendingPatch.current)
          || queuedPatches.current.length > 0;
        if (mounted.current) {
          setDirty(stillPending);
          setSaveState(stillPending ? "saving" : "saved");
        }
      } catch (error) {
        inFlightPatch.current = {};
        pendingPatch.current = mergeSettingsPatches(patch, pendingPatch.current);
        if (mounted.current) {
          setDirty(true);
          setSaveState("error");
          client.notify("error", error instanceof Error ? error.message : "Could not save LumiStage settings.");
        }
        throw error;
      }
    };
    const queued = saveTail.current.catch(() => undefined).then(run);
    saveTail.current = queued;
    await queued;
  };

  const scheduleSave = (immediate = false) => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    setDirty(true);
    setSaveState("saving");
    if (immediate) {
      void flushSettings().catch(() => undefined);
      return;
    }
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      void flushSettings().catch(() => undefined);
    }, 220);
  };

  useEffect(() => {
    if (backend.settings.revision <= draftRef.current.revision) return;
    reconcileDraft(backend.settings);
  }, [backend.settings.revision]);

  useEffect(() => () => {
    mounted.current = false;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    void flushSettings().catch(() => undefined);
  }, []);

  const edit = (patch: LumiStageSettingsPatchV2, immediate = false) => {
    if (!hasSettingsPatch(patch)) return;
    pendingPatch.current = mergeSettingsPatches(pendingPatch.current, patch);
    const settings = applySettingsPatch(draftRef.current, patch);
    draftRef.current = settings;
    setDraft(settings);
    scheduleSave(immediate);
  };
  const connections = [
    { value: "", label: "Use default Lumiverse connection", sublabel: "Follows the host backend default" },
    ...backend.connections.map((item) => ({
      value: item.id,
      label: item.name,
      sublabel: `${item.provider}${item.model ? ` · ${item.model}` : ""}`,
    })),
  ];
  const defaultConnectionId = backend.connections.find((item) => item.isDefault)?.id ?? null;
  const modelConnectionId = draft.detection.connectionId ?? defaultConnectionId;
  async function save() {
    try {
      await flushSettings();
      client.notify("success", "LumiStage settings saved.");
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save settings.");
    }
  }
  return (
    <div class="ls-page ls-settings-page">
      <WorkspaceTitle
        kicker="Configuration"
        title="Settings"
        description="Connection, detection, stage presentation, archives, and health in one focused workspace."
        actions={<Button variant="primary" icon="check" disabled={!dirty} onClick={() => void save()}>Save settings</Button>}
      />
      <div class="ls-settings-layout">
        <nav class="ls-settings-nav" aria-label="Settings sections">
          <button type="button" data-active={section === "detection"} onClick={() => setSection("detection")}><Icon name="automation" size={17} /><span><strong>Detection</strong><small>Connection and confidence</small></span></button>
          <button type="button" data-active={section === "stage"} onClick={() => setSection("stage")}><Icon name="appearance" size={17} /><span><strong>Stage</strong><small>Layout and motion</small></span></button>
          <button type="button" data-active={section === "data"} onClick={() => setSection("data")}><Icon name="download" size={17} /><span><strong>Data & health</strong><small>Archives and diagnostics</small></span></button>
        </nav>
        <main class="ls-settings-content">
          {section === "detection" && (
            <>
              <section class="ls-settings-card">
                <div class="ls-settings-card-head">
                  <div><span class="ls-kicker">Automatic direction</span><h3>Detection</h3><p>One call receives every outfit and expression after a successful reply; LumiStage selects the variant locally.</p></div>
                  <HostSwitch
                    client={client}
                    label="Automatic detection"
                    checked={draft.detection.enabled}
                    onChange={(enabled) => edit({ detection: { enabled } })}
                  />
                </div>
                <div class="ls-settings-form-grid">
                  <Field label="LLM connection" hint="Choose a profile or use Lumiverse’s backend default connection.">
                    <HostSelect
                      client={client}
                      label="LLM connection"
                      value={draft.detection.connectionId ?? ""}
                      options={connections}
                      onChange={(connectionId) => edit({
                        detection: { connectionId: connectionId || null, model: null },
                      }, true)}
                    />
                  </Field>
                  <Field label="Model" hint="The native picker reads the selected connection’s catalog.">
                    <HostModelPicker
                      client={client}
                      value={draft.detection.model ?? ""}
                      connectionId={modelConnectionId}
                      disabled={!modelConnectionId}
                      onChange={(model) => edit({ detection: { model: model || null } })}
                      onCommit={() => void flushSettings().catch(() => undefined)}
                    />
                  </Field>
                </div>
                <div class="ls-detector-save-state" data-state={saveState}>
                  <Icon
                    name={saveState === "error" ? "warning" : saveState === "saving" ? "refresh" : "success"}
                    size={14}
                  />
                  <span>
                    {saveState === "error"
                      ? "Detector settings were not saved. Use Save settings to retry."
                      : saveState === "saving"
                        ? "Saving detector settings…"
                        : `Saved detector model: ${backend.settings.detection.model || "connection default"}`}
                  </span>
                </div>
                <SettingRow title="Context window" description="Recent chat messages supplied to the detector.">
                  <HostNumber
                    client={client}
                    value={draft.detection.contextMessages}
                    min={1}
                    max={20}
                    onChange={(contextMessages) => edit({ detection: { contextMessages } })}
                  />
                </SettingRow>
                <HostRange
                  client={client}
                  value={Math.round(draft.detection.confidence * 100)}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  label="Confidence threshold"
                  hint="Below this threshold the complete prior stage state is preserved."
                  onChange={(confidence) => edit({ detection: { confidence: confidence / 100 } })}
                />
                <div class="ls-settings-inline-actions">
                  <Button icon="settings" onClick={() => client.send({ type: "open-connections" })}>Manage connections</Button>
                  <Button
                    icon="refresh"
                    disabled={!backend.activeChatId}
                    onClick={() => void (async () => {
                      await flushSettings();
                      await client.analyzeNow();
                    })().catch(() => undefined)}
                  >
                    Analyze current reply
                  </Button>
                </div>
              </section>
            </>
          )}
          {section === "stage" && (
            <section class="ls-settings-card">
              <div class="ls-settings-card-head">
                <div><span class="ls-kicker">Presentation</span><h3>Floating stage</h3><p>Responsive ensemble layout with media-safe transitions.</p></div>
              </div>
              <div class="ls-settings-form-grid">
                <Field label="Transition">
                  <HostSelect
                    client={client}
                    label="Transition"
                    value={draft.appearance.transition}
                    onChange={(transition) => edit({
                      appearance: { transition: transition as LumiStageSettingsV2["appearance"]["transition"] },
                    })}
                    options={[
                      { value: "crossfade", label: "Crossfade" },
                      { value: "lift", label: "Cue lift" },
                      { value: "cut", label: "Hard cut" },
                    ]}
                  />
                </Field>
                <Field label="Transition duration">
                  <HostNumber
                    client={client}
                    value={draft.appearance.transitionMs}
                    min={0}
                    max={2000}
                    step={20}
                    onChange={(transitionMs) => edit({ appearance: { transitionMs } })}
                  />
                </Field>
              </div>
              <HostRange client={client} value={Math.round(draft.appearance.opacity * 100)} min={10} max={100} step={5} suffix="%" label="Stage opacity" onChange={(value) => edit({ appearance: { opacity: value / 100 } })} />
              <HostRange client={client} value={Math.round(draft.appearance.idleOpacity * 100)} min={5} max={100} step={5} suffix="%" label="Unfocused character opacity" onChange={(value) => edit({ appearance: { idleOpacity: value / 100 } })} />
              <HostRange client={client} value={Math.round(draft.appearance.focusedScale * 100)} min={80} max={130} step={1} suffix="%" label="Focused character scale" onChange={(value) => edit({ appearance: { focusedScale: value / 100 } })} />
              <HostRange client={client} value={Math.round(draft.appearance.ensembleOverlap * 100)} min={0} max={80} step={5} suffix="%" label="Ensemble overlap" onChange={(value) => edit({ appearance: { ensembleOverlap: value / 100 } })} />
              <SettingRow title="Captions" description="Show resolved names beneath stage sprites.">
                <HostSwitch client={client} label="Captions" checked={draft.appearance.showCaptions} onChange={(showCaptions) => edit({ appearance: { showCaptions } })} />
              </SettingRow>
              <SettingRow title="Stage chrome" description="Show the compact live header and controls.">
                <HostSwitch client={client} label="Stage chrome" checked={draft.appearance.showChrome} onChange={(showChrome) => edit({ appearance: { showChrome } })} />
              </SettingRow>
              <div class="ls-settings-inline-actions">
                <Button onClick={() => edit({
                  appearance: { width: 320, height: 420, x: -1, y: -1, fullscreen: false },
                })}>Reset size and position</Button>
              </div>
            </section>
          )}
          {section === "data" && (
            <>
              <section class="ls-settings-card">
                <div class="ls-settings-card-head">
                  <div><span class="ls-kicker">Portable backup</span><h3>LumiStage archive</h3><p>Export or restore this character’s folders, expression slots, variants, and media.</p></div>
                </div>
                <div class="ls-data-actions">
                  <button type="button" disabled={!backend.profile} onClick={() => void client.exportProfile().catch(() => undefined)}>
                    <Icon name="download" size={20} />
                    <span><strong>Export archive</strong><small>Create a complete `.lumistage.zip` backup</small></span>
                    <Icon name="chevronRight" size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={!backend.profile}
                    onClick={() => backend.profile && showRestoreArchiveModal(client, backend.profile)}
                  >
                    <Icon name="upload" size={20} />
                    <span><strong>Restore archive</strong><small>Preview, confirm, and replace the active character profile</small></span>
                    <Icon name="chevronRight" size={16} />
                  </button>
                </div>
              </section>
              <DiagnosticsPanel client={client} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export function StudioWorkspace(props: {
  client: LumiStageClient;
  initialView?: StudioView;
}) {
  const state = useClientState(props.client);
  const backendProfile = state.backend.profile;
  const [view, setView] = useState<StudioView>(props.initialView ?? "library");
  const [draft, setDraft] = useState<CharacterProfileV2 | null>(
    () => backendProfile ? structuredClone(backendProfile) : null,
  );
  const [history, setHistory] = useState<CharacterProfileV2[]>([]);
  const [future, setFuture] = useState<CharacterProfileV2[]>([]);
  const [dirty, setDirty] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [baseRevision, setBaseRevision] = useState(backendProfile?.revision ?? 0);

  useEffect(() => {
    if (
      backendProfile
      && backendProfile.characterId === draft?.characterId
      && backendProfile.revision <= baseRevision
    ) return;
    if (
      dirty
      && backendProfile
      && backendProfile.characterId === draft?.characterId
      && backendProfile.revision > baseRevision
    ) {
      setConflict(true);
      return;
    }
    setDraft(backendProfile ? structuredClone(backendProfile) : null);
    setBaseRevision(backendProfile?.revision ?? 0);
    setHistory([]);
    setFuture([]);
    setDirty(false);
    setConflict(false);
  }, [backendProfile?.characterId, backendProfile?.revision, draft?.characterId, baseRevision, dirty]);

  function update(mutator: (profile: CharacterProfileV2) => void) {
    if (!draft) return;
    const before = structuredClone(draft);
    const next = structuredClone(draft);
    mutator(next);
    next.revision = baseRevision;
    next.updatedAt = Date.now();
    setHistory((items) => [...items.slice(-39), before]);
    setFuture([]);
    setDraft(next);
    setDirty(true);
  }

  function replace(profile: CharacterProfileV2) {
    if (!draft) return;
    setHistory((items) => [...items.slice(-39), structuredClone(draft)]);
    setFuture([]);
    setDraft({ ...structuredClone(profile), revision: baseRevision });
    setDirty(true);
  }

  function acceptCommitted(profile: CharacterProfileV2) {
    setDraft(structuredClone(profile));
    setBaseRevision(profile.revision);
    setHistory([]);
    setFuture([]);
    setDirty(false);
    setConflict(false);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous || !draft) return;
    setHistory(history.slice(0, -1));
    setFuture([structuredClone(draft), ...future].slice(0, 40));
    setDraft(structuredClone(previous));
    setDirty(true);
  }

  function redo() {
    const next = future[0];
    if (!next || !draft) return;
    setFuture(future.slice(1));
    setHistory([...history, structuredClone(draft)].slice(-40));
    setDraft(structuredClone(next));
    setDirty(true);
  }

  async function saveProfile() {
    if (!draft) return;
    const blocking = inspectProfile(draft).filter((issue) => issue.severity === "error");
    if (blocking.length) {
      props.client.notify("error", blocking[0].message);
      return;
    }
    try {
      const expectedRevision = Math.max(baseRevision, backendProfile?.revision ?? baseRevision);
      const candidate = { ...structuredClone(draft), revision: expectedRevision };
      const revision = await props.client.saveProfile(candidate, expectedRevision);
      setDraft({ ...candidate, revision });
      setBaseRevision(revision);
      setDirty(false);
      setConflict(false);
      props.client.notify("success", "Character library saved.");
    } catch (error) {
      props.client.notify("error", error instanceof Error ? error.message : "Could not save the library.");
    }
  }

  function changeCharacter(characterId: string) {
    if (dirty) {
      props.client.notify("warning", "Save or undo your library changes before switching characters.");
      return;
    }
    props.client.refresh(state.backend.activeChatId, characterId);
  }

  return (
    <div class="ls-studio">
      <ProgressNotice client={props.client} />
      <header class="ls-studio-topbar">
        <div class="ls-studio-brand">
          <span class="ls-brand-mark"><Icon name="stage" size={18} /></span>
          <span><strong>LumiStage</strong><small>Expression Studio</small></span>
        </div>
        <nav aria-label="Studio views">
          <button type="button" data-active={view === "library"} onClick={() => setView("library")}><Icon name="library" size={16} />Library</button>
          <button type="button" data-active={view === "stage"} onClick={() => setView("stage")}><Icon name="stage" size={16} />Live Stage</button>
          <button type="button" data-active={view === "settings"} onClick={() => setView("settings")}><Icon name="settings" size={16} />Settings</button>
        </nav>
        <div class="ls-studio-context">
          <div class="ls-character-select">
            <HostSelect
              client={props.client}
              label="Studio character"
              value={draft?.characterId ?? ""}
              onChange={changeCharacter}
              compact
              options={state.backend.stageProfiles.map((profile) => ({
                value: profile.characterId,
                label: profile.characterName,
                sublabel: `${profile.outfits.length} outfits`,
              }))}
            />
          </div>
          {view === "library" && (
            <Button
              size="small"
              icon="check"
              variant="primary"
              disabled={!dirty || state.busy || !!draft && inspectProfile(draft).some((issue) => issue.severity === "error")}
              onClick={() => void saveProfile()}
            >
              {state.busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
          )}
        </div>
      </header>

      <div class="ls-studio-content">
        {conflict && (
          <div class="ls-validation-note" data-tone="warning">
            <Icon name="warning" size={16} />
            <span>The backend changed while you were editing. Save applies your preserved draft to the latest revision, or reload to discard it.</span>
            <Button size="small" onClick={() => backendProfile && acceptCommitted(backendProfile)}>Reload profile</Button>
          </div>
        )}
        {view === "library" && draft && (
          <LibraryView
            client={props.client}
            profile={draft}
            update={update}
            replace={replace}
            acceptCommitted={acceptCommitted}
            undo={undo}
            redo={redo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
          />
        )}
        {view === "library" && !draft && (
          <div class="ls-page-center">
            <EmptyState
              icon="library"
              title="Choose a character"
              description="Open a character or chat in Lumiverse, then return to build its outfit library."
            />
          </div>
        )}
        {view === "stage" && <LiveStageView client={props.client} />}
        {view === "settings" && <SettingsView client={props.client} />}
      </div>
    </div>
  );
}

export function CharacterSetup(props: {
  client: LumiStageClient;
  characterId: string;
  onOpenStudio: (characterId: string) => void;
}) {
  const { backend, busy } = useClientState(props.client);
  const profile = backend.stageProfiles.find((candidate) => candidate.characterId === props.characterId)
    ?? (backend.profile?.characterId === props.characterId ? backend.profile : null);
  const [outfitId, setOutfitId] = useState("");
  const outfit = selectedOutfit(profile, outfitId);
  useEffect(() => {
    props.client.send({ type: "character-editor", characterId: props.characterId });
  }, [props.characterId]);
  useEffect(() => {
    if (profile && !profile.outfits.some((item) => item.id === outfitId)) {
      setOutfitId(profile.defaultOutfitId ?? profile.outfits[0]?.id ?? "");
    }
  }, [profile?.revision, outfitId]);

  async function commit(mutator: (profile: CharacterProfileV2) => void) {
    if (!profile) return;
    const next = structuredClone(profile);
    mutator(next);
    try {
      await props.client.saveProfile(next);
    } catch (error) {
      props.client.notify("error", error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  if (!profile) {
    return (
      <div class="ls-character-setup ls-character-loading">
        <span class="ls-loading-pulse" />
        <strong>Loading LumiStage profile…</strong>
      </div>
    );
  }

  return (
    <div class="ls-character-setup">
      <div class="ls-character-setup-head">
        <div>
          <span class="ls-kicker">Independent expression library</span>
          <h2>{profile.characterName}</h2>
          <p>{profile.outfits.length} outfits · {countExpressions(profile)} expressions · {allVariants(profile).length} sprites</p>
        </div>
        <Button
          icon="expand"
          variant="primary"
          onClick={() => props.onOpenStudio(profile.characterId)}
        >
          Open Studio
        </Button>
      </div>

      <div class="ls-character-outfit-strip">
        {profile.outfits.map((item) => (
          <button key={item.id} type="button" data-active={item.id === outfit?.id} onClick={() => setOutfitId(item.id)}>
            <Icon name="outfit" size={15} />
            <span>{item.name}</span>
            <small>{item.expressions.length}</small>
          </button>
        ))}
        <button
          type="button"
          class="ls-character-add-outfit"
          onClick={() => showTextPrompt(
            props.client,
            { title: "New outfit", label: "Outfit name", submitLabel: "Create outfit" },
            (name) => commit((next) => {
              const created = createOutfit(name);
              created.order = next.outfits.length;
              next.outfits.push(created);
              next.defaultOutfitId ??= created.id;
            }),
          )}
        >
          <Icon name="plus" size={15} />Add outfit
        </button>
      </div>

      <div class="ls-character-toolbar">
        <div>
          <strong>{outfit?.name ?? "Outfit"}</strong>
          <span>{outfit?.expressions.length ?? 0} expression slots</span>
        </div>
        <Toolbar>
          <Button
            size="small"
            icon="check"
            disabled={!outfit || profile.defaultOutfitId === outfit.id || busy}
            onClick={() => void commit((next) => { next.defaultOutfitId = outfit?.id ?? null; })}
          >
            Set default outfit
          </Button>
          <Button
            size="small"
            icon="upload"
            onClick={() => showImportModal(props.client, profile, { outfitId: outfit?.id })}
          >
            Import
          </Button>
        </Toolbar>
      </div>

      <div class="ls-character-expression-grid">
        {(outfit?.expressions ?? []).map((expression) => {
          const variant = firstVariant(expression);
          const view = variant ? backend.variantViews[variant.id] : null;
          return (
            <button
              key={expression.id}
              type="button"
              class="ls-character-expression-card"
              data-default={outfit?.defaultExpressionId === expression.id}
              onClick={() => void commit((next) => {
                const target = next.outfits.find((item) => item.id === outfit?.id);
                if (target) target.defaultExpressionId = expression.id;
              })}
            >
              <Media
                src={view?.thumbUrl ?? view?.url ?? null}
                kind={view?.mediaKind ?? "image"}
                label={expression.name}
                contain
              />
              <span><strong>{expression.name}</strong><small>{expression.variants.length} variants</small></span>
              {outfit?.defaultExpressionId === expression.id && <i><Icon name="check" size={12} />Default</i>}
            </button>
          );
        })}
        <button
          type="button"
          class="ls-character-new-expression"
          onClick={() => showTextPrompt(
            props.client,
            { title: "New expression", label: "Expression name", placeholder: "Happy", submitLabel: "Create expression" },
            (name) => commit((next) => {
              const target = next.outfits.find((item) => item.id === outfit?.id);
              if (!target) return;
              const expression = createExpression(name);
              expression.order = target.expressions.length;
              target.expressions.push(expression);
              target.defaultExpressionId ??= expression.id;
            }),
          )}
        >
          <Icon name="plus" size={20} />
          <span>New expression</span>
        </button>
      </div>
    </div>
  );
}
