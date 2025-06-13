import { config } from 'dotenv';
import { Octokit } from 'octokit';
import logger from '../outputs/logger.ts';

config();

export const octokit = new Octokit({
  userAgent: 'gallery-builder',
  auth: process.env.TOKEN,
  log: logger,
});
