import type { JSX } from "preact";
import type { CharacterStageStateV2 } from "../types";
import type { LumiStageClient } from "./client";
import { Icon } from "./icons";
import { useStableMedia } from "./media";
import { useClientState } from "./primitives";

function StageCharacter({ state, client }: { state: CharacterStageStateV2; client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const view = state.variantId ? backend.variantViews[state.variantId] : null;
  const src = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  return (
    <figure class="ls-stage-character" data-focused={state.focused}>
      <div class="ls-stage-character-frame">
        {src && (view?.mediaKind === "video"
          ? <video key={src} src={src} muted loop playsInline autoPlay aria-label={state.label} />
          : <img key={src} src={src} alt={state.label} draggable={false} />)}
      </div>
      {backend.settings.appearance.showCaptions && (
        <figcaption>
          <strong>{state.label.split(" · ")[0]}</strong>
          <span>{state.label.split(" · ").slice(1).join(" / ")}</span>
        </figcaption>
      )}
    </figure>
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
  const characters = Object.values(backend.snapshot?.characters ?? {}).filter((character) => !!character.variantId)
    .sort((a, b) => Number(a.focused) - Number(b.focused));
  const style = {
    "--ls2-stage-opacity": appearance.opacity,
    "--ls2-stage-transition": `${appearance.transitionMs}ms`,
    "--ls2-stage-focus-scale": appearance.focusedScale,
    "--ls2-stage-idle-opacity": appearance.idleOpacity,
    "--ls2-stage-overlap": appearance.ensembleOverlap,
  } as JSX.CSSProperties;

  function startResize(event: JSX.TargetedPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = appearance.width;
    const startHeight = appearance.height;
    let width = startWidth;
    let height = startHeight;
    const move = (next: PointerEvent) => {
      width = Math.max(200, Math.min(1200, Math.round(startWidth + next.clientX - startX)));
      height = Math.max(240, Math.min(1000, Math.round(startHeight + next.clientY - startY)));
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
  }

  return (
    <div class="ls-stage-root" style={style} data-chrome={appearance.showChrome} data-transition={appearance.transition}>
      <div class="ls-stage-chrome">
        <div class="ls-stage-grab">
          <span class="ls-stage-live"><span />LumiStage</span>
          <div class="ls-stage-actions">
            <button type="button" onClick={props.onQuick} title="Direct stage" aria-label="Direct stage"><Icon name="sparkles" size={15} /></button>
            <button type="button" onClick={props.onFullscreen} title="Toggle fullscreen" aria-label="Toggle fullscreen"><Icon name="expand" size={15} /></button>
            <button type="button" onClick={props.onHide} title="Hide stage" aria-label="Hide stage"><Icon name="close" size={15} /></button>
          </div>
        </div>
        {characters.length ? (
          <div class="ls-stage-ensemble">
            {characters.map((character) => <StageCharacter key={character.characterId} state={character} client={props.client} />)}
          </div>
        ) : (
          <div class="ls-stage-waiting">
            <div><Icon name="stage" size={24} /></div>
            <strong>Stage ready</strong>
            <span>Choose a state or complete a reply.</span>
          </div>
        )}
        <button type="button" class="ls-stage-resize" onPointerDown={startResize} aria-label="Resize LumiStage" title="Resize stage"><span /></button>
      </div>
    </div>
  );
}
