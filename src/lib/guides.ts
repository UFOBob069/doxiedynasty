export type Guide = {
  slug: string;
  published: string;
  title: string;
  description: string;
  category: string;
  image: string;
  imageAlt: string;
  intro: string;
  sections: { id: string; title: string; paragraphs: string[]; checklist?: string[]; link?: { href: string; label: string } }[];
  questions: { question: string; answer: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: 'black-friday-dachshund-gifts',
    published: '2026-11-07',
    title: 'Black Friday Dachshund Gifts: How to Compare Two Offers',
    description: 'Shopping for a dachshund lover on Black Friday? Compare the edition, delivered price, arrival estimate, and return window before choosing a gift.',
    category: 'HOLIDAY SHOPPING',
    image: '/box-product-mockup.webp',
    imageAlt: 'Doxie Dynasty game box; older 84-card packaging pictured',
    intro: 'Say you have a $30 gift-exchange limit and two tabs open. One seller shows a lower price; the other includes shipping. Which dachshund gift actually fits the exchange? Start with the item in each cart, then compare what you will pay and what your recipient will open.',
    sections: [
      { id: 'same-gift', title: 'First, check that it is the same gift', paragraphs: [
        'With a portrait, one price might buy a digital file and another a framed print. With an ornament, the name and year on the sample might cost extra. Decide which version you actually want and select those options in both carts before comparing prices.',
        'With Doxie Dynasty, look for the playing-card count. The 90-card deck includes six Wild Doxies. The older 84-card edition plays without them. If the box photo and description disagree, ask the seller which edition ships. A lower price for a different edition is not a like-for-like comparison.'
      ], link: { href: '/gameplay#checklist', label: 'See which cards are in the 90-card deck' } },
      { id: 'compare-totals', title: 'Compare the price at your door', paragraphs: [
        'For example, a hypothetical $22 gift with $6 shipping costs $28 before tax. A $25 gift with shipping included costs $25 before tax. The second item has the higher sticker price but leaves more of that $30 budget for wrapping. These numbers illustrate the comparison; they are not advertised offers.',
        'When shopping on Amazon, use the price, seller, delivery estimate, and return terms shown for your address there. The Doxie Dynasty website has a separate direct offer. A term or promotion on one storefront does not automatically apply to the other.'
      ], link: { href: '/product#shipping-returns', label: 'Check the direct-store purchase and return details' } },
      { id: 'holiday-timing', title: 'Work backward from the gift exchange', paragraphs: [
        'Use the date you will hand over the present, not December 25 by default. For a mailed gift, allow time to receive it, wrap it, and send it on. For custom art, find out whether the delivery estimate starts when you order or after you approve a proof.'
      ], checklist: ['Write down the gift-exchange date and budget.', 'Compare checkout totals for the same edition or customization.', 'Check whether the return window will still be open when the gift is unwrapped.', 'Keep the order confirmation and request a gift receipt when available.'] }
    ],
    questions: [
      { question: 'Does Doxie Dynasty have a Black Friday discount?', answer: 'This guide does not announce a Black Friday deal or coupon. Check the seller listing and final checkout price for any current offer.' },
      { question: 'Should I wait until Cyber Monday to buy a dachshund gift?', answer: 'There is no promised lower price here. If an item meets your budget and you need time for personalization, wrapping, or a second shipment, compare that time with any savings you are hoping for.' }
    ]
  },
  {
    slug: 'christmas-gifts-for-dachshund-lovers',
    published: '2026-11-07',
    title: 'Christmas Gifts for Dachshund Lovers: Stockings, Keepsakes and Game Night',
    description: 'Choose a Christmas present for a dachshund owner: a first-Christmas keepsake, a Secret Santa stocking stuffer, or a card game to open and play together.',
    category: 'CHRISTMAS GIFT IDEAS',
    image: '/cards/olive.webp',
    imageAlt: 'Olive, one of the named dachshunds in the Doxie Dynasty deck',
    intro: 'Picture the moment they unwrap it. Will they hang something on the tree, laugh at a familiar face, or clear the table for a game? Here are three different Christmas presents for a dachshund lover, depending on which moment you want to give them.',
    sections: [
      { id: 'first-christmas', title: 'For their first Christmas together: a keepsake with a story', paragraphs: [
        'Choose a photo from the year they brought their dachshund home. Print it small, slip it into a frame or photo ornament, and write one sentence on the back about the day it was taken. A slightly crooked ear from a real family photo is more personal than a perfect silhouette.',
        'If you order an engraved ornament, check the spelling with someone in the household first. Ask whether they want the adoption year or this Christmas year: those can be different details, and only the owner knows which matters to them.'
      ], link: { href: '/guides/personalized-dachshund-gifts', label: 'Use the photo and spelling checklist' } },
      { id: 'secret-santa', title: 'For Secret Santa: a stocking stuffer that needs no measurements', paragraphs: [
        'Know the recipient loves dachshunds but not much else? A dachshund bookmark tucked into a paperback or a printed photo magnet can work without knowing their dog\'s collar size. For a coworker who travels light, a handwritten card with a favorite doxie snapshot takes up less space than another mug.',
        'For a literal stocking, measure the opening before choosing a boxed gift. A useful trick for a present too wide to fit: tuck a clue in the stocking and leave the wrapped box under the tree. Keep the total within the exchange limit, including any extras.'
      ] },
      { id: 'christmas-game', title: 'For the family table: give them the first game, too', paragraphs: [
        'Wrap Doxie Dynasty with a note that says, "I\'ll deal after dinner." The deck is for 2-6 players and a typical game takes 20-30 minutes. Read the rules before you wrap it so the recipient gets to open a present, not teach a roomful of guests.',
        'For the first hand, point out Bear, Stella, and Olive in the printed rules example: three Brindle Doxies make a set even though they do not look identical. A host who enjoys friendly competition gets a game they can bring back out after Christmas. For someone who would rather watch than play, choose the keepsake instead.'
      ], link: { href: '/downloads/doxie-dynasty-full-rules.pdf', label: 'Print the rules to tuck under the ribbon' } },
      { id: 'name-tag', title: 'Turn a name match into a gift tag', paragraphs: [
        'Look through the card checklist before you seal the box. If their dog is called Olive, for example, write "Someone you know is in this deck" on the tag and let them find the card. If the name is absent, sign the tag from their dog instead. The deck has fixed names and artwork; it is not made to order.'
      ], link: { href: '/gameplay#checklist', label: 'Look for their dachshund\'s name' } }
    ],
    questions: [
      { question: 'What is a last-minute Christmas present for a dachshund owner?', answer: 'Print a photo you already have permission to use and write down your memory of it. If you already own the game, an invitation to a game night is another gift you can give in person without depending on a shipment.' },
      { question: 'Is this a gift for the dog or the owner?', answer: 'These presents are for people. Doxie Dynasty is a tabletop card game, not a dog toy; the dachshund does not need to take part.' }
    ]
  },
  {
    slug: 'dachshund-gift-guide',
    published: '2026-10-02',
    title: 'Dachshund Gift Guide: Ideas for the Person Behind the Pup',
    description: 'Choose a dachshund gift by personality and occasion: shared games, personal keepsakes, useful everyday gifts, and a checklist before you buy.',
    category: 'GIFT IDEAS',
    image: '/box-product-mockup.webp',
    imageAlt: 'Doxie Dynasty card game box; older 84-card packaging pictured',
    intro: 'A dachshund on the front makes a gift on-theme. What makes it thoughtful is how well it fits the person receiving it. Start with what they enjoy doing, then choose the kind of doxie detail that will mean something to them.',
    sections: [
      { id: 'choose-the-recipient', title: 'Start with the person, not just the breed', paragraphs: [
        'Is this a gift for a dachshund owner, someone who loves the breed, or a friend who hosts game night? Those are three different briefs. An owner might appreciate something featuring their own dog; a breed enthusiast may prefer a playful design without a specific name; a host needs something people can enjoy together.',
        'Also decide whether you are buying for the person or the dog. This guide is about gifts for people. Dog clothing, food, and equipment introduce sizing and individual preferences that a surprise gift may not get right. A gift for the owner avoids those unknowns.'
      ] },
      { id: 'gift-types', title: 'Four directions for a dachshund gift', paragraphs: [
        'For someone who brings people together, choose an activity: a card game and an invitation to play. It gives the recipient a reason to open the present immediately, and the dachshund theme can be enjoyed by friends who do not own a dog.',
        'For a sentimental owner, consider a portrait, a printed photograph, or a keepsake carrying the dog\'s name. The personal detail is the point, so check the spelling and use a photo that actually looks like their dog. A generic dachshund illustration is a different kind of gift from a commissioned likeness.',
        'For someone who likes practical presents, think about an everyday object they already use: a notebook, tote, or mug. Match their habits and style before choosing the illustration. A subtle silhouette and a bright cartoon can suit very different people.',
        'For the person who has plenty of things, make the occasion the gift. Invite them for a dachshund-themed game night, print a favorite photo, and write a personal note. You do not need to fill a large basket to make a small present feel considered.'
      ] },
      { id: 'card-game', title: 'When Doxie Dynasty is a good fit', paragraphs: [
        'Doxie Dynasty is our physical set-collection card game for 2-6 players, with a typical playing time of 20-30 minutes. The 90-card deck includes regular Doxies, Wild Doxies, Quirks, and Actions. Players match fur type, color, or pattern while building a face-up collection.',
        'It suits someone who likes matching sets, table talk, and a little competition. Some special cards affect other players, so it is not a cooperative game or a quiet collection of dog portraits. For a recipient who dislikes competitive games, a keepsake may be a better match.',
        'No dachshund knowledge is needed to play: the printed traits determine matches. You can browse every card name before gifting, but this is a fixed deck, not a personalized product. A familiar name is a pleasant coincidence, not a promise that a particular dog is included.'
      ], link: { href: '/gameplay#checklist', label: 'Browse all 90 card names' } },
      { id: 'occasion', title: 'Match the presentation to the occasion', paragraphs: [
        'For a birthday, pair the present with a specific invitation: "Let\'s play this on Saturday." For a host gift, ask whether they would enjoy trying a round that evening. For a holiday exchange, check the price limit and whether the group would welcome a game rather than a decorative gift.',
        'A small card game can be part of a stocking-stuffer bundle, but check the actual package dimensions against the stocking or gift bag before ordering. For any fixed-date celebration, check the seller\'s delivery estimate at checkout; a general shipping estimate is not a guaranteed arrival date.'
      ] },
      { id: 'before-buying', title: 'A quick gift-buying checklist', paragraphs: ['Before you place the order, make sure the gift passes these checks:'], checklist: [
        'The recipient enjoys this kind of gift, not just dachshunds.',
        'Any name, photo, or coat detail is correct.',
        'The total, including shipping, fits your budget.',
        'The delivery estimate works for your occasion.',
        'You have checked the seller\'s return terms.',
        'For a game, the player count and style suit their household.'
      ], link: { href: '/product', label: 'Check Doxie Dynasty details, shipping, and returns' } }
    ],
    questions: [
      { question: 'What can I give a dachshund owner who already has everything?', answer: 'Consider a shared activity or a personal note with a favorite photo. If they enjoy competitive card games, Doxie Dynasty can be the centerpiece of an evening together rather than another display item.' },
      { question: 'Can someone who does not own a dachshund enjoy the game?', answer: 'Yes. Matching is based on the traits printed on the cards, not knowledge about dogs. Choose it based on their interest in set-collection games as well as the theme.' }
    ]
  },
  {
    slug: 'personalized-dachshund-gifts',
    published: '2026-10-02',
    title: 'Personalized Dachshund Gifts: What to Check Before Ordering',
    description: 'Plan a personal dachshund gift with a photo and spelling checklist, coat-detail tips, proofing questions, and ideas for adding a personal touch to a fixed-deck game.',
    category: 'THOUGHTFUL GIFTING',
    image: '/cards/stella.webp',
    imageAlt: 'Stella, one of the named Doxies in the fixed Doxie Dynasty deck',
    intro: 'The best part of a personalized gift is recognition: "That is my dog." A name alone may not be enough. A little preparation helps you choose between a custom portrait, a name-based keepsake, and a ready-made gift with a personal message.',
    sections: [
      { id: 'level-of-personalization', title: 'Decide what you want to personalize', paragraphs: [
        'Name-based gifts change the lettering on an existing design. A custom likeness changes the artwork to resemble an individual dog. A breed-themed gift celebrates dachshunds generally. All three can be thoughtful, but they are not interchangeable.',
        'Choose a name-based item when the wording matters most, a portrait when the dog\'s appearance is the focus, or a ready-made gift when you want something the recipient can use without a design approval process. Ask the seller exactly which parts of the design can change before paying for customization.'
      ] },
      { id: 'photo-brief', title: 'Make a small photo-and-name brief', paragraphs: [
        'For a portrait, start with a sharp photograph taken near the dog\'s eye level, with the face visible and the colors easy to see. Add a second photo if an important marking is hidden in the first. Avoid asking an artist to reconstruct the details from a dark or distant image.',
        'Write the exact name, capitalization, and any message in one place. Include the coat length, main colors, and a distinctive feature you want preserved. A long-haired red dachshund and a smooth black-and-tan dachshund should not become the same generic silhouette unless that is the style you deliberately chose.'
      ], checklist: ['Exact spelling of the dog\'s name or nickname.', 'A clear reference photo you have permission to share.', 'Any markings or features that matter to the owner.', 'The desired wording, with punctuation checked.', 'The final size and where the gift will be used.'] },
      { id: 'proof-and-timing', title: 'Ask about proofs, revisions, and timing', paragraphs: [
        'Before ordering, ask whether you will see a proof, how many revisions are included, and when you must approve the design. Confirm whether a change after approval costs extra. A digital preview should make the name and important details readable at the size of the finished gift.',
        'Separate production time from shipping time. A seller might need to create the artwork before the parcel can leave. For a birthday or holiday, work backward from the date you need the gift and leave room for the approval step.',
        'Read the specific cancellation and return terms for the item you choose. Do not assume that a customized product has the same return options as a standard product. Save the approved wording and design with your order details so both you and the seller have the same reference.'
      ] },
      { id: 'fixed-deck', title: 'Does Doxie Dynasty include their dog\'s name?', paragraphs: [
        'Doxie Dynasty has a published checklist of all 90 cards, including the named regular and Wild Doxies. You can look for a familiar name before choosing it as a gift. The artwork shown here is an example from that fixed deck, not a custom portrait service.',
        'The game is not personalized to order, and a name match does not mean the card represents the recipient\'s dog or shares its appearance. Check the name list rather than assuming a name is included. Even without a match, the breed theme can still be the right connection for someone who enjoys card games.'
      ], link: { href: '/gameplay#checklist', label: 'Look for a name in the complete card checklist' } },
      { id: 'personal-touch', title: 'Add a personal touch without changing the game', paragraphs: [
        'Keep the playing deck intact and add the personal detail outside it: a gift tag signed with the dog\'s nickname, a favorite printed photo, or an invitation to a first game night. You preserve the game\'s rules while making the present feel specific to the recipient.',
        'For example, pair the box with a note saying, "For our next game night, from the smallest member of the family." If you include a photo, place it in a separate envelope so it is not accidentally shuffled into the deck. A short, sincere message can do more than a long list of themed extras.'
      ], link: { href: '/guides/dachshund-gift-guide', label: 'Compare other dachshund gift ideas' } }
    ],
    questions: [
      { question: 'Can I order Doxie Dynasty with custom card names?', answer: 'Doxie Dynasty is a fixed-deck game, not a custom-name or custom-portrait product. Browse the checklist to see which names are included.' },
      { question: 'What should I check on a personalized gift proof?', answer: 'Check spelling, capitalization, the intended photo or likeness, important coat markings, and text legibility at the finished size. Confirm the final version before the seller begins production.' }
    ]
  },
  {
    slug: 'dog-lover-game-night',
    published: '2026-10-02',
    title: 'A Dog-Lover Game Night: A Simple Doxie Dynasty Plan',
    description: 'Host a dog-themed game night for 2-6 players with a Doxie Dynasty setup checklist, first-turn teaching plan, scoring example, and printable rules.',
    category: 'GAME NIGHT',
    image: '/cards/bear.webp',
    imageAlt: 'Bear, the Mini Brindle Doxie used in the scoring example',
    intro: 'A good themed game night needs a game people can get into, enough table space, and someone ready to explain the first turn. Here is a practical plan for introducing Doxie Dynasty, whether your guests are dachshund owners or simply enjoy a lively card game.',
    sections: [
      { id: 'plan-the-evening', title: 'Plan around your group', paragraphs: [
        'Doxie Dynasty plays with 2-6 people and a typical game lasts 20-30 minutes. Leave extra time before the first game to read the rules and answer questions. Think of the first round as the introduction, then let the group decide whether to play again.',
        'The game is competitive: you build your own face-up Dynasty, and some special cards disrupt other players. Tell guests that before you deal. If you have more than six people, use separate games with their own decks rather than stretching one game beyond its stated player count.'
      ] },
      { id: 'table-setup', title: 'Set out the table before guests sit down', paragraphs: [
        'Leave space in front of every player for individual Doxies and three-card sets. In the center, reserve three separate areas: the face-down draw deck, the face-up discard pile, and used special cards. That third area matters because resolved special cards cannot be picked up and used again.',
        'Have paper and a pencil ready for scoring, with the full rules available on a phone or printed beside the table. Keep drinks and snacks away from the cards. The theme is for the human players; do not add a real dog to the table as part of setup.'
      ], checklist: ['One complete playing deck, with reference cards set aside.', 'Space for each player\'s face-up cards.', 'Separate draw, discard, and used-special-card areas.', 'Paper and a pencil for final scores.', 'The full rules or downloaded PDF within reach.'], link: { href: '/downloads/doxie-dynasty-full-rules.pdf', label: 'Download the full rules PDF' } },
      { id: 'teach-a-turn', title: 'Teach one turn before explaining every special card', paragraphs: [
        'Shuffle the 90 playing cards, deal seven to each player, and turn the top remaining card face up to start the discard pile. The player to the dealer\'s left starts. If you have the older 84-card deck, follow the same rules without Wild Doxies.',
        'Explain the turn in order: draw one card from the deck or the top of the discard pile; play regular Doxies face up and resolve any special cards one at a time; discard one card to finish, unless your hand is empty. A regular Doxie can be played on its own. Players do not have to wait until they hold a full set.',
        'Next explain a set: exactly three Doxies sharing one printed fur type, color, or pattern. A completed set stays grouped and a card cannot score in two sets. Wilds fill one missing trait alongside two matching regular Doxies, with at most one Wild in a set. Refer to the full rules when a special card first appears.'
      ], link: { href: '/gameplay#your-turn', label: 'Read the full turn sequence and special-card timing' } },
      { id: 'scoring-example', title: 'Use one concrete scoring example', paragraphs: [
        'Bear, Stella, and Olive all have the Brindle pattern. Bear is a 1-point Mini; Stella and Olive are 2-point Standards. Their base points total five, and their complete set adds six more, for 11 points. That example shows both how to match and why a completed set matters.',
        'Only cards played face up score. Cards left in a hand are worth zero. A face-up regular Doxie outside a set still earns its base points. The separate Dynasty bonus adds five points once if your regular Doxies include Long Hair, Smooth, and Wire; those cards can also be in sets.',
        'Do not stop midway through a turn when the draw deck empties. Finish that turn, then score the final table, including applicable special-card bonuses. Use the full scoring reference for Royal Heir and other scoring cards rather than trying to remember their order from a brief introduction.'
      ], link: { href: '/gameplay#scoring', label: 'Keep the scoring reference handy' } },
      { id: 'make-it-an-occasion', title: 'Make the evening feel personal', paragraphs: [
        'Invite guests to bring a favorite photo of their dog, or compare the deck\'s names with the dogs everyone knows before the game begins. Keep those conversations separate from scoring: names and illustrations add character, but the printed traits determine sets.',
        'For a gift reveal, wrap the deck with a date for the first game night and a link to the rules. After the first round, ask whether the group wants a rematch or a different activity. The goal of hosting is a good evening, not a mandatory tournament.'
      ] }
    ],
    questions: [
      { question: 'Can two people play Doxie Dynasty?', answer: 'Yes. The game supports 2-6 players. Each player starts with seven cards, including in a two-player game.' },
      { question: 'Do guests need to know about dachshunds?', answer: 'No. Use the printed fur, color, and pattern labels to form sets. Dog knowledge and card names do not affect scoring.' },
      { question: 'Where are the complete rules?', answer: 'The How to Play page includes setup, turn order, all special-card rulings, scoring, and a downloadable PDF. It also explains how to play with the older 84-card deck.' }
    ]
  }
];
