var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideObjectBrackets) {
        assert(
            disallowSpacesInsideObjectBrackets === true || disallowSpacesInsideObjectBrackets === 'all' ||
            disallowSpacesInsideObjectBrackets === 'nested',
            'disallowSpacesInsideObjectBrackets option requires "all"(true value) or "nested" string'
        );

        this._mode = disallowSpacesInsideObjectBrackets === true ? 'all' : disallowSpacesInsideObjectBrackets;
    },

    getOptionName: function() {
        return 'disallowSpacesInsideObjectBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();

            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);

            var brackets = {
                opening: tokens[openingBracketPos],
                closing: tokens[closingBracketPos]
            };

            var prevToken = tokens[closingBracketPos - 1];
            var nextToken = tokens[openingBracketPos + 1];

            if (mode === 'all') {
                check(brackets, errors, prevToken, nextToken);

            } else if (
                !(prevToken.type === 'Punctuator' && prevToken.value === '}')
            ) {
                check(brackets, errors, prevToken, nextToken);
            }

        });
    }
};

function check(brackets, errors, prevToken, nextToken) {
    if (brackets.opening.loc.start.line === nextToken.loc.start.line &&
        brackets.opening.range[1] !== nextToken.range[0]
    ) {
        errors.add('Illegal space after opening curly brace', brackets.opening.loc.end);
    }

    if (brackets.closing.loc.start.line === prevToken.loc.start.line &&
        brackets.closing.range[0] !== prevToken.range[1]
    ) {
        errors.add('Illegal space before closing curly brace', prevToken.loc.end);
    }
}
