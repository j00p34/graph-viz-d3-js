/**
 * Author: Marcin Stefaniuk
 * Date: 17.12.13 12:17
 */

define(['viz', 'parser/xdot'], function (viz, parser) {
  return {
    generate: function (dot) {
      var xdot = viz(dot, "xdot");
      var ast = parser.parse(xdot);
      return shapes(ast);
    }
  }

  function buildNodeVisitor(functions) {
    return function (node) {
      return functions[node.type].apply(null, arguments);
    };
  }

  function nop() {
  }

  function shapes(ast) {

    var result = [];

    function visitSubnodes(propertyName) {
      return function(node) {node[propertyName].forEach(visit)};
    }

    function startGroup(propertyName) {
      return function(node) {
        result.push({id: node.id, class: node.type, shapes: [], labels: []});
        node[propertyName].forEach(visit);
      };
    }

    function addToSection(section){
      return function(node) {
        var last = result[result.length-1];
        last[section] = last[section].concat(node.elements);
      }
    }

    var visit = buildNodeVisitor({
      digraph: startGroup('commands'),
      graph: visitSubnodes('attributes'),
      subgraph: startGroup('commands'),
      node: startGroup('attributes'),
      relation: startGroup('attributes'),
      draw: addToSection('shapes'),
      hdraw: addToSection('shapes'),
      ldraw: addToSection('labels'),
      skip: nop,
    });
    visit(ast);

    return result;
  };
})