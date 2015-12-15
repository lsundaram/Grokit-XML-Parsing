module gwi {
    class Scroller {
        $scope: ng.IScope;
        i: number;
        element: any;
        rowHeight: number;
        limitedVarName: string;
        unlimitedVarName: string;

        constructor(element, $scope: ng.IScope, unlimitedVarName: string, limitedVarName: string, rowHeight: number) {
            this.i = 0;
            this.$scope = $scope;
            this.element = element;
            this.limitedVarName = limitedVarName;
            this.unlimitedVarName = unlimitedVarName;
            this.rowHeight = rowHeight;
        }

        data() {
            return this.$scope.$eval(this.unlimitedVarName);
        }

        recalculate() {
            var data = this.data();
            if (!_.isArray(data))
                return;

            var currPos = this.element[0].scrollTop;
            var countRows = data.length;
            var paddedRows = 15;
            var countRowsInViewPort = 30; // TODO
            var containerHeight = 0; // TODO
            var heightPerRow = this.rowHeight;
            var height = countRows * heightPerRow;
            var diffPadding = start;
            var start = countRows * currPos/height;
            start = Math.max(start - paddedRows, 0);
            diffPadding = (start - Math.floor(start)) * heightPerRow;
            start = Math.floor(start);
            var topPadding = Math.max(currPos - paddedRows * heightPerRow, 0)-diffPadding;
            var end = start + countRowsInViewPort + paddedRows;
            _.defer(() => {
                this.$scope[this.limitedVarName] = data.slice(start, end);
                this.element.children().eq(0).css({
                    'padding-top': topPadding + 'px',
                    'box-sizing': 'border-box',
                    'height':  height + 'px',
                });
                this.$scope.$apply();
            });
        }

        binding() {
            return _.debounce(this.recalculate.bind(this), 25, {
                leading: false,
                trailing: true,
                maxWait: 50,
            });
        }
    }

    function link($scope: ng.IScope, element, attrs) {
        var [limitedVarName, unlimitedVarName] = attrs.scrollLimit.split(' in ');
        var rowHeight = parseInt($scope.$eval(attrs.rowHeight));
        if (!limitedVarName
        ||  !unlimitedVarName
        ||  limitedVarName == unlimitedVarName
        ) {
            console.error("Invalid syntax for scroll-limit: expected '<newVarName> in <oldVarName>'");
        }
        if (!rowHeight || isNaN(rowHeight)) {
            console.error("Expected row-height=\"<pixel count>\" attribute on scroll-limit");
        }
        var scroller = new Scroller(element, $scope, unlimitedVarName, limitedVarName, rowHeight);
        var recalculate = scroller.binding();
        $scope.$watch(unlimitedVarName, recalculate);
        element.on('scroll', recalculate);
    }

    app.directive('scrollLimit', [function() {
        return {
            restrict: 'A',
            priority: 1001,
            link: link.bind(this),
            scope: true,
        };
    }]);
}
