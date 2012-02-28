/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
/**
 * The YUI module contains the components required for building the YUI seed
 * file.  This includes the script loading mechanism, a simple queue, and
 * the core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

if (typeof YUI != 'undefined') {
    YUI._YUI = YUI;
}

/**
 * The YUI global namespace object.  If YUI is already defined, the
 * existing YUI object will not be overwritten so that defined
 * namespaces are preserved.  It is the constructor for the object
 * the end user interacts with.  As indicated below, each instance
 * has full custom event support, but only if the event system
 * is available.  This is a self-instantiable factory function.  You
 * can invoke it directly like this:
 *
 * YUI().use('*', function(Y) {
 *   // ready
 * });
 *
 * But it also works like this:
 *
 * var Y = YUI();
 *
 * @class YUI
 * @constructor
 * @global
 * @uses EventTarget
 * @param o* {object} 0..n optional configuration objects.  these values
 * are store in Y.config.  See config for the list of supported
 * properties.
 */
    /*global YUI*/
    /*global YUI_config*/
    var YUI = function() {
        var i = 0,
            Y = this,
            args = arguments,
            l = args.length,
            instanceOf = function(o, type) {
                return (o && o.hasOwnProperty && (o instanceof type));
            },
            gconf = (typeof YUI_config !== 'undefined') && YUI_config;

        if (!(instanceOf(Y, YUI))) {
            Y = new YUI();
        } else {
            // set up the core environment
            Y._init();

            // YUI.GlobalConfig is a master configuration that might span
            // multiple contexts in a non-browser environment.  It is applied
            // first to all instances in all contexts.
            if (YUI.GlobalConfig) {
                Y.applyConfig(YUI.GlobalConfig);
            }

            // YUI_Config is a page-level config.  It is applied to all
            // instances created on the page.  This is applied after
            // YUI.GlobalConfig, and before the instance level configuration
            // objects.
            if (gconf) {
                Y.applyConfig(gconf);
            }

            // bind the specified additional modules for this instance
            if (!l) {
                Y._setup();
            }
        }

        if (l) {
            // Each instance can accept one or more configuration objects.
            // These are applied after YUI.GlobalConfig and YUI_Config,
            // overriding values set in those config files if there is a '
            // matching property.
            for (; i < l; i++) {
                Y.applyConfig(args[i]);
            }

            Y._setup();
        }

        Y.instanceOf = instanceOf;

        return Y;
    };

(function() {

    var proto, prop,
        VERSION = '3.3.0',
        PERIOD = '.',
        BASE = 'http://yui.yahooapis.com/',
        DOC_LABEL = 'yui3-js-enabled',
        NOOP = function() {},
        SLICE = Array.prototype.slice,
        APPLY_TO_AUTH = { 'io.xdrReady': 1,   // the functions applyTo
                          'io.xdrResponse': 1,   // can call. this should
                          'SWF.eventHandler': 1 }, // be done at build time
        hasWin = (typeof window != 'undefined'),
        win = (hasWin) ? window : null,
        doc = (hasWin) ? win.document : null,
        docEl = doc && doc.documentElement,
        docClass = docEl && docEl.className,
        instances = {},
        time = new Date().getTime(),
        add = function(el, type, fn, capture) {
            if (el && el.addEventListener) {
                el.addEventListener(type, fn, capture);
            } else if (el && el.attachEvent) {
                el.attachEvent('on' + type, fn);
            }
        },
        remove = function(el, type, fn, capture) {
            if (el && el.removeEventListener) {
                // this can throw an uncaught exception in FF
                try {
                    el.removeEventListener(type, fn, capture);
                } catch (ex) {}
            } else if (el && el.detachEvent) {
                el.detachEvent('on' + type, fn);
            }
        },
        handleLoad = function() {
            YUI.Env.windowLoaded = true;
            YUI.Env.DOMReady = true;
            if (hasWin) {
                remove(window, 'load', handleLoad);
            }
        },
        getLoader = function(Y, o) {
            var loader = Y.Env._loader;
            if (loader) {
                loader.ignoreRegistered = false;
                loader.onEnd = null;
                loader.data = null;
                loader.required = [];
                loader.loadType = null;
            } else {
                loader = new Y.Loader(Y.config);
                Y.Env._loader = loader;
            }

            return loader;
        },

        clobber = function(r, s) {
            for (var i in s) {
                if (s.hasOwnProperty(i)) {
                    r[i] = s[i];
                }
            }
        },

        ALREADY_DONE = { success: true };

//  Stamp the documentElement (HTML) with a class of "yui-loaded" to
//  enable styles that need to key off of JS being enabled.
if (docEl && docClass.indexOf(DOC_LABEL) == -1) {
    if (docClass) {
        docClass += ' ';
    }
    docClass += DOC_LABEL;
    docEl.className = docClass;
}

if (VERSION.indexOf('@') > -1) {
    VERSION = '3.2.0'; // dev time hack for cdn test
}

proto = {
    /**
     * Applies a new configuration object to the YUI instance config.
     * This will merge new group/module definitions, and will also
     * update the loader cache if necessary.  Updating Y.config directly
     * will not update the cache.
     * @method applyConfig
     * @param {object} the configuration object.
     * @since 3.2.0
     */
    applyConfig: function(o) {

        o = o || NOOP;

        var attr,
            name,
            // detail,
            config = this.config,
            mods = config.modules,
            groups = config.groups,
            rls = config.rls,
            loader = this.Env._loader;

        for (name in o) {
            if (o.hasOwnProperty(name)) {
                attr = o[name];
                if (mods && name == 'modules') {
                    clobber(mods, attr);
                } else if (groups && name == 'groups') {
                    clobber(groups, attr);
                } else if (rls && name == 'rls') {
                    clobber(rls, attr);
                } else if (name == 'win') {
                    config[name] = attr.contentWindow || attr;
                    config.doc = config[name].document;
                } else if (name == '_yuid') {
                    // preserve the guid
                } else {
                    config[name] = attr;
                }
            }
        }

        if (loader) {
            loader._config(o);
        }
    },

    _config: function(o) {
        this.applyConfig(o);
    },

    /**
     * Initialize this YUI instance
     * @private
     */
    _init: function() {
        var filter,
            Y = this,
            G_ENV = YUI.Env,
            Env = Y.Env,
            prop;

        /**
         * The version number of the YUI instance.
         * @property version
         * @type string
         */
        Y.version = VERSION;

        if (!Env) {
            Y.Env = {
                mods: {}, // flat module map
                versions: {}, // version module map
                base: BASE,
                cdn: BASE + VERSION + '/build/',
                // bootstrapped: false,
                _idx: 0,
                _used: {},
                _attached: {},
                _yidx: 0,
                _uidx: 0,
                _guidp: 'y',
                _loaded: {},
                serviced: {},
                getBase: G_ENV && G_ENV.getBase ||

    function(srcPattern, comboPattern) {
        var b, nodes, i, src, match;
        // get from querystring
        nodes = (doc && doc.getElementsByTagName('script')) || [];
        for (i = 0; i < nodes.length; i = i + 1) {
            src = nodes[i].src;
            if (src) {

                match = src.match(srcPattern);
                b = match && match[1];
                if (b) {
                    // this is to set up the path to the loader.  The file
                    // filter for loader should match the yui include.
                    filter = match[2];

                    if (filter) {
                        match = filter.indexOf('js');

                        if (match > -1) {
                            filter = filter.substr(0, match);
                        }
                    }

                    // extract correct path for mixed combo urls
                    // http://yuilibrary.com/projects/yui3/ticket/2528423
                    match = src.match(comboPattern);
                    if (match && match[3]) {
                        b = match[1] + match[3];
                    }

                    break;
                }
            }
        }

        // use CDN default
        return b || Env.cdn;
    }
            };

            Env = Y.Env;

            Env._loaded[VERSION] = {};

            if (G_ENV && Y !== YUI) {
                Env._yidx = ++G_ENV._yidx;
                Env._guidp = ('yui_' + VERSION + '_' +
                             Env._yidx + '_' + time).replace(/\./g, '_');
            } else if (YUI._YUI) {

                G_ENV = YUI._YUI.Env;
                Env._yidx += G_ENV._yidx;
                Env._uidx += G_ENV._uidx;

                for (prop in G_ENV) {
                    if (!(prop in Env)) {
                        Env[prop] = G_ENV[prop];
                    }
                }

                delete YUI._YUI;
            }

            Y.id = Y.stamp(Y);
            instances[Y.id] = Y;

        }

        Y.constructor = YUI;

        // configuration defaults
        Y.config = Y.config || {
            win: win,
            doc: doc,
            debug: true,
            useBrowserConsole: true,
            throwFail: true,
            bootstrap: true,
            cacheUse: true,
            fetchCSS: true
        };

        Y.config.base = YUI.config.base ||
            Y.Env.getBase(/^(.*)yui\/yui([\.\-].*)js(\?.*)?$/,
                          /^(.*\?)(.*\&)(.*)yui\/yui[\.\-].*js(\?.*)?$/);

        if (!filter || (!('-min.-debug.').indexOf(filter))) {
            filter = '-min.';
        }

        Y.config.loaderPath = YUI.config.loaderPath ||
            'loader/loader' + (filter || '-min.') + 'js';

    },

    /**
     * Finishes the instance setup. Attaches whatever modules were defined
     * when the yui modules was registered.
     * @method _setup
     * @private
     */
    _setup: function(o) {
        var i, Y = this,
            core = [],
            mods = YUI.Env.mods,
            extras = Y.config.core || ['get',
                                        'rls',
                                        'intl-base',
                                        'loader',
                                        'yui-log',
                                        'yui-later',
                                        'yui-throttle'];

        for (i = 0; i < extras.length; i++) {
            if (mods[extras[i]]) {
                core.push(extras[i]);
            }
        }

        Y._attach(['yui-base']);
        Y._attach(core);

    },

    /**
     * Executes a method on a YUI instance with
     * the specified id if the specified method is whitelisted.
     * @method applyTo
     * @param id {string} the YUI instance id.
     * @param method {string} the name of the method to exectute.
     * Ex: 'Object.keys'.
     * @param args {Array} the arguments to apply to the method.
     * @return {object} the return value from the applied method or null.
     */
    applyTo: function(id, method, args) {
        if (!(method in APPLY_TO_AUTH)) {
            this.log(method + ': applyTo not allowed', 'warn', 'yui');
            return null;
        }

        var instance = instances[id], nest, m, i;
        if (instance) {
            nest = method.split('.');
            m = instance;
            for (i = 0; i < nest.length; i = i + 1) {
                m = m[nest[i]];
                if (!m) {
                    this.log('applyTo not found: ' + method, 'warn', 'yui');
                }
            }
            return m.apply(instance, args);
        }

        return null;
    },

    /**
     * Registers a module with the YUI global.  The easiest way to create a
     * first-class YUI module is to use the YUI component build tool.
     *
     * http://yuilibrary.com/projects/builder
     *
     * The build system will produce the YUI.add wrapper for you module, along
     * with any configuration info required for the module.
     * @method add
     * @param name {string} module name.
     * @param fn {Function} entry point into the module that
     * is used to bind module to the YUI instance.
     * @param version {string} version string.
     * @param details {object} optional config data:
     * requires: features that must be present before this module can be
     * attached.
     * optional: optional features that should be present if loadOptional
     * is defined.  Note: modules are not often loaded this way in YUI 3,
     * but this field is still useful to inform the user that certain
     * features in the component will require additional dependencies.
     * use: features that are included within this module which need to
     * be attached automatically when this module is attached.  This
     * supports the YUI 3 rollup system -- a module with submodules
     * defined will need to have the submodules listed in the 'use'
     * config.  The YUI component build tool does this for you.
     * @return {YUI} the YUI instance.
     *
     */
    add: function(name, fn, version, details) {
        details = details || {};
        var env = YUI.Env,
            mod = {
                name: name,
                fn: fn,
                version: version,
                details: details
            },
            loader,
            i, versions = env.versions;

        env.mods[name] = mod;
        versions[version] = versions[version] || {};
        versions[version][name] = mod;

        for (i in instances) {
            if (instances.hasOwnProperty(i)) {
                loader = instances[i].Env._loader;
                if (loader) {
                    if (!loader.moduleInfo[name]) {
                        loader.addModule(details, name);
                    }
                }
            }
        }

        return this;
    },

    /**
     * Executes the function associated with each required
     * module, binding the module to the YUI instance.
     * @method _attach
     * @private
     */
    _attach: function(r, fromLoader) {
        var i, name, mod, details, req, use, after,
            mods = YUI.Env.mods,
            Y = this, j,
            done = Y.Env._attached,
            len = r.length, loader;


        for (i = 0; i < len; i++) {
            if (!done[r[i]]) {
                name = r[i];
                mod = mods[name];
                if (!mod) {
                    loader = Y.Env._loader;


                    if (!loader || !loader.moduleInfo[name]) {
                        Y.message('NOT loaded: ' + name, 'warn', 'yui');
                    }
                } else {
                    done[name] = true;
                    details = mod.details;
                    req = details.requires;
                    use = details.use;
                    after = details.after;

                    if (req) {
                        for (j = 0; j < req.length; j++) {
                            if (!done[req[j]]) {
                                if (!Y._attach(req)) {
                                    return false;
                                }
                                break;
                            }
                        }
                    }

                    if (after) {
                        for (j = 0; j < after.length; j++) {
                            if (!done[after[j]]) {
                                if (!Y._attach(after)) {
                                    return false;
                                }
                                break;
                            }
                        }
                    }

                    if (use) {
                        for (j = 0; j < use.length; j++) {
                            if (!done[use[j]]) {
                                if (!Y._attach(use)) {
                                    return false;
                                }
                                break;
                            }
                        }
                    }

                    if (mod.fn) {
                        try {
                            mod.fn(Y, name);
                        } catch (e) {
                            Y.error('Attach error: ' + name, e, name);
                            return false;
                        }
                    }

                }
            }
        }

        return true;
    },

    /**
     * Attaches one or more modules to the YUI instance.  When this
     * is executed, the requirements are analyzed, and one of
     * several things can happen:
     *
     * - All requirements are available on the page --  The modules
     *   are attached to the instance.  If supplied, the use callback
     *   is executed synchronously.
     *
     * - Modules are missing, the Get utility is not available OR
     *   the 'bootstrap' config is false -- A warning is issued about
     *   the missing modules and all available modules are attached.
     *
     * - Modules are missing, the Loader is not available but the Get
     *   utility is and boostrap is not false -- The loader is bootstrapped
     *   before doing the following....
     *
     * - Modules are missing and the Loader is available -- The loader
     *   expands the dependency tree and fetches missing modules.  When
     *   the loader is finshed the callback supplied to use is executed
     *   asynchronously.
     *
     * @param modules* {string} 1-n modules to bind (uses arguments array).
     * @param *callback {function} callback function executed when
     * the instance has the required functionality.  If included, it
     * must be the last parameter.
     * <code>
     * // loads and attaches drag and drop and its dependencies
     * YUI().use('dd', function(Y) &#123;&#125);
     * // attaches all modules that are available on the page
     * YUI().use('*', function(Y) &#123;&#125);
     * // intrinsic YUI gallery support (since 3.1.0)
     * YUI().use('gallery-yql', function(Y) &#123;&#125);
     * // intrinsic YUI 2in3 support (since 3.1.0)
     * YUI().use('yui2-datatable', function(Y) &#123;&#125);.
     * </code>
     *
     * @return {YUI} the YUI instance.
     */
    use: function() {
        var args = SLICE.call(arguments, 0),
            callback = args[args.length - 1],
            Y = this,
            key;

        // The last argument supplied to use can be a load complete callback
        if (Y.Lang.isFunction(callback)) {
            args.pop();
        } else {
            callback = null;
        }

        if (Y._loading) {
            Y._useQueue = Y._useQueue || new Y.Queue();
            Y._useQueue.add([args, callback]);
        } else {
            key = args.join();

            if (Y.config.cacheUse && Y.Env.serviced[key]) {
                Y._notify(callback, ALREADY_DONE, args);
            } else {
                Y._use(args, function(Y, response) {
                    if (Y.config.cacheUse) {
                        Y.Env.serviced[key] = true;
                    }
                    Y._notify(callback, response, args);
                });
            }
        }

        return Y;
    },

    _notify: function(callback, response, args) {
        if (!response.success && this.config.loadErrorFn) {
            this.config.loadErrorFn.call(this, this, callback, response, args);
        } else if (callback) {
            try {
                callback(this, response);
            } catch (e) {
                this.error('use callback error', e, args);
            }
        }
    },

    _use: function(args, callback) {

        if (!this.Array) {
            this._attach(['yui-base']);
        }

        var len, loader, handleBoot,
            Y = this,
            G_ENV = YUI.Env,
            mods = G_ENV.mods,
            Env = Y.Env,
            used = Env._used,
            queue = G_ENV._loaderQueue,
            firstArg = args[0],
            YArray = Y.Array,
            config = Y.config,
            boot = config.bootstrap,
            missing = [],
            r = [],
            ret = true,
            fetchCSS = config.fetchCSS,
            process = function(names, skip) {

                if (!names.length) {
                    return;
                }

                YArray.each(names, function(name) {

                    // add this module to full list of things to attach
                    if (!skip) {
                        r.push(name);
                    }

                    // only attach a module once
                    if (used[name]) {
                        return;
                    }

                    var m = mods[name], req, use;

                    if (m) {
                        used[name] = true;
                        req = m.details.requires;
                        use = m.details.use;
                    } else {
                        // CSS files don't register themselves, see if it has
                        // been loaded
                        if (!G_ENV._loaded[VERSION][name]) {
                            missing.push(name);
                        } else {
                            used[name] = true; // probably css
                        }
                    }

                    // make sure requirements are attached
                    if (req && req.length) {
                        process(req);
                    }

                    // make sure we grab the submodule dependencies too
                    if (use && use.length) {
                        process(use, 1);
                    }
                });
            },

            handleLoader = function(fromLoader) {
                var response = fromLoader || {
                        success: true,
                        msg: 'not dynamic'
                    },
                    redo, origMissing,
                    ret = true,
                    data = response.data;


                Y._loading = false;

                if (data) {
                    origMissing = missing;
                    missing = [];
                    r = [];
                    process(data);
                    redo = missing.length;
                    if (redo) {
                        if (missing.sort().join() ==
                                origMissing.sort().join()) {
                            redo = false;
                        }
                    }
                }

                if (redo && data) {
                    Y._loading = false;
                    Y._use(args, function() {
                        if (Y._attach(data)) {
                            Y._notify(callback, response, data);
                        }
                    });
                } else {
                    if (data) {
                        ret = Y._attach(data);
                    }
                    if (ret) {
                        Y._notify(callback, response, args);
                    }
                }

                if (Y._useQueue && Y._useQueue.size() && !Y._loading) {
                    Y._use.apply(Y, Y._useQueue.next());
                }

            };


        // YUI().use('*'); // bind everything available
        if (firstArg === '*') {
            ret = Y._attach(Y.Object.keys(mods));
            if (ret) {
                handleLoader();
            }
            return Y;
        }


        // use loader to expand dependencies and sort the
        // requirements if it is available.
        if (boot && Y.Loader && args.length) {
            loader = getLoader(Y);
            loader.require(args);
            loader.ignoreRegistered = true;
            loader.calculate(null, (fetchCSS) ? null : 'js');
            args = loader.sorted;
        }

        // process each requirement and any additional requirements
        // the module metadata specifies
        process(args);

        len = missing.length;

        if (len) {
            missing = Y.Object.keys(YArray.hash(missing));
            len = missing.length;
        }

        // dynamic load
        if (boot && len && Y.Loader) {
            Y._loading = true;
            loader = getLoader(Y);
            loader.onEnd = handleLoader;
            loader.context = Y;
            loader.data = args;
            loader.ignoreRegistered = false;
            loader.require(args);
            loader.insert(null, (fetchCSS) ? null : 'js');
            // loader.partial(missing, (fetchCSS) ? null : 'js');

        } else if (len && Y.config.use_rls) {

            // server side loader service
            Y.Get.script(Y._rls(args), {
                onEnd: function(o) {
                    handleLoader(o);
                },
                data: args
            });

        } else if (boot && len && Y.Get && !Env.bootstrapped) {

            Y._loading = true;

            handleBoot = function() {
                Y._loading = false;
                queue.running = false;
                Env.bootstrapped = true;
                if (Y._attach(['loader'])) {
                    Y._use(args, callback);
                }
            };

            if (G_ENV._bootstrapping) {
                queue.add(handleBoot);
            } else {
                G_ENV._bootstrapping = true;
                Y.Get.script(config.base + config.loaderPath, {
                    onEnd: handleBoot
                });
            }

        } else {
            ret = Y._attach(args);
            if (ret) {
                handleLoader();
            }
        }

        return Y;
    },


    /**
     * Returns the namespace specified and creates it if it doesn't exist
     * <pre>
     * YUI.namespace("property.package");
     * YUI.namespace("YAHOO.property.package");
     * </pre>
     * Either of the above would create YUI.property, then
     * YUI.property.package (YAHOO is scrubbed out, this is
     * to remain compatible with YUI2)
     *
     * Be careful when naming packages. Reserved words may work in some browsers
     * and not others. For instance, the following will fail in Safari:
     * <pre>
     * YUI.namespace("really.long.nested.namespace");
     * </pre>
     * This fails because "long" is a future reserved word in ECMAScript
     *
     * @method namespace
     * @param  {string*} arguments 1-n namespaces to create.
     * @return {object}  A reference to the last namespace object created.
     */
    namespace: function() {
        var a = arguments, o = this, i = 0, j, d, arg;
        for (; i < a.length; i++) {
            // d = ('' + a[i]).split('.');
            arg = a[i];
            if (arg.indexOf(PERIOD)) {
                d = arg.split(PERIOD);
                for (j = (d[0] == 'YAHOO') ? 1 : 0; j < d.length; j++) {
                    o[d[j]] = o[d[j]] || {};
                    o = o[d[j]];
                }
            } else {
                o[arg] = o[arg] || {};
            }
        }
        return o;
    },

    // this is replaced if the log module is included
    log: NOOP,
    message: NOOP,

    /**
     * Report an error.  The reporting mechanism is controled by
     * the 'throwFail' configuration attribute.  If throwFail is
     * not specified, the message is written to the Logger, otherwise
     * a JS error is thrown
     * @method error
     * @param msg {string} the error message.
     * @param e {Error|string} Optional JS error that was caught, or an error string.
     * @param data Optional additional info
     * and throwFail is specified, this error will be re-thrown.
     * @return {YUI} this YUI instance.
     */
    error: function(msg, e, data) {

        var Y = this, ret;

        if (Y.config.errorFn) {
            ret = Y.config.errorFn.apply(Y, arguments);
        }

        if (Y.config.throwFail && !ret) {
            throw (e || new Error(msg));
        } else {
            Y.message(msg, 'error'); // don't scrub this one
        }

        return Y;
    },

    /**
     * Generate an id that is unique among all YUI instances
     * @method guid
     * @param pre {string} optional guid prefix.
     * @return {string} the guid.
     */
    guid: function(pre) {
        var id = this.Env._guidp + (++this.Env._uidx);
        return (pre) ? (pre + id) : id;
    },

    /**
     * Returns a guid associated with an object.  If the object
     * does not have one, a new one is created unless readOnly
     * is specified.
     * @method stamp
     * @param o The object to stamp.
     * @param readOnly {boolean} if true, a valid guid will only
     * be returned if the object has one assigned to it.
     * @return {string} The object's guid or null.
     */
    stamp: function(o, readOnly) {
        var uid;
        if (!o) {
            return o;
        }

        // IE generates its own unique ID for dom nodes
        // The uniqueID property of a document node returns a new ID
        if (o.uniqueID && o.nodeType && o.nodeType !== 9) {
            uid = o.uniqueID;
        } else {
            uid = (typeof o === 'string') ? o : o._yuid;
        }

        if (!uid) {
            uid = this.guid();
            if (!readOnly) {
                try {
                    o._yuid = uid;
                } catch (e) {
                    uid = null;
                }
            }
        }
        return uid;
    },

    /**
     * Destroys the YUI instance
     * @method destroy
     * @since 3.3.0
     */
    destroy: function() {
        var Y = this;
        if (Y.Event) {
            Y.Event._unload();
        }
        delete instances[Y.id];
        delete Y.Env;
        delete Y.config;
    }

    /**
     * instanceof check for objects that works around
     * memory leak in IE when the item tested is
     * window/document
     * @method instanceOf
     * @since 3.3.0
     */
};



    YUI.prototype = proto;

    // inheritance utilities are not available yet
    for (prop in proto) {
        if (proto.hasOwnProperty(prop)) {
            YUI[prop] = proto[prop];
        }
    }

    // set up the environment
    YUI._init();

    if (hasWin) {
        // add a window load event at load time so we can capture
        // the case where it fires before dynamic loading is
        // complete.
        add(window, 'load', handleLoad);
    } else {
        handleLoad();
    }

    YUI.Env.add = add;
    YUI.Env.remove = remove;

    /*global exports*/
    // Support the CommonJS method for exporting our single global
    if (typeof exports == 'object') {
        exports.YUI = YUI;
    }

}());


/**
 * The config object contains all of the configuration options for
 * the YUI instance.  This object is supplied by the implementer
 * when instantiating a YUI instance.  Some properties have default
 * values if they are not supplied by the implementer.  This should
 * not be updated directly because some values are cached.  Use
 * applyConfig() to update the config object on a YUI instance that
 * has already been configured.
 *
 * @class config
 * @static
 */

/**
 * Allows the YUI seed file to fetch the loader component and library
 * metadata to dynamically load additional dependencies.
 *
 * @property bootstrap
 * @type boolean
 * @default true
 */

/**
 * Log to the browser console if debug is on and the browser has a
 * supported console.
 *
 * @property useBrowserConsole
 * @type boolean
 * @default true
 */

/**
 * A hash of log sources that should be logged.  If specified, only
 * log messages from these sources will be logged.
 *
 * @property logInclude
 * @type object
 */

/**
 * A hash of log sources that should be not be logged.  If specified,
 * all sources are logged if not on this list.
 *
 * @property logExclude
 * @type object
 */

/**
 * Set to true if the yui seed file was dynamically loaded in
 * order to bootstrap components relying on the window load event
 * and the 'domready' custom event.
 *
 * @property injected
 * @type boolean
 * @default false
 */

/**
 * If throwFail is set, Y.error will generate or re-throw a JS Error.
 * Otherwise the failure is logged.
 *
 * @property throwFail
 * @type boolean
 * @default true
 */

/**
 * The window/frame that this instance should operate in.
 *
 * @property win
 * @type Window
 * @default the window hosting YUI
 */

/**
 * The document associated with the 'win' configuration.
 *
 * @property doc
 * @type Document
 * @default the document hosting YUI
 */

/**
 * A list of modules that defines the YUI core (overrides the default).
 *
 * @property core
 * @type string[]
 */

/**
 * A list of languages in order of preference. This list is matched against
 * the list of available languages in modules that the YUI instance uses to
 * determine the best possible localization of language sensitive modules.
 * Languages are represented using BCP 47 language tags, such as "en-GB" for
 * English as used in the United Kingdom, or "zh-Hans-CN" for simplified
 * Chinese as used in China. The list can be provided as a comma-separated
 * list or as an array.
 *
 * @property lang
 * @type string|string[]
 */

/**
 * The default date format
 * @property dateFormat
 * @type string
 * @deprecated use configuration in DataType.Date.format() instead.
 */

/**
 * The default locale
 * @property locale
 * @type string
 * @deprecated use config.lang instead.
 */

/**
 * The default interval when polling in milliseconds.
 * @property pollInterval
 * @type int
 * @default 20
 */

/**
 * The number of dynamic nodes to insert by default before
 * automatically removing them.  This applies to script nodes
 * because remove the node will not make the evaluated script
 * unavailable.  Dynamic CSS is not auto purged, because removing
 * a linked style sheet will also remove the style definitions.
 * @property purgethreshold
 * @type int
 * @default 20
 */

/**
 * The default interval when polling in milliseconds.
 * @property windowResizeDelay
 * @type int
 * @default 40
 */

/**
 * Base directory for dynamic loading
 * @property base
 * @type string
 */

/*
 * The secure base dir (not implemented)
 * For dynamic loading.
 * @property secureBase
 * @type string
 */

/**
 * The YUI combo service base dir. Ex: http://yui.yahooapis.com/combo?
 * For dynamic loading.
 * @property comboBase
 * @type string
 */

/**
 * The root path to prepend to module path for the combo service.
 * Ex: 3.0.0b1/build/
 * For dynamic loading.
 * @property root
 * @type string
 */

/**
 * A filter to apply to result urls.  This filter will modify the default
 * path for all modules.  The default path for the YUI library is the
 * minified version of the files (e.g., event-min.js).  The filter property
 * can be a predefined filter or a custom filter.  The valid predefined
 * filters are:
 * <dl>
 *  <dt>DEBUG</dt>
 *  <dd>Selects the debug versions of the library (e.g., event-debug.js).
 *      This option will automatically include the Logger widget</dd>
 *  <dt>RAW</dt>
 *  <dd>Selects the non-minified version of the library (e.g., event.js).</dd>
 * </dl>
 * You can also define a custom filter, which must be an object literal
 * containing a search expression and a replace string:
 * <pre>
 *  myFilter: &#123;
 *      'searchExp': "-min\\.js",
 *      'replaceStr': "-debug.js"
 *  &#125;
 * </pre>
 *
 * For dynamic loading.
 *
 * @property filter
 * @type string|object
 */

/**
 * The 'skin' config let's you configure application level skin
 * customizations.  It contains the following attributes which
 * can be specified to override the defaults:
 *
 *      // The default skin, which is automatically applied if not
 *      // overriden by a component-specific skin definition.
 *      // Change this in to apply a different skin globally
 *      defaultSkin: 'sam',
 *
 *      // This is combined with the loader base property to get
 *      // the default root directory for a skin.
 *      base: 'assets/skins/',
 *
 *      // Any component-specific overrides can be specified here,
 *      // making it possible to load different skins for different
 *      // components.  It is possible to load more than one skin
 *      // for a given component as well.
 *      overrides: {
 *          slider: ['capsule', 'round']
 *      }
 *
 * For dynamic loading.
 *
 *  @property skin
 */

/**
 * Hash of per-component filter specification.  If specified for a given
 * component, this overrides the filter config.
 *
 * For dynamic loading.
 *
 * @property filters
 */

/**
 * Use the YUI combo service to reduce the number of http connections
 * required to load your dependencies.  Turning this off will
 * disable combo handling for YUI and all module groups configured
 * with a combo service.
 *
 * For dynamic loading.
 *
 * @property combine
 * @type boolean
 * @default true if 'base' is not supplied, false if it is.
 */

/**
 * A list of modules that should never be dynamically loaded
 *
 * @property ignore
 * @type string[]
 */

/**
 * A list of modules that should always be loaded when required, even if already
 * present on the page.
 *
 * @property force
 * @type string[]
 */

/**
 * Node or id for a node that should be used as the insertion point for new
 * nodes.  For dynamic loading.
 *
 * @property insertBefore
 * @type string
 */

/**
 * Object literal containing attributes to add to dynamically loaded script
 * nodes.
 * @property jsAttributes
 * @type string
 */

/**
 * Object literal containing attributes to add to dynamically loaded link
 * nodes.
 * @property cssAttributes
 * @type string
 */

/**
 * Number of milliseconds before a timeout occurs when dynamically
 * loading nodes. If not set, there is no timeout.
 * @property timeout
 * @type int
 */

/**
 * Callback for the 'CSSComplete' event.  When dynamically loading YUI
 * components with CSS, this property fires when the CSS is finished
 * loading but script loading is still ongoing.  This provides an
 * opportunity to enhance the presentation of a loading page a little
 * bit before the entire loading process is done.
 *
 * @property onCSS
 * @type function
 */

/**
 * A hash of module definitions to add to the list of YUI components.
 * These components can then be dynamically loaded side by side with
 * YUI via the use() method. This is a hash, the key is the module
 * name, and the value is an object literal specifying the metdata
 * for the module.  * See Loader.addModule for the supported module
 * metadata fields.  Also @see groups, which provides a way to
 * configure the base and combo spec for a set of modules.
 * <code>
 * modules: {
 * &nbsp; mymod1: {
 * &nbsp;   requires: ['node'],
 * &nbsp;   fullpath: 'http://myserver.mydomain.com/mymod1/mymod1.js'
 * &nbsp; },
 * &nbsp; mymod2: {
 * &nbsp;   requires: ['mymod1'],
 * &nbsp;   fullpath: 'http://myserver.mydomain.com/mymod2/mymod2.js'
 * &nbsp; }
 * }
 * </code>
 *
 * @property modules
 * @type object
 */

/**
 * A hash of module group definitions.  It for each group you
 * can specify a list of modules and the base path and
 * combo spec to use when dynamically loading the modules.  @see
 * @see modules for the details about the modules part of the
 * group definition.
 * <code>
 * &nbsp; groups: {
 * &nbsp;     yui2: {
 * &nbsp;         // specify whether or not this group has a combo service
 * &nbsp;         combine: true,
 * &nbsp;
 * &nbsp;         // the base path for non-combo paths
 * &nbsp;         base: 'http://yui.yahooapis.com/2.8.0r4/build/',
 * &nbsp;
 * &nbsp;         // the path to the combo service
 * &nbsp;         comboBase: 'http://yui.yahooapis.com/combo?',
 * &nbsp;
 * &nbsp;         // a fragment to prepend to the path attribute when
 * &nbsp;         // when building combo urls
 * &nbsp;         root: '2.8.0r4/build/',
 * &nbsp;
 * &nbsp;         // the module definitions
 * &nbsp;         modules:  {
 * &nbsp;             yui2_yde: {
 * &nbsp;                 path: "yahoo-dom-event/yahoo-dom-event.js"
 * &nbsp;             },
 * &nbsp;             yui2_anim: {
 * &nbsp;                 path: "animation/animation.js",
 * &nbsp;                 requires: ['yui2_yde']
 * &nbsp;             }
 * &nbsp;         }
 * &nbsp;     }
 * &nbsp; }
 * </code>
 * @property modules
 * @type object
 */

/**
 * The loader 'path' attribute to the loader itself.  This is combined
 * with the 'base' attribute to dynamically load the loader component
 * when boostrapping with the get utility alone.
 *
 * @property loaderPath
 * @type string
 * @default loader/loader-min.js
 */

/**
 * Specifies whether or not YUI().use(...) will attempt to load CSS
 * resources at all.  Any truthy value will cause CSS dependencies
 * to load when fetching script.  The special value 'force' will
 * cause CSS dependencies to be loaded even if no script is needed.
 *
 * @property fetchCSS
 * @type boolean|string
 * @default true
 */

/**
 * The default gallery version to build gallery module urls
 * @property gallery
 * @type string
 * @since 3.1.0
 */

/**
 * The default YUI 2 version to build yui2 module urls.  This is for
 * intrinsic YUI 2 support via the 2in3 project.  Also @see the '2in3'
 * config for pulling different revisions of the wrapped YUI 2
 * modules.
 * @since 3.1.0
 * @property yui2
 * @type string
 * @default 2.8.1
 */

/**
 * The 2in3 project is a deployment of the various versions of YUI 2
 * deployed as first-class YUI 3 modules.  Eventually, the wrapper
 * for the modules will change (but the underlying YUI 2 code will
 * be the same), and you can select a particular version of
 * the wrapper modules via this config.
 * @since 3.1.0
 * @property 2in3
 * @type string
 * @default 1
 */

/**
 * Alternative console log function for use in environments without
 * a supported native console.  The function is executed in the
 * YUI instance context.
 * @since 3.1.0
 * @property logFn
 * @type Function
 */

/**
 * A callback to execute when Y.error is called.  It receives the
 * error message and an javascript error object if Y.error was
 * executed because a javascript error was caught.  The function
 * is executed in the YUI instance context.
 *
 * @since 3.2.0
 * @property errorFn
 * @type Function
 */

/**
 * A callback to execute when the loader fails to load one or
 * more resource.  This could be because of a script load
 * failure.  It can also fail if a javascript module fails
 * to register itself, but only when the 'requireRegistration'
 * is true.  If this function is defined, the use() callback will
 * only be called when the loader succeeds, otherwise it always
 * executes unless there was a javascript error when attaching
 * a module.
 *
 * @since 3.3.0
 * @property loadErrorFn
 * @type Function
 */

/**
 * When set to true, the YUI loader will expect that all modules
 * it is responsible for loading will be first-class YUI modules
 * that register themselves with the YUI global.  If this is
 * set to true, loader will fail if the module registration fails
 * to happen after the script is loaded.
 *
 * @since 3.3.0
 * @property requireRegistration
 * @type boolean
 * @default false
 */

/**
 * Cache serviced use() requests.
 * @since 3.3.0
 * @property cacheUse
 * @type boolean
 * @default true
 */

/**
 * The parameter defaults for the remote loader service.
 * Requires the rls submodule.  The properties that are
 * supported:
 * <pre>
 * m: comma separated list of module requirements.  This
 *    must be the param name even for custom implemetations.
 * v: the version of YUI to load.  Defaults to the version
 *    of YUI that is being used.
 * gv: the version of the gallery to load (@see the gallery config)
 * env: comma separated list of modules already on the page.
 *      this must be the param name even for custom implemetations.
 * lang: the languages supported on the page (@see the lang config)
 * '2in3v':  the version of the 2in3 wrapper to use (@see the 2in3 config).
 * '2v': the version of yui2 to use in the yui 2in3 wrappers
 *       (@see the yui2 config)
 * filt: a filter def to apply to the urls (@see the filter config).
 * filts: a list of custom filters to apply per module
 *        (@see the filters config).
 * unittests: this is a map of conditional module test function id keys
 * with the values of 1 if the test passes, 0 if not.  This must be
 * the name of the querystring param in custom templates.
 *</pre>
 *
 * @since 3.2.0
 * @property rls
 */

/**
 * The base path to the remote loader service
 *
 * @since 3.2.0
 * @property rls_base
 */

/**
 * The template to use for building the querystring portion
 * of the remote loader service url.  The default is determined
 * by the rls config -- each property that has a value will be
 * represented.
 *
 * ex: m={m}&v={v}&env={env}&lang={lang}&filt={filt}&unittests={unittests}
 *
 *
 * @since 3.2.0
 * @property rls_tmpl
 */

/**
 * Configure the instance to use a remote loader service instead of
 * the client loader.
 *
 * @since 3.2.0
 * @property use_rls
 */
YUI.add('yui-base', function(Y) {

/*
 * YUI stub
 * @module yui
 * @submodule yui-base
 */
/**
 * The YUI module contains the components required for building the YUI
 * seed file.  This includes the script loading mechanism, a simple queue,
 * and the core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

/**
 * Provides the language utilites and extensions used by the library
 * @class Lang
 * @static
 */
Y.Lang = Y.Lang || {};

var L = Y.Lang,

ARRAY = 'array',
BOOLEAN = 'boolean',
DATE = 'date',
ERROR = 'error',
FUNCTION = 'function',
NUMBER = 'number',
NULL = 'null',
OBJECT = 'object',
REGEX = 'regexp',
STRING = 'string',
STRING_PROTO = String.prototype,
TOSTRING = Object.prototype.toString,
UNDEFINED = 'undefined',

TYPES = {
    'undefined' : UNDEFINED,
    'number' : NUMBER,
    'boolean' : BOOLEAN,
    'string' : STRING,
    '[object Function]' : FUNCTION,
    '[object RegExp]' : REGEX,
    '[object Array]' : ARRAY,
    '[object Date]' : DATE,
    '[object Error]' : ERROR
},

TRIMREGEX = /^\s+|\s+$/g,
EMPTYSTRING = '',
SUBREGEX = /\{\s*([^\|\}]+?)\s*(?:\|([^\}]*))?\s*\}/g;

/**
 * Determines whether or not the provided item is an array.
 * Returns false for array-like collections such as the
 * function arguments collection or HTMLElement collection
 * will return false.  Use <code>Y.Array.test</code> if you
 * want to test for an array-like collection.
 * @method isArray
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is an array.
 */
// L.isArray = Array.isArray || function(o) {
//     return L.type(o) === ARRAY;
// };

L.isArray = function(o) {
    return L.type(o) === ARRAY;
};

/**
 * Determines whether or not the provided item is a boolean.
 * @method isBoolean
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is a boolean.
 */
L.isBoolean = function(o) {
    return typeof o === BOOLEAN;
};

/**
 * <p>
 * Determines whether or not the provided item is a function.
 * Note: Internet Explorer thinks certain functions are objects:
 * </p>
 *
 * <pre>
 * var obj = document.createElement("object");
 * Y.Lang.isFunction(obj.getAttribute) // reports false in IE
 * &nbsp;
 * var input = document.createElement("input"); // append to body
 * Y.Lang.isFunction(input.focus) // reports false in IE
 * </pre>
 *
 * <p>
 * You will have to implement additional unittests if these functions
 * matter to you.
 * </p>
 *
 * @method isFunction
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is a function.
 */
L.isFunction = function(o) {
    return L.type(o) === FUNCTION;
};

/**
 * Determines whether or not the supplied item is a date instance.
 * @method isDate
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is a date.
 */
L.isDate = function(o) {
    // return o instanceof Date;
    return L.type(o) === DATE && o.toString() !== 'Invalid Date' && !isNaN(o);
};

/**
 * Determines whether or not the provided item is null.
 * @method isNull
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is null.
 */
L.isNull = function(o) {
    return o === null;
};

/**
 * Determines whether or not the provided item is a legal number.
 * @method isNumber
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is a number.
 */
L.isNumber = function(o) {
    return typeof o === NUMBER && isFinite(o);
};

/**
 * Determines whether or not the provided item is of type object
 * or function. Note that arrays are also objects, so
 * <code>Y.Lang.isObject([]) === true</code>.
 * @method isObject
 * @static
 * @param o The object to test.
 * @param failfn {boolean} fail if the input is a function.
 * @return {boolean} true if o is an object.
 */
L.isObject = function(o, failfn) {
    var t = typeof o;
    return (o && (t === OBJECT ||
        (!failfn && (t === FUNCTION || L.isFunction(o))))) || false;
};

/**
 * Determines whether or not the provided item is a string.
 * @method isString
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is a string.
 */
L.isString = function(o) {
    return typeof o === STRING;
};

/**
 * Determines whether or not the provided item is undefined.
 * @method isUndefined
 * @static
 * @param o The object to test.
 * @return {boolean} true if o is undefined.
 */
L.isUndefined = function(o) {
    return typeof o === UNDEFINED;
};

/**
 * Returns a string without any leading or trailing whitespace.  If
 * the input is not a string, the input will be returned untouched.
 * @method trim
 * @static
 * @param s {string} the string to trim.
 * @return {string} the trimmed string.
 */
L.trim = STRING_PROTO.trim ? function(s) {
    return (s && s.trim) ? s.trim() : s;
} : function (s) {
    try {
        return s.replace(TRIMREGEX, EMPTYSTRING);
    } catch (e) {
        return s;
    }
};

/**
 * Returns a string without any leading whitespace.
 * @method trimLeft
 * @static
 * @param s {string} the string to trim.
 * @return {string} the trimmed string.
 */
L.trimLeft = STRING_PROTO.trimLeft ? function (s) {
    return s.trimLeft();
} : function (s) {
    return s.replace(/^\s+/, '');
};

/**
 * Returns a string without any trailing whitespace.
 * @method trimRight
 * @static
 * @param s {string} the string to trim.
 * @return {string} the trimmed string.
 */
L.trimRight = STRING_PROTO.trimRight ? function (s) {
    return s.trimRight();
} : function (s) {
    return s.replace(/\s+$/, '');
};

/**
 * A convenience method for detecting a legitimate non-null value.
 * Returns false for null/undefined/NaN, true for other values,
 * including 0/false/''
 * @method isValue
 * @static
 * @param o The item to test.
 * @return {boolean} true if it is not null/undefined/NaN || false.
 */
L.isValue = function(o) {
    var t = L.type(o);
    switch (t) {
        case NUMBER:
            return isFinite(o);
        case NULL:
        case UNDEFINED:
            return false;
        default:
            return !!(t);
    }
};

/**
 * <p>
 * Returns a string representing the type of the item passed in.
 * </p>
 *
 * <p>
 * Known issues:
 * </p>
 *
 * <ul>
 *   <li>
 *     <code>typeof HTMLElementCollection</code> returns function in Safari, but
 *     <code>Y.type()</code> reports object, which could be a good thing --
 *     but it actually caused the logic in <code>Y.Lang.isObject</code> to fail.
 *   </li>
 * </ul>
 *
 * @method type
 * @param o the item to test.
 * @return {string} the detected type.
 * @static
 */
L.type = function(o) {
    return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? OBJECT : NULL);
};

/**
 * Lightweight version of <code>Y.substitute</code>. Uses the same template
 * structure as <code>Y.substitute</code>, but doesn't support recursion,
 * auto-object coersion, or formats.
 * @method sub
 * @param {string} s String to be modified.
 * @param {object} o Object containing replacement values.
 * @return {string} the substitute result.
 * @static
 * @since 3.2.0
 */
L.sub = function(s, o) {
    return ((s.replace) ? s.replace(SUBREGEX, function(match, key) {
        return (!L.isUndefined(o[key])) ? o[key] : match;
    }) : s);
};

/**
 * Returns the current time in milliseconds.
 * @method now
 * @return {int} the current date
 * @since 3.3.0
 */
L.now = Date.now || function () {
  return new Date().getTime();
};

/**
 * The YUI module contains the components required for building the YUI seed
 * file.  This includes the script loading mechanism, a simple queue, and the
 * core utilities for the library.
 * @module yui
 * @submodule yui-base
 */


var Native = Array.prototype, LENGTH = 'length',

/**
 * Adds the following array utilities to the YUI instance.  Additional
 * array helpers can be found in the collection component.
 * @class Array
 */

/**
 * Y.Array(o) returns an array:
 * - Arrays are return unmodified unless the start position is specified.
 * - "Array-like" collections (@see Array.test) are converted to arrays
 * - For everything else, a new array is created with the input as the sole
 *   item.
 * - The start position is used if the input is or is like an array to return
 *   a subset of the collection.
 *
 *   @todo this will not automatically convert elements that are also
 *   collections such as forms and selects.  Passing true as the third
 *   param will force a conversion.
 *
 * @method ()
 * @static
 *   @param {object} o the item to arrayify.
 *   @param {int} startIdx if an array or array-like, this is the start index.
 *   @param {boolean} arraylike if true, it forces the array-like fork.  This
 *   can be used to avoid multiple Array.test calls.
 *   @return {Array} the resulting array.
 */
YArray = function(o, startIdx, arraylike) {
    var t = (arraylike) ? 2 : YArray.test(o),
        l, a, start = startIdx || 0;

    if (t) {
        // IE errors when trying to slice HTMLElement collections
        try {
            return Native.slice.call(o, start);
        } catch (e) {
            a = [];
            l = o.length;
            for (; start < l; start++) {
                a.push(o[start]);
            }
            return a;
        }
    } else {
        return [o];
    }
};

Y.Array = YArray;

/**
 * Evaluates the input to determine if it is an array, array-like, or
 * something else.  This is used to handle the arguments collection
 * available within functions, and HTMLElement collections
 *
 * @method test
 * @static
 *
 * @todo current implementation (intenionally) will not implicitly
 * handle html elements that are array-like (forms, selects, etc).
 *
 * @param {object} o the object to test.
 *
 * @return {int} a number indicating the results:
 * 0: Not an array or an array-like collection
 * 1: A real array.
 * 2: array-like collection.
 */
YArray.test = function(o) {
    var r = 0;
    if (Y.Lang.isObject(o)) {
        if (Y.Lang.isArray(o)) {
            r = 1;
        } else {
            try {
                // indexed, but no tagName (element) or alert (window),
                // or functions without apply/call (Safari
                // HTMLElementCollection bug).
                if ((LENGTH in o) && !o.tagName && !o.alert && !o.apply) {
                    r = 2;
                }

            } catch (e) {}
        }
    }
    return r;
};

/**
 * Executes the supplied function on each item in the array.
 * @method each
 * @param {Array} a the array to iterate.
 * @param {Function} f the function to execute on each item.  The
 * function receives three arguments: the value, the index, the full array.
 * @param {object} o Optional context object.
 * @static
 * @return {YUI} the YUI instance.
 */
YArray.each = (Native.forEach) ?
    function(a, f, o) {
        Native.forEach.call(a || [], f, o || Y);
        return Y;
    } :
    function(a, f, o) {
        var l = (a && a.length) || 0, i;
        for (i = 0; i < l; i = i + 1) {
            f.call(o || Y, a[i], i, a);
        }
        return Y;
    };

/**
 * Returns an object using the first array as keys, and
 * the second as values.  If the second array is not
 * provided the value is set to true for each.
 * @method hash
 * @static
 * @param {Array} k keyset.
 * @param {Array} v optional valueset.
 * @return {object} the hash.
 */
YArray.hash = function(k, v) {
    var o = {}, l = k.length, vl = v && v.length, i;
    for (i = 0; i < l; i = i + 1) {
        o[k[i]] = (vl && vl > i) ? v[i] : true;
    }

    return o;
};

/**
 * Returns the index of the first item in the array
 * that contains the specified value, -1 if the
 * value isn't found.
 * @method indexOf
 * @static
 * @param {Array} a the array to search.
 * @param {any} val the value to search for.
 * @return {int} the index of the item that contains the value or -1.
 */
YArray.indexOf = (Native.indexOf) ?
    function(a, val) {
        return Native.indexOf.call(a, val);
    } :
    function(a, val) {
        for (var i = 0; i < a.length; i = i + 1) {
            if (a[i] === val) {
                return i;
            }
        }

        return -1;
    };

/**
 * Numeric sort convenience function.
 * Y.ArrayAssert.itemsAreEqual([1,2,3], [3,1,2].sort(Y.Array.numericSort));
 * @method numericSort
 * @static
 * @param {number} a a number.
 * @param {number} b a number.
 */
YArray.numericSort = function(a, b) {
    return (a - b);
};

/**
 * Executes the supplied function on each item in the array.
 * Returning true from the processing function will stop the
 * processing of the remaining items.
 * @method some
 * @param {Array} a the array to iterate.
 * @param {Function} f the function to execute on each item. The function
 * receives three arguments: the value, the index, the full array.
 * @param {object} o Optional context object.
 * @static
 * @return {boolean} true if the function returns true on
 * any of the items in the array.
 */
YArray.some = (Native.some) ?
    function(a, f, o) {
        return Native.some.call(a, f, o);
    } :
    function(a, f, o) {
        var l = a.length, i;
        for (i = 0; i < l; i = i + 1) {
            if (f.call(o, a[i], i, a)) {
                return true;
            }
        }
        return false;
    };

/**
 * The YUI module contains the components required for building the YUI
 * seed file.  This includes the script loading mechanism, a simple queue,
 * and the core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

/**
 * A simple FIFO queue.  Items are added to the Queue with add(1..n items) and
 * removed using next().
 *
 * @class Queue
 * @constructor
 * @param {MIXED} item* 0..n items to seed the queue.
 */
function Queue() {
    this._init();
    this.add.apply(this, arguments);
}

Queue.prototype = {
    /**
     * Initialize the queue
     *
     * @method _init
     * @protected
     */
    _init: function() {
        /**
         * The collection of enqueued items
         *
         * @property _q
         * @type Array
         * @protected
         */
        this._q = [];
    },

    /**
     * Get the next item in the queue. FIFO support
     *
     * @method next
     * @return {MIXED} the next item in the queue.
     */
    next: function() {
        return this._q.shift();
    },

    /**
     * Get the last in the queue. LIFO support.
     *
     * @method last
     * @return {MIXED} the last item in the queue.
     */
    last: function() {
        return this._q.pop();
    },

    /**
     * Add 0..n items to the end of the queue.
     *
     * @method add
     * @param {MIXED} item* 0..n items.
     * @return {object} this queue.
     */
    add: function() {
        this._q.push.apply(this._q, arguments);

        return this;
    },

    /**
     * Returns the current number of queued items.
     *
     * @method size
     * @return {Number} The size.
     */
    size: function() {
        return this._q.length;
    }
};

Y.Queue = Queue;

YUI.Env._loaderQueue = YUI.Env._loaderQueue || new Queue();

/**
 * The YUI module contains the components required for building the YUI
 * seed file.  This includes the script loading mechanism, a simple queue,
 * and the core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

var CACHED_DELIMITER = '__',

/*
 * IE will not enumerate native functions in a derived object even if the
 * function was overridden.  This is a workaround for specific functions
 * we care about on the Object prototype.
 * @property _iefix
 * @for YUI
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @private
 */
_iefix = function(r, s) {
    var fn = s.toString;
    if (Y.Lang.isFunction(fn) && fn != Object.prototype.toString) {
        r.toString = fn;
    }
};


/**
 * Returns a new object containing all of the properties of
 * all the supplied objects.  The properties from later objects
 * will overwrite those in earlier objects.  Passing in a
 * single object will create a shallow copy of it.  For a deep
 * copy, use clone.
 * @method merge
 * @for YUI
 * @param arguments {Object*} the objects to merge.
 * @return {object} the new merged object.
 */
Y.merge = function() {
    var a = arguments, o = {}, i, l = a.length;
    for (i = 0; i < l; i = i + 1) {
        Y.mix(o, a[i], true);
    }
    return o;
};

/**
 * Applies the supplier's properties to the receiver.  By default
 * all prototype and static propertes on the supplier are applied
 * to the corresponding spot on the receiver.  By default all
 * properties are applied, and a property that is already on the
 * reciever will not be overwritten.  The default behavior can
 * be modified by supplying the appropriate parameters.
 *
 * @todo add constants for the modes
 *
 * @method mix
 * @param {Function} r  the object to receive the augmentation.
 * @param {Function} s  the object that supplies the properties to augment.
 * @param ov {boolean} if true, properties already on the receiver
 * will be overwritten if found on the supplier.
 * @param wl {string[]} a whitelist.  If supplied, only properties in
 * this list will be applied to the receiver.
 * @param {int} mode what should be copies, and to where
 *        default(0): object to object
 *        1: prototype to prototype (old augment)
 *        2: prototype to prototype and object props (new augment)
 *        3: prototype to object
 *        4: object to prototype.
 * @param merge {boolean/int} merge objects instead of overwriting/ignoring.
 * A value of 2 will skip array merge
 * Used by Y.aggregate.
 * @return {object} the augmented object.
 */
Y.mix = function(r, s, ov, wl, mode, merge) {

    if (!s || !r) {
        return r || Y;
    }

    if (mode) {
        switch (mode) {
            case 1: // proto to proto
                return Y.mix(r.prototype, s.prototype, ov, wl, 0, merge);
            case 2: // object to object and proto to proto
                Y.mix(r.prototype, s.prototype, ov, wl, 0, merge);
                break; // pass through
            case 3: // proto to static
                return Y.mix(r, s.prototype, ov, wl, 0, merge);
            case 4: // static to proto
                return Y.mix(r.prototype, s, ov, wl, 0, merge);
            default:  // object to object is what happens below
        }
    }

    // Maybe don't even need this wl && wl.length check anymore??
    var i, l, p, type;

    if (wl && wl.length) {
        for (i = 0, l = wl.length; i < l; ++i) {
            p = wl[i];
            type = Y.Lang.type(r[p]);
            if (s.hasOwnProperty(p)) {
                if (merge && type == 'object') {
                    Y.mix(r[p], s[p]);
                } else if (ov || !(p in r)) {
                    r[p] = s[p];
                }
            }
        }
    } else {
        for (i in s) {
            // if (s.hasOwnProperty(i) && !(i in FROZEN)) {
            if (s.hasOwnProperty(i)) {
                // check white list if it was supplied
                // if the receiver has this property, it is an object,
                // and merge is specified, merge the two objects.
                if (merge && Y.Lang.isObject(r[i], true)) {
                    Y.mix(r[i], s[i], ov, wl, 0, true); // recursive
                // otherwise apply the property only if overwrite
                // is specified or the receiver doesn't have one.
                } else if (ov || !(i in r)) {
                    r[i] = s[i];
                }
                // if merge is specified and the receiver is an array,
                // append the array item
                // } else if (arr) {
                    // r.push(s[i]);
                // }
            }
        }

        if (Y.UA.ie) {
            _iefix(r, s);
        }
    }

    return r;
};

/**
 * Returns a wrapper for a function which caches the
 * return value of that function, keyed off of the combined
 * argument values.
 * @method cached
 * @param source {function} the function to memoize.
 * @param cache an optional cache seed.
 * @param refetch if supplied, this value is tested against the cached
 * value.  If the values are equal, the wrapped function is executed again.
 * @return {Function} the wrapped function.
 */
Y.cached = function(source, cache, refetch) {
    cache = cache || {};

    return function(arg1) {

        var k = (arguments.length > 1) ?
            Array.prototype.join.call(arguments, CACHED_DELIMITER) : arg1;

        if (!(k in cache) || (refetch && cache[k] == refetch)) {
            cache[k] = source.apply(source, arguments);
        }

        return cache[k];
    };

};

/**
 * The YUI module contains the components required for building the YUI
 * seed file.  This includes the script loading mechanism, a simple queue,
 * and the core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

/**
 * Adds the following Object utilities to the YUI instance
 * @class Object
 */

/**
 * Y.Object(o) returns a new object based upon the supplied object.
 * @method ()
 * @static
 * @param o the supplier object.
 * @return {Object} the new object.
 */
var F = function() {},

// O = Object.create || function(o) {
//     F.prototype = o;
//     return new F();
// },

O = function(o) {
    F.prototype = o;
    return new F();
},

owns = function(o, k) {
    return o && o.hasOwnProperty && o.hasOwnProperty(k);
    // return Object.prototype.hasOwnProperty.call(o, k);
},

UNDEF,

/**
 * Extracts the keys, values, or size from an object
 *
 * @method _extract
 * @param o the object.
 * @param what what to extract (0: keys, 1: values, 2: size).
 * @return {boolean|Array} the extracted info.
 * @static
 * @private
 */
_extract = function(o, what) {
    var count = (what === 2), out = (count) ? 0 : [], i;

    for (i in o) {
        if (owns(o, i)) {
            if (count) {
                out++;
            } else {
                out.push((what) ? o[i] : i);
            }
        }
    }

    return out;
};

Y.Object = O;

/**
 * Returns an array containing the object's keys
 * @method keys
 * @static
 * @param o an object.
 * @return {string[]} the keys.
 */
// O.keys = Object.keys || function(o) {
//     return _extract(o);
// };

O.keys = function(o) {
    return _extract(o);
};

/**
 * Returns an array containing the object's values
 * @method values
 * @static
 * @param o an object.
 * @return {Array} the values.
 */
// O.values = Object.values || function(o) {
//     return _extract(o, 1);
// };

O.values = function(o) {
    return _extract(o, 1);
};

/**
 * Returns the size of an object
 * @method size
 * @static
 * @param o an object.
 * @return {int} the size.
 */
O.size = Object.size || function(o) {
    return _extract(o, 2);
};

/**
 * Returns true if the object contains a given key
 * @method hasKey
 * @static
 * @param o an object.
 * @param k the key to query.
 * @return {boolean} true if the object contains the key.
 */
O.hasKey = owns;
/**
 * Returns true if the object contains a given value
 * @method hasValue
 * @static
 * @param o an object.
 * @param v the value to query.
 * @return {boolean} true if the object contains the value.
 */
O.hasValue = function(o, v) {
    return (Y.Array.indexOf(O.values(o), v) > -1);
};

/**
 * Determines whether or not the property was added
 * to the object instance.  Returns false if the property is not present
 * in the object, or was inherited from the prototype.
 *
 * @method owns
 * @static
 * @param o {any} The object being testing.
 * @param p {string} the property to look for.
 * @return {boolean} true if the object has the property on the instance.
 */
O.owns = owns;

/**
 * Executes a function on each item. The function
 * receives the value, the key, and the object
 * as parameters (in that order).
 * @method each
 * @static
 * @param o the object to iterate.
 * @param f {Function} the function to execute on each item. The function
 * receives three arguments: the value, the the key, the full object.
 * @param c the execution context.
 * @param proto {boolean} include proto.
 * @return {YUI} the YUI instance.
 */
O.each = function(o, f, c, proto) {
    var s = c || Y, i;

    for (i in o) {
        if (proto || owns(o, i)) {
            f.call(s, o[i], i, o);
        }
    }
    return Y;
};

/**
 * Executes a function on each item, but halts if the
 * function returns true.  The function
 * receives the value, the key, and the object
 * as paramters (in that order).
 * @method some
 * @static
 * @param o the object to iterate.
 * @param f {Function} the function to execute on each item. The function
 * receives three arguments: the value, the the key, the full object.
 * @param c the execution context.
 * @param proto {boolean} include proto.
 * @return {boolean} true if any execution of the function returns true,
 * false otherwise.
 */
O.some = function(o, f, c, proto) {
    var s = c || Y, i;

    for (i in o) {
        if (proto || owns(o, i)) {
            if (f.call(s, o[i], i, o)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Retrieves the sub value at the provided path,
 * from the value object provided.
 *
 * @method getValue
 * @static
 * @param o The object from which to extract the property value.
 * @param path {Array} A path array, specifying the object traversal path
 * from which to obtain the sub value.
 * @return {Any} The value stored in the path, undefined if not found,
 * undefined if the source is not an object.  Returns the source object
 * if an empty path is provided.
 */
O.getValue = function(o, path) {
    if (!Y.Lang.isObject(o)) {
        return UNDEF;
    }

    var i,
        p = Y.Array(path),
        l = p.length;

    for (i = 0; o !== UNDEF && i < l; i++) {
        o = o[p[i]];
    }

    return o;
};

/**
 * Sets the sub-attribute value at the provided path on the
 * value object.  Returns the modified value object, or
 * undefined if the path is invalid.
 *
 * @method setValue
 * @static
 * @param o             The object on which to set the sub value.
 * @param path {Array}  A path array, specifying the object traversal path
 *                      at which to set the sub value.
 * @param val {Any}     The new value for the sub-attribute.
 * @return {Object}     The modified object, with the new sub value set, or
 *                      undefined, if the path was invalid.
 */
O.setValue = function(o, path, val) {
    var i,
        p = Y.Array(path),
        leafIdx = p.length - 1,
        ref = o;

    if (leafIdx >= 0) {
        for (i = 0; ref !== UNDEF && i < leafIdx; i++) {
            ref = ref[p[i]];
        }

        if (ref !== UNDEF) {
            ref[p[i]] = val;
        } else {
            return UNDEF;
        }
    }

    return o;
};

/**
 * Returns true if the object has no properties of its own
 * @method isEmpty
 * @static
 * @return {boolean} true if the object is empty.
 * @since 3.2.0
 */
O.isEmpty = function(o) {
    for (var i in o) {
        if (owns(o, i)) {
            return false;
        }
    }
    return true;
};
/**
 * The YUI module contains the components required for building the YUI seed
 * file.  This includes the script loading mechanism, a simple queue, and the
 * core utilities for the library.
 * @module yui
 * @submodule yui-base
 */

/**
 * YUI user agent detection.
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  UA stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is
 * presented as a float so that it can easily be used for boolean evaluation
 * as well as for looking for a particular range of versions.  Because of this,
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9
 * reports 1.8).
 * @class UA
 * @static
 */
/**
* Static method for parsing the UA string. Defaults to assigning it's value to Y.UA
* @static
* @method Env.parseUA
* @param {String} subUA Parse this UA string instead of navigator.userAgent
* @returns {Object} The Y.UA object
*/
YUI.Env.parseUA = function(subUA) {

    var numberify = function(s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function() {
                return (c++ == 1) ? '' : '.';
            }));
        },

        win = Y.config.win,

        nav = win && win.navigator,

        o = {

        /**
         * Internet Explorer version number or 0.  Example: 6
         * @property ie
         * @type float
         * @static
         */
        ie: 0,

        /**
         * Opera version number or 0.  Example: 9.2
         * @property opera
         * @type float
         * @static
         */
        opera: 0,

        /**
         * Gecko engine revision number.  Will evaluate to 1 if Gecko
         * is detected but the revision could not be found. Other browsers
         * will be 0.  Example: 1.8
         * <pre>
         * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
         * Firefox 1.5.0.9: 1.8.0.9 <-- 1.8
         * Firefox 2.0.0.3: 1.8.1.3 <-- 1.81
         * Firefox 3.0   <-- 1.9
         * Firefox 3.5   <-- 1.91
         * </pre>
         * @property gecko
         * @type float
         * @static
         */
        gecko: 0,

        /**
         * AppleWebKit version.  KHTML browsers that are not WebKit browsers
         * will evaluate to 1, other browsers 0.  Example: 418.9
         * <pre>
         * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the
         *                                   latest available for Mac OSX 10.3.
         * Safari 2.0.2:         416     <-- hasOwnProperty introduced
         * Safari 2.0.4:         418     <-- preventDefault fixed
         * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
         *                                   different versions of webkit
         * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
         *                                   updated, but not updated
         *                                   to the latest patch.
         * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native
         * SVG and many major issues fixed).
         * Safari 3.0.4 (523.12) 523.12  <-- First Tiger release - automatic
         * update from 2.x via the 10.4.11 OS patch.
         * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
         *                                   yahoo.com user agent hack removed.
         * </pre>
         * http://en.wikipedia.org/wiki/Safari_version_history
         * @property webkit
         * @type float
         * @static
         */
        webkit: 0,

        /**
         * Chrome will be detected as webkit, but this property will also
         * be populated with the Chrome version number
         * @property chrome
         * @type float
         * @static
         */
        chrome: 0,

        /**
         * The mobile property will be set to a string containing any relevant
         * user agent information when a modern mobile browser is detected.
         * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
         * devices with the WebKit-based browser, and Opera Mini.
         * @property mobile
         * @type string
         * @static
         */
        mobile: null,

        /**
         * Adobe AIR version number or 0.  Only populated if webkit is detected.
         * Example: 1.0
         * @property air
         * @type float
         */
        air: 0,
        /**
         * Detects Apple iPad's OS version
         * @property ipad
         * @type float
         * @static
         */
        ipad: 0,
        /**
         * Detects Apple iPhone's OS version
         * @property iphone
         * @type float
         * @static
         */
        iphone: 0,
        /**
         * Detects Apples iPod's OS version
         * @property ipod
         * @type float
         * @static
         */
        ipod: 0,
        /**
         * General truthy check for iPad, iPhone or iPod
         * @property ios
         * @type float
         * @static
         */
        ios: null,
        /**
         * Detects Googles Android OS version
         * @property android
         * @type float
         * @static
         */
        android: 0,
        /**
         * Detects Palms WebOS version
         * @property webos
         * @type float
         * @static
         */
        webos: 0,

        /**
         * Google Caja version number or 0.
         * @property caja
         * @type float
         */
        caja: nav && nav.cajaVersion,

        /**
         * Set to true if the page appears to be in SSL
         * @property secure
         * @type boolean
         * @static
         */
        secure: false,

        /**
         * The operating system.  Currently only detecting windows or macintosh
         * @property os
         * @type string
         * @static
         */
        os: null

    },

    ua = subUA || nav && nav.userAgent,

    loc = win && win.location,

    href = loc && loc.href,

    m;

    o.secure = href && (href.toLowerCase().indexOf('https') === 0);

    if (ua) {

        if ((/windows|win32/i).test(ua)) {
            o.os = 'windows';
        } else if ((/macintosh/i).test(ua)) {
            o.os = 'macintosh';
        } else if ((/rhino/i).test(ua)) {
            o.os = 'rhino';
        }

        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            o.webkit = 1;
        }
        // Modern WebKit browsers are at least X-Grade
        m = ua.match(/AppleWebKit\/([^\s]*)/);
        if (m && m[1]) {
            o.webkit = numberify(m[1]);

            // Mobile browser check
            if (/ Mobile\//.test(ua)) {
                o.mobile = 'Apple'; // iPhone or iPod Touch

                m = ua.match(/OS ([^\s]*)/);
                if (m && m[1]) {
                    m = numberify(m[1].replace('_', '.'));
                }
                o.ios = m;
                o.ipad = o.ipod = o.iphone = 0;

                m = ua.match(/iPad|iPod|iPhone/);
                if (m && m[0]) {
                    o[m[0].toLowerCase()] = o.ios;
                }
            } else {
                m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
                if (m) {
                    // Nokia N-series, Android, webOS, ex: NokiaN95
                    o.mobile = m[0];
                }
                if (/webOS/.test(ua)) {
                    o.mobile = 'WebOS';
                    m = ua.match(/webOS\/([^\s]*);/);
                    if (m && m[1]) {
                        o.webos = numberify(m[1]);
                    }
                }
                if (/ Android/.test(ua)) {
                    o.mobile = 'Android';
                    m = ua.match(/Android ([^\s]*);/);
                    if (m && m[1]) {
                        o.android = numberify(m[1]);
                    }

                }
            }

            m = ua.match(/Chrome\/([^\s]*)/);
            if (m && m[1]) {
                o.chrome = numberify(m[1]); // Chrome
            } else {
                m = ua.match(/AdobeAIR\/([^\s]*)/);
                if (m) {
                    o.air = m[0]; // Adobe AIR 1.0 or better
                }
            }
        }

        if (!o.webkit) { // not webkit
// @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            m = ua.match(/Opera[\s\/]([^\s]*)/);
            if (m && m[1]) {
                o.opera = numberify(m[1]);
                m = ua.match(/Opera Mini[^;]*/);
                if (m) {
                    o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m = ua.match(/MSIE\s([^;]*)/);
                if (m && m[1]) {
                    o.ie = numberify(m[1]);
                } else { // not opera, webkit, or ie
                    m = ua.match(/Gecko\/([^\s]*)/);
                    if (m) {
                        o.gecko = 1; // Gecko detected, look for revision
                        m = ua.match(/rv:([^\s\)]*)/);
                        if (m && m[1]) {
                            o.gecko = numberify(m[1]);
                        }
                    }
                }
            }
        }
    }

    YUI.Env.UA = o;

    return o;
};


Y.UA = YUI.Env.UA || YUI.Env.parseUA();


}, '3.3.0' );
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('oop', function(Y) {

/**
 * Supplies object inheritance and manipulation utilities.  This adds
 * additional functionaity to what is provided in yui-base, and the
 * methods are applied directly to the YUI instance.  This module
 * is required for most YUI components.
 * @module oop
 */

/**
 * The following methods are added to the YUI instance
 * @class YUI~oop
 */

    var L = Y.Lang,
        A = Y.Array,
        OP = Object.prototype,
        CLONE_MARKER = '_~yuim~_',
        EACH = 'each',
        SOME = 'some',

        dispatch = function(o, f, c, proto, action) {
            if (o && o[action] && o !== Y) {
                return o[action].call(o, f, c);
            } else {
                switch (A.test(o)) {
                    case 1:
                        return A[action](o, f, c);
                    case 2:
                        return A[action](Y.Array(o, 0, true), f, c);
                    default:
                        return Y.Object[action](o, f, c, proto);
                }
            }
        };


    /**
     * Applies prototype properties from the supplier to the receiver.
     * The receiver can be a constructor or an instance.
     * @method augment
     * @param {function} r  the object to receive the augmentation.
     * @param {function} s  the object that supplies the properties to augment.
     * @param {boolean} ov if true, properties already on the receiver
     * will be overwritten if found on the supplier.
     * @param {string[]} wl  a whitelist.  If supplied, only properties in
     * this list will be applied to the receiver.
     * @param {Array | Any} args arg or arguments to apply to the supplier
     * constructor when initializing.
     * @return {object} the augmented object.
     *
     * @todo constructor optional?
     * @todo understanding what an instance is augmented with
     * @todo best practices for overriding sequestered methods.
     */
    Y.augment = function(r, s, ov, wl, args) {
        var sProto = s.prototype,
            newProto = null,
            construct = s,
            a = (args) ? Y.Array(args) : [],
            rProto = r.prototype,
            target = rProto || r,
            applyConstructor = false,
            sequestered, replacements;

        // working on a class, so apply constructor infrastructure
        if (rProto && construct) {
            sequestered = {};
            replacements = {};
            newProto = {};

            // sequester all of the functions in the supplier and replace with
            // one that will restore all of them.
            Y.Object.each(sProto, function(v, k) {
                replacements[k] = function() {

            // overwrite the prototype with all of the sequestered functions,
            // but only if it hasn't been overridden
                        for (var i in sequestered) {
                        if (sequestered.hasOwnProperty(i) &&
                                (this[i] === replacements[i])) {
                            this[i] = sequestered[i];
                        }
                    }

                    // apply the constructor
                    construct.apply(this, a);

                    // apply the original sequestered function
                    return sequestered[k].apply(this, arguments);
                };

                if ((!wl || (k in wl)) && (ov || !(k in this))) {
                    if (L.isFunction(v)) {
                        // sequester the function
                        sequestered[k] = v;

// replace the sequestered function with a function that will
// restore all sequestered functions and exectue the constructor.
                        this[k] = replacements[k];
                    } else {
                        this[k] = v;
                    }
                }

            }, newProto, true);

        // augmenting an instance, so apply the constructor immediately
        } else {
            applyConstructor = true;
        }

        Y.mix(target, newProto || sProto, ov, wl);

        if (applyConstructor) {
            s.apply(target, a);
        }

        return r;
    };

    /**
     * Applies object properties from the supplier to the receiver.  If
     * the target has the property, and the property is an object, the target
     * object will be augmented with the supplier's value.  If the property
     * is an array, the suppliers value will be appended to the target.
     * @method aggregate
     * @param {function} r  the object to receive the augmentation.
     * @param {function} s  the object that supplies the properties to augment.
     * @param {boolean} ov if true, properties already on the receiver
     * will be overwritten if found on the supplier.
     * @param {string[]} wl a whitelist.  If supplied, only properties in
     * this list will be applied to the receiver.
     * @return {object} the extended object.
     */
    Y.aggregate = function(r, s, ov, wl) {
        return Y.mix(r, s, ov, wl, 0, true);
    };

    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @param {function} r   the object to modify.
     * @param {function} s the object to inherit.
     * @param {object} px prototype properties to add/override.
     * @param {object} sx static properties to add/override.
     * @return {object} the extended object.
     */
    Y.extend = function(r, s, px, sx) {
        if (!s || !r) {
            Y.error('extend failed, verify dependencies');
        }

        var sp = s.prototype, rp = Y.Object(sp);
        r.prototype = rp;

        rp.constructor = r;
        r.superclass = sp;

        // assign constructor property
        if (s != Object && sp.constructor == OP.constructor) {
            sp.constructor = s;
        }

        // add prototype overrides
        if (px) {
            Y.mix(rp, px, true);
        }

        // add object overrides
        if (sx) {
            Y.mix(r, sx, true);
        }

        return r;
    };

    /**
     * Executes the supplied function for each item in
     * a collection.  Supports arrays, objects, and
     * Y.NodeLists
     * @method each
     * @param {object} o the object to iterate.
     * @param {function} f the function to execute.  This function
     * receives the value, key, and object as parameters.
     * @param {object} c the execution context for the function.
     * @param {boolean} proto if true, prototype properties are
     * iterated on objects.
     * @return {YUI} the YUI instance.
     */
    Y.each = function(o, f, c, proto) {
        return dispatch(o, f, c, proto, EACH);
    };

    /**
     * Executes the supplied function for each item in
     * a collection.  The operation stops if the function
     * returns true. Supports arrays, objects, and
     * Y.NodeLists.
     * @method some
     * @param {object} o the object to iterate.
     * @param {function} f the function to execute.  This function
     * receives the value, key, and object as parameters.
     * @param {object} c the execution context for the function.
     * @param {boolean} proto if true, prototype properties are
     * iterated on objects.
     * @return {boolean} true if the function ever returns true,
     * false otherwise.
     */
    Y.some = function(o, f, c, proto) {
        return dispatch(o, f, c, proto, SOME);
    };

    /**
     * Deep obj/array copy.  Function clones are actually
     * wrappers around the original function.
     * Array-like objects are treated as arrays.
     * Primitives are returned untouched.  Optionally, a
     * function can be provided to handle other data types,
     * filter keys, validate values, etc.
     *
     * @method clone
     * @param {object} o what to clone.
     * @param {boolean} safe if true, objects will not have prototype
     * items from the source.  If false, they will.  In this case, the
     * original is initially protected, but the clone is not completely
     * immune from changes to the source object prototype.  Also, cloned
     * prototype items that are deleted from the clone will result
     * in the value of the source prototype being exposed.  If operating
     * on a non-safe clone, items should be nulled out rather than deleted.
     * @param {function} f optional function to apply to each item in a
     * collection; it will be executed prior to applying the value to
     * the new object.  Return false to prevent the copy.
     * @param {object} c optional execution context for f.
     * @param {object} owner Owner object passed when clone is iterating
     * an object.  Used to set up context for cloned functions.
     * @param {object} cloned hash of previously cloned objects to avoid
     * multiple clones.
     * @return {Array|Object} the cloned object.
     */
    Y.clone = function(o, safe, f, c, owner, cloned) {

        if (!L.isObject(o)) {
            return o;
        }

        // @todo cloning YUI instances doesn't currently work
        if (Y.instanceOf(o, YUI)) {
            return o;
        }

        var o2, marked = cloned || {}, stamp,
            yeach = Y.each;

        switch (L.type(o)) {
            case 'date':
                return new Date(o);
            case 'regexp':
                // if we do this we need to set the flags too
                // return new RegExp(o.source);
                return o;
            case 'function':
                // o2 = Y.bind(o, owner);
                // break;
                return o;
            case 'array':
                o2 = [];
                break;
            default:

                // #2528250 only one clone of a given object should be created.
                if (o[CLONE_MARKER]) {
                    return marked[o[CLONE_MARKER]];
                }

                stamp = Y.guid();

                o2 = (safe) ? {} : Y.Object(o);

                o[CLONE_MARKER] = stamp;
                marked[stamp] = o;
        }

        // #2528250 don't try to clone element properties
        if (!o.addEventListener && !o.attachEvent) {
            yeach(o, function(v, k) {
if ((k || k === 0) && (!f || (f.call(c || this, v, k, this, o) !== false))) {
                    if (k !== CLONE_MARKER) {
                        if (k == 'prototype') {
                            // skip the prototype
                        // } else if (o[k] === o) {
                        //     this[k] = this;
                        } else {
                            this[k] =
                                Y.clone(v, safe, f, c, owner || o, marked);
                        }
                    }
                }
            }, o2);
        }

        if (!cloned) {
            Y.Object.each(marked, function(v, k) {
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        v[CLONE_MARKER] = null;
                    }
                }
            }, this);
            marked = null;
        }

        return o2;
    };


    /**
     * Returns a function that will execute the supplied function in the
     * supplied object's context, optionally adding any additional
     * supplied parameters to the beginning of the arguments collection the
     * supplied to the function.
     *
     * @method bind
     * @param {Function|String} f the function to bind, or a function name
     * to execute on the context object.
     * @param {object} c the execution context.
     * @param {any} args* 0..n arguments to include before the arguments the
     * function is executed with.
     * @return {function} the wrapped function.
     */
    Y.bind = function(f, c) {
        var xargs = arguments.length > 2 ?
                Y.Array(arguments, 2, true) : null;
        return function() {
            var fn = L.isString(f) ? c[f] : f,
                args = (xargs) ?
                    xargs.concat(Y.Array(arguments, 0, true)) : arguments;
            return fn.apply(c || fn, args);
        };
    };

    /**
     * Returns a function that will execute the supplied function in the
     * supplied object's context, optionally adding any additional
     * supplied parameters to the end of the arguments the function
     * is executed with.
     *
     * @method rbind
     * @param {Function|String} f the function to bind, or a function name
     * to execute on the context object.
     * @param {object} c the execution context.
     * @param {any} args* 0..n arguments to append to the end of
     * arguments collection supplied to the function.
     * @return {function} the wrapped function.
     */
    Y.rbind = function(f, c) {
        var xargs = arguments.length > 2 ? Y.Array(arguments, 2, true) : null;
        return function() {
            var fn = L.isString(f) ? c[f] : f,
                args = (xargs) ?
                    Y.Array(arguments, 0, true).concat(xargs) : arguments;
            return fn.apply(c || fn, args);
        };
    };



}, '3.3.0' );
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('event-custom-base', function(Y) {

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 */

Y.Env.evt = {
    handles: {},
    plugins: {}
};


/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */

/**
 * Allows for the insertion of methods that are executed before or after
 * a specified method
 * @class Do
 * @static
 */

var DO_BEFORE = 0,
    DO_AFTER = 1,

DO = {

    /**
     * Cache of objects touched by the utility
     * @property objs
     * @static
     */
    objs: {},

    /**
     * Execute the supplied method before the specified function
     * @method before
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {string} handle for the subscription
     * @static
     */
    before: function(fn, obj, sFn, c) {
        var f = fn, a;
        if (c) {
            a = [fn, c].concat(Y.Array(arguments, 4, true));
            f = Y.rbind.apply(Y, a);
        }

        return this._inject(DO_BEFORE, f, obj, sFn);
    },

    /**
     * Execute the supplied method after the specified function
     * @method after
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * @return {string} handle for the subscription
     * @static
     */
    after: function(fn, obj, sFn, c) {
        var f = fn, a;
        if (c) {
            a = [fn, c].concat(Y.Array(arguments, 4, true));
            f = Y.rbind.apply(Y, a);
        }

        return this._inject(DO_AFTER, f, obj, sFn);
    },

    /**
     * Execute the supplied method after the specified function
     * @method _inject
     * @param when {string} before or after
     * @param fn {Function} the function to execute
     * @param obj the object hosting the method to displace
     * @param sFn {string} the name of the method to displace
     * @param c The execution context for fn
     * @return {string} handle for the subscription
     * @private
     * @static
     */
    _inject: function(when, fn, obj, sFn) {

        // object id
        var id = Y.stamp(obj), o, sid;

        if (! this.objs[id]) {
            // create a map entry for the obj if it doesn't exist
            this.objs[id] = {};
        }

        o = this.objs[id];

        if (! o[sFn]) {
            // create a map entry for the method if it doesn't exist
            o[sFn] = new Y.Do.Method(obj, sFn);

            // re-route the method to our wrapper
            obj[sFn] =
                function() {
                    return o[sFn].exec.apply(o[sFn], arguments);
                };
        }

        // subscriber id
        sid = id + Y.stamp(fn) + sFn;

        // register the callback
        o[sFn].register(sid, fn, when);

        return new Y.EventHandle(o[sFn], sid);

    },

    /**
     * Detach a before or after subscription
     * @method detach
     * @param handle {string} the subscription handle
     */
    detach: function(handle) {

        if (handle.detach) {
            handle.detach();
        }

    },

    _unload: function(e, me) {

    }
};

Y.Do = DO;

//////////////////////////////////////////////////////////////////////////

/**
 * Contains the return value from the wrapped method, accessible
 * by 'after' event listeners.
 *
 * @property Do.originalRetVal
 * @static
 * @since 2.3.0
 */

/**
 * Contains the current state of the return value, consumable by
 * 'after' event listeners, and updated if an after subscriber
 * changes the return value generated by the wrapped function.
 *
 * @property Do.currentRetVal
 * @static
 * @since 2.3.0
 */

//////////////////////////////////////////////////////////////////////////

/**
 * Wrapper for a displaced method with aop enabled
 * @class Do.Method
 * @constructor
 * @param obj The object to operate on
 * @param sFn The name of the method to displace
 */
DO.Method = function(obj, sFn) {
    this.obj = obj;
    this.methodName = sFn;
    this.method = obj[sFn];
    this.before = {};
    this.after = {};
};

/**
 * Register a aop subscriber
 * @method register
 * @param sid {string} the subscriber id
 * @param fn {Function} the function to execute
 * @param when {string} when to execute the function
 */
DO.Method.prototype.register = function (sid, fn, when) {
    if (when) {
        this.after[sid] = fn;
    } else {
        this.before[sid] = fn;
    }
};

/**
 * Unregister a aop subscriber
 * @method delete
 * @param sid {string} the subscriber id
 * @param fn {Function} the function to execute
 * @param when {string} when to execute the function
 */
DO.Method.prototype._delete = function (sid) {
    delete this.before[sid];
    delete this.after[sid];
};

/**
 * Execute the wrapped method
 * @method exec
 */
DO.Method.prototype.exec = function () {

    var args = Y.Array(arguments, 0, true),
        i, ret, newRet,
        bf = this.before,
        af = this.after,
        prevented = false;

    // execute before
    for (i in bf) {
        if (bf.hasOwnProperty(i)) {
            ret = bf[i].apply(this.obj, args);
            if (ret) {
                switch (ret.constructor) {
                    case DO.Halt:
                        return ret.retVal;
                    case DO.AlterArgs:
                        args = ret.newArgs;
                        break;
                    case DO.Prevent:
                        prevented = true;
                        break;
                    default:
                }
            }
        }
    }

    // execute method
    if (!prevented) {
        ret = this.method.apply(this.obj, args);
    }

    DO.originalRetVal = ret;
    DO.currentRetVal = ret;

    // execute after methods.
    for (i in af) {
        if (af.hasOwnProperty(i)) {
            newRet = af[i].apply(this.obj, args);
            // Stop processing if a Halt object is returned
            if (newRet && newRet.constructor == DO.Halt) {
                return newRet.retVal;
            // Check for a new return value
            } else if (newRet && newRet.constructor == DO.AlterReturn) {
                ret = newRet.newRetVal;
                // Update the static retval state
                DO.currentRetVal = ret;
            }
        }
    }

    return ret;
};

//////////////////////////////////////////////////////////////////////////

/**
 * Return an AlterArgs object when you want to change the arguments that
 * were passed into the function.  An example would be a service that scrubs
 * out illegal characters prior to executing the core business logic.
 * @class Do.AlterArgs
 */
DO.AlterArgs = function(msg, newArgs) {
    this.msg = msg;
    this.newArgs = newArgs;
};

/**
 * Return an AlterReturn object when you want to change the result returned
 * from the core method to the caller
 * @class Do.AlterReturn
 */
DO.AlterReturn = function(msg, newRetVal) {
    this.msg = msg;
    this.newRetVal = newRetVal;
};

/**
 * Return a Halt object when you want to terminate the execution
 * of all subsequent subscribers as well as the wrapped method
 * if it has not exectued yet.
 * @class Do.Halt
 */
DO.Halt = function(msg, retVal) {
    this.msg = msg;
    this.retVal = retVal;
};

/**
 * Return a Prevent object when you want to prevent the wrapped function
 * from executing, but want the remaining listeners to execute
 * @class Do.Prevent
 */
DO.Prevent = function(msg) {
    this.msg = msg;
};

/**
 * Return an Error object when you want to terminate the execution
 * of all subsequent method calls.
 * @class Do.Error
 * @deprecated use Y.Do.Halt or Y.Do.Prevent
 */
DO.Error = DO.Halt;


//////////////////////////////////////////////////////////////////////////

// Y["Event"] && Y.Event.addListener(window, "unload", Y.Do._unload, Y.Do);


/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */


// var onsubscribeType = "_event:onsub",
var AFTER = 'after',
    CONFIGS = [
        'broadcast',
        'monitored',
        'bubbles',
        'context',
        'contextFn',
        'currentTarget',
        'defaultFn',
        'defaultTargetOnly',
        'details',
        'emitFacade',
        'fireOnce',
        'async',
        'host',
        'preventable',
        'preventedFn',
        'queuable',
        'silent',
        'stoppedFn',
        'target',
        'type'
    ],

    YUI3_SIGNATURE = 9,
    YUI_LOG = 'yui:log';

/**
 * Return value from all subscribe operations
 * @class EventHandle
 * @constructor
 * @param {CustomEvent} evt the custom event.
 * @param {Subscriber} sub the subscriber.
 */
Y.EventHandle = function(evt, sub) {

    /**
     * The custom event
     * @type CustomEvent
     */
    this.evt = evt;

    /**
     * The subscriber object
     * @type Subscriber
     */
    this.sub = sub;
};

Y.EventHandle.prototype = {
    batch: function(f, c) {
        f.call(c || this, this);
        if (Y.Lang.isArray(this.evt)) {
            Y.Array.each(this.evt, function(h) {
                h.batch.call(c || h, f);
            });
        }
    },

    /**
     * Detaches this subscriber
     * @method detach
     * @return {int} the number of detached listeners
     */
    detach: function() {
        var evt = this.evt, detached = 0, i;
        if (evt) {
            if (Y.Lang.isArray(evt)) {
                for (i = 0; i < evt.length; i++) {
                    detached += evt[i].detach();
                }
            } else {
                evt._delete(this.sub);
                detached = 1;
            }

        }

        return detached;
    },

    /**
     * Monitor the event state for the subscribed event.  The first parameter
     * is what should be monitored, the rest are the normal parameters when
     * subscribing to an event.
     * @method monitor
     * @param what {string} what to monitor ('attach', 'detach', 'publish').
     * @return {EventHandle} return value from the monitor event subscription.
     */
    monitor: function(what) {
        return this.evt.monitor.apply(this.evt, arguments);
    }
};

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String} type The type of event, which is passed to the callback
 * when the event fires.
 * @param {object} o configuration object.
 * @class CustomEvent
 * @constructor
 */
Y.CustomEvent = function(type, o) {

    // if (arguments.length > 2) {
// this.log('CustomEvent context and silent are now in the config', 'warn', 'Event');
    // }

    o = o || {};

    this.id = Y.stamp(this);

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The context the the event will fire from by default.  Defaults to the YUI
     * instance.
     * @property context
     * @type object
     */
    this.context = Y;

    /**
     * Monitor when an event is attached or detached.
     *
     * @property monitored
     * @type boolean
     */
    // this.monitored = false;

    this.logSystem = (type == YUI_LOG);

    /**
     * If 0, this event does not broadcast.  If 1, the YUI instance is notified
     * every time this event fires.  If 2, the YUI instance and the YUI global
     * (if event is enabled on the global) are notified every time this event
     * fires.
     * @property broadcast
     * @type int
     */
    // this.broadcast = 0;

    /**
     * By default all custom events are logged in the debug build, set silent
     * to true to disable debug outpu for this event.
     * @property silent
     * @type boolean
     */
    this.silent = this.logSystem;

    /**
     * Specifies whether this event should be queued when the host is actively
     * processing an event.  This will effect exectution order of the callbacks
     * for the various events.
     * @property queuable
     * @type boolean
     * @default false
     */
    // this.queuable = false;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber {}
     */
    this.subscribers = {};

    /**
     * 'After' subscribers
     * @property afters
     * @type Subscriber {}
     */
    this.afters = {};

    /**
     * This event has fired if true
     *
     * @property fired
     * @type boolean
     * @default false;
     */
    // this.fired = false;

    /**
     * An array containing the arguments the custom event
     * was last fired with.
     * @property firedWith
     * @type Array
     */
    // this.firedWith;

    /**
     * This event should only fire one time if true, and if
     * it has fired, any new subscribers should be notified
     * immediately.
     *
     * @property fireOnce
     * @type boolean
     * @default false;
     */
    // this.fireOnce = false;

    /**
     * fireOnce listeners will fire syncronously unless async
     * is set to true
     * @property async
     * @type boolean
     * @default false
     */
    //this.async = false;

    /**
     * Flag for stopPropagation that is modified during fire()
     * 1 means to stop propagation to bubble targets.  2 means
     * to also stop additional subscribers on this target.
     * @property stopped
     * @type int
     */
    // this.stopped = 0;

    /**
     * Flag for preventDefault that is modified during fire().
     * if it is not 0, the default behavior for this event
     * @property prevented
     * @type int
     */
    // this.prevented = 0;

    /**
     * Specifies the host for this custom event.  This is used
     * to enable event bubbling
     * @property host
     * @type EventTarget
     */
    // this.host = null;

    /**
     * The default function to execute after event listeners
     * have fire, but only if the default action was not
     * prevented.
     * @property defaultFn
     * @type Function
     */
    // this.defaultFn = null;

    /**
     * The function to execute if a subscriber calls
     * stopPropagation or stopImmediatePropagation
     * @property stoppedFn
     * @type Function
     */
    // this.stoppedFn = null;

    /**
     * The function to execute if a subscriber calls
     * preventDefault
     * @property preventedFn
     * @type Function
     */
    // this.preventedFn = null;

    /**
     * Specifies whether or not this event's default function
     * can be cancelled by a subscriber by executing preventDefault()
     * on the event facade
     * @property preventable
     * @type boolean
     * @default true
     */
    this.preventable = true;

    /**
     * Specifies whether or not a subscriber can stop the event propagation
     * via stopPropagation(), stopImmediatePropagation(), or halt()
     *
     * Events can only bubble if emitFacade is true.
     *
     * @property bubbles
     * @type boolean
     * @default true
     */
    this.bubbles = true;

    /**
     * Supports multiple options for listener signatures in order to
     * port YUI 2 apps.
     * @property signature
     * @type int
     * @default 9
     */
    this.signature = YUI3_SIGNATURE;

    this.subCount = 0;
    this.afterCount = 0;

    // this.hasSubscribers = false;

    // this.hasAfters = false;

    /**
     * If set to true, the custom event will deliver an EventFacade object
     * that is similar to a DOM event object.
     * @property emitFacade
     * @type boolean
     * @default false
     */
    // this.emitFacade = false;

    this.applyConfig(o, true);

    // this.log("Creating " + this.type);

};

Y.CustomEvent.prototype = {

    hasSubs: function(when) {
        var s = this.subCount, a = this.afterCount, sib = this.sibling;

        if (sib) {
            s += sib.subCount;
            a += sib.afterCount;
        }

        if (when) {
            return (when == 'after') ? a : s;
        }

        return (s + a);
    },

    /**
     * Monitor the event state for the subscribed event.  The first parameter
     * is what should be monitored, the rest are the normal parameters when
     * subscribing to an event.
     * @method monitor
     * @param what {string} what to monitor ('detach', 'attach', 'publish').
     * @return {EventHandle} return value from the monitor event subscription.
     */
    monitor: function(what) {
        this.monitored = true;
        var type = this.id + '|' + this.type + '_' + what,
            args = Y.Array(arguments, 0, true);
        args[0] = type;
        return this.host.on.apply(this.host, args);
    },

    /**
     * Get all of the subscribers to this event and any sibling event
     * @method getSubs
     * @return {Array} first item is the on subscribers, second the after.
     */
    getSubs: function() {
        var s = Y.merge(this.subscribers), a = Y.merge(this.afters), sib = this.sibling;

        if (sib) {
            Y.mix(s, sib.subscribers);
            Y.mix(a, sib.afters);
        }

        return [s, a];
    },

    /**
     * Apply configuration properties.  Only applies the CONFIG whitelist
     * @method applyConfig
     * @param o hash of properties to apply.
     * @param force {boolean} if true, properties that exist on the event
     * will be overwritten.
     */
    applyConfig: function(o, force) {
        if (o) {
            Y.mix(this, o, force, CONFIGS);
        }
    },

    _on: function(fn, context, args, when) {

        if (!fn) {
            this.log('Invalid callback for CE: ' + this.type);
        }

        var s = new Y.Subscriber(fn, context, args, when);

        if (this.fireOnce && this.fired) {
            if (this.async) {
                setTimeout(Y.bind(this._notify, this, s, this.firedWith), 0);
            } else {
                this._notify(s, this.firedWith);
            }
        }

        if (when == AFTER) {
            this.afters[s.id] = s;
            this.afterCount++;
        } else {
            this.subscribers[s.id] = s;
            this.subCount++;
        }

        return new Y.EventHandle(this, s);

    },

    /**
     * Listen for this event
     * @method subscribe
     * @param {Function} fn The function to execute.
     * @return {EventHandle} Unsubscribe handle.
     * @deprecated use on.
     */
    subscribe: function(fn, context) {
        var a = (arguments.length > 2) ? Y.Array(arguments, 2, true) : null;
        return this._on(fn, context, a, true);
    },

    /**
     * Listen for this event
     * @method on
     * @param {Function} fn The function to execute.
     * @param {object} context optional execution context.
     * @param {mixed} arg* 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {EventHandle} An object with a detach method to detch the handler(s).
     */
    on: function(fn, context) {
        var a = (arguments.length > 2) ? Y.Array(arguments, 2, true) : null;
        if (this.host) {
            this.host._monitor('attach', this.type, {
                args: arguments
            });
        }
        return this._on(fn, context, a, true);
    },

    /**
     * Listen for this event after the normal subscribers have been notified and
     * the default behavior has been applied.  If a normal subscriber prevents the
     * default behavior, it also prevents after listeners from firing.
     * @method after
     * @param {Function} fn The function to execute.
     * @param {object} context optional execution context.
     * @param {mixed} arg* 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {EventHandle} handle Unsubscribe handle.
     */
    after: function(fn, context) {
        var a = (arguments.length > 2) ? Y.Array(arguments, 2, true) : null;
        return this._on(fn, context, a, AFTER);
    },

    /**
     * Detach listeners.
     * @method detach
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed.
     * @param {Object}   context The context object passed to subscribe.
     * @return {int} returns the number of subscribers unsubscribed.
     */
    detach: function(fn, context) {
        // unsubscribe handle
        if (fn && fn.detach) {
            return fn.detach();
        }

        var i, s,
            found = 0,
            subs = Y.merge(this.subscribers, this.afters);

        for (i in subs) {
            if (subs.hasOwnProperty(i)) {
                s = subs[i];
                if (s && (!fn || fn === s.fn)) {
                    this._delete(s);
                    found++;
                }
            }
        }

        return found;
    },

    /**
     * Detach listeners.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed.
     * @param {Object}   context The context object passed to subscribe.
     * @return {int|undefined} returns the number of subscribers unsubscribed.
     * @deprecated use detach.
     */
    unsubscribe: function() {
        return this.detach.apply(this, arguments);
    },

    /**
     * Notify a single subscriber
     * @method _notify
     * @param {Subscriber} s the subscriber.
     * @param {Array} args the arguments array to apply to the listener.
     * @private
     */
    _notify: function(s, args, ef) {

        this.log(this.type + '->' + 'sub: ' + s.id);

        var ret;

        ret = s.notify(args, this);

        if (false === ret || this.stopped > 1) {
            this.log(this.type + ' cancelled by subscriber');
            return false;
        }

        return true;
    },

    /**
     * Logger abstraction to centralize the application of the silent flag
     * @method log
     * @param {string} msg message to log.
     * @param {string} cat log category.
     */
    log: function(msg, cat) {
        if (!this.silent) {
        }
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the context specified when the event was created, and with the
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe()
     *       method</li>
     *   </ul>
     * @method fire
     * @param {Object*} arguments an arbitrary set of parameters to pass to
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false,
     *                   true otherwise.
     *
     */
    fire: function() {
        if (this.fireOnce && this.fired) {
            this.log('fireOnce event: ' + this.type + ' already fired');
            return true;
        } else {

            var args = Y.Array(arguments, 0, true);

            // this doesn't happen if the event isn't published
            // this.host._monitor('fire', this.type, args);

            this.fired = true;
            this.firedWith = args;

            if (this.emitFacade) {
                return this.fireComplex(args);
            } else {
                return this.fireSimple(args);
            }
        }
    },

    fireSimple: function(args) {
        this.stopped = 0;
        this.prevented = 0;
        if (this.hasSubs()) {
            // this._procSubs(Y.merge(this.subscribers, this.afters), args);
            var subs = this.getSubs();
            this._procSubs(subs[0], args);
            this._procSubs(subs[1], args);
        }
        this._broadcast(args);
        return this.stopped ? false : true;
    },

    // Requires the event-custom-complex module for full funcitonality.
    fireComplex: function(args) {
        args[0] = args[0] || {};
        return this.fireSimple(args);
    },

    _procSubs: function(subs, args, ef) {
        var s, i;
        for (i in subs) {
            if (subs.hasOwnProperty(i)) {
                s = subs[i];
                if (s && s.fn) {
                    if (false === this._notify(s, args, ef)) {
                        this.stopped = 2;
                    }
                    if (this.stopped == 2) {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    _broadcast: function(args) {
        if (!this.stopped && this.broadcast) {

            var a = Y.Array(args);
            a.unshift(this.type);

            if (this.host !== Y) {
                Y.fire.apply(Y, a);
            }

            if (this.broadcast == 2) {
                Y.Global.fire.apply(Y.Global, a);
            }
        }
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {int} The number of listeners unsubscribed.
     * @deprecated use detachAll.
     */
    unsubscribeAll: function() {
        return this.detachAll.apply(this, arguments);
    },

    /**
     * Removes all listeners
     * @method detachAll
     * @return {int} The number of listeners unsubscribed.
     */
    detachAll: function() {
        return this.detach();
    },

    /**
     * @method _delete
     * @param subscriber object.
     * @private
     */
    _delete: function(s) {
        if (s) {
            if (this.subscribers[s.id]) {
                delete this.subscribers[s.id];
                this.subCount--;
            }
            if (this.afters[s.id]) {
                delete this.afters[s.id];
                this.afterCount--;
            }
        }

        if (this.host) {
            this.host._monitor('detach', this.type, {
                ce: this,
                sub: s
            });
        }

        if (s) {
            // delete s.fn;
            // delete s.context;
            s.deleted = true;
        }
    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The wrapped function to execute.
 * @param {Object}   context  The value of the keyword 'this' in the listener.
 * @param {Array} args*       0..n additional arguments to supply the listener.
 *
 * @class Subscriber
 * @constructor
 */
Y.Subscriber = function(fn, context, args) {

    /**
     * The callback that will be execute when the event fires
     * This is wrapped by Y.rbind if obj was supplied.
     * @property fn
     * @type Function
     */
    this.fn = fn;

    /**
     * Optional 'this' keyword for the listener
     * @property context
     * @type Object
     */
    this.context = context;

    /**
     * Unique subscriber id
     * @property id
     * @type String
     */
    this.id = Y.stamp(this);

    /**
     * Additional arguments to propagate to the subscriber
     * @property args
     * @type Array
     */
    this.args = args;

    /**
     * Custom events for a given fire transaction.
     * @property events
     * @type {EventTarget}
     */
    // this.events = null;

    /**
     * This listener only reacts to the event once
     * @property once
     */
    // this.once = false;

};

Y.Subscriber.prototype = {

    _notify: function(c, args, ce) {
        if (this.deleted && !this.postponed) {
            if (this.postponed) {
                delete this.fn;
                delete this.context;
            } else {
                delete this.postponed;
                return null;
            }
        }
        var a = this.args, ret;
        switch (ce.signature) {
            case 0:
                ret = this.fn.call(c, ce.type, args, c);
                break;
            case 1:
                ret = this.fn.call(c, args[0] || null, c);
                break;
            default:
                if (a || args) {
                    args = args || [];
                    a = (a) ? args.concat(a) : args;
                    ret = this.fn.apply(c, a);
                } else {
                    ret = this.fn.call(c);
                }
        }

        if (this.once) {
            ce._delete(this);
        }

        return ret;
    },

    /**
     * Executes the subscriber.
     * @method notify
     * @param args {Array} Arguments array for the subscriber.
     * @param ce {CustomEvent} The custom event that sent the notification.
     */
    notify: function(args, ce) {
        var c = this.context,
            ret = true;

        if (!c) {
            c = (ce.contextFn) ? ce.contextFn() : ce.context;
        }

        // only catch errors if we will not re-throw them.
        if (Y.config.throwFail) {
            ret = this._notify(c, args, ce);
        } else {
            try {
                ret = this._notify(c, args, ce);
            } catch (e) {
                Y.error(this + ' failed: ' + e.message, e);
            }
        }

        return ret;
    },

    /**
     * Returns true if the fn and obj match this objects properties.
     * Used by the unsubscribe method to match the right subscriber.
     *
     * @method contains
     * @param {Function} fn the function to execute.
     * @param {Object} context optional 'this' keyword for the listener.
     * @return {boolean} true if the supplied arguments match this
     *                   subscriber's signature.
     */
    contains: function(fn, context) {
        if (context) {
            return ((this.fn == fn) && this.context == context);
        } else {
            return (this.fn == fn);
        }
    }

};

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event-custom
 * @submodule event-custom-base
 */

/**
 * EventTarget provides the implementation for any object to
 * publish, subscribe and fire to custom events, and also
 * alows other EventTargets to target the object with events
 * sourced from the other object.
 * EventTarget is designed to be used with Y.augment to wrap
 * EventCustom in an interface that allows events to be listened to
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 * @class EventTarget
 * @param opts a configuration object
 * @config emitFacade {boolean} if true, all events will emit event
 * facade payloads by default (default false)
 * @config prefix {string} the prefix to apply to non-prefixed event names
 * @config chain {boolean} if true, on/after/detach return the host to allow
 * chaining, otherwise they return an EventHandle (default false)
 */

var L = Y.Lang,
    PREFIX_DELIMITER = ':',
    CATEGORY_DELIMITER = '|',
    AFTER_PREFIX = '~AFTER~',
    YArray = Y.Array,

    _wildType = Y.cached(function(type) {
        return type.replace(/(.*)(:)(.*)/, "*$2$3");
    }),

    /**
     * If the instance has a prefix attribute and the
     * event type is not prefixed, the instance prefix is
     * applied to the supplied type.
     * @method _getType
     * @private
     */
    _getType = Y.cached(function(type, pre) {

        if (!pre || !L.isString(type) || type.indexOf(PREFIX_DELIMITER) > -1) {
            return type;
        }

        return pre + PREFIX_DELIMITER + type;
    }),

    /**
     * Returns an array with the detach key (if provided),
     * and the prefixed event name from _getType
     * Y.on('detachcategory| menu:click', fn)
     * @method _parseType
     * @private
     */
    _parseType = Y.cached(function(type, pre) {

        var t = type, detachcategory, after, i;

        if (!L.isString(t)) {
            return t;
        }

        i = t.indexOf(AFTER_PREFIX);

        if (i > -1) {
            after = true;
            t = t.substr(AFTER_PREFIX.length);
        }

        i = t.indexOf(CATEGORY_DELIMITER);

        if (i > -1) {
            detachcategory = t.substr(0, (i));
            t = t.substr(i+1);
            if (t == '*') {
                t = null;
            }
        }

        // detach category, full type with instance prefix, is this an after listener, short type
        return [detachcategory, (pre) ? _getType(t, pre) : t, after, t];
    }),

    ET = function(opts) {


        var o = (L.isObject(opts)) ? opts : {};

        this._yuievt = this._yuievt || {

            id: Y.guid(),

            events: {},

            targets: {},

            config: o,

            chain: ('chain' in o) ? o.chain : Y.config.chain,

            bubbling: false,

            defaults: {
                context: o.context || this,
                host: this,
                emitFacade: o.emitFacade,
                fireOnce: o.fireOnce,
                queuable: o.queuable,
                monitored: o.monitored,
                broadcast: o.broadcast,
                defaultTargetOnly: o.defaultTargetOnly,
                bubbles: ('bubbles' in o) ? o.bubbles : true
            }
        };

    };


ET.prototype = {

    /**
     * Listen to a custom event hosted by this object one time.
     * This is the equivalent to <code>on</code> except the
     * listener is immediatelly detached when it is executed.
     * @method once
     * @param type    {string}   The type of the event
     * @param fn {Function} The callback
     * @param context {object} optional execution context.
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * @return the event target or a detach handle per 'chain' config
     */
    once: function() {
        var handle = this.on.apply(this, arguments);
        handle.batch(function(hand) {
            if (hand.sub) {
                hand.sub.once = true;
            }
        });
        return handle;
    },

    /**
     * Takes the type parameter passed to 'on' and parses out the
     * various pieces that could be included in the type.  If the
     * event type is passed without a prefix, it will be expanded
     * to include the prefix one is supplied or the event target
     * is configured with a default prefix.
     * @method parseType
     * @param {string} type the type
     * @param {string} [pre=this._yuievt.config.prefix] the prefix
     * @since 3.3.0
     * @return {Array} an array containing:
     *  * the detach category, if supplied,
     *  * the prefixed event type,
     *  * whether or not this is an after listener,
     *  * the supplied event type
     */
    parseType: function(type, pre) {
        return _parseType(type, pre || this._yuievt.config.prefix);
    },

    /**
     * Subscribe to a custom event hosted by this object
     * @method on
     * @param type    {string}   The type of the event
     * @param fn {Function} The callback
     * @param context {object} optional execution context.
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * @return the event target or a detach handle per 'chain' config
     */
    on: function(type, fn, context) {

        var parts = _parseType(type, this._yuievt.config.prefix), f, c, args, ret, ce,
            detachcategory, handle, store = Y.Env.evt.handles, after, adapt, shorttype,
            Node = Y.Node, n, domevent, isArr;

        // full name, args, detachcategory, after
        this._monitor('attach', parts[1], {
            args: arguments,
            category: parts[0],
            after: parts[2]
        });

        if (L.isObject(type)) {

            if (L.isFunction(type)) {
                return Y.Do.before.apply(Y.Do, arguments);
            }

            f = fn;
            c = context;
            args = YArray(arguments, 0, true);
            ret = [];

            if (L.isArray(type)) {
                isArr = true;
            }

            after = type._after;
            delete type._after;

            Y.each(type, function(v, k) {

                if (L.isObject(v)) {
                    f = v.fn || ((L.isFunction(v)) ? v : f);
                    c = v.context || c;
                }

                var nv = (after) ? AFTER_PREFIX : '';

                args[0] = nv + ((isArr) ? v : k);
                args[1] = f;
                args[2] = c;

                ret.push(this.on.apply(this, args));

            }, this);

            return (this._yuievt.chain) ? this : new Y.EventHandle(ret);

        }

        detachcategory = parts[0];
        after = parts[2];
        shorttype = parts[3];

        // extra redirection so we catch adaptor events too.  take a look at this.
        if (Node && Y.instanceOf(this, Node) && (shorttype in Node.DOM_EVENTS)) {
            args = YArray(arguments, 0, true);
            args.splice(2, 0, Node.getDOMNode(this));
            return Y.on.apply(Y, args);
        }

        type = parts[1];

        if (Y.instanceOf(this, YUI)) {

            adapt = Y.Env.evt.plugins[type];
            args  = YArray(arguments, 0, true);
            args[0] = shorttype;

            if (Node) {
                n = args[2];

                if (Y.instanceOf(n, Y.NodeList)) {
                    n = Y.NodeList.getDOMNodes(n);
                } else if (Y.instanceOf(n, Node)) {
                    n = Node.getDOMNode(n);
                }

                domevent = (shorttype in Node.DOM_EVENTS);

                // Captures both DOM events and event plugins.
                if (domevent) {
                    args[2] = n;
                }
            }

            // check for the existance of an event adaptor
            if (adapt) {
                handle = adapt.on.apply(Y, args);
            } else if ((!type) || domevent) {
                handle = Y.Event._attach(args);
            }

        }

        if (!handle) {
            ce = this._yuievt.events[type] || this.publish(type);
            handle = ce._on(fn, context, (arguments.length > 3) ? YArray(arguments, 3, true) : null, (after) ? 'after' : true);
        }

        if (detachcategory) {
            store[detachcategory] = store[detachcategory] || {};
            store[detachcategory][type] = store[detachcategory][type] || [];
            store[detachcategory][type].push(handle);
        }

        return (this._yuievt.chain) ? this : handle;

    },

    /**
     * subscribe to an event
     * @method subscribe
     * @deprecated use on
     */
    subscribe: function() {
        return this.on.apply(this, arguments);
    },

    /**
     * Detach one or more listeners the from the specified event
     * @method detach
     * @param type {string|Object}   Either the handle to the subscriber or the
     *                        type of event.  If the type
     *                        is not specified, it will attempt to remove
     *                        the listener from all hosted events.
     * @param fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param context  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {EventTarget} the host
     */
    detach: function(type, fn, context) {
        var evts = this._yuievt.events, i,
            Node = Y.Node, isNode = Node && (Y.instanceOf(this, Node));

        // detachAll disabled on the Y instance.
        if (!type && (this !== Y)) {
            for (i in evts) {
                if (evts.hasOwnProperty(i)) {
                    evts[i].detach(fn, context);
                }
            }
            if (isNode) {
                Y.Event.purgeElement(Node.getDOMNode(this));
            }

            return this;
        }

        var parts = _parseType(type, this._yuievt.config.prefix),
        detachcategory = L.isArray(parts) ? parts[0] : null,
        shorttype = (parts) ? parts[3] : null,
        adapt, store = Y.Env.evt.handles, detachhost, cat, args,
        ce,

        keyDetacher = function(lcat, ltype, host) {
            var handles = lcat[ltype], ce, i;
            if (handles) {
                for (i = handles.length - 1; i >= 0; --i) {
                    ce = handles[i].evt;
                    if (ce.host === host || ce.el === host) {
                        handles[i].detach();
                    }
                }
            }
        };

        if (detachcategory) {

            cat = store[detachcategory];
            type = parts[1];
            detachhost = (isNode) ? Y.Node.getDOMNode(this) : this;

            if (cat) {
                if (type) {
                    keyDetacher(cat, type, detachhost);
                } else {
                    for (i in cat) {
                        if (cat.hasOwnProperty(i)) {
                            keyDetacher(cat, i, detachhost);
                        }
                    }
                }

                return this;
            }

        // If this is an event handle, use it to detach
        } else if (L.isObject(type) && type.detach) {
            type.detach();
            return this;
        // extra redirection so we catch adaptor events too.  take a look at this.
        } else if (isNode && ((!shorttype) || (shorttype in Node.DOM_EVENTS))) {
            args = YArray(arguments, 0, true);
            args[2] = Node.getDOMNode(this);
            Y.detach.apply(Y, args);
            return this;
        }

        adapt = Y.Env.evt.plugins[shorttype];

        // The YUI instance handles DOM events and adaptors
        if (Y.instanceOf(this, YUI)) {
            args = YArray(arguments, 0, true);
            // use the adaptor specific detach code if
            if (adapt && adapt.detach) {
                adapt.detach.apply(Y, args);
                return this;
            // DOM event fork
            } else if (!type || (!adapt && Node && (type in Node.DOM_EVENTS))) {
                args[0] = type;
                Y.Event.detach.apply(Y.Event, args);
                return this;
            }
        }

        // ce = evts[type];
        ce = evts[parts[1]];
        if (ce) {
            ce.detach(fn, context);
        }

        return this;
    },

    /**
     * detach a listener
     * @method unsubscribe
     * @deprecated use detach
     */
    unsubscribe: function() {
        return this.detach.apply(this, arguments);
    },

    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method detachAll
     * @param type {string}   The type, or name of the event
     */
    detachAll: function(type) {
        return this.detach(type);
    },

    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method unsubscribeAll
     * @param type {string}   The type, or name of the event
     * @deprecated use detachAll
     */
    unsubscribeAll: function() {
        return this.detachAll.apply(this, arguments);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned.
     *
     * @method publish
     *
     * @param type {string} the type, or name of the event
     * @param opts {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *   'broadcast': whether or not the YUI instance and YUI global are notified when the event is fired (false)
     *    </li>
     *    <li>
     *   'bubbles': whether or not this event bubbles (true)
     *              Events can only bubble if emitFacade is true.
     *    </li>
     *    <li>
     *   'context': the default execution context for the listeners (this)
     *    </li>
     *    <li>
     *   'defaultFn': the default function to execute when this event fires if preventDefault was not called
     *    </li>
     *    <li>
     *   'emitFacade': whether or not this event emits a facade (false)
     *    </li>
     *    <li>
     *   'prefix': the prefix for this targets events, e.g., 'menu' in 'menu:click'
     *    </li>
     *    <li>
     *   'fireOnce': if an event is configured to fire once, new subscribers after
     *   the fire will be notified immediately.
     *    </li>
     *    <li>
     *   'async': fireOnce event listeners will fire synchronously if the event has already
     *    fired unless async is true.
     *    </li>
     *    <li>
     *   'preventable': whether or not preventDefault() has an effect (true)
     *    </li>
     *    <li>
     *   'preventedFn': a function that is executed when preventDefault is called
     *    </li>
     *    <li>
     *   'queuable': whether or not this event can be queued during bubbling (false)
     *    </li>
     *    <li>
     *   'silent': if silent is true, debug messages are not provided for this event.
     *    </li>
     *    <li>
     *   'stoppedFn': a function that is executed when stopPropagation is called
     *    </li>
     *
     *    <li>
     *   'monitored': specifies whether or not this event should send notifications about
     *   when the event has been attached, detached, or published.
     *    </li>
     *    <li>
     *   'type': the event type (valid option if not provided as the first parameter to publish)
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    publish: function(type, opts) {
        var events, ce, ret, defaults,
            edata    = this._yuievt,
            pre      = edata.config.prefix;

        type = (pre) ? _getType(type, pre) : type;

        this._monitor('publish', type, {
            args: arguments
        });

        if (L.isObject(type)) {
            ret = {};
            Y.each(type, function(v, k) {
                ret[k] = this.publish(k, v || opts);
            }, this);

            return ret;
        }

        events = edata.events;
        ce = events[type];

        if (ce) {
// ce.log("publish applying new config to published event: '"+type+"' exists", 'info', 'event');
            if (opts) {
                ce.applyConfig(opts, true);
            }
        } else {

            defaults = edata.defaults;

            // apply defaults
            ce = new Y.CustomEvent(type,
                                  (opts) ? Y.merge(defaults, opts) : defaults);
            events[type] = ce;
        }

        // make sure we turn the broadcast flag off if this
        // event was published as a result of bubbling
        // if (opts instanceof Y.CustomEvent) {
          //   events[type].broadcast = false;
        // }

        return events[type];
    },

    /**
     * This is the entry point for the event monitoring system.
     * You can monitor 'attach', 'detach', 'fire', and 'publish'.
     * When configured, these events generate an event.  click ->
     * click_attach, click_detach, click_publish -- these can
     * be subscribed to like other events to monitor the event
     * system.  Inividual published events can have monitoring
     * turned on or off (publish can't be turned off before it
     * it published) by setting the events 'monitor' config.
     *
     * @private
     */
    _monitor: function(what, type, o) {
        var monitorevt, ce = this.getEvent(type);
        if ((this._yuievt.config.monitored && (!ce || ce.monitored)) || (ce && ce.monitored)) {
            monitorevt = type + '_' + what;
            o.monitored = what;
            this.fire.call(this, monitorevt, o);
        }
    },

   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the context specified when the event was created, and with the
     * following parameters.
     *
     * If the custom event object hasn't been created, then the event hasn't
     * been published and it has no subscribers.  For performance sake, we
     * immediate exit in this case.  This means the event won't bubble, so
     * if the intention is that a bubble target be notified, the event must
     * be published on this object first.
     *
     * The first argument is the event type, and any additional arguments are
     * passed to the listeners as parameters.  If the first of these is an
     * object literal, and the event is configured to emit an event facade,
     * that object is mixed into the event facade and the facade is provided
     * in place of the original object.
     *
     * @method fire
     * @param type {String|Object} The type of the event, or an object that contains
     * a 'type' property.
     * @param arguments {Object*} an arbitrary set of parameters to pass to
     * the handler.  If the first of these is an object literal and the event is
     * configured to emit an event facade, the event facade will replace that
     * parameter after the properties the object literal contains are copied to
     * the event facade.
     * @return {EventTarget} the event host
     *
     */
    fire: function(type) {

        var typeIncluded = L.isString(type),
            t = (typeIncluded) ? type : (type && type.type),
            ce, ret, pre = this._yuievt.config.prefix, ce2,
            args = (typeIncluded) ? YArray(arguments, 1, true) : arguments;

        t = (pre) ? _getType(t, pre) : t;

        this._monitor('fire', t, {
            args: args
        });

        ce = this.getEvent(t, true);
        ce2 = this.getSibling(t, ce);

        if (ce2 && !ce) {
            ce = this.publish(t);
        }

        // this event has not been published or subscribed to
        if (!ce) {
            if (this._yuievt.hasTargets) {
                return this.bubble({ type: t }, args, this);
            }

            // otherwise there is nothing to be done
            ret = true;
        } else {
            ce.sibling = ce2;
            ret = ce.fire.apply(ce, args);
        }

        return (this._yuievt.chain) ? this : ret;
    },

    getSibling: function(type, ce) {
        var ce2;
        // delegate to *:type events if there are subscribers
        if (type.indexOf(PREFIX_DELIMITER) > -1) {
            type = _wildType(type);
            // console.log(type);
            ce2 = this.getEvent(type, true);
            if (ce2) {
                // console.log("GOT ONE: " + type);
                ce2.applyConfig(ce);
                ce2.bubbles = false;
                ce2.broadcast = 0;
                // ret = ce2.fire.apply(ce2, a);
            }
        }

        return ce2;
    },

    /**
     * Returns the custom event of the provided type has been created, a
     * falsy value otherwise
     * @method getEvent
     * @param type {string} the type, or name of the event
     * @param prefixed {string} if true, the type is prefixed already
     * @return {CustomEvent} the custom event or null
     */
    getEvent: function(type, prefixed) {
        var pre, e;
        if (!prefixed) {
            pre = this._yuievt.config.prefix;
            type = (pre) ? _getType(type, pre) : type;
        }
        e = this._yuievt.events;
        return e[type] || null;
    },

    /**
     * Subscribe to a custom event hosted by this object.  The
     * supplied callback will execute after any listeners add
     * via the subscribe method, and after the default function,
     * if configured for the event, has executed.
     * @method after
     * @param type    {string}   The type of the event
     * @param fn {Function} The callback
     * @param context {object} optional execution context.
     * @param arg* {mixed} 0..n additional arguments to supply to the subscriber
     * @return the event target or a detach handle per 'chain' config
     */
    after: function(type, fn) {

        var a = YArray(arguments, 0, true);

        switch (L.type(type)) {
            case 'function':
                return Y.Do.after.apply(Y.Do, arguments);
            case 'array':
            //     YArray.each(a[0], function(v) {
            //         v = AFTER_PREFIX + v;
            //     });
            //     break;
            case 'object':
                a[0]._after = true;
                break;
            default:
                a[0] = AFTER_PREFIX + type;
        }

        return this.on.apply(this, a);

    },

    /**
     * Executes the callback before a DOM event, custom event
     * or method.  If the first argument is a function, it
     * is assumed the target is a method.  For DOM and custom
     * events, this is an alias for Y.on.
     *
     * For DOM and custom events:
     * type, callback, context, 0-n arguments
     *
     * For methods:
     * callback, object (method host), methodName, context, 0-n arguments
     *
     * @method before
     * @return detach handle
     */
    before: function() {
        return this.on.apply(this, arguments);
    }

};

Y.EventTarget = ET;

// make Y an event target
Y.mix(Y, ET.prototype, false, false, {
    bubbles: false
});

ET.call(Y);

YUI.Env.globalEvents = YUI.Env.globalEvents || new ET();

/**
 * Hosts YUI page level events.  This is where events bubble to
 * when the broadcast config is set to 2.  This property is
 * only available if the custom event module is loaded.
 * @property Global
 * @type EventTarget
 * @for YUI
 */
Y.Global = YUI.Env.globalEvents;

// @TODO implement a global namespace function on Y.Global?

/**
 * <code>YUI</code>'s <code>on</code> method is a unified interface for subscribing to
 * most events exposed by YUI.  This includes custom events, DOM events, and
 * function events.  <code>detach</code> is also provided to remove listeners
 * serviced by this function.
 *
 * The signature that <code>on</code> accepts varies depending on the type
 * of event being consumed.  Refer to the specific methods that will
 * service a specific request for additional information about subscribing
 * to that type of event.
 *
 * <ul>
 * <li>Custom events.  These events are defined by various
 * modules in the library.  This type of event is delegated to
 * <code>EventTarget</code>'s <code>on</code> method.
 *   <ul>
 *     <li>The type of the event</li>
 *     <li>The callback to execute</li>
 *     <li>An optional context object</li>
 *     <li>0..n additional arguments to supply the callback.</li>
 *   </ul>
 *   Example:
 *   <code>Y.on('drag:drophit', function() { // start work });</code>
 * </li>
 * <li>DOM events.  These are moments reported by the browser related
 * to browser functionality and user interaction.
 * This type of event is delegated to <code>Event</code>'s
 * <code>attach</code> method.
 *   <ul>
 *     <li>The type of the event</li>
 *     <li>The callback to execute</li>
 *     <li>The specification for the Node(s) to attach the listener
 *     to.  This can be a selector, collections, or Node/Element
 *     refereces.</li>
 *     <li>An optional context object</li>
 *     <li>0..n additional arguments to supply the callback.</li>
 *   </ul>
 *   Example:
 *   <code>Y.on('click', function(e) { // something was clicked }, '#someelement');</code>
 * </li>
 * <li>Function events.  These events can be used to react before or after a
 * function is executed.  This type of event is delegated to <code>Event.Do</code>'s
 * <code>before</code> method.
 *   <ul>
 *     <li>The callback to execute</li>
 *     <li>The object that has the function that will be listened for.</li>
 *     <li>The name of the function to listen for.</li>
 *     <li>An optional context object</li>
 *     <li>0..n additional arguments to supply the callback.</li>
 *   </ul>
 *   Example <code>Y.on(function(arg1, arg2, etc) { // obj.methodname was executed }, obj 'methodname');</code>
 * </li>
 * </ul>
 *
 * <code>on</code> corresponds to the moment before any default behavior of
 * the event.  <code>after</code> works the same way, but these listeners
 * execute after the event's default behavior.  <code>before</code> is an
 * alias for <code>on</code>.
 *
 * @method on
 * @param type event type (this parameter does not apply for function events)
 * @param fn the callback
 * @param context optionally change the value of 'this' in the callback
 * @param args* 0..n additional arguments to pass to the callback.
 * @return the event target or a detach handle per 'chain' config
 * @for YUI
 */

 /**
  * Listen for an event one time.  Equivalent to <code>on</code>, except that
  * the listener is immediately detached when executed.
  * @see on
  * @method once
  * @param type event type (this parameter does not apply for function events)
  * @param fn the callback
  * @param context optionally change the value of 'this' in the callback
  * @param args* 0..n additional arguments to pass to the callback.
  * @return the event target or a detach handle per 'chain' config
  * @for YUI
  */

/**
 * after() is a unified interface for subscribing to
 * most events exposed by YUI.  This includes custom events,
 * DOM events, and AOP events.  This works the same way as
 * the on() function, only it operates after any default
 * behavior for the event has executed. @see <code>on</code> for more
 * information.
 * @method after
 * @param type event type (this parameter does not apply for function events)
 * @param fn the callback
 * @param context optionally change the value of 'this' in the callback
 * @param args* 0..n additional arguments to pass to the callback.
 * @return the event target or a detach handle per 'chain' config
 * @for YUI
 */


}, '3.3.0' ,{requires:['oop']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
var GLOBAL_ENV = YUI.Env;

if (!GLOBAL_ENV._ready) {
    GLOBAL_ENV._ready = function() {
        GLOBAL_ENV.DOMReady = true;
        GLOBAL_ENV.remove(YUI.config.doc, 'DOMContentLoaded', GLOBAL_ENV._ready);
    };

    // if (!YUI.UA.ie) {
        GLOBAL_ENV.add(YUI.config.doc, 'DOMContentLoaded', GLOBAL_ENV._ready);
    // }
}

YUI.add('event-base', function(Y) {

/*
 * DOM event listener abstraction layer
 * @module event
 * @submodule event-base
 */

/**
 * The domready event fires at the moment the browser's DOM is
 * usable. In most cases, this is before images are fully
 * downloaded, allowing you to provide a more responsive user
 * interface.
 *
 * In YUI 3, domready subscribers will be notified immediately if
 * that moment has already passed when the subscription is created.
 *
 * One exception is if the yui.js file is dynamically injected into
 * the page.  If this is done, you must tell the YUI instance that
 * you did this in order for DOMReady (and window load events) to
 * fire normally.  That configuration option is 'injected' -- set
 * it to true if the yui.js script is not included inline.
 *
 * This method is part of the 'event-ready' module, which is a
 * submodule of 'event'.
 *
 * @event domready
 * @for YUI
 */
Y.publish('domready', {
    fireOnce: true,
    async: true
});

if (GLOBAL_ENV.DOMReady) {
    Y.fire('domready');
} else {
    Y.Do.before(function() { Y.fire('domready'); }, YUI.Env, '_ready');
}

/**
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event
 * @submodule event-base
 */

/**
 * Wraps a DOM event, properties requiring browser abstraction are
 * fixed here.  Provids a security layer when required.
 * @class DOMEventFacade
 * @param ev {Event} the DOM event
 * @param currentTarget {HTMLElement} the element the listener was attached to
 * @param wrapper {Event.Custom} the custom event wrapper for this DOM event
 */

    var ua = Y.UA,

    EMPTY = {},

    /**
     * webkit key remapping required for Safari < 3.1
     * @property webkitKeymap
     * @private
     */
    webkitKeymap = {
        63232: 38, // up
        63233: 40, // down
        63234: 37, // left
        63235: 39, // right
        63276: 33, // page up
        63277: 34, // page down
        25:     9, // SHIFT-TAB (Safari provides a different key code in
                   // this case, even though the shiftKey modifier is set)
        63272: 46, // delete
        63273: 36, // home
        63275: 35  // end
    },

    /**
     * Returns a wrapped node.  Intended to be used on event targets,
     * so it will return the node's parent if the target is a text
     * node.
     *
     * If accessing a property of the node throws an error, this is
     * probably the anonymous div wrapper Gecko adds inside text
     * nodes.  This likely will only occur when attempting to access
     * the relatedTarget.  In this case, we now return null because
     * the anonymous div is completely useless and we do not know
     * what the related target was because we can't even get to
     * the element's parent node.
     *
     * @method resolve
     * @private
     */
    resolve = function(n) {
        if (!n) {
            return n;
        }
        try {
            if (n && 3 == n.nodeType) {
                n = n.parentNode;
            }
        } catch(e) {
            return null;
        }

        return Y.one(n);
    },

    DOMEventFacade = function(ev, currentTarget, wrapper) {
        this._event = ev;
        this._currentTarget = currentTarget;
        this._wrapper = wrapper || EMPTY;

        // if not lazy init
        this.init();
    };

Y.extend(DOMEventFacade, Object, {

    init: function() {

        var e = this._event,
            overrides = this._wrapper.overrides,
            x = e.pageX,
            y = e.pageY,
            c,
            currentTarget = this._currentTarget;

        this.altKey   = e.altKey;
        this.ctrlKey  = e.ctrlKey;
        this.metaKey  = e.metaKey;
        this.shiftKey = e.shiftKey;
        this.type     = (overrides && overrides.type) || e.type;
        this.clientX  = e.clientX;
        this.clientY  = e.clientY;

        this.pageX = x;
        this.pageY = y;

        c = e.keyCode || e.charCode;

        if (ua.webkit && (c in webkitKeymap)) {
            c = webkitKeymap[c];
        }

        this.keyCode = c;
        this.charCode = c;
        this.which = e.which || e.charCode || c;
        // this.button = e.button;
        this.button = this.which;

        this.target = resolve(e.target);
        this.currentTarget = resolve(currentTarget);
        this.relatedTarget = resolve(e.relatedTarget);

        if (e.type == "mousewheel" || e.type == "DOMMouseScroll") {
            this.wheelDelta = (e.detail) ? (e.detail * -1) : Math.round(e.wheelDelta / 80) || ((e.wheelDelta < 0) ? -1 : 1);
        }

        if (this._touch) {
            this._touch(e, currentTarget, this._wrapper);
        }
    },

    stopPropagation: function() {
        this._event.stopPropagation();
        this._wrapper.stopped = 1;
        this.stopped = 1;
    },

    stopImmediatePropagation: function() {
        var e = this._event;
        if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        } else {
            this.stopPropagation();
        }
        this._wrapper.stopped = 2;
        this.stopped = 2;
    },

    preventDefault: function(returnValue) {
        var e = this._event;
        e.preventDefault();
        e.returnValue = returnValue || false;
        this._wrapper.prevented = 1;
        this.prevented = 1;
    },

    halt: function(immediate) {
        if (immediate) {
            this.stopImmediatePropagation();
        } else {
            this.stopPropagation();
        }

        this.preventDefault();
    }

});

DOMEventFacade.resolve = resolve;
Y.DOM2EventFacade = DOMEventFacade;
Y.DOMEventFacade = DOMEventFacade;

    /**
     * The native event
     * @property _event
     */

    /**
     * The X location of the event on the page (including scroll)
     * @property pageX
     * @type int
     */

    /**
     * The Y location of the event on the page (including scroll)
     * @property pageY
     * @type int
     */

    /**
     * The keyCode for key events.  Uses charCode if keyCode is not available
     * @property keyCode
     * @type int
     */

    /**
     * The charCode for key events.  Same as keyCode
     * @property charCode
     * @type int
     */

    /**
     * The button that was pushed.
     * @property button
     * @type int
     */

    /**
     * The button that was pushed.  Same as button.
     * @property which
     * @type int
     */

    /**
     * Node reference for the targeted element
     * @propery target
     * @type Node
     */

    /**
     * Node reference for the element that the listener was attached to.
     * @propery currentTarget
     * @type Node
     */

    /**
     * Node reference to the relatedTarget
     * @propery relatedTarget
     * @type Node
     */

    /**
     * Number representing the direction and velocity of the movement of the mousewheel.
     * Negative is down, the higher the number, the faster.  Applies to the mousewheel event.
     * @property wheelDelta
     * @type int
     */

    /**
     * Stops the propagation to the next bubble target
     * @method stopPropagation
     */

    /**
     * Stops the propagation to the next bubble target and
     * prevents any additional listeners from being exectued
     * on the current target.
     * @method stopImmediatePropagation
     */

    /**
     * Prevents the event's default behavior
     * @method preventDefault
     * @param returnValue {string} sets the returnValue of the event to this value
     * (rather than the default false value).  This can be used to add a customized
     * confirmation query to the beforeunload event).
     */

    /**
     * Stops the event propagation and prevents the default
     * event behavior.
     * @method halt
     * @param immediate {boolean} if true additional listeners
     * on the current target will not be executed
     */
(function() {
/**
 * DOM event listener abstraction layer
 * @module event
 * @submodule event-base
 */

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */

Y.Env.evt.dom_wrappers = {};
Y.Env.evt.dom_map = {};

var _eventenv = Y.Env.evt,
    config = Y.config,
    win = config.win,
    add = YUI.Env.add,
    remove = YUI.Env.remove,

    onLoad = function() {
        YUI.Env.windowLoaded = true;
        Y.Event._load();
        remove(win, "load", onLoad);
    },

    onUnload = function() {
        Y.Event._unload();
    },

    EVENT_READY = 'domready',

    COMPAT_ARG = '~yui|2|compat~',

    shouldIterate = function(o) {
        try {
            return (o && typeof o !== "string" && Y.Lang.isNumber(o.length) &&
                    !o.tagName && !o.alert);
        } catch(ex) {
            return false;
        }

    },

Event = function() {

    /**
     * True after the onload event has fired
     * @property _loadComplete
     * @type boolean
     * @static
     * @private
     */
    var _loadComplete =  false,

    /**
     * The number of times to poll after window.onload.  This number is
     * increased if additional late-bound handlers are requested after
     * the page load.
     * @property _retryCount
     * @static
     * @private
     */
    _retryCount = 0,

    /**
     * onAvailable listeners
     * @property _avail
     * @static
     * @private
     */
    _avail = [],

    /**
     * Custom event wrappers for DOM events.  Key is
     * 'event:' + Element uid stamp + event type
     * @property _wrappers
     * @type Y.Event.Custom
     * @static
     * @private
     */
    _wrappers = _eventenv.dom_wrappers,

    _windowLoadKey = null,

    /**
     * Custom event wrapper map DOM events.  Key is
     * Element uid stamp.  Each item is a hash of custom event
     * wrappers as provided in the _wrappers collection.  This
     * provides the infrastructure for getListeners.
     * @property _el_events
     * @static
     * @private
     */
    _el_events = _eventenv.dom_map;

    return {

        /**
         * The number of times we should look for elements that are not
         * in the DOM at the time the event is requested after the document
         * has been loaded.  The default is 1000@amp;40 ms, so it will poll
         * for 40 seconds or until all outstanding handlers are bound
         * (whichever comes first).
         * @property POLL_RETRYS
         * @type int
         * @static
         * @final
         */
        POLL_RETRYS: 1000,

        /**
         * The poll interval in milliseconds
         * @property POLL_INTERVAL
         * @type int
         * @static
         * @final
         */
        POLL_INTERVAL: 40,

        /**
         * addListener/removeListener can throw errors in unexpected scenarios.
         * These errors are suppressed, the method returns false, and this property
         * is set
         * @property lastError
         * @static
         * @type Error
         */
        lastError: null,


        /**
         * poll handle
         * @property _interval
         * @static
         * @private
         */
        _interval: null,

        /**
         * document readystate poll handle
         * @property _dri
         * @static
         * @private
         */
         _dri: null,

        /**
         * True when the document is initially usable
         * @property DOMReady
         * @type boolean
         * @static
         */
        DOMReady: false,

        /**
         * @method startInterval
         * @static
         * @private
         */
        startInterval: function() {
            if (!Event._interval) {
Event._interval = setInterval(Event._poll, Event.POLL_INTERVAL);
            }
        },

        /**
         * Executes the supplied callback when the item with the supplied
         * id is found.  This is meant to be used to execute behavior as
         * soon as possible as the page loads.  If you use this after the
         * initial page load it will poll for a fixed time for the element.
         * The number of times it will poll and the frequency are
         * configurable.  By default it will poll for 10 seconds.
         *
         * <p>The callback is executed with a single parameter:
         * the custom object parameter, if provided.</p>
         *
         * @method onAvailable
         *
         * @param {string||string[]}   id the id of the element, or an array
         * of ids to look for.
         * @param {function} fn what to execute when the element is found.
         * @param {object}   p_obj an optional object to be passed back as
         *                   a parameter to fn.
         * @param {boolean|object}  p_override If set to true, fn will execute
         *                   in the context of p_obj, if set to an object it
         *                   will execute in the context of that object
         * @param checkContent {boolean} check child node readiness (onContentReady)
         * @static
         * @deprecated Use Y.on("available")
         */
        // @TODO fix arguments
        onAvailable: function(id, fn, p_obj, p_override, checkContent, compat) {

            var a = Y.Array(id), i, availHandle;


            for (i=0; i<a.length; i=i+1) {
                _avail.push({
                    id:         a[i],
                    fn:         fn,
                    obj:        p_obj,
                    override:   p_override,
                    checkReady: checkContent,
                    compat:     compat
                });
            }
            _retryCount = this.POLL_RETRYS;

            // We want the first test to be immediate, but async
            setTimeout(Event._poll, 0);

            availHandle = new Y.EventHandle({

                _delete: function() {
                    // set by the event system for lazy DOM listeners
                    if (availHandle.handle) {
                        availHandle.handle.detach();
                        return;
                    }

                    var i, j;

                    // otherwise try to remove the onAvailable listener(s)
                    for (i = 0; i < a.length; i++) {
                        for (j = 0; j < _avail.length; j++) {
                            if (a[i] === _avail[j].id) {
                                _avail.splice(j, 1);
                            }
                        }
                    }
                }

            });

            return availHandle;
        },

        /**
         * Works the same way as onAvailable, but additionally checks the
         * state of sibling elements to determine if the content of the
         * available element is safe to modify.
         *
         * <p>The callback is executed with a single parameter:
         * the custom object parameter, if provided.</p>
         *
         * @method onContentReady
         *
         * @param {string}   id the id of the element to look for.
         * @param {function} fn what to execute when the element is ready.
         * @param {object}   obj an optional object to be passed back as
         *                   a parameter to fn.
         * @param {boolean|object}  override If set to true, fn will execute
         *                   in the context of p_obj.  If an object, fn will
         *                   exectute in the context of that object
         *
         * @static
         * @deprecated Use Y.on("contentready")
         */
        // @TODO fix arguments
        onContentReady: function(id, fn, obj, override, compat) {
            return Event.onAvailable(id, fn, obj, override, true, compat);
        },

        /**
         * Adds an event listener
         *
         * @method attach
         *
         * @param {String}   type     The type of event to append
         * @param {Function} fn        The method the event invokes
         * @param {String|HTMLElement|Array|NodeList} el An id, an element
         *  reference, or a collection of ids and/or elements to assign the
         *  listener to.
         * @param {Object}   context optional context object
         * @param {Boolean|object}  args 0..n arguments to pass to the callback
         * @return {EventHandle} an object to that can be used to detach the listener
         *
         * @static
         */

        attach: function(type, fn, el, context) {
            return Event._attach(Y.Array(arguments, 0, true));
        },

        _createWrapper: function (el, type, capture, compat, facade) {

            var cewrapper,
                ek  = Y.stamp(el),
                key = 'event:' + ek + type;

            if (false === facade) {
                key += 'native';
            }
            if (capture) {
                key += 'capture';
            }


            cewrapper = _wrappers[key];


            if (!cewrapper) {
                // create CE wrapper
                cewrapper = Y.publish(key, {
                    silent: true,
                    bubbles: false,
                    contextFn: function() {
                        if (compat) {
                            return cewrapper.el;
                        } else {
                            cewrapper.nodeRef = cewrapper.nodeRef || Y.one(cewrapper.el);
                            return cewrapper.nodeRef;
                        }
                    }
                });

                cewrapper.overrides = {};

                // for later removeListener calls
                cewrapper.el = el;
                cewrapper.key = key;
                cewrapper.domkey = ek;
                cewrapper.type = type;
                cewrapper.fn = function(e) {
                    cewrapper.fire(Event.getEvent(e, el, (compat || (false === facade))));
                };
                cewrapper.capture = capture;

                if (el == win && type == "load") {
                    // window load happens once
                    cewrapper.fireOnce = true;
                    _windowLoadKey = key;
                }

                _wrappers[key] = cewrapper;
                _el_events[ek] = _el_events[ek] || {};
                _el_events[ek][key] = cewrapper;

                add(el, type, cewrapper.fn, capture);
            }

            return cewrapper;

        },

        _attach: function(args, conf) {

            var compat,
                handles, oEl, cewrapper, context,
                fireNow = false, ret,
                type = args[0],
                fn = args[1],
                el = args[2] || win,
                facade = conf && conf.facade,
                capture = conf && conf.capture,
                overrides = conf && conf.overrides;

            if (args[args.length-1] === COMPAT_ARG) {
                compat = true;
                // trimmedArgs.pop();
            }

            if (!fn || !fn.call) {
// throw new TypeError(type + " attach call failed, callback undefined");
                return false;
            }

            // The el argument can be an array of elements or element ids.
            if (shouldIterate(el)) {

                handles=[];

                Y.each(el, function(v, k) {
                    args[2] = v;
                    handles.push(Event._attach(args, conf));
                });

                // return (handles.length === 1) ? handles[0] : handles;
                return new Y.EventHandle(handles);

            // If the el argument is a string, we assume it is
            // actually the id of the element.  If the page is loaded
            // we convert el to the actual element, otherwise we
            // defer attaching the event until the element is
            // ready
            } else if (Y.Lang.isString(el)) {

                // oEl = (compat) ? Y.DOM.byId(el) : Y.Selector.query(el);

                if (compat) {
                    oEl = Y.DOM.byId(el);
                } else {

                    oEl = Y.Selector.query(el);

                    switch (oEl.length) {
                        case 0:
                            oEl = null;
                            break;
                        case 1:
                            oEl = oEl[0];
                            break;
                        default:
                            args[2] = oEl;
                            return Event._attach(args, conf);
                    }
                }

                if (oEl) {

                    el = oEl;

                // Not found = defer adding the event until the element is available
                } else {

                    ret = Event.onAvailable(el, function() {

                        ret.handle = Event._attach(args, conf);

                    }, Event, true, false, compat);

                    return ret;

                }
            }

            // Element should be an html element or node
            if (!el) {
                return false;
            }

            if (Y.Node && Y.instanceOf(el, Y.Node)) {
                el = Y.Node.getDOMNode(el);
            }

            cewrapper = Event._createWrapper(el, type, capture, compat, facade);
            if (overrides) {
                Y.mix(cewrapper.overrides, overrides);
            }

            if (el == win && type == "load") {

                // if the load is complete, fire immediately.
                // all subscribers, including the current one
                // will be notified.
                if (YUI.Env.windowLoaded) {
                    fireNow = true;
                }
            }

            if (compat) {
                args.pop();
            }

            context = args[3];

            // set context to the Node if not specified
            // ret = cewrapper.on.apply(cewrapper, trimmedArgs);
            ret = cewrapper._on(fn, context, (args.length > 4) ? args.slice(4) : null);

            if (fireNow) {
                cewrapper.fire();
            }

            return ret;

        },

        /**
         * Removes an event listener.  Supports the signature the event was bound
         * with, but the preferred way to remove listeners is using the handle
         * that is returned when using Y.on
         *
         * @method detach
         *
         * @param {String} type the type of event to remove.
         * @param {Function} fn the method the event invokes.  If fn is
         * undefined, then all event handlers for the type of event are
         * removed.
         * @param {String|HTMLElement|Array|NodeList|EventHandle} el An
         * event handle, an id, an element reference, or a collection
         * of ids and/or elements to remove the listener from.
         * @return {boolean} true if the unbind was successful, false otherwise.
         * @static
         */
        detach: function(type, fn, el, obj) {

            var args=Y.Array(arguments, 0, true), compat, l, ok, i,
                id, ce;

            if (args[args.length-1] === COMPAT_ARG) {
                compat = true;
                // args.pop();
            }

            if (type && type.detach) {
                return type.detach();
            }

            // The el argument can be a string
            if (typeof el == "string") {

                // el = (compat) ? Y.DOM.byId(el) : Y.all(el);
                if (compat) {
                    el = Y.DOM.byId(el);
                } else {
                    el = Y.Selector.query(el);
                    l = el.length;
                    if (l < 1) {
                        el = null;
                    } else if (l == 1) {
                        el = el[0];
                    }
                }
                // return Event.detach.apply(Event, args);
            }

            if (!el) {
                return false;
            }

            if (el.detach) {
                args.splice(2, 1);
                return el.detach.apply(el, args);
            // The el argument can be an array of elements or element ids.
            } else if (shouldIterate(el)) {
                ok = true;
                for (i=0, l=el.length; i<l; ++i) {
                    args[2] = el[i];
                    ok = ( Y.Event.detach.apply(Y.Event, args) && ok );
                }

                return ok;
            }

            if (!type || !fn || !fn.call) {
                return Event.purgeElement(el, false, type);
            }

            id = 'event:' + Y.stamp(el) + type;
            ce = _wrappers[id];

            if (ce) {
                return ce.detach(fn);
            } else {
                return false;
            }

        },

        /**
         * Finds the event in the window object, the caller's arguments, or
         * in the arguments of another method in the callstack.  This is
         * executed automatically for events registered through the event
         * manager, so the implementer should not normally need to execute
         * this function at all.
         * @method getEvent
         * @param {Event} e the event parameter from the handler
         * @param {HTMLElement} el the element the listener was attached to
         * @return {Event} the event
         * @static
         */
        getEvent: function(e, el, noFacade) {
            var ev = e || win.event;

            return (noFacade) ? ev :
                new Y.DOMEventFacade(ev, el, _wrappers['event:' + Y.stamp(el) + e.type]);
        },

        /**
         * Generates an unique ID for the element if it does not already
         * have one.
         * @method generateId
         * @param el the element to create the id for
         * @return {string} the resulting id of the element
         * @static
         */
        generateId: function(el) {
            return Y.DOM.generateID(el);
        },

        /**
         * We want to be able to use getElementsByTagName as a collection
         * to attach a group of events to.  Unfortunately, different
         * browsers return different types of collections.  This function
         * unittests to determine if the object is array-like.  It will also
         * fail if the object is an array, but is empty.
         * @method _isValidCollection
         * @param o the object to test
         * @return {boolean} true if the object is array-like and populated
         * @deprecated was not meant to be used directly
         * @static
         * @private
         */
        _isValidCollection: shouldIterate,

        /**
         * hook up any deferred listeners
         * @method _load
         * @static
         * @private
         */
        _load: function(e) {
            if (!_loadComplete) {
                _loadComplete = true;

                // Just in case DOMReady did not go off for some reason
                // E._ready();
                if (Y.fire) {
                    Y.fire(EVENT_READY);
                }

                // Available elements may not have been detected before the
                // window load event fires. Try to find them now so that the
                // the user is more likely to get the onAvailable notifications
                // before the window load notification
                Event._poll();
            }
        },

        /**
         * Polling function that runs before the onload event fires,
         * attempting to attach to DOM Nodes as soon as they are
         * available
         * @method _poll
         * @static
         * @private
         */
        _poll: function() {
            if (Event.locked) {
                return;
            }

            if (Y.UA.ie && !YUI.Env.DOMReady) {
                // Hold off if DOMReady has not fired and check current
                // readyState to protect against the IE operation aborted
                // issue.
                Event.startInterval();
                return;
            }

            Event.locked = true;

            // keep trying until after the page is loaded.  We need to
            // check the page load state prior to trying to bind the
            // elements so that we can be certain all elements have been
            // tested appropriately
            var i, len, item, el, notAvail, executeItem,
                tryAgain = !_loadComplete;

            if (!tryAgain) {
                tryAgain = (_retryCount > 0);
            }

            // onAvailable
            notAvail = [];

            executeItem = function (el, item) {
                var context, ov = item.override;
                if (item.compat) {
                    if (item.override) {
                        if (ov === true) {
                            context = item.obj;
                        } else {
                            context = ov;
                        }
                    } else {
                        context = el;
                    }
                    item.fn.call(context, item.obj);
                } else {
                    context = item.obj || Y.one(el);
                    item.fn.apply(context, (Y.Lang.isArray(ov)) ? ov : []);
                }
            };

            // onAvailable
            for (i=0,len=_avail.length; i<len; ++i) {
                item = _avail[i];
                if (item && !item.checkReady) {

                    // el = (item.compat) ? Y.DOM.byId(item.id) : Y.one(item.id);
                    el = (item.compat) ? Y.DOM.byId(item.id) : Y.Selector.query(item.id, null, true);

                    if (el) {
                        executeItem(el, item);
                        _avail[i] = null;
                    } else {
                        notAvail.push(item);
                    }
                }
            }

            // onContentReady
            for (i=0,len=_avail.length; i<len; ++i) {
                item = _avail[i];
                if (item && item.checkReady) {

                    // el = (item.compat) ? Y.DOM.byId(item.id) : Y.one(item.id);
                    el = (item.compat) ? Y.DOM.byId(item.id) : Y.Selector.query(item.id, null, true);

                    if (el) {
                        // The element is available, but not necessarily ready
                        // @todo should we test parentNode.nextSibling?
                        if (_loadComplete || (el.get && el.get('nextSibling')) || el.nextSibling) {
                            executeItem(el, item);
                            _avail[i] = null;
                        }
                    } else {
                        notAvail.push(item);
                    }
                }
            }

            _retryCount = (notAvail.length === 0) ? 0 : _retryCount - 1;

            if (tryAgain) {
                // we may need to strip the nulled out items here
                Event.startInterval();
            } else {
                clearInterval(Event._interval);
                Event._interval = null;
            }

            Event.locked = false;

            return;

        },

        /**
         * Removes all listeners attached to the given element via addListener.
         * Optionally, the node's children can also be purged.
         * Optionally, you can specify a specific type of event to remove.
         * @method purgeElement
         * @param {HTMLElement} el the element to purge
         * @param {boolean} recurse recursively purge this element's children
         * as well.  Use with caution.
         * @param {string} type optional type of listener to purge. If
         * left out, all listeners will be removed
         * @static
         */
        purgeElement: function(el, recurse, type) {
            // var oEl = (Y.Lang.isString(el)) ? Y.one(el) : el,
            var oEl = (Y.Lang.isString(el)) ?  Y.Selector.query(el, null, true) : el,
                lis = Event.getListeners(oEl, type), i, len, props, children, child;

            if (recurse && oEl) {
                lis = lis || [];
                children = Y.Selector.query('*', oEl);
                i = 0;
                len = children.length;
                for (; i < len; ++i) {
                    child = Event.getListeners(children[i], type);
                    if (child) {
                        lis = lis.concat(child);
                    }
                }
            }

            if (lis) {
                i = 0;
                len = lis.length;
                for (; i < len; ++i) {
                    props = lis[i];
                    props.detachAll();
                    remove(props.el, props.type, props.fn, props.capture);
                    delete _wrappers[props.key];
                    delete _el_events[props.domkey][props.key];
                }
            }

        },


        /**
         * Returns all listeners attached to the given element via addListener.
         * Optionally, you can specify a specific type of event to return.
         * @method getListeners
         * @param el {HTMLElement|string} the element or element id to inspect
         * @param type {string} optional type of listener to return. If
         * left out, all listeners will be returned
         * @return {Y.Custom.Event} the custom event wrapper for the DOM event(s)
         * @static
         */
        getListeners: function(el, type) {
            var ek = Y.stamp(el, true), evts = _el_events[ek],
                results=[] , key = (type) ? 'event:' + ek + type : null,
                adapters = _eventenv.plugins;

            if (!evts) {
                return null;
            }

            if (key) {
                // look for synthetic events
                if (adapters[type] && adapters[type].eventDef) {
                    key += '_synth';
                }

                if (evts[key]) {
                    results.push(evts[key]);
                }

                // get native events as well
                key += 'native';
                if (evts[key]) {
                    results.push(evts[key]);
                }

            } else {
                Y.each(evts, function(v, k) {
                    results.push(v);
                });
            }

            return (results.length) ? results : null;
        },

        /**
         * Removes all listeners registered by pe.event.  Called
         * automatically during the unload event.
         * @method _unload
         * @static
         * @private
         */
        _unload: function(e) {
            Y.each(_wrappers, function(v, k) {
                v.detachAll();
                remove(v.el, v.type, v.fn, v.capture);
                delete _wrappers[k];
                delete _el_events[v.domkey][k];
            });
            remove(win, "unload", onUnload);
        },

        /**
         * Adds a DOM event directly without the caching, cleanup, context adj, etc
         *
         * @method nativeAdd
         * @param {HTMLElement} el      the element to bind the handler to
         * @param {string}      type   the type of event handler
         * @param {function}    fn      the callback to invoke
         * @param {boolen}      capture capture or bubble phase
         * @static
         * @private
         */
        nativeAdd: add,

        /**
         * Basic remove listener
         *
         * @method nativeRemove
         * @param {HTMLElement} el      the element to bind the handler to
         * @param {string}      type   the type of event handler
         * @param {function}    fn      the callback to invoke
         * @param {boolen}      capture capture or bubble phase
         * @static
         * @private
         */
        nativeRemove: remove
    };

}();

Y.Event = Event;

if (config.injected || YUI.Env.windowLoaded) {
    onLoad();
} else {
    add(win, "load", onLoad);
}

// Process onAvailable/onContentReady items when when the DOM is ready in IE
if (Y.UA.ie) {
    Y.on(EVENT_READY, Event._poll);
}

add(win, "unload", onUnload);

Event.Custom = Y.CustomEvent;
Event.Subscriber = Y.Subscriber;
Event.Target = Y.EventTarget;
Event.Handle = Y.EventHandle;
Event.Facade = Y.EventFacade;

Event._poll();

})();

/**
 * DOM event listener abstraction layer
 * @module event
 * @submodule event-base
 */

/**
 * Executes the callback as soon as the specified element
 * is detected in the DOM.  This function expects a selector
 * string for the element(s) to detect.  If you already have
 * an element reference, you don't need this event.
 * @event available
 * @param type {string} 'available'
 * @param fn {function} the callback function to execute.
 * @param el {string} an selector for the element(s) to attach
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.Env.evt.plugins.available = {
    on: function(type, fn, id, o) {
        var a = arguments.length > 4 ?  Y.Array(arguments, 4, true) : null;
        return Y.Event.onAvailable.call(Y.Event, id, fn, o, a);
    }
};

/**
 * Executes the callback as soon as the specified element
 * is detected in the DOM with a nextSibling property
 * (indicating that the element's children are available).
 * This function expects a selector
 * string for the element(s) to detect.  If you already have
 * an element reference, you don't need this event.
 * @event contentready
 * @param type {string} 'contentready'
 * @param fn {function} the callback function to execute.
 * @param el {string} an selector for the element(s) to attach.
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.Env.evt.plugins.contentready = {
    on: function(type, fn, id, o) {
        var a = arguments.length > 4 ? Y.Array(arguments, 4, true) : null;
        return Y.Event.onContentReady.call(Y.Event, id, fn, o, a);
    }
};


}, '3.3.0' ,{requires:['event-custom-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('event-simulate', function(Y) {

(function() {
/**
 * Synthetic DOM events
 * @module event-simulate
 * @requires event
 */

//shortcuts
var L   = Y.Lang,
    array       = Y.Array,
    isFunction  = L.isFunction,
    isString    = L.isString,
    isBoolean   = L.isBoolean,
    isObject    = L.isObject,
    isNumber    = L.isNumber,
    doc         = Y.config.doc,

    //mouse events supported
    mouseEvents = {
        click:      1,
        dblclick:   1,
        mouseover:  1,
        mouseout:   1,
        mousedown:  1,
        mouseup:    1,
        mousemove:  1
    },

    //key events supported
    keyEvents   = {
        keydown:    1,
        keyup:      1,
        keypress:   1
    },

    //HTML events supported
    uiEvents  = {
        blur:       1,
        change:     1,
        focus:      1,
        resize:     1,
        scroll:     1,
        select:     1
    },

    //events that bubble by default
    bubbleEvents = {
        scroll:     1,
        resize:     1,
        reset:      1,
        submit:     1,
        change:     1,
        select:     1,
        error:      1,
        abort:      1
    };

//all key and mouse events bubble
Y.mix(bubbleEvents, mouseEvents);
Y.mix(bubbleEvents, keyEvents);

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a key event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks. Note: keydown causes Safari 2.x to
 * crash.
 * @method simulateKeyEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: keyup, keydown, and keypress.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 3 specifies that all key events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 3 specifies that all
 *      key events can be cancelled. The default
 *      is true.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false.
 * @param {int} keyCode (Optional) The code for the key that is in use.
 *      The default is 0.
 * @param {int} charCode (Optional) The Unicode code for the character
 *      associated with the key being used. The default is 0.
 */
function simulateKeyEvent(target /*:HTMLElement*/, type /*:String*/,
                             bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                             view /*:Window*/,
                             ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                             shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                             keyCode /*:int*/,        charCode /*:int*/) /*:Void*/
{
    //check target
    if (!target){
        Y.error("simulateKeyEvent(): Invalid target.");
    }

    //check event type
    if (isString(type)){
        type = type.toLowerCase();
        switch(type){
            case "textevent": //DOM Level 3
                type = "keypress";
                break;
            case "keyup":
            case "keydown":
            case "keypress":
                break;
            default:
                Y.error("simulateKeyEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateKeyEvent(): Event type must be a string.");
    }

    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = true; //all key events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = true; //all key events can be cancelled
    }
    if (!isObject(view)){
        view = window; //view is typically window
    }
    if (!isBoolean(ctrlKey)){
        ctrlKey = false;
    }
    if (!isBoolean(altKey)){
        altKey = false;
    }
    if (!isBoolean(shiftKey)){
        shiftKey = false;
    }
    if (!isBoolean(metaKey)){
        metaKey = false;
    }
    if (!isNumber(keyCode)){
        keyCode = 0;
    }
    if (!isNumber(charCode)){
        charCode = 0;
    }

    //try to create a mouse event
    var customEvent /*:MouseEvent*/ = null;

    //check for DOM-compliant browsers first
    if (isFunction(doc.createEvent)){

        try {

            //try to create key event
            customEvent = doc.createEvent("KeyEvents");

            /*
             * Interesting problem: Firefox implemented a non-standard
             * version of initKeyEvent() based on DOM Level 2 specs.
             * Key event was removed from DOM Level 2 and re-introduced
             * in DOM Level 3 with a different interface. Firefox is the
             * only browser with any implementation of Key Events, so for
             * now, assume it's Firefox if the above line doesn't error.
             */
            // @TODO: Decipher between Firefox's implementation and a correct one.
            customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
                altKey, shiftKey, metaKey, keyCode, charCode);

        } catch (ex /*:Error*/){

            /*
             * If it got here, that means key events aren't officially supported.
             * Safari/WebKit is a real problem now. WebKit 522 won't let you
             * set keyCode, charCode, or other properties if you use a
             * UIEvent, so we first must try to create a generic event. The
             * fun part is that this will throw an error on Safari 2.x. The
             * end result is that we need another try...catch statement just to
             * deal with this mess.
             */
            try {

                //try to create generic event - will fail in Safari 2.x
                customEvent = doc.createEvent("Events");

            } catch (uierror /*:Error*/){

                //the above failed, so create a UIEvent for Safari 2.x
                customEvent = doc.createEvent("UIEvents");

            } finally {

                customEvent.initEvent(type, bubbles, cancelable);

                //initialize
                customEvent.view = view;
                customEvent.altKey = altKey;
                customEvent.ctrlKey = ctrlKey;
                customEvent.shiftKey = shiftKey;
                customEvent.metaKey = metaKey;
                customEvent.keyCode = keyCode;
                customEvent.charCode = charCode;

            }

        }

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.shiftKey = shiftKey;
        customEvent.metaKey = metaKey;

        /*
         * IE doesn't support charCode explicitly. CharCode should
         * take precedence over any keyCode value for accurate
         * representation.
         */
        customEvent.keyCode = (charCode > 0) ? charCode : keyCode;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateKeyEvent(): No event simulation framework present.");
    }
}

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a mouse event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks.
 * @method simulateMouseEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: click, dblclick, mousedown, mouseup, mouseout,
 *      mouseover, and mousemove.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      mouse events except mousemove can be cancelled. The default
 *      is true for all events except mousemove, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) The number of times the mouse button has
 *      been used. The default value is 1.
 * @param {int} screenX (Optional) The x-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} screenY (Optional) The y-coordinate on the screen at which
 *      point the event occured. The default is 0.
 * @param {int} clientX (Optional) The x-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {int} clientY (Optional) The y-coordinate on the client at which
 *      point the event occured. The default is 0.
 * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
 *      is pressed while the event is firing. The default is false.
 * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
 *      is pressed while the event is firing. The default is false.
 * @param {int} button (Optional) The button being pressed while the event
 *      is executing. The value should be 0 for the primary mouse button
 *      (typically the left button), 1 for the terciary mouse button
 *      (typically the middle button), and 2 for the secondary mouse button
 *      (typically the right button). The default is 0.
 * @param {HTMLElement} relatedTarget (Optional) For mouseout events,
 *      this is the element that the mouse has moved to. For mouseover
 *      events, this is the element that the mouse has moved from. This
 *      argument is ignored for all other events. The default is null.
 */
function simulateMouseEvent(target /*:HTMLElement*/, type /*:String*/,
                               bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                               view /*:Window*/,        detail /*:int*/,
                               screenX /*:int*/,        screenY /*:int*/,
                               clientX /*:int*/,        clientY /*:int*/,
                               ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                               shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                               button /*:int*/,         relatedTarget /*:HTMLElement*/) /*:Void*/
{

    //check target
    if (!target){
        Y.error("simulateMouseEvent(): Invalid target.");
    }

    //check event type
    if (isString(type)){
        type = type.toLowerCase();

        //make sure it's a supported mouse event
        if (!mouseEvents[type]){
            Y.error("simulateMouseEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateMouseEvent(): Event type must be a string.");
    }

    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = true; //all mouse events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = (type != "mousemove"); //mousemove is the only one that can't be cancelled
    }
    if (!isObject(view)){
        view = window; //view is typically window
    }
    if (!isNumber(detail)){
        detail = 1;  //number of mouse clicks must be at least one
    }
    if (!isNumber(screenX)){
        screenX = 0;
    }
    if (!isNumber(screenY)){
        screenY = 0;
    }
    if (!isNumber(clientX)){
        clientX = 0;
    }
    if (!isNumber(clientY)){
        clientY = 0;
    }
    if (!isBoolean(ctrlKey)){
        ctrlKey = false;
    }
    if (!isBoolean(altKey)){
        altKey = false;
    }
    if (!isBoolean(shiftKey)){
        shiftKey = false;
    }
    if (!isBoolean(metaKey)){
        metaKey = false;
    }
    if (!isNumber(button)){
        button = 0;
    }

    relatedTarget = relatedTarget || null;

    //try to create a mouse event
    var customEvent /*:MouseEvent*/ = null;

    //check for DOM-compliant browsers first
    if (isFunction(doc.createEvent)){

        customEvent = doc.createEvent("MouseEvents");

        //Safari 2.x (WebKit 418) still doesn't implement initMouseEvent()
        if (customEvent.initMouseEvent){
            customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
                                 screenX, screenY, clientX, clientY,
                                 ctrlKey, altKey, shiftKey, metaKey,
                                 button, relatedTarget);
        } else { //Safari

            //the closest thing available in Safari 2.x is UIEvents
            customEvent = doc.createEvent("UIEvents");
            customEvent.initEvent(type, bubbles, cancelable);
            customEvent.view = view;
            customEvent.detail = detail;
            customEvent.screenX = screenX;
            customEvent.screenY = screenY;
            customEvent.clientX = clientX;
            customEvent.clientY = clientY;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.metaKey = metaKey;
            customEvent.shiftKey = shiftKey;
            customEvent.button = button;
            customEvent.relatedTarget = relatedTarget;
        }

        /*
         * Check to see if relatedTarget has been assigned. Firefox
         * versions less than 2.0 don't allow it to be assigned via
         * initMouseEvent() and the property is readonly after event
         * creation, so in order to keep YAHOO.util.getRelatedTarget()
         * working, assign to the IE proprietary toElement property
         * for mouseout event and fromElement property for mouseover
         * event.
         */
        if (relatedTarget && !customEvent.relatedTarget){
            if (type == "mouseout"){
                customEvent.toElement = relatedTarget;
            } else if (type == "mouseover"){
                customEvent.fromElement = relatedTarget;
            }
        }

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.detail = detail;
        customEvent.screenX = screenX;
        customEvent.screenY = screenY;
        customEvent.clientX = clientX;
        customEvent.clientY = clientY;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.metaKey = metaKey;
        customEvent.shiftKey = shiftKey;

        //fix button property for IE's wacky implementation
        switch(button){
            case 0:
                customEvent.button = 1;
                break;
            case 1:
                customEvent.button = 4;
                break;
            case 2:
                //leave as is
                break;
            default:
                customEvent.button = 0;
        }

        /*
         * Have to use relatedTarget because IE won't allow assignment
         * to toElement or fromElement on generic events. This keeps
         * YAHOO.util.customEvent.getRelatedTarget() functional.
         */
        customEvent.relatedTarget = relatedTarget;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateMouseEvent(): No event simulation framework present.");
    }
}

/*
 * Note: Intentionally not for YUIDoc generation.
 * Simulates a UI event using the given event information to populate
 * the generated event object. This method does browser-equalizing
 * calculations to account for differences in the DOM and IE event models
 * as well as different browser quirks.
 * @method simulateHTMLEvent
 * @private
 * @static
 * @param {HTMLElement} target The target of the given event.
 * @param {String} type The type of event to fire. This can be any one of
 *      the following: click, dblclick, mousedown, mouseup, mouseout,
 *      mouseover, and mousemove.
 * @param {Boolean} bubbles (Optional) Indicates if the event can be
 *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
 *      default. The default is true.
 * @param {Boolean} cancelable (Optional) Indicates if the event can be
 *      canceled using preventDefault(). DOM Level 2 specifies that all
 *      mouse events except mousemove can be cancelled. The default
 *      is true for all events except mousemove, for which the default
 *      is false.
 * @param {Window} view (Optional) The view containing the target. This is
 *      typically the window object. The default is window.
 * @param {int} detail (Optional) The number of times the mouse button has
 *      been used. The default value is 1.
 */
function simulateUIEvent(target /*:HTMLElement*/, type /*:String*/,
                               bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                               view /*:Window*/,        detail /*:int*/) /*:Void*/
{

    //check target
    if (!target){
        Y.error("simulateUIEvent(): Invalid target.");
    }

    //check event type
    if (isString(type)){
        type = type.toLowerCase();

        //make sure it's a supported mouse event
        if (!uiEvents[type]){
            Y.error("simulateUIEvent(): Event type '" + type + "' not supported.");
        }
    } else {
        Y.error("simulateUIEvent(): Event type must be a string.");
    }

    //try to create a mouse event
    var customEvent = null;


    //setup default values
    if (!isBoolean(bubbles)){
        bubbles = (type in bubbleEvents);  //not all events bubble
    }
    if (!isBoolean(cancelable)){
        cancelable = (type == "submit"); //submit is the only one that can be cancelled
    }
    if (!isObject(view)){
        view = window; //view is typically window
    }
    if (!isNumber(detail)){
        detail = 1;  //usually not used but defaulted to this
    }

    //check for DOM-compliant browsers first
    if (isFunction(doc.createEvent)){

        //just a generic UI Event object is needed
        customEvent = doc.createEvent("UIEvents");
        customEvent.initUIEvent(type, bubbles, cancelable, view, detail);

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (isObject(doc.createEventObject)){ //IE

        //create an IE event object
        customEvent = doc.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.detail = detail;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        Y.error("simulateUIEvent(): No event simulation framework present.");
    }
}

/**
 * Simulates the event with the given name on a target.
 * @param {HTMLElement} target The DOM element that's the target of the event.
 * @param {String} type The type of event to simulate (i.e., "click").
 * @param {Object} options (Optional) Extra options to copy onto the event object.
 * @return {void}
 * @for Event
 * @method simulate
 * @static
 */
Y.Event.simulate = function(target, type, options){

    options = options || {};

    if (mouseEvents[type]){
        simulateMouseEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.detail, options.screenX,
            options.screenY, options.clientX, options.clientY, options.ctrlKey,
            options.altKey, options.shiftKey, options.metaKey, options.button,
            options.relatedTarget);
    } else if (keyEvents[type]){
        simulateKeyEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.ctrlKey,
            options.altKey, options.shiftKey, options.metaKey,
            options.keyCode, options.charCode);
    } else if (uiEvents[type]){
        simulateUIEvent(target, type, options.bubbles,
            options.cancelable, options.view, options.detail);
     } else {
        Y.error("simulate(): Event '" + type + "' can't be simulated.");
    }
};


})();



}, '3.3.0' ,{requires:['event-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('dump', function(Y) {

/**
 * Returns a simple string representation of the object or array.
 * Other types of objects will be returned unprocessed.  Arrays
 * are expected to be indexed.  Use object notation for
 * associative arrays.
 *
 * If included, the dump method is added to the YUI instance.
 *
 * @module dump
 */

    var L = Y.Lang,
        OBJ = '{...}',
        FUN = 'f(){...}',
        COMMA = ', ',
        ARROW = ' => ',

    /**
     * The following methods are added to the YUI instance
     * @class YUI~dump
     */

    /**
     * Returns a simple string representation of the object or array.
     * Other types of objects will be returned unprocessed.  Arrays
     * are expected to be indexed.  Use object notation for
     * associative arrays.
     *
     * This method is in the 'dump' module, which is not bundled with
     * the core YUI object
     *
     * @method dump
     * @param {object} o The object to dump.
     * @param {int} d How deep to recurse child objects, default 3.
     * @return {string} the dump result.
     */
    dump = function(o, d) {
        var i, len, s = [], type = L.type(o);

        // Cast non-objects to string
        // Skip dates because the std toString is what we want
        // Skip HTMLElement-like objects because trying to dump
        // an element will cause an unhandled exception in FF 2.x
        if (!L.isObject(o)) {
            return o + '';
        } else if (type == 'date') {
            return o;
        } else if (o.nodeType && o.tagName) {
            return o.tagName + '#' + o.id;
        } else if (o.document && o.navigator) {
            return 'window';
        } else if (o.location && o.body) {
            return 'document';
        } else if (type == 'function') {
            return FUN;
        }

        // dig into child objects the depth specifed. Default 3
        d = (L.isNumber(d)) ? d : 3;

        // arrays [1, 2, 3]
        if (type == 'array') {
            s.push('[');
            for (i = 0, len = o.length; i < len; i = i + 1) {
                if (L.isObject(o[i])) {
                    s.push((d > 0) ? L.dump(o[i], d - 1) : OBJ);
                } else {
                    s.push(o[i]);
                }
                s.push(COMMA);
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push(']');
        // regexp /foo/
        } else if (type == 'regexp') {
            s.push(o.toString());
        // objects {k1 => v1, k2 => v2}
        } else {
            s.push('{');
            for (i in o) {
                if (o.hasOwnProperty(i)) {
                    try {
                        s.push(i + ARROW);
                        if (L.isObject(o[i])) {
                            s.push((d > 0) ? L.dump(o[i], d - 1) : OBJ);
                        } else {
                            s.push(o[i]);
                        }
                        s.push(COMMA);
                    } catch (e) {
                        s.push('Error: ' + e.message);
                    }
                }
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push('}');
        }

        return s.join('');
    };

    Y.dump = dump;
    L.dump = dump;



}, '3.3.0' );
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('substitute', function(Y) {

/**
 * String variable substitution and string formatting.
 * If included, the substitute method is added to the YUI instance.
 *
 * @module substitute
 */

    var L = Y.Lang, DUMP = 'dump', SPACE = ' ', LBRACE = '{', RBRACE = '}',

    /**
     * The following methods are added to the YUI instance
     * @class YUI~substitute
     */

    /**
     * Does variable substitution on a string. It scans through the string
     * looking for expressions enclosed in { } braces. If an expression
     * is found, it is used a key on the object.  If there is a space in
     * the key, the first word is used for the key and the rest is provided
     * to an optional function to be used to programatically determine the
     * value (the extra information might be used for this decision). If
     * the value for the key in the object, or what is returned from the
     * function has a string value, number value, or object value, it is
     * substituted for the bracket expression and it repeats.  If this
     * value is an object, it uses the Object's toString() if this has
     * been overridden, otherwise it does a shallow dump of the key/value
     * pairs if Y.dump is available (if dump isn't available, toString()
     * is used).
     *
     * This method is included in the 'substitute' module.  It is not included
     * in the YUI module.
     *
     * @method substitute
     * @param {string} s The string that will be modified.
     * @param {object} o An object containing the replacement values.
     * @param {function} f An optional function that can be used to
     *                     process each match.  It receives the key,
     *                     value, and any extra metadata included with
     *                     the key inside of the braces.
     * @param {boolean} recurse if true, the replacement will be recursive,
     * letting you have replacement tokens in replacement text.  The
     * default is false.
     * @return {string} the substituted string.
     */

    substitute = function(s, o, f, recurse) {
        var i, j, k, key, v, meta, saved = [], token, dump,
            lidx = s.length;

        for (;;) {
            i = s.lastIndexOf(LBRACE, lidx);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (!Y.dump) {
                    v = v.toString();
                } else {
                    if (L.isArray(v)) {
                        v = Y.dump(v, parseInt(meta, 10));
                    } else {
                        meta = meta || '';

                        // look for the keyword 'dump', if found force obj dump
                        dump = meta.indexOf(DUMP);
                        if (dump > -1) {
                            meta = meta.substring(4);
                        }

                        // use the toString if it is not the Object toString
                        // and the 'dump' meta info was not found
                        if (v.toString === Object.prototype.toString ||
                            dump > -1) {
                            v = Y.dump(v, parseInt(meta, 10));
                        } else {
                            v = v.toString();
                        }
                    }
                }
            } else if (!L.isString(v) && !L.isNumber(v)) {
                // This {block} has no replace string. Save it for later.
                v = '~-' + saved.length + '-~';
                saved[saved.length] = token;

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);

            if (!recurse) {
                lidx = i - 1;
            }

        }

        // restore saved {block}s
        for (i = saved.length - 1; i >= 0; i = i - 1) {
            s = s.replace(new RegExp('~-' + i + '-~'), LBRACE +
                saved[i] + RBRACE, 'g');
        }

        return s;

    };

    Y.substitute = substitute;
    L.substitute = substitute;



}, '3.3.0' ,{optional:['dump']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('dom-base', function(Y) {

(function(Y) {
/**
 * The DOM utility provides a cross-browser abtraction layer
 * normalizing DOM tasks, and adds extra helper functionality
 * for other common tasks.
 * @module dom
 * @submodule dom-base
 * @for DOM
 *
 */

/**
 * Provides DOM helper methods.
 * @class DOM
 *
 */
var NODE_TYPE = 'nodeType',
    OWNER_DOCUMENT = 'ownerDocument',
    DOCUMENT_ELEMENT = 'documentElement',
    DEFAULT_VIEW = 'defaultView',
    PARENT_WINDOW = 'parentWindow',
    TAG_NAME = 'tagName',
    PARENT_NODE = 'parentNode',
    FIRST_CHILD = 'firstChild',
    PREVIOUS_SIBLING = 'previousSibling',
    NEXT_SIBLING = 'nextSibling',
    CONTAINS = 'contains',
    COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
    EMPTY_STRING = '',
    EMPTY_ARRAY = [],

    documentElement = Y.config.doc.documentElement,

    re_tag = /<([a-z]+)/i,

    createFromDIV = function(html, tag) {
        var div = Y.config.doc.createElement('div'),
            ret = true;

        div.innerHTML = html;
        if (!div.firstChild || div.firstChild.tagName !== tag.toUpperCase()) {
            ret = false;
        }

        return ret;
    },

    addFeature = Y.Features.add,
    testFeature = Y.Features.test,

Y_DOM = {
    /**
     * Returns the HTMLElement with the given ID (Wrapper for document.getElementById).
     * @method byId
     * @param {String} id the id attribute
     * @param {Object} doc optional The document to search. Defaults to current document
     * @return {HTMLElement | null} The HTMLElement with the id, or null if none found.
     */
    byId: function(id, doc) {
        // handle dupe IDs and IE name collision
        return Y_DOM.allById(id, doc)[0] || null;
    },

    /**
     * Returns the text content of the HTMLElement.
     * @method getText
     * @param {HTMLElement} element The html element.
     * @return {String} The text content of the element (includes text of any descending elements).
     */
    getText: (documentElement.textContent !== undefined) ?
        function(element) {
            var ret = '';
            if (element) {
                ret = element.textContent;
            }
            return ret || '';
        } : function(element) {
            var ret = '';
            if (element) {
                ret = element.innerText || element.nodeValue; // might be a textNode
            }
            return ret || '';
        },

    /**
     * Sets the text content of the HTMLElement.
     * @method setText
     * @param {HTMLElement} element The html element.
     * @param {String} content The content to add.
     */
    setText: (documentElement.textContent !== undefined) ?
        function(element, content) {
            if (element) {
                element.textContent = content;
            }
        } : function(element, content) {
            if ('innerText' in element) {
                element.innerText = content;
            } else if ('nodeValue' in element) {
                element.nodeValue = content;
            }

        },

    /*
     * Finds the ancestor of the element.
     * @method ancestor
     * @param {HTMLElement} element The html element.
     * @param {Function} fn optional An optional boolean test to apply.
     * The optional function is passed the current DOM node being tested as its only argument.
     * If no function is given, the parentNode is returned.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @return {HTMLElement | null} The matching DOM node or null if none found.
     */
    ancestor: function(element, fn, testSelf) {
        var ret = null;
        if (testSelf) {
            ret = (!fn || fn(element)) ? element : null;

        }
        return ret || Y_DOM.elementByAxis(element, PARENT_NODE, fn, null);
    },

    /*
     * Finds the ancestors of the element.
     * @method ancestors
     * @param {HTMLElement} element The html element.
     * @param {Function} fn optional An optional boolean test to apply.
     * The optional function is passed the current DOM node being tested as its only argument.
     * If no function is given, all ancestors are returned.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @return {Array} An array containing all matching DOM nodes.
     */
    ancestors: function(element, fn, testSelf) {
        var ancestor = Y_DOM.ancestor.apply(Y_DOM, arguments),
            ret = (ancestor) ? [ancestor] : [];

        while ((ancestor = Y_DOM.ancestor(ancestor, fn))) {
            if (ancestor) {
                ret.unshift(ancestor);
            }
        }

        return ret;
    },

    /**
     * Searches the element by the given axis for the first matching element.
     * @method elementByAxis
     * @param {HTMLElement} element The html element.
     * @param {String} axis The axis to search (parentNode, nextSibling, previousSibling).
     * @param {Function} fn optional An optional boolean test to apply.
     * @param {Boolean} all optional Whether all node types should be returned, or just element nodes.
     * The optional function is passed the current HTMLElement being tested as its only argument.
     * If no function is given, the first element is returned.
     * @return {HTMLElement | null} The matching element or null if none found.
     */
    elementByAxis: function(element, axis, fn, all) {
        while (element && (element = element[axis])) { // NOTE: assignment
                if ( (all || element[TAG_NAME]) && (!fn || fn(element)) ) {
                    return element;
                }
        }
        return null;
    },

    /**
     * Determines whether or not one HTMLElement is or contains another HTMLElement.
     * @method contains
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} needle The html element that may be contained.
     * @return {Boolean} Whether or not the element is or contains the needle.
     */
    contains: function(element, needle) {
        var ret = false;

        if ( !needle || !element || !needle[NODE_TYPE] || !element[NODE_TYPE]) {
            ret = false;
        } else if (element[CONTAINS])  {
            if (Y.UA.opera || needle[NODE_TYPE] === 1) { // IE & SAF contains fail if needle not an ELEMENT_NODE
                ret = element[CONTAINS](needle);
            } else {
                ret = Y_DOM._bruteContains(element, needle);
            }
        } else if (element[COMPARE_DOCUMENT_POSITION]) { // gecko
            if (element === needle || !!(element[COMPARE_DOCUMENT_POSITION](needle) & 16)) {
                ret = true;
            }
        }

        return ret;
    },

    /**
     * Determines whether or not the HTMLElement is part of the document.
     * @method inDoc
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} doc optional The document to check.
     * @return {Boolean} Whether or not the element is attached to the document.
     */
    inDoc: function(element, doc) {
        var ret = false,
            rootNode;

        if (element && element.nodeType) {
            (doc) || (doc = element[OWNER_DOCUMENT]);

            rootNode = doc[DOCUMENT_ELEMENT];

            // contains only works with HTML_ELEMENT
            if (rootNode && rootNode.contains && element.tagName) {
                ret = rootNode.contains(element);
            } else {
                ret = Y_DOM.contains(rootNode, element);
            }
        }

        return ret;

    },

   allById: function(id, root) {
        root = root || Y.config.doc;
        var nodes = [],
            ret = [],
            i,
            node;

        if (root.querySelectorAll) {
            ret = root.querySelectorAll('[id="' + id + '"]');
        } else if (root.all) {
            nodes = root.all(id);

            if (nodes) {
                // root.all may return HTMLElement or HTMLCollection.
                // some elements are also HTMLCollection (FORM, SELECT).
                if (nodes.nodeName) {
                    if (nodes.id === id) { // avoid false positive on name
                        ret.push(nodes);
                        nodes = EMPTY_ARRAY; // done, no need to filter
                    } else { //  prep for filtering
                        nodes = [nodes];
                    }
                }

                if (nodes.length) {
                    // filter out matches on node.name
                    // and element.id as reference to element with id === 'id'
                    for (i = 0; node = nodes[i++];) {
                        if (node.id === id  ||
                                (node.attributes && node.attributes.id &&
                                node.attributes.id.value === id)) {
                            ret.push(node);
                        }
                    }
                }
            }
        } else {
            ret = [Y_DOM._getDoc(root).getElementById(id)];
        }

        return ret;
   },

    /**
     * Creates a new dom node using the provided markup string.
     * @method create
     * @param {String} html The markup used to create the element
     * @param {HTMLDocument} doc An optional document context
     * @return {HTMLElement|DocumentFragment} returns a single HTMLElement
     * when creating one node, and a documentFragment when creating
     * multiple nodes.
     */
    create: function(html, doc) {
        if (typeof html === 'string') {
            html = Y.Lang.trim(html); // match IE which trims whitespace from innerHTML

        }

        doc = doc || Y.config.doc;
        var m = re_tag.exec(html),
            create = Y_DOM._create,
            custom = Y_DOM.creators,
            ret = null,
            creator,
            tag, nodes;

        if (html != undefined) { // not undefined or null
            if (m && m[1]) {
                creator = custom[m[1].toLowerCase()];
                if (typeof creator === 'function') {
                    create = creator;
                } else {
                    tag = creator;
                }
            }

            nodes = create(html, doc, tag).childNodes;

            if (nodes.length === 1) { // return single node, breaking parentNode ref from "fragment"
                ret = nodes[0].parentNode.removeChild(nodes[0]);
            } else if (nodes[0] && nodes[0].className === 'yui3-big-dummy') { // using dummy node to preserve some attributes (e.g. OPTION not selected)
                if (nodes.length === 2) {
                    ret = nodes[0].nextSibling;
                } else {
                    nodes[0].parentNode.removeChild(nodes[0]);
                     ret = Y_DOM._nl2frag(nodes, doc);
                }
            } else { // return multiple nodes as a fragment
                 ret = Y_DOM._nl2frag(nodes, doc);
            }
        }

        return ret;
    },

    _nl2frag: function(nodes, doc) {
        var ret = null,
            i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            doc = doc || nodes[0].ownerDocument;
            ret = doc.createDocumentFragment();

            if (nodes.item) { // convert live list to static array
                nodes = Y.Array(nodes, 0, true);
            }

            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } // else inline with log for minification
        return ret;
    },


    CUSTOM_ATTRIBUTES: (!documentElement.hasAttribute) ? { // IE < 8
        'for': 'htmlFor',
        'class': 'className'
    } : { // w3c
        'htmlFor': 'for',
        'className': 'class'
    },

    /**
     * Provides a normalized attribute interface.
     * @method setAttibute
     * @param {HTMLElement} el The target element for the attribute.
     * @param {String} attr The attribute to set.
     * @param {String} val The value of the attribute.
     */
    setAttribute: function(el, attr, val, ieAttr) {
        if (el && attr && el.setAttribute) {
            attr = Y_DOM.CUSTOM_ATTRIBUTES[attr] || attr;
            el.setAttribute(attr, val, ieAttr);
        }
    },


    /**
     * Provides a normalized attribute interface.
     * @method getAttibute
     * @param {HTMLElement} el The target element for the attribute.
     * @param {String} attr The attribute to get.
     * @return {String} The current value of the attribute.
     */
    getAttribute: function(el, attr, ieAttr) {
        ieAttr = (ieAttr !== undefined) ? ieAttr : 2;
        var ret = '';
        if (el && attr && el.getAttribute) {
            attr = Y_DOM.CUSTOM_ATTRIBUTES[attr] || attr;
            ret = el.getAttribute(attr, ieAttr);

            if (ret === null) {
                ret = ''; // per DOM spec
            }
        }
        return ret;
    },

    isWindow: function(obj) {
        return !!(obj && obj.alert && obj.document);
    },

    _fragClones: {},

    _create: function(html, doc, tag) {
        tag = tag || 'div';

        var frag = Y_DOM._fragClones[tag];
        if (frag) {
            frag = frag.cloneNode(false);
        } else {
            frag = Y_DOM._fragClones[tag] = doc.createElement(tag);
        }
        frag.innerHTML = html;
        return frag;
    },

    _removeChildNodes: function(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },

    /**
     * Inserts content in a node at the given location
     * @method addHTML
     * @param {HTMLElement} node The node to insert into
     * @param {HTMLElement | Array | HTMLCollection} content The content to be inserted
     * @param {HTMLElement} where Where to insert the content
     * If no "where" is given, content is appended to the node
     * Possible values for "where"
     * <dl>
     * <dt>HTMLElement</dt>
     * <dd>The element to insert before</dd>
     * <dt>"replace"</dt>
     * <dd>Replaces the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts before the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts content before the node</dd>
     * <dt>"after"</dt>
     * <dd>Inserts content after the node</dd>
     * </dl>
     */
    addHTML: function(node, content, where) {
        var nodeParent = node.parentNode,
            i = 0,
            item,
            ret = content,
            newNode;


        if (content != undefined) { // not null or undefined (maybe 0)
            if (content.nodeType) { // DOM node, just add it
                newNode = content;
            } else if (typeof content == 'string' || typeof content == 'number') {
                ret = newNode = Y_DOM.create(content);
            } else if (content[0] && content[0].nodeType) { // array or collection
                newNode = Y.config.doc.createDocumentFragment();
                while ((item = content[i++])) {
                    newNode.appendChild(item); // append to fragment for insertion
                }
            }
        }

        if (where) {
            if (where.nodeType) { // insert regardless of relationship to node
                where.parentNode.insertBefore(newNode, where);
            } else {
                switch (where) {
                    case 'replace':
                        while (node.firstChild) {
                            node.removeChild(node.firstChild);
                        }
                        if (newNode) { // allow empty content to clear node
                            node.appendChild(newNode);
                        }
                        break;
                    case 'before':
                        nodeParent.insertBefore(newNode, node);
                        break;
                    case 'after':
                        if (node.nextSibling) { // IE errors if refNode is null
                            nodeParent.insertBefore(newNode, node.nextSibling);
                        } else {
                            nodeParent.appendChild(newNode);
                        }
                        break;
                    default:
                        node.appendChild(newNode);
                }
            }
        } else if (newNode) {
            node.appendChild(newNode);
        }

        return ret;
    },

    VALUE_SETTERS: {},

    VALUE_GETTERS: {},

    getValue: function(node) {
        var ret = '', // TODO: return null?
            getter;

        if (node && node[TAG_NAME]) {
            getter = Y_DOM.VALUE_GETTERS[node[TAG_NAME].toLowerCase()];

            if (getter) {
                ret = getter(node);
            } else {
                ret = node.value;
            }
        }

        // workaround for IE8 JSON stringify bug
        // which converts empty string values to null
        if (ret === EMPTY_STRING) {
            ret = EMPTY_STRING; // for real
        }

        return (typeof ret === 'string') ? ret : '';
    },

    setValue: function(node, val) {
        var setter;

        if (node && node[TAG_NAME]) {
            setter = Y_DOM.VALUE_SETTERS[node[TAG_NAME].toLowerCase()];

            if (setter) {
                setter(node, val);
            } else {
                node.value = val;
            }
        }
    },

    siblings: function(node, fn) {
        var nodes = [],
            sibling = node;

        while ((sibling = sibling[PREVIOUS_SIBLING])) {
            if (sibling[TAG_NAME] && (!fn || fn(sibling))) {
                nodes.unshift(sibling);
            }
        }

        sibling = node;
        while ((sibling = sibling[NEXT_SIBLING])) {
            if (sibling[TAG_NAME] && (!fn || fn(sibling))) {
                nodes.push(sibling);
            }
        }

        return nodes;
    },

    /**
     * Brute force version of contains.
     * Used for browsers without contains support for non-HTMLElement Nodes (textNodes, etc).
     * @method _bruteContains
     * @private
     * @param {HTMLElement} element The containing html element.
     * @param {HTMLElement} needle The html element that may be contained.
     * @return {Boolean} Whether or not the element is or contains the needle.
     */
    _bruteContains: function(element, needle) {
        while (needle) {
            if (element === needle) {
                return true;
            }
            needle = needle.parentNode;
        }
        return false;
    },

// TODO: move to Lang?
    /**
     * Memoizes dynamic regular expressions to boost runtime performance.
     * @method _getRegExp
     * @private
     * @param {String} str The string to convert to a regular expression.
     * @param {String} flags optional An optinal string of flags.
     * @return {RegExp} An instance of RegExp
     */
    _getRegExp: function(str, flags) {
        flags = flags || '';
        Y_DOM._regexCache = Y_DOM._regexCache || {};
        if (!Y_DOM._regexCache[str + flags]) {
            Y_DOM._regexCache[str + flags] = new RegExp(str, flags);
        }
        return Y_DOM._regexCache[str + flags];
    },

// TODO: make getDoc/Win true privates?
    /**
     * returns the appropriate document.
     * @method _getDoc
     * @private
     * @param {HTMLElement} element optional Target element.
     * @return {Object} The document for the given element or the default document.
     */
    _getDoc: function(element) {
        var doc = Y.config.doc;
        if (element) {
            doc = (element[NODE_TYPE] === 9) ? element : // element === document
                element[OWNER_DOCUMENT] || // element === DOM node
                element.document || // element === window
                Y.config.doc; // default
        }

        return doc;
    },

    /**
     * returns the appropriate window.
     * @method _getWin
     * @private
     * @param {HTMLElement} element optional Target element.
     * @return {Object} The window for the given element or the default window.
     */
    _getWin: function(element) {
        var doc = Y_DOM._getDoc(element);
        return doc[DEFAULT_VIEW] || doc[PARENT_WINDOW] || Y.config.win;
    },

    _batch: function(nodes, fn, arg1, arg2, arg3, etc) {
        fn = (typeof fn === 'string') ? Y_DOM[fn] : fn;
        var result,
            args = Array.prototype.slice.call(arguments, 2),
            i = 0,
            node,
            ret;

        if (fn && nodes) {
            while ((node = nodes[i++])) {
                result = result = fn.call(Y_DOM, node, arg1, arg2, arg3, etc);
                if (typeof result !== 'undefined') {
                    (ret) || (ret = []);
                    ret.push(result);
                }
            }
        }

        return (typeof ret !== 'undefined') ? ret : nodes;
    },

    wrap: function(node, html) {
        var parent = Y.DOM.create(html),
            nodes = parent.getElementsByTagName('*');

        if (nodes.length) {
            parent = nodes[nodes.length - 1];
        }

        if (node.parentNode) {
            node.parentNode.replaceChild(parent, node);
        }
        parent.appendChild(node);
    },

    unwrap: function(node) {
        var parent = node.parentNode,
            lastChild = parent.lastChild,
            node = parent.firstChild,
            next = node,
            grandparent;

        if (parent) {
            grandparent = parent.parentNode;
            if (grandparent) {
                while (node !== lastChild) {
                    next = node.nextSibling;
                    grandparent.insertBefore(node, parent);
                    node = next;
                }
                grandparent.replaceChild(lastChild, parent);
            } else {
                parent.removeChild(node);
            }
        }
    },

    generateID: function(el) {
        var id = el.id;

        if (!id) {
            id = Y.stamp(el);
            el.id = id;
        }

        return id;
    },

    creators: {}
};

addFeature('innerhtml', 'table', {
    test: function() {
        var node = Y.config.doc.createElement('table');
        try {
            node.innerHTML = '<tbody></tbody>';
        } catch(e) {
            return false;
        }
        return (node.firstChild && node.firstChild.nodeName === 'TBODY');
    }
});

addFeature('innerhtml-div', 'tr', {
    test: function() {
        return createFromDIV('<tr></tr>', 'tr');
    }
});

addFeature('innerhtml-div', 'script', {
    test: function() {
        return createFromDIV('<script></script>', 'script');
    }
});

addFeature('value-set', 'select', {
    test: function() {
        var node = Y.config.doc.createElement('select');
        node.innerHTML = '<option>1</option><option>2</option>';
        node.value = '2';
        return (node.value && node.value === '2');
    }
});

(function(Y) {
    var creators = Y_DOM.creators,
        create = Y_DOM.create,
        re_tbody = /(?:\/(?:thead|tfoot|tbody|caption|col|colgroup)>)+\s*<tbody/,

        TABLE_OPEN = '<table>',
        TABLE_CLOSE = '</table>';

    if (!testFeature('innerhtml', 'table')) {
        // TODO: thead/tfoot with nested tbody
            // IE adds TBODY when creating TABLE elements (which may share this impl)
        creators.tbody = function(html, doc) {
            var frag = create(TABLE_OPEN + html + TABLE_CLOSE, doc),
                tb = frag.children.tags('tbody')[0];

            if (frag.children.length > 1 && tb && !re_tbody.test(html)) {
                tb[PARENT_NODE].removeChild(tb); // strip extraneous tbody
            }
            return frag;
        };
    }

    if (!testFeature('innerhtml-div', 'script')) {
        creators.script = function(html, doc) {
            var frag = doc.createElement('div');

            frag.innerHTML = '-' + html;
            frag.removeChild(frag[FIRST_CHILD]);
            return frag;
        }

        Y_DOM.creators.link = Y_DOM.creators.style = Y_DOM.creators.script;
    }


    if (!testFeature('value-set', 'select')) {
        Y_DOM.VALUE_SETTERS.select = function(node, val) {
            for (var i = 0, options = node.getElementsByTagName('option'), option;
                    option = options[i++];) {
                if (Y_DOM.getValue(option) === val) {
                    option.selected = true;
                    //Y_DOM.setAttribute(option, 'selected', 'selected');
                    break;
                }
            }
        }
    }

    Y.mix(Y_DOM.VALUE_GETTERS, {
        button: function(node) {
            return (node.attributes && node.attributes.value) ? node.attributes.value.value : '';
        }
    });

    Y.mix(Y_DOM.VALUE_SETTERS, {
        // IE: node.value changes the button text, which should be handled via innerHTML
        button: function(node, val) {
            var attr = node.attributes.value;
            if (!attr) {
                attr = node[OWNER_DOCUMENT].createAttribute('value');
                node.setAttributeNode(attr);
            }

            attr.value = val;
        }
    });


    if (!testFeature('innerhtml-div', 'tr')) {
        Y.mix(creators, {
            option: function(html, doc) {
                return create('<select><option class="yui3-big-dummy" selected></option>' + html + '</select>', doc);
            },

            tr: function(html, doc) {
                return create('<tbody>' + html + '</tbody>', doc);
            },

            td: function(html, doc) {
                return create('<tr>' + html + '</tr>', doc);
            },

            col: function(html, doc) {
                return create('<colgroup>' + html + '</colgroup>', doc);
            },

            tbody: 'table'
        });

        Y.mix(creators, {
            legend: 'fieldset',
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody,
            optgroup: creators.option
        });
    }

    Y.mix(Y_DOM.VALUE_GETTERS, {
        option: function(node) {
            var attrs = node.attributes;
            return (attrs.value && attrs.value.specified) ? node.value : node.text;
        },

        select: function(node) {
            var val = node.value,
                options = node.options;

            if (options && options.length) {
                // TODO: implement multipe select
                if (node.multiple) {
                } else {
                    val = Y_DOM.getValue(options[node.selectedIndex]);
                }
            }

            return val;
        }
    });
})(Y);

Y.DOM = Y_DOM;
})(Y);
var addClass, hasClass, removeClass;

Y.mix(Y.DOM, {
    /**
     * Determines whether a DOM element has the given className.
     * @method hasClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to search for
     * @return {Boolean} Whether or not the element has the given class.
     */
    hasClass: function(node, className) {
        var re = Y.DOM._getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
        return re.test(node.className);
    },

    /**
     * Adds a class name to a given DOM element.
     * @method addClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to add to the class attribute
     */
    addClass: function(node, className) {
        if (!Y.DOM.hasClass(node, className)) { // skip if already present
            node.className = Y.Lang.trim([node.className, className].join(' '));
        }
    },

    /**
     * Removes a class name from a given element.
     * @method removeClass
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {String} className the class name to remove from the class attribute
     */
    removeClass: function(node, className) {
        if (className && hasClass(node, className)) {
            node.className = Y.Lang.trim(node.className.replace(Y.DOM._getRegExp('(?:^|\\s+)' +
                            className + '(?:\\s+|$)'), ' '));

            if ( hasClass(node, className) ) { // in case of multiple adjacent
                removeClass(node, className);
            }
        }
    },

    /**
     * Replace a class with another class for a given element.
     * If no oldClassName is present, the newClassName is simply added.
     * @method replaceClass
     * @for DOM
     * @param {HTMLElement} element The DOM element
     * @param {String} oldClassName the class name to be replaced
     * @param {String} newClassName the class name that will be replacing the old class name
     */
    replaceClass: function(node, oldC, newC) {
        removeClass(node, oldC); // remove first in case oldC === newC
        addClass(node, newC);
    },

    /**
     * If the className exists on the node it is removed, if it doesn't exist it is added.
     * @method toggleClass
     * @for DOM
     * @param {HTMLElement} element The DOM element
     * @param {String} className the class name to be toggled
     * @param {Boolean} addClass optional boolean to indicate whether class
     * should be added or removed regardless of current state
     */
    toggleClass: function(node, className, force) {
        var add = (force !== undefined) ? force :
                !(hasClass(node, className));

        if (add) {
            addClass(node, className);
        } else {
            removeClass(node, className);
        }
    }
});

hasClass = Y.DOM.hasClass;
removeClass = Y.DOM.removeClass;
addClass = Y.DOM.addClass;

Y.mix(Y.DOM, {
    /**
     * Sets the width of the element to the given size, regardless
     * of box model, border, padding, etc.
     * @method setWidth
     * @param {HTMLElement} element The DOM element.
     * @param {String|Int} size The pixel height to size to
     */

    setWidth: function(node, size) {
        Y.DOM._setSize(node, 'width', size);
    },

    /**
     * Sets the height of the element to the given size, regardless
     * of box model, border, padding, etc.
     * @method setHeight
     * @param {HTMLElement} element The DOM element.
     * @param {String|Int} size The pixel height to size to
     */

    setHeight: function(node, size) {
        Y.DOM._setSize(node, 'height', size);
    },

    _setSize: function(node, prop, val) {
        val = (val > 0) ? val : 0;
        var size = 0;

        node.style[prop] = val + 'px';
        size = (prop === 'height') ? node.offsetHeight : node.offsetWidth;

        if (size > val) {
            val = val - (size - val);

            if (val < 0) {
                val = 0;
            }

            node.style[prop] = val + 'px';
        }
    }
});


}, '3.3.0' ,{requires:['oop']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('selector-native', function(Y) {

(function(Y) {
/**
 * The selector-native module provides support for native querySelector
 * @module dom
 * @submodule selector-native
 * @for Selector
 */

/**
 * Provides support for using CSS selectors to query the DOM
 * @class Selector
 * @static
 * @for Selector
 */

Y.namespace('Selector'); // allow native module to standalone

var COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
    OWNER_DOCUMENT = 'ownerDocument';

var Selector = {
    _foundCache: [],

    useNative: true,

    _compare: ('sourceIndex' in Y.config.doc.documentElement) ?
        function(nodeA, nodeB) {
            var a = nodeA.sourceIndex,
                b = nodeB.sourceIndex;

            if (a === b) {
                return 0;
            } else if (a > b) {
                return 1;
            }

            return -1;

        } : (Y.config.doc.documentElement[COMPARE_DOCUMENT_POSITION] ?
        function(nodeA, nodeB) {
            if (nodeA[COMPARE_DOCUMENT_POSITION](nodeB) & 4) {
                return -1;
            } else {
                return 1;
            }
        } :
        function(nodeA, nodeB) {
            var rangeA, rangeB, compare;
            if (nodeA && nodeB) {
                rangeA = nodeA[OWNER_DOCUMENT].createRange();
                rangeA.setStart(nodeA, 0);
                rangeB = nodeB[OWNER_DOCUMENT].createRange();
                rangeB.setStart(nodeB, 0);
                compare = rangeA.compareBoundaryPoints(1, rangeB); // 1 === Range.START_TO_END
            }

            return compare;

    }),

    _sort: function(nodes) {
        if (nodes) {
            nodes = Y.Array(nodes, 0, true);
            if (nodes.sort) {
                nodes.sort(Selector._compare);
            }
        }

        return nodes;
    },

    _deDupe: function(nodes) {
        var ret = [],
            i, node;

        for (i = 0; (node = nodes[i++]);) {
            if (!node._found) {
                ret[ret.length] = node;
                node._found = true;
            }
        }

        for (i = 0; (node = ret[i++]);) {
            node._found = null;
            node.removeAttribute('_found');
        }

        return ret;
    },

    /**
     * Retrieves a set of nodes based on a given CSS selector.
     * @method query
     *
     * @param {string} selector The CSS Selector to test the node against.
     * @param {HTMLElement} root optional An HTMLElement to start the query from. Defaults to Y.config.doc
     * @param {Boolean} firstOnly optional Whether or not to return only the first match.
     * @return {Array} An array of nodes that match the given selector.
     * @static
     */
    query: function(selector, root, firstOnly, skipNative) {
        root = root || Y.config.doc;
        var ret = [],
            useNative = (Y.Selector.useNative && Y.config.doc.querySelector && !skipNative),
            queries = [[selector, root]],
            query,
            result,
            i,
            fn = (useNative) ? Y.Selector._nativeQuery : Y.Selector._bruteQuery;

        if (selector && fn) {
            // split group into seperate queries
            if (!skipNative && // already done if skipping
                    (!useNative || root.tagName)) { // split native when element scoping is needed
                queries = Selector._splitQueries(selector, root);
            }

            for (i = 0; (query = queries[i++]);) {
                result = fn(query[0], query[1], firstOnly);
                if (!firstOnly) { // coerce DOM Collection to Array
                    result = Y.Array(result, 0, true);
                }
                if (result) {
                    ret = ret.concat(result);
                }
            }

            if (queries.length > 1) { // remove dupes and sort by doc order
                ret = Selector._sort(Selector._deDupe(ret));
            }
        }

        return (firstOnly) ? (ret[0] || null) : ret;

    },

    // allows element scoped queries to begin with combinator
    // e.g. query('> p', document.body) === query('body > p')
    _splitQueries: function(selector, node) {
        var groups = selector.split(','),
            queries = [],
            prefix = '',
            i, len;

        if (node) {
            // enforce for element scoping
            if (node.tagName) {
                node.id = node.id || Y.guid();
                prefix = '[id="' + node.id + '"] ';
            }

            for (i = 0, len = groups.length; i < len; ++i) {
                selector =  prefix + groups[i];
                queries.push([selector, node]);
            }
        }

        return queries;
    },

    _nativeQuery: function(selector, root, one) {
        if (Y.UA.webkit && selector.indexOf(':checked') > -1 &&
                (Y.Selector.pseudos && Y.Selector.pseudos.checked)) { // webkit (chrome, safari) fails to find "selected"
            return Y.Selector.query(selector, root, one, true); // redo with skipNative true to try brute query
        }
        try {
            return root['querySelector' + (one ? '' : 'All')](selector);
        } catch(e) { // fallback to brute if available
            return Y.Selector.query(selector, root, one, true); // redo with skipNative true
        }
    },

    filter: function(nodes, selector) {
        var ret = [],
            i, node;

        if (nodes && selector) {
            for (i = 0; (node = nodes[i++]);) {
                if (Y.Selector.test(node, selector)) {
                    ret[ret.length] = node;
                }
            }
        } else {
        }

        return ret;
    },

    test: function(node, selector, root) {
        var ret = false,
            groups = selector.split(','),
            useFrag = false,
            parent,
            item,
            items,
            frag,
            i, j, group;

        if (node && node.tagName) { // only test HTMLElements

            // we need a root if off-doc
            if (!root && !Y.DOM.inDoc(node)) {
                parent = node.parentNode;
                if (parent) {
                    root = parent;
                } else { // only use frag when no parent to query
                    frag = node[OWNER_DOCUMENT].createDocumentFragment();
                    frag.appendChild(node);
                    root = frag;
                    useFrag = true;
                }
            }
            root = root || node[OWNER_DOCUMENT];

            if (!node.id) {
                node.id = Y.guid();
            }
            for (i = 0; (group = groups[i++]);) { // TODO: off-dom test
                group += '[id="' + node.id + '"]';
                items = Y.Selector.query(group, root);

                for (j = 0; item = items[j++];) {
                    if (item === node) {
                        ret = true;
                        break;
                    }
                }
                if (ret) {
                    break;
                }
            }

            if (useFrag) { // cleanup
                frag.removeChild(node);
            }
        }

        return ret;
    },

    /**
     * A convenience function to emulate Y.Node's aNode.ancestor(selector).
     * @param {HTMLElement} element An HTMLElement to start the query from.
     * @param {String} selector The CSS selector to test the node against.
     * @return {HTMLElement} The ancestor node matching the selector, or null.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * @static
     * @method ancestor
     */
    ancestor: function (element, selector, testSelf) {
        return Y.DOM.ancestor(element, function(n) {
            return Y.Selector.test(n, selector);
        }, testSelf);
    }
};

Y.mix(Y.Selector, Selector, true);

})(Y);


}, '3.3.0' ,{requires:['dom-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('selector-css2', function(Y) {

/**
 * The selector module provides helper methods allowing CSS2 Selectors to be used with DOM elements.
 * @module dom
 * @submodule selector-css2
 * @for Selector
 */

/**
 * Provides helper methods for collecting and filtering DOM elements.
 */

var PARENT_NODE = 'parentNode',
    TAG_NAME = 'tagName',
    ATTRIBUTES = 'attributes',
    COMBINATOR = 'combinator',
    PSEUDOS = 'pseudos',

    Selector = Y.Selector,

    SelectorCSS2 = {
        _reRegExpTokens: /([\^\$\?\[\]\*\+\-\.\(\)\|\\])/, // TODO: move?
        SORT_RESULTS: true,
        _children: function(node, tag) {
            var ret = node.children,
                i,
                children = [],
                childNodes,
                child;

            if (node.children && tag && node.children.tags) {
                children = node.children.tags(tag);
            } else if ((!ret && node[TAG_NAME]) || (ret && tag)) { // only HTMLElements have children
                childNodes = ret || node.childNodes;
                ret = [];
                for (i = 0; (child = childNodes[i++]);) {
                    if (child.tagName) {
                        if (!tag || tag === child.tagName) {
                            ret.push(child);
                        }
                    }
                }
            }

            return ret || [];
        },

        _re: {
            //attr: /(\[.*\])/g,
            attr: /(\[[^\]]*\])/g,
            pseudos: /:([\-\w]+(?:\(?:['"]?(.+)['"]?\)))*/i
        },

        /**
         * Mapping of shorthand tokens to corresponding attribute selector
         * @property shorthand
         * @type object
         */
        shorthand: {
            '\\#(-?[_a-z]+[-\\w]*)': '[id=$1]',
            '\\.(-?[_a-z]+[-\\w]*)': '[className~=$1]'
        },

        /**
         * List of operators and corresponding boolean functions.
         * These functions are passed the attribute and the current node's value of the attribute.
         * @property operators
         * @type object
         */
        operators: {
            '': function(node, attr) { return Y.DOM.getAttribute(node, attr) !== ''; }, // Just test for existence of attribute
            //'': '.+',
            //'=': '^{val}$', // equality
            '~=': '(?:^|\\s+){val}(?:\\s+|$)', // space-delimited
            '|=': '^{val}-?' // optional hyphen-delimited
        },

        pseudos: {
           'first-child': function(node) {
                return Y.Selector._children(node[PARENT_NODE])[0] === node;
            }
        },

        _bruteQuery: function(selector, root, firstOnly) {
            var ret = [],
                nodes = [],
                tokens = Selector._tokenize(selector),
                token = tokens[tokens.length - 1],
                rootDoc = Y.DOM._getDoc(root),
                child,
                id,
                className,
                tagName;


            // if we have an initial ID, set to root when in document
            /*
            if (tokens[0] && rootDoc === root &&
                    (id = tokens[0].id) &&
                    rootDoc.getElementById(id)) {
                root = rootDoc.getElementById(id);
            }
            */

            if (token) {
                // prefilter nodes
                id = token.id;
                className = token.className;
                tagName = token.tagName || '*';

                if (root.getElementsByTagName) { // non-IE lacks DOM api on doc frags
                    // try ID first, unless no root.all && root not in document
                    // (root.all works off document, but not getElementById)
                    // TODO: move to allById?
                    if (id && (root.all || (root.nodeType === 9 || Y.DOM.inDoc(root)))) {
                        nodes = Y.DOM.allById(id, root);
                    // try className
                    } else if (className) {
                        nodes = root.getElementsByClassName(className);
                    } else { // default to tagName
                        nodes = root.getElementsByTagName(tagName);
                    }

                } else { // brute getElementsByTagName('*')
                    child = root.firstChild;
                    while (child) {
                        if (child.tagName) { // only collect HTMLElements
                            nodes.push(child);
                        }
                        child = child.nextSilbing || child.firstChild;
                    }
                }
                if (nodes.length) {
                    ret = Selector._filterNodes(nodes, tokens, firstOnly);
                }
            }

            return ret;
        },

        _filterNodes: function(nodes, tokens, firstOnly) {
            var i = 0,
                j,
                len = tokens.length,
                n = len - 1,
                result = [],
                node = nodes[0],
                tmpNode = node,
                getters = Y.Selector.getters,
                operator,
                combinator,
                token,
                path,
                pass,
                //FUNCTION = 'function',
                value,
                tests,
                test;

            //do {
            for (i = 0; (tmpNode = node = nodes[i++]);) {
                n = len - 1;
                path = null;

                testLoop:
                while (tmpNode && tmpNode.tagName) {
                    token = tokens[n];
                    tests = token.tests;
                    j = tests.length;
                    if (j && !pass) {
                        while ((test = tests[--j])) {
                            operator = test[1];
                            if (getters[test[0]]) {
                                value = getters[test[0]](tmpNode, test[0]);
                            } else {
                                value = tmpNode[test[0]];
                                // use getAttribute for non-standard attributes
                                if (value === undefined && tmpNode.getAttribute) {
                                    value = tmpNode.getAttribute(test[0]);
                                }
                            }

                            if ((operator === '=' && value !== test[2]) ||  // fast path for equality
                                (typeof operator !== 'string' && // protect against String.test monkey-patch (Moo)
                                operator.test && !operator.test(value)) ||  // regex test
                                (!operator.test && // protect against RegExp as function (webkit)
                                        typeof operator === 'function' && !operator(tmpNode, test[0]))) { // function test

                                // skip non element nodes or non-matching tags
                                if ((tmpNode = tmpNode[path])) {
                                    while (tmpNode &&
                                        (!tmpNode.tagName ||
                                            (token.tagName && token.tagName !== tmpNode.tagName))
                                    ) {
                                        tmpNode = tmpNode[path];
                                    }
                                }
                                continue testLoop;
                            }
                        }
                    }

                    n--; // move to next token
                    // now that we've passed the test, move up the tree by combinator
                    if (!pass && (combinator = token.combinator)) {
                        path = combinator.axis;
                        tmpNode = tmpNode[path];

                        // skip non element nodes
                        while (tmpNode && !tmpNode.tagName) {
                            tmpNode = tmpNode[path];
                        }

                        if (combinator.direct) { // one pass only
                            path = null;
                        }

                    } else { // success if we made it this far
                        result.push(node);
                        if (firstOnly) {
                            return result;
                        }
                        break;
                    }
                }
            }// while (tmpNode = node = nodes[++i]);
            node = tmpNode = null;
            return result;
        },

        combinators: {
            ' ': {
                axis: 'parentNode'
            },

            '>': {
                axis: 'parentNode',
                direct: true
            },


            '+': {
                axis: 'previousSibling',
                direct: true
            }
        },

        _parsers: [
            {
                name: ATTRIBUTES,
                re: /^\[(-?[a-z]+[\w\-]*)+([~\|\^\$\*!=]=?)?['"]?([^\]]*?)['"]?\]/i,
                fn: function(match, token) {
                    var operator = match[2] || '',
                        operators = Y.Selector.operators,
                        test;

                    // add prefiltering for ID and CLASS
                    if ((match[1] === 'id' && operator === '=') ||
                            (match[1] === 'className' &&
                            Y.config.doc.documentElement.getElementsByClassName &&
                            (operator === '~=' || operator === '='))) {
                        token.prefilter = match[1];
                        token[match[1]] = match[3];
                    }

                    // add unittests
                    if (operator in operators) {
                        test = operators[operator];
                        if (typeof test === 'string') {
                            match[3] = match[3].replace(Y.Selector._reRegExpTokens, '\\$1');
                            test = Y.DOM._getRegExp(test.replace('{val}', match[3]));
                        }
                        match[2] = test;
                    }
                    if (!token.last || token.prefilter !== match[1]) {
                        return match.slice(1);
                    }
                }

            },
            {
                name: TAG_NAME,
                re: /^((?:-?[_a-z]+[\w-]*)|\*)/i,
                fn: function(match, token) {
                    var tag = match[1].toUpperCase();
                    token.tagName = tag;

                    if (tag !== '*' && (!token.last || token.prefilter)) {
                        return [TAG_NAME, '=', tag];
                    }
                    if (!token.prefilter) {
                        token.prefilter = 'tagName';
                    }
                }
            },
            {
                name: COMBINATOR,
                re: /^\s*([>+~]|\s)\s*/,
                fn: function(match, token) {
                }
            },
            {
                name: PSEUDOS,
                re: /^:([\-\w]+)(?:\(['"]?(.+)['"]?\))*/i,
                fn: function(match, token) {
                    var test = Selector[PSEUDOS][match[1]];
                    if (test) { // reorder match array
                        return [match[2], test];
                    } else { // selector token not supported (possibly missing CSS3 module)
                        return false;
                    }
                }
            }
            ],

        _getToken: function(token) {
            return {
                tagName: null,
                id: null,
                className: null,
                attributes: {},
                combinator: null,
                tests: []
            };
        },

        /**
            Break selector into token units per simple selector.
            Combinator is attached to the previous token.
         */
        _tokenize: function(selector) {
            selector = selector || '';
            selector = Selector._replaceShorthand(Y.Lang.trim(selector));
            var token = Selector._getToken(),     // one token per simple selector (left selector holds combinator)
                query = selector, // original query for debug report
                tokens = [],    // array of tokens
                found = false,  // whether or not any matches were found this pass
                match,         // the regex match
                test,
                i, parser;

            /*
                Search for selector patterns, store, and strip them from the selector string
                until no patterns match (invalid selector) or we run out of chars.

                Multiple attributes and pseudos are allowed, in any order.
                for example:
                    'form:first-child[type=button]:not(button)[lang|=en]'
            */
            outer:
            do {
                found = false; // reset after full pass
                for (i = 0; (parser = Selector._parsers[i++]);) {
                    if ( (match = parser.re.exec(selector)) ) { // note assignment
                        if (parser.name !== COMBINATOR ) {
                            token.selector = selector;
                        }
                        selector = selector.replace(match[0], ''); // strip current match from selector
                        if (!selector.length) {
                            token.last = true;
                        }

                        if (Selector._attrFilters[match[1]]) { // convert class to className, etc.
                            match[1] = Selector._attrFilters[match[1]];
                        }

                        test = parser.fn(match, token);
                        if (test === false) { // selector not supported
                            found = false;
                            break outer;
                        } else if (test) {
                            token.tests.push(test);
                        }

                        if (!selector.length || parser.name === COMBINATOR) {
                            tokens.push(token);
                            token = Selector._getToken(token);
                            if (parser.name === COMBINATOR) {
                                token.combinator = Y.Selector.combinators[match[1]];
                            }
                        }
                        found = true;
                    }
                }
            } while (found && selector.length);

            if (!found || selector.length) { // not fully parsed
                tokens = [];
            }
            return tokens;
        },

        _replaceShorthand: function(selector) {
            var shorthand = Selector.shorthand,
                attrs = selector.match(Selector._re.attr), // pull attributes to avoid false pos on "." and "#"
                pseudos = selector.match(Selector._re.pseudos), // pull attributes to avoid false pos on "." and "#"
                re, i, len;

            if (pseudos) {
                selector = selector.replace(Selector._re.pseudos, '!!REPLACED_PSEUDO!!');
            }

            if (attrs) {
                selector = selector.replace(Selector._re.attr, '!!REPLACED_ATTRIBUTE!!');
            }

            for (re in shorthand) {
                if (shorthand.hasOwnProperty(re)) {
                    selector = selector.replace(Y.DOM._getRegExp(re, 'gi'), shorthand[re]);
                }
            }

            if (attrs) {
                for (i = 0, len = attrs.length; i < len; ++i) {
                    selector = selector.replace('!!REPLACED_ATTRIBUTE!!', attrs[i]);
                }
            }
            if (pseudos) {
                for (i = 0, len = pseudos.length; i < len; ++i) {
                    selector = selector.replace('!!REPLACED_PSEUDO!!', pseudos[i]);
                }
            }
            return selector;
        },

        _attrFilters: {
            'class': 'className',
            'for': 'htmlFor'
        },

        getters: {
            href: function(node, attr) {
                return Y.DOM.getAttribute(node, attr);
            }
        }
    };

Y.mix(Y.Selector, SelectorCSS2, true);
Y.Selector.getters.src = Y.Selector.getters.rel = Y.Selector.getters.href;

// IE wants class with native queries
if (Y.Selector.useNative && Y.config.doc.querySelector) {
    Y.Selector.shorthand['\\.(-?[_a-z]+[-\\w]*)'] = '[class~=$1]';
}



}, '3.3.0' ,{requires:['selector-native']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('pluginhost-base', function(Y) {

    /**
     * Provides the augmentable PluginHost interface, which can be added to any class.
     * @module pluginhost
     */

    /**
     * Provides the augmentable PluginHost interface, which can be added to any class.
     * @module pluginhost-base
     */

    /**
     * <p>
     * An augmentable class, which provides the augmented class with the ability to host plugins.
     * It adds <a href="#method_plug">plug</a> and <a href="#method_unplug">unplug</a> methods to the augmented class, which can
     * be used to add or remove plugins from instances of the class.
     * </p>
     *
     * <p>Plugins can also be added through the constructor configuration object passed to the host class' constructor using
     * the "plugins" property. Supported values for the "plugins" property are those defined by the <a href="#method_plug">plug</a> method.
     *
     * For example the following code would add the AnimPlugin and IOPlugin to Overlay (the plugin host):
     * <xmp>
     * var o = new Overlay({plugins: [ AnimPlugin, {fn:IOPlugin, cfg:{section:"header"}}]});
     * </xmp>
     * </p>
     * <p>
     * Plug.Host's protected <a href="#method_initPlugins">_initPlugins</a> and <a href="#method_destroyPlugins">_destroyPlugins</a>
     * methods should be invoked by the host class at the appropriate point in the host's lifecyle.
     * </p>
     *
     * @class Plugin.Host
     */

    var L = Y.Lang;

    function PluginHost() {
        this._plugins = {};
    }

    PluginHost.prototype = {

        /**
         * Adds a plugin to the host object. This will instantiate the
         * plugin and attach it to the configured namespace on the host object.
         *
         * @method plug
         * @chainable
         * @param P {Function | Object |Array} Accepts the plugin class, or an
         * object with a "fn" property specifying the plugin class and
         * a "cfg" property specifying the configuration for the Plugin.
         * <p>
         * Additionally an Array can also be passed in, with the above function or
         * object values, allowing the user to add multiple plugins in a single call.
         * </p>
         * @param config (Optional) If the first argument is the plugin class, the second argument
         * can be the configuration for the plugin.
         * @return {Base} A reference to the host object
         */
        plug: function(Plugin, config) {
            var i, ln, ns;

            if (L.isArray(Plugin)) {
                for (i = 0, ln = Plugin.length; i < ln; i++) {
                    this.plug(Plugin[i]);
                }
            } else {
                if (Plugin && !L.isFunction(Plugin)) {
                    config = Plugin.cfg;
                    Plugin = Plugin.fn;
                }

                // Plugin should be fn by now
                if (Plugin && Plugin.NS) {
                    ns = Plugin.NS;

                    config = config || {};
                    config.host = this;

                    if (this.hasPlugin(ns)) {
                        // Update config
                        this[ns].setAttrs(config);
                    } else {
                        // Create new instance
                        this[ns] = new Plugin(config);
                        this._plugins[ns] = Plugin;
                    }
                }
            }
            return this;
        },

        /**
         * Removes a plugin from the host object. This will destroy the
         * plugin instance and delete the namepsace from the host object.
         *
         * @method unplug
         * @param {String | Function} plugin The namespace of the plugin, or the plugin class with the static NS namespace property defined. If not provided,
         * all registered plugins are unplugged.
         * @return {Base} A reference to the host object
         * @chainable
         */
        unplug: function(plugin) {
            var ns = plugin,
                plugins = this._plugins;

            if (plugin) {
                if (L.isFunction(plugin)) {
                    ns = plugin.NS;
                    if (ns && (!plugins[ns] || plugins[ns] !== plugin)) {
                        ns = null;
                    }
                }

                if (ns) {
                    if (this[ns]) {
                        this[ns].destroy();
                        delete this[ns];
                    }
                    if (plugins[ns]) {
                        delete plugins[ns];
                    }
                }
            } else {
                for (ns in this._plugins) {
                    if (this._plugins.hasOwnProperty(ns)) {
                        this.unplug(ns);
                    }
                }
            }
            return this;
        },

        /**
         * Determines if a plugin has plugged into this host.
         *
         * @method hasPlugin
         * @param {String} ns The plugin's namespace
         * @return {boolean} returns true, if the plugin has been plugged into this host, false otherwise.
         */
        hasPlugin : function(ns) {
            return (this._plugins[ns] && this[ns]);
        },

        /**
         * Initializes static plugins registered on the host (using the
         * Base.plug static method) and any plugins passed to the
         * instance through the "plugins" configuration property.
         *
         * @method _initPlugins
         * @param {Config} config The configuration object with property name/value pairs.
         * @private
         */

        _initPlugins: function(config) {
            this._plugins = this._plugins || {};

            if (this._initConfigPlugins) {
                this._initConfigPlugins(config);
            }
        },

        /**
         * Unplugs and destroys all plugins on the host
         * @method _destroyPlugins
         * @private
         */
        _destroyPlugins: function() {
            this.unplug();
        }
    };

    Y.namespace("Plugin").Host = PluginHost;


}, '3.3.0' ,{requires:['yui-base']});
YUI.add('pluginhost-config', function(Y) {

    /**
     * Adds pluginhost constructor configuration and static configuration support
     * @submodule pluginhost-config
     */

    /**
     * Constructor and static configuration support for plugins
     *
     * @for Plugin.Host
     */
    var PluginHost = Y.Plugin.Host,
        L = Y.Lang;

    PluginHost.prototype._initConfigPlugins = function(config) {

        // Class Configuration
        var classes = (this._getClasses) ? this._getClasses() : [this.constructor],
            plug = [],
            unplug = {},
            constructor, i, classPlug, classUnplug, pluginClassName;

        // TODO: Room for optimization. Can we apply statically/unplug in same pass?
        for (i = classes.length - 1; i >= 0; i--) {
            constructor = classes[i];

            classUnplug = constructor._UNPLUG;
            if (classUnplug) {
                // subclasses over-write
                Y.mix(unplug, classUnplug, true);
            }

            classPlug = constructor._PLUG;
            if (classPlug) {
                // subclasses over-write
                Y.mix(plug, classPlug, true);
            }
        }

        for (pluginClassName in plug) {
            if (plug.hasOwnProperty(pluginClassName)) {
                if (!unplug[pluginClassName]) {
                    this.plug(plug[pluginClassName]);
                }
            }
        }

        // User Configuration
        if (config && config.plugins) {
            this.plug(config.plugins);
        }
    };

    /**
     * Registers plugins to be instantiated at the class level (plugins
     * which should be plugged into every instance of the class by default).
     *
     * @method Plugin.Host.plug
     * @static
     *
     * @param {Function} hostClass The host class on which to register the plugins
     * @param {Function | Array} plugin Either the plugin class, an array of plugin classes or an array of objects (with fn and cfg properties defined)
     * @param {Object} config (Optional) If plugin is the plugin class, the configuration for the plugin
     */
    PluginHost.plug = function(hostClass, plugin, config) {
        // Cannot plug into Base, since Plugins derive from Base [ will cause infinite recurrsion ]
        var p, i, l, name;

        if (hostClass !== Y.Base) {
            hostClass._PLUG = hostClass._PLUG || {};

            if (!L.isArray(plugin)) {
                if (config) {
                    plugin = {fn:plugin, cfg:config};
                }
                plugin = [plugin];
            }

            for (i = 0, l = plugin.length; i < l;i++) {
                p = plugin[i];
                name = p.NAME || p.fn.NAME;
                hostClass._PLUG[name] = p;
            }
        }
    };

    /**
     * Unregisters any class level plugins which have been registered by the host class, or any
     * other class in the hierarchy.
     *
     * @method Plugin.Host.unplug
     * @static
     *
     * @param {Function} hostClass The host class from which to unregister the plugins
     * @param {Function | Array} plugin The plugin class, or an array of plugin classes
     */
    PluginHost.unplug = function(hostClass, plugin) {
        var p, i, l, name;

        if (hostClass !== Y.Base) {
            hostClass._UNPLUG = hostClass._UNPLUG || {};

            if (!L.isArray(plugin)) {
                plugin = [plugin];
            }

            for (i = 0, l = plugin.length; i < l; i++) {
                p = plugin[i];
                name = p.NAME;
                if (!hostClass._PLUG[name]) {
                    hostClass._UNPLUG[name] = p;
                } else {
                    delete hostClass._PLUG[name];
                }
            }
        }
    };


}, '3.3.0' ,{requires:['pluginhost-base']});


YUI.add('pluginhost', function(Y){}, '3.3.0' ,{use:['pluginhost-base', 'pluginhost-config']});

/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('dom-style', function(Y) {

(function(Y) {
/**
 * Add style management functionality to DOM.
 * @module dom
 * @submodule dom-style
 * @for DOM
 */

var DOCUMENT_ELEMENT = 'documentElement',
    DEFAULT_VIEW = 'defaultView',
    OWNER_DOCUMENT = 'ownerDocument',
    STYLE = 'style',
    FLOAT = 'float',
    CSS_FLOAT = 'cssFloat',
    STYLE_FLOAT = 'styleFloat',
    TRANSPARENT = 'transparent',
    GET_COMPUTED_STYLE = 'getComputedStyle',
    GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',

    WINDOW = Y.config.win,
    DOCUMENT = Y.config.doc,
    UNDEFINED = undefined,

    Y_DOM = Y.DOM,

    TRANSFORM = 'transform',
    VENDOR_TRANSFORM = [
        'WebkitTransform',
        'MozTransform',
        'OTransform'
    ],

    re_color = /color$/i,
    re_unit = /width|height|top|left|right|bottom|margin|padding/i;

Y.Array.each(VENDOR_TRANSFORM, function(val) {
    if (val in DOCUMENT[DOCUMENT_ELEMENT].style) {
        TRANSFORM = val;
    }
});

Y.mix(Y_DOM, {
    DEFAULT_UNIT: 'px',

    CUSTOM_STYLES: {
    },


    /**
     * Sets a style property for a given element.
     * @method setStyle
     * @param {HTMLElement} An HTMLElement to apply the style to.
     * @param {String} att The style property to set.
     * @param {String|Number} val The value.
     */
    setStyle: function(node, att, val, style) {
        style = style || node.style;
        var CUSTOM_STYLES = Y_DOM.CUSTOM_STYLES;

        if (style) {
            if (val === null || val === '') { // normalize unsetting
                val = '';
            } else if (!isNaN(new Number(val)) && re_unit.test(att)) { // number values may need a unit
                val += Y_DOM.DEFAULT_UNIT;
            }

            if (att in CUSTOM_STYLES) {
                if (CUSTOM_STYLES[att].set) {
                    CUSTOM_STYLES[att].set(node, val, style);
                    return; // NOTE: return
                } else if (typeof CUSTOM_STYLES[att] === 'string') {
                    att = CUSTOM_STYLES[att];
                }
            } else if (att === '') { // unset inline styles
                att = 'cssText';
                val = '';
            }
            style[att] = val;
        }
    },

    /**
     * Returns the current style value for the given property.
     * @method getStyle
     * @param {HTMLElement} An HTMLElement to get the style from.
     * @param {String} att The style property to get.
     */
    getStyle: function(node, att, style) {
        style = style || node.style;
        var CUSTOM_STYLES = Y_DOM.CUSTOM_STYLES,
            val = '';

        if (style) {
            if (att in CUSTOM_STYLES) {
                if (CUSTOM_STYLES[att].get) {
                    return CUSTOM_STYLES[att].get(node, att, style); // NOTE: return
                } else if (typeof CUSTOM_STYLES[att] === 'string') {
                    att = CUSTOM_STYLES[att];
                }
            }
            val = style[att];
            if (val === '') { // TODO: is empty string sufficient?
                val = Y_DOM[GET_COMPUTED_STYLE](node, att);
            }
        }

        return val;
    },

    /**
     * Sets multiple style properties.
     * @method setStyles
     * @param {HTMLElement} node An HTMLElement to apply the styles to.
     * @param {Object} hash An object literal of property:value pairs.
     */
    setStyles: function(node, hash) {
        var style = node.style;
        Y.each(hash, function(v, n) {
            Y_DOM.setStyle(node, n, v, style);
        }, Y_DOM);
    },

    /**
     * Returns the computed style for the given node.
     * @method getComputedStyle
     * @param {HTMLElement} An HTMLElement to get the style from.
     * @param {String} att The style property to get.
     * @return {String} The computed value of the style property.
     */
    getComputedStyle: function(node, att) {
        var val = '',
            doc = node[OWNER_DOCUMENT];

        if (node[STYLE] && doc[DEFAULT_VIEW] && doc[DEFAULT_VIEW][GET_COMPUTED_STYLE]) {
            val = doc[DEFAULT_VIEW][GET_COMPUTED_STYLE](node, null)[att];
        }
        return val;
    }
});

// normalize reserved word float alternatives ("cssFloat" or "styleFloat")
if (DOCUMENT[DOCUMENT_ELEMENT][STYLE][CSS_FLOAT] !== UNDEFINED) {
    Y_DOM.CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
} else if (DOCUMENT[DOCUMENT_ELEMENT][STYLE][STYLE_FLOAT] !== UNDEFINED) {
    Y_DOM.CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
}

// fix opera computedStyle default color unit (convert to rgb)
if (Y.UA.opera) {
    Y_DOM[GET_COMPUTED_STYLE] = function(node, att) {
        var view = node[OWNER_DOCUMENT][DEFAULT_VIEW],
            val = view[GET_COMPUTED_STYLE](node, '')[att];

        if (re_color.test(att)) {
            val = Y.Color.toRGB(val);
        }

        return val;
    };

}

// safari converts transparent to rgba(), others use "transparent"
if (Y.UA.webkit) {
    Y_DOM[GET_COMPUTED_STYLE] = function(node, att) {
        var view = node[OWNER_DOCUMENT][DEFAULT_VIEW],
            val = view[GET_COMPUTED_STYLE](node, '')[att];

        if (val === 'rgba(0, 0, 0, 0)') {
            val = TRANSPARENT;
        }

        return val;
    };

}

Y.DOM._getAttrOffset = function(node, attr) {
    var val = Y.DOM[GET_COMPUTED_STYLE](node, attr),
        offsetParent = node.offsetParent,
        position,
        parentOffset,
        offset;

    if (val === 'auto') {
        position = Y.DOM.getStyle(node, 'position');
        if (position === 'static' || position === 'relative') {
            val = 0;
        } else if (offsetParent && offsetParent[GET_BOUNDING_CLIENT_RECT]) {
            parentOffset = offsetParent[GET_BOUNDING_CLIENT_RECT]()[attr];
            offset = node[GET_BOUNDING_CLIENT_RECT]()[attr];
            if (attr === 'left' || attr === 'top') {
                val = offset - parentOffset;
            } else {
                val = parentOffset - node[GET_BOUNDING_CLIENT_RECT]()[attr];
            }
        }
    }

    return val;
};

Y.DOM._getOffset = function(node) {
    var pos,
        xy = null;

    if (node) {
        pos = Y_DOM.getStyle(node, 'position');
        xy = [
            parseInt(Y_DOM[GET_COMPUTED_STYLE](node, 'left'), 10),
            parseInt(Y_DOM[GET_COMPUTED_STYLE](node, 'top'), 10)
        ];

        if ( isNaN(xy[0]) ) { // in case of 'auto'
            xy[0] = parseInt(Y_DOM.getStyle(node, 'left'), 10); // try inline
            if ( isNaN(xy[0]) ) { // default to offset value
                xy[0] = (pos === 'relative') ? 0 : node.offsetLeft || 0;
            }
        }

        if ( isNaN(xy[1]) ) { // in case of 'auto'
            xy[1] = parseInt(Y_DOM.getStyle(node, 'top'), 10); // try inline
            if ( isNaN(xy[1]) ) { // default to offset value
                xy[1] = (pos === 'relative') ? 0 : node.offsetTop || 0;
            }
        }
    }

    return xy;

};

Y_DOM.CUSTOM_STYLES.transform = {
    set: function(node, val, style) {
        style[TRANSFORM] = val;
    },

    get: function(node, style) {
        return Y_DOM[GET_COMPUTED_STYLE](node, TRANSFORM);
    }
};


})(Y);
(function(Y) {
var PARSE_INT = parseInt,
    RE = RegExp;

Y.Color = {
    KEYWORDS: {
        black: '000',
        silver: 'c0c0c0',
        gray: '808080',
        white: 'fff',
        maroon: '800000',
        red: 'f00',
        purple: '800080',
        fuchsia: 'f0f',
        green: '008000',
        lime: '0f0',
        olive: '808000',
        yellow: 'ff0',
        navy: '000080',
        blue: '00f',
        teal: '008080',
        aqua: '0ff'
    },

    re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
    re_hex3: /([0-9A-F])/gi,

    toRGB: function(val) {
        if (!Y.Color.re_RGB.test(val)) {
            val = Y.Color.toHex(val);
        }

        if(Y.Color.re_hex.exec(val)) {
            val = 'rgb(' + [
                PARSE_INT(RE.$1, 16),
                PARSE_INT(RE.$2, 16),
                PARSE_INT(RE.$3, 16)
            ].join(', ') + ')';
        }
        return val;
    },

    toHex: function(val) {
        val = Y.Color.KEYWORDS[val] || val;
        if (Y.Color.re_RGB.exec(val)) {
            val = [
                Number(RE.$1).toString(16),
                Number(RE.$2).toString(16),
                Number(RE.$3).toString(16)
            ];

            for (var i = 0; i < val.length; i++) {
                if (val[i].length < 2) {
                    val[i] = '0' + val[i];
                }
            }

            val = val.join('');
        }

        if (val.length < 6) {
            val = val.replace(Y.Color.re_hex3, '$1$1');
        }

        if (val !== 'transparent' && val.indexOf('#') < 0) {
            val = '#' + val;
        }

        return val.toUpperCase();
    }
};
})(Y);



}, '3.3.0' ,{requires:['dom-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('dom-style-ie', function(Y) {

(function(Y) {
var HAS_LAYOUT = 'hasLayout',
    PX = 'px',
    FILTER = 'filter',
    FILTERS = 'filters',
    OPACITY = 'opacity',
    AUTO = 'auto',

    BORDER_WIDTH = 'borderWidth',
    BORDER_TOP_WIDTH = 'borderTopWidth',
    BORDER_RIGHT_WIDTH = 'borderRightWidth',
    BORDER_BOTTOM_WIDTH = 'borderBottomWidth',
    BORDER_LEFT_WIDTH = 'borderLeftWidth',
    WIDTH = 'width',
    HEIGHT = 'height',
    TRANSPARENT = 'transparent',
    VISIBLE = 'visible',
    GET_COMPUTED_STYLE = 'getComputedStyle',
    UNDEFINED = undefined,
    documentElement = Y.config.doc.documentElement,

    testFeature = Y.Features.test,
    addFeature = Y.Features.add,

    // TODO: unit-less lineHeight (e.g. 1.22)
    re_unit = /^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,

    isIE8 = (Y.UA.ie >= 8),

    _getStyleObj = function(node) {
        return node.currentStyle || node.style;
    },

    ComputedStyle = {
        CUSTOM_STYLES: {},

        get: function(el, property) {
            var value = '',
                current;

            if (el) {
                    current = _getStyleObj(el)[property];

                if (property === OPACITY && Y.DOM.CUSTOM_STYLES[OPACITY]) {
                    value = Y.DOM.CUSTOM_STYLES[OPACITY].get(el);
                } else if (!current || (current.indexOf && current.indexOf(PX) > -1)) { // no need to convert
                    value = current;
                } else if (Y.DOM.IE.COMPUTED[property]) { // use compute function
                    value = Y.DOM.IE.COMPUTED[property](el, property);
                } else if (re_unit.test(current)) { // convert to pixel
                    value = ComputedStyle.getPixel(el, property) + PX;
                } else {
                    value = current;
                }
            }

            return value;
        },

        sizeOffsets: {
            width: ['Left', 'Right'],
            height: ['Top', 'Bottom'],
            top: ['Top'],
            bottom: ['Bottom']
        },

        getOffset: function(el, prop) {
            var current = _getStyleObj(el)[prop],                     // value of "width", "top", etc.
                capped = prop.charAt(0).toUpperCase() + prop.substr(1), // "Width", "Top", etc.
                offset = 'offset' + capped,                             // "offsetWidth", "offsetTop", etc.
                pixel = 'pixel' + capped,                               // "pixelWidth", "pixelTop", etc.
                sizeOffsets = ComputedStyle.sizeOffsets[prop],
                mode = el.ownerDocument.compatMode,
                value = '';

            // IE pixelWidth incorrect for percent
            // manually compute by subtracting padding and border from offset size
            // NOTE: clientWidth/Height (size minus border) is 0 when current === AUTO so offsetHeight is used
            // reverting to auto from auto causes position stacking issues (old impl)
            if (current === AUTO || current.indexOf('%') > -1) {
                value = el['offset' + capped];

                if (mode !== 'BackCompat') {
                    if (sizeOffsets[0]) {
                        value -= ComputedStyle.getPixel(el, 'padding' + sizeOffsets[0]);
                        value -= ComputedStyle.getBorderWidth(el, 'border' + sizeOffsets[0] + 'Width', 1);
                    }

                    if (sizeOffsets[1]) {
                        value -= ComputedStyle.getPixel(el, 'padding' + sizeOffsets[1]);
                        value -= ComputedStyle.getBorderWidth(el, 'border' + sizeOffsets[1] + 'Width', 1);
                    }
                }

            } else { // use style.pixelWidth, etc. to convert to pixels
                // need to map style.width to currentStyle (no currentStyle.pixelWidth)
                if (!el.style[pixel] && !el.style[prop]) {
                    el.style[prop] = current;
                }
                value = el.style[pixel];

            }
            return value + PX;
        },

        borderMap: {
            thin: (isIE8) ? '1px' : '2px',
            medium: (isIE8) ? '3px': '4px',
            thick: (isIE8) ? '5px' : '6px'
        },

        getBorderWidth: function(el, property, omitUnit) {
            var unit = omitUnit ? '' : PX,
                current = el.currentStyle[property];

            if (current.indexOf(PX) < 0) { // look up keywords if a border exists
                if (ComputedStyle.borderMap[current] &&
                        el.currentStyle.borderStyle !== 'none') {
                    current = ComputedStyle.borderMap[current];
                } else { // otherwise no border (default is "medium")
                    current = 0;
                }
            }
            return (omitUnit) ? parseFloat(current) : current;
        },

        getPixel: function(node, att) {
            // use pixelRight to convert to px
            var val = null,
                style = _getStyleObj(node),
                styleRight = style.right,
                current = style[att];

            node.style.right = current;
            val = node.style.pixelRight;
            node.style.right = styleRight; // revert

            return val;
        },

        getMargin: function(node, att) {
            var val,
                style = _getStyleObj(node);

            if (style[att] == AUTO) {
                val = 0;
            } else {
                val = ComputedStyle.getPixel(node, att);
            }
            return val + PX;
        },

        getVisibility: function(node, att) {
            var current;
            while ( (current = node.currentStyle) && current[att] == 'inherit') { // NOTE: assignment in test
                node = node.parentNode;
            }
            return (current) ? current[att] : VISIBLE;
        },

        getColor: function(node, att) {
            var current = _getStyleObj(node)[att];

            if (!current || current === TRANSPARENT) {
                Y.DOM.elementByAxis(node, 'parentNode', null, function(parent) {
                    current = _getStyleObj(parent)[att];
                    if (current && current !== TRANSPARENT) {
                        node = parent;
                        return true;
                    }
                });
            }

            return Y.Color.toRGB(current);
        },

        getBorderColor: function(node, att) {
            var current = _getStyleObj(node),
                val = current[att] || current.color;
            return Y.Color.toRGB(Y.Color.toHex(val));
        }
    },

    //fontSize: getPixelFont,
    IEComputed = {};

addFeature('style', 'computedStyle', {
    test: function() {
        return 'getComputedStyle' in Y.config.win;
    }
});

addFeature('style', 'opacity', {
    test: function() {
        return 'opacity' in documentElement.style;
    }
});

addFeature('style', 'filter', {
    test: function() {
        return 'filters' in documentElement;
    }
});

// use alpha filter for IE opacity
if (!testFeature('style', 'opacity') && testFeature('style', 'filter')) {
    Y.DOM.CUSTOM_STYLES[OPACITY] = {
        get: function(node) {
            var val = 100;
            try { // will error if no DXImageTransform
                val = node[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];

            } catch(e) {
                try { // make sure its in the document
                    val = node[FILTERS]('alpha')[OPACITY];
                } catch(err) {
                }
            }
            return val / 100;
        },

        set: function(node, val, style) {
            var current,
                styleObj = _getStyleObj(node),
                currentFilter = styleObj[FILTER];

            style = style || node.style;
            if (val === '') { // normalize inline style behavior
                current = (OPACITY in styleObj) ? styleObj[OPACITY] : 1; // revert to original opacity
                val = current;
            }

            if (typeof currentFilter == 'string') { // in case not appended
                style[FILTER] = currentFilter.replace(/alpha([^)]*\))/gi, '') +
                        ((val < 1) ? 'alpha(' + OPACITY + '=' + val * 100 + ')' : '');

                if (!style[FILTER]) {
                    style.removeAttribute(FILTER);
                }

                if (!styleObj[HAS_LAYOUT]) {
                    style.zoom = 1; // needs layout
                }
            }
        }
    };
}

try {
    Y.config.doc.createElement('div').style.height = '-1px';
} catch(e) { // IE throws error on invalid style set; trap common cases
    Y.DOM.CUSTOM_STYLES.height = {
        set: function(node, val, style) {
            var floatVal = parseFloat(val);
            if (floatVal >= 0 || val === 'auto' || val === '') {
                style.height = val;
            } else {
            }
        }
    };

    Y.DOM.CUSTOM_STYLES.width = {
        set: function(node, val, style) {
            var floatVal = parseFloat(val);
            if (floatVal >= 0 || val === 'auto' || val === '') {
                style.width = val;
            } else {
            }
        }
    };
}

if (!testFeature('style', 'computedStyle')) {
    // TODO: top, right, bottom, left
    IEComputed[WIDTH] = IEComputed[HEIGHT] = ComputedStyle.getOffset;

    IEComputed.color = IEComputed.backgroundColor = ComputedStyle.getColor;

    IEComputed[BORDER_WIDTH] = IEComputed[BORDER_TOP_WIDTH] = IEComputed[BORDER_RIGHT_WIDTH] =
            IEComputed[BORDER_BOTTOM_WIDTH] = IEComputed[BORDER_LEFT_WIDTH] =
            ComputedStyle.getBorderWidth;

    IEComputed.marginTop = IEComputed.marginRight = IEComputed.marginBottom =
            IEComputed.marginLeft = ComputedStyle.getMargin;

    IEComputed.visibility = ComputedStyle.getVisibility;
    IEComputed.borderColor = IEComputed.borderTopColor =
            IEComputed.borderRightColor = IEComputed.borderBottomColor =
            IEComputed.borderLeftColor = ComputedStyle.getBorderColor;

    Y.DOM[GET_COMPUTED_STYLE] = ComputedStyle.get;

    Y.namespace('DOM.IE');
    Y.DOM.IE.COMPUTED = IEComputed;
    Y.DOM.IE.ComputedStyle = ComputedStyle;
}

})(Y);


}, '3.3.0' ,{requires:['dom-style']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('dom-screen', function(Y) {

(function(Y) {

/**
 * Adds position and region management functionality to DOM.
 * @module dom
 * @submodule dom-screen
 * @for DOM
 */

var DOCUMENT_ELEMENT = 'documentElement',
    COMPAT_MODE = 'compatMode',
    POSITION = 'position',
    FIXED = 'fixed',
    RELATIVE = 'relative',
    LEFT = 'left',
    TOP = 'top',
    _BACK_COMPAT = 'BackCompat',
    MEDIUM = 'medium',
    BORDER_LEFT_WIDTH = 'borderLeftWidth',
    BORDER_TOP_WIDTH = 'borderTopWidth',
    GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
    GET_COMPUTED_STYLE = 'getComputedStyle',

    Y_DOM = Y.DOM,

    // TODO: how about thead/tbody/tfoot/tr?
    // TODO: does caption matter?
    RE_TABLE = /^t(?:able|d|h)$/i,

    SCROLL_NODE;

if (Y.UA.ie) {
    if (Y.config.doc[COMPAT_MODE] !== 'quirks') {
        SCROLL_NODE = DOCUMENT_ELEMENT;
    } else {
        SCROLL_NODE = 'body';
    }
}

Y.mix(Y_DOM, {
    /**
     * Returns the inner height of the viewport (exludes scrollbar).
     * @method winHeight
     * @return {Number} The current height of the viewport.
     */
    winHeight: function(node) {
        var h = Y_DOM._getWinSize(node).height;
        return h;
    },

    /**
     * Returns the inner width of the viewport (exludes scrollbar).
     * @method winWidth
     * @return {Number} The current width of the viewport.
     */
    winWidth: function(node) {
        var w = Y_DOM._getWinSize(node).width;
        return w;
    },

    /**
     * Document height
     * @method docHeight
     * @return {Number} The current height of the document.
     */
    docHeight:  function(node) {
        var h = Y_DOM._getDocSize(node).height;
        return Math.max(h, Y_DOM._getWinSize(node).height);
    },

    /**
     * Document width
     * @method docWidth
     * @return {Number} The current width of the document.
     */
    docWidth:  function(node) {
        var w = Y_DOM._getDocSize(node).width;
        return Math.max(w, Y_DOM._getWinSize(node).width);
    },

    /**
     * Amount page has been scroll horizontally
     * @method docScrollX
     * @return {Number} The current amount the screen is scrolled horizontally.
     */
    docScrollX: function(node, doc) {
        doc = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageXOffset : 0;
        return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, pageOffset);
    },

    /**
     * Amount page has been scroll vertically
     * @method docScrollY
     * @return {Number} The current amount the screen is scrolled vertically.
     */
    docScrollY:  function(node, doc) {
        doc = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageYOffset : 0;
        return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, pageOffset);
    },

    /**
     * Gets the current position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getXY
     * @param element The target element
     * @return {Array} The XY position of the element

     TODO: test inDocument/display?
     */
    getXY: function() {
        if (Y.config.doc[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
            return function(node) {
                var xy = null,
                    scrollLeft,
                    scrollTop,
                    box,
                    off1, off2,
                    bLeft, bTop,
                    mode,
                    doc,
                    inDoc,
                    rootNode;

                if (node && node.tagName) {
                    doc = node.ownerDocument;
                    rootNode = doc[DOCUMENT_ELEMENT];

                    // inline inDoc check for perf
                    if (rootNode.contains) {
                        inDoc = rootNode.contains(node);
                    } else {
                        inDoc = Y.DOM.contains(rootNode, node);
                    }

                    if (inDoc) {
                        scrollLeft = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollLeft : Y_DOM.docScrollX(node, doc);
                        scrollTop = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollTop : Y_DOM.docScrollY(node, doc);
                        box = node[GET_BOUNDING_CLIENT_RECT]();
                        xy = [box.left, box.top];

                            if (Y.UA.ie) {
                                off1 = 2;
                                off2 = 2;
                                mode = doc[COMPAT_MODE];
                                bLeft = Y_DOM[GET_COMPUTED_STYLE](doc[DOCUMENT_ELEMENT], BORDER_LEFT_WIDTH);
                                bTop = Y_DOM[GET_COMPUTED_STYLE](doc[DOCUMENT_ELEMENT], BORDER_TOP_WIDTH);

                                if (Y.UA.ie === 6) {
                                    if (mode !== _BACK_COMPAT) {
                                        off1 = 0;
                                        off2 = 0;
                                    }
                                }

                                if ((mode == _BACK_COMPAT)) {
                                    if (bLeft !== MEDIUM) {
                                        off1 = parseInt(bLeft, 10);
                                    }
                                    if (bTop !== MEDIUM) {
                                        off2 = parseInt(bTop, 10);
                                    }
                                }

                                xy[0] -= off1;
                                xy[1] -= off2;

                            }

                        if ((scrollTop || scrollLeft)) {
                            if (!Y.UA.ios || (Y.UA.ios >= 4.2)) {
                                xy[0] += scrollLeft;
                                xy[1] += scrollTop;
                            }

                        }
                    } else {
                        xy = Y_DOM._getOffset(node);
                    }
                }
                return xy;
            }
        } else {
            return function(node) { // manually calculate by crawling up offsetParents
                //Calculate the Top and Left border sizes (assumes pixels)
                var xy = null,
                    doc,
                    parentNode,
                    bCheck,
                    scrollTop,
                    scrollLeft;

                if (node) {
                    if (Y_DOM.inDoc(node)) {
                        xy = [node.offsetLeft, node.offsetTop];
                        doc = node.ownerDocument;
                        parentNode = node;
                        // TODO: refactor with !! or just falsey
                        bCheck = ((Y.UA.gecko || Y.UA.webkit > 519) ? true : false);

                        // TODO: worth refactoring for TOP/LEFT only?
                        while ((parentNode = parentNode.offsetParent)) {
                            xy[0] += parentNode.offsetLeft;
                            xy[1] += parentNode.offsetTop;
                            if (bCheck) {
                                xy = Y_DOM._calcBorders(parentNode, xy);
                            }
                        }

                        // account for any scrolled ancestors
                        if (Y_DOM.getStyle(node, POSITION) != FIXED) {
                            parentNode = node;

                            while ((parentNode = parentNode.parentNode)) {
                                scrollTop = parentNode.scrollTop;
                                scrollLeft = parentNode.scrollLeft;

                                //Firefox does something funky with borders when overflow is not visible.
                                if (Y.UA.gecko && (Y_DOM.getStyle(parentNode, 'overflow') !== 'visible')) {
                                        xy = Y_DOM._calcBorders(parentNode, xy);
                                }


                                if (scrollTop || scrollLeft) {
                                    xy[0] -= scrollLeft;
                                    xy[1] -= scrollTop;
                                }
                            }
                            xy[0] += Y_DOM.docScrollX(node, doc);
                            xy[1] += Y_DOM.docScrollY(node, doc);

                        } else {
                            //Fix FIXED position -- add scrollbars
                            xy[0] += Y_DOM.docScrollX(node, doc);
                            xy[1] += Y_DOM.docScrollY(node, doc);
                        }
                    } else {
                        xy = Y_DOM._getOffset(node);
                    }
                }

                return xy;
            };
        }
    }(),// NOTE: Executing for loadtime branching

    /**
     * Gets the current X position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getX
     * @param element The target element
     * @return {Int} The X position of the element
     */

    getX: function(node) {
        return Y_DOM.getXY(node)[0];
    },

    /**
     * Gets the current Y position of an element based on page coordinates.
     * Element must be part of the DOM tree to have page coordinates
     * (display:none or elements not appended return false).
     * @method getY
     * @param element The target element
     * @return {Int} The Y position of the element
     */

    getY: function(node) {
        return Y_DOM.getXY(node)[1];
    },

    /**
     * Set the position of an html element in page coordinates.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setXY
     * @param element The target element
     * @param {Array} xy Contains X & Y values for new position (coordinates are page-based)
     * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
     */
    setXY: function(node, xy, noRetry) {
        var setStyle = Y_DOM.setStyle,
            pos,
            delta,
            newXY,
            currentXY;

        if (node && xy) {
            pos = Y_DOM.getStyle(node, POSITION);

            delta = Y_DOM._getOffset(node);
            if (pos == 'static') { // default to relative
                pos = RELATIVE;
                setStyle(node, POSITION, pos);
            }
            currentXY = Y_DOM.getXY(node);

            if (xy[0] !== null) {
                setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
            }

            if (xy[1] !== null) {
                setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
            }

            if (!noRetry) {
                newXY = Y_DOM.getXY(node);
                if (newXY[0] !== xy[0] || newXY[1] !== xy[1]) {
                    Y_DOM.setXY(node, xy, true);
                }
            }

        } else {
        }
    },

    /**
     * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
     * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setX
     * @param element The target element
     * @param {Int} x The X values for new position (coordinates are page-based)
     */
    setX: function(node, x) {
        return Y_DOM.setXY(node, [x, null]);
    },

    /**
     * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
     * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @method setY
     * @param element The target element
     * @param {Int} y The Y values for new position (coordinates are page-based)
     */
    setY: function(node, y) {
        return Y_DOM.setXY(node, [null, y]);
    },

    /**
     * @method swapXY
     * @description Swap the xy position with another node
     * @param {Node} node The node to swap with
     * @param {Node} otherNode The other node to swap with
     * @return {Node}
     */
    swapXY: function(node, otherNode) {
        var xy = Y_DOM.getXY(node);
        Y_DOM.setXY(node, Y_DOM.getXY(otherNode));
        Y_DOM.setXY(otherNode, xy);
    },

    _calcBorders: function(node, xy2) {
        var t = parseInt(Y_DOM[GET_COMPUTED_STYLE](node, BORDER_TOP_WIDTH), 10) || 0,
            l = parseInt(Y_DOM[GET_COMPUTED_STYLE](node, BORDER_LEFT_WIDTH), 10) || 0;
        if (Y.UA.gecko) {
            if (RE_TABLE.test(node.tagName)) {
                t = 0;
                l = 0;
            }
        }
        xy2[0] += l;
        xy2[1] += t;
        return xy2;
    },

    _getWinSize: function(node, doc) {
        doc  = doc || (node) ? Y_DOM._getDoc(node) : Y.config.doc;
        var win = doc.defaultView || doc.parentWindow,
            mode = doc[COMPAT_MODE],
            h = win.innerHeight,
            w = win.innerWidth,
            root = doc[DOCUMENT_ELEMENT];

        if ( mode && !Y.UA.opera ) { // IE, Gecko
            if (mode != 'CSS1Compat') { // Quirks
                root = doc.body;
            }
            h = root.clientHeight;
            w = root.clientWidth;
        }
        return { height: h, width: w };
    },

    _getDocSize: function(node) {
        var doc = (node) ? Y_DOM._getDoc(node) : Y.config.doc,
            root = doc[DOCUMENT_ELEMENT];

        if (doc[COMPAT_MODE] != 'CSS1Compat') {
            root = doc.body;
        }

        return { height: root.scrollHeight, width: root.scrollWidth };
    }
});

})(Y);
(function(Y) {
var TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',

    getOffsets = function(r1, r2) {
        var t = Math.max(r1[TOP], r2[TOP]),
            r = Math.min(r1[RIGHT], r2[RIGHT]),
            b = Math.min(r1[BOTTOM], r2[BOTTOM]),
            l = Math.max(r1[LEFT], r2[LEFT]),
            ret = {};

        ret[TOP] = t;
        ret[RIGHT] = r;
        ret[BOTTOM] = b;
        ret[LEFT] = l;
        return ret;
    },

    DOM = Y.DOM;

Y.mix(DOM, {
    /**
     * Returns an Object literal containing the following about this element: (top, right, bottom, left)
     * @for DOM
     * @method region
     * @param {HTMLElement} element The DOM element.
     * @return {Object} Object literal containing the following about this element: (top, right, bottom, left)
     */
    region: function(node) {
        var xy = DOM.getXY(node),
            ret = false;

        if (node && xy) {
            ret = DOM._getRegion(
                xy[1], // top
                xy[0] + node.offsetWidth, // right
                xy[1] + node.offsetHeight, // bottom
                xy[0] // left
            );
        }

        return ret;
    },

    /**
     * Find the intersect information for the passes nodes.
     * @method intersect
     * @for DOM
     * @param {HTMLElement} element The first element
     * @param {HTMLElement | Object} element2 The element or region to check the interect with
     * @param {Object} altRegion An object literal containing the region for the first element if we already have the data (for performance i.e. DragDrop)
     * @return {Object} Object literal containing the following intersection data: (top, right, bottom, left, area, yoff, xoff, inRegion)
     */
    intersect: function(node, node2, altRegion) {
        var r = altRegion || DOM.region(node), region = {},
            n = node2,
            off;

        if (n.tagName) {
            region = DOM.region(n);
        } else if (Y.Lang.isObject(node2)) {
            region = node2;
        } else {
            return false;
        }

        off = getOffsets(region, r);
        return {
            top: off[TOP],
            right: off[RIGHT],
            bottom: off[BOTTOM],
            left: off[LEFT],
            area: ((off[BOTTOM] - off[TOP]) * (off[RIGHT] - off[LEFT])),
            yoff: ((off[BOTTOM] - off[TOP])),
            xoff: (off[RIGHT] - off[LEFT]),
            inRegion: DOM.inRegion(node, node2, false, altRegion)
        };

    },
    /**
     * Check if any part of this node is in the passed region
     * @method inRegion
     * @for DOM
     * @param {Object} node2 The node to get the region from or an Object literal of the region
     * $param {Boolean} all Should all of the node be inside the region
     * @param {Object} altRegion An object literal containing the region for this node if we already have the data (for performance i.e. DragDrop)
     * @return {Boolean} True if in region, false if not.
     */
    inRegion: function(node, node2, all, altRegion) {
        var region = {},
            r = altRegion || DOM.region(node),
            n = node2,
            off;

        if (n.tagName) {
            region = DOM.region(n);
        } else if (Y.Lang.isObject(node2)) {
            region = node2;
        } else {
            return false;
        }

        if (all) {
            return (
                r[LEFT]   >= region[LEFT]   &&
                r[RIGHT]  <= region[RIGHT]  &&
                r[TOP]    >= region[TOP]    &&
                r[BOTTOM] <= region[BOTTOM]  );
        } else {
            off = getOffsets(region, r);
            if (off[BOTTOM] >= off[TOP] && off[RIGHT] >= off[LEFT]) {
                return true;
            } else {
                return false;
            }

        }
    },

    /**
     * Check if any part of this element is in the viewport
     * @method inViewportRegion
     * @for DOM
     * @param {HTMLElement} element The DOM element.
     * @param {Boolean} all Should all of the node be inside the region
     * @param {Object} altRegion An object literal containing the region for this node if we already have the data (for performance i.e. DragDrop)
     * @return {Boolean} True if in region, false if not.
     */
    inViewportRegion: function(node, all, altRegion) {
        return DOM.inRegion(node, DOM.viewportRegion(node), all, altRegion);

    },

    _getRegion: function(t, r, b, l) {
        var region = {};

        region[TOP] = region[1] = t;
        region[LEFT] = region[0] = l;
        region[BOTTOM] = b;
        region[RIGHT] = r;
        region.width = region[RIGHT] - region[LEFT];
        region.height = region[BOTTOM] - region[TOP];

        return region;
    },

    /**
     * Returns an Object literal containing the following about the visible region of viewport: (top, right, bottom, left)
     * @method viewportRegion
     * @for DOM
     * @return {Object} Object literal containing the following about the visible region of the viewport: (top, right, bottom, left)
     */
    viewportRegion: function(node) {
        node = node || Y.config.doc.documentElement;
        var ret = false,
            scrollX,
            scrollY;

        if (node) {
            scrollX = DOM.docScrollX(node);
            scrollY = DOM.docScrollY(node);

            ret = DOM._getRegion(scrollY, // top
                DOM.winWidth(node) + scrollX, // right
                scrollY + DOM.winHeight(node), // bottom
                scrollX); // left
        }

        return ret;
    }
});
})(Y);


}, '3.3.0' ,{requires:['dom-base', 'dom-style', 'event-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('node-base', function(Y) {

/**
 * The Node Utility provides a DOM-like interface for interacting with DOM nodes.
 * @module node
 * @submodule node-base
 */

/**
 * The Node class provides a wrapper for manipulating DOM Nodes.
 * Node properties can be accessed via the set/get methods.
 * Use Y.get() to retrieve Node instances.
 *
 * <strong>NOTE:</strong> Node properties are accessed using
 * the <code>set</code> and <code>get</code> methods.
 *
 * @class Node
 * @constructor
 * @param {DOMNode} node the DOM node to be mapped to the Node instance.
 * @for Node
 */

// "globals"
var DOT = '.',
    NODE_NAME = 'nodeName',
    NODE_TYPE = 'nodeType',
    OWNER_DOCUMENT = 'ownerDocument',
    TAG_NAME = 'tagName',
    UID = '_yuid',

    _slice = Array.prototype.slice,

    Y_DOM = Y.DOM,

    Y_Node = function(node) {
        var uid = (node.nodeType !== 9) ? node.uniqueID : node[UID];

        if (uid && Y_Node._instances[uid] && Y_Node._instances[uid]._node !== node) {
            node[UID] = null; // unset existing uid to prevent collision (via clone or hack)
        }

        uid = uid || Y.stamp(node);
        if (!uid) { // stamp failed; likely IE non-HTMLElement
            uid = Y.guid();
        }

        this[UID] = uid;

        /**
         * The underlying DOM node bound to the Y.Node instance
         * @property _node
         * @private
         */
        this._node = node;
        Y_Node._instances[uid] = this;

        this._stateProxy = node; // when augmented with Attribute

        Y.EventTarget.call(this, {emitFacade:true});

        if (this._initPlugins) { // when augmented with Plugin.Host
            this._initPlugins();
        }

        this.SHOW_TRANSITION = Y_Node.SHOW_TRANSITION;
        this.HIDE_TRANSITION = Y_Node.HIDE_TRANSITION;
    },

    // used with previous/next/ancestor unittests
    _wrapFn = function(fn) {
        var ret = null;
        if (fn) {
            ret = (typeof fn == 'string') ?
            function(n) {
                return Y.Selector.test(n, fn);
            } :
            function(n) {
                return fn(Y.one(n));
            };
        }

        return ret;
    };
// end "globals"

/**
 * The name of the component
 * @static
 * @property NAME
 */
Y_Node.NAME = 'node';

/*
 * The pattern used to identify ARIA attributes
 */
Y_Node.re_aria = /^(?:role$|aria-)/;

Y_Node.SHOW_TRANSITION = 'fadeIn';
Y_Node.HIDE_TRANSITION = 'fadeOut';

/**
 * List of events that route to DOM events
 * @static
 * @property DOM_EVENTS
 */

Y_Node.DOM_EVENTS = {
    abort: 1,
    beforeunload: 1,
    blur: 1,
    change: 1,
    click: 1,
    close: 1,
    command: 1,
    contextmenu: 1,
    dblclick: 1,
    DOMMouseScroll: 1,
    drag: 1,
    dragstart: 1,
    dragenter: 1,
    dragover: 1,
    dragleave: 1,
    dragend: 1,
    drop: 1,
    error: 1,
    focus: 1,
    key: 1,
    keydown: 1,
    keypress: 1,
    keyup: 1,
    load: 1,
    message: 1,
    mousedown: 1,
    mouseenter: 1,
    mouseleave: 1,
    mousemove: 1,
    mousemultiwheel: 1,
    mouseout: 1,
    mouseover: 1,
    mouseup: 1,
    mousewheel: 1,
    orientationchange: 1,
    reset: 1,
    resize: 1,
    select: 1,
    selectstart: 1,
    submit: 1,
    scroll: 1,
    textInput: 1,
    unload: 1
};

// Add custom event adaptors to this list.  This will make it so
// that delegate, key, available, contentready, etc all will
// be available through Node.on
Y.mix(Y_Node.DOM_EVENTS, Y.Env.evt.plugins);

/**
 * A list of Node instances that have been created
 * @private
 * @property _instances
 * @static
 *
 */
Y_Node._instances = {};

/**
 * Retrieves the DOM node bound to a Node instance
 * @method getDOMNode
 * @static
 *
 * @param {Y.Node || HTMLNode} node The Node instance or an HTMLNode
 * @return {HTMLNode} The DOM node bound to the Node instance.  If a DOM node is passed
 * as the node argument, it is simply returned.
 */
Y_Node.getDOMNode = function(node) {
    if (node) {
        return (node.nodeType) ? node : node._node || null;
    }
    return null;
};

/**
 * Checks Node return values and wraps DOM Nodes as Y.Node instances
 * and DOM Collections / Arrays as Y.NodeList instances.
 * Other return values just pass thru.  If undefined is returned (e.g. no return)
 * then the Node instance is returned for chainability.
 * @method scrubVal
 * @static
 *
 * @param {any} node The Node instance or an HTMLNode
 * @return {Y.Node | Y.NodeList | any} Depends on what is returned from the DOM node.
 */
Y_Node.scrubVal = function(val, node) {
    if (val) { // only truthy values are risky
         if (typeof val == 'object' || typeof val == 'function') { // safari nodeList === function
            if (NODE_TYPE in val || Y_DOM.isWindow(val)) {// node || window
                val = Y.one(val);
            } else if ((val.item && !val._nodes) || // dom collection or Node instance
                    (val[0] && val[0][NODE_TYPE])) { // array of DOM Nodes
                val = Y.all(val);
            }
        }
    } else if (typeof val === 'undefined') {
        val = node; // for chaining
    } else if (val === null) {
        val = null; // IE: DOM null not the same as null
    }

    return val;
};

/**
 * Adds methods to the Y.Node prototype, routing through scrubVal.
 * @method addMethod
 * @static
 *
 * @param {String} name The name of the method to add
 * @param {Function} fn The function that becomes the method
 * @param {Object} context An optional context to call the method with
 * (defaults to the Node instance)
 * @return {any} Depends on what is returned from the DOM node.
 */
Y_Node.addMethod = function(name, fn, context) {
    if (name && fn && typeof fn == 'function') {
        Y_Node.prototype[name] = function() {
            var args = _slice.call(arguments),
                node = this,
                ret;

            if (args[0] && Y.instanceOf(args[0], Y_Node)) {
                args[0] = args[0]._node;
            }

            if (args[1] && Y.instanceOf(args[1], Y_Node)) {
                args[1] = args[1]._node;
            }
            args.unshift(node._node);

            ret = fn.apply(node, args);

            if (ret) { // scrub truthy
                ret = Y_Node.scrubVal(ret, node);
            }

            (typeof ret != 'undefined') || (ret = node);
            return ret;
        };
    } else {
    }
};

/**
 * Imports utility methods to be added as Y.Node methods.
 * @method importMethod
 * @static
 *
 * @param {Object} host The object that contains the method to import.
 * @param {String} name The name of the method to import
 * @param {String} altName An optional name to use in place of the host name
 * @param {Object} context An optional context to call the method with
 */
Y_Node.importMethod = function(host, name, altName) {
    if (typeof name == 'string') {
        altName = altName || name;
        Y_Node.addMethod(altName, host[name], host);
    } else {
        Y.Array.each(name, function(n) {
            Y_Node.importMethod(host, n);
        });
    }
};

/**
 * Returns a single Node instance bound to the node or the
 * first element matching the given selector. Returns null if no match found.
 * <strong>Note:</strong> For chaining purposes you may want to
 * use <code>Y.all</code>, which returns a NodeList when no match is found.
 * @method Y.one
 * @static
 * @param {String | HTMLElement} node a node or Selector
 * @return {Y.Node | null} a Node instance or null if no match found.
 */
Y_Node.one = function(node) {
    var instance = null,
        cachedNode,
        uid;

    if (node) {
        if (typeof node == 'string') {
            if (node.indexOf('doc') === 0) { // doc OR document
                node = Y.config.doc;
            } else if (node.indexOf('win') === 0) { // win OR window
                node = Y.config.win;
            } else {
                node = Y.Selector.query(node, null, true);
            }
            if (!node) {
                return null;
            }
        } else if (Y.instanceOf(node, Y_Node)) {
            return node; // NOTE: return
        }

        if (node.nodeType || Y.DOM.isWindow(node)) { // avoid bad input (numbers, boolean, etc)
            uid = (node.uniqueID && node.nodeType !== 9) ? node.uniqueID : node._yuid;
            instance = Y_Node._instances[uid]; // reuse exising instances
            cachedNode = instance ? instance._node : null;
            if (!instance || (cachedNode && node !== cachedNode)) { // new Node when nodes don't match
                instance = new Y_Node(node);
            }
        }
    }
    return instance;
};

/**
 * Returns a new dom node using the provided markup string.
 * @method create
 * @static
 * @param {String} html The markup used to create the element
 * @param {HTMLDocument} doc An optional document context
 * @return {Node} A Node instance bound to a DOM node or fragment
 */
Y_Node.create = function(html, doc) {
    if (doc && doc._node) {
        doc = doc._node;
    }
    return Y.one(Y_DOM.create(html, doc));
};

/**
 * Static collection of configuration attributes for special handling
 * @property ATTRS
 * @static
 * @type object
 */
Y_Node.ATTRS = {
    /**
     * Allows for getting and setting the text of an element.
     * Formatting is preserved and special characters are treated literally.
     * @config text
     * @type String
     */
    text: {
        getter: function() {
            return Y_DOM.getText(this._node);
        },

        setter: function(content) {
            Y_DOM.setText(this._node, content);
            return content;
        }
    },

    'options': {
        getter: function() {
            return this._node.getElementsByTagName('option');
        }
    },

    /**
     * Returns a NodeList instance of all HTMLElement children.
     * @readOnly
     * @config children
     * @type NodeList
     */
    'children': {
        getter: function() {
            var node = this._node,
                children = node.children,
                childNodes, i, len;

            if (!children) {
                childNodes = node.childNodes;
                children = [];

                for (i = 0, len = childNodes.length; i < len; ++i) {
                    if (childNodes[i][TAG_NAME]) {
                        children[children.length] = childNodes[i];
                    }
                }
            }
            return Y.all(children);
        }
    },

    value: {
        getter: function() {
            return Y_DOM.getValue(this._node);
        },

        setter: function(val) {
            Y_DOM.setValue(this._node, val);
            return val;
        }
    }
};

/**
 * The default setter for DOM properties
 * Called with instance context (this === the Node instance)
 * @method DEFAULT_SETTER
 * @static
 * @param {String} name The attribute/property being set
 * @param {any} val The value to be set
 * @return {any} The value
 */
Y_Node.DEFAULT_SETTER = function(name, val) {
    var node = this._stateProxy,
        strPath;

    if (name.indexOf(DOT) > -1) {
        strPath = name;
        name = name.split(DOT);
        // only allow when defined on node
        Y.Object.setValue(node, name, val);
    } else if (typeof node[name] != 'undefined') { // pass thru DOM properties
        node[name] = val;
    }

    return val;
};

/**
 * The default getter for DOM properties
 * Called with instance context (this === the Node instance)
 * @method DEFAULT_GETTER
 * @static
 * @param {String} name The attribute/property to look up
 * @return {any} The current value
 */
Y_Node.DEFAULT_GETTER = function(name) {
    var node = this._stateProxy,
        val;

    if (name.indexOf && name.indexOf(DOT) > -1) {
        val = Y.Object.getValue(node, name.split(DOT));
    } else if (typeof node[name] != 'undefined') { // pass thru from DOM
        val = node[name];
    }

    return val;
};

// Basic prototype augment - no lazy constructor invocation.
Y.mix(Y_Node, Y.EventTarget, false, null, 1);

Y.mix(Y_Node.prototype, {
/**
 * The method called when outputting Node instances as strings
 * @method toString
 * @return {String} A string representation of the Node instance
 */
    toString: function() {
        var str = this[UID] + ': not bound to a node',
            node = this._node,
            attrs, id, className;

        if (node) {
            attrs = node.attributes;
            id = (attrs && attrs.id) ? node.getAttribute('id') : null;
            className = (attrs && attrs.className) ? node.getAttribute('className') : null;
            str = node[NODE_NAME];

            if (id) {
                str += '#' + id;
            }

            if (className) {
                str += '.' + className.replace(' ', '.');
            }

            // TODO: add yuid?
            str += ' ' + this[UID];
        }
        return str;
    },

    /**
     * Returns an attribute value on the Node instance.
     * Unless pre-configured (via Node.ATTRS), get hands
     * off to the underlying DOM node.  Only valid
     * attributes/properties for the node will be set.
     * @method get
     * @param {String} attr The attribute
     * @return {any} The current value of the attribute
     */
    get: function(attr) {
        var val;

        if (this._getAttr) { // use Attribute imple
            val = this._getAttr(attr);
        } else {
            val = this._get(attr);
        }

        if (val) {
            val = Y_Node.scrubVal(val, this);
        } else if (val === null) {
            val = null; // IE: DOM null is not true null (even though they ===)
        }
        return val;
    },

    /**
     * Helper method for get.
     * @method _get
     * @private
     * @param {String} attr The attribute
     * @return {any} The current value of the attribute
     */
    _get: function(attr) {
        var attrConfig = Y_Node.ATTRS[attr],
            val;

        if (attrConfig && attrConfig.getter) {
            val = attrConfig.getter.call(this);
        } else if (Y_Node.re_aria.test(attr)) {
            val = this._node.getAttribute(attr, 2);
        } else {
            val = Y_Node.DEFAULT_GETTER.apply(this, arguments);
        }

        return val;
    },

    /**
     * Sets an attribute on the Node instance.
     * Unless pre-configured (via Node.ATTRS), set hands
     * off to the underlying DOM node.  Only valid
     * attributes/properties for the node will be set.
     * To set custom attributes use setAttribute.
     * @method set
     * @param {String} attr The attribute to be set.
     * @param {any} val The value to set the attribute to.
     * @chainable
     */
    set: function(attr, val) {
        var attrConfig = Y_Node.ATTRS[attr];

        if (this._setAttr) { // use Attribute imple
            this._setAttr.apply(this, arguments);
        } else { // use setters inline
            if (attrConfig && attrConfig.setter) {
                attrConfig.setter.call(this, val, attr);
            } else if (Y_Node.re_aria.test(attr)) { // special case Aria
                this._node.setAttribute(attr, val);
            } else {
                Y_Node.DEFAULT_SETTER.apply(this, arguments);
            }
        }

        return this;
    },

    /**
     * Sets multiple attributes.
     * @method setAttrs
     * @param {Object} attrMap an object of name/value pairs to set
     * @chainable
     */
    setAttrs: function(attrMap) {
        if (this._setAttrs) { // use Attribute imple
            this._setAttrs(attrMap);
        } else { // use setters inline
            Y.Object.each(attrMap, function(v, n) {
                this.set(n, v);
            }, this);
        }

        return this;
    },

    /**
     * Returns an object containing the values for the requested attributes.
     * @method getAttrs
     * @param {Array} attrs an array of attributes to get values
     * @return {Object} An object with attribute name/value pairs.
     */
    getAttrs: function(attrs) {
        var ret = {};
        if (this._getAttrs) { // use Attribute imple
            this._getAttrs(attrs);
        } else { // use setters inline
            Y.Array.each(attrs, function(v, n) {
                ret[v] = this.get(v);
            }, this);
        }

        return ret;
    },

    /**
     * Creates a new Node using the provided markup string.
     * @method create
     * @param {String} html The markup used to create the element
     * @param {HTMLDocument} doc An optional document context
     * @return {Node} A Node instance bound to a DOM node or fragment
     */
    create: Y_Node.create,

    /**
     * Compares nodes to determine if they match.
     * Node instances can be compared to each other and/or HTMLElements.
     * @method compareTo
     * @param {HTMLElement | Node} refNode The reference node to compare to the node.
     * @return {Boolean} True if the nodes match, false if they do not.
     */
    compareTo: function(refNode) {
        var node = this._node;

        if (Y.instanceOf(refNode, Y_Node)) {
            refNode = refNode._node;
        }
        return node === refNode;
    },

    /**
     * Determines whether the node is appended to the document.
     * @method inDoc
     * @param {Node|HTMLElement} doc optional An optional document to check against.
     * Defaults to current document.
     * @return {Boolean} Whether or not this node is appended to the document.
     */
    inDoc: function(doc) {
        var node = this._node;
        doc = (doc) ? doc._node || doc : node[OWNER_DOCUMENT];
        if (doc.documentElement) {
            return Y_DOM.contains(doc.documentElement, node);
        }
    },

    getById: function(id) {
        var node = this._node,
            ret = Y_DOM.byId(id, node[OWNER_DOCUMENT]);
        if (ret && Y_DOM.contains(node, ret)) {
            ret = Y.one(ret);
        } else {
            ret = null;
        }
        return ret;
    },

   /**
     * Returns the nearest ancestor that passes the test applied by supplied boolean method.
     * @method ancestor
     * @param {String | Function} fn A selector string or boolean method for testing elements.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {Node} The matching Node instance or null if not found
     */
    ancestor: function(fn, testSelf) {
        return Y.one(Y_DOM.ancestor(this._node, _wrapFn(fn), testSelf));
    },

   /**
     * Returns the ancestors that pass the test applied by supplied boolean method.
     * @method ancestors
     * @param {String | Function} fn A selector string or boolean method for testing elements.
     * @param {Boolean} testSelf optional Whether or not to include the element in the scan
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {NodeList} A NodeList instance containing the matching elements
     */
    ancestors: function(fn, testSelf) {
        return Y.all(Y_DOM.ancestors(this._node, _wrapFn(fn), testSelf));
    },

    /**
     * Returns the previous matching sibling.
     * Returns the nearest element node sibling if no method provided.
     * @method previous
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {Node} Node instance or null if not found
     */
    previous: function(fn, all) {
        return Y.one(Y_DOM.elementByAxis(this._node, 'previousSibling', _wrapFn(fn), all));
    },

    /**
     * Returns the next matching sibling.
     * Returns the nearest element node sibling if no method provided.
     * @method next
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {Node} Node instance or null if not found
     */
    next: function(fn, all) {
        return Y.one(Y_DOM.elementByAxis(this._node, 'nextSibling', _wrapFn(fn), all));
    },

    /**
     * Returns all matching siblings.
     * Returns all siblings if no method provided.
     * @method siblings
     * @param {String | Function} fn A selector or boolean method for testing elements.
     * If a function is used, it receives the current node being tested as the only argument.
     * @return {NodeList} NodeList instance bound to found siblings
     */
    siblings: function(fn) {
        return Y.all(Y_DOM.siblings(this._node, _wrapFn(fn)));
    },

    /**
     * Retrieves a Node instance of nodes based on the given CSS selector.
     * @method one
     *
     * @param {string} selector The CSS selector to test against.
     * @return {Node} A Node instance for the matching HTMLElement.
     */
    one: function(selector) {
        return Y.one(Y.Selector.query(selector, this._node, true));
    },

    /**
     * Retrieves a nodeList based on the given CSS selector.
     * @method all
     *
     * @param {string} selector The CSS selector to test against.
     * @return {NodeList} A NodeList instance for the matching HTMLCollection/Array.
     */
    all: function(selector) {
        var nodelist = Y.all(Y.Selector.query(selector, this._node));
        nodelist._query = selector;
        nodelist._queryRoot = this._node;
        return nodelist;
    },

    // TODO: allow fn test
    /**
     * Test if the supplied node matches the supplied selector.
     * @method test
     *
     * @param {string} selector The CSS selector to test against.
     * @return {boolean} Whether or not the node matches the selector.
     */
    test: function(selector) {
        return Y.Selector.test(this._node, selector);
    },

    /**
     * Removes the node from its parent.
     * Shortcut for myNode.get('parentNode').removeChild(myNode);
     * @method remove
     * @param {Boolean} destroy whether or not to call destroy() on the node
     * after removal.
     * @chainable
     *
     */
    remove: function(destroy) {
        var node = this._node,
            parentNode = node.parentNode;

        if (parentNode) {
            parentNode.removeChild(node);
        }

        if (destroy) {
            this.destroy();
        }

        return this;
    },

    /**
     * Replace the node with the other node. This is a DOM update only
     * and does not change the node bound to the Node instance.
     * Shortcut for myNode.get('parentNode').replaceChild(newNode, myNode);
     * @method replace
     * @param {Y.Node || HTMLNode} newNode Node to be inserted
     * @chainable
     *
     */
    replace: function(newNode) {
        var node = this._node;
        if (typeof newNode == 'string') {
            newNode = Y_Node.create(newNode);
        }
        node.parentNode.replaceChild(Y_Node.getDOMNode(newNode), node);
        return this;
    },

    /**
     * @method replaceChild
     * @for Node
     * @param {String | HTMLElement | Node} node Node to be inserted
     * @param {HTMLElement | Node} refNode Node to be replaced
     * @return {Node} The replaced node
     */
    replaceChild: function(node, refNode) {
        if (typeof node == 'string') {
            node = Y_DOM.create(node);
        }

        return Y.one(this._node.replaceChild(Y_Node.getDOMNode(node), Y_Node.getDOMNode(refNode)));
    },

    /**
     * @method appendChild
     * @param {String | HTMLElement | Node} node Node to be appended
     * @return {Node} The appended node
     */
    appendChild: function(node) {
        return Y_Node.scrubVal(this._insert(node));
    },

    /**
     * @method insertBefore
     * @param {String | HTMLElement | Node} newNode Node to be appended
     * @param {HTMLElement | Node} refNode Node to be inserted before
     * @return {Node} The inserted node
     */
    insertBefore: function(newNode, refNode) {
        return Y.Node.scrubVal(this._insert(newNode, refNode));
    },

    /**
     * Removes event listeners from the node and (optionally) its subtree
     * @method purge
     * @param {Boolean} recurse (optional) Whether or not to remove listeners from the
     * node's subtree
     * @param {String} type (optional) Only remove listeners of the specified type
     * @chainable
     *
     */
    purge: function(recurse, type) {
        Y.Event.purgeElement(this._node, recurse, type);
        return this;
    },

    /**
     * Nulls internal node references, removes any plugins and event listeners
     * @method destroy
     * @param {Boolean} recursivePurge (optional) Whether or not to remove listeners from the
     * node's subtree (default is false)
     *
     */
    destroy: function(recursive) {
        this.purge(); // TODO: only remove events add via this Node

        if (this.unplug) { // may not be a PluginHost
            this.unplug();
        }

        this.clearData();

        if (recursive) {
            this.all('*').destroy();
        }

        this._node = null;
        this._stateProxy = null;

        delete Y_Node._instances[this[UID]];
    },

    /**
     * Invokes a method on the Node instance
     * @method invoke
     * @param {String} method The name of the method to invoke
     * @param {Any}  a, b, c, etc. Arguments to invoke the method with.
     * @return Whatever the underly method returns.
     * DOM Nodes and Collections return values
     * are converted to Node/NodeList instances.
     *
     */
    invoke: function(method, a, b, c, d, e) {
        var node = this._node,
            ret;

        if (a && Y.instanceOf(a, Y_Node)) {
            a = a._node;
        }

        if (b && Y.instanceOf(b, Y_Node)) {
            b = b._node;
        }

        ret = node[method](a, b, c, d, e);
        return Y_Node.scrubVal(ret, this);
    },

    /**
     * Inserts the content before the reference node.
     * @method insert
     * @param {String | Y.Node | HTMLElement | Y.NodeList | HTMLCollection} content The content to insert
     * @param {Int | Y.Node | HTMLElement | String} where The position to insert at.
     * Possible "where" arguments
     * <dl>
     * <dt>Y.Node</dt>
     * <dd>The Node to insert before</dd>
     * <dt>HTMLElement</dt>
     * <dd>The element to insert before</dd>
     * <dt>Int</dt>
     * <dd>The index of the child element to insert before</dd>
     * <dt>"replace"</dt>
     * <dd>Replaces the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts before the existing HTML</dd>
     * <dt>"before"</dt>
     * <dd>Inserts content before the node</dd>
     * <dt>"after"</dt>
     * <dd>Inserts content after the node</dd>
     * </dl>
     * @chainable
     */
    insert: function(content, where) {
        this._insert(content, where);
        return this;
    },

    _insert: function(content, where) {
        var node = this._node,
            ret = null;

        if (typeof where == 'number') { // allow index
            where = this._node.childNodes[where];
        } else if (where && where._node) { // Node
            where = where._node;
        }

        if (content && typeof content != 'string') { // allow Node or NodeList/Array instances
            content = content._node || content._nodes || content;
        }
        ret = Y_DOM.addHTML(node, content, where);

        return ret;
    },

    /**
     * Inserts the content as the firstChild of the node.
     * @method prepend
     * @param {String | Y.Node | HTMLElement} content The content to insert
     * @chainable
     */
    prepend: function(content) {
        return this.insert(content, 0);
    },

    /**
     * Inserts the content as the lastChild of the node.
     * @method append
     * @param {String | Y.Node | HTMLElement} content The content to insert
     * @chainable
     */
    append: function(content) {
        return this.insert(content, null);
    },

    /**
     * Appends the node to the given node.
     * @method appendTo
     * @param {Y.Node | HTMLElement} node The node to append to
     * @chainable
     */
    appendTo: function(node) {
        Y.one(node).append(this);
        return this;
    },

    /**
     * Replaces the node's current content with the content.
     * @method setContent
     * @param {String | Y.Node | HTMLElement | Y.NodeList | HTMLCollection} content The content to insert
     * @chainable
     */
    setContent: function(content) {
        this._insert(content, 'replace');
        return this;
    },

    /**
     * Returns the node's current content (e.g. innerHTML)
     * @method getContent
     * @return {String} The current content
     */
    getContent: function(content) {
        return this.get('innerHTML');
    },

    /**
    * @method swap
    * @description Swap DOM locations with the given node.
    * This does not change which DOM node each Node instance refers to.
    * @param {Node} otherNode The node to swap with
     * @chainable
    */
    swap: Y.config.doc.documentElement.swapNode ?
        function(otherNode) {
            this._node.swapNode(Y_Node.getDOMNode(otherNode));
        } :
        function(otherNode) {
            otherNode = Y_Node.getDOMNode(otherNode);
            var node = this._node,
                parent = otherNode.parentNode,
                nextSibling = otherNode.nextSibling;

            if (nextSibling === node) {
                parent.insertBefore(node, otherNode);
            } else if (otherNode === node.nextSibling) {
                parent.insertBefore(otherNode, node);
            } else {
                node.parentNode.replaceChild(otherNode, node);
                Y_DOM.addHTML(parent, node, nextSibling);
            }
            return this;
        },


    /**
    * @method getData
    * @description Retrieves arbitrary data stored on a Node instance.
    * This is not stored with the DOM node.
    * @param {string} name Optional name of the data field to retrieve.
    * If no name is given, all data is returned.
    * @return {any | Object} Whatever is stored at the given field,
    * or an object hash of all fields.
    */
    getData: function(name) {
        var ret;
        this._data = this._data || {};
        if (arguments.length) {
            ret = this._data[name];
        } else {
            ret = this._data;
        }

        return ret;

    },

    /**
    * @method setData
    * @description Stores arbitrary data on a Node instance.
    * This is not stored with the DOM node.
    * @param {string} name The name of the field to set. If no name
    * is given, name is treated as the data and overrides any existing data.
    * @param {any} val The value to be assigned to the field.
    * @chainable
    */
    setData: function(name, val) {
        this._data = this._data || {};
        if (arguments.length > 1) {
            this._data[name] = val;
        } else {
            this._data = name;
        }

       return this;
    },

    /**
    * @method clearData
    * @description Clears stored data.
    * @param {string} name The name of the field to clear. If no name
    * is given, all data is cleared.
    * @chainable
    */
    clearData: function(name) {
        if ('_data' in this) {
            if (name) {
                delete this._data[name];
            } else {
                delete this._data;
            }
        }

        return this;
    },

    hasMethod: function(method) {
        var node = this._node;
        return !!(node && method in node &&
                typeof node[method] != 'unknown' &&
            (typeof node[method] == 'function' ||
                String(node[method]).indexOf('function') === 1)); // IE reports as object, prepends space
    },

    SHOW_TRANSITION: null,
    HIDE_TRANSITION: null,

    /**
     * Makes the node visible.
     * If the "transition" module is loaded, show optionally
     * animates the showing of the node using either the default
     * transition effect ('fadeIn'), or the given named effect.
     * @method show
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    show: function(callback) {
        callback = arguments[arguments.length - 1];
        this.toggleView(true, callback);
        return this;
    },

    /**
     * The implementation for showing nodes.
     * Default is to toggle the style.display property.
     * @protected
     * @chainable
     */
    _show: function() {
        this.setStyle('display', '');

    },

    _isHidden: function() {
        return Y.DOM.getStyle(this._node, 'display') === 'none';
    },

    toggleView: function(on, callback) {
        this._toggleView.apply(this, arguments);
    },

    _toggleView: function(on, callback) {
        callback = arguments[arguments.length - 1];

        // base on current state if not forcing
        if (typeof on != 'boolean') {
            on = (this._isHidden()) ? 1 : 0;
        }

        if (on) {
            this._show();
        }  else {
            this._hide();
        }

        if (typeof callback == 'function') {
            callback.call(this);
        }

        return this;
    },

    /**
     * Hides the node.
     * If the "transition" module is loaded, hide optionally
     * animates the hiding of the node using either the default
     * transition effect ('fadeOut'), or the given named effect.
     * @method hide
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    hide: function(callback) {
        callback = arguments[arguments.length - 1];
        this.toggleView(false, callback);
        return this;
    },

    /**
     * The implementation for hiding nodes.
     * Default is to toggle the style.display property.
     * @protected
     * @chainable
     */
    _hide: function() {
        this.setStyle('display', 'none');
    },

    isFragment: function() {
        return (this.get('nodeType') === 11);
    },

    /**
     * Removes all of the child nodes from the node.
     * @param {Boolean} destroy Whether the nodes should also be destroyed.
     * @chainable
     */
    empty: function(destroy) {
        this.get('childNodes').remove(destroy);
        return this;
    }

}, true);

Y.Node = Y_Node;
Y.one = Y.Node.one;
/**
 * The NodeList module provides support for managing collections of Nodes.
 * @module node
 * @submodule nodelist
 */

/**
 * The NodeList class provides a wrapper for manipulating DOM NodeLists.
 * NodeList properties can be accessed via the set/get methods.
 * Use Y.all() to retrieve NodeList instances.
 *
 * @class NodeList
 * @constructor
 */

var NodeList = function(nodes) {
    var tmp = [];
    if (typeof nodes === 'string') { // selector query
        this._query = nodes;
        nodes = Y.Selector.query(nodes);
    } else if (nodes.nodeType || Y_DOM.isWindow(nodes)) { // domNode || window
        nodes = [nodes];
    } else if (Y.instanceOf(nodes, Y.Node)) {
        nodes = [nodes._node];
    } else if (Y.instanceOf(nodes[0], Y.Node)) { // allow array of Y.Nodes
        Y.Array.each(nodes, function(node) {
            if (node._node) {
                tmp.push(node._node);
            }
        });
        nodes = tmp;
    } else { // array of domNodes or domNodeList (no mixed array of Y.Node/domNodes)
        nodes = Y.Array(nodes, 0, true);
    }

    /**
     * The underlying array of DOM nodes bound to the Y.NodeList instance
     * @property _nodes
     * @private
     */
    this._nodes = nodes;
};

NodeList.NAME = 'NodeList';

/**
 * Retrieves the DOM nodes bound to a NodeList instance
 * @method NodeList.getDOMNodes
 * @static
 *
 * @param {Y.NodeList} nodelist The NodeList instance
 * @return {Array} The array of DOM nodes bound to the NodeList
 */
NodeList.getDOMNodes = function(nodelist) {
    return (nodelist && nodelist._nodes) ? nodelist._nodes : nodelist;
};

NodeList.each = function(instance, fn, context) {
    var nodes = instance._nodes;
    if (nodes && nodes.length) {
        Y.Array.each(nodes, fn, context || instance);
    } else {
    }
};

NodeList.addMethod = function(name, fn, context) {
    if (name && fn) {
        NodeList.prototype[name] = function() {
            var ret = [],
                args = arguments;

            Y.Array.each(this._nodes, function(node) {
                var UID = (node.uniqueID && node.nodeType !== 9 ) ? 'uniqueID' : '_yuid',
                    instance = Y.Node._instances[node[UID]],
                    ctx,
                    result;

                if (!instance) {
                    instance = NodeList._getTempNode(node);
                }
                ctx = context || instance;
                result = fn.apply(ctx, args);
                if (result !== undefined && result !== instance) {
                    ret[ret.length] = result;
                }
            });

            // TODO: remove tmp pointer
            return ret.length ? ret : this;
        };
    } else {
    }
};

NodeList.importMethod = function(host, name, altName) {
    if (typeof name === 'string') {
        altName = altName || name;
        NodeList.addMethod(name, host[name]);
    } else {
        Y.Array.each(name, function(n) {
            NodeList.importMethod(host, n);
        });
    }
};

NodeList._getTempNode = function(node) {
    var tmp = NodeList._tempNode;
    if (!tmp) {
        tmp = Y.Node.create('<div></div>');
        NodeList._tempNode = tmp;
    }

    tmp._node = node;
    tmp._stateProxy = node;
    return tmp;
};

Y.mix(NodeList.prototype, {
    /**
     * Retrieves the Node instance at the given index.
     * @method item
     *
     * @param {Number} index The index of the target Node.
     * @return {Node} The Node instance at the given index.
     */
    item: function(index) {
        return Y.one((this._nodes || [])[index]);
    },

    /**
     * Applies the given function to each Node in the NodeList.
     * @method each
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index, and the NodeList instance
     * @param {Object} context optional An optional context to apply the function with
     * Default context is the current Node instance
     * @chainable
     */
    each: function(fn, context) {
        var instance = this;
        Y.Array.each(this._nodes, function(node, index) {
            node = Y.one(node);
            return fn.call(context || node, node, index, instance);
        });
        return instance;
    },

    batch: function(fn, context) {
        var nodelist = this;

        Y.Array.each(this._nodes, function(node, index) {
            var instance = Y.Node._instances[node[UID]];
            if (!instance) {
                instance = NodeList._getTempNode(node);
            }

            return fn.call(context || instance, instance, index, nodelist);
        });
        return nodelist;
    },

    /**
     * Executes the function once for each node until a true value is returned.
     * @method some
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index, and the NodeList instance
     * @param {Object} context optional An optional context to execute the function from.
     * Default context is the current Node instance
     * @return {Boolean} Whether or not the function returned true for any node.
     */
    some: function(fn, context) {
        var instance = this;
        return Y.Array.some(this._nodes, function(node, index) {
            node = Y.one(node);
            context = context || node;
            return fn.call(context, node, index, instance);
        });
    },

    /**
     * Creates a documenFragment from the nodes bound to the NodeList instance
     * @method toFrag
     * @return Node a Node instance bound to the documentFragment
     */
    toFrag: function() {
        return Y.one(Y.DOM._nl2frag(this._nodes));
    },

    /**
     * Returns the index of the node in the NodeList instance
     * or -1 if the node isn't found.
     * @method indexOf
     * @param {Y.Node || DOMNode} node the node to search for
     * @return {Int} the index of the node value or -1 if not found
     */
    indexOf: function(node) {
        return Y.Array.indexOf(this._nodes, Y.Node.getDOMNode(node));
    },

    /**
     * Filters the NodeList instance down to only nodes matching the given selector.
     * @method filter
     * @param {String} selector The selector to filter against
     * @return {NodeList} NodeList containing the updated collection
     * @see Selector
     */
    filter: function(selector) {
        return Y.all(Y.Selector.filter(this._nodes, selector));
    },


    /**
     * Creates a new NodeList containing all nodes at every n indices, where
     * remainder n % index equals r.
     * (zero-based index).
     * @method modulus
     * @param {Int} n The offset to use (return every nth node)
     * @param {Int} r An optional remainder to use with the modulus operation (defaults to zero)
     * @return {NodeList} NodeList containing the updated collection
     */
    modulus: function(n, r) {
        r = r || 0;
        var nodes = [];
        NodeList.each(this, function(node, i) {
            if (i % n === r) {
                nodes.push(node);
            }
        });

        return Y.all(nodes);
    },

    /**
     * Creates a new NodeList containing all nodes at odd indices
     * (zero-based index).
     * @method odd
     * @return {NodeList} NodeList containing the updated collection
     */
    odd: function() {
        return this.modulus(2, 1);
    },

    /**
     * Creates a new NodeList containing all nodes at even indices
     * (zero-based index), including zero.
     * @method even
     * @return {NodeList} NodeList containing the updated collection
     */
    even: function() {
        return this.modulus(2);
    },

    destructor: function() {
    },

    /**
     * Reruns the initial query, when created using a selector query
     * @method refresh
     * @chainable
     */
    refresh: function() {
        var doc,
            nodes = this._nodes,
            query = this._query,
            root = this._queryRoot;

        if (query) {
            if (!root) {
                if (nodes && nodes[0] && nodes[0].ownerDocument) {
                    root = nodes[0].ownerDocument;
                }
            }

            this._nodes = Y.Selector.query(query, root);
        }

        return this;
    },

    _prepEvtArgs: function(type, fn, context) {
        // map to Y.on/after signature (type, fn, nodes, context, arg1, arg2, etc)
        var args = Y.Array(arguments, 0, true);

        if (args.length < 2) { // type only (event hash) just add nodes
            args[2] = this._nodes;
        } else {
            args.splice(2, 0, this._nodes);
        }

        args[3] = context || this; // default to NodeList instance as context

        return args;
    },

    /**
     * Applies an event listener to each Node bound to the NodeList.
     * @method on
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @param {Object} context The context to call the handler with.
     * param {mixed} arg* 0..n additional arguments to supply to the subscriber
     * when the event fires.
     * @return {Object} Returns an event handle that can later be use to detach().
     * @see Event.on
     */
    on: function(type, fn, context) {
        return Y.on.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Applies an one-time event listener to each Node bound to the NodeList.
     * @method once
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @return {Object} Returns an event handle that can later be use to detach().
     * @see Event.on
     */
    once: function(type, fn, context) {
        return Y.once.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Applies an event listener to each Node bound to the NodeList.
     * The handler is called only after all on() handlers are called
     * and the event is not prevented.
     * @method after
     * @param {String} type The event being listened for
     * @param {Function} fn The handler to call when the event fires
     * @param {Object} context The context to call the handler with.
     * Default is the NodeList instance.
     * @return {Object} Returns an event handle that can later be use to detach().
     * @see Event.on
     */
    after: function(type, fn, context) {
        return Y.after.apply(Y, this._prepEvtArgs.apply(this, arguments));
    },

    /**
     * Returns the current number of items in the NodeList.
     * @method size
     * @return {Int} The number of items in the NodeList.
     */
    size: function() {
        return this._nodes.length;
    },

    /**
     * Determines if the instance is bound to any nodes
     * @method isEmpty
     * @return {Boolean} Whether or not the NodeList is bound to any nodes
     */
    isEmpty: function() {
        return this._nodes.length < 1;
    },

    toString: function() {
        var str = '',
            errorMsg = this[UID] + ': not bound to any nodes',
            nodes = this._nodes,
            node;

        if (nodes && nodes[0]) {
            node = nodes[0];
            str += node[NODE_NAME];
            if (node.id) {
                str += '#' + node.id;
            }

            if (node.className) {
                str += '.' + node.className.replace(' ', '.');
            }

            if (nodes.length > 1) {
                str += '...[' + nodes.length + ' items]';
            }
        }
        return str || errorMsg;
    }

}, true);

NodeList.importMethod(Y.Node.prototype, [
    /**
     * Called on each Node instance
     * @for NodeList
     * @method append
     * @see Node.append
     */
    'append',

    /** Called on each Node instance
      * @method destroy
      * @see Node.destroy
      */
    'destroy',

    /**
      * Called on each Node instance
      * @method detach
      * @see Node.detach
      */
    'detach',

    /** Called on each Node instance
      * @method detachAll
      * @see Node.detachAll
      */
    'detachAll',

    /** Called on each Node instance
      * @method empty
      * @see Node.empty
      */
    'empty',

    /** Called on each Node instance
      * @method insert
      * @see Node.insert
      */
    'insert',

    /** Called on each Node instance
      * @method prepend
      * @see Node.prepend
      */
    'prepend',

    /** Called on each Node instance
      * @method remove
      * @see Node.remove
      */
    'remove',

    /** Called on each Node instance
      * @method set
      * @see Node.set
      */
    'set',

    /** Called on each Node instance
      * @method setContent
      * @see Node.setContent
      */
    'setContent',

    /**
     * Makes each node visible.
     * If the "transition" module is loaded, show optionally
     * animates the showing of the node using either the default
     * transition effect ('fadeIn'), or the given named effect.
     * @method show
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    'show',

    /**
     * Hides each node.
     * If the "transition" module is loaded, hide optionally
     * animates the hiding of the node using either the default
     * transition effect ('fadeOut'), or the given named effect.
     * @method hide
     * @param {String} name A named Transition effect to use as the show effect.
     * @param {Object} config Options to use with the transition.
     * @param {Function} callback An optional function to run after the transition completes.
     * @chainable
     */
    'hide',

    'toggleView'
]);

// one-off implementation to convert array of Nodes to NodeList
// e.g. Y.all('input').get('parentNode');

/** Called on each Node instance
  * @method get
  * @see Node
  */
NodeList.prototype.get = function(attr) {
    var ret = [],
        nodes = this._nodes,
        isNodeList = false,
        getTemp = NodeList._getTempNode,
        instance,
        val;

    if (nodes[0]) {
        instance = Y.Node._instances[nodes[0]._yuid] || getTemp(nodes[0]);
        val = instance._get(attr);
        if (val && val.nodeType) {
            isNodeList = true;
        }
    }

    Y.Array.each(nodes, function(node) {
        instance = Y.Node._instances[node._yuid];

        if (!instance) {
            instance = getTemp(node);
        }

        val = instance._get(attr);
        if (!isNodeList) { // convert array of Nodes to NodeList
            val = Y.Node.scrubVal(val, instance);
        }

        ret.push(val);
    });

    return (isNodeList) ? Y.all(ret) : ret;
};

Y.NodeList = NodeList;

Y.all = function(nodes) {
    return new NodeList(nodes);
};

Y.Node.all = Y.all;
Y.Array.each([
    /**
     * Passes through to DOM method.
     * @for Node
     * @method removeChild
     * @param {HTMLElement | Node} node Node to be removed
     * @return {Node} The removed node
     */
    'removeChild',

    /**
     * Passes through to DOM method.
     * @method hasChildNodes
     * @return {Boolean} Whether or not the node has any childNodes
     */
    'hasChildNodes',

    /**
     * Passes through to DOM method.
     * @method cloneNode
     * @param {Boolean} deep Whether or not to perform a deep clone, which includes
     * subtree and attributes
     * @return {Node} The clone
     */
    'cloneNode',

    /**
     * Passes through to DOM method.
     * @method hasAttribute
     * @param {String} attribute The attribute to test for
     * @return {Boolean} Whether or not the attribute is present
     */
    'hasAttribute',

    /**
     * Passes through to DOM method.
     * @method removeAttribute
     * @param {String} attribute The attribute to be removed
     * @chainable
     */
    'removeAttribute',

    /**
     * Passes through to DOM method.
     * @method scrollIntoView
     * @chainable
     */
    'scrollIntoView',

    /**
     * Passes through to DOM method.
     * @method getElementsByTagName
     * @param {String} tagName The tagName to collect
     * @return {NodeList} A NodeList representing the HTMLCollection
     */
    'getElementsByTagName',

    /**
     * Passes through to DOM method.
     * @method focus
     * @chainable
     */
    'focus',

    /**
     * Passes through to DOM method.
     * @method blur
     * @chainable
     */
    'blur',

    /**
     * Passes through to DOM method.
     * Only valid on FORM elements
     * @method submit
     * @chainable
     */
    'submit',

    /**
     * Passes through to DOM method.
     * Only valid on FORM elements
     * @method reset
     * @chainable
     */
    'reset',

    /**
     * Passes through to DOM method.
     * @method select
     * @chainable
     */
     'select',

    /**
     * Passes through to DOM method.
     * Only valid on TABLE elements
     * @method createCaption
     * @chainable
     */
    'createCaption'

], function(method) {
    Y.Node.prototype[method] = function(arg1, arg2, arg3) {
        var ret = this.invoke(method, arg1, arg2, arg3);
        return ret;
    };
});

Y.Node.importMethod(Y.DOM, [
    /**
     * Determines whether the node is an ancestor of another HTML element in the DOM hierarchy.
     * @method contains
     * @param {Node | HTMLElement} needle The possible node or descendent
     * @return {Boolean} Whether or not this node is the needle its ancestor
     */
    'contains',
    /**
     * Allows setting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method setAttribute
     * @for Node
     * @for NodeList
     * @chainable
     * @param {string} name The attribute name
     * @param {string} value The value to set
     */
    'setAttribute',
    /**
     * Allows getting attributes on DOM nodes, normalizing in some cases.
     * This passes through to the DOM node, allowing for custom attributes.
     * @method getAttribute
     * @for Node
     * @for NodeList
     * @param {string} name The attribute name
     * @return {string} The attribute value
     */
    'getAttribute',

    /**
     * Wraps the given HTML around the node.
     * @method wrap
     * @param {String} html The markup to wrap around the node.
     * @chainable
     */
    'wrap',

    /**
     * Removes the node's parent node.
     * @method unwrap
     * @chainable
     */
    'unwrap',

    /**
     * Applies a unique ID to the node if none exists
     * @method generateID
     * @return {String} The existing or generated ID
     */
    'generateID'
]);

Y.NodeList.importMethod(Y.Node.prototype, [
/**
 * Allows getting attributes on DOM nodes, normalizing in some cases.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method getAttribute
 * @see Node
 * @for NodeList
 * @param {string} name The attribute name
 * @return {string} The attribute value
 */

    'getAttribute',
/**
 * Allows setting attributes on DOM nodes, normalizing in some cases.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method setAttribute
 * @see Node
 * @for NodeList
 * @chainable
 * @param {string} name The attribute name
 * @param {string} value The value to set
 */
    'setAttribute',

/**
 * Allows for removing attributes on DOM nodes.
 * This passes through to the DOM node, allowing for custom attributes.
 * @method removeAttribute
 * @see Node
 * @for NodeList
 * @param {string} name The attribute to remove
 */
    'removeAttribute',
/**
 * Removes the parent node from node in the list.
 * @method unwrap
 * @chainable
 */
    'unwrap',
/**
 * Wraps the given HTML around each node.
 * @method wrap
 * @param {String} html The markup to wrap around the node.
 * @chainable
 */
    'wrap',

/**
 * Applies a unique ID to each node if none exists
 * @method generateID
 * @return {String} The existing or generated ID
 */
    'generateID'
]);
(function(Y) {
    var methods = [
    /**
     * Determines whether each node has the given className.
     * @method hasClass
     * @for Node
     * @param {String} className the class name to search for
     * @return {Boolean} Whether or not the element has the specified class
     */
     'hasClass',

    /**
     * Adds a class name to each node.
     * @method addClass
     * @param {String} className the class name to add to the node's class attribute
     * @chainable
     */
     'addClass',

    /**
     * Removes a class name from each node.
     * @method removeClass
     * @param {String} className the class name to remove from the node's class attribute
     * @chainable
     */
     'removeClass',

    /**
     * Replace a class with another class for each node.
     * If no oldClassName is present, the newClassName is simply added.
     * @method replaceClass
     * @param {String} oldClassName the class name to be replaced
     * @param {String} newClassName the class name that will be replacing the old class name
     * @chainable
     */
     'replaceClass',

    /**
     * If the className exists on the node it is removed, if it doesn't exist it is added.
     * @method toggleClass
     * @param {String} className the class name to be toggled
     * @param {Boolean} force Option to force adding or removing the class.
     * @chainable
     */
     'toggleClass'
    ];

    Y.Node.importMethod(Y.DOM, methods);
    /**
     * Determines whether each node has the given className.
     * @method hasClass
     * @see Node.hasClass
     * @for NodeList
     * @param {String} className the class name to search for
     * @return {Array} An array of booleans for each node bound to the NodeList.
     */

    /**
     * Adds a class name to each node.
     * @method addClass
     * @see Node.addClass
     * @param {String} className the class name to add to the node's class attribute
     * @chainable
     */

    /**
     * Removes a class name from each node.
     * @method removeClass
     * @see Node.removeClass
     * @param {String} className the class name to remove from the node's class attribute
     * @chainable
     */

    /**
     * Replace a class with another class for each node.
     * If no oldClassName is present, the newClassName is simply added.
     * @method replaceClass
     * @see Node.replaceClass
     * @param {String} oldClassName the class name to be replaced
     * @param {String} newClassName the class name that will be replacing the old class name
     * @chainable
     */

    /**
     * If the className exists on the node it is removed, if it doesn't exist it is added.
     * @method toggleClass
     * @see Node.toggleClass
     * @param {String} className the class name to be toggled
     * @chainable
     */
    Y.NodeList.importMethod(Y.Node.prototype, methods);
})(Y);

if (!Y.config.doc.documentElement.hasAttribute) { // IE < 8
    Y.Node.prototype.hasAttribute = function(attr) {
        if (attr === 'value') {
            if (this.get('value') !== "") { // IE < 8 fails to populate specified when set in HTML
                return true;
            }
        }
        return !!(this._node.attributes[attr] &&
                this._node.attributes[attr].specified);
    };
}

// IE throws an error when calling focus() on an element that's invisible, not
// displayed, or disabled.
Y.Node.prototype.focus = function () {
    try {
        this._node.focus();
    } catch (e) {
    }
};

// IE throws error when setting input.type = 'hidden',
// input.setAttribute('type', 'hidden') and input.attributes.type.value = 'hidden'
Y.Node.ATTRS.type = {
    setter: function(val) {
        if (val === 'hidden') {
            try {
                this._node.type = 'hidden';
            } catch(e) {
                this.setStyle('display', 'none');
                this._inputType = 'hidden';
            }
        } else {
            try { // IE errors when changing the type from "hidden'
                this._node.type = val;
            } catch (e) {
            }
        }
        return val;
    },

    getter: function() {
        return this._inputType || this._node.type;
    },

    _bypassProxy: true // don't update DOM when using with Attribute
};

if (Y.config.doc.createElement('form').elements.nodeType) {
    // IE: elements collection is also FORM node which trips up scrubVal.
    Y.Node.ATTRS.elements = {
            getter: function() {
                return this.all('input, textarea, button, select');
            }
    };
}

Y.mix(Y.Node.ATTRS, {
    offsetHeight: {
        setter: function(h) {
            Y.DOM.setHeight(this._node, h);
            return h;
        },

        getter: function() {
            return this._node.offsetHeight;
        }
    },

    offsetWidth: {
        setter: function(w) {
            Y.DOM.setWidth(this._node, w);
            return w;
        },

        getter: function() {
            return this._node.offsetWidth;
        }
    }
});

Y.mix(Y.Node.prototype, {
    sizeTo: function(w, h) {
        var node;
        if (arguments.length < 2) {
            node = Y.one(w);
            w = node.get('offsetWidth');
            h = node.get('offsetHeight');
        }

        this.setAttrs({
            offsetWidth: w,
            offsetHeight: h
        });
    }
});
var Y_NodeList = Y.NodeList,
    ArrayProto = Array.prototype,
    ArrayMethods = [
        /** Returns a new NodeList combining the given NodeList(s)
          * @for NodeList
          * @method concat
          * @param {NodeList | Array} valueN Arrays/NodeLists and/or values to
          * concatenate to the resulting NodeList
          * @return {NodeList} A new NodeList comprised of this NodeList joined with the input.
          */
        'concat',
        /** Removes the first last from the NodeList and returns it.
          * @for NodeList
          * @method pop
          * @return {Node} The last item in the NodeList.
          */
        'pop',
        /** Adds the given Node(s) to the end of the NodeList.
          * @for NodeList
          * @method push
          * @param {Node | DOMNode} nodeN One or more nodes to add to the end of the NodeList.
          */
        'push',
        /** Removes the first item from the NodeList and returns it.
          * @for NodeList
          * @method shift
          * @return {Node} The first item in the NodeList.
          */
        'shift',
        /** Returns a new NodeList comprising the Nodes in the given range.
          * @for NodeList
          * @method slice
          * @param {Number} begin Zero-based index at which to begin extraction.
          As a negative index, start indicates an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element in the sequence.
          * @param {Number} end Zero-based index at which to end extraction. slice extracts up to but not including end.
          slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3).
          As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
          If end is omitted, slice extracts to the end of the sequence.
          * @return {NodeList} A new NodeList comprised of this NodeList joined with the input.
          */
        'slice',
        /** Changes the content of the NodeList, adding new elements while removing old elements.
          * @for NodeList
          * @method splice
          * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end.
          * @param {Number} howMany An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
          * {Node | DOMNode| element1, ..., elementN
          The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.
          * @return {NodeList} The element(s) removed.
          */
        'splice',
        /** Adds the given Node(s) to the beginning of the NodeList.
          * @for NodeList
          * @method push
          * @param {Node | DOMNode} nodeN One or more nodes to add to the NodeList.
          */
        'unshift'
    ];


Y.Array.each(ArrayMethods, function(name) {
    Y_NodeList.prototype[name] = function() {
        var args = [],
            i = 0,
            arg;

        while ((arg = arguments[i++])) { // use DOM nodes/nodeLists
            args.push(arg._node || arg._nodes || arg);
        }
        return Y.Node.scrubVal(ArrayProto[name].apply(this._nodes, args));
    };
});


}, '3.3.0' ,{requires:['dom-base', 'selector-css2', 'event-base']});
YUI.add('node-style', function(Y) {

(function(Y) {
/**
 * Extended Node interface for managing node styles.
 * @module node
 * @submodule node-style
 */

var methods = [
    /**
     * Returns the style's current value.
     * @method getStyle
     * @for Node
     * @param {String} attr The style attribute to retrieve.
     * @return {String} The current value of the style property for the element.
     */
    'getStyle',

    /**
     * Returns the computed value for the given style property.
     * @method getComputedStyle
     * @param {String} attr The style attribute to retrieve.
     * @return {String} The computed value of the style property for the element.
     */
    'getComputedStyle',

    /**
     * Sets a style property of the node.
     * @method setStyle
     * @param {String} attr The style attribute to set.
     * @param {String|Number} val The value.
     * @chainable
     */
    'setStyle',

    /**
     * Sets multiple style properties on the node.
     * @method setStyles
     * @param {Object} hash An object literal of property:value pairs.
     * @chainable
     */
    'setStyles'
];
Y.Node.importMethod(Y.DOM, methods);
/**
 * Returns an array of values for each node.
 * @method getStyle
 * @for NodeList
 * @see Node.getStyle
 * @param {String} attr The style attribute to retrieve.
 * @return {Array} The current values of the style property for the element.
 */

/**
 * Returns an array of the computed value for each node.
 * @method getComputedStyle
 * @see Node.getComputedStyle
 * @param {String} attr The style attribute to retrieve.
 * @return {Array} The computed values for each node.
 */

/**
 * Sets a style property on each node.
 * @method setStyle
 * @see Node.setStyle
 * @param {String} attr The style attribute to set.
 * @param {String|Number} val The value.
 * @chainable
 */

/**
 * Sets multiple style properties on each node.
 * @method setStyles
 * @see Node.setStyles
 * @param {Object} hash An object literal of property:value pairs.
 * @chainable
 */
Y.NodeList.importMethod(Y.Node.prototype, methods);
})(Y);


}, '3.3.0' ,{requires:['dom-style', 'node-base']});
YUI.add('node-screen', function(Y) {

/**
 * Extended Node interface for managing regions and screen positioning.
 * Adds support for positioning elements and normalizes window size and scroll detection.
 * @module node
 * @submodule node-screen
 */

// these are all "safe" returns, no wrapping required
Y.each([
    /**
     * Returns the inner width of the viewport (exludes scrollbar).
     * @config winWidth
     * @for Node
     * @type {Int}
     */
    'winWidth',

    /**
     * Returns the inner height of the viewport (exludes scrollbar).
     * @config winHeight
     * @type {Int}
     */
    'winHeight',

    /**
     * Document width
     * @config winHeight
     * @type {Int}
     */
    'docWidth',

    /**
     * Document height
     * @config docHeight
     * @type {Int}
     */
    'docHeight',

    /**
     * Amount page has been scroll vertically
     * @config docScrollX
     * @type {Int}
     */
    'docScrollX',

    /**
     * Amount page has been scroll horizontally
     * @config docScrollY
     * @type {Int}
     */
    'docScrollY'
    ],
    function(name) {
        Y.Node.ATTRS[name] = {
            getter: function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(Y.Node.getDOMNode(this));

                return Y.DOM[name].apply(this, args);
            }
        };
    }
);

Y.Node.ATTRS.scrollLeft = {
    getter: function() {
        var node = Y.Node.getDOMNode(this);
        return ('scrollLeft' in node) ? node.scrollLeft : Y.DOM.docScrollX(node);
    },

    setter: function(val) {
        var node = Y.Node.getDOMNode(this);
        if (node) {
            if ('scrollLeft' in node) {
                node.scrollLeft = val;
            } else if (node.document || node.nodeType === 9) {
                Y.DOM._getWin(node).scrollTo(val, Y.DOM.docScrollY(node)); // scroll window if win or doc
            }
        } else {
        }
    }
};

Y.Node.ATTRS.scrollTop = {
    getter: function() {
        var node = Y.Node.getDOMNode(this);
        return ('scrollTop' in node) ? node.scrollTop : Y.DOM.docScrollY(node);
    },

    setter: function(val) {
        var node = Y.Node.getDOMNode(this);
        if (node) {
            if ('scrollTop' in node) {
                node.scrollTop = val;
            } else if (node.document || node.nodeType === 9) {
                Y.DOM._getWin(node).scrollTo(Y.DOM.docScrollX(node), val); // scroll window if win or doc
            }
        } else {
        }
    }
};

Y.Node.importMethod(Y.DOM, [
/**
 * Gets the current position of the node in page coordinates.
 * @method getXY
 * @for Node
 * @return {Array} The XY position of the node
*/
    'getXY',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setXY
 * @param {Array} xy Contains X & Y values for new position (coordinates are page-based)
 * @chainable
 */
    'setXY',

/**
 * Gets the current position of the node in page coordinates.
 * @method getX
 * @return {Int} The X position of the node
*/
    'getX',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setX
 * @param {Int} x X value for new position (coordinates are page-based)
 * @chainable
 */
    'setX',

/**
 * Gets the current position of the node in page coordinates.
 * @method getY
 * @return {Int} The Y position of the node
*/
    'getY',

/**
 * Set the position of the node in page coordinates, regardless of how the node is positioned.
 * @method setY
 * @param {Int} y Y value for new position (coordinates are page-based)
 * @chainable
 */
    'setY',

/**
 * Swaps the XY position of this node with another node.
 * @method swapXY
 * @param {Y.Node || HTMLElement} otherNode The node to swap with.
 * @chainable
 */
    'swapXY'
]);

/**
 * Returns a region object for the node
 * @config region
 * @for Node
 * @type Node
 */
Y.Node.ATTRS.region = {
    getter: function() {
        var node = Y.Node.getDOMNode(this),
            region;

        if (node && !node.tagName) {
            if (node.nodeType === 9) { // document
                node = node.documentElement;
            }
        }
        if (node.alert) {
            region = Y.DOM.viewportRegion(node);
        } else {
            region = Y.DOM.region(node);
        }
        return region;
    }
};

/**
 * Returns a region object for the node's viewport
 * @config viewportRegion
 * @type Node
 */
Y.Node.ATTRS.viewportRegion = {
    getter: function() {
        return Y.DOM.viewportRegion(Y.Node.getDOMNode(this));
    }
};

Y.Node.importMethod(Y.DOM, 'inViewportRegion');

// these need special treatment to extract 2nd node arg
/**
 * Compares the intersection of the node with another node or region
 * @method intersect
 * @for Node
 * @param {Node|Object} node2 The node or region to compare with.
 * @param {Object} altRegion An alternate region to use (rather than this node's).
 * @return {Object} An object representing the intersection of the regions.
 */
Y.Node.prototype.intersect = function(node2, altRegion) {
    var node1 = Y.Node.getDOMNode(this);
    if (Y.instanceOf(node2, Y.Node)) { // might be a region object
        node2 = Y.Node.getDOMNode(node2);
    }
    return Y.DOM.intersect(node1, node2, altRegion);
};

/**
 * Determines whether or not the node is within the giving region.
 * @method inRegion
 * @param {Node|Object} node2 The node or region to compare with.
 * @param {Boolean} all Whether or not all of the node must be in the region.
 * @param {Object} altRegion An alternate region to use (rather than this node's).
 * @return {Object} An object representing the intersection of the regions.
 */
Y.Node.prototype.inRegion = function(node2, all, altRegion) {
    var node1 = Y.Node.getDOMNode(this);
    if (Y.instanceOf(node2, Y.Node)) { // might be a region object
        node2 = Y.Node.getDOMNode(node2);
    }
    return Y.DOM.inRegion(node1, node2, all, altRegion);
};


}, '3.3.0' ,{requires:['dom-screen']});
YUI.add('node-pluginhost', function(Y) {

/**
 * Registers plugins to be instantiated at the class level (plugins
 * which should be plugged into every instance of Node by default).
 *
 * @method Node.plug
 * @static
 *
 * @param {Function | Array} plugin Either the plugin class, an array of plugin classes or an array of objects (with fn and cfg properties defined)
 * @param {Object} config (Optional) If plugin is the plugin class, the configuration for the plugin
 */
Y.Node.plug = function() {
    var args = Y.Array(arguments);
    args.unshift(Y.Node);
    Y.Plugin.Host.plug.apply(Y.Base, args);
    return Y.Node;
};

/**
 * Unregisters any class level plugins which have been registered by the Node
 *
 * @method Node.unplug
 * @static
 *
 * @param {Function | Array} plugin The plugin class, or an array of plugin classes
 */
Y.Node.unplug = function() {
    var args = Y.Array(arguments);
    args.unshift(Y.Node);
    Y.Plugin.Host.unplug.apply(Y.Base, args);
    return Y.Node;
};

Y.mix(Y.Node, Y.Plugin.Host, false, null, 1);

// allow batching of plug/unplug via NodeList
// doesn't use NodeList.importMethod because we need real Nodes (not tmpNode)
Y.NodeList.prototype.plug = function() {
    var args = arguments;
    Y.NodeList.each(this, function(node) {
        Y.Node.prototype.plug.apply(Y.one(node), args);
    });
};

Y.NodeList.prototype.unplug = function() {
    var args = arguments;
    Y.NodeList.each(this, function(node) {
        Y.Node.prototype.unplug.apply(Y.one(node), args);
    });
};


}, '3.3.0' ,{requires:['node-base', 'pluginhost']});
YUI.add('node-event-delegate', function(Y) {

/**
 * Functionality to make the node a delegated event container
 * @module node
 * @submodule node-event-delegate
 */

/**
 * <p>Sets up a delegation listener for an event occurring inside the Node.
 * The delegated event will be verified against a supplied selector or
 * filtering function to test if the event references at least one node that
 * should trigger the subscription callback.</p>
 *
 * <p>Selector string filters will trigger the callback if the event originated
 * from a node that matches it or is contained in a node that matches it.
 * Function filters are called for each Node up the parent axis to the
 * subscribing container node, and receive at each level the Node and the event
 * object.  The function should return true (or a truthy value) if that Node
 * should trigger the subscription callback.  Note, it is possible for filters
 * to match multiple Nodes for a single event.  In this case, the delegate
 * callback will be executed for each matching Node.</p>
 *
 * <p>For each matching Node, the callback will be executed with its 'this'
 * object set to the Node matched by the filter (unless a specific context was
 * provided during subscription), and the provided event's
 * <code>currentTarget</code> will also be set to the matching Node.  The
 * containing Node from which the subscription was originally made can be
 * referenced as <code>e.container</code>.
 *
 * @method delegate
 * @param type {String} the event type to delegate
 * @param fn {Function} the callback function to execute.  This function
 *              will be provided the event object for the delegated event.
 * @param spec {String|Function} a selector that must match the target of the
 *              event or a function to test target and its parents for a match
 * @param context {Object} optional argument that specifies what 'this' refers to.
 * @param args* {any} 0..n additional arguments to pass on to the callback function.
 *              These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for Node
 */
Y.Node.prototype.delegate = function(type) {

    var args = Y.Array(arguments, 0, true),
        index = (Y.Lang.isObject(type) && !Y.Lang.isArray(type)) ? 1 : 2;

    args.splice(index, 0, this._node);

    return Y.delegate.apply(Y, args);
};


}, '3.3.0' ,{requires:['node-base', 'event-delegate']});


YUI.add('node', function(Y){}, '3.3.0' ,{requires:['dom', 'event-base', 'event-delegate', 'pluginhost'], use:['node-base', 'node-style', 'node-screen', 'node-pluginhost', 'node-event-delegate'], skinnable:false});

/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
(function() {

var stateChangeListener,
    GLOBAL_ENV   = YUI.Env,
    config       = YUI.config,
    doc          = config.doc,
    docElement   = doc && doc.documentElement,
    EVENT_NAME   = 'onreadystatechange',
    pollInterval = config.pollInterval || 40;

if (docElement.doScroll && !GLOBAL_ENV._ieready) {
    GLOBAL_ENV._ieready = function() {
        GLOBAL_ENV._ready();
    };

/*! DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */
// Internet Explorer: use the doScroll() method on the root element.
// This isolates what appears to be a safe moment to manipulate the
// DOM prior to when the document's readyState suggests it is safe to do so.
    if (self !== self.top) {
        stateChangeListener = function() {
            if (doc.readyState == 'complete') {
                GLOBAL_ENV.remove(doc, EVENT_NAME, stateChangeListener);
                GLOBAL_ENV.ieready();
            }
        };
        GLOBAL_ENV.add(doc, EVENT_NAME, stateChangeListener);
    } else {
        GLOBAL_ENV._dri = setInterval(function() {
            try {
                docElement.doScroll('left');
                clearInterval(GLOBAL_ENV._dri);
                GLOBAL_ENV._dri = null;
                GLOBAL_ENV._ieready();
            } catch (domNotReady) { }
        }, pollInterval);
    }
}

})();
YUI.add('event-base-ie', function(Y) {

/*
 * Custom event engine, DOM event listener abstraction layer, synthetic DOM
 * events.
 * @module event
 * @submodule event-base
 */

var IEEventFacade = function() {
        // IEEventFacade.superclass.constructor.apply(this, arguments);
        Y.DOM2EventFacade.apply(this, arguments);
    };

Y.extend(IEEventFacade, Y.DOM2EventFacade, {

    init: function() {

        IEEventFacade.superclass.init.apply(this, arguments);

        var e = this._event,
            resolve = Y.DOM2EventFacade.resolve,
            x, y, d, b, de, t;

        this.target = resolve(e.srcElement);

        if (('clientX' in e) && (!x) && (0 !== x)) {
            x = e.clientX;
            y = e.clientY;

            d = Y.config.doc;
            b = d.body;
            de = d.documentElement;

            x += (de.scrollLeft || (b && b.scrollLeft) || 0);
            y += (de.scrollTop  || (b && b.scrollTop)  || 0);

            this.pageX = x;
            this.pageY = y;
        }

        if (e.type == "mouseout") {
            t = e.toElement;
        } else if (e.type == "mouseover") {
            t = e.fromElement;
        }

        this.relatedTarget = resolve(t);

        // which should contain the unicode key code if this is a key event
        // if (e.charCode) {
        //     this.which = e.charCode;
        // }

        // for click events, which is normalized for which mouse button was
        // clicked.
        if (e.button) {
            switch (e.button) {
                case 2:
                    this.which = 3;
                    break;
                case 4:
                    this.which = 2;
                    break;
                default:
                    this.which = e.button;
            }

            this.button = this.which;
        }

    },

    stopPropagation: function() {
        var e = this._event;
        e.cancelBubble = true;
        this._wrapper.stopped = 1;
        this.stopped = 1;
    },

    stopImmediatePropagation: function() {
        this.stopPropagation();
        this._wrapper.stopped = 2;
        this.stopped = 2;
    },

    preventDefault: function(returnValue) {
        this._event.returnValue = returnValue || false;
        this._wrapper.prevented = 1;
        this.prevented = 1;
    }

});

var imp = Y.config.doc && Y.config.doc.implementation;

if (imp && (!imp.hasFeature('Events', '2.0'))) {
    Y.DOMEventFacade = IEEventFacade;
}



}, '3.3.0' );
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('event-delegate', function(Y) {

/**
 * Adds event delegation support to the library.
 *
 * @module event
 * @submodule event-delegate
 */

var toArray          = Y.Array,
    YLang            = Y.Lang,
    isString         = YLang.isString,
    isObject         = YLang.isObject,
    isArray          = YLang.isArray,
    selectorTest     = Y.Selector.test,
    detachCategories = Y.Env.evt.handles;

/**
 * <p>Sets up event delegation on a container element.  The delegated event
 * will use a supplied selector or filtering function to test if the event
 * references at least one node that should trigger the subscription
 * callback.</p>
 *
 * <p>Selector string filters will trigger the callback if the event originated
 * from a node that matches it or is contained in a node that matches it.
 * Function filters are called for each Node up the parent axis to the
 * subscribing container node, and receive at each level the Node and the event
 * object.  The function should return true (or a truthy value) if that Node
 * should trigger the subscription callback.  Note, it is possible for filters
 * to match multiple Nodes for a single event.  In this case, the delegate
 * callback will be executed for each matching Node.</p>
 *
 * <p>For each matching Node, the callback will be executed with its 'this'
 * object set to the Node matched by the filter (unless a specific context was
 * provided during subscription), and the provided event's
 * <code>currentTarget</code> will also be set to the matching Node.  The
 * containing Node from which the subscription was originally made can be
 * referenced as <code>e.container</code>.
 *
 * @method delegate
 * @param type {String} the event type to delegate
 * @param fn {Function} the callback function to execute.  This function
 *              will be provided the event object for the delegated event.
 * @param el {String|node} the element that is the delegation container
 * @param spec {string|Function} a selector that must match the target of the
 *              event or a function to test target and its parents for a match
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 *              These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
function delegate(type, fn, el, filter) {
    var args     = toArray(arguments, 0, true),
        query    = isString(el) ? el : null,
        typeBits, synth, container, categories, cat, i, len, handles, handle;

    // Support Y.delegate({ click: fnA, key: fnB }, context, filter, ...);
    // and Y.delegate(['click', 'key'], fn, context, filter, ...);
    if (isObject(type)) {
        handles = [];

        if (isArray(type)) {
            for (i = 0, len = type.length; i < len; ++i) {
                args[0] = type[i];
                handles.push(Y.delegate.apply(Y, args));
            }
        } else {
            // Y.delegate({'click', fn}, context, filter) =>
            // Y.delegate('click', fn, context, filter)
            args.unshift(null); // one arg becomes two; need to make space

            for (i in type) {
                if (type.hasOwnProperty(i)) {
                    args[0] = i;
                    args[1] = type[i];
                    handles.push(Y.delegate.apply(Y, args));
                }
            }
        }

        return new Y.EventHandle(handles);
    }

    typeBits = type.split(/\|/);

    if (typeBits.length > 1) {
        cat  = typeBits.shift();
        type = typeBits.shift();
    }

    synth = Y.Node.DOM_EVENTS[type];

    if (isObject(synth) && synth.delegate) {
        handle = synth.delegate.apply(synth, arguments);
    }

    if (!handle) {
        if (!type || !fn || !el || !filter) {
            return;
        }

        container = (query) ? Y.Selector.query(query, null, true) : el;

        if (!container && isString(el)) {
            handle = Y.on('available', function () {
                Y.mix(handle, Y.delegate.apply(Y, args), true);
            }, el);
        }

        if (!handle && container) {
            args.splice(2, 2, container); // remove the filter

            handle = Y.Event._attach(args, { facade: false });
            handle.sub.filter  = filter;
            handle.sub._notify = delegate.notifySub;
        }
    }

    if (handle && cat) {
        categories = detachCategories[cat]  || (detachCategories[cat] = {});
        categories = categories[type] || (categories[type] = []);
        categories.push(handle);
    }

    return handle;
}

/**
 * Overrides the <code>_notify</code> method on the normal DOM subscription to
 * inject the filtering logic and only proceed in the case of a match.
 *
 * @method delegate.notifySub
 * @param thisObj {Object} default 'this' object for the callback
 * @param args {Array} arguments passed to the event's <code>fire()</code>
 * @param ce {CustomEvent} the custom event managing the DOM subscriptions for
 *              the subscribed event on the subscribing node.
 * @return {Boolean} false if the event was stopped
 * @private
 * @static
 * @since 3.2.0
 */
delegate.notifySub = function (thisObj, args, ce) {
    // Preserve args for other subscribers
    args = args.slice();
    if (this.args) {
        args.push.apply(args, this.args);
    }

    // Only notify subs if the event occurred on a targeted element
    var currentTarget = delegate._applyFilter(this.filter, args, ce),
        //container     = e.currentTarget,
        e, i, len, ret;

    if (currentTarget) {
        // Support multiple matches up the the container subtree
        currentTarget = toArray(currentTarget);

        // The second arg is the currentTarget, but we'll be reusing this
        // facade, replacing the currentTarget for each use, so it doesn't
        // matter what element we seed it with.
        e = args[0] = new Y.DOMEventFacade(args[0], ce.el, ce);

        e.container = Y.one(ce.el);

        for (i = 0, len = currentTarget.length; i < len && !e.stopped; ++i) {
            e.currentTarget = Y.one(currentTarget[i]);

            ret = this.fn.apply(this.context || e.currentTarget, args);

            if (ret === false) { // stop further notifications
                break;
            }
        }

        return ret;
    }
};

/**
 * <p>Compiles a selector string into a filter function to identify whether
 * Nodes along the parent axis of an event's target should trigger event
 * notification.</p>
 *
 * <p>This function is memoized, so previously compiled filter functions are
 * returned if the same selector string is provided.</p>
 *
 * <p>This function may be useful when defining synthetic events for delegate
 * handling.</p>
 *
 * @method delegate.compileFilter
 * @param selector {String} the selector string to base the filtration on
 * @return {Function}
 * @since 3.2.0
 * @static
 */
delegate.compileFilter = Y.cached(function (selector) {
    return function (target, e) {
        return selectorTest(target._node, selector, e.currentTarget._node);
    };
});

/**
 * Walks up the parent axis of an event's target, and unittests each element
 * against a supplied filter function.  If any Nodes, including the container,
 * satisfy the filter, the delegated callback will be triggered for each.
 *
 * @method delegate._applyFilter
 * @param filter {Function} boolean function to test for inclusion in event
 *                  notification
 * @param args {Array} the arguments that would be passed to subscribers
 * @param ce   {CustomEvent} the DOM event wrapper
 * @return {Node|Node[]|undefined} The Node or Nodes that satisfy the filter
 * @protected
 */
delegate._applyFilter = function (filter, args, ce) {
    var e         = args[0],
        container = ce.el, // facadeless events in IE, have no e.currentTarget
        target    = e.target || e.srcElement,
        match     = [],
        isContainer = false;

    // Resolve text nodes to their containing element
    if (target.nodeType === 3) {
        target = target.parentNode;
    }

    // passing target as the first arg rather than leaving well enough alone
    // making 'this' in the filter function refer to the target.  This is to
    // support bound filter functions.
    args.unshift(target);

    if (isString(filter)) {
        while (target) {
            isContainer = (target === container);
            if (selectorTest(target, filter, (isContainer ?null: container))) {
                match.push(target);
            }

            if (isContainer) {
                break;
            }

            target = target.parentNode;
        }
    } else {
        // filter functions are implementer code and should receive wrappers
        args[0] = Y.one(target);
        args[1] = new Y.DOMEventFacade(e, container, ce);

        while (target) {
            // filter(target, e, extra args...) - this === target
            if (filter.apply(args[0], args)) {
                match.push(target);
            }

            if (target === container) {
                break;
            }

            target = target.parentNode;
            args[0] = Y.one(target);
        }
        args[1] = e; // restore the raw DOM event
    }

    if (match.length <= 1) {
        match = match[0]; // single match or undefined
    }

    // remove the target
    args.shift();

    return match;
};

/**
 * Sets up event delegation on a container element.  The delegated event
 * will use a supplied filter to test if the callback should be executed.
 * This filter can be either a selector string or a function that returns
 * a Node to use as the currentTarget for the event.
 *
 * The event object for the delegated event is supplied to the callback
 * function.  It is modified slightly in order to support all properties
 * that may be needed for event delegation.  'currentTarget' is set to
 * the element that matched the selector string filter or the Node returned
 * from the filter function.  'container' is set to the element that the
 * listener is delegated from (this normally would be the 'currentTarget').
 *
 * Filter functions will be called with the arguments that would be passed to
 * the callback function, including the event object as the first parameter.
 * The function should return false (or a falsey value) if the success criteria
 * aren't met, and the Node to use as the event's currentTarget and 'this'
 * object if they are.
 *
 * @method delegate
 * @param type {string} the event type to delegate
 * @param fn {function} the callback function to execute.  This function
 * will be provided the event object for the delegated event.
 * @param el {string|node} the element that is the delegation container
 * @param filter {string|function} a selector that must match the target of the
 * event or a function that returns a Node or false.
 * @param context optional argument that specifies what 'this' refers to.
 * @param args* 0..n additional arguments to pass on to the callback function.
 * These arguments will be added after the event object.
 * @return {EventHandle} the detach handle
 * @for YUI
 */
Y.delegate = Y.Event.delegate = delegate;


}, '3.3.0' ,{requires:['node-base']});
/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('json-parse', function(Y) {

/**
 * <p>The JSON module adds support for serializing JavaScript objects into
 * JSON strings and parsing JavaScript objects from strings in JSON format.</p>
 *
 * <p>The JSON namespace is added to your YUI instance including static methods
 * Y.JSON.parse(..) and Y.JSON.stringify(..).</p>
 *
 * <p>The functionality and method signatures follow the ECMAScript 5
 * specification.  In browsers with native JSON support, the native
 * implementation is used.</p>
 *
 * <p>The <code>json</code> module is a rollup of <code>json-parse</code> and
 * <code>json-stringify</code>.</p>
 *
 * <p>As their names suggest, <code>json-parse</code> adds support for parsing
 * JSON data (Y.JSON.parse) and <code>json-stringify</code> for serializing
 * JavaScript data into JSON strings (Y.JSON.stringify).  You may choose to
 * include either of the submodules individually if you don't need the
 * complementary functionality, or include the rollup for both.</p>
 *
 * @module json
 * @class JSON
 * @static
 */

/**
 * Provides Y.JSON.parse method to accept JSON strings and return native
 * JavaScript objects.
 *
 * @module json
 * @submodule json-parse
 * @for JSON
 * @static
 */


// All internals kept private for security reasons
function fromGlobal(ref) {
    return (Y.config.win || this || {})[ref];
}


    /**
     * Alias to native browser implementation of the JSON object if available.
     *
     * @property Native
     * @type {Object}
     * @private
     */
var _JSON  = fromGlobal('JSON'),
    // Create an indirect reference to eval to allow for minification
    _eval  = fromGlobal('eval'),
    Native = (Object.prototype.toString.call(_JSON) === '[object JSON]' && _JSON),
    useNative = !!Native,

    /**
     * Replace certain Unicode characters that JavaScript may handle incorrectly
     * during eval--either by deleting them or treating them as line
     * endings--with escape sequences.
     * IMPORTANT NOTE: This regex will be used to modify the input if a match is
     * found.
     *
     * @property _UNICODE_EXCEPTIONS
     * @type {RegExp}
     * @private
     */
    _UNICODE_EXCEPTIONS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,


    /**
     * First step in the safety evaluation.  Regex used to replace all escape
     * sequences (i.e. "\\", etc) with '@' characters (a non-JSON character).
     *
     * @property _ESCAPES
     * @type {RegExp}
     * @private
     */
    _ESCAPES = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,

    /**
     * Second step in the safety evaluation.  Regex used to replace all simple
     * values with ']' characters.
     *
     * @property _VALUES
     * @type {RegExp}
     * @private
     */
    _VALUES  = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,

    /**
     * Third step in the safety evaluation.  Regex used to remove all open
     * square brackets following a colon, comma, or at the beginning of the
     * string.
     *
     * @property _BRACKETS
     * @type {RegExp}
     * @private
     */
    _BRACKETS = /(?:^|:|,)(?:\s*\[)+/g,

    /**
     * Final step in the safety evaluation.  Regex used to test the string left
     * after all previous replacements for invalid characters.
     *
     * @property _UNSAFE
     * @type {RegExp}
     * @private
     */
    _UNSAFE = /[^\],:{}\s]/,

    /**
     * Replaces specific unicode characters with their appropriate \unnnn
     * format. Some browsers ignore certain characters during eval.
     *
     * @method escapeException
     * @param c {String} Unicode character
     * @return {String} the \unnnn escapement of the character
     * @private
     */
    _escapeException = function (c) {
        return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
    },

    /**
     * Traverses nested objects, applying a reviver function to each (key,value)
     * from the scope if the key:value's containing object.  The value returned
     * from the function will replace the original value in the key:value pair.
     * If the value returned is undefined, the key will be omitted from the
     * returned object.
     *
     * @method _revive
     * @param data {MIXED} Any JavaScript data
     * @param reviver {Function} filter or mutation function
     * @return {MIXED} The results of the filtered data
     * @private
     */
    _revive = function (data, reviver) {
        var walk = function (o,key) {
            var k,v,value = o[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (value.hasOwnProperty(k)) {
                        v = walk(value, k);
                        if (v === undefined) {
                            delete value[k];
                        } else {
                            value[k] = v;
                        }
                    }
                }
            }
            return reviver.call(o,key,value);
        };

        return typeof reviver === 'function' ? walk({'':data},'') : data;
    },

    /**
     * Parse a JSON string, returning the native JavaScript representation.
     *
     * @param s {string} JSON string data
     * @param reviver {function} (optional) function(k,v) passed each key value
     *          pair of object literals, allowing pruning or altering values
     * @return {MIXED} the native JavaScript representation of the JSON string
     * @throws SyntaxError
     * @method parse
     * @static
     */
    // JavaScript implementation in lieu of native browser support.  Based on
    // the json2.js library from http://json.org
    _parse = function (s,reviver) {
        // Replace certain Unicode characters that are otherwise handled
        // incorrectly by some browser implementations.
        // NOTE: This modifies the input if such characters are found!
        s = s.replace(_UNICODE_EXCEPTIONS, _escapeException);

        // Test for any remaining invalid characters
        if (!_UNSAFE.test(s.replace(_ESCAPES,'@').
                            replace(_VALUES,']').
                            replace(_BRACKETS,''))) {

            // Eval the text into a JavaScript data structure, apply any
            // reviver function, and return
            return _revive( _eval('(' + s + ')'), reviver );
        }

        throw new SyntaxError('JSON.parse');
    };

Y.namespace('JSON').parse = function (s,reviver) {
        if (typeof s !== 'string') {
            s += '';
        }

        return Native && Y.JSON.useNativeParse ?
            Native.parse(s,reviver) : _parse(s,reviver);
};

function workingNative( k, v ) {
    return k === "ok" ? true : v;
}

// Double check basic functionality.  This is mainly to catch early broken
// implementations of the JSON API in Firefox 3.1 beta1 and beta2
if ( Native ) {
    try {
        useNative = ( Native.parse( '{"ok":false}', workingNative ) ).ok;
    }
    catch ( e ) {
        useNative = false;
    }
}

/**
 * Leverage native JSON parse if the browser has a native implementation.
 * In general, this is a good idea.  See the Known Issues section in the
 * JSON user guide for caveats.  The default value is true for browsers with
 * native JSON support.
 *
 * @property useNativeParse
 * @type Boolean
 * @default true
 * @static
 */
Y.JSON.useNativeParse = useNative;


}, '3.3.0' );
YUI.add('json-stringify', function(Y) {

/**
 * Provides Y.JSON.stringify method for converting objects to JSON strings.
 *
 * @module json
 * @submodule json-stringify
 * @for JSON
 * @static
 */
var _JSON     = (Y.config.win || {}).JSON,
    Lang      = Y.Lang,
    isFunction= Lang.isFunction,
    isObject  = Lang.isObject,
    isArray   = Lang.isArray,
    _toStr    = Object.prototype.toString,
    Native    = (_toStr.call(_JSON) === '[object JSON]' && _JSON),
    useNative = !!Native,
    UNDEFINED = 'undefined',
    OBJECT    = 'object',
    NULL      = 'null',
    STRING    = 'string',
    NUMBER    = 'number',
    BOOLEAN   = 'boolean',
    DATE      = 'date',
    _allowable= {
        'undefined'        : UNDEFINED,
        'string'           : STRING,
        '[object String]'  : STRING,
        'number'           : NUMBER,
        '[object Number]'  : NUMBER,
        'boolean'          : BOOLEAN,
        '[object Boolean]' : BOOLEAN,
        '[object Date]'    : DATE,
        '[object RegExp]'  : OBJECT
    },
    EMPTY     = '',
    OPEN_O    = '{',
    CLOSE_O   = '}',
    OPEN_A    = '[',
    CLOSE_A   = ']',
    COMMA     = ',',
    COMMA_CR  = ",\n",
    CR        = "\n",
    COLON     = ':',
    COLON_SP  = ': ',
    QUOTE     = '"',

    // Regex used to capture characters that need escaping before enclosing
    // their containing string in quotes.
    _SPECIAL_CHARS = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    // Character substitution map for common escapes and special characters.
    _CHARS = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };


// Utility function used to determine how to serialize a variable.
function _type(o) {
    var t = typeof o;
    return  _allowable[t] ||              // number, string, boolean, undefined
            _allowable[_toStr.call(o)] || // Number, String, Boolean, Date
            (t === OBJECT ?
                (o ? OBJECT : NULL) :     // object, array, null, misc natives
                UNDEFINED);               // function, unknown
}

// Escapes a special character to a safe Unicode representation
function _char(c) {
    if (!_CHARS[c]) {
        _CHARS[c] =  '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
    }
    return _CHARS[c];
}

// Enclose escaped strings in quotes
function _string(s) {
    return QUOTE + s.replace(_SPECIAL_CHARS, _char) + QUOTE;
}

// Adds the provided space to the beginning of every line in the input string
function _indent(s,space) {
    return s.replace(/^/gm, space);
}

// JavaScript implementation of stringify (see API declaration of stringify)
function _stringify(o,w,space) {
    if (o === undefined) {
        return undefined;
    }

    var replacer = isFunction(w) ? w : null,
        format   = _toStr.call(space).match(/String|Number/) || [],
        _date    = Y.JSON.dateToString,
        stack    = [],
        tmp,i,len;

    if (replacer || !isArray(w)) {
        w = undefined;
    }

    // Ensure whitelist keys are unique (bug 2110391)
    if (w) {
        tmp = {};
        for (i = 0, len = w.length; i < len; ++i) {
            tmp[w[i]] = true;
        }
        w = tmp;
    }

    // Per the spec, strings are truncated to 10 characters and numbers
    // are converted to that number of spaces (max 10)
    space = format[0] === 'Number' ?
                new Array(Math.min(Math.max(0,space),10)+1).join(" ") :
                (space || EMPTY).slice(0,10);

    function _serialize(h,key) {
        var value = h[key],
            t     = _type(value),
            a     = [],
            colon = space ? COLON_SP : COLON,
            arr, i, keys, k, v;

        // Per the ECMA 5 spec, toJSON is applied before the replacer is
        // called.  Also per the spec, Date.prototype.toJSON has been added, so
        // Date instances should be serialized prior to exposure to the
        // replacer.  I disagree with this decision, but the spec is the spec.
        if (isObject(value) && isFunction(value.toJSON)) {
            value = value.toJSON(key);
        } else if (t === DATE) {
            value = _date(value);
        }

        if (isFunction(replacer)) {
            value = replacer.call(h,key,value);
        }

        if (value !== h[key]) {
            t = _type(value);
        }

        switch (t) {
            case DATE    : // intentional fallthrough.  Pre-replacer Dates are
                           // serialized in the toJSON stage.  Dates here would
                           // have been produced by the replacer.
            case OBJECT  : break;
            case STRING  : return _string(value);
            case NUMBER  : return isFinite(value) ? value+EMPTY : NULL;
            case BOOLEAN : return value+EMPTY;
            case NULL    : return NULL;
            default      : return undefined;
        }

        // Check for cyclical references in nested objects
        for (i = stack.length - 1; i >= 0; --i) {
            if (stack[i] === value) {
                throw new Error("JSON.stringify. Cyclical reference");
            }
        }

        arr = isArray(value);

        // Add the object to the processing stack
        stack.push(value);

        if (arr) { // Array
            for (i = value.length - 1; i >= 0; --i) {
                a[i] = _serialize(value, i) || NULL;
            }
        } else {   // Object
            // If whitelist provided, take only those keys
            keys = w || value;
            i = 0;

            for (k in keys) {
                if (keys.hasOwnProperty(k)) {
                    v = _serialize(value, k);
                    if (v) {
                        a[i++] = _string(k) + colon + v;
                    }
                }
            }
        }

        // remove the array from the stack
        stack.pop();

        if (space && a.length) {
            return arr ?
                OPEN_A + CR + _indent(a.join(COMMA_CR), space) + CR + CLOSE_A :
                OPEN_O + CR + _indent(a.join(COMMA_CR), space) + CR + CLOSE_O;
        } else {
            return arr ?
                OPEN_A + a.join(COMMA) + CLOSE_A :
                OPEN_O + a.join(COMMA) + CLOSE_O;
        }
    }

    // process the input
    return _serialize({'':o},'');
}

// Double check basic native functionality.  This is primarily to catch broken
// early JSON API implementations in Firefox 3.1 beta1 and beta2.
if ( Native ) {
    try {
        useNative = ( '0' === Native.stringify(0) );
    } catch ( e ) {
        useNative = false;
    }
}

Y.mix(Y.namespace('JSON'),{
    /**
     * Leverage native JSON stringify if the browser has a native
     * implementation.  In general, this is a good idea.  See the Known Issues
     * section in the JSON user guide for caveats.  The default value is true
     * for browsers with native JSON support.
     *
     * @property JSON.useNativeStringify
     * @type Boolean
     * @default true
     * @static
     */
    useNativeStringify : useNative,

    /**
     * Serializes a Date instance as a UTC date string.  Used internally by
     * stringify.  Override this method if you need Dates serialized in a
     * different format.
     *
     * @method dateToString
     * @param d {Date} The Date to serialize
     * @return {String} stringified Date in UTC format YYYY-MM-DDTHH:mm:SSZ
     * @deprecated Use a replacer function
     * @static
     */
    dateToString : function (d) {
        function _zeroPad(v) {
            return v < 10 ? '0' + v : v;
        }

        return d.getUTCFullYear()           + '-' +
              _zeroPad(d.getUTCMonth() + 1) + '-' +
              _zeroPad(d.getUTCDate())      + 'T' +
              _zeroPad(d.getUTCHours())     + COLON +
              _zeroPad(d.getUTCMinutes())   + COLON +
              _zeroPad(d.getUTCSeconds())   + 'Z';
    },

    /**
     * <p>Converts an arbitrary value to a JSON string representation.</p>
     *
     * <p>Objects with cyclical references will trigger an exception.</p>
     *
     * <p>If a whitelist is provided, only matching object keys will be
     * included.  Alternately, a replacer function may be passed as the
     * second parameter.  This function is executed on every value in the
     * input, and its return value will be used in place of the original value.
     * This is useful to serialize specialized objects or class instances.</p>
     *
     * <p>If a positive integer or non-empty string is passed as the third
     * parameter, the output will be formatted with carriage returns and
     * indentation for readability.  If a String is passed (such as "\t") it
     * will be used once for each indentation level.  If a number is passed,
     * that number of spaces will be used.</p>
     *
     * @method stringify
     * @param o {MIXED} any arbitrary value to convert to JSON string
     * @param w {Array|Function} (optional) whitelist of acceptable object
     *                  keys to include, or a replacer function to modify the
     *                  raw value before serialization
     * @param ind {Number|String} (optional) indentation character or depth of
     *                  spaces to format the output.
     * @return {string} JSON string representation of the input
     * @static
     */
    stringify : function (o,w,ind) {
        return Native && Y.JSON.useNativeStringify ?
            Native.stringify(o,w,ind) : _stringify(o,w,ind);
    }
});


}, '3.3.0' );


YUI.add('json', function(Y){}, '3.3.0' ,{use:['json-parse', 'json-stringify']});

/*
Copyright (c) 2010, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 3.3.0
build: 3167
*/
YUI.add('test', function(Y) {

    /**
     * YUI JavaScript Testing Framework
     *
     * @module test
     */


    Y.namespace("Test");

    /**
     * Test case containing various unittests to run.
     * @param template An object containing any number of test methods, other methods,
     *                 an optional name, and anything else the test case needs.
     * @class Case
     * @namespace Test
     * @constructor
     */
    Y.Test.Case = function (template) {

        /**
         * Special rules for the test case. Possible subobjects
         * are fail, for unittests that should fail, and error, for
         * unittests that should throw an error.
         */
        this._should = {};

        //copy over all properties from the template to this object
        for (var prop in template) {
            this[prop] = template[prop];
        }

        //check for a valid name
        if (!Y.Lang.isString(this.name)){
            /**
             * Name for the test case.
             */
            this.name = "testCase" + Y.guid();
        }

    };

    Y.Test.Case.prototype = {

        /**
         * Resumes a paused test and runs the given function.
         * @param {Function} segment (Optional) The function to run.
         *      If omitted, the test automatically passes.
         * @return {Void}
         * @method resume
         */
        resume : function (segment) {
            Y.Test.Runner.resume(segment);
        },

        /**
         * Causes the test case to wait a specified amount of time and then
         * continue executing the given code.
         * @param {Function} segment (Optional) The function to run after the delay.
         *      If omitted, the TestRunner will wait until resume() is called.
         * @param {int} delay (Optional) The number of milliseconds to wait before running
         *      the function. If omitted, defaults to zero.
         * @return {Void}
         * @method wait
         */
        wait : function (segment, delay){
            var args = arguments;
            if (Y.Lang.isFunction(args[0])){
                throw new Y.Test.Wait(args[0], args[1]);
            } else {
                throw new Y.Test.Wait(function(){
                    Y.Assert.fail("Timeout: wait() called but resume() never called.");
                }, (Y.Lang.isNumber(args[0]) ? args[0] : 10000));
            }
        },

        //-------------------------------------------------------------------------
        // Stub Methods
        //-------------------------------------------------------------------------

        /**
         * Function to run before each test is executed.
         * @return {Void}
         * @method setUp
         */
        setUp : function () {
        },

        /**
         * Function to run after each test is executed.
         * @return {Void}
         * @method tearDown
         */
        tearDown: function () {
        }
    };

    /**
     * Represents a stoppage in test execution to wait for an amount of time before
     * continuing.
     * @param {Function} segment A function to run when the wait is over.
     * @param {int} delay The number of milliseconds to wait before running the code.
     * @class Wait
     * @namespace Test
     * @constructor
     *
     */
    Y.Test.Wait = function (segment, delay) {

        /**
         * The segment of code to run when the wait is over.
         * @type Function
         * @property segment
         */
        this.segment = (Y.Lang.isFunction(segment) ? segment : null);

        /**
         * The delay before running the segment of code.
         * @type int
         * @property delay
         */
        this.delay = (Y.Lang.isNumber(delay) ? delay : 0);
    };


    Y.namespace("Test");

    /**
     * A test suite that can contain a collection of TestCase and TestSuite objects.
     * @param {String||Object} data The name of the test suite or an object containing
     *      a name property as well as setUp and tearDown methods.
     * @namespace Test
     * @class Suite
     * @constructor
     */
    Y.Test.Suite = function (data /*:String||Object*/) {

        /**
         * The name of the test suite.
         * @type String
         * @property name
         */
        this.name = "";

        /**
         * Array of test suites and
         * @private
         */
        this.items = [];

        //initialize the properties
        if (Y.Lang.isString(data)){
            this.name = data;
        } else if (Y.Lang.isObject(data)){
            Y.mix(this, data, true);
        }

        //double-check name
        if (this.name === ""){
            this.name = "testSuite" + Y.guid();
        }

    };

    Y.Test.Suite.prototype = {

        /**
         * Adds a test suite or test case to the test suite.
         * @param {Y.Test.Suite||Y.Test.Case} testObject The test suite or test case to add.
         * @return {Void}
         * @method add
         */
        add : function (testObject /*:Y.Test.Suite*/) {
            if (testObject instanceof Y.Test.Suite || testObject instanceof Y.Test.Case) {
                this.items.push(testObject);
            }
            return this;
        },

        //-------------------------------------------------------------------------
        // Stub Methods
        //-------------------------------------------------------------------------

        /**
         * Function to run before each test is executed.
         * @return {Void}
         * @method setUp
         */
        setUp : function () {
        },

        /**
         * Function to run after each test is executed.
         * @return {Void}
         * @method tearDown
         */
        tearDown: function () {
        }

    };

    /*
     * Runs test suites and test cases, providing events to allowing for the
     * interpretation of test results.
     * @namespace Test
     * @class Runner
     * @static
     */
    Y.Test.Runner = (function(){

        /* (intentionally not documented)
         * A node in the test tree structure. May represent a TestSuite, TestCase, or
         * test function.
         * @param {Variant} testObject A TestSuite, TestCase, or the name of a test function.
         * @class TestNode
         * @constructor
         * @private
         */
        function TestNode(testObject){

            /* (intentionally not documented)
             * The TestSuite, TestCase, or test function represented by this node.
             * @type Variant
             * @property testObject
             */
            this.testObject = testObject;

            /* (intentionally not documented)
             * Pointer to this node's first child.
             * @type TestNode
             * @property firstChild
             */
            this.firstChild = null;

            /* (intentionally not documented)
             * Pointer to this node's last child.
             * @type TestNode
             * @property lastChild
             */
            this.lastChild = null;

            /* (intentionally not documented)
             * Pointer to this node's parent.
             * @type TestNode
             * @property parent
             */
            this.parent = null;

            /* (intentionally not documented)
             * Pointer to this node's next sibling.
             * @type TestNode
             * @property next
             */
            this.next = null;

            /* (intentionally not documented)
             * Test results for this test object.
             * @type object
             * @property results
             */
            this.results = {
                passed : 0,
                failed : 0,
                total : 0,
                ignored : 0,
                duration: 0
            };

            //initialize results
            if (testObject instanceof Y.Test.Suite){
                this.results.type = "testsuite";
                this.results.name = testObject.name;
            } else if (testObject instanceof Y.Test.Case){
                this.results.type = "testcase";
                this.results.name = testObject.name;
            }

        }

        TestNode.prototype = {

            /* (intentionally not documented)
             * Appends a new test object (TestSuite, TestCase, or test function name) as a child
             * of this node.
             * @param {Variant} testObject A TestSuite, TestCase, or the name of a test function.
             * @return {Void}
             */
            appendChild : function (testObject){
                var node = new TestNode(testObject);
                if (this.firstChild === null){
                    this.firstChild = this.lastChild = node;
                } else {
                    this.lastChild.next = node;
                    this.lastChild = node;
                }
                node.parent = this;
                return node;
            }
        };

        /**
         * Runs test suites and test cases, providing events to allowing for the
         * interpretation of test results.
         * @namespace Test
         * @class Runner
         * @static
         */
        function TestRunner(){

            //inherit from EventProvider
            TestRunner.superclass.constructor.apply(this,arguments);

            /**
             * Suite on which to attach all TestSuites and TestCases to be run.
             * @type Y.Test.Suite
             * @property masterSuite
             * @static
             * @private
             */
            this.masterSuite /*:Y.Test.Suite*/ = new Y.Test.Suite("yuitests" + (new Date()).getTime());

            /**
             * Pointer to the current node in the test tree.
             * @type TestNode
             * @private
             * @property _cur
             * @static
             */
            this._cur = null;

            /**
             * Pointer to the root node in the test tree.
             * @type TestNode
             * @private
             * @property _root
             * @static
             */
            this._root = null;

            /**
             * Indicates if the TestRunner will log events or not.
             * @type Boolean
             * @property _log
             * @private
             * @static
             */
            this._log = true;

            /**
             * Indicates if the TestRunner is waiting as a result of
             * wait() being called.
             * @type Boolean
             * @property _waiting
             * @private
             * @static
             */
            this._waiting = false;

            /**
             * Indicates if the TestRunner is currently running unittests.
             * @type Boolean
             * @private
             * @property _running
             * @static
             */
            this._running = false;

            /**
             * Holds copy of the results object generated when all unittests are
             * complete.
             * @type Object
             * @private
             * @property _lastResults
             * @static
             */
            this._lastResults = null;

            //create events
            var events = [
                this.TEST_CASE_BEGIN_EVENT,
                this.TEST_CASE_COMPLETE_EVENT,
                this.TEST_SUITE_BEGIN_EVENT,
                this.TEST_SUITE_COMPLETE_EVENT,
                this.TEST_PASS_EVENT,
                this.TEST_FAIL_EVENT,
                this.TEST_IGNORE_EVENT,
                this.COMPLETE_EVENT,
                this.BEGIN_EVENT
            ];
            for (var i=0; i < events.length; i++){
                this.on(events[i], this._logEvent, this, true);
            }

        }

        Y.extend(TestRunner, Y.Event.Target, {

            //-------------------------------------------------------------------------
            // Constants
            //-------------------------------------------------------------------------

            /**
             * Fires when a test case is opened but before the first
             * test is executed.
             * @event testcasebegin
             * @static
             */
            TEST_CASE_BEGIN_EVENT : "testcasebegin",

            /**
             * Fires when all unittests in a test case have been executed.
             * @event testcasecomplete
             * @static
             */
            TEST_CASE_COMPLETE_EVENT : "testcasecomplete",

            /**
             * Fires when a test suite is opened but before the first
             * test is executed.
             * @event testsuitebegin
             * @static
             */
            TEST_SUITE_BEGIN_EVENT : "testsuitebegin",

            /**
             * Fires when all test cases in a test suite have been
             * completed.
             * @event testsuitecomplete
             * @static
             */
            TEST_SUITE_COMPLETE_EVENT : "testsuitecomplete",

            /**
             * Fires when a test has passed.
             * @event pass
             * @static
             */
            TEST_PASS_EVENT : "pass",

            /**
             * Fires when a test has failed.
             * @event fail
             * @static
             */
            TEST_FAIL_EVENT : "fail",

            /**
             * Fires when a test has been ignored.
             * @event ignore
             * @static
             */
            TEST_IGNORE_EVENT : "ignore",

            /**
             * Fires when all test suites and test cases have been completed.
             * @event complete
             * @static
             */
            COMPLETE_EVENT : "complete",

            /**
             * Fires when the run() method is called.
             * @event begin
             * @static
             */
            BEGIN_EVENT : "begin",

            //-------------------------------------------------------------------------
            // Logging-Related Methods
            //-------------------------------------------------------------------------


            /**
             * Disable logging via Y.log(). Test output will not be visible unless
             * TestRunner events are subscribed to.
             * @return {Void}
             * @method disableLogging
             * @static
             */
            disableLogging: function(){
                this._log = false;
            },

            /**
             * Enable logging via Y.log(). Test output is published and can be read via
             * logreader.
             * @return {Void}
             * @method enableLogging
             * @static
             */
            enableLogging: function(){
                this._log = true;
            },

            /**
             * Logs TestRunner events using Y.log().
             * @param {Object} event The event object for the event.
             * @return {Void}
             * @method _logEvent
             * @private
             * @static
             */
            _logEvent: function(event){

                //data variables
                var message = "";
                var messageType = "";

                switch(event.type){
                    case this.BEGIN_EVENT:
                        message = "Testing began at " + (new Date()).toString() + ".";
                        messageType = "info";
                        break;

                    case this.COMPLETE_EVENT:
                        message = Y.substitute("Testing completed at " +
                            (new Date()).toString() + ".\n" +
                            "Passed:{passed} Failed:{failed} " +
                            "Total:{total} ({ignored} ignored)",
                            event.results);
                        messageType = "info";
                        break;

                    case this.TEST_FAIL_EVENT:
                        message = event.testName + ": failed.\n" + event.error.getMessage();
                        messageType = "fail";
                        break;

                    case this.TEST_IGNORE_EVENT:
                        message = event.testName + ": ignored.";
                        messageType = "ignore";
                        break;

                    case this.TEST_PASS_EVENT:
                        message = event.testName + ": passed.";
                        messageType = "pass";
                        break;

                    case this.TEST_SUITE_BEGIN_EVENT:
                        message = "Test suite \"" + event.testSuite.name + "\" started.";
                        messageType = "info";
                        break;

                    case this.TEST_SUITE_COMPLETE_EVENT:
                        message = Y.substitute("Test suite \"" +
                            event.testSuite.name + "\" completed" + ".\n" +
                            "Passed:{passed} Failed:{failed} " +
                            "Total:{total} ({ignored} ignored)",
                            event.results);
                        messageType = "info";
                        break;

                    case this.TEST_CASE_BEGIN_EVENT:
                        message = "Test case \"" + event.testCase.name + "\" started.";
                        messageType = "info";
                        break;

                    case this.TEST_CASE_COMPLETE_EVENT:
                        message = Y.substitute("Test case \"" +
                            event.testCase.name + "\" completed.\n" +
                            "Passed:{passed} Failed:{failed} " +
                            "Total:{total} ({ignored} ignored)",
                            event.results);
                        messageType = "info";
                        break;
                    default:
                        message = "Unexpected event " + event.type;
                        message = "info";
                }

                //only log if required
                if (this._log){
                    Y.log(message, messageType, "TestRunner");
                }
            },

            //-------------------------------------------------------------------------
            // Test Tree-Related Methods
            //-------------------------------------------------------------------------

            /**
             * Adds a test case to the test tree as a child of the specified node.
             * @param {TestNode} parentNode The node to add the test case to as a child.
             * @param {Y.Test.Case} testCase The test case to add.
             * @return {Void}
             * @static
             * @private
             * @method _addTestCaseToTestTree
             */
           _addTestCaseToTestTree : function (parentNode, testCase /*:Y.Test.Case*/){

                //add the test suite
                var node = parentNode.appendChild(testCase),
                    prop,
                    testName;

                //iterate over the items in the test case
                for (prop in testCase){
                    if ((prop.indexOf("test") === 0 || (prop.toLowerCase().indexOf("should") > -1 && prop.indexOf(" ") > -1 ))&& Y.Lang.isFunction(testCase[prop])){
                        node.appendChild(prop);
                    }
                }

            },

            /**
             * Adds a test suite to the test tree as a child of the specified node.
             * @param {TestNode} parentNode The node to add the test suite to as a child.
             * @param {Y.Test.Suite} testSuite The test suite to add.
             * @return {Void}
             * @static
             * @private
             * @method _addTestSuiteToTestTree
             */
            _addTestSuiteToTestTree : function (parentNode, testSuite /*:Y.Test.Suite*/) {

                //add the test suite
                var node = parentNode.appendChild(testSuite);

                //iterate over the items in the master suite
                for (var i=0; i < testSuite.items.length; i++){
                    if (testSuite.items[i] instanceof Y.Test.Suite) {
                        this._addTestSuiteToTestTree(node, testSuite.items[i]);
                    } else if (testSuite.items[i] instanceof Y.Test.Case) {
                        this._addTestCaseToTestTree(node, testSuite.items[i]);
                    }
                }
            },

            /**
             * Builds the test tree based on items in the master suite. The tree is a hierarchical
             * representation of the test suites, test cases, and test functions. The resulting tree
             * is stored in _root and the pointer _cur is set to the root initially.
             * @return {Void}
             * @static
             * @private
             * @method _buildTestTree
             */
            _buildTestTree : function () {

                this._root = new TestNode(this.masterSuite);
                //this._cur = this._root;

                //iterate over the items in the master suite
                for (var i=0; i < this.masterSuite.items.length; i++){
                    if (this.masterSuite.items[i] instanceof Y.Test.Suite) {
                        this._addTestSuiteToTestTree(this._root, this.masterSuite.items[i]);
                    } else if (this.masterSuite.items[i] instanceof Y.Test.Case) {
                        this._addTestCaseToTestTree(this._root, this.masterSuite.items[i]);
                    }
                }

            },

            //-------------------------------------------------------------------------
            // Private Methods
            //-------------------------------------------------------------------------

            /**
             * Handles the completion of a test object's unittests. Tallies test results
             * from one level up to the next.
             * @param {TestNode} node The TestNode representing the test object.
             * @return {Void}
             * @method _handleTestObjectComplete
             * @private
             */
            _handleTestObjectComplete : function (node) {
                if (Y.Lang.isObject(node.testObject)){

                    if (node.parent){
                        node.parent.results.passed += node.results.passed;
                        node.parent.results.failed += node.results.failed;
                        node.parent.results.total += node.results.total;
                        node.parent.results.ignored += node.results.ignored;
                        //node.parent.results.duration += node.results.duration;
                        node.parent.results[node.testObject.name] = node.results;
                    }

                    if (node.testObject instanceof Y.Test.Suite){
                        node.testObject.tearDown();
                        node.results.duration = (new Date()) - node._start;
                        this.fire(this.TEST_SUITE_COMPLETE_EVENT, { testSuite: node.testObject, results: node.results});
                    } else if (node.testObject instanceof Y.Test.Case){
                        node.results.duration = (new Date()) - node._start;
                        this.fire(this.TEST_CASE_COMPLETE_EVENT, { testCase: node.testObject, results: node.results});
                    }
                }
            },

            //-------------------------------------------------------------------------
            // Navigation Methods
            //-------------------------------------------------------------------------

            /**
             * Retrieves the next node in the test tree.
             * @return {TestNode} The next node in the test tree or null if the end is reached.
             * @private
             * @static
             * @method _next
             */
            _next : function () {

                if (this._cur === null){
                    this._cur = this._root;
                } else if (this._cur.firstChild) {
                    this._cur = this._cur.firstChild;
                } else if (this._cur.next) {
                    this._cur = this._cur.next;
                } else {
                    while (this._cur && !this._cur.next && this._cur !== this._root){
                        this._handleTestObjectComplete(this._cur);
                        this._cur = this._cur.parent;
                    }

                    this._handleTestObjectComplete(this._cur);

                    if (this._cur == this._root){
                        this._cur.results.type = "report";
                        this._cur.results.timestamp = (new Date()).toLocaleString();
                        this._cur.results.duration = (new Date()) - this._cur._start;
                        this._lastResults = this._cur.results;
                        this._running = false;
                        this.fire(this.COMPLETE_EVENT, { results: this._lastResults});
                        this._cur = null;
                    } else {
                        this._cur = this._cur.next;
                    }
                }

                return this._cur;
            },

            /**
             * Runs a test case or test suite, returning the results.
             * @param {Y.Test.Case|Y.Test.Suite} testObject The test case or test suite to run.
             * @return {Object} Results of the execution with properties passed, failed, and total.
             * @private
             * @method _run
             * @static
             */
            _run : function () {

                //flag to indicate if the TestRunner should wait before continuing
                var shouldWait = false;

                //get the next test node
                var node = this._next();

                if (node !== null) {

                    //set flag to say the testrunner is running
                    this._running = true;

                    //eliminate last results
                    this._lastResult = null;

                    var testObject = node.testObject;

                    //figure out what to do
                    if (Y.Lang.isObject(testObject)){
                        if (testObject instanceof Y.Test.Suite){
                            this.fire(this.TEST_SUITE_BEGIN_EVENT, { testSuite: testObject });
                            node._start = new Date();
                            testObject.setUp();
                        } else if (testObject instanceof Y.Test.Case){
                            this.fire(this.TEST_CASE_BEGIN_EVENT, { testCase: testObject });
                            node._start = new Date();
                        }

                        //some environments don't support setTimeout
                        if (typeof setTimeout != "undefined"){
                            setTimeout(function(){
                                Y.Test.Runner._run();
                            }, 0);
                        } else {
                            this._run();
                        }
                    } else {
                        this._runTest(node);
                    }

                }
            },

            _resumeTest : function (segment) {

                //get relevant information
                var node = this._cur;

                //we know there's no more waiting now
                this._waiting = false;

                //if there's no node, it probably means a wait() was called after resume()
                if (!node){
                    //TODO: Handle in some way?
                    //console.log("wait() called after resume()");
                    //this.fire("error", { testCase: "(unknown)", test: "(unknown)", error: new Error("wait() called after resume()")} );
                    return;
                }

                var testName = node.testObject;
                var testCase /*:Y.Test.Case*/ = node.parent.testObject;

                //cancel other waits if available
                if (testCase.__yui_wait){
                    clearTimeout(testCase.__yui_wait);
                    delete testCase.__yui_wait;
                }

                //get the "should" test cases
                var shouldFail = (testCase._should.fail || {})[testName];
                var shouldError = (testCase._should.error || {})[testName];

                //variable to hold whether or not the test failed
                var failed = false;
                var error = null;

                //try the test
                try {

                    //run the test
                    segment.apply(testCase);

                    //if it should fail, and it got here, then it's a fail because it didn't
                    if (shouldFail){
                        error = new Y.Assert.ShouldFail();
                        failed = true;
                    } else if (shouldError){
                        error = new Y.Assert.ShouldError();
                        failed = true;
                    }

                } catch (thrown){

                    //cancel any pending waits, the test already failed
                    if (testCase.__yui_wait){
                        clearTimeout(testCase.__yui_wait);
                        delete testCase.__yui_wait;
                    }

                    //figure out what type of error it was
                    if (thrown instanceof Y.Assert.Error) {
                        if (!shouldFail){
                            error = thrown;
                            failed = true;
                        }
                    } else if (thrown instanceof Y.Test.Wait){

                        if (Y.Lang.isFunction(thrown.segment)){
                            if (Y.Lang.isNumber(thrown.delay)){

                                //some environments don't support setTimeout
                                if (typeof setTimeout != "undefined"){
                                    testCase.__yui_wait = setTimeout(function(){
                                        Y.Test.Runner._resumeTest(thrown.segment);
                                    }, thrown.delay);
                                    this._waiting = true;
                                } else {
                                    throw new Error("Asynchronous unittests not supported in this environment.");
                                }
                            }
                        }

                        return;

                    } else {
                        //first check to see if it should error
                        if (!shouldError) {
                            error = new Y.Assert.UnexpectedError(thrown);
                            failed = true;
                        } else {
                            //check to see what type of data we have
                            if (Y.Lang.isString(shouldError)){

                                //if it's a string, check the error message
                                if (thrown.message != shouldError){
                                    error = new Y.Assert.UnexpectedError(thrown);
                                    failed = true;
                                }
                            } else if (Y.Lang.isFunction(shouldError)){

                                //if it's a function, see if the error is an instance of it
                                if (!(thrown instanceof shouldError)){
                                    error = new Y.Assert.UnexpectedError(thrown);
                                    failed = true;
                                }

                            } else if (Y.Lang.isObject(shouldError)){

                                //if it's an object, check the instance and message
                                if (!(thrown instanceof shouldError.constructor) ||
                                        thrown.message != shouldError.message){
                                    error = new Y.Assert.UnexpectedError(thrown);
                                    failed = true;
                                }

                            }

                        }
                    }

                }

                //fire appropriate event
                if (failed) {
                    this.fire(this.TEST_FAIL_EVENT, { testCase: testCase, testName: testName, error: error });
                } else {
                    this.fire(this.TEST_PASS_EVENT, { testCase: testCase, testName: testName });
                }

                //run the tear down
                testCase.tearDown();

                //calculate duration
                var duration = (new Date()) - node._start;

                //update results
                node.parent.results[testName] = {
                    result: failed ? "fail" : "pass",
                    message: error ? error.getMessage() : "Test passed",
                    type: "test",
                    name: testName,
                    duration: duration
                };

                if (failed){
                    node.parent.results.failed++;
                } else {
                    node.parent.results.passed++;
                }
                node.parent.results.total++;

                //set timeout not supported in all environments
                if (typeof setTimeout != "undefined"){
                    setTimeout(function(){
                        Y.Test.Runner._run();
                    }, 0);
                } else {
                    this._run();
                }

            },

            /**
             * Handles an error as if it occurred within the currently executing
             * test. This is for mock methods that may be called asynchronously
             * and therefore out of the scope of the TestRunner. Previously, this
             * error would bubble up to the browser. Now, this method is used
             * to tell TestRunner about the error. This should never be called
             * by anyplace other than the Mock object.
             * @param {Error} error The error object.
             * @return {Void}
             * @method _handleError
             * @private
             * @static
             */
            _handleError: function(error){

                if (this._waiting){
                    this._resumeTest(function(){
                        throw error;
                    });
                } else {
                    throw error;
                }

            },

            /**
             * Runs a single test based on the data provided in the node.
             * @param {TestNode} node The TestNode representing the test to run.
             * @return {Void}
             * @static
             * @private
             * @name _runTest
             */
            _runTest : function (node) {

                //get relevant information
                var testName = node.testObject;
                var testCase /*:Y.Test.Case*/ = node.parent.testObject;
                var test = testCase[testName];

                //get the "should" test cases
                var shouldIgnore = (testCase._should.ignore || {})[testName];

                //figure out if the test should be ignored or not
                if (shouldIgnore){

                    //update results
                    node.parent.results[testName] = {
                        result: "ignore",
                        message: "Test ignored",
                        type: "test",
                        name: testName
                    };

                    node.parent.results.ignored++;
                    node.parent.results.total++;

                    this.fire(this.TEST_IGNORE_EVENT, { testCase: testCase, testName: testName });

                    //some environments don't support setTimeout
                    if (typeof setTimeout != "undefined"){
                        setTimeout(function(){
                            Y.Test.Runner._run();
                        }, 0);
                    } else {
                        this._run();
                    }

                } else {

                    //mark the start time
                    node._start = new Date();

                    //run the setup
                    testCase.setUp();

                    //now call the body of the test
                    this._resumeTest(test);
                }

            },

            //-------------------------------------------------------------------------
            // Misc Methods
            //-------------------------------------------------------------------------

            /**
             * Retrieves the name of the current result set.
             * @return {String} The name of the result set.
             * @method getName
             */
            getName: function(){
                return this.masterSuite.name;
            },

            /**
             * The name assigned to the master suite of the TestRunner. This is the name
             * that is output as the root's name when results are retrieved.
             * @param {String} name The name of the result set.
             * @return {Void}
             * @method setName
             */
            setName: function(name){
                this.masterSuite.name = name;
            },

            //-------------------------------------------------------------------------
            // Protected Methods
            //-------------------------------------------------------------------------

            /*
             * Fires events for the TestRunner. This overrides the default fire()
             * method from EventProvider to add the type property to the data that is
             * passed through on each event call.
             * @param {String} type The type of event to fire.
             * @param {Object} data (Optional) Data for the event.
             * @method fire
             * @static
             * @protected
             */
            fire : function (type, data) {
                data = data || {};
                data.type = type;
                TestRunner.superclass.fire.call(this, type, data);
            },

            //-------------------------------------------------------------------------
            // Public Methods
            //-------------------------------------------------------------------------

            /**
             * Adds a test suite or test case to the list of test objects to run.
             * @param testObject Either a TestCase or a TestSuite that should be run.
             * @return {Void}
             * @method add
             * @static
             */
            add : function (testObject) {
                this.masterSuite.add(testObject);
                return this;
            },

            /**
             * Removes all test objects from the runner.
             * @return {Void}
             * @method clear
             * @static
             */
            clear : function () {
                this.masterSuite = new Y.Test.Suite("yuitests" + (new Date()).getTime());
            },

            /**
             * Indicates if the TestRunner is waiting for a test to resume
             * @return {Boolean} True if the TestRunner is waiting, false if not.
             * @method isWaiting
             * @static
             */
            isWaiting: function() {
                return this._waiting;
            },

            /**
             * Indicates that the TestRunner is busy running unittests and therefore can't
             * be stopped and results cannot be gathered.
             * @return {Boolean} True if the TestRunner is running, false if not.
             * @method isRunning
             */
            isRunning: function(){
                return this._running;
            },

            /**
             * Returns the last complete results set from the TestRunner. Null is returned
             * if the TestRunner is running or no unittests have been run.
             * @param {Function} format (Optional) A test format to return the results in.
             * @return {Object|String} Either the results object or, if a test format is
             *      passed as the argument, a string representing the results in a specific
             *      format.
             * @method getResults
             */
            getResults: function(format){
                if (!this._running && this._lastResults){
                    if (Y.Lang.isFunction(format)){
                        return format(this._lastResults);
                    } else {
                        return this._lastResults;
                    }
                } else {
                    return null;
                }
            },

            /**
             * Returns the coverage report for the files that have been executed.
             * This returns only coverage information for files that have been
             * instrumented using YUI Test Coverage and only those that were run
             * in the same pass.
             * @param {Function} format (Optional) A coverage format to return results in.
             * @return {Object|String} Either the coverage object or, if a coverage
             *      format is specified, a string representing the results in that format.
             * @method getCoverage
             */
            getCoverage: function(format){
                if (!this._running && typeof _yuitest_coverage == "object"){
                    if (Y.Lang.isFunction(format)){
                        return format(_yuitest_coverage);
                    } else {
                        return _yuitest_coverage;
                    }
                } else {
                    return null;
                }
            },

            /**
             * Resumes the TestRunner after wait() was called.
             * @param {Function} segment The function to run as the rest
             *      of the haulted test.
             * @return {Void}
             * @method resume
             * @static
             */
            resume : function (segment) {
                if (Y.Test.Runner._waiting){
                    this._resumeTest(segment || function(){});
                } else {
                    throw new Error("resume() called without wait().");
                }
            },

            /**
             * Runs the test suite.
             * @param {Boolean} oldMode (Optional) Specifies that the <= 2.8 way of
             *      internally managing test suites should be used.
             * @return {Void}
             * @method run
             * @static
             */
            run : function (oldMode) {

                //pointer to runner to avoid scope issues
                var runner = Y.Test.Runner;

                //if there's only one suite on the masterSuite, move it up
                if (!oldMode && this.masterSuite.items.length == 1 && this.masterSuite.items[0] instanceof Y.Test.Suite){
                    this.masterSuite = this.masterSuite.items[0];
                }

                //build the test tree
                runner._buildTestTree();

                //set when the test started
                runner._root._start = new Date();

                //fire the begin event
                runner.fire(runner.BEGIN_EVENT);

                //begin the testing
                runner._run();
            }
        });

        return new TestRunner();

    })();

    /**
     * The Assert object provides functions to test JavaScript values against
     * known and expected results. Whenever a comparison (assertion) fails,
     * an error is thrown.
     *
     * @class Assert
     * @static
     */
    Y.Assert = {

        /**
         * The number of assertions performed.
         * @property _asserts
         * @type int
         * @private
         */
        _asserts: 0,

        //-------------------------------------------------------------------------
        // Helper Methods
        //-------------------------------------------------------------------------

        /**
         * Formats a message so that it can contain the original assertion message
         * in addition to the custom message.
         * @param {String} customMessage The message passed in by the developer.
         * @param {String} defaultMessage The message created by the error by default.
         * @return {String} The final error message, containing either or both.
         * @protected
         * @static
         * @method _formatMessage
         */
        _formatMessage : function (customMessage, defaultMessage) {
            var message = customMessage;
            if (Y.Lang.isString(customMessage) && customMessage.length > 0){
                return Y.Lang.substitute(customMessage, { message: defaultMessage });
            } else {
                return defaultMessage;
            }
        },

        /**
         * Returns the number of assertions that have been performed.
         * @method _getCount
         * @protected
         * @static
         */
        _getCount: function(){
            return this._asserts;
        },

        /**
         * Increments the number of assertions that have been performed.
         * @method _increment
         * @protected
         * @static
         */
        _increment: function(){
            this._asserts++;
        },

        /**
         * Resets the number of assertions that have been performed to 0.
         * @method _reset
         * @protected
         * @static
         */
        _reset: function(){
            this._asserts = 0;
        },

        //-------------------------------------------------------------------------
        // Generic Assertion Methods
        //-------------------------------------------------------------------------

        /**
         * Forces an assertion error to occur.
         * @param {String} message (Optional) The message to display with the failure.
         * @method fail
         * @static
         */
        fail : function (message) {
            throw new Y.Assert.Error(Y.Assert._formatMessage(message, "Test force-failed."));
        },

        //-------------------------------------------------------------------------
        // Equality Assertion Methods
        //-------------------------------------------------------------------------

        /**
         * Asserts that a value is equal to another. This uses the double equals sign
         * so type cohersion may occur.
         * @param {Object} expected The expected value.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method areEqual
         * @static
         */
        areEqual : function (expected, actual, message) {
            Y.Assert._increment();
            if (expected != actual) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values should be equal."), expected, actual);
            }
        },

        /**
         * Asserts that a value is not equal to another. This uses the double equals sign
         * so type cohersion may occur.
         * @param {Object} unexpected The unexpected value.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method areNotEqual
         * @static
         */
        areNotEqual : function (unexpected, actual,
                             message) {
            Y.Assert._increment();
            if (unexpected == actual) {
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Values should not be equal."), unexpected);
            }
        },

        /**
         * Asserts that a value is not the same as another. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} unexpected The unexpected value.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method areNotSame
         * @static
         */
        areNotSame : function (unexpected, actual, message) {
            Y.Assert._increment();
            if (unexpected === actual) {
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Values should not be the same."), unexpected);
            }
        },

        /**
         * Asserts that a value is the same as another. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} expected The expected value.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method areSame
         * @static
         */
        areSame : function (expected, actual, message) {
            Y.Assert._increment();
            if (expected !== actual) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values should be the same."), expected, actual);
            }
        },

        //-------------------------------------------------------------------------
        // Boolean Assertion Methods
        //-------------------------------------------------------------------------

        /**
         * Asserts that a value is false. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isFalse
         * @static
         */
        isFalse : function (actual, message) {
            Y.Assert._increment();
            if (false !== actual) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be false."), false, actual);
            }
        },

        /**
         * Asserts that a value is true. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isTrue
         * @static
         */
        isTrue : function (actual, message) {
            Y.Assert._increment();
            if (true !== actual) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be true."), true, actual);
            }

        },

        //-------------------------------------------------------------------------
        // Special Value Assertion Methods
        //-------------------------------------------------------------------------

        /**
         * Asserts that a value is not a number.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNaN
         * @static
         */
        isNaN : function (actual, message){
            Y.Assert._increment();
            if (!isNaN(actual)){
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be NaN."), NaN, actual);
            }
        },

        /**
         * Asserts that a value is not the special NaN value.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNotNaN
         * @static
         */
        isNotNaN : function (actual, message){
            Y.Assert._increment();
            if (isNaN(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Values should not be NaN."), NaN);
            }
        },

        /**
         * Asserts that a value is not null. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNotNull
         * @static
         */
        isNotNull : function (actual, message) {
            Y.Assert._increment();
            if (Y.Lang.isNull(actual)) {
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Values should not be null."), null);
            }
        },

        /**
         * Asserts that a value is not undefined. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNotUndefined
         * @static
         */
        isNotUndefined : function (actual, message) {
            Y.Assert._increment();
            if (Y.Lang.isUndefined(actual)) {
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should not be undefined."), undefined);
            }
        },

        /**
         * Asserts that a value is null. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNull
         * @static
         */
        isNull : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isNull(actual)) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be null."), null, actual);
            }
        },

        /**
         * Asserts that a value is undefined. This uses the triple equals sign
         * so no type cohersion may occur.
         * @param {Object} actual The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isUndefined
         * @static
         */
        isUndefined : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isUndefined(actual)) {
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be undefined."), undefined, actual);
            }
        },

        //--------------------------------------------------------------------------
        // Instance Assertion Methods
        //--------------------------------------------------------------------------

        /**
         * Asserts that a value is an array.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isArray
         * @static
         */
        isArray : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isArray(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be an array."), actual);
            }
        },

        /**
         * Asserts that a value is a Boolean.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isBoolean
         * @static
         */
        isBoolean : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isBoolean(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be a Boolean."), actual);
            }
        },

        /**
         * Asserts that a value is a function.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isFunction
         * @static
         */
        isFunction : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isFunction(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be a function."), actual);
            }
        },

        /**
         * Asserts that a value is an instance of a particular object. This may return
         * incorrect results when comparing objects from one frame to constructors in
         * another frame. For best results, don't use in a cross-frame manner.
         * @param {Function} expected The function that the object should be an instance of.
         * @param {Object} actual The object to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isInstanceOf
         * @static
         */
        isInstanceOf : function (expected, actual, message) {
            Y.Assert._increment();
            if (!(actual instanceof expected)){
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value isn't an instance of expected type."), expected, actual);
            }
        },

        /**
         * Asserts that a value is a number.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNumber
         * @static
         */
        isNumber : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isNumber(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be a number."), actual);
            }
        },

        /**
         * Asserts that a value is an object.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isObject
         * @static
         */
        isObject : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isObject(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be an object."), actual);
            }
        },

        /**
         * Asserts that a value is a string.
         * @param {Object} actual The value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isString
         * @static
         */
        isString : function (actual, message) {
            Y.Assert._increment();
            if (!Y.Lang.isString(actual)){
                throw new Y.Assert.UnexpectedValue(Y.Assert._formatMessage(message, "Value should be a string."), actual);
            }
        },

        /**
         * Asserts that a value is of a particular type.
         * @param {String} expectedType The expected type of the variable.
         * @param {Object} actualValue The actual value to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isTypeOf
         * @static
         */
        isTypeOf : function (expectedType, actualValue, message){
            Y.Assert._increment();
            if (typeof actualValue != expectedType){
                throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Value should be of type " + expectedType + "."), expected, typeof actualValue);
            }
        }
    };

    /**
     * Asserts that a given condition is true. If not, then a Y.Assert.Error object is thrown
     * and the test fails.
     * @method Y.assert
     * @param {Boolean} condition The condition to test.
     * @param {String} message The message to display if the assertion fails.
     * @static
     */
    Y.assert = function(condition, message){
        Y.Assert._increment();
        if (!condition){
            throw new Y.Assert.Error(Y.Assert._formatMessage(message, "Assertion failed."));
        }
    };

    /**
     * Forces an assertion error to occur. Shortcut for Y.Assert.fail().
     * @method Y.fail
     * @param {String} message (Optional) The message to display with the failure.
     * @static
     */
    Y.fail = Y.Assert.fail;

    //-----------------------------------------------------------------------------
    // Assertion errors
    //-----------------------------------------------------------------------------

    /**
     * Error is thrown whenever an assertion fails. It provides methods
     * to more easily get at error information and also provides a base class
     * from which more specific assertion errors can be derived.
     *
     * @param {String} message The message to display when the error occurs.
     * @namespace Assert
     * @class Error
     * @constructor
     */
    Y.Assert.Error = function (message){

        //call superclass
        arguments.callee.superclass.constructor.call(this, message);

        /*
         * Error message. Must be duplicated to ensure browser receives it.
         * @type String
         * @property message
         */
        this.message = message;

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "Assert Error";
    };

    //inherit methods
    Y.extend(Y.Assert.Error, Error, {

        /**
         * Returns a fully formatted error for an assertion failure. This should
         * be overridden by all subclasses to provide specific information.
         * @method getMessage
         * @return {String} A string describing the error.
         */
        getMessage : function () {
            return this.message;
        },

        /**
         * Returns a string representation of the error.
         * @method toString
         * @return {String} A string representation of the error.
         */
        toString : function () {
            return this.name + ": " + this.getMessage();
        },

        /**
         * Returns a primitive value version of the error. Same as toString().
         * @method valueOf
         * @return {String} A primitive value version of the error.
         */
        valueOf : function () {
            return this.toString();
        }

    });

    /**
     * ComparisonFailure is subclass of Error that is thrown whenever
     * a comparison between two values fails. It provides mechanisms to retrieve
     * both the expected and actual value.
     *
     * @param {String} message The message to display when the error occurs.
     * @param {Object} expected The expected value.
     * @param {Object} actual The actual value that caused the assertion to fail.
     * @namespace Assert
     * @extends Assert.Error
     * @class ComparisonFailure
     * @constructor
     */
    Y.Assert.ComparisonFailure = function (message, expected, actual){

        //call superclass
        arguments.callee.superclass.constructor.call(this, message);

        /**
         * The expected value.
         * @type Object
         * @property expected
         */
        this.expected = expected;

        /**
         * The actual value.
         * @type Object
         * @property actual
         */
        this.actual = actual;

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "ComparisonFailure";

    };

    //inherit methods
    Y.extend(Y.Assert.ComparisonFailure, Y.Assert.Error, {

        /**
         * Returns a fully formatted error for an assertion failure. This message
         * provides information about the expected and actual values.
         * @method toString
         * @return {String} A string describing the error.
         */
        getMessage : function () {
            return this.message + "\nExpected: " + this.expected + " (" + (typeof this.expected) + ")"  +
                "\nActual: " + this.actual + " (" + (typeof this.actual) + ")";
        }

    });

    /**
     * UnexpectedValue is subclass of Error that is thrown whenever
     * a value was unexpected in its scope. This typically means that a test
     * was performed to determine that a value was *not* equal to a certain
     * value.
     *
     * @param {String} message The message to display when the error occurs.
     * @param {Object} unexpected The unexpected value.
     * @namespace Assert
     * @extends Assert.Error
     * @class UnexpectedValue
     * @constructor
     */
    Y.Assert.UnexpectedValue = function (message, unexpected){

        //call superclass
        arguments.callee.superclass.constructor.call(this, message);

        /**
         * The unexpected value.
         * @type Object
         * @property unexpected
         */
        this.unexpected = unexpected;

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "UnexpectedValue";

    };

    //inherit methods
    Y.extend(Y.Assert.UnexpectedValue, Y.Assert.Error, {

        /**
         * Returns a fully formatted error for an assertion failure. The message
         * contains information about the unexpected value that was encountered.
         * @method getMessage
         * @return {String} A string describing the error.
         */
        getMessage : function () {
            return this.message + "\nUnexpected: " + this.unexpected + " (" + (typeof this.unexpected) + ") ";
        }

    });

    /**
     * ShouldFail is subclass of Error that is thrown whenever
     * a test was expected to fail but did not.
     *
     * @param {String} message The message to display when the error occurs.
     * @namespace Assert
     * @extends Assert.Error
     * @class ShouldFail
     * @constructor
     */
    Y.Assert.ShouldFail = function (message){

        //call superclass
        arguments.callee.superclass.constructor.call(this, message || "This test should fail but didn't.");

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "ShouldFail";

    };

    //inherit methods
    Y.extend(Y.Assert.ShouldFail, Y.Assert.Error);

    /**
     * ShouldError is subclass of Error that is thrown whenever
     * a test is expected to throw an error but doesn't.
     *
     * @param {String} message The message to display when the error occurs.
     * @namespace Assert
     * @extends Assert.Error
     * @class ShouldError
     * @constructor
     */
    Y.Assert.ShouldError = function (message){

        //call superclass
        arguments.callee.superclass.constructor.call(this, message || "This test should have thrown an error but didn't.");

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "ShouldError";

    };

    //inherit methods
    Y.extend(Y.Assert.ShouldError, Y.Assert.Error);

    /**
     * UnexpectedError is subclass of Error that is thrown whenever
     * an error occurs within the course of a test and the test was not expected
     * to throw an error.
     *
     * @param {Error} cause The unexpected error that caused this error to be
     *                      thrown.
     * @namespace Assert
     * @extends Assert.Error
     * @class UnexpectedError
     * @constructor
     */
    Y.Assert.UnexpectedError = function (cause){

        //call superclass
        arguments.callee.superclass.constructor.call(this, "Unexpected error: " + cause.message);

        /**
         * The unexpected error that occurred.
         * @type Error
         * @property cause
         */
        this.cause = cause;

        /**
         * The name of the error that occurred.
         * @type String
         * @property name
         */
        this.name = "UnexpectedError";

        /**
         * Stack information for the error (if provided).
         * @type String
         * @property stack
         */
        this.stack = cause.stack;

    };

    //inherit methods
    Y.extend(Y.Assert.UnexpectedError, Y.Assert.Error);


    /**
     * The ArrayAssert object provides functions to test JavaScript array objects
     * for a variety of cases.
     *
     * @class ArrayAssert
     * @static
     */

    Y.ArrayAssert = {

        /**
         * Asserts that a value is present in an array. This uses the triple equals
         * sign so no type cohersion may occur.
         * @param {Object} needle The value that is expected in the array.
         * @param {Array} haystack An array of values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method contains
         * @static
         */
        contains : function (needle, haystack,
                               message) {

            Y.Assert._increment();

            if (Y.Array.indexOf(haystack, needle) == -1){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Value " + needle + " (" + (typeof needle) + ") not found in array [" + haystack + "]."));
            }
        },

        /**
         * Asserts that a set of values are present in an array. This uses the triple equals
         * sign so no type cohersion may occur. For this assertion to pass, all values must
         * be found.
         * @param {Object[]} needles An array of values that are expected in the array.
         * @param {Array} haystack An array of values to check.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method containsItems
         * @static
         */
        containsItems : function (needles, haystack,
                               message) {
            Y.Assert._increment();

            //begin checking values
            for (var i=0; i < needles.length; i++){
                if (Y.Array.indexOf(haystack, needles[i]) == -1){
                    Y.Assert.fail(Y.Assert._formatMessage(message, "Value " + needles[i] + " (" + (typeof needles[i]) + ") not found in array [" + haystack + "]."));
                }
            }
        },

        /**
         * Asserts that a value matching some condition is present in an array. This uses
         * a function to determine a match.
         * @param {Function} matcher A function that returns true if the items matches or false if not.
         * @param {Array} haystack An array of values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method containsMatch
         * @static
         */
        containsMatch : function (matcher, haystack,
                               message) {

            Y.Assert._increment();
            //check for valid matcher
            if (typeof matcher != "function"){
                throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");
            }

            if (!Y.Array.some(haystack, matcher)){
                Y.Assert.fail(Y.Assert._formatMessage(message, "No match found in array [" + haystack + "]."));
            }
        },

        /**
         * Asserts that a value is not present in an array. This uses the triple equals
         * Asserts that a value is not present in an array. This uses the triple equals
         * sign so no type cohersion may occur.
         * @param {Object} needle The value that is expected in the array.
         * @param {Array} haystack An array of values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method doesNotContain
         * @static
         */
        doesNotContain : function (needle, haystack,
                               message) {

            Y.Assert._increment();

            if (Y.Array.indexOf(haystack, needle) > -1){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Value found in array [" + haystack + "]."));
            }
        },

        /**
         * Asserts that a set of values are not present in an array. This uses the triple equals
         * sign so no type cohersion may occur. For this assertion to pass, all values must
         * not be found.
         * @param {Object[]} needles An array of values that are not expected in the array.
         * @param {Array} haystack An array of values to check.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method doesNotContainItems
         * @static
         */
        doesNotContainItems : function (needles, haystack,
                               message) {

            Y.Assert._increment();

            for (var i=0; i < needles.length; i++){
                if (Y.Array.indexOf(haystack, needles[i]) > -1){
                    Y.Assert.fail(Y.Assert._formatMessage(message, "Value found in array [" + haystack + "]."));
                }
            }

        },

        /**
         * Asserts that no values matching a condition are present in an array. This uses
         * a function to determine a match.
         * @param {Function} matcher A function that returns true if the items matches or false if not.
         * @param {Array} haystack An array of values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method doesNotContainMatch
         * @static
         */
        doesNotContainMatch : function (matcher, haystack,
                               message) {

            Y.Assert._increment();

            //check for valid matcher
            if (typeof matcher != "function"){
                throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");
            }

            if (Y.Array.some(haystack, matcher)){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Value found in array [" + haystack + "]."));
            }
        },

        /**
         * Asserts that the given value is contained in an array at the specified index.
         * This uses the triple equals sign so no type cohersion will occur.
         * @param {Object} needle The value to look for.
         * @param {Array} haystack The array to search in.
         * @param {int} index The index at which the value should exist.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method indexOf
         * @static
         */
        indexOf : function (needle, haystack, index, message) {

            Y.Assert._increment();

            //try to find the value in the array
            for (var i=0; i < haystack.length; i++){
                if (haystack[i] === needle){
                    if (index != i){
                        Y.Assert.fail(Y.Assert._formatMessage(message, "Value exists at index " + i + " but should be at index " + index + "."));
                    }
                    return;
                }
            }

            //if it makes it here, it wasn't found at all
            Y.Assert.fail(Y.Assert._formatMessage(message, "Value doesn't exist in array [" + haystack + "]."));
        },

        /**
         * Asserts that the values in an array are equal, and in the same position,
         * as values in another array. This uses the double equals sign
         * so type cohersion may occur. Note that the array objects themselves
         * need not be the same for this test to pass.
         * @param {Array} expected An array of the expected values.
         * @param {Array} actual Any array of the actual values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method itemsAreEqual
         * @static
         */
        itemsAreEqual : function (expected, actual,
                               message) {

            Y.Assert._increment();

            //first check array length
            if (expected.length != actual.length){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Array should have a length of " + expected.length + " but has a length of " + actual.length));
            }

            //begin checking values
            for (var i=0; i < expected.length; i++){
                if (expected[i] != actual[i]){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values in position " + i + " are not equal."), expected[i], actual[i]);
                }
            }
        },

        /**
         * Asserts that the values in an array are equivalent, and in the same position,
         * as values in another array. This uses a function to determine if the values
         * are equivalent. Note that the array objects themselves
         * need not be the same for this test to pass.
         * @param {Array} expected An array of the expected values.
         * @param {Array} actual Any array of the actual values.
         * @param {Function} comparator A function that returns true if the values are equivalent
         *      or false if not.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @return {Void}
         * @method itemsAreEquivalent
         * @static
         */
        itemsAreEquivalent : function (expected, actual,
                               comparator, message) {

            Y.Assert._increment();

            //make sure the comparator is valid
            if (typeof comparator != "function"){
                throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");
            }

            //first check array length
            if (expected.length != actual.length){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Array should have a length of " + expected.length + " but has a length of " + actual.length));
            }

            //begin checking values
            for (var i=0; i < expected.length; i++){
                if (!comparator(expected[i], actual[i])){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values in position " + i + " are not equivalent."), expected[i], actual[i]);
                }
            }
        },

        /**
         * Asserts that an array is empty.
         * @param {Array} actual The array to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isEmpty
         * @static
         */
        isEmpty : function (actual, message) {
            Y.Assert._increment();
            if (actual.length > 0){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Array should be empty."));
            }
        },

        /**
         * Asserts that an array is not empty.
         * @param {Array} actual The array to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method isNotEmpty
         * @static
         */
        isNotEmpty : function (actual, message) {
            Y.Assert._increment();
            if (actual.length === 0){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Array should not be empty."));
            }
        },

        /**
         * Asserts that the values in an array are the same, and in the same position,
         * as values in another array. This uses the triple equals sign
         * so no type cohersion will occur. Note that the array objects themselves
         * need not be the same for this test to pass.
         * @param {Array} expected An array of the expected values.
         * @param {Array} actual Any array of the actual values.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method itemsAreSame
         * @static
         */
        itemsAreSame : function (expected, actual,
                              message) {

            Y.Assert._increment();

            //first check array length
            if (expected.length != actual.length){
                Y.Assert.fail(Y.Assert._formatMessage(message, "Array should have a length of " + expected.length + " but has a length of " + actual.length));
            }

            //begin checking values
            for (var i=0; i < expected.length; i++){
                if (expected[i] !== actual[i]){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values in position " + i + " are not the same."), expected[i], actual[i]);
                }
            }
        },

        /**
         * Asserts that the given value is contained in an array at the specified index,
         * starting from the back of the array.
         * This uses the triple equals sign so no type cohersion will occur.
         * @param {Object} needle The value to look for.
         * @param {Array} haystack The array to search in.
         * @param {int} index The index at which the value should exist.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method lastIndexOf
         * @static
         */
        lastIndexOf : function (needle, haystack, index, message) {

            //try to find the value in the array
            for (var i=haystack.length; i >= 0; i--){
                if (haystack[i] === needle){
                    if (index != i){
                        Y.Assert.fail(Y.Assert._formatMessage(message, "Value exists at index " + i + " but should be at index " + index + "."));
                    }
                    return;
                }
            }

            //if it makes it here, it wasn't found at all
            Y.Assert.fail(Y.Assert._formatMessage(message, "Value doesn't exist in array."));
        }

    };

    /**
     * The ObjectAssert object provides functions to test JavaScript objects
     * for a variety of cases.
     *
     * @class ObjectAssert
     * @static
     */
    Y.ObjectAssert = {

        areEqual: function(expected, actual, message) {
            Y.Assert._increment();
            Y.Object.each(expected, function(value, name){
                if (expected[name] != actual[name]){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, "Values should be equal for property " + name), expected[name], actual[name]);
                }
            });
        },

        /**
         * Asserts that an object has a property with the given name. The property may exist either
         * on the object instance or in its prototype chain. The same as testing
         * "property" in object.
         * @param {String} propertyName The name of the property to test.
         * @param {Object} object The object to search.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method hasKey
         * @static
         */
        hasKey: function (propertyName, object, message) {
            Y.Assert._increment();
            if (!(propertyName in object)){
                Y.fail(Y.Assert._formatMessage(message, "Property '" + propertyName + "' not found on object."));
            }
        },

        /**
         * Asserts that an object has all properties of a reference object. The properties may exist either
         * on the object instance or in its prototype chain. The same as testing
         * "property" in object.
         * @param {Array} properties An array of property names that should be on the object.
         * @param {Object} object The object to search.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method hasKeys
         * @static
         */
        hasKeys: function (properties, object, message) {
            Y.Assert._increment();
            for (var i=0; i < properties.length; i++){
                if (!(properties[i] in object)){
                    Y.fail(Y.Assert._formatMessage(message, "Property '" + properties[i] + "' not found on object."));
                }
            }
        },

        /**
         * Asserts that a property with the given name exists on an object instance (not on its prototype).
         * @param {String} propertyName The name of the property to test.
         * @param {Object} object The object to search.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method ownsKey
         * @static
         */
        ownsKey: function (propertyName, object, message) {
            Y.Assert._increment();
            if (!object.hasOwnProperty(propertyName)){
                Y.fail(Y.Assert._formatMessage(message, "Property '" + propertyName + "' not found on object instance."));
            }
        },

        /**
         * Asserts that all properties exist on an object instance (not on its prototype).
         * @param {Array} properties An array of property names that should be on the object.
         * @param {Object} object The object to search.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method ownsKeys
         * @static
         */
        ownsKeys: function (properties, object, message) {
            Y.Assert._increment();
            for (var i=0; i < properties.length; i++){
                if (!object.hasOwnProperty(properties[i])){
                    Y.fail(Y.Assert._formatMessage(message, "Property '" + properties[i] + "' not found on object instance."));
                }
            }
        },

        /**
         * Asserts that an object owns no properties.
         * @param {Object} object The object to check.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method ownsNoKeys
         * @static
         */
        ownsNoKeys : function (object, message) {
            Y.Assert._increment();

            var keys = Y.Object.keys(object);

            if (keys.length > 0){
                Y.fail(Y.Assert._formatMessage(message, "Object owns " + keys.length + " properties but should own none."));
            }

        }
    };


    /**
     * The DateAssert object provides functions to test JavaScript Date objects
     * for a variety of cases.
     *
     * @class DateAssert
     * @namespace
     * @static
     */

    Y.DateAssert = {

        /**
         * Asserts that a date's month, day, and year are equal to another date's.
         * @param {Date} expected The expected date.
         * @param {Date} actual The actual date to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method datesAreEqual
         * @static
         */
        datesAreEqual : function (expected, actual, message){
            Y.Assert._increment();
            if (expected instanceof Date && actual instanceof Date){
                var msg = "";

                //check years first
                if (expected.getFullYear() != actual.getFullYear()){
                    msg = "Years should be equal.";
                }

                //now check months
                if (expected.getMonth() != actual.getMonth()){
                    msg = "Months should be equal.";
                }

                //last, check the day of the month
                if (expected.getDate() != actual.getDate()){
                    msg = "Days of month should be equal.";
                }

                if (msg.length){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, msg), expected, actual);
                }
            } else {
                throw new TypeError("Y.Assert.datesAreEqual(): Expected and actual values must be Date objects.");
            }
        },

        /**
         * Asserts that a date's hour, minutes, and seconds are equal to another date's.
         * @param {Date} expected The expected date.
         * @param {Date} actual The actual date to test.
         * @param {String} message (Optional) The message to display if the assertion fails.
         * @method timesAreEqual
         * @static
         */
        timesAreEqual : function (expected, actual, message){
            Y.Assert._increment();
            if (expected instanceof Date && actual instanceof Date){
                var msg = "";

                //check hours first
                if (expected.getHours() != actual.getHours()){
                    msg = "Hours should be equal.";
                }

                //now check minutes
                if (expected.getMinutes() != actual.getMinutes()){
                    msg = "Minutes should be equal.";
                }

                //last, check the seconds
                if (expected.getSeconds() != actual.getSeconds()){
                    msg = "Seconds should be equal.";
                }

                if (msg.length){
                    throw new Y.Assert.ComparisonFailure(Y.Assert._formatMessage(message, msg), expected, actual);
                }
            } else {
                throw new TypeError("DateY.AsserttimesAreEqual(): Expected and actual values must be Date objects.");
            }
        }

    };

    Y.namespace("Test.Format");

    /* (intentionally not documented)
     * Basic XML escaping method. Replaces quotes, less-than, greater-than,
     * apostrophe, and ampersand characters with their corresponding entities.
     * @param {String} text The text to encode.
     * @return {String} The XML-escaped text.
     */
    function xmlEscape(text){

        return text.replace(/[<>"'&]/g, function(value){
            switch(value){
                case "<":   return "&lt;";
                case ">":   return "&gt;";
                case "\"":  return "&quot;";
                case "'":   return "&apos;";
                case "&":   return "&amp;";
            }
        });

    }

    /**
     * Contains specific formatting options for test result information.
     * @namespace Test
     * @class Format
     * @static
     */

    /**
     * Returns test results formatted as a JSON string. Requires JSON utility.
     * @param {Object} result The results object created by TestRunner.
     * @return {String} A JSON-formatted string of results.
     * @method JSON
     * @static
     */
    Y.Test.Format.JSON = function(results) {
        return Y.JSON.stringify(results);
    };

    /**
     * Returns test results formatted as an XML string.
     * @param {Object} result The results object created by TestRunner.
     * @return {String} An XML-formatted string of results.
     * @method XML
     * @static
     */
    Y.Test.Format.XML = function(results) {

        function serializeToXML(results){
            var l   = Y.Lang,
                xml = "<" + results.type + " name=\"" + xmlEscape(results.name) + "\"";

            if (l.isNumber(results.duration)){
                xml += " duration=\"" + results.duration + "\"";
            }

            if (results.type == "test"){
                xml += " result=\"" + results.result + "\" message=\"" + xmlEscape(results.message) + "\">";
            } else {
                xml += " passed=\"" + results.passed + "\" failed=\"" + results.failed + "\" ignored=\"" + results.ignored + "\" total=\"" + results.total + "\">";
                Y.Object.each(results, function(value){
                    if (l.isObject(value) && !l.isArray(value)){
                        xml += serializeToXML(value);
                    }
                });
            }

            xml += "</" + results.type + ">";

            return xml;
        }

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serializeToXML(results);

    };


    /**
     * Returns test results formatted in JUnit XML format.
     * @param {Object} result The results object created by TestRunner.
     * @return {String} An XML-formatted string of results.
     * @method JUnitXML
     * @static
     */
    Y.Test.Format.JUnitXML = function(results) {

        function serializeToJUnitXML(results){
            var l   = Y.Lang,
                xml = "";

            switch (results.type){
                //equivalent to testcase in JUnit
                case "test":
                    if (results.result != "ignore"){
                        xml = "<testcase name=\"" + xmlEscape(results.name) + "\" time=\"" + (results.duration/1000) + "\">";
                        if (results.result == "fail"){
                            xml += "<failure message=\"" + xmlEscape(results.message) + "\"><![CDATA[" + results.message + "]]></failure>";
                        }
                        xml+= "</testcase>";
                    }
                    break;

                //equivalent to testsuite in JUnit
                case "testcase":

                    xml = "<testsuite name=\"" + xmlEscape(results.name) + "\" unittests=\"" + results.total + "\" failures=\"" + results.failed + "\" time=\"" + (results.duration/1000) + "\">";

                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            xml += serializeToJUnitXML(value);
                        }
                    });

                    xml += "</testsuite>";
                    break;

                //no JUnit equivalent, don't output anything
                case "testsuite":
                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            xml += serializeToJUnitXML(value);
                        }
                    });
                    break;

                //top-level, equivalent to testsuites in JUnit
                case "report":

                    xml = "<testsuites>";

                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            xml += serializeToJUnitXML(value);
                        }
                    });

                    xml += "</testsuites>";

                //no default
            }

            return xml;

        }

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serializeToJUnitXML(results);
    };

    /**
     * Returns test results formatted in TAP format.
     * For more information, see <a href="http://testanything.org/">Test Anything Protocol</a>.
     * @param {Object} result The results object created by TestRunner.
     * @return {String} A TAP-formatted string of results.
     * @method TAP
     * @static
     */
    Y.Test.Format.TAP = function(results) {

        var currentTestNum = 1;

        function serializeToTAP(results){
            var l   = Y.Lang,
                text = "";

            switch (results.type){

                case "test":
                    if (results.result != "ignore"){

                        text = "ok " + (currentTestNum++) + " - " + results.name;

                        if (results.result == "fail"){
                            text = "not " + text + " - " + results.message;
                        }

                        text += "\n";
                    } else {
                        text = "#Ignored test " + results.name + "\n";
                    }
                    break;

                case "testcase":

                    text = "#Begin testcase " + results.name + "(" + results.failed + " failed of " + results.total + ")\n";

                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            text += serializeToTAP(value);
                        }
                    });

                    text += "#End testcase " + results.name + "\n";


                    break;

                case "testsuite":

                    text = "#Begin testsuite " + results.name + "(" + results.failed + " failed of " + results.total + ")\n";

                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            text += serializeToTAP(value);
                        }
                    });

                    text += "#End testsuite " + results.name + "\n";
                    break;

                case "report":

                    Y.Object.each(results, function(value){
                        if (l.isObject(value) && !l.isArray(value)){
                            text += serializeToTAP(value);
                        }
                    });

                //no default
            }

            return text;

        }

        return "1.." + results.total + "\n" + serializeToTAP(results);
    };



    Y.namespace("Coverage.Format");

    /**
     * Contains specific formatting options for coverage information.
     * @namespace Coverage
     * @class Format
     * @static
     */

    /**
     * Returns the coverage report in JSON format. This is the straight
     * JSON representation of the native coverage report.
     * @param {Object} coverage The coverage report object.
     * @return {String} A JSON-formatted string of coverage data.
     * @method JSON
     * @static
     */
    Y.Coverage.Format.JSON = function(coverage){
        return Y.JSON.stringify(coverage);
    };

    /**
     * Returns the coverage report in a JSON format compatible with
     * Xdebug. See <a href="http://www.xdebug.com/docs/code_coverage">Xdebug Documentation</a>
     * for more information. Note: function coverage is not available
     * in this format.
     * @param {Object} coverage The coverage report object.
     * @return {String} A JSON-formatted string of coverage data.
     * @method XdebugJSON
     * @static
     */
    Y.Coverage.Format.XdebugJSON = function(coverage){
        var report = {};
        Y.Object.each(coverage, function(value, name){
            report[name] = coverage[name].lines;
        });
        return Y.JSON.stringify(report);
    };




    Y.namespace("Test");

    /**
     * An object capable of sending test results to a server.
     * @param {String} url The URL to submit the results to.
     * @param {Function} format (Optiona) A function that outputs the results in a specific format.
     *      Default is Y.Test.Format.XML.
     * @constructor
     * @namespace Test
     * @class Reporter
     */
    Y.Test.Reporter = function(url, format) {

        /**
         * The URL to submit the data to.
         * @type String
         * @property url
         */
        this.url = url;

        /**
         * The formatting function to call when submitting the data.
         * @type Function
         * @property format
         */
        this.format = format || Y.Test.Format.XML;

        /**
         * Extra fields to submit with the request.
         * @type Object
         * @property _fields
         * @private
         */
        this._fields = new Object();

        /**
         * The form element used to submit the results.
         * @type HTMLFormElement
         * @property _form
         * @private
         */
        this._form = null;

        /**
         * Iframe used as a target for form submission.
         * @type HTMLIFrameElement
         * @property _iframe
         * @private
         */
        this._iframe = null;
    };

    Y.Test.Reporter.prototype = {

        //restore missing constructor
        constructor: Y.Test.Reporter,

        /**
         * Adds a field to the form that submits the results.
         * @param {String} name The name of the field.
         * @param {Variant} value The value of the field.
         * @return {Void}
         * @method addField
         */
        addField : function (name, value){
            this._fields[name] = value;
        },

        /**
         * Removes all previous defined fields.
         * @return {Void}
         * @method addField
         */
        clearFields : function(){
            this._fields = new Object();
        },

        /**
         * Cleans up the memory associated with the TestReporter, removing DOM elements
         * that were created.
         * @return {Void}
         * @method destroy
         */
        destroy : function() {
            if (this._form){
                this._form.parentNode.removeChild(this._form);
                this._form = null;
            }
            if (this._iframe){
                this._iframe.parentNode.removeChild(this._iframe);
                this._iframe = null;
            }
            this._fields = null;
        },

        /**
         * Sends the report to the server.
         * @param {Object} results The results object created by TestRunner.
         * @return {Void}
         * @method report
         */
        report : function(results){

            //if the form hasn't been created yet, create it
            if (!this._form){
                this._form = document.createElement("form");
                this._form.method = "post";
                this._form.style.visibility = "hidden";
                this._form.style.position = "absolute";
                this._form.style.top = 0;
                document.body.appendChild(this._form);

                // IE won't let you assign a name using the DOM, must do it the hacky way
                var iframeContainer = document.createElement("div");
                iframeContainer.innerHTML = "<iframe name=\"yuiTestTarget\"></iframe>";
                this._iframe = iframeContainer.firstChild;

                this._iframe.src = "javascript:false";
                this._iframe.style.visibility = "hidden";
                this._iframe.style.position = "absolute";
                this._iframe.style.top = 0;
                document.body.appendChild(this._iframe);

                this._form.target = "yuiTestTarget";
            }

            //set the form's action
            this._form.action = this.url;

            //remove any existing fields
            while(this._form.hasChildNodes()){
                this._form.removeChild(this._form.lastChild);
            }

            //create default fields
            this._fields.results = this.format(results);
            this._fields.useragent = navigator.userAgent;
            this._fields.timestamp = (new Date()).toLocaleString();

            //add fields to the form
            Y.Object.each(this._fields, function(value, prop){
                if (typeof value != "function"){
                    var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = prop;
                    input.value = value;
                    this._form.appendChild(input);
                }
            }, this);

            //remove default fields
            delete this._fields.results;
            delete this._fields.useragent;
            delete this._fields.timestamp;

            if (arguments[1] !== false){
                this._form.submit();
            }

        }

    };
    /**
     * Creates a new mock object.
     * @class Mock
     * @constructor
     * @param {Object} template (Optional) An object whose methods
     *      should be stubbed out on the mock object. This object
     *      is used as the prototype of the mock object so instanceof
     *      works correctly.
     */
    Y.Mock = function(template){

        //use blank object is nothing is passed in
        template = template || {};

        var mock = null;

        //try to create mock that keeps prototype chain intact
        try {
            mock = Y.Object(template);
        } catch (ex) {
            mock = {};
            Y.log("Couldn't create mock with prototype.", "warn", "Mock");
        }

        //create new versions of the methods so that they don't actually do anything
        Y.Object.each(template, function(name){
            if (Y.Lang.isFunction(template[name])){
                mock[name] = function(){
                    Y.Assert.fail("Method " + name + "() was called but was not expected to be.");
                };
            }
        });

        //return it
        return mock;
    };

    /**
     * Assigns an expectation to a mock object. This is used to create
     * methods and properties on the mock object that are monitored for
     * calls and changes, respectively.
     * @param {Object} mock The object to add the expectation to.
     * @param {Object} expectation An object defining the expectation. For
     *      a method, the keys "method" and "args" are required with
     *      an optional "returns" key available. For properties, the keys
     *      "property" and "value" are required.
     * @return {void}
     * @method expect
     * @static
     */
    Y.Mock.expect = function(mock /*:Object*/, expectation /*:Object*/){

        //make sure there's a place to store the expectations
        if (!mock.__expectations) {
            mock.__expectations = {};
        }

        //method expectation
        if (expectation.method){
            var name = expectation.method,
                args = expectation.args || expectation.arguments || [],
                result = expectation.returns,
                callCount = Y.Lang.isNumber(expectation.callCount) ? expectation.callCount : 1,
                error = expectation.error,
                run = expectation.run || function(){};

            //save expectations
            mock.__expectations[name] = expectation;
            expectation.callCount = callCount;
            expectation.actualCallCount = 0;

            //process arguments
            Y.Array.each(args, function(arg, i, array){
                if (!(array[i] instanceof Y.Mock.Value)){
                    array[i] = Y.Mock.Value(Y.Assert.areSame, [arg], "Argument " + i + " of " + name + "() is incorrect.");
                }
            });

            //if the method is expected to be called
            if (callCount > 0){
                mock[name] = function(){
                    try {
                        expectation.actualCallCount++;
                        Y.Assert.areEqual(args.length, arguments.length, "Method " + name + "() passed incorrect number of arguments.");
                        for (var i=0, len=args.length; i < len; i++){
                            //if (args[i]){
                                args[i].verify(arguments[i]);
                            //} else {
                            //    Y.Assert.fail("Argument " + i + " (" + arguments[i] + ") was not expected to be used.");
                            //}

                        }

                        run.apply(this, arguments);

                        if (error){
                            throw error;
                        }
                    } catch (ex){
                        //route through TestRunner for proper handling
                        Y.Test.Runner._handleError(ex);
                    }

                    return result;
                };
            } else {

                //method should fail if called when not expected
                mock[name] = function(){
                    try {
                        Y.Assert.fail("Method " + name + "() should not have been called.");
                    } catch (ex){
                        //route through TestRunner for proper handling
                        Y.Test.Runner._handleError(ex);
                    }
                };
            }
        } else if (expectation.property){
            //save expectations
            mock.__expectations[name] = expectation;
        }
    };

    /**
     * Verifies that all expectations of a mock object have been met and
     * throws an assertion error if not.
     * @param {Object} mock The object to verify..
     * @return {void}
     * @method verify
     * @static
     */
    Y.Mock.verify = function(mock /*:Object*/){
        try {
            Y.Object.each(mock.__expectations, function(expectation){
                if (expectation.method) {
                    Y.Assert.areEqual(expectation.callCount, expectation.actualCallCount, "Method " + expectation.method + "() wasn't called the expected number of times.");
                } else if (expectation.property){
                    Y.Assert.areEqual(expectation.value, mock[expectation.property], "Property " + expectation.property + " wasn't set to the correct value.");
                }
            });
        } catch (ex){
            //route through TestRunner for proper handling
            Y.Test.Runner._handleError(ex);
        }
    };

    /**
     * Defines a custom mock validator for a particular argument.
     * @param {Function} method The method to run on the argument. This should
     *      throw an assertion error if the value is invalid.
     * @param {Array} originalArgs The first few arguments to pass in
     *      to the method. The value to test and failure message are
     *      always the last two arguments passed into method.
     * @param {String} message The message to display if validation fails. If
     *      not specified, the default assertion error message is displayed.
     * @return {void}
     * @namespace Mock
     * @constructor Value
     * @static
     */
    Y.Mock.Value = function(method, originalArgs, message){
        if (Y.instanceOf(this, Y.Mock.Value)){
            this.verify = function(value){
                var args = [].concat(originalArgs || []);
                args.push(value);
                args.push(message);
                method.apply(null, args);
            };
        } else {
            return new Y.Mock.Value(method, originalArgs, message);
        }
    };

    /**
     * Mock argument validator that accepts any value as valid.
     * @namespace Mock.Value
     * @property Any
     * @type Function
     * @static
     */
    Y.Mock.Value.Any        = Y.Mock.Value(function(){});

    /**
     * Mock argument validator that accepts only Boolean values as valid.
     * @namespace Mock.Value
     * @property Boolean
     * @type Function
     * @static
     */
    Y.Mock.Value.Boolean    = Y.Mock.Value(Y.Assert.isBoolean);

    /**
     * Mock argument validator that accepts only numeric values as valid.
     * @namespace Mock.Value
     * @property Number
     * @type Function
     * @static
     */
    Y.Mock.Value.Number     = Y.Mock.Value(Y.Assert.isNumber);

    /**
     * Mock argument validator that accepts only String values as valid.
     * @namespace Mock.Value
     * @property String
     * @type Function
     * @static
     */
    Y.Mock.Value.String     = Y.Mock.Value(Y.Assert.isString);

    /**
     * Mock argument validator that accepts only non-null objects values as valid.
     * @namespace Mock.Value
     * @property Object
     * @type Function
     * @static
     */
    Y.Mock.Value.Object     = Y.Mock.Value(Y.Assert.isObject);

    /**
     * Mock argument validator that accepts onlyfunctions as valid.
     * @namespace Mock.Value
     * @property Function
     * @type Function
     * @static
     */
    Y.Mock.Value.Function   = Y.Mock.Value(Y.Assert.isFunction);
/*Stub for future compatibility*/
if (typeof YUITest == "undefined" || !YUITest) {
    YUITest = {
        TestRunner: Y.Test.Runner,
        ResultsFormat: Y.Test.Format,
        CoverageFormat: Y.Coverage.Format
    };
}


}, '3.3.0' ,{requires:['substitute','event-base','json-stringify']});