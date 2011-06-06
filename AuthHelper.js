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

GLOBAL.authHelper = {
    /** 
     * This function can get tokens from a Spiffy UI authentication
     * server.
     * 
     * @param url The URL of the authentication server.  This
     *            can be a different server from the server
     *            implementing the REST endpoint requiring
     *            authentication.
     * 
     * @param user The username to use for the credentials
     * 
     * @param pwd The password to use for the credentials
     * 
     * @param callback The function to callback when the login is
     *                 complete.  It will either be called back with
     *                 a JSON object representing the token or null
     *                 if login failed.
     *
     */
    getToken: function(/*string*/ url, /*string*/ user, /*string*/ pwd, /*function*/ callback) {
        var http = require('http');
        var https = require('https');
        var URL = require('url');
        var urlObj = URL.parse(url);

        require('./base64');

        var headers = {
            'Accept': 'application/json',
            'Accept-Charset': 'UTF-8',
            'Authorization': 'Basic ' + GLOBAL.Base64.encode(user + ":" + pwd)
        };

        var options = {
            host: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'POST',
            headers: headers
        };

        var f = function(res) {
            res.setEncoding('utf8');
            if (res.statusCode === 200 || res.statusCode === 201) {
                res.on('data', function (chunk) {
                    var token = JSON.parse(chunk);
                    callback(token.Token);
                });
            } else {
                callback(null);
            }
        };

        if (urlObj.protocol === 'https:') {
            https.request(options, f).end();
        } else {
            http.request(options, f).end();
        }
        
        
    },

    /**
     * Do a login to a Spiffy UI authentication server.
     * 
     * @param authHeader The authentication header from the initial
     *                   request resulting in the 401 response which
     *                   instigated this login request
     * 
     * @param user The username to use for the credentials
     * 
     * @param pwd The password to use for the credentials
     * 
     * @param callback The function to callback when the login is
     *                 complete.  It will either be called back with
     *                 a JSON object representing the token or null
     *                 if login failed.
     */
    doLogin: function(/*string*/ authHeader, /*string*/ user, /*string*/ pwd, /*function*/ callback) {
         var tokenType = authHeader.substring(0, authHeader.indexOf(' '));
         var url = authHeader.substring(authHeader.indexOf('uri="') + 5, 
                                        authHeader.indexOf('"', authHeader.indexOf('uri="') + 5));
         authHelper.getToken(url, user, pwd, function(/*string*/ token) {
             callback(token, tokenType);
         });
    }
};
