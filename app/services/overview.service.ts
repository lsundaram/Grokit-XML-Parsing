/// <reference path="../services/import.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>
/// <reference path="../contracts/data.column.ts"/>

module gwi {
    interface Modal {
        open: Function
    }

    class Tree {
        _root: Object;
        _curr: Array<Object>;
        rootPath: string;

        get current(): Array<Object> {
            return this._curr;
        }

        set root(tree: Object) {
            this._root = tree;
            this._curr = _.isArray(this._root) ? <Array<Object>>this._root : [];
            this.rootPath = "";
        }

        get root(): Object {
            return this._root;
        }

        constructor(_root: Object) {
            this._root = _root;
        }

        setCurrentRoot(name: string) {
            this.rootPath = name;
            this._curr = <Array<Object>>
                (name == "" ? this._root : _.get(this._root, name));
        }
    }

    export class OverviewService {
        static EmptyColumnTypeName = "Loading...";

        _tree: Tree;
        $q: ng.IQService;
        $scope: ng.IScope;
        $modal: Modal;
        $location: ng.ILocationService;
        Import: gwi.ImportService;
        DataType: gwi.DataTypeService;
        types: {
            [xpath: string]: Data.Type;
        };
        editing: Data.Column;
        columns: Array<Data.Column>;
        fileType: string;

        get root(): Object {
            return this._tree.root;
        }

        get current(): Array<Object> {
            return this._tree.current;
        }

        get tree(): Tree {
            return this._tree;
        }

        static $inject = ['$rootScope', '$uibModal', '$q', 'gwi.ImportService', 'gwi.DataTypeService', '$location'];
        constructor($scope: ng.IScope, $modal: Modal, $q: ng.IQService, Import: gwi.ImportService, DataType: gwi.DataTypeService, $location: ng.ILocationService) {
            this.$q = $q;
            this.$scope = $scope;
            this.$modal = $modal;
            this.$location = $location;
            this.Import = Import;
            this.DataType = DataType;
            this.editing = null;
            this.types = {};
            this.columns = [];
            this.importLatest();
        }

        importLatest() {
            this.fileType = this.Import.fileType;
            if (!this.fileType) {
                this.$location.path('/import');
            }
            this._tree = new Tree(this.Import.object);
        }

        setCurrentRoot(name: string) {
            this.tree.setCurrentRoot(name);
        }

        editColumn(key: number) {
            this.editing = this.columns[key];
            this.$modal.open({
                controller: 'gwi.ViewColumnModalController',
                templateUrl: 'views/edit-column.html',
            });
        }

        exportCode() {
            this.$modal.open({
                controller: 'gwi.ExportModalController',
                templateUrl: 'views/modal-export-code.html',
            });
        }

        resetColumns() {
            this.columns.splice(0, this.columns.length);
        }

        removeColumn(key: number) {
            this.columns.splice(key, 1);
        }

        findColumn(path: string) {
            return _.find(this.columns, function(column: Data.Column) {
                return column.name == path;
            });
        }

        addColumn(path: string) {
            if (this.findColumn(path))
                return;

            this.columns.push({
                name: path,
                type: new Data.Type(OverviewService.EmptyColumnTypeName, "Loading"),
            });
        }

        setColumnType(column: Data.Column, type: Data.Type) {
            _.extend(column.type, type);
        }

        allowedTypes(): Array<Data.Type> {
            return this.DataType.allowedTypes();
        }

        getColsWithTypes(): ng.IPromise<Array<Data.Column>> {
            var neededCols = _(this.columns).map((column: Data.Column) => {
                return column.type.name == OverviewService.EmptyColumnTypeName ? column.name : null;
            }).compact().value();

            return this.DataType.getTypes(this.current, neededCols)
                .then((types: Array<Data.Type>) => {
                    console.log('test2');
                    _.each(types, (type: Data.Type, key: number) => {
                        var column = this.findColumn(neededCols[key]);
                        this.setColumnType(column, type);
                    });
                    setTimeout(this.$scope.$apply.bind(this.$scope), 10);

                    return this.columns;
                });
        }

        typeBeingEdited(cb?: Function): Data.Type {
            var column = this.editing;

            if (column.type.name != OverviewService.EmptyColumnTypeName) {
                _.defer(cb);
                return column.type;
            }

            setTimeout(() => {
                var type = this.DataType.getTypes(this.current, [column.name])
                    .then((types: Array<Data.Type>) => {
                        this.setColumnType(column, types[0]);
                        cb();
                    });
            }, 50);

            return column.type;
        }

        getPathToRows(): string {
            return this.tree.rootPath;
        }
    }

    app.service('gwi.OverviewService', OverviewService);
}
