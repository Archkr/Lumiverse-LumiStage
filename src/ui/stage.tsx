import type { JSX } from "preact";
import type { ActorStageState } from "../types";
import type { LumiStageClient } from "./client";
import { Icon } from "./icons";
import { useStableMedia } from "./media";
import { useClientState } from "./primitives";

function StageActor({ state, client }: { state: ActorStageState; client: LumiStageClient }) {
  const { backend } = useClientState(client);
  const view = state.assetId ? backend.assetViews[state.assetId] : null;
  const src = useStableMedia(view?.url ?? null, view?.mediaKind ?? "image");
  return (
    <figure class="ls2-stage-actor" data-focused={state.focused}>
      <div class="ls2-stage-actor-frame">
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
  const actors = Object.values(backend.snapshot?.actors ?? {}).filter((actor) => !!actor.assetId)
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
    <div class="ls2-stage-root" style={style} data-chrome={appearance.showChrome} data-transition={appearance.transition}>
      <div class="ls2-stage-chrome">
        <div class="ls2-stage-grab">
          <span class="ls2-stage-live"><span />LumiStage</span>
          <div class="ls2-stage-actions">
            <button type="button" onClick={props.onQuick} title="Direct stage" aria-label="Direct stage"><Icon name="sparkles" size={15} /></button>
            <button type="button" onClick={props.onFullscreen} title="Toggle fullscreen" aria-label="Toggle fullscreen"><Icon name="expand" size={15} /></button>
            <button type="button" onClick={props.onHide} title="Hide stage" aria-label="Hide stage"><Icon name="close" size={15} /></button>
          </div>
        </div>
        {actors.length ? (
          <div class="ls2-stage-ensemble">
            {actors.map((actor) => <StageActor key={actor.actorId} state={actor} client={props.client} />)}
          </div>
        ) : (
          <div class="ls2-stage-waiting">
            <div><Icon name="stage" size={24} /></div>
            <strong>Stage ready</strong>
            <span>Choose a state or complete a reply.</span>
          </div>
        )}
        <button type="button" class="ls2-stage-resize" onPointerDown={startResize} aria-label="Resize LumiStage" title="Resize stage"><span /></button>
      </div>
    </div>
  );
}

