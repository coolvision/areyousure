// Generated by CoffeeScript 1.9.3
(function() {
  var DEFAULT_SITES, cooldown, filter, listen, listener, msgListener, reload, storage, unlisten;

  DEFAULT_SITES = [
    {
      hostSuffix: "reddit.com"
    }, {
      hostSuffix: "news.ycombinator.com"
    }, {
      hostSuffix: "facebook.com"
    }, {
      hostSuffix: "twitter.com"
    }
  ];

  storage = chrome.storage.sync;

  filter = {
    url: DEFAULT_SITES
  };

  cooldown = 5;

  listener = function(ev) {
    if (ev.frameId > 0) {
      return;
    }
    chrome.tabs.insertCSS(ev.tabId, {
      file: "content.css",
      runAt: "document_start"
    });
    return chrome.tabs.executeScript(ev.tabId, {
      file: "content.js",
      runAt: "document_start"
    });
  };

  listen = function() {
    chrome.alarms.clearAll();
    chrome.webNavigation.onCommitted.addListener(listener, filter);
    return chrome.runtime.onMessage.addListener(msgListener);
  };

  unlisten = function() {
    chrome.webNavigation.onCommitted.removeListener(listener);
    return chrome.runtime.onMessage.removeListener(msgListener);
  };

  msgListener = function(msg) {
    if (msg !== "clicked") {
      return;
    }
    unlisten();
    return chrome.alarms.create({
      delayInMinutes: cooldown
    });
  };

  reload = function() {
    return storage.get(['sites', 'cooldown'], function(result) {
      if (!result) {
        return;
      }
      if (Array.isArray(result.sites)) {
        filter = {
          url: result.sites
        };
      }
      if (result.cooldown) {
        cooldown = result.cooldown;
      }
      unlisten();
      return listen();
    });
  };

  storage.get(['sites', 'cooldown'], function(result) {
    if (!result) {
      return;
    }
    if (Array.isArray(result.sites)) {
      filter = {
        url: result.sites
      };
    } else {
      storage.set({
        sites: DEFAULT_SITES
      });
    }
    if (result.cooldown) {
      cooldown = result.cooldown;
    } else {
      storage.set({
        cooldown: 5
      });
    }
    return chrome.alarms.get(function(alarm) {
      if (!alarm) {
        return listen();
      }
    });
  });

  chrome.alarms.onAlarm.addListener(listen);

  chrome.storage.onChanged.addListener(reload);

}).call(this);
