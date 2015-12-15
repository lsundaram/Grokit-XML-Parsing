/// <reference path="../services/import.service.ts"/>
/// <reference path="../contracts/import.target.ts"/>

module gwi {
    interface PageScope extends ng.IScope {
        file: Blob,
        pasted: string,
        encoding: string,
        filename: string,
        submitPasted: Function,
        loading: boolean,
    }

    interface FileReaderLoadEventTarget extends EventTarget {
        result: string,
    }

    interface FileReaderLoadEvent extends Event {
        target: FileReaderLoadEventTarget,
    }

    export class ImportController {
        $scope: PageScope;
        Import: gwi.ImportService;
        reader: FileReader;

        static $inject = ['$scope', 'gwi.ImportService'];
        constructor($scope: PageScope, Import: ImportService) {
            this.$scope = $scope;
            this.Import = Import;
            this.setupScope();
        }

        setupScope() {
            this.$scope.pasted = "";
            this.$scope.submitPasted = this.submitPasted.bind(this);
            this.$scope.file = null;
            this.$scope.$watch('file', (value) => {
                //this.$scope.encoding = this.$scope.encoding || 'UTF-8';
                if (!value) return;

                this.$scope.loading = true;
                this.Import.fromFile(value, () => {
                    this.$scope.loading = false;
                });
            });
        }

        submitPasted() {
            this.Import.view(<Import.Target>{
                result: this.$scope.pasted
            });
        }
    }

    app.controller('gwi.ImportController', ImportController);
}
