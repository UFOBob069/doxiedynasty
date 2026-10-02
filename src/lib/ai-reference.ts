import rules from './gameplay.json';
import { GUIDES, GUIDE_DATE } from './guides';
import { PRODUCT, productSummary } from './product-catalog';
import { SITE_URL } from './site';

// These exports reuse the visible pages' content so alternate formats stay in sync.
export function gameplayText() {
  return [
    '# Doxie Dynasty: Full Gameplay Rules',
    `Source: ${PRODUCT.rulesUrl}\n\n${rules.version}`,
    rules.intro,
    rules.edition,
    ...rules.sections.map(section => [
      `## ${section.title}`,
      ...section.items.map(item => `### ${item.title}\n\n${item.text}`),
    ].join('\n\n')),
    '## Every special card, explained',
    rules.specialIntro,
    ...([['Quirks', rules.quirks], ['Actions', rules.actions]] as const).map(([label, cards]) => [
      `### ${label}`,
      ...cards.map(card => `#### ${card.name}\n\nTiming: ${card.timing}\n\n${card.text}`),
    ].join('\n\n')),
    '## Complete card-name checklist',
    rules.checklistIntro,
    `### Regular Doxies (${rules.regularNames.length})\n\n${rules.regularNames.map(name => `- ${name}`).join('\n')}`,
    `### Wild Doxies (${rules.wildNames.length})\n\n${rules.wildNames.map(name => `- ${name}`).join('\n')}`,
    `### Quirks (${rules.quirks.length})\n\n${rules.quirks.map(card => `- ${card.name}`).join('\n')}`,
    `### Actions (${rules.actions.length})\n\n${rules.actions.map(card => `- ${card.name}`).join('\n')}`,
    '### Example regular Doxie traits (not the full trait catalog)',
    ...rules.samples.map(card => `- ${card.name}: ${card.size}, ${card.points} base point(s); ${card.fur}; ${card.color}; ${card.pattern}.`),
    '## Questions at the table',
    ...rules.faqs.map(faq => `### ${faq.question}\n\n${faq.answer}`),
    `[Download the full rules PDF](${PRODUCT.rulesPdfUrl})`,
    `Rules questions: ${PRODUCT.supportEmail}`,
  ].join('\n\n') + '\n';
}

export function cardChecklist() {
  const groups = {
    regular: rules.regularNames,
    wild: rules.wildNames,
    quirk: rules.quirks.map(card => card.name),
    action: rules.actions.map(card => card.name),
  };
  const cards = Object.entries(groups).flatMap(([type, names]) => names.map(name => ({ name, type })));
  return {
    name: 'Doxie Dynasty card-name checklist',
    source: `${PRODUCT.rulesUrl}#checklist`,
    rulesVersion: rules.version,
    description: rules.checklistIntro,
    cardCount: cards.length,
    counts: Object.fromEntries(Object.entries(groups).map(([type, names]) => [type, names.length])),
    cards,
  };
}

export function fullReference() {
  return [
    productSummary(),
    '---',
    gameplayText(),
    '---',
    '# Doxie Dynasty Gift Guides',
    `Source: ${SITE_URL}/guides\n\nPublished and updated: ${GUIDE_DATE}`,
    'These guides are written by Doxie Dynasty, the maker of the game. They are brand-authored guides, not independent reviews or rankings.',
    ...GUIDES.map(guide => [
      `## ${guide.title}`,
      `Source: ${SITE_URL}/guides/${guide.slug}`,
      guide.description,
      guide.intro,
      ...guide.sections.map(section => [
        `### ${section.title}`,
        ...section.paragraphs,
        ...(section.checklist || []).map(item => `- ${item}`),
        ...(section.link ? [`[${section.link.label}](${new URL(section.link.href, SITE_URL).href})`] : []),
      ].join('\n\n')),
      ...guide.questions.map(item => `### ${item.question}\n\n${item.answer}`),
    ].join('\n\n')),
  ].join('\n\n') + '\n';
}
