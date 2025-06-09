import { themes } from ".";

export interface ITheme {
  [key: string]: string;
}

export interface IThemes {
  [key: string]: ITheme;
}

export interface IMappedTheme {
  [key: string]: string | null;
}

export const mapTheme = (variables: ITheme): IMappedTheme => {
  return {
    "--color-primary": variables.primary || "",
    "--color-secondary": variables.secondary || "",
    "--color-disabled": variables.disabled || "",
    "--color-hover-primary": variables.primaryHover || "",
    "--color-hover-secondary": variables.secondaryHover || "",
    "--color-white": variables.white || "",
    "--color-status-primary": variables.statusPrimary || "",
    "--color-status-secondary": variables.statusSecondary || "",
    "--color-status-ternary": variables.statusTernary || "",
    "--color-status-quaternary": variables.statusQuaternary || "",
    "--color-status-quinary": variables.statusQuinary || "",
    "--color-text-primary": variables.textPrimary || "",
    "--color-text-secondary": variables.textSecondary || "",
    "--background-card": variables.backgroundCard || "",
    "--background-primary": variables.backgroundPrimary || "",
    "--background-secondary": variables.backgroundSecondary || "",
    "--stroke": variables.stroke || "",
    "--radius-small": variables.radiusSmall || "",
    "--radius-medium": variables.radiusMedium || "",
  };
};

export const applyTheme = (theme: string): void => {
  const themeObject: IMappedTheme = mapTheme(themes[theme]);
  if (!themeObject) return;

  const root = document.documentElement;

  Object.keys(themeObject).forEach((property) => {
    if (property === "name") {
      return;
    }

    root.style.setProperty(property, themeObject[property]);
  });
};

export function extend(extending: ITheme, newTheme: ITheme): ITheme {
  return { ...extending, ...newTheme };
}
