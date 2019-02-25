
/* plugin config definition: used by mmir-plugin-exports to generate module-config.gen.js */

import { MediaManagerPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "asrGoogleXhr" in main configuration.json
 * for settings of webasrGoogleImpl module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the ASR functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface PluginConfig {
  asrGoogleXhr?: PluginConfigEntry;
}

export interface PluginConfigEntry extends MediaManagerPluginEntry {

  /** the plugin/module which which will load/use this specific ASR implementation
   * @default mmir-plugin-encoder-core.js
   */
  mod: 'mmir-plugin-encoder-core.js';

  /** OPTIONAL (see mmir-plugin-encoder-core)
   * @default "flac" */
  encoder?: 'flac'; // TODO (re-enable) 'wav'
  /** credentials application key (MUST be set via configuration or options) */
  appKey?: string;

  /** OPTIONAL number of n-best results that should (max.) be returned: integer, DEFAULT 1 */
  results?: number;

  //TODO?
  // /** OPTIONAL  set recognition mode */
  // mode?: 'search' | 'dictation';

  // /** (TODO?) NOT IMPLEMENTED / CONFIGURABLE (using const "https://www.google.com/speech-api/v2/recognize?client=chromium&output=json") */
  // baseUrl: string;

  /** OPTIONAL custom option: samplerate (Hz) for audio encoding, DEFAULT 44100 */
  sampleRate: number;
}

export enum RemoteUrls {
  baseUrl = 'https://www.google.com'
}
