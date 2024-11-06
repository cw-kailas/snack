import path from 'path';
import fetchAndExtract from './fetchAndExtract';
import findPath from './findPath';
import installPackage from './installPackage';
import packageBundle from './packageBundle';
import getCachePrefix from '../cache-busting';
import config from '../config';
import { Package } from '../types';

// TODO: find the typescript definitions for this package, `@types/sander` doesn't exists
const { mkdir, writeFile } = require('sander');

type Options = {
  pkg: Package;
  version: string;
  deep?: string | null;
  platforms: string[];
  rebuild: boolean;
  dependencies: { [key: string]: string | null };
  hash: string;
  latestHash?: string | null;
  versionSnackager: boolean;
  sdkVersion?: string;
};

type BundlePending = {
  name: string;
  version: string;
  pending: true;
};

type BundleResolved = {
  name: string;
  hash: string;
  handle: string;
  version: string;
  // TODO: fix possible `null` for dependency and replace this with `Package['dependencies']`
  dependencies: { [key: string]: string | null };
};

export type BundleResponse = BundlePending | BundleResolved;

export default async function fetchBundle({
  pkg,
  version,
  deep = null,
  platforms,
  dependencies, // peerDependencies
  hash,
  versionSnackager,
  sdkVersion,
}: Options): Promise<BundleResponse> {
  const fullName = `${pkg.name}${deep ? `/${deep}` : ''}`;
  const cachePrefix = getCachePrefix(fullName);
  const buildStatusRedisId =
    `snackager/buildStatus/${cachePrefix}/` +
    `${fullName}@${version}-${platforms.join(',')}`.replace(/\//g, '~');

  const handle = versionSnackager ? `snackager-${cachePrefix}/${hash}` : hash;
  const logMetadata = { pkg, redisId: buildStatusRedisId };

  const peerDependencies =
    fullName === pkg.name ? dependencies : { ...dependencies, [pkg.name]: version };

  const unavailable: string[] = [];

  if (!unavailable.length) {
    return {
      name: fullName,
      hash,
      handle,
      version: pkg.version,
      dependencies: peerDependencies,
    };
  }


  const dir = `${config.tmpdir}/${buildStatusRedisId}`;
  await mkdir(dir);

  try {
    await fetchAndExtract(pkg, version, dir);

    const cwd = `${dir}/${findPath(pkg.name, dir)}`;
    console.log(logMetadata, `installing package at ${cwd}`);
    await installPackage(cwd);

    const files = await packageBundle({
      pkg,
      cwd,
      deep,
      externalDependencies: peerDependencies,
      base: `${config.cloudfront.url}/${encodeURIComponent(handle)}`,
      platforms: unavailable,
      sdkVersion,
    });


    await Promise.all(
      Object.keys(files).map(async (platform) => {
        const dir = path.join(config.tmpdir, 'output', `${handle}-${platform}`);

        await Promise.all(
          Object.keys(files[platform]).map(async (file) => {
            const filename = path.join(dir, file);

            await mkdir(path.dirname(filename));
            await writeFile(filename, files[platform][file]);
          }),
        );

        await writeFile(path.join(dir, '.done'), '');
      }),
    );


  } catch (error) {
    console.log("error -->", error);

  }

  return {
    name: fullName,
    version: pkg.version,
    pending: true,
  };
}
