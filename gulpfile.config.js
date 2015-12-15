var _ = require('lodash');

var GulpConfig = (function () {
    function gulpConfig() {
        var APP = './app';
        var LESS = './less';
        var PUBLIC = './public';
        var ASSETS = PUBLIC + '/assets';

        this.source = PUBLIC + '/';
        this.sourceApp = APP + '/';

        this.tsOutputPath = ASSETS;
        this.allJavaScript = [ASSETS + '/**/*.js'];
        this.allTypeScript = [
            APP + '/app.module.ts',
            APP + '/app.config.ts',
            APP + '/*.ts',
            APP + '/controllers/*.ts',
            APP + '/services/*.ts',
            APP + '/contracts/*.ts',
            APP + '/directives/*.ts'
        ];

        var comp = this.sourceApp + "components/";
        var mod = './node_modules/';

        this.JS = {
            vendor: [
                comp + 'jquery/dist/jquery.min.js',
                comp + 'bootstrap/js/bootstrap.min.js',
                comp + 'angular/angular.min.js',
                comp + 'angular-json-tree/build/angular-json-tree.min.js',
                comp + 'angular-bootstrap/ui-bootstrap.min.js',
                comp + 'angular-bootstrap/ui-bootstrap-tpls.min.js',
                comp + 'angular-route/angular-route.min.js',
                comp + 'angular-toastr/dist/angular-toastr.min.js',
                comp + 'angular-toastr/dist/angular-toastr.tpls.min.js',
                mod + 'js-yaml/dist/js-yaml.min.js',
                comp + 'lodash/lodash.min.js'
                //comp + 'xml2js/lib/xml2js.js'
            ]
        };

        var cssVendor = [
            comp + 'bootstrap/dist/css/bootstrap.min.css',
            comp + 'bootstrap/dist/css/bootstrap-theme.min.css',
            comp + 'angular-toastr/dist/angular-toastr.min.css',
            comp + 'angular-json-tree/build/angular-json-tree.css'
        ];
        this.CSS = {
            output: ASSETS,
            input: [
                LESS + '/main.less'
            ],
            watch: [LESS + '/*.less'].concat(cssVendor),
            main_file: 'style.css',
            vendor: cssVendor,
            vendor_file: 'vendor.css'
        };

        this.typings = './typings/';
        this.libraryTypeScriptDefinitions = './typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
