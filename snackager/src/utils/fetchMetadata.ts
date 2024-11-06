import fetch from 'node-fetch';

import config from '../config';
import { RedisClient } from '../external/redis';
import logger from '../logger';
import { Metadata } from '../types';

type Options = {
  scope?: string | null;
  id: string;
  bypassCache?: boolean;
  redisClient?: RedisClient;
};


export default async function fetchMetadata(
  qualified: string,
  { scope, id, bypassCache, redisClient }: Options,
): Promise<Metadata> {
  let response;

  const logMetadata = {
    pkg: {
      name: qualified,
    },
  };

  // TODO: optimize when exact version is specified?
  try {
    const url = `${config.registry}/${
      scope ? `@${encodeURIComponent(`${scope}/`)}` : ''
    }${encodeURIComponent(id)}`;

    // Fetch the package metadata from the registry
    // logger.info({ ...logMetadata, qualified, url }, `fetching metadata`);
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
      },
      timeout: 10000,
    });

    if (response.status !== 200) {
      const error = new Error(response.statusText);
      if (response.status === 404) {
        error.name = 'NotFoundError';
      }
      throw error;
    }

    try {
      const json = await response.json();
      return json;
    } catch (e) {
      logger.error({ ...logMetadata, qualified, e }, `error in parsing: ${e.toString()}`);
      throw new Error(`Failed to parse the response for '${qualified}'`);
    }
  } catch (e) {
    logger.error({ ...logMetadata, qualified, e }, `error in fetching: ${e.toString()}`);
    throw new Error(
      e.name === 'NotFoundError'
        ? `Package '${qualified}' not found in the registry`
        : `Failed to fetch '${qualified}' from the registry`,
    );
  }
}
