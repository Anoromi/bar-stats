import { registerTheme } from "echarts";

export default function () {

  const {color} = useColor();
  return {
    theme: computed(() => {
      switch(color.value) {
        case "light":
          return "default-light"
        case "dark":
          return "default-dark"
      }
    })
  }
}
