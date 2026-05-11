function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Zen Focus')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getUserData() {
  const now = new Date();
  const tonight = new Date();
  tonight.setHours(23, 59, 59, 999);

  // 1. Get the NEXT Calendar Event
  let nextEvent = "Schedule clear.";
  try {
    const events = CalendarApp.getEvents(now, tonight);
    if (events.length > 0) {
      let e = events[0]; // Get the immediate next event
      let timeString = e.isAllDayEvent() ? 'All Day' : e.getStartTime().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      nextEvent = `${timeString} - ${e.getTitle()}`;
    }
  } catch(e) {
    nextEvent = "Calendar access needed.";
  }

  // 2. Get the TOP Task
  let topTask = "No tasks today.";
  try {
    const defaultTaskList = Tasks.Tasklists.list().getItems()[0];
    const tasks = Tasks.Tasks.list(defaultTaskList.getId(), {showHidden: false}).getItems();
    if (tasks) {
      let activeTasks = tasks.filter(t => t.status !== 'completed');
      if (activeTasks.length > 0) {
        topTask = activeTasks[0].title;
      }
    }
  } catch(e) {
    topTask = "Please add Tasks API in the Services menu (+)";
  }

  return { topTask: topTask, nextEvent: nextEvent };
}

function getUserStats() {
  const props = PropertiesService.getUserProperties();
  return {
    focusMinutesTotal: parseInt(props.getProperty('focusMinutesTotal')) || 0,
    sessionsTotal: parseInt(props.getProperty('sessionsTotal')) || 0,
    lastRelapseDate: props.getProperty('lastRelapseDate') || new Date('2026-05-09T00:00:00Z').toISOString()
  };
}

function saveUserStats(stats) {
  const props = PropertiesService.getUserProperties();
  if (stats.focusMinutesTotal !== undefined) props.setProperty('focusMinutesTotal', stats.focusMinutesTotal.toString());
  if (stats.sessionsTotal !== undefined) props.setProperty('sessionsTotal', stats.sessionsTotal.toString());
  if (stats.lastRelapseDate !== undefined) props.setProperty('lastRelapseDate', stats.lastRelapseDate);
  return true;
}