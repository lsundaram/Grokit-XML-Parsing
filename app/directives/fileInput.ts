module gwi {
    app.directive("fileInput", [function () {
        return {
            scope: {
                fileInput: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileInput = changeEvent.target.files[0];
                        // or all selected files:
                        // scope.fileread = changeEvent.target.files;
                    });
                });
            }
        }
    }]);
}
