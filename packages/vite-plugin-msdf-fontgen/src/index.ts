import fs from 'node:fs';
import path from 'node:path';
import { genFont, setGeneratePaths } from '@lightningjs/msdf-generator';
import { adjustFont } from '@lightningjs/msdf-generator/adjustFont';
import { globSync } from 'glob';
import type { PluginOption } from 'vite';

interface OverrideOption {
  fontSize?: number;
  distanceRange?: number;
}

interface Override {
  [fontName: string]: {
    msdf?: OverrideOption;
    ssdf?: OverrideOption;
  };
}

interface Options {
  /**
   * Path to the input directory containing the font files. Fonts found in
   * subdirectories will keep their folder structure in the output directory.
   */
  inputDir: string | string[];
  /**
   * Path to the output directory. All fonts awill be placed into this directory,
   * even if multiple directories are specified as inputs. Subdirectories will
   * be retained from the input. If you want to output to multiple directories,
   * you can use a second plugin instance with a different output directory.
   */
  outDir: string;
  /**
   * Type of font to generate. Defaults to ['msdf']
   */
  types?: ('msdf' | 'ssdf')[];
  /**
   * Font extensions to include. If multiple font files with the same name but
   * with different extensions are found, it will use the first one it finds
   * based on the order of this array. Defaults to ttf, otf, woff, and woff2
   */
  extensions?: string[];
  /**
   * Force regeneration of fonts even if they already exist
   */
  force?: boolean;
  /**
   * Charset to include in the generated font. If there is a charset.txt file in
   * the input directory, that will be used instead. Defaults to
   * '!\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~’“”'
   */
  charset?: string;

  /**
   * Overrides for font generation. This allows you to specify custom font sizes
   * and distance ranges for specific fonts. The key is the font name. If an
   * override.txt file is present in the input directory, that will be used instead.
   */
  overrides?: Override;
}

export default function msdfFontGen({
  inputDir,
  outDir,
  force,
  types = ['msdf'],
  extensions = ['ttf', 'otf', 'woff', 'woff2'],
  charset = '!\\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~’“”',
  overrides,
}: Options): PluginOption {
  return {
    name: 'msdf-fontgen',

    async buildStart() {
      console.log('Building fonts...');

      const cleanup: string[] = [];

      if (types.length === 0) {
        console.log('No font types specified');
        return;
      }

      console.log('Looking for fonts...');

      if (!Array.isArray(inputDir)) {
        inputDir = [inputDir];
      }

      const fontFolders = getFolders(inputDir, outDir, extensions);
      console.log(fontFolders);
      for (const { input, output, files } of fontFolders) {
        console.log(`Generating fonts in folder ${input}...`);

        setGeneratePaths(input, output);

        const charsetPath = `${input}/charset.txt`;
        if (!fs.existsSync(charsetPath) && charset) {
          fs.writeFileSync(charsetPath, charset);
          cleanup.push(charsetPath);
        }

        const overridePath = `${input}/overrides.txt`;
        if (!fs.existsSync(overridePath) && overrides) {
          fs.writeFileSync(overridePath, JSON.stringify(overrides, null, 2));
          cleanup.push(overridePath);
        }

        for (const file of files) {
          for (const type of new Set(types)) {
            await generateFont(output, file, type, force);
          }
        }
      }

      console.log('Cleaning up...');
      for (const file of cleanup) {
        fs.unlinkSync(file);
      }
    },
  };
}

async function generateFont(
  outDir: string,
  file: string,
  type: 'msdf' | 'ssdf',
  force?: boolean,
) {
  const ext = file.split('.').pop();

  if (!ext) {
    throw new Error(`Invalid file: ${file}`);
  }

  const outputFile = path.join(outDir, file.replace(ext, `${type}.png`));

  if (!force && fs.existsSync(outputFile)) {
    console.log(`[Font Generation] File exists. Skipping ${file} (${type})`);
    return;
  }

  const font = await genFont(file, type);

  if (font) {
    await adjustFont(font);
  }
}

function getFolders(inputDir: string[], outDir: string, extensions: string[]) {
  const extensionGlob =
    extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0];
  return Object.values(
    inputDir.reduce<
      Record<
        string,
        {
          input: string;
          output: string;
          fontNames: Set<string>;
          files: string[];
        }
      >
    >((acc, input) => {
      const files = globSync(`${input}/**/*.${extensionGlob}`);

      // Sort files by extension so it follows the order of the extensions option
      for (const file of files.sort(sortByExtension(extensions))) {
        const baseFolder = path.dirname(file);

        if (!acc[baseFolder]) {
          acc[baseFolder] = {
            input: baseFolder,
            output: path.join(outDir, path.relative(input, baseFolder)),
            fontNames: new Set(),
            files: [],
          };
        }

        const fontName = path.basename(file, path.extname(file));

        // Don't add the same font twice
        if (!acc[baseFolder].fontNames.has(fontName)) {
          acc[baseFolder].files.push(path.relative(baseFolder, file));
          acc[baseFolder].fontNames.add(fontName);
        }
      }

      return acc;
    }, {}),
  );
}

function sortByExtension(extensions: string[]) {
  return (a: string, b: string) => {
    const extA = a.split('.').pop() as string;
    const extB = b.split('.').pop() as string;
    return extensions.indexOf(extA) - extensions.indexOf(extB);
  };
}
