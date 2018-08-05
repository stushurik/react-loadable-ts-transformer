const ts = require('typescript');

module.exports = function(context, sf) {
    function visitor(node) {
        if (
            ts.isObjectLiteralExpression(node) &&
            node.parent.expression &&
            node.parent.expression.getText() === 'Loadable'
        ) {
            const moduleImportNode = findNode(node, n => {
                return (
                    n.getText().match('^import(.*)$') &&
                    n.parent.parent.getText().match('^loader')
                );
            });

            if (moduleImportNode) {
                const moduleName = moduleImportNode.arguments[0]
                    .getText()
                    .replace(/('|")/g, '');

                const modules = ts.createArrayLiteral([
                    ts.createStringLiteral(moduleName)
                ]);

                const weakModuleExpression = ts.createArrayLiteral([
                    ts.createAsExpression(
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createIdentifier('require'),
                                'resolveWeak'
                            ),
                            [],
                            [ts.createLiteral(moduleName)]
                        ),
                        ts.createKeywordTypeNode(134) // NumberKeyword
                    )
                ]);

                const webpack = ts.createArrowFunction(
                    [],
                    [],
                    [],
                    null,
                    null,
                    weakModuleExpression
                );

                return ts.createObjectLiteral([
                    ...node.properties,
                    ts.createPropertyAssignment('modules', modules),
                    ts.createPropertyAssignment('webpack', webpack)
                ]);
            }
        }

        return ts.visitEachChild(node, visitor, context);
    }
    return function(node) {
        return ts.visitNode(node, visitor);
    };
};

function findNode(node, predicate) {
    let result;
    function findNode(inspectedNode) {
        if (result) {
            return;
        }
        if (predicate(inspectedNode)) {
            result = inspectedNode;
            return;
        }
        ts.forEachChild(inspectedNode, findNode);
    }
    findNode(node);
    return result;
}
