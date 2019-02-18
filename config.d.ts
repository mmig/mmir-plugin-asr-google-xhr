
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
export interface ASRGoogleXHRConfigEntry {
  asrGoogleXhr?: ASRGoogleXHRConfig;
}

export interface ASRGoogleXHRConfig extends MediaManagerPluginEntry {
  /** OPTIONAL
   * @default "flac" (see mmir-plugin-encoder-core) */
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
