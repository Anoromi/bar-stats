import { type VariantProps, cva } from "class-variance-authority";
export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,_border-color,_shadow] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-foreground-variant/50 bg-transparent shadow-sm hover:bg-emphasis hover:text-emphasis-foreground active:bg-emphasis/50 active:text-emphasis-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-primary/[0.08]",
        link: "text-primary underline-offset-4 hover:underline",
        elevated:
          "bg-foreground/5 bg-transparent shadow-sm dark:bg-surface-high dark:hover:bg-emphasis dark:active:bg-emphasis/50 hover:bg-emphasis hover:text-emphasis-foreground hover:shadow-none active:bg-emphasis/50 active:text-foreground active:shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded px-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        custom: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
