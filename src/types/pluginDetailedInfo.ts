import { PluginInfo } from './pluginInfo.ts';

export type PluginDetailedInfo = {
  repo: {
    owner: string;
    repo: string;
    branch: string;
    url: string;
    stars: number;
    forks: number;
    issues: number;
    createAt: string;
    pushedAt: string;
    language: string | null;
    size: number;
    updatedAt: string;
    archived: boolean;
    license: string | null;
    downloads: number;
    releases: {
      [tagName: string]: {
        url: string;
        body: string;
        downloads: number;
        publishedAt: string;
        assets: {
          name: string;
          size: number;
          downloads: number;
          url: string;
        }[];
      };
    };
  };
} & Required<PluginInfo>;
