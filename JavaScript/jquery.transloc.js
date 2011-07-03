/**
Copyright (c) 2011 Jason Feinstein, http://jwf.us/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
;(function($){
    
    var pluginVersion = '0.1',
        settings = {
            // useYql: Boolean
            //      Whether or not to request the API data through the Yahoo 
            //      Query Language as a JSONP proxy.
            useYql: true,
            
            // apiVersion: String
            //      Version of the API to use.
            apiVersion: '1.0',
            
            // vehicleUrlPattern: String
            //      URL Pattern for the vehicles endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            vehicleUrlPattern: 'http://api.transloc.com/{{apiVersion}}/vehicles.json',
            
            // stopUrlPattern: String
            //      URL Pattern for the stops endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            stopUrlPattern: 'http://api.transloc.com/{{apiVersion}}/stops.json',
            
            // routeUrlPattern: String
            //      URL Pattern for the routes endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            routeUrlPattern: 'http://api.transloc.com/{{apiVersion}}/routes.json',
            
            // agencyUrlPattern: String
            //      URL Pattern for the agencies endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            agencyUrlPattern: 'http://api.transloc.com/{{apiVersion}}/agencies.json',
            
            // arrivalEstimateUrlPattern: String
            //      URL Pattern for the arrival estimates endpoint of the API.  
            //      Tokens within the the pattern are denoted by surrounding 
            //      double-mustaches. They will be replaced at call-time with 
            //      values from the settings object.
            arrivalEstimateUrlPattern: 'http://api.transloc.com/{{apiVersion}}/arrival-estimates.json',
            
            // segmentsUrlPattern: String
            //      URL Pattern for the segments of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            segmentsUrlPattern: 'http://api.transloc.com/{{apiVersion}}/segments.json'
        },
        templatize = function(string, obj){
            // summary:
            //      Fills in a templated string with values from an object map.
            // string: String
            //      Any templated string with tokens denoted by double-mustache 
            //      notation.
            // obj: Object
            //      Object with mappings from token to value.
            // returns:
            //      Template string with the values filled-in.
            
            var key, 
                result = string, 
                regexp;
            
            for(key in obj){
                if(obj.hasOwnProperty(key)){
                    regexp = this[key] || new RegExp('{{'+key+'}}', 'gi');
                    result = result.replace(regexp, obj[key]);
                    this[key] = regexp;
                }
            }
            return result;
        },
        buildGeoArea = function(geoArea){
            // summary:
            //      Builds a geo_area-compliant string out of a geoArea object.
            // geoArea: Object
            //      A Geo Area object, either:
            //      {
            //          nw: [lat, lng],
            //          se: [lat, lng]
            //      }
            //      or
            //      {
            //          center: [lat, lng],
            //          radius: radius
            //      }
            // returns:
            //      String. A string-representation of a geo-area, ready for 
            //      the API.
            
            if(geoArea.nw != null && geoArea.se != null){
                return geoArea.nw.join(',') + '|' + geoArea.se.join(',');
            } else if(geoArea.center != null && geoArea.radius != null){
                return geoArea.center.join(',') + '|' + geoArea.radius;
            } else {
                $.error('Invalid geoArea.');
            }
        },
        getData = function(url, data){
            // summary:
            //      Wrapper function for retrieving data from the API. If yql 
            //      is enabled, we will use the getYqlData helper. Otherwise, 
            //      we will use getRawData.
            // url: String
            //      URL to fetch.
            // data: Object
            //      OPTIONAL. Data to send with the request.
            // returns:
            //      jqXHR object for the request.
            
            if(settings.useYql){
                return getYqlData(url, data);
            }
            
            return getRawData(url, data);
        },
        getRawData = function(url, data){
            // summary:
            //      Helper function to trigger a request for data directly from 
            //      the API.
            // url: String
            //      URL to fetch.
            // data: Object
            //      OPTIONAL. Data to send with the request.
            // returns:
            //      jqXHR object for the request.
            
            return $.getJSON(url, data);
        },
        getYqlData = function(url, data){
            // summary:
            //      Helper function to trigger a request for data via the YQL 
            //      proxy.
            // url: String
            //      URL to fetch.
            // data: Object
            //      OPTIONAL. Data to send with the request.
            // returns:
            //      jqXHR object for the request.
            
            var data = data || {},
                dataString = encodeURIComponent('?'+$.param(data));
            
            return $.getJSON('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22'+url+dataString+'%22&format=json&diagnostics=false&callback=?');
        },
        methods = {
            settings: function(newSettings){
                // summary:
                //      Gets or sets the settings for the TransLoc API jQuery 
                //      Plugin
                // newSettings: Object
                //      If supplied, an object containing new setting values 
                //      for the api. If not supplied, the function will return 
                //      the current settings.
                //      
                //      Example: {
                //          useYql: false
                //      }
                // returns:
                //      Copy of the latest settings.
                
                if(newSettings !== null){
                    $.extend(settings, newSettings);
                }
                
                return $.extend({pluginVersion: pluginVersion}, settings);
            },
            
            agencies: function(kwArgs){
                // summary:
                //      Gets a list of agencies from the API.
                // kwArgs: Object
                //      Keyword Arguments, example:
                //      {
                //          // geoArea: Object
                //          //      OPTIONAL. A 'geo_area' object to filter the 
                //          //      results of the request by a physical area.
                //          geoArea: {
                //              center: [lat, lng],
                //              radius: radius
                //          },
                //          
                //          // agencyIds: Array<String>
                //          //      OPTIONAL. An array of agency ids or names to 
                //          //      filter the results of the request.
                //          agencyIds: [],
                //
                //          // error: function(responseCode, errorMessage)
                //          //      OPTIONAL. A callback that will be triggered
                //          //      in the event the api endpoint throws an 
                //          //      error.
                //          error: function(){},
                //
                //          // success: function(agencies)
                //          //      A callback that will be triggered, passed 
                //          //      an array of agency objects. 
                //          success: function(){}
                //      }
                
                var defaults = {
                        error: function(){},
                        success: function(){}
                    },
                    jqXHR = null,
                    data = {},
                    url = templatize(settings.agencyUrlPattern, settings);
                    
                kwArgs = $.extend(defaults, kwArgs);
                
                if(kwArgs.geoArea != null){
                    data.geo_area = buildGeoArea(kwArgs.geoArea);
                }
                
                if(kwArgs.agencyIds != null){
                    data.agencies = kwArgs.agencyIds.join(',');
                }
                
                jqXHR = getData(url, data);
                jqXHR.success(function(responseData){
                        // Success!
                        var data = null;
                        
                        if(settings.useYql){
                            data = responseData.query.results.json.data;
                        } else {
                            data = responseData.data;
                        }
                        kwArgs.success.call(null, data);
                    })
                    .error(function(){
                        // Error!
                        kwArgs.error.call(null, jqXHR.status, jqXHR.responseText);
                    });
            }
        };
    
    $.transloc = function(method){
        if(methods[method]){
            return methods[method].apply(null, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || ! method) {
            // if method is an object, or null
            return methods.settings.apply(null, method);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.transloc' );
        }
    };
    
})(jQuery);

