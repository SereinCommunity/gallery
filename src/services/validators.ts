import { PluginIndex } from '../types/pluginIndex.ts';
import { PluginInfo } from '../types/pluginInfo.ts';
import { getOrFetchRepo } from './network/caches.ts';
import logger from './outputs/logger.ts';

export function validatePluginInfo(
  id: string,
  pluginInfo: PluginInfo
): Required<PluginInfo> {
  if (!pluginInfo.id) {
    throw '缺少`id`字段';
  }

  if (id !== pluginInfo.id) {
    throw 'id字段与文件夹名称不一致';
  }

  if (!/^[a-zA-Z][a-zA-Z0-9\\-]{4,25}$/.test(pluginInfo.id)) {
    throw '`id`字段格式不正确';
  }

  if (!pluginInfo.name) {
    throw '缺少`name`字段';
  }

  if (!pluginInfo.version) {
    throw '缺少`version`字段';
  }

  if (!pluginInfo.type) {
    throw '缺少`type`字段';
  }

  if (!['js', 'net'].includes(pluginInfo.type)) {
    throw '`type`字段格式不正确';
  }

  if (pluginInfo.dependencies) {
    for (const dep of pluginInfo.dependencies) {
      if (!dep.id) {
        throw '缺少`dependencies.id`字段';
      }

      if (!dep.version) {
        throw '缺少`dependencies.version`字段';
      }
    }
  }

  if (pluginInfo.authors) {
    if (pluginInfo.authors.some((author) => !author.name)) {
      throw '缺少`authors.name`字段';
    }
  } else {
    logger.warn(`[${pluginInfo.id}] 缺少\`authors\`字段`);
  }

  if (
    pluginInfo.tags &&
    pluginInfo.tags.some(
      (v) =>
        ![
          'entertainment',
          'development',
          'tool',
          'information',
          'management',
          'api',
        ].includes(v)
    )
  ) {
    throw '`tags`值不正确';
  } else if (pluginInfo.tags?.length == 0) {
    logger.warn(`[${pluginInfo.id}] 缺少\`tags\`字段`);
  }

  if (pluginInfo.targets) {
    const versions = [
      '1.3.0',
      '1.3.1',
      '1.3.2',
      '1.3.3',
      '1.3.4',
      '1.3.5',
      '2.0.0',
      '2.0.1',
      '2.1.0',
    ];
    if (pluginInfo.targets?.min && !versions.includes(pluginInfo.targets.min)) {
      throw '`targets.min`字段格式不正确';
    }
    if (pluginInfo.targets?.max && !versions.includes(pluginInfo.targets.max)) {
      throw '`targets.max`字段格式不正确';
    }
  } else {
    logger.warn(`[${pluginInfo.id}] 缺少\`targets\`字段`);
  }

  return {
    id: pluginInfo.id,
    name: pluginInfo.name,
    version: pluginInfo.version,
    description: pluginInfo.description || '',
    tags: pluginInfo.tags || [],
    dependencies: pluginInfo.dependencies || [],
    authors: pluginInfo.authors
      ? pluginInfo.authors.map((author) => ({
          name: author.name,
          description: author.description || '',
        }))
      : [],
    type: pluginInfo.type,
    entryFile: pluginInfo.entryFile || '',
    targets: {
      min: pluginInfo.targets?.min || null,
      max: pluginInfo.targets?.max || null,
    },
  };
}

export async function validatePluginIndex(
  pluginIndex: PluginIndex
): Promise<Required<PluginIndex>> {
  if (!pluginIndex.owner) {
    throw '缺少`owner`字段';
  }

  if (!pluginIndex.repo) {
    throw '缺少`repoName`字段';
  }

  return {
    owner: pluginIndex.owner,
    repo: pluginIndex.repo,
    path: pluginIndex.path || '',
    branch:
      pluginIndex.branch ||
      (await getDefaultBranch(pluginIndex.owner, pluginIndex.repo)),
  };
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  return (await getOrFetchRepo(owner, repo)).default_branch;
}
