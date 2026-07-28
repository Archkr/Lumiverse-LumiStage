// @vitest-environment happy-dom

import { fireEvent, render, waitFor } from "@testing-library/preact";
import type { SpindleModelComboboxOptions } from "lumiverse-spindle-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HostModelPicker } from "../src/ui/host-controls";

afterEach(() => {
  document.body.replaceChildren();
});

describe("native host controls", () => {
  it("reconciles the model picker from its handle when a host interaction misses onChange", async () => {
    let handleValue = "model-old";
    let mountedOnChange: SpindleModelComboboxOptions["onChange"];
    const update = vi.fn((patch: SpindleModelComboboxOptions) => {
      if (typeof patch.value === "string") handleValue = patch.value;
    });
    const destroy = vi.fn();
    const mountModelCombobox = vi.fn((target: Element, options: SpindleModelComboboxOptions) => {
      mountedOnChange = options.onChange;
      const input = document.createElement("input");
      input.setAttribute("data-testid", "native-model-input");
      target.append(input);
      return {
        componentId: "model-picker",
        element: target,
        update,
        destroy,
        getValue: () => handleValue,
        refresh: vi.fn(),
      };
    });
    const client = {
      ctx: { components: { mountModelCombobox } },
    } as never;
    const onChange = vi.fn();
    const view = render(
      <HostModelPicker
        client={client}
        value="model-old"
        connectionId="connection-a"
        onChange={onChange}
      />,
    );

    await waitFor(() => expect(mountModelCombobox).toHaveBeenCalledOnce());
    handleValue = "model-new";
    fireEvent.input(view.getByTestId("native-model-input"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("model-new"));

    view.rerender(
      <HostModelPicker
        client={client}
        value="model-new"
        connectionId="connection-a"
        onChange={onChange}
      />,
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ value: "model-new" }));

    mountedOnChange?.("model-selected");
    expect(onChange).toHaveBeenCalledWith("model-selected");
    view.unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
