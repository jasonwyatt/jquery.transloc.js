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
    
    var pluginVersion = '0.2',
        settings = {
            // apiVersion: String
            //      Version of the API to use.
            apiVersion: '1.1',
            
            // vehicleUrlPattern: String
            //      URL Pattern for the vehicles endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            vehicleUrlPattern: 'http://api.transloc.com/{{apiVersion}}/vehicles.jsonp',
            
            // stopUrlPattern: String
            //      URL Pattern for the stops endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            stopUrlPattern: 'http://api.transloc.com/{{apiVersion}}/stops.jsonp',
            
            // routeUrlPattern: String
            //      URL Pattern for the routes endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            routeUrlPattern: 'http://api.transloc.com/{{apiVersion}}/routes.jsonp',
            
            // agencyUrlPattern: String
            //      URL Pattern for the agencies endpoint of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            agencyUrlPattern: 'http://api.transloc.com/{{apiVersion}}/agencies.jsonp',
            
            // arrivalEstimateUrlPattern: String
            //      URL Pattern for the arrival estimates endpoint of the API.  
            //      Tokens within the the pattern are denoted by surrounding 
            //      double-mustaches. They will be replaced at call-time with 
            //      values from the settings object.
            arrivalEstimateUrlPattern: 'http://api.transloc.com/{{apiVersion}}/arrival-estimates.jsonp',
            
            // segmentsUrlPattern: String
            //      URL Pattern for the segments of the API.  Tokens 
            //      within the the pattern are denoted by surrounding double-
            //      mustaches. They will be replaced at call-time with values 
            //      from the settings object.
            segmentUrlPattern: 'http://api.transloc.com/{{apiVersion}}/segments.jsonp'
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
            //      Wrapper function for retrieving data from the API. 
            // url: String
            //      URL to fetch.
            // data: Object
            //      OPTIONAL. Data to send with the request.
            // returns:
            //      jqXHR object for the request.
            
            return getRawData(url + '?callback=?', data);
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
                //          useJsonPify: false
                //      }
                // returns:
                //      Copy of the latest settings.
                
                if(newSettings !== null){
                    settings = $.extend(settings, newSettings);
                }
                
                return $.extend({pluginVersion: pluginVersion}, settings);
            },
            
            request: function(type, kwArgs){
                // summary:
                //      Creates a request to the TransLoc API.
                // type: String
                //      Type of request, what data we're asking for. One of the 
                //      following:
                //      ["agencies", "segments", "routes", 
                //          "stops", "arrival-estimates", "vehicles"]
                // kwArgs: Object
                //      Keyword arguments for the request. Example:
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
                //          //      Sometimes optional. An array of agency ids 
                //          //      or names to filter the results of the 
                //          //      request.
                //          agencyIds: [],
                //          
                //          // routeIds: Array<String>
                //          //      OPTIONAL. An array of route ids to filter 
                //          //      the results of the request.
                //          routeIds: [],
                //          
                //          // stopIds: Array<String>
                //          //      OPTIONAL. An array of stop ids to filter 
                //          //      the results of the request.
                //          stopIds: [],
                //
                //          // error: function(responseCode, errorMessage)
                //          //      OPTIONAL. A callback that will be triggered
                //          //      in the event the api endpoint throws an 
                //          //      error.
                //          error: function(){},
                //
                //          // success: function(data)
                //          //      A callback that will be triggered, passed 
                //          //      an object or array of objects. 
                //          success: function(){}
                //      }
                //  returns:
                //      jqXHR deferred object.
                var typeToUrl = {
                        'agencies': settings.agencyUrlPattern,
                        'segments': settings.segmentUrlPattern,
                        'routes': settings.routeUrlPattern,
                        'stops': settings.stopUrlPattern,
                        'arrival-estimates': settings.arrivalEstimateUrlPattern,
                        'vehicles': settings.vehicleUrlPattern
                    },
                    typeToRequiredFields = {
                        'agencies': [],
                        'segments': ['agencyIds'],
                        'routes': ['agencyIds'],
                        'stops': ['agencyIds'],
                        'vehicles': ['agencyIds'],
                        'arrival-estimates': ['agencyIds']
                    },
                    defaults = {
                        error: function(){},
                        success: function(){}
                    },
                    jqXHR = null,
                    data = {},
                    url = templatize(typeToUrl[type], settings),
                    i, len;
                    
                kwArgs = $.extend(defaults, kwArgs);
                
                // Check for required fields
                for(i = 0, len = typeToRequiredFields[type].length; i < len; i++){
                    if(typeof kwArgs[typeToRequiredFields[type]] === 'undefined'){
                        $.error('Required field: '+typeToRequiredFields[type]+' not set.');
                        return;
                    }
                }
                
                // geoArea is always optional
                if(kwArgs.geoArea != null){
                    data.geo_area = buildGeoArea(kwArgs.geoArea);
                }
                
                // agencies are usually required
                if(kwArgs.agencyIds != null){
                    data.agencies = kwArgs.agencyIds.join(',');
                } 
                
                // optional..
                if(kwArgs.routeIds != null){
                    data.routes = kwArgs.routeIds.join(',');
                }
                
                // optional..
                if(kwArgs.stopIds != null){
                    data.routes = kwArgs.stopIds.join(',');
                }
                
                jqXHR = getData(url, data);
                jqXHR.success(function(responseData){
                        if(typeof responseData === "string"){
                            kwArgs.error.call(null, 400, responseData);
                            return;
                        }
                        
                        // Success!
                        var data = responseData.data;
                        kwArgs.success.call(null, data);
                    })
                    .error(function(){
                        // Error!
                        kwArgs.error.call(null, jqXHR.status, jqXHR.responseText);
                    });
                    
                return jqXHR;
            },
            
            agencies: function(kwArgs){
                // summary:
                //      Gets a list of agencies from the API.
                // kwArgs: Object
                //      Keyword Arguments
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.
                
                
                return this.request("agencies", kwArgs);
            },
            
            routes: function(kwArgs){
                // summary:
                //      Gets a list of routes from the API.
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.
                
                return this.request("routes", kwArgs);
            },

            segments: function(kwArgs){
                // summary:
                //      Gets a list of segments from the API.
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.

                return this.request("segments", kwArgs);
            },

            stops: function(kwArgs){
                // summary:
                //      Gets a list of segments from the API.
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.

                return this.request("stops", kwArgs);
            },

            vehicles: function(kwArgs){
                // summary:
                //      Gets a list of vehicles from the API.
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.

                return this.request("vehicles", kwArgs);
            },
            
            'arrival-estimates': function(kwArgs){
                // summary:
                //      Gets a list of arrival-estimates from the API.
                // kwArgs: Object
                //      Keyword Arguments. See transloc.request for details.
                //  returns:
                //      jqXHR deferred object.
                
                return this.request('arrival-estimates', kwArgs);
            }
        };
    
    $.transloc = function(method){
        if(methods[method]){
            return methods[method].apply(methods, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || ! method) {
            // if method is an object, or null
            return methods.settings.apply(methods, [method]);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.transloc' );
        }
    };
    
})(jQuery);

