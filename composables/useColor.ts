import { isClient } from "@vueuse/core";

type ColorThemeOptions = "light" | "dark"
const colorKey = "color-theme";
export function useColor() {
  const state = useState(colorKey, () => "light" as ColorThemeOptions);

  if (isClient) state.value = localStorage.getItem(colorKey) as ColorThemeOptions ?? "light";

  function updateState(value: ColorThemeOptions) {
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
