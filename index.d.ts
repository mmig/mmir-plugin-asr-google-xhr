
export * from './config';

/// <reference types="mmir-lib" />
import { ASROnStatus, ASROnError, ASRMode } from 'mmir-lib';
import { PluginMediaManager as MediaManagerWebInput, ASREncoderOptions } from 'mmir-plugin-encoder-core';

declare interface PluginASROptions extends ASREncoderOptions {
  /**
   * [supported option]
   * set language/country for ASR
   */
  language?: string;

  /**
   * [supported option]
   * number of n-best results that should (max.) be returned
   * @type integer
   * @default 1
   */
  results?: number;

  //TODO?
  // /**
  //  * [supported option]
  //  * set recognition mode
  //  */
  // mode?: ASRMode;

  /**
   * custom option: credentials app-key (must be set via configuration or via options)
   */
  appKey?: string;
  // codec: 'flac' | 'wav' NOT SUPPORTED via options

  /**
   * [custom option]
   * samplerate (Hz) for audio encoding (should match the microphone's/recording sampling rate)
   * @type integer
   * @default 44100
   */
  sampleRate?: number;
}

declare interface PluginMediaManager extends MediaManagerWebInput {
  recognize: (options?: PluginASROptions, statusCallback?: ASROnStatus, failureCallback?: ASROnError, isIntermediateResults?: boolean) => void;
  startRecord: (options?: PluginASROptions, successCallback?: ASROnStatus, failureCallback?: ASROnError, intermediateResults?: boolean) => void;
  stopRecord: (options?: PluginASROptions, successCallback?: ASROnStatus, failureCallback?: ASROnError) => void;
}
