/* Hansa Timeline model — pure, testable mapping from the review payload.
 *
 * Classic-script UMD so the no-build prototype can load it from file:// and the
 * Node test runner can require it without a bundler. No DOM, no network.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HansaTimeline = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  function editionOrder(editions) {
    return new Map(
      [...editions]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((edition, index) => [edition.date, index + 1]),
    );
  }

  /**
   * Map timeline days + editions + resolved decks into the card view model.
   * The adapter never invents an edition: a day without a recorded edition is
   * an empty card even when a later edition exists.
   */
  function buildTimelineModel(data) {
    if (!data || !data.timeline || !Array.isArray(data.timeline.days)) {
      throw new Error("timeline-model: data.timeline.days is required");
    }
    const editions = new Map((data.editions || []).map((edition) => [edition.date, edition]));
    const order = editionOrder(data.editions || []);
    const latestDate = data.timeline.latestEditionDate;

    return data.timeline.days.map((day, index) => {
      const edition = editions.get(day.date) || null;
      const deck = (data.decks || {})[`daily:${day.date}`] || null;
      const cards = deck?.deck?.cards;
      const resolvedCount = Array.isArray(cards) ? cards.length : null;
      const cardCount = edition ? resolvedCount ?? (Number(day.cardCount) || 0) : 0;
      const deckStatus = deck?.status || (edition ? "missing" : "empty");
      const ready = deckStatus === "ready";
      const title = edition
        ? cardCount > 1
          ? edition.title
          : edition.cardTitle
        : "No edition";
      const status = edition
        ? `${plural(cardCount, "card", "cards")} · ${ready ? "technical review" : deckStatus === "missing" ? "deck missing" : "deck unresolved"}`
        : day.isToday
          ? "today · no edition"
          : "no edition";

      return {
        date: day.date,
        index,
        day: day.day,
        month: day.month,
        weekday: day.weekdayShort,
        isToday: Boolean(day.isToday),
        isLatest: day.date === latestDate,
        hasEdition: Boolean(edition),
        editionIndex: edition ? order.get(edition.date) ?? null : null,
        editionId: edition?.id ?? null,
        editionConceptId: edition?.conceptId ?? null,
        deckKey: `daily:${day.date}`,
        deckStatus,
        cardCount,
        title,
        status,
        ariaLabel: [
          day.weekday,
          `${day.day} ${day.month} ${day.date.slice(0, 4)}`,
          day.isToday ? "today in the prototype clock" : "",
          day.date === latestDate ? "latest edition" : "",
          edition ? `${plural(cardCount, "card", "cards")}, ${title}` : "no edition",
        ]
          .filter(Boolean)
          .join(", "),
      };
    });
  }

  /* Geometry ported from the pre-V3.1 Timeline, kept pure for tests. */
  function geometry(width) {
    const safeWidth = Math.max(320, Number(width) || 800);
    const cardWidth = Math.min(190, safeWidth * (safeWidth < 640 ? 0.58 : 0.36));
    const gap = clamp(cardWidth * 0.22, 40, 72);
    const sideScale = 0.72;
    const step = cardWidth * sideScale + gap;
    const near = (cardWidth * (1 + sideScale)) / 2 + gap;
    const cardHeight = safeWidth < 640 ? 196 : 212;
    return { cardWidth, cardHeight, gap, step, near, sideScale };
  }

  function cardX(offset, g) {
    const distance = Math.abs(offset);
    const value =
      distance <= 1 ? distance * g.near : g.near + (distance - 1) * g.step;
    return Math.sign(offset) * value;
  }

  function cardScale(offset) {
    return 1 - (1 - 0.72) * Math.min(Math.abs(offset), 1);
  }

  function positionAt(index, position, g) {
    const offset = index - position;
    return {
      offset,
      x: cardX(offset, g),
      scale: cardScale(offset),
      z: 100 - Math.round(Math.abs(offset) * 10),
      opacity: clamp(1 - 0.42 * Math.min(Math.abs(offset), 1), 0.32, 1),
    };
  }

  return { buildTimelineModel, geometry, cardX, cardScale, positionAt, editionOrder };
});
