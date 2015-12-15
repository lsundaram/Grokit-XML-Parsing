/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>

module gwi {
    interface PageScope extends ng.IScope {
        loading: boolean,
        types: Array<Data.Type>,
        type: Data.Type,
        selectedType: Data.Type,
        selectedTypeName: string,
    }

    class ViewColumnModalController {
        $scope: PageScope;
        Overview: OverviewService;

        static $inject = ['$scope', 'gwi.OverviewService'];
        constructor($scope: PageScope, Overview: OverviewService) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.setupScope();
        }

        $applyDeferred() {
            _.defer(this.$scope.$apply.bind(this.$scope));
        }

        setupScope() {
            this.$scope.loading = true;
            this.$scope.types = this.Overview.allowedTypes();
            this.$scope.selectedTypeName = null;
            this.$scope.$watch('selectedTypeName', (value: string) => {
                var type = _.find(this.$scope.types, 'name', value);
                var prev: Data.Type = <Data.Type>_.extend(new Data.Type("", ""), this.$scope.type);

                if (type && type.name != prev.name) {
                    _.extend(this.$scope.type, type);
                    this.$scope.type.nullable = prev.nullable;
                    this.$applyDeferred();
                }
            });
            this.$scope.$watch('type.name', (value: string) => {
                this.$scope.selectedTypeName = value;
                this.$applyDeferred();
            });
            this.$scope.type = this.Overview.typeBeingEdited(() => {
                this.$scope.loading = false;
                this.$applyDeferred();
            });
        }
    }

    app.controller('gwi.ViewColumnModalController', ViewColumnModalController);
}
