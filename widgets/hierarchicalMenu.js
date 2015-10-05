var React = require('react');

var utils = require('../lib/utils.js');
var autoHide = require('../decorators/autoHide');
var bindProps = require('../decorators/bindProps');
var headerFooter = require('../decorators/headerFooter');
var RefinementList = autoHide(headerFooter(require('../components/RefinementList')));
var Template = require('../components/Template');

var hierarchicalCounter = 0;
var defaultTemplates = {
  header: '',
  item: '<a href="{{href}}">{{name}}</a> {{count}}',
  footer: ''
};

/**
 * Create a hierarchical menu using multiple attributes
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * You need to follow some conventions:
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {Number} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root]
 * @param  {String|String[]} [options.cssClasses.list]
 * @param  {String|String[]} [options.cssClasses.item]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template (root level only)
 * @param  {String|Function} [options.templates.item='<a href="{{href}}">{{name}}</a> {{count}}'] Item template, provided with `name`, `count`, `isRefined`, `path`
 * @param  {String|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function hierarchicalMenu({
    container = null,
    attributes = [],
    separator,
    limit = 100,
    sortBy = ['name:asc'],
    cssClasses = {
      root: null,
      list: null,
      item: null
    },
    hideWhenNoResults = true,
    templates = defaultTemplates,
    transformData
  }) {
  hierarchicalCounter++;

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: hierarchicalMenu({container, attributes, [separator, sortBy, limit, cssClasses.{root, list, item}, templates.{header, item, footer}, transformData]})';

  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  var hierarchicalFacetName = 'instantsearch.js-hierarchicalMenu' + hierarchicalCounter;

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes,
        separator
      }]
    }),
    render: function({results, helper, templatesConfig}) {
      var facetValues = getFacetValues(results, hierarchicalFacetName, sortBy);

      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      React.render(
        <RefinementList
          cssClasses={cssClasses}
          facetValues={facetValues}
          limit={limit}
          Template={bindProps(Template, templateProps)}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={facetValues.length > 0}
          facetNameKey="path"
          toggleRefinement={toggleRefinement.bind(null, helper, hierarchicalFacetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, facetName, facetValue) {
  helper
    .toggleRefinement(facetName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy) {
  var values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy});

  return values.data || [];
}

module.exports = hierarchicalMenu;