/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>

module gwi {
    function xpath(path: string): string {
        return path.replace(/\./g, '/');
    }

    interface Column {
        path: string,
        type: Data.Type,
    }

    interface PageScope extends ng.IScope {
        loading: boolean,
        code: string,
    }

    class ExportModalController {
        $scope: PageScope;
        Overview: OverviewService;
        DataType: DataTypeService;
        columns: Array<Column>;

        static $inject = ['$scope', 'gwi.OverviewService', 'gwi.DataTypeService'];
        constructor($scope: PageScope, Overview: OverviewService, DataType: DataTypeService) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.DataType = DataType;
            this.setupScope();
        }

        $applyDeferred() {
            _.defer(this.$scope.$apply.bind(this.$scope));
        }

        setupScope() {
            this.$scope.loading = true;
            this.$scope.code = "Loading...";
            setTimeout(this.loadCode.bind(this), 50);
        }

        colToType(column: Data.Column) {
            return column.name.split('.').pop() + "=" + column.type.grokitName;
            /* + " (" +
                (column.type.nullable ? 'nullable' : 'not nullable')
            + ")\n";*/
        }

        colToPath(column: Data.Column) {
            return "'/" + xpath(column.name) + "'";
        }

        loadCode() {
            this.Overview.getColsWithTypes()
                .then((columns: Array<Data.Column>) => {
                    var funcName = "Read" + this.Overview.fileType;
                    var rootPath = xpath(this.Overview.getPathToRows());
                    var colToType = this.colToType.bind(this);
                    var colToPath = this.colToPath.bind(this);
                    var args = [
                        "'<full path to data file>'",
                        'c(' + _.map(columns, colToType).join(',') + ')',
                        "'" + rootPath + "'",
                        'c(' + _.map(columns, colToPath).join(',') + ')',
                    ];
                    this.$scope.code = funcName + "(" + args.join(',') + ")";
                    this.$applyDeferred();
                });
        }
    }

    app.controller('gwi.ExportModalController', ExportModalController);
}
