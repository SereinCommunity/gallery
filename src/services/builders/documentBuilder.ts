import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import yaml from 'js-yaml';
import { join } from 'path';
import { PluginDetailedInfo } from '../../types/pluginDetailedInfo.ts';
import { Result } from '../../types/result.ts';
import logger from '../outputs/logger.ts';

export default {
  build,
};

const path = join('output', 'plugins');

function sort(
  plugins: [string, PluginDetailedInfo][]
): [string, PluginDetailedInfo][] {
  return plugins.sort((a, b) => {
    return new Date(a[1].repo.releases[0]?.publishedAt || a[1].repo.pushedAt) >
      new Date(b[1].repo.releases[0]?.publishedAt || b[1].repo.pushedAt)
      ? -1
      : 1;
  });
}

function build(result: Result) {
  const array = sort(Array.from(result.success.entries()));

  for (let i = 0; i < array.length; i++) {
    const [id, info] = array[i];
    const pluginPath = join('data', 'plugins', id);

    if (!existsSync(pluginPath)) {
      logger.error(`[${id}] 插件文件夹不存在`);
      continue;
    }

    mkdirSync(join(path, id), {
      recursive: true,
    });

    logger.info(`[${id}] 开始生成文档`);

    copyFiles(pluginPath, info, i);

    logger.info(`[${id}] 文件复制完成`);
  }
}

function copyFiles(
  pluginPath: string,
  pluginInfo: PluginDetailedInfo,
  index: number
) {
  let hasMarkdown = false;

  const frontmatter = yaml.dump({
    id: pluginInfo.id,
    title: pluginInfo.name,
    order: index + 1,
  });

  for (const file of readdirSync(pluginPath)) {
    if (
      ['index.md', 'readme.md'].includes(file.toLowerCase()) &&
      !hasMarkdown
    ) {
      const content = readFileSync(join(pluginPath, file), 'utf8').replace(
        /^# .+$/m,
        ''
      );

      writeFileSync(
        join(path, pluginInfo.id, 'index.md'),
        `---
${frontmatter}
---
` + content
      );
      hasMarkdown = true;
    } else if (file.endsWith('.md')) {
      continue;
    } else if (file !== 'plugin-index.json') {
      copyFileSync(join(pluginPath, file), join(path, pluginInfo.id, file));
    }
  }

  if (!hasMarkdown) {
    writeFileSync(
      join(path, pluginInfo.id, 'index.md'),
      `---
${frontmatter}
---

::: warning

此插件暂未提供文档介绍，请参照仓库的自述文件。

:::

`
    );
  }
}
