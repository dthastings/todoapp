(() => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const ROW_CLASS = "gcd-countdown-row";
  const CONTEXT_SELECTOR = 'div[role="dialog"]';
  const RECENT_CLICK_WINDOW_MS = 10000;

  let lastClickedEvent = null;

  function normalizeToLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseCompactDate(value) {
    const compactDate = /^(\d{4})(\d{2})(\d{2})$/;
    const compactDateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/;

    let match = value.match(compactDate);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
    }

    match = value.match(compactDateTime);
    if (match) {
      const [, y, m, d, h, min, s, z] = match;
      if (z === "Z") {
        return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
      }
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
    }

    return null;
  }

  function parseCalendarDate(value) {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    if (/^\d{8}(T\d{6}Z?)?$/.test(trimmed)) {
      return parseCompactDate(trimmed);
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  function parseDateFromEditHref(href) {
    try {
      const url = new URL(href, window.location.origin);
      const dates = url.searchParams.get("dates");
      if (!dates) {
        return null;
      }

      const [start] = dates.split("/");
      return parseCalendarDate(start);
    } catch {
      return null;
    }
  }

  function parseDateFromText(value) {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  function parseNaturalDateCandidates(text) {
    if (!text) {
      return null;
    }

    const monthPattern =
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?/gi;
    const shortMonthPattern =
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{1,2}(?:,\s*\d{4})?/gi;

    const matches = [];
    const collect = (regex) => {
      let found;
      while ((found = regex.exec(text)) !== null) {
        matches.push(found[0]);
      }
    };

    collect(monthPattern);
    collect(shortMonthPattern);

    if (matches.length === 0) {
      return null;
    }

    const currentYear = new Date().getFullYear();
    for (const raw of matches) {
      const candidate = /\d{4}/.test(raw) ? raw : `${raw}, ${currentYear}`;
      const parsed = parseDateFromText(candidate);
      if (parsed) {
        return parsed;
      }
    }

    return null;
  }

  function parseDateFromAnyString(value) {
    if (!value) {
      return null;
    }

    return parseCalendarDate(value) || parseDateFromText(value);
  }

  function extractDateFromAttributes(element) {
    if (!element) {
      return null;
    }

    const candidates = [
      element.getAttribute("data-datekey"),
      element.getAttribute("data-date"),
      element.getAttribute("data-day"),
      element.getAttribute("data-start-date"),
      element.getAttribute("datetime"),
      element.getAttribute("aria-label"),
      element.getAttribute("title")
    ].filter(Boolean);

    for (const value of candidates) {
      const direct = parseDateFromAnyString(value);
      if (direct) {
        return direct;
      }

      const compactMatch = value.match(/\b\d{8}(T\d{6}Z?)?\b/);
      if (compactMatch) {
        const compact = parseCalendarDate(compactMatch[0]);
        if (compact) {
          return compact;
        }
      }

      const dashedMatch = value.match(/\b\d{4}-\d{2}-\d{2}\b/);
      if (dashedMatch) {
        const dashed = parseCalendarDate(dashedMatch[0]);
        if (dashed) {
          return dashed;
        }
      }
    }

    return null;
  }

  function extractDateFromTextContent(element) {
    if (!element) {
      return null;
    }

    const texts = [
      element.getAttribute?.("aria-label"),
      element.getAttribute?.("title"),
      element.textContent
    ].filter(Boolean);

    for (const text of texts) {
      const direct = parseNaturalDateCandidates(text);
      if (direct) {
        return direct;
      }
    }

    return null;
  }

  function isVisible(node) {
    if (!(node instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      return false;
    }

    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function extractStartDate(container) {
    const editLinks = Array.from(container.querySelectorAll('a[href*="eventedit"][href*="dates="]'))
      .filter((link) => isVisible(link));

    for (const link of editLinks) {
      const fromHref = parseDateFromEditHref(link.getAttribute("href") || "");
      if (fromHref) {
        return fromHref;
      }
    }

    const dates = Array.from(container.querySelectorAll("time[datetime]"))
      .map((node) => parseCalendarDate(node.getAttribute("datetime")))
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      return dates[0];
    }

    const contextualDate = extractDateFromAttributes(container);
    if (contextualDate) {
      return contextualDate;
    }

    const textDate = extractDateFromTextContent(container);
    if (textDate) {
      return textDate;
    }

    if (lastClickedEvent && Date.now() - lastClickedEvent.timestamp < RECENT_CLICK_WINDOW_MS) {
      return lastClickedEvent.date;
    }

    return null;
  }

  function findAnchorRow(container) {
    const timeNode = container.querySelector("time[datetime]");
    if (timeNode) {
      let node = timeNode;
      while (node && node.parentElement && node.parentElement !== container) {
        const parent = node.parentElement;
        if (parent.children.length > 1) {
          return parent;
        }
        node = parent;
      }
      return timeNode.parentElement || timeNode;
    }

    const link = Array.from(container.querySelectorAll('a[href*="eventedit"]')).find((el) => isVisible(el));
    if (link) {
      return link.parentElement || link;
    }

    const heading = container.querySelector('[role="heading"], h1, h2, h3');
    if (heading) {
      return heading.parentElement || heading;
    }

    return container.firstElementChild;
  }

  function formatCountdown(startDate) {
    const today = normalizeToLocalDay(new Date());
    const eventDay = normalizeToLocalDay(startDate);
    const dayDiff = Math.round((eventDay.getTime() - today.getTime()) / DAY_MS);

    if (dayDiff === 0) {
      return "Today";
    }

    const absolute = Math.abs(dayDiff);
    const suffix = absolute === 1 ? "day" : "days";

    return dayDiff > 0 ? `${absolute} ${suffix} until this event` : `${absolute} ${suffix} since this event`;
  }

  function createRow() {
    const row = document.createElement("div");
    row.className = ROW_CLASS;

    const icon = document.createElement("span");
    icon.className = "gcd-countdown-icon";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("div");
    label.className = "gcd-countdown-label";
    label.textContent = "Countdown: ";

    const value = document.createElement("span");
    value.className = "gcd-countdown-value";

    label.appendChild(value);
    row.appendChild(icon);
    row.appendChild(label);

    return row;
  }

  function upsertCountdown(container) {
    const startDate = extractStartDate(container);
    const existingRow = container.querySelector(`:scope > .${ROW_CLASS}, .${ROW_CLASS}`);

    if (!startDate) {
      if (existingRow) {
        existingRow.remove();
      }
      return;
    }

    const anchorRow = findAnchorRow(container);
    if (!anchorRow || !anchorRow.parentElement) {
      return;
    }

    const countdownText = formatCountdown(startDate);
    const row = existingRow || createRow();
    const valueNode = row.querySelector(".gcd-countdown-value");

    if (valueNode) {
      valueNode.textContent = countdownText;
    }

    if (!existingRow) {
      if (anchorRow.nextSibling) {
        anchorRow.parentElement.insertBefore(row, anchorRow.nextSibling);
      } else {
        anchorRow.parentElement.appendChild(row);
      }
    }
  }

  function collectContexts() {
    const contexts = new Set();

    document.querySelectorAll(CONTEXT_SELECTOR).forEach((context) => {
      if (!isVisible(context)) {
        return;
      }
      if (context.querySelector('[data-eventid], a[href*="eid="], a[href*="eventedit"], time[datetime]')) {
        contexts.add(context);
      }
    });

    return contexts;
  }

  function scanAndRender() {
    collectContexts().forEach((context) => {
      upsertCountdown(context);
    });
  }

  function captureEventClick(target) {
    const eventNode = target.closest('[data-eventid], [role="button"], a[href*="eid="], a[href*="eventedit"]');
    if (!eventNode) {
      return;
    }

    const searchNodes = [
      eventNode,
      eventNode.closest("[data-datekey]"),
      eventNode.closest("[data-date]"),
      eventNode.closest("[data-day]"),
      eventNode.closest("[role='gridcell']"),
      eventNode.parentElement
    ].filter(Boolean);

    for (const node of searchNodes) {
      const date = extractDateFromAttributes(node);
      if (date) {
        lastClickedEvent = { date, timestamp: Date.now() };
        return;
      }

      const textDate = extractDateFromTextContent(node);
      if (textDate) {
        lastClickedEvent = { date: textDate, timestamp: Date.now() };
        return;
      }
    }
  }

  let frameRequested = false;

  function requestScan() {
    if (frameRequested) {
      return;
    }

    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      scanAndRender();
    });
  }

  const observer = new MutationObserver(() => {
    requestScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["datetime", "href", "aria-label", "data-eventid"]
  });

  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      captureEventClick(event.target);
      requestScan();
    },
    true
  );

  requestScan();
})();
