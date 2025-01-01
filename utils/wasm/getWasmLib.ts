import wasmUrl from "~/rstar/pkg/bar_stats_wasm_bg.wasm?url";

let lib: typeof import("~/rstar/pkg/bar_stats_wasm") | null = null;

export async function getWasmLib() {
  if (lib != null) return lib;
  const wasmLib = await import("~/rstar/pkg/bar_stats_wasm");
  const wasmModule = await WebAssembly.compileStreaming(fetch(wasmUrl));
  // await import("~/rstar/pkg/bar_stats_wasm_bg");

  wasmLib.initSync({
    module: wasmModule,
  });
  lib = wasmLib;
  return lib;
}
