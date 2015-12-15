/// <reference path="../services/overview.service.ts"/>
/// <reference path="../contracts/data.column.ts"/>

module gwi {
    interface Tree {
        root: Object,
        current: Array<Object>,
    }

    interface NodeScope extends ng.IScope {
        key: string,
        value: any,
    }

    interface PageScope extends ng.IScope {
        tree: Tree,
        rows: Array<Object>,
        columns: Array<Data.Column>,
        parentChosen: Boolean,
        chooseNode: Function,
        chooseParentNode: Function,
        removeColumn: Function,
        editColumn: Function,
        exportCode: Function,
        parentNodeChoices: Array<string>,
        getRowItem: Function,
        reset: Function
    }

    interface NodeClickEvent extends ng.IAngularEvent {
        target: HTMLScriptElement
    }

    interface PossibleNodeScope extends ng.IScope {
        key?: string
    }

    function isLeaf(value: any) {
        return !_.isArray(value) && !_.isObject(value);
    }

    function stringOf(value: any) {
        return "" + value;
    };

    function getRowItem(row, col) {
        return _.get(row, col);
    }

    export class MainController {
        $scope: PageScope;
        Overview: gwi.OverviewService;

        static $inject = ['$scope', 'gwi.OverviewService'];
        constructor($scope: PageScope, Overview: gwi.OverviewService) {
            this.$scope = $scope;
            this.Overview = Overview;

            this.setupScope();
        }

        setupScope() {
            this.Overview.importLatest();

            this.$scope.tree = this.Overview.tree;
            this.$scope.rows = [];
            this.$scope.columns = this.Overview.columns;
            this.$scope.parentChosen = false;

            this.$scope.parentNodeChoices = this.nodeChoices();
            this.$scope.chooseParentNode = this.chooseParentNode.bind(this);
            this.$scope.chooseNode = this.chooseNode.bind(this);
            this.$scope.removeColumn = this.removeColumn.bind(this);
            this.$scope.editColumn = this.editColumn.bind(this);
            this.$scope.exportCode = this.exportCode.bind(this);
            this.$scope.getRowItem = getRowItem;
            this.$scope.reset = this.reset.bind(this);

            // Scope listeners
            var processColumnSize = _.debounce(this.onColumnChange.bind(this), 30);
            this.$scope.$watchCollection('columns', processColumnSize);
            $(window).resize(processColumnSize);
            $('#table-scroller').scroll(processColumnSize);
        }

        onColumnChange() {
            var cols = $('#data-container tr:eq(0) td');
            $('#header-container').children().each(function(index) {
                $(this).width(function() {
                    return cols.eq(index).width() + (cols.length - 1 == index ? 0 : 1);
                });
            });
        }

        /**
         * Look through the tree for arrays.
         *
         * @return {array}
         */
        nodeChoices(tree?, root = "") {
            var map = (value: any, key: string) => {
                var name = root == "" ? key : root + '.' + key;

                if (_.isArray(value)) {
                    return name;
                }

                if (_.isObject(value) && value) {
                    return this.nodeChoices(value, name);
                }
            };

            tree = tree || this.Overview.root;
            if (_.isArray(tree)) {
                this.setCurrentRoot("");
                return [];
            }

            return _.flatten(_.filter(_.map(tree, map)));
        }

        chooseParentNode(i: number) {
            var name = this.$scope.parentNodeChoices[i];
            this.setCurrentRoot(name);
        }

        setCurrentRoot(name: string) {
            this.$scope.parentChosen = name != "";
            this.Overview.setCurrentRoot(name);

            this.$scope.rows = this.Overview.current;
        }

        chooseNode($event: NodeClickEvent) {
            var nodeScope = <NodeScope>angular.element($event.target).scope();
            if (!this.$scope.parentChosen || !nodeScope.$id || !isLeaf(nodeScope.value))
                return;

            var keys = [],
                currScope: PossibleNodeScope = nodeScope;

            // Figure out key by traversing up the Tree.
            while (currScope != this.$scope) {
                if (currScope.hasOwnProperty('key')) {
                    keys.unshift(currScope.key);
                }
                currScope = currScope.$parent;
            }

            // Remove the irrelevant keys
            keys.shift();

            var path = keys.join('.');
            if (path)
                this.Overview.addColumn(path);
        }

        removeColumn(key: number) {
            this.Overview.removeColumn(key);
        }

        editColumn(key: number) {
            this.Overview.editColumn(key);
        }

        exportCode() {
            this.Overview.exportCode();
        }

        reset() {
            this.setCurrentRoot("");
            this.$scope.parentChosen = false;
            this.Overview.resetColumns();
            this.$scope.parentNodeChoices = this.nodeChoices();
        }
    }

    app.controller('gwi.MainController', MainController);
}
