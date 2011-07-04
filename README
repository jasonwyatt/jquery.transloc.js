TransLoc API jQuery Plugin
==========================

jquery.transloc.js is a jQuery plugin that wraps the TransLoc API.  It provides an interface that should be familiar to anybody who has used jQuery UI or other "method"-based jQuery plugins.

The plugin, by default, uses the [JSONP-ifier](http://jsonpify.heroku.com/) as a jsonp proxy for the API.

While this document may be "in-flux", the code is very-well documented. Refer to it if you have any questions that can't be answered here.

Getting Started:
----------------

All methods are called within the `$.transloc` "namespace".  For example, to request a list of all agencies:

    $.transloc('agencies', {
        success: function(agencies){
            // do something with agencies...
        }
    });

Available methods are the following: `agencies`, `routes`, `stops`, `segments`, `vehicles`, `arrival-estimates`, and `settings`.

### `settings`

TODO: fill this in..

### `agencies`

TODO: fill this in..

### `routes`

TODO: fill this in..

### `stops`

TODO: fill this in..

### `segments`

TODO: fill this in..

### `vehicles`

TODO: fill this in..

### `arival-estimates`

TODO: fill this in..

Tips:
-----

To avoid running into issues with the rate limiter, you may need to build in some timeouts to your code.  We may improve the plugin to handle this for you, but as of the current version - it's up to you.  (If someone wants to implement this, and send a pull request, that'd be great!)

Using your own API Proxy:
-------------------------

If you need to use your own API proxy (this is the recommended method of accessing the API anyway, as it lets you customize how you plan to cache data), you can configure the plugin to point at whatever URLs you deem necessary for the following endpoints:

* Agencies
* Routes
* Segments
* Stops
* Vehicles
* Arrival-estimates

Additionally, you can specify the URLs as patterns with things in `{{mustache}}` notation. The value between the braces corresponds to a setting you can specify in the plugin.

Be sure to specify `useJsonPify` as false, unless you want to route through jsonPify also.

Example:
    $.transloc({
        agencyUrlPattern: './agencies_{{name}}.php',
        routeUrlPattern: './routes_{{name}}.php',
        segmentUrlPattern: './segments_{{name}}.php',
        stopUrlPattern: './stops_{{name}}.php',
        vehicleUrlPattern: './vehicles_{{name}}.php',
        arrivalEstimateUrlPattern: './arrivals_{{name}}.php',
        name: 'jason',
        useJsonPify: false
    });
This will cause the plugin to request from `./agencies_jason.php` for any calls to the agency method.
