/// <reference path="../contracts/import.target.ts"/>

module gwi {
    interface Toastr {
        warning: Function,
        success: Function,
        error: Function,
        info: Function
    }

    interface FileReaderLoadEventTarget extends EventTarget, Import.Target {}

    interface FileReaderLoadEvent extends Event {
        target: FileReaderLoadEventTarget
    }

    function parseXml(xml: string, arrayTags?: Array<string>) {
        var dom = null;
        if (window.hasOwnProperty("DOMParser")) {
            dom = (new DOMParser()).parseFromString(xml, "text/xml");
        }
        else if (window.hasOwnProperty("ActiveXObject")) {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) {
                throw dom.parseError.reason + " " + dom.parseError.srcText;
            }
        }
        else {
            throw "cannot parse xml string!";
        }

        function isArray(o) {
            return _.isArray(o);
        }

        function parseNode(xmlNode, result) {
            if (xmlNode.nodeName == "#text" && xmlNode.nodeValue.trim() == "") {
                return;
            }

            var jsonNode = xmlNode.nodeName == "#text" ? xmlNode.nodeValue.trim() : {};
            var existing = result[xmlNode.nodeName];
            if (existing) {
                if (!isArray(existing)) {
                    result[xmlNode.nodeName] = [existing, jsonNode];
                }
                else {
                    result[xmlNode.nodeName].push(jsonNode);
                }
            }
            else {
                if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
                    result[xmlNode.nodeName] = [jsonNode];
                }
                else {
                    result[xmlNode.nodeName] = jsonNode;
                }
            }

            if (xmlNode.attributes) {
                var length = xmlNode.attributes.length;
                for (var i = 0; i < length; i++) {
                    var attribute = xmlNode.attributes[i];
                    jsonNode[attribute.nodeName] = attribute.nodeValue;
                }
            }

            var length = xmlNode.childNodes.length;
            for (var i = 0; i < length; i++) {
                parseNode(xmlNode.childNodes[i], jsonNode);
            }
        }

        var result = {};
        if (dom.childNodes.length) {
            parseNode(dom.childNodes[0], result);
        }

        return result;
    }

    export class ImportService {
        static JSON = 1;
        static YAML = 2;
        static XML = 3;

        object: Object;
        toastr: Toastr;
        $scope: ng.IScope;
        $location: ng.ILocationService;
        reader: FileReader;
        cb: Function;
        fileType: string;

        static $inject = ['$location', '$rootScope', 'toastr'];
        constructor($location: ng.ILocationService, $rootScope: ng.IScope, toastr: Toastr) {
            this.$location = $location;
            this.$scope = $rootScope;
            this.toastr = toastr;
            this.object = {};
            this.fileType = "";

            this.setupReader();

            this.cb = () => { };
        }

        setupReader() {
            this.reader = new FileReader();
            this.reader.onload = (onLoadEvent: FileReaderLoadEvent) => {
                this.view(onLoadEvent.target);
                this.cb(onLoadEvent);
            };
        }

        /**
         * Transfer to the view object page with the given JS object.
         *
         * @param  {Object} obj
         *
         * @return {void}
         */
        viewObject(obj: Object) {
            if (!obj) return;

            this.object = obj;
            setTimeout(() => {
                this.$scope.$apply(() => {
                    this.$location.path('/');
                });
            }, 0);
        }

        /**
         * Convert a JSON string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws JSON Exception
         */
        getJson(target: Import.Target) {
            this.fileType = 'JSON';
            return JSON.parse(target.result);
        }

        /**
         * Convert an XML string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws XML Exception
         */
        getXml(target: Import.Target) {
            this.fileType = 'XML';
            return parseXml(target.result);
        }

        /**
         * Convert a YAML string to a JS object.
         *
         * @param  {Import.Target} target
         *
         * @return {Object}
         *
         * @throws YAML Exception
         */
        getYaml(target: Import.Target) {
            this.fileType = 'YAML';
            return jsyaml.load(target.result);
        }

        /**
         * Intelligently determine the type of the string given.
         *
         * @param  {Import.Target} target
         *
         * @return {int}
         */
        getType(target: Import.Target) {
            switch (target.result[0]) {
                case '{':
                case '[':
                    return ImportService.JSON;
                case '<':
                    return ImportService.XML;
                default:
                    return ImportService.YAML;
            }
        }

        view(target: Import.Target) {
            try {
                switch (this.getType(target)) {
                    case ImportService.YAML:
                        this.viewObject(this.getYaml(target));
                        break;

                    case ImportService.JSON:
                        this.viewObject(this.getJson(target));
                        break;

                    case ImportService.XML:
                        this.viewObject(this.getXml(target));
                        break;
                }
            } catch (e) {
                this.toastr.error("Parse Error: " + e);
            }
        }

        fromFile(file: Blob, cb?: Function) {
            this.reader.readAsText(file);
            this.cb = cb;
        }
    }

    app.service('gwi.ImportService', ImportService);
}
