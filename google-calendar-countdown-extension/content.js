(() => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const ROW_CLASS = "gcd-countdown-row";
  const CONTEXT_SELECTOR = 'div[role="dialog"], div[role="main"]';

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
      if (context.querySelector('a[href*="eventedit"][href*="dates="], time[datetime]')) {
        contexts.add(context);
      }
    });

    document.querySelectorAll('a[href*="eventedit"][href*="dates="]').forEach((link) => {
      if (!isVisible(link)) {
        return;
      }

      const context = link.closest(CONTEXT_SELECTOR);
      if (context && isVisible(context)) {
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

  requestScan();
})();
