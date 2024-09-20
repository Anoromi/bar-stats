import { isClient } from "@vueuse/core";

const colorKey = "color-theme";
export function useColor() {
  const state = useState(colorKey, () => "light");

  if (isClient) state.value = localStorage.getItem(colorKey) ?? "light";

  function updateState(value: string) {
    state.value = value;
    localStorage.setItem(colorKey, value);
  }

  return {
    color: computed({
      get: () => state.value,
      set: updateState,
    }),
  };
}
