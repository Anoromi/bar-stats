import { registerTheme } from "echarts";

export default defineNuxtPlugin(async () => {
  const [lightTheme, darkTheme] = await Promise.all([
    $fetch("/themes/echart-light.json"),
    $fetch("/themes/echart-dark.json"),
  ]);

  registerTheme("default-light", lightTheme as Record<string, string>);
  registerTheme("default-dark", darkTheme as Record<string, string>);
});
