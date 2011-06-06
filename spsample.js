/*******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/

var username = 'admin';
var password = 'test';

var http = require('http');
var https = require('https');
require('./AuthHelper');

var spsample = {
    getSampleData: function(/*function*/ callback) {
        
        /*
         * This sample connects to REST endpoints running on SpiffyUI.org
         */
        var options = {
            host: 'www.spiffyui.org',
            port: 80,
            path: '/authdata',
            method: 'GET'
        };
    
        spsample.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                callback(classifiers = JSON.parse(chunk));
            });
        }, false);
    },

    request: function(/*array*/ options, /*function*/ callback, /*boolean*/ isSSL) {

        /*
         * We'll add our standard headers
         */

        var headers = options.headers;

        if (!headers) {
            headers = {};
        }
        headers['Accept'] = 'application/json';
        headers['Accept-Charset'] = 'UTF-8';

        if (spsample.token) {
            /*
             * We'll add the authentication headers if we have them
             */
            headers['Authorization'] = spsample.tokenType + ' ' + spsample.token;
            headers['TS-URL'] = spsample.authServerURL;
        }

        options['headers'] = headers;

        var f = function(res) {
            if (res.statusCode === 401) {
                /*
                 * Then we have to login
                 */
                console.log("Login was required...");
                authHelper.doLogin(res.headers['www-authenticate'], username, password,  
                                  function(/*string*/ token, /*string*/ tokenType, /*string*/ authServerURL) {
                    if (token === null) {
                        console.log("Unable to login...");
                        return;
                    }

                    spsample.token = token;
                    spsample.tokenType = tokenType;
                    spsample.authServerURL = authServerURL;

                    /*
                     * Now that we've logged in we replay the first request
                     */
                    spsample.request(options, callback);
                 });
            } else {
                callback(res);
            }
        };

        if (isSSL) {
            https.request(options, f).end();
        } else {
            http.request(options, f).end();
        }
    }
}

console.log("Getting sample data from www.spiffyui.org..");
spsample.getSampleData(function(/*JSON*/ data) {
    console.log('Using your secret token of ' + data.token + ', you received the Spiffy UI secret slogan - ' + data.message);
});
