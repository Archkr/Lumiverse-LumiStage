import type { ComponentChildren, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { ClientUiState, LumiStageClient } from "./client";
import { Icon, type IconName } from "./icons";

export function useClientState(client: LumiStageClient): ClientUiState {
  const [state, setState] = useState<ClientUiState>(() => client.getSnapshot());
  useEffect(() => client.subscribe(() => setState(client.getSnapshot())), [client]);
  return state;
}

export function Button(props: {
  children: ComponentChildren;
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "small" | "default";
  title?: string;
  type?: "button" | "submit";
  class?: string;
}) {
  return (
    <button
      type={props.type ?? "button"}
      class={`ls-button ls-button-${props.variant ?? "default"} ls-button-${props.size ?? "default"} ${props.class ?? ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
    >
      {props.icon && <Icon name={props.icon} size={props.size === "small" ? 14 : 16} />}
      <span>{props.children}</span>
    </button>
  );
}

export function IconButton(props: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      class="ls-icon-button"
      data-active={props.active}
      data-danger={props.danger}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props.label}
      title={props.label}
    >
      <Icon name={props.icon} size={17} />
    </button>
  );
}

export function Surface(props: {
  children: ComponentChildren;
  class?: string;
  tone?: "default" | "accent" | "danger";
  padding?: "none" | "small" | "default";
}) {
  return <section class={`ls-surface ${props.class ?? ""}`} data-tone={props.tone ?? "default"} data-padding={props.padding ?? "default"}>{props.children}</section>;
}

export function Field(props: { label: string; hint?: string; children: ComponentChildren; class?: string }) {
  return (
    <label class={`ls-field ${props.class ?? ""}`}>
      <span class="ls-field-label">{props.label}</span>
      {props.children}
      {props.hint && <span class="ls-field-hint">{props.hint}</span>}
    </label>
  );
}

export function Toggle(props: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label class="ls-toggle-row" data-disabled={props.disabled}>
      <span class="ls-toggle-copy"><strong>{props.label}</strong>{props.hint && <small>{props.hint}</small>}</span>
      <input type="checkbox" checked={props.checked} disabled={props.disabled} onChange={(event) => props.onChange(event.currentTarget.checked)} />
      <span class="ls-toggle-track" aria-hidden="true"><span /></span>
    </label>
  );
}

export function Status({ tone = "neutral", children }: { tone?: "neutral" | "accent" | "success" | "warning" | "danger"; children: ComponentChildren }) {
  return <span class="ls-status" data-tone={tone}><span class="ls-status-dot" />{children}</span>;
}

export function ViewHeader(props: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ComponentChildren;
}) {
  return (
    <header class="ls-view-header">
      <div class="ls-view-heading">
        {props.eyebrow && <span class="ls-eyebrow">{props.eyebrow}</span>}
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      {props.actions && <div class="ls-view-actions">{props.actions}</div>}
    </header>
  );
}

export function SectionTitle(props: { title: string; description?: string; trailing?: ComponentChildren }) {
  return (
    <div class="ls-section-title">
      <div><h3>{props.title}</h3>{props.description && <p>{props.description}</p>}</div>
      {props.trailing && <div class="ls-section-trailing">{props.trailing}</div>}
    </div>
  );
}

export function EmptyState(props: { icon: IconName; title: string; description: string; action?: ComponentChildren }) {
  return (
    <div class="ls-empty">
      <div class="ls-empty-icon"><Icon name={props.icon} size={24} /></div>
      <strong>{props.title}</strong>
      <p>{props.description}</p>
      {props.action && <div class="ls-empty-action">{props.action}</div>}
    </div>
  );
}

export function InlineNotice({ tone = "accent", children }: { tone?: "accent" | "success" | "warning" | "danger"; children: ComponentChildren }) {
  return <div class="ls-notice" data-tone={tone} role="status"><Icon name={tone === "warning" || tone === "danger" ? "warning" : tone === "success" ? "success" : "info"} size={16} /><div>{children}</div></div>;
}

export function ProgressNotice({ client }: { client: LumiStageClient }) {
  const { notice, progress } = useClientState(client);
  if (!notice && !progress) return null;
  return (
    <div class="ls-global-notice" data-tone={notice?.tone ?? "info"} role="status">
      <div class="ls-global-notice-copy">{notice?.message ?? progress?.message}</div>
      {progress && progress.total > 0 && <div class="ls-progress"><span style={{ width: `${Math.min(100, progress.completed / progress.total * 100)}%` }} /></div>}
    </div>
  );
}

export function Segmented<T extends string>(props: { value: T; onChange: (value: T) => void; options: Array<{ value: T; label: string; icon?: IconName }>; label: string }) {
  return (
    <div class="ls-segmented" role="radiogroup" aria-label={props.label}>
      {props.options.map((option) => (
        <button type="button" role="radio" aria-checked={props.value === option.value} data-active={props.value === option.value} onClick={() => props.onChange(option.value)}>
          {option.icon && <Icon name={option.icon} size={14} />}<span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Toolbar({ children, class: className }: { children: ComponentChildren; class?: string }) {
  return <div class={`ls-toolbar ${className ?? ""}`}>{children}</div>;
}

export function SearchInput(props: { value: string; onInput: (value: string) => void; placeholder: string; label?: string }) {
  return (
    <label class="ls-search">
      <Icon name="search" size={16} />
      <input value={props.value} onInput={(event) => props.onInput(event.currentTarget.value)} placeholder={props.placeholder} aria-label={props.label ?? props.placeholder} />
      {props.value && <button type="button" onClick={() => props.onInput("")} aria-label="Clear search"><Icon name="close" size={14} /></button>}
    </label>
  );
}

export type StyleVars = JSX.CSSProperties;
