function getEventName(eventName, eventNameMapping) {
  if (eventNameMapping.hasOwnProperty(eventName)) {
    if (typeof eventNameMapping[eventName] === 'string') {
      return eventNameMapping[eventName];
    }
    if (eventNameMapping[eventName] instanceof Error) {
      throw eventNameMapping[eventName];
    }
    throw new Error('Event not supported: ' + eventName);
  }
  return eventName;
}

module.exports = getEventName;
