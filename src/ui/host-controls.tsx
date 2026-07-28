import type {
  SpindleBadgeColor,
  SpindleModelComboboxHandle,
  SpindleNumberStepperHandle,
  SpindlePaginationHandle,
  SpindleRangeSliderHandle,
  SpindleSelectHandle,
  SpindleSelectOption,
  SpindleSwitchHandle,
} from "lumiverse-spindle-types";
import { useEffect, useRef } from "preact/hooks";
import type { LumiStageClient } from "./client";

let mountedPortalSelects = 0;

function retainPortalGuard(): () => void {
  mountedPortalSelects += 1;
  document.body.classList.add("ls-host-select-portals");
  return () => {
    mountedPortalSelects = Math.max(0, mountedPortalSelects - 1);
    if (mountedPortalSelects === 0) document.body.classList.remove("ls-host-select-portals");
  };
}

export function HostSwitch(props: {
  client: LumiStageClient;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindleSwitchHandle | null>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountSwitch(root.current, {
      checked: props.checked,
      size: "sm",
      disabled: props.disabled,
      ariaLabel: props.label,
      onChange: (value) => latest.current.onChange(value),
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  useEffect(() => {
    handle.current?.update({
      checked: props.checked,
      disabled: props.disabled,
      ariaLabel: props.label,
    });
  }, [props.checked, props.disabled, props.label]);
  return <div class="ls-native-control ls-native-switch" ref={root} />;
}

export function HostSelect(props: {
  client: LumiStageClient;
  value: string;
  options: SpindleSelectOption[];
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  clearable?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindleSelectHandle | null>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    if (!root.current) return;
    const releasePortalGuard = retainPortalGuard();
    handle.current = props.client.ctx.components.mountSelect(root.current, {
      value: props.value,
      options: props.options,
      placeholder: props.placeholder,
      clearable: props.clearable,
      clearLabel: props.clearLabel,
      disabled: props.disabled,
      ariaLabel: props.label,
      searchThreshold: 7,
      portal: true,
      className: props.compact ? "ls-host-select-compact" : "ls-host-select",
      onChange: (value) => latest.current.onChange(value),
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
      releasePortalGuard();
    };
  }, [props.client]);
  useEffect(() => {
    handle.current?.update({
      value: props.value,
      options: props.options,
      placeholder: props.placeholder,
      clearable: props.clearable,
      clearLabel: props.clearLabel,
      disabled: props.disabled,
      ariaLabel: props.label,
    });
  }, [
    props.value,
    props.options,
    props.placeholder,
    props.clearable,
    props.clearLabel,
    props.disabled,
    props.label,
  ]);
  return <div class="ls-native-control" ref={root} />;
}

export function HostModelPicker(props: {
  client: LumiStageClient;
  value: string;
  connectionId: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindleModelComboboxHandle | null>(null);
  const latest = useRef(props);
  const lastForwarded = useRef(props.value);
  latest.current = props;
  const forwardValue = (value: string) => {
    if (value === lastForwarded.current) return;
    lastForwarded.current = value;
    latest.current.onChange(value);
  };
  useEffect(() => {
    if (!root.current) return;
    const target = root.current;
    let syncTimer: number | null = null;
    const syncFromHandle = () => {
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        syncTimer = null;
        const value = handle.current?.getValue();
        if (typeof value === "string") forwardValue(value);
      }, 0);
    };
    handle.current = props.client.ctx.components.mountModelCombobox(root.current, {
      value: props.value,
      connection: props.connectionId
        ? { kind: "llm", id: props.connectionId }
        : { kind: "llm" },
      appearance: "standard",
      placeholder: "Use connection default",
      emptyMessage: "No models returned by this connection.",
      browseHint: "Search the selected connection's model catalog",
      disabled: props.disabled,
      onChange: forwardValue,
    });
    target.addEventListener("input", syncFromHandle);
    target.addEventListener("change", syncFromHandle);
    target.addEventListener("click", syncFromHandle);
    return () => {
      if (syncTimer !== null) window.clearTimeout(syncTimer);
      target.removeEventListener("input", syncFromHandle);
      target.removeEventListener("change", syncFromHandle);
      target.removeEventListener("click", syncFromHandle);
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client, props.connectionId]);
  useEffect(() => {
    lastForwarded.current = props.value;
    handle.current?.update({ value: props.value, disabled: props.disabled });
  }, [props.value, props.disabled]);
  return <div class="ls-native-control" ref={root} />;
}

export function HostNumber(props: {
  client: LumiStageClient;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindleNumberStepperHandle | null>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountNumberStepper(root.current, {
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step ?? 1,
      integer: Number.isInteger(props.step ?? 1),
      onChange: (value) => {
        if (value !== null) latest.current.onChange(value);
      },
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  useEffect(() => {
    handle.current?.update({
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step ?? 1,
    });
  }, [props.value, props.min, props.max, props.step]);
  return <div class="ls-native-control" ref={root} />;
}

export function HostRange(props: {
  client: LumiStageClient;
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  hint?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindleRangeSliderHandle | null>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountRangeSlider(root.current, {
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step,
      label: props.label,
      hint: props.hint,
      format: props.suffix ? { suffix: props.suffix } : undefined,
      onCommit: (value) => latest.current.onChange(value),
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  useEffect(() => {
    handle.current?.update({
      value: props.value,
      min: props.min,
      max: props.max,
      step: props.step,
      label: props.label,
      hint: props.hint,
      format: props.suffix ? { suffix: props.suffix } : undefined,
    });
  }, [props.value, props.min, props.max, props.step, props.label, props.hint, props.suffix]);
  return <div class="ls-native-control" ref={root} />;
}

export function HostPagination(props: {
  client: LumiStageClient;
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPage: (page: number) => void;
  onPerPage: (value: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SpindlePaginationHandle | null>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    if (!root.current) return;
    handle.current = props.client.ctx.components.mountPagination(root.current, {
      currentPage: props.page,
      totalPages: props.pages,
      totalItems: props.total,
      perPage: props.perPage,
      perPageOptions: [24, 48, 96],
      onPageChange: (page) => latest.current.onPage(page),
      onPerPageChange: (value) => latest.current.onPerPage(value),
    });
    return () => {
      handle.current?.destroy();
      handle.current = null;
    };
  }, [props.client]);
  useEffect(() => {
    handle.current?.update({
      currentPage: props.page,
      totalPages: props.pages,
      totalItems: props.total,
      perPage: props.perPage,
    });
  }, [props.page, props.pages, props.total, props.perPage]);
  return <div class="ls-native-control ls-native-pagination" ref={root} />;
}

export function HostBadge(props: {
  client: LumiStageClient;
  text: string;
  color?: SpindleBadgeColor;
}) {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const handle = props.client.ctx.components.mountBadge(root.current, {
      text: props.text,
      color: props.color ?? "neutral",
      size: "pill",
    });
    return () => handle.destroy();
  }, [props.client, props.text, props.color]);
  return <span class="ls-native-badge" ref={root} />;
}
