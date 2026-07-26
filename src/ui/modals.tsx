import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import type { CharacterProfileV1, ImportLayout, ManualOverride } from "../types";
import type { LumiStageClient } from "./client";
import { Media } from "./media";
import { Button, EmptyState, Field, SearchInput, Segmented, Surface, Toolbar, useClientState } from "./primitives";
import { Icon } from "./icons";

function cleanList(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function showTextPrompt(
  client: LumiStageClient,
  options: { title: string; label: string; placeholder?: string; initial?: string; submitLabel?: string },
  onSubmit: (value: string) => void | Promise<void>,
) {
  const modal = client.ctx.ui.showModal({ title: options.title, width: 460, maxHeight: 430 });
  function Prompt() {
    const [value, setValue] = useState(options.initial ?? "");
    const [busy, setBusy] = useState(false);
    async function submit(event: Event) {
      event.preventDefault();
      if (!value.trim() || busy) return;
      setBusy(true);
      try {
        await onSubmit(value.trim());
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not save.");
        setBusy(false);
      }
    }
    return (
      <form class="ls2-modal" onSubmit={submit}>
        <Field label={options.label}>
          <input class="ls2-input" autoFocus value={value} placeholder={options.placeholder} onInput={(event) => setValue(event.currentTarget.value)} />
        </Field>
        <div class="ls2-modal-actions">
          <Button variant="ghost" onClick={() => modal.dismiss()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!value.trim() || busy}>{options.submitLabel ?? "Create"}</Button>
        </div>
      </form>
    );
  }
  render(<Prompt />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export function showImportModal(client: LumiStageClient, profile: CharacterProfileV1 | null) {
  const modal = client.ctx.ui.showModal({ title: "Import media", width: 660, maxHeight: 760, persistent: true });
  function Importer() {
    const [files, setFiles] = useState<File[]>([]);
    const [layout, setLayout] = useState<ImportLayout>("outfit-pose-expression");
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const preview = useMemo(() => files.slice(0, 8).map((file) => {
      const parts = file.webkitRelativePath?.split("/").filter(Boolean) ?? [file.name];
      const leaf = parts.pop() ?? file.name;
      const expression = leaf.replace(/\.[^.]+$/, "");
      if (layout === "actor-outfit-pose-expression") {
        return `${parts[0] ?? "Default actor"} / ${parts[1] ?? "Default"} / ${parts[2] ?? "Default"} / ${expression}`;
      }
      return `${profile?.characterName ?? "Current actor"} / ${parts[0] ?? "Default"} / ${parts[1] ?? "Default"} / ${expression}`;
    }), [files, layout]);
    async function start() {
      if (!files.length || busy) return;
      setBusy(true);
      try {
        await client.importFiles(files, layout, profile?.defaultActorId ?? undefined);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
        setBusy(false);
      }
    }
    function accept(next: FileList | File[]) {
      setFiles(Array.from(next).filter((file) => /\.(?:zip|png|jpe?g|webp|gif|webm|mp4)$/i.test(file.name)));
    }
    return (
      <div class="ls2-modal ls2-import">
        <div
          class="ls2-dropzone"
          data-dragging={dragging}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer?.files ?? []); }}
        >
          <input type="file" multiple accept=".zip,.png,.jpg,.jpeg,.webp,.gif,.webm,.mp4" onChange={(event) => event.currentTarget.files && accept(event.currentTarget.files)} />
          <div class="ls2-dropzone-icon"><Icon name="upload" size={24} /></div>
          <strong>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} ready` : "Drop media or a LumiStage archive"}</strong>
          <p>PNG, JPEG, WebP, GIF, muted WebM, muted MP4, or `.lumistage.zip`</p>
          <Button icon="plus" variant="default">Choose files</Button>
        </div>

        <Surface>
          <div class="ls2-modal-section-head"><div><strong>Folder mapping</strong><span>Nothing is uploaded until you confirm.</span></div></div>
          <Segmented
            label="Import layout"
            value={layout}
            onChange={setLayout}
            options={[
              { value: "outfit-pose-expression", label: "Outfit / Pose / Expression" },
              { value: "actor-outfit-pose-expression", label: "Actor / Outfit / Pose / Expression" },
            ]}
          />
          {files.length > 0 && (
            <div class="ls2-mapping-preview">
              {preview.map((path) => <div><Icon name="image" size={14} /><span>{path}</span></div>)}
              {files.length > preview.length && <small>+ {files.length - preview.length} more files</small>}
            </div>
          )}
        </Surface>

        <div class="ls2-safe-note"><Icon name="success" size={16} /><span>Paths, codecs, expansion size, collisions, and duplicate content are validated before commit.</span></div>
        <div class="ls2-modal-actions">
          <Button variant="ghost" onClick={() => modal.dismiss()}>Cancel</Button>
          <Button variant="primary" icon="upload" disabled={!files.length || busy} onClick={() => void start()}>{busy ? "Importing…" : "Review & import"}</Button>
        </div>
      </div>
    );
  }
  render(<Importer />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export function showQuickPicker(client: LumiStageClient) {
  const modal = client.ctx.ui.showModal({ title: "Direct the stage", width: 720, maxHeight: 780 });
  function Picker() {
    const { backend, busy } = useClientState(client);
    const actors = backend.stageProfiles.flatMap((profile) => profile.actors.map((actor) => ({ profile, actor })));
    const [actorId, setActorId] = useState(actors.find((entry) => entry.actor.id === backend.snapshot?.focusedActorIds[0])?.actor.id ?? actors[0]?.actor.id ?? "");
    const entry = actors.find((item) => item.actor.id === actorId) ?? actors[0] ?? null;
    const current = entry ? backend.snapshot?.actors[entry.actor.id] : null;
    const [outfitId, setOutfitId] = useState(current?.outfitId ?? entry?.actor.defaultOutfitId ?? entry?.actor.outfits[0]?.id ?? "");
    const outfit = entry?.actor.outfits.find((item) => item.id === outfitId) ?? entry?.actor.outfits[0] ?? null;
    const [poseId, setPoseId] = useState(current?.poseId ?? outfit?.defaultPoseId ?? outfit?.poses[0]?.id ?? "");
    const pose = outfit?.poses.find((item) => item.id === poseId) ?? outfit?.poses[0] ?? null;
    const [expressionId, setExpressionId] = useState(current?.expressionId ?? pose?.defaultExpressionId ?? pose?.expressions[0]?.id ?? "");
    const [scope, setScope] = useState<"once" | "locked">("once");
    const [query, setQuery] = useState("");
    const expressions = (pose?.expressions ?? []).filter((expression) =>
      !query.trim() || [expression.name, ...expression.aliases, ...expression.tags].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
    );
    const locked = entry ? backend.timeline?.manualOverrides[entry.actor.id]?.scope === "locked" : false;

    async function apply() {
      if (!entry || !outfit || !pose || !expressionId) return;
      const override: ManualOverride = {
        actorId: entry.actor.id,
        outfitId: outfit.id,
        poseId: pose.id,
        expressionId,
        scope,
        createdAt: Date.now(),
      };
      try {
        await client.applyManual(override);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not direct the stage.");
      }
    }

    if (!actors.length) {
      return <div class="ls2-modal"><EmptyState icon="actors" title="No stage actors yet" description="Create a LumiStage profile and import media before directing the live stage." /></div>;
    }
    return (
      <div class="ls2-modal ls2-picker">
        <div class="ls2-picker-context">
          <Field label="Actor">
            <select class="ls2-select" value={entry?.actor.id} onChange={(event) => {
              const id = event.currentTarget.value;
              setActorId(id);
              const next = actors.find((item) => item.actor.id === id);
              const nextOutfit = next?.actor.outfits.find((item) => item.id === next.actor.defaultOutfitId) ?? next?.actor.outfits[0];
              const nextPose = nextOutfit?.poses.find((item) => item.id === nextOutfit.defaultPoseId) ?? nextOutfit?.poses[0];
              setOutfitId(nextOutfit?.id ?? "");
              setPoseId(nextPose?.id ?? "");
              setExpressionId(nextPose?.defaultExpressionId ?? nextPose?.expressions[0]?.id ?? "");
            }}>{actors.map((item) => <option value={item.actor.id}>{item.actor.name}</option>)}</select>
          </Field>
          <Field label="Outfit">
            <select class="ls2-select" value={outfit?.id} onChange={(event) => {
              const id = event.currentTarget.value;
              setOutfitId(id);
              const next = entry?.actor.outfits.find((item) => item.id === id);
              const nextPose = next?.poses.find((item) => item.id === next.defaultPoseId) ?? next?.poses[0];
              setPoseId(nextPose?.id ?? "");
              setExpressionId(nextPose?.defaultExpressionId ?? nextPose?.expressions[0]?.id ?? "");
            }}>{entry?.actor.outfits.map((item) => <option value={item.id}>{item.name}</option>)}</select>
          </Field>
          <Field label="Pose">
            <select class="ls2-select" value={pose?.id} onChange={(event) => {
              const id = event.currentTarget.value;
              setPoseId(id);
              const next = outfit?.poses.find((item) => item.id === id);
              setExpressionId(next?.defaultExpressionId ?? next?.expressions[0]?.id ?? "");
            }}>{outfit?.poses.map((item) => <option value={item.id}>{item.name}</option>)}</select>
          </Field>
        </div>

        <SearchInput value={query} onInput={setQuery} placeholder="Find an expression…" />
        <div class="ls2-picker-grid">
          {expressions.map((expression) => {
            const media = [...expression.assets].filter((asset) => asset.enabled).sort((a, b) => b.priority - a.priority)[0];
            const view = media ? backend.assetViews[media.id] : null;
            return (
              <button type="button" class="ls2-expression-choice" data-selected={expression.id === expressionId} onClick={() => setExpressionId(expression.id)}>
                <Media src={view?.thumbUrl ?? view?.url ?? null} kind={view?.mediaKind ?? "image"} label={expression.name} class="ls2-expression-choice-media" contain />
                <span><strong>{expression.name}</strong><small>{expression.assets.length} media</small></span>
                {expression.id === expressionId && <span class="ls2-choice-check"><Icon name="check" size={13} /></span>}
              </button>
            );
          })}
        </div>
        <div class="ls2-picker-footer">
          <Segmented label="Override duration" value={scope} onChange={setScope} options={[{ value: "once", label: "Apply once", icon: "play" }, { value: "locked", label: "Lock state", icon: "lock" }]} />
          <Toolbar>
            {locked && <Button icon="unlock" variant="ghost" onClick={() => entry && void client.clearManual(entry.actor.id)}>Clear lock</Button>}
            <Button variant="primary" icon={scope === "locked" ? "lock" : "play"} disabled={!expressionId || busy} onClick={() => void apply()}>{scope === "locked" ? "Lock on stage" : "Apply now"}</Button>
          </Toolbar>
        </div>
      </div>
    );
  }
  render(<Picker />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export { cleanList };

