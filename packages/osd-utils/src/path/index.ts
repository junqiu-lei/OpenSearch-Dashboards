/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { join, normalize } from 'path';
import { accessSync, constants } from 'fs';
import { TypeOf, schema } from '@osd/config-schema';
import { REPO_ROOT } from '../repo_root';

const isString = (v: any): v is string => typeof v === 'string';

const CONFIG_PATHS = [
  process.env.OSD_PATH_CONF && join(process.env.OSD_PATH_CONF, 'opensearch_dashboards.yml'),
  process.env.OPENSEARCH_DASHBOARDS_PATH_CONF &&
    join(process.env.OPENSEARCH_DASHBOARDS_PATH_CONF, 'opensearch_dashboards.yml'),
  process.env.CONFIG_PATH, // deprecated
  join(REPO_ROOT, 'config/opensearch_dashboards.yml'),
].filter(isString);

const CONFIG_DIRECTORIES = [
  process.env.OSD_PATH_CONF,
  process.env.OPENSEARCH_DASHBOARDS_PATH_CONF,
  join(REPO_ROOT, 'config'),
  '/etc/opensearch-dashboards',
].filter(isString);

const DATA_PATHS = [
  process.env.DATA_PATH, // deprecated
  join(REPO_ROOT, 'data'),
  '/var/lib/opensearch-dashboards',
].filter(isString);

function findFile(paths: string[]) {
  const availablePath = paths.find((configPath) => {
    try {
      accessSync(configPath, constants.R_OK);
      return true;
    } catch (e) {
      // Check the next path
    }
  });
  return availablePath || paths[0];
}

/**
 * Get the path of opensearch_dashboards.yml
 * @internal
 */
export const getConfigPath = () => findFile(CONFIG_PATHS);

/**
 * Get the directory containing configuration files
 * @internal
 */
export const getConfigDirectory = () => findFile(CONFIG_DIRECTORIES);

/**
 * Get the directory containing runtime data
 * @internal
 */
export const getDataPath = () => findFile(DATA_PATHS);

export type PathConfigType = TypeOf<typeof config.schema>;

export const config = {
  path: 'path',
  schema: schema.object({
    data: schema.string({ defaultValue: () => getDataPath() }),
  }),
};

/**
 * Get a standardized reference to a path
 * @param {string} path - the path to standardize
 * @param {boolean} [usePosix=true] - produce a posix reference
 * @param {boolean} [escapedBackslashes=true] - on Windows, double-backslash the reference
 * @internal
 */
export const standardize = (
  path: string,
  usePosix: boolean = true,
  escapedBackslashes: boolean = true
) => {
  /* Force os-dependant separators
   * path.posix.normalize doesn't convert backslashes to slashes on Windows so we manually force it afterwards
   */
  const normal = normalize(path);

  // Filter out in-browser executions as well as non-windows ones
  if (process?.platform !== 'win32') return normal;

  if (usePosix) return normal.replace(/\\/g, '/');
  return escapedBackslashes ? normal.replace(/\\/g, '\\\\') : normal;
};
