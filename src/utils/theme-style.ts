/** Element Plus 主题色与色阶（参考 tnai-vue3-sky-command utils/theme.js） */

export function hexToRgb(str: string): number[] {
  const s = str.replace("#", "");
  const hexs = s.match(/../g);
  if (!hexs || hexs.length < 3) {
    return [0, 0, 0];
  }
  return hexs.slice(0, 3).map((h) => parseInt(h, 16));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const hexs = [r, g, b].map((n) => {
    const h = n.toString(16);
    return h.length === 1 ? `0${h}` : h;
  });
  return `#${hexs.join("")}`;
}

export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) {
    rgb[i] = Math.floor(rgb[i] * (1 - level));
  }
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

export function handleThemeStyle(theme: string): void {
  document.documentElement.style.setProperty("--el-color-primary", theme);
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(theme, i / 10),
    );
  }
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(theme, i / 10),
    );
  }
  document.documentElement.style.setProperty("--current-color", theme);
}
