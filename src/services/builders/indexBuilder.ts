import github from '@actions/github';
import { Context } from '@actions/github/lib/context.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PluginDetailedInfo } from '../../types/pluginDetailedInfo.ts';
import { Result } from '../../types/result.ts';
import logger from '../outputs/logger.ts';

const path = join('output', 'public', 'indexes', 'plugins');

function sort(
  plugins: [string, PluginDetailedInfo][]
): [string, PluginDetailedInfo][] {
  return plugins.sort((a, b) => {
    const nameA = a[1].name.toLowerCase();
    const nameB = b[1].name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

function build(result: Result) {
  const plugins: { [key: string]: PluginDetailedInfo } = {};
  const authors: {
    [key: string]: {
      description: string | null;
      plugins: string[];
    };
  } = {};
  const tags: { [key: string]: string[] } = {
    entertainment: [],
    development: [],
    tool: [],
    information: [],
    management: [],
    api: [],
  };

  logger.info('开始生成索引文件');

  for (const [id, plugin] of sort(Array.from(result.success.entries()))) {
    plugins[id] = plugin;

    for (const tag of plugin.tags) {
      tags[tag].push(id);
    }

    for (const author of plugin.authors) {
      if (!authors[author.name]) {
        authors[author.name] = {
          description: author.description || null,
          plugins: [],
        };
      }

      authors[author.name].plugins.push(id);
    }
  }

  mkdirSync(path, {
    recursive: true,
  });

  logger.info('开始写入各插件信息文件');
  for (const key in plugins) {
    writeFileSync(join(path, `${key}.json`), JSON.stringify(plugins[key]));
  }

  logger.info('开始写入统计信息文件');
  writeFileSync(
    join(path, '@tags.json'),
    JSON.stringify({ data: tags, time: new Date().toISOString() })
  );

  writeFileSync(
    join(path, '@authors.json'),
    JSON.stringify({ data: authors, time: new Date().toISOString() })
  );

  writeFileSync(
    join(path, '@all.json'),
    JSON.stringify({ data: plugins, time: new Date().toISOString() })
  );

  const context: Partial<Context> = { ...github.context };
  context.apiUrl = undefined;
  context.graphqlUrl = undefined;
  context.serverUrl = undefined;

  writeFileSync(
    join(path, '@meta.json'),
    JSON.stringify({
      data: {
        context,
        node: process.version,
        arch: process.arch,
        platform: process.platform,
      },
      time: new Date().toISOString(),
    })
  );
}

export default {
  build,
};
