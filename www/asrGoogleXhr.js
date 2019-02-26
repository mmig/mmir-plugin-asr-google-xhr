
/**
 * Media Module: Implementation for Speech Recognition via the Google Web Speech Recognition service v2 via HTTPS/POST
 *
 * @requires FLAC encoder (workers/flacEncoder.js)
 * @requires Cross-Domain access
 * @requires CSP for accessing the Google speech-api server, e.g. "connect-src https://www.google.com" or "default-src connect-src https://www.google.com"
 *
 */


define(['mmirf/mediaManager', 'mmirf/configurationManager', 'mmirf/languageManager', 'mmirf/util/loadFile'], function(mediaManager, config, lang, ajax){

	/**  @memberOf GoogleWebAudioInputImpl# */
	var MODE = 'google';

	/**  @memberOf GoogleWebAudioInputImpl# */
	var _pluginName = 'asrGoogleXhr';

	/** @memberOf GoogleWebAudioInputImpl# */
	var result_types = {
			"FINAL": 				"FINAL",
			"INTERIM": 				"INTERIM",
			"INTERMEDIATE":			"INTERMEDIATE",
			"RECOGNITION_ERROR": 	"RECOGNITION_ERROR",
			"RECORDING_BEGIN": 		"RECORDING_BEGIN",
			"RECORDING_DONE": 		"RECORDING_DONE"
	};

	/** @memberOf GoogleWebAudioInputImpl# */
	var lastBlob = false;
	/**
	 * HELPER retrieve language setting and apply impl. specific corrections/adjustments
	 * (i.e. deal with Nuance specific quirks for language/country codes)
	 *
	 * @memberOf GoogleWebAudioInputImpl#
	 */
	var getFixedLang = function(options){

		var locale = options && options.language? options.language : lang.getLanguageConfig(_pluginName, 'long');

		return lang.fixLang('google', locale);
	};

	/**
	 * Recognition options for current recognition process.
	 *
	 * @memberOf GoogleWebAudioInputImpl#
	 * @see mmir.MediaManager#recognize
	 */
	var currentOptions;

	/**
	 * @returns {Error} an error description, that is a PlainObject with properties
	 * 					message: STRING
	 * 					status: NUMBER
	 * @memberOf GoogleWebAudioInputImpl#
	 */
	var asrErrorWrapper = function(ajax,response,blobsize){

		var status = (ajax.status).toString(), msg;

		switch (status) {

		//TODO procecess specific errors
		//2xx "Success"
		//4xx Client Error
		//5xx Server Error

		default:
			msg = 'Error ' + status + ': ' + ajax.responseText;
		break;
		}

		console.error('Error response from server (status '+status+'): '+msg);

		return {
			status: status,
			message: msg
		};
	};

	/** @memberOf GoogleWebAudioInputImpl# */
	var doSend = function(msg, successCallback, errorCallback){


		function ajaxSuccess (data, textStatus, jqXHR) {

			if (jqXHR.status == 200) {

				//result format example for JSON:
				//
				//{"result":[]}
				//{"result":[{"alternative":[{"transcript":"this is a test","confidence":0.95095706},{"transcript":"this is the test"},{"transcript":"this is the best"},{"transcript":"this is a text"},{"transcript":"this is the tests"}],"final":true}],"result_index":0}
				//
				var respText = jqXHR.responseText;

				//QUICK-FIX: several results may get sent within one response, separated by a NEWLINE
				var list = respText.split(/\r?\n/gm);

				var result = '', score, alt, data, text, num;
				var type = lastBlob? result_types.FINAL : result_types.INTERMEDIATE;
				for(var i=0,size=list.length; i < size; ++i){

					if(!list[i]){
						continue;
					}

					try{

						//format:
						//	{
						//		"result" : [{
						//				"alternative" : [{
						//						"transcript" : "this is a test",
						//						"confidence" : 0.95095706
						//					}, {
						//						"transcript" : "this is the test"
						//					}, {
						//						"transcript" : "this is the best"
						//					}, {
						//						"transcript" : "this is a text"
						//					}, {
						//						"transcript" : "this is the tests"
						//					}
						//				],
						//				"final" : true
						//			}
						//		],
						//		"result_index" : 0
						//	}
						data = JSON.parse(list[i]);
						if(typeof data.result_index === 'undefined'){
							continue;
						}

						data = data.result[data.result_index];
//						type = data['final'] === true? 'FINAL' : 'INTERMEDIATE'; TODO

						data = data.alternative;

						for(var j=0,len=data.length; j < len; ++j){

							if(!data[j] || !data[j].transcript){
								continue;
							}

							text = data[j].transcript;
							num = data[j].confidence;

							if(!result){
								result = text;
								score = num;
							} else {

								if(!alt){
									alt = [];
								}

								alt.push({text: text, score: num});
							}
						}

					} catch(err){
						console.error('Error processing ASR result at '+i+' -> "'+list[i]+'": ' + err, err);
					}
				}

				//[asr_result, asr_score, asr_type, asr_alternatives, asr_unstable]
				//[ text, number, STRING (enum/CONST), Array<(text, number)>, text ]
				//                ["FINAL" | "INTERIM"...]
				if(successCallback){
					successCallback(result, score, type, alt);
				}

			} else {
				var err = asrErrorWrapper(jqXHR, this, dataSize);
				errorCallback && errorCallback(err.message, err.status);
				//TODO invoke error-callback for some of the error-codes (?)
			}
		};//END: ajaxSuccess

		function ajaxFail(jqXHR, textStatus, errorThrown) {
			var err = asrErrorWrapper(jqXHR, this, dataSize);
			errorCallback && errorCallback(err.message, err.status);
		}

		var data = msg.buf;//is a Blob
		var dataSize = data.size;
		var sample_rate = currentOptions.sampleRate || 44100;

//		console.log("Ajax-Data: ", data);

		var apiLang = getFixedLang(currentOptions);

		var key = currentOptions.appKey || config.getString( [_pluginName, "appKey"] );
		var baseUrl = "https://www.google.com/speech-api/v2/recognize?client=chromium&output=json";

		var url = baseUrl + '&key=' + key + '&lang=' + apiLang;

		var alternatives = 1;
		var results = currentOptions.results || config.getString( [_pluginName, "results"] );
		if(results){
			var num = parseInt(results, 10);
			if(isFinite(num) && num > 0){
				alternatives = results;
			}
		}
		url += '&maxAlternatives='+alternatives;

		var headers = {
			'Content-Type': 'audio/x-flac; rate=' + sample_rate +';',
			'Accept': 'text/plain',			//TODO TEST -> NOTE cannot use jQuery option dataType='text', since jQuery automatically adds some Accept-entries which will result in an error-response
		};

		//TODO support more options / custom options
		var options = {
			url: url,
			type: 'POST',
			headers: headers,
			processData: false,					//prevent jQuery from trying to process the (binary) data
			data: data,
			mmirSendType: 'binary',				//add custom "marker" to signify that we are sending binary data

			success: ajaxSuccess,
			error: ajaxFail
		};

		ajax(options);


//		//FIXM russa DEBUG:
//		if(typeof fileNameCounter !== 'undefined'){
//			++fileNameCounter;
//		} else {
//			fileNameCounter = 0;
//		}
//		Recorder.forceDownload(data, 'speechAsr_'+fileNameCounter+'.flac');
//		//FIXM russa DEBUG (END)

		return;
	};

	/** initializes the connection to the googleMediator-server,
	 * where the audio will be sent in order to be recognized.
	 *
	 * @memberOf GoogleWebAudioInputImpl#
	 */
	var doInitSend = function(oninit){

		//DISABLED: not needed for google-v2
	};

	/** @memberOf GoogleWebAudioInputImpl# */
	var onSilenceDetected = function(evt){

		var recorder = evt.recorder;

		//encode all buffered audio now
		recorder.doEncode();
		recorder.doFinish();

		//FIXME experimental callback/listener for on-detect-sentence -> API may change!
		var onDetectSentenceListeners = mediaManager.getListeners('ondetectsentence');
		for(var i=0, size = onDetectSentenceListeners.length; i < size; ++i){
			onDetectSentenceListeners[i]();//blob, inputId);
		}

		return false;
	};

	/** @memberOf GoogleWebAudioInputImpl# */
	var onClear = function(evt){

		evt.recorder && evt.recorder.clear();
		return false;
	};

	/** @memberOf GoogleWebAudioInputImpl# */
	var doStopPropagation = function(){
		return false;
	};

	/**  @memberOf GoogleWebAudioInputImpl# */
	return {
		/** @memberOf GoogleWebAudioInputImpl.AudioProcessor# */
		_init: doInitSend,
//		initRec: function(){},
		sendData: doSend,
		oninit: doStopPropagation,
		onstarted: function(data, successCallback, errorCallback){
			successCallback && successCallback('',-1,result_types.RECORDING_BEGIN)
			return false;
		},
		onaudiostarted: doStopPropagation,
		onstopped: function(data, successCallback, errorCallback){
			successCallback && successCallback('',-1,result_types.RECORDING_DONE)
			return false;
		},
		onsendpart: doStopPropagation,
		onsilencedetected: onSilenceDetected,
		onclear: onClear,
		getPluginName: function(){
			return _pluginName;
		},
		setCallbacks: function(successCallbackFunc, failureCallbackFunc, stopUserMediaFunc, options){

			//callbacks need to be set in doSend() only
//			successCallback = successCallbackFunc;
//			errorCallback = failureCallbackFunc;
//			var func = stopUserMediaFunc;

			currentOptions = options;
		},
		setLastResult: function(){
			lastBlob = true;
		},
		resetLastResult: function(){
			lastBlob = false;
		},
		isLastResult: function(){
			return lastBlob;
		}
	};

});//END define
