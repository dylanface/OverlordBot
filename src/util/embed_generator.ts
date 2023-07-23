import { EmbedBuilder } from "@discordjs/builders";

export const generateErrorEmbed = (error: Error) => {
  return (
    new EmbedBuilder()
      .setTitle("Error")
      .setDescription(error.message)
      // .setThumbnail(
      //   "https://cdn.discordapp.com/attachments/869137600567468044/1125615538660446238/error-7-64.png"
      // )
      .setColor(0xb90202)
  );
};

export const generateColoredEmbed = () => {
  return new EmbedBuilder().setColor(generateRandomColor() as any);
};

// Random color generator
// Generate a random hex color code for use in embeds in the 0x000000 format.
// Pass modifiers to change how the color is generated.
export const generateRandomColor = (options?: {
  rgb?: boolean;
  min?: number;
  max?: number;
  allowRed?: boolean;
}): number | number[] => {
  const rgb = options?.rgb ?? false;
  const min = options?.min ?? 0x000000;
  const max = options?.max ?? 0xffffff;
  const allowRed = options?.allowRed ?? false;

  let generatedRGB = generateRandomRGB({ allowRed });
  let generatedColor = rgbToHex(generatedRGB).replace("#", "0x");

  if (rgb) {
    return generatedRGB;
  }

  if (parseInt(generatedColor) < min || parseInt(generatedColor) > max) {
    return generateRandomColor({ rgb, min, max, allowRed });
  }

  return parseInt(generatedColor);
};

function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  const hex = ((r << 16) | (g << 8) | b).toString(16);
  return `#${hex.padStart(6, "0")}`;
}

function generateRandomRGB(options?: {
  allowRed?: boolean;
}): [number, number, number] {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);

  if (options?.allowRed) return [r, g, b];

  if (r / g >= 2 && r / b >= 2) {
    return generateRandomRGB();
  }

  return [r, g, b];
}
