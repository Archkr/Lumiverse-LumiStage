import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import type {
  CharacterProfileV2,
  ImportLayoutV2,
  ManualOverrideV2,
  StageVariantV2,
} from "../types";
import type { LumiStageClient } from "./client";
import { HostSelect } from "./host-controls";
import { Icon } from "./icons";
import { Media } from "./media";
import {
  Button,
  EmptyState,
  Field,
  SearchInput,
  Toolbar,
  useClientState,
} from "./primitives";

export function showTextPrompt(
  client: LumiStageClient,
  options: {
    title: string;
    label: string;
    placeholder?: string;
    initial?: string;
    submitLabel?: string;
  },
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
      <form class="ls-modal-form" onSubmit={submit}>
        <Field label={options.label}>
          <input
            class="ls-input"
            autoFocus
            value={value}
            placeholder={options.placeholder}
            onInput={(event) => setValue(event.currentTarget.value)}
          />
        </Field>
        <div class="ls-modal-actions">
          <Button variant="ghost" onClick={() => modal.dismiss()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!value.trim() || busy}>
            {options.submitLabel ?? "Save"}
          </Button>
        </div>
      </form>
    );
  }
  render(<Prompt />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

export function showImportModal(
  client: LumiStageClient,
  profile: CharacterProfileV2 | null,
  target?: { outfitId?: string; expressionId?: string },
) {
  const modal = client.ctx.ui.showModal({
    title: "Import LumiStage media",
    width: 720,
    maxHeight: 820,
    persistent: true,
  });
  function Importer() {
    const [files, setFiles] = useState<File[]>([]);
    const [layout, setLayout] = useState<ImportLayoutV2>("automatic");
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const preview = useMemo(() => files.slice(0, 10).map((file) => {
      const parts = file.webkitRelativePath?.split("/").filter(Boolean) ?? [file.name];
      const leaf = parts.pop() ?? file.name;
      const expression = leaf.replace(/\.[^.]+$/, "");
      if (layout === "outfit-expression-variant" || (layout === "automatic" && parts.length >= 2)) {
        return `${parts[0] ?? "Default"} / ${parts[1] ?? expression} / ${leaf}`;
      }
      return `${parts[0] ?? "Default"} / ${expression}`;
    }), [files, layout]);

    async function start() {
      if (!files.length || busy) return;
      setBusy(true);
      try {
        await client.importFiles(files, layout, target?.outfitId, target?.expressionId);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Import failed.");
        setBusy(false);
      }
    }

    function accept(next: FileList | File[]) {
      setFiles(Array.from(next).filter(
        (file) => /\.(?:zip|png|jpe?g|webp|gif|webm|mp4)$/i.test(file.name),
      ));
    }

    return (
      <div class="ls-import-modal">
        <div
          class="ls-dropzone"
          data-dragging={dragging}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer?.files ?? []);
          }}
        >
          <input
            type="file"
            multiple
            accept=".zip,.png,.jpg,.jpeg,.webp,.gif,.webm,.mp4"
            onChange={(event) => event.currentTarget.files && accept(event.currentTarget.files)}
          />
          <span class="ls-dropzone-mark"><Icon name="upload" size={26} /></span>
          <strong>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} ready` : "Drop sprites, video, or a LumiStage archive"}</strong>
          <p>PNG, JPEG, WebP, GIF, muted WebM, muted MP4, or `.lumistage.zip`</p>
          <Button icon="plus">Choose files</Button>
        </div>

        <section class="ls-import-mapping">
          <div>
            <span class="ls-kicker">Folder mapping</span>
            <h3>Preview before upload</h3>
            <p>Root files use Default. Two folders create Outfit / Expression / Variant.</p>
          </div>
          <HostSelect
            client={client}
            label="Import folder mapping"
            value={layout}
            onChange={(value) => setLayout(value as ImportLayoutV2)}
            options={[
              { value: "automatic", label: "Detect folder depth", sublabel: "Recommended for mixed ZIPs" },
              { value: "outfit-expression", label: "Outfit / Expression.ext" },
              { value: "outfit-expression-variant", label: "Outfit / Expression / Variant.ext" },
            ]}
          />
          {files.length > 0 && (
            <div class="ls-mapping-preview">
              {preview.map((path) => (
                <div><Icon name="image" size={14} /><span>{path}</span></div>
              ))}
              {files.length > preview.length && <small>+ {files.length - preview.length} more</small>}
            </div>
          )}
        </section>

        <div class="ls-validation-note">
          <Icon name="success" size={16} />
          <span>Paths, codecs, expansion size, collisions, and duplicate content are validated before commit.</span>
        </div>
        <div class="ls-modal-actions">
          <Button variant="ghost" onClick={() => modal.dismiss()}>Cancel</Button>
          <Button
            variant="primary"
            icon="upload"
            disabled={!files.length || busy}
            onClick={() => void start()}
          >
            {busy ? "Importing…" : "Import media"}
          </Button>
        </div>
      </div>
    );
  }
  render(<Importer />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}

function firstVariant(
  expression: { variants: StageVariantV2[] } | null | undefined,
): StageVariantV2 | null {
  return expression
    ? [...expression.variants].sort((a, b) => a.order - b.order)[0] ?? null
    : null;
}

export function showQuickPicker(client: LumiStageClient) {
  const modal = client.ctx.ui.showModal({ title: "Direct LumiStage", width: 900, maxHeight: 860 });
  function Picker() {
    const { backend, busy } = useClientState(client);
    const profiles = backend.stageProfiles;
    const [characterId, setCharacterId] = useState(
      backend.snapshot?.focusedCharacterIds[0] ?? profiles[0]?.characterId ?? "",
    );
    const profile = profiles.find((item) => item.characterId === characterId) ?? profiles[0] ?? null;
    const current = profile ? backend.snapshot?.characters[profile.characterId] : null;
    const [outfitId, setOutfitId] = useState(
      current?.outfitId ?? profile?.defaultOutfitId ?? profile?.outfits[0]?.id ?? "",
    );
    const outfit = profile?.outfits.find((item) => item.id === outfitId) ?? profile?.outfits[0] ?? null;
    const [expressionId, setExpressionId] = useState(
      current?.expressionId ?? outfit?.defaultExpressionId ?? outfit?.expressions[0]?.id ?? "",
    );
    const expression = outfit?.expressions.find((item) => item.id === expressionId) ?? outfit?.expressions[0] ?? null;
    const [variantId, setVariantId] = useState(
      current?.variantId ?? firstVariant(expression)?.id ?? "",
    );
    const [query, setQuery] = useState("");
    const expressions = (outfit?.expressions ?? []).filter((item) =>
      !query.trim()
      || item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
      || item.variants.some((variant) =>
        variant.fileName.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
      )
    );
    const locked = profile
      ? backend.timeline?.manualOverrides[profile.characterId]?.scope === "locked"
      : false;

    function selectProfile(id: string) {
      setCharacterId(id);
      const nextProfile = profiles.find((item) => item.characterId === id);
      const nextOutfit = nextProfile?.outfits.find(
        (item) => item.id === nextProfile.defaultOutfitId,
      ) ?? nextProfile?.outfits[0];
      const nextExpression = nextOutfit?.expressions.find(
        (item) => item.id === nextOutfit.defaultExpressionId,
      ) ?? nextOutfit?.expressions[0];
      setOutfitId(nextOutfit?.id ?? "");
      setExpressionId(nextExpression?.id ?? "");
      setVariantId(firstVariant(nextExpression)?.id ?? "");
    }

    function selectOutfit(id: string) {
      setOutfitId(id);
      const nextOutfit = profile?.outfits.find((item) => item.id === id);
      const nextExpression = nextOutfit?.expressions.find(
        (item) => item.id === nextOutfit.defaultExpressionId,
      ) ?? nextOutfit?.expressions[0];
      setExpressionId(nextExpression?.id ?? "");
      setVariantId(firstVariant(nextExpression)?.id ?? "");
    }

    function selectExpression(id: string) {
      setExpressionId(id);
      const next = outfit?.expressions.find((item) => item.id === id);
      setVariantId(firstVariant(next)?.id ?? "");
    }

    async function apply(scope: "once" | "locked", lock: "outfit" | "state") {
      if (!profile || !outfit || !expression || !variantId) return;
      const override: ManualOverrideV2 = {
        characterId: profile.characterId,
        outfitId: outfit.id,
        expressionId: expression.id,
        variantId,
        scope,
        lock,
        createdAt: Date.now(),
      };
      try {
        await client.applyManual(override);
        modal.dismiss();
      } catch (error) {
        client.notify("error", error instanceof Error ? error.message : "Could not direct the stage.");
      }
    }

    if (!profiles.length) {
      return (
        <div class="ls-modal-empty">
          <EmptyState
            icon="characters"
            title="No character profiles on this stage"
            description="Import sprites for a character before directing the live stage."
          />
        </div>
      );
    }

    return (
      <div class="ls-quick-picker">
        <div class="ls-picker-controls">
          <Field label="Character">
            <HostSelect
              client={client}
              label="Character"
              value={profile?.characterId ?? ""}
              onChange={selectProfile}
              options={profiles.map((item) => ({
                value: item.characterId,
                label: item.characterName,
                sublabel: `${item.outfits.length} outfits`,
              }))}
            />
          </Field>
          <Field label="Outfit">
            <HostSelect
              client={client}
              label="Outfit"
              value={outfit?.id ?? ""}
              onChange={selectOutfit}
              options={(profile?.outfits ?? []).map((item) => ({
                value: item.id,
                label: item.name,
                sublabel: `${item.expressions.length} expressions`,
              }))}
            />
          </Field>
        </div>

        <SearchInput value={query} onInput={setQuery} placeholder="Find an expression or sprite…" />
        <div class="ls-picker-body">
          <div class="ls-picker-expression-grid">
            {expressions.map((item) => {
              const preview = firstVariant(item);
              const view = preview ? backend.variantViews[preview.id] : null;
              return (
                <button
                  type="button"
                  class="ls-picker-expression"
                  data-selected={item.id === expression?.id}
                  onClick={() => selectExpression(item.id)}
                >
                  <Media
                    src={view?.thumbUrl ?? view?.url ?? null}
                    kind={view?.mediaKind ?? "image"}
                    label={item.name}
                    class="ls-picker-expression-media"
                    contain
                  />
                  <span><strong>{item.name}</strong><small>{item.variants.length} variant{item.variants.length === 1 ? "" : "s"}</small></span>
                  {item.id === expression?.id && <i><Icon name="check" size={13} /></i>}
                </button>
              );
            })}
          </div>
          <aside class="ls-picker-variants">
            <span class="ls-kicker">Exact sprite</span>
            <h3>{expression?.name ?? "Select an expression"}</h3>
            <div>
              {(expression?.variants ?? []).map((variant) => {
                const view = backend.variantViews[variant.id];
                return (
                  <button
                    type="button"
                    data-selected={variant.id === variantId}
                    onClick={() => setVariantId(variant.id)}
                    aria-label={`Use ${variant.fileName}`}
                  >
                    <Media
                      src={view?.thumbUrl ?? view?.url ?? null}
                      kind={variant.mediaKind}
                      label={variant.fileName}
                      contain
                    />
                    <span>{variant.fileName}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>

        <div class="ls-picker-footer">
          {locked && (
            <Button
              icon="unlock"
              variant="ghost"
              onClick={() => profile && void client.clearManual(profile.characterId)}
            >
              Clear current lock
            </Button>
          )}
          <Toolbar>
            <Button disabled={!variantId || busy} onClick={() => void apply("once", "state")}>
              Apply once
            </Button>
            <Button icon="lock" disabled={!variantId || busy} onClick={() => void apply("locked", "outfit")}>
              Lock outfit
            </Button>
            <Button variant="primary" icon="lock" disabled={!variantId || busy} onClick={() => void apply("locked", "state")}>
              Lock state
            </Button>
          </Toolbar>
        </div>
      </div>
    );
  }
  render(<Picker />, modal.root);
  modal.onDismiss(() => render(null, modal.root));
}
