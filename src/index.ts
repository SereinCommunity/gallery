import * as core from '@actions/core';
import { program } from 'commander';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import documentBuilder from './services/builders/documentBuilder.ts';
import indexBuilder from './services/builders/indexBuilder.ts';
import logger from './services/outputs/logger.ts';
import { reportApiUsage, reportCheck } from './services/outputs/reporter.ts';
import pluginsManager from './services/pluginsManager.ts';
import pathConstants from './utils/pathConstants.ts';

if (existsSync(pathConstants.output)) {
  rmSync(pathConstants.output, { recursive: true, force: true });
}

const path = join('data', 'plugins');

if (!existsSync(path)) {
  throw '目录不存在';
}

program.action(buildAll);
program.command('check [id]').action(check);
program.parse();

async function check(id?: string) {
  if (id) {
    try {
      await pluginsManager.checkSingle(path, id);
      logger.info(`[${id}] 检查成功`);
    } catch (error) {
      logger.error(`[${id}] 检查失败：${error}`);
      core.setFailed(`[${id}] 检查失败`);
    }

    return;
  }

  const result = await pluginsManager.check(path);

  const count = result.failed.size;
  if (count > 0) {
    core.setFailed(
      `${count}个插件检查失败：${Array.from(result.failed.keys()).join(', ')}`
    );
  }

  reportCheck(result);
  await reportApiUsage();
}

async function buildAll() {
  const result = await pluginsManager.check(path);

  indexBuilder.build(result);
  documentBuilder.build(result);

  await reportApiUsage();
}
