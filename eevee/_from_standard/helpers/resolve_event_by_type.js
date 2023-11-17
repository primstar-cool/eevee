const cleanProperty = require('../helpers/clean_property.js');

module.exports = function resolveEventByType(
    node,
    type,
    prefix,
    postfix,
    eventNameMapping,
    onFoundEventHandlerFn
  ) {
    if (node.events && node.events[type]) {
      Object.keys(node.events[type]).forEach((eventName) => {
        if (onFoundEventHandlerFn) {
          onFoundEventHandlerFn(eventName);
        }
        let statement = node.events[type][eventName];
        if (typeof statement === 'object') {
          statement = mustache.serialize(statement);
        }
  
        if (!node.attrs) node.attrs = {};
        // if (node.tagName === 'tag-scroll-view') {
        //   node.attrs[
        //     `${prefix}${getEventName(eventName, eventNameMapping)}${postfix}.native`
        //   ] = statement;
        // } else 
        {
          node.attrs[
            `${prefix}${getEventName(eventName, eventNameMapping)}${postfix}`
          ] = statement;
        }
        delete node.events[type][eventName];
      });
    }
    cleanProperty(node.events, type);
  }