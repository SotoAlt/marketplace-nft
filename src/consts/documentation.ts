// Centralized lightweight documentation data for FAQs and the Listing guide.
// Keep texts short and user-friendly. Make updates here to change UI copy.

// Types for better DX when editing this file
export type FaqItem = {
  id: string; // unique id for anchors or keys
  question: string; // short, clear question
  answer: string; // concise answer in plain English
  category?: 'basics' | 'mint' | 'listing' | 'buying' | 'wallets' | 'fees' | 'troubleshooting';
  links?: { label: string; href: string }[]; // optional helpful links
};

// FAQs shown on Home (via Accordion). Add/remove items as needed.
// Tip for devs: prefer simple language; 1–3 sentences per answer.
export const FAQS: FaqItem[] = [
  {
    id: 'what-is-nft',
    category: 'basics',
    question: 'What is an NFT?',
    answer:
      'An NFT is a unique digital item you own on a blockchain (art, music, passes, etc.). It’s verifiable and tradable like any collectible.',
  },
  {
    id: 'how-to-mint',
    category: 'mint',
    question: 'How do I mint/claim an NFT?',
    answer:
      'Go to the Drops section, open a drop, connect your wallet, and click Claim/Mint. If the drop is live and not sold out, confirm the transaction in your wallet.',
    links: [{ label: 'Featured Drops', href: '/drop' }],
  },
  {
    id: 'view-owned',
    category: 'basics',
    question: 'Where can I see the NFTs I own?',
    answer:
      'Open your Profile (top-right). You will see your owned items there and in each collection’s “Owned” tab when connected.',
    links: [{ label: 'Your Profile', href: '/profile' }],
  },
  {
    id: 'how-to-list',
    category: 'listing',
    question: 'How do I list an NFT for sale?',
    answer:
      'Open the NFT page you own, click “List”, set price and currency, approve the marketplace if prompted, then confirm the listing transaction. See the in-app guide on collection pages.',
  },
  {
    id: 'what-is-listing',
    category: 'listing',
    question: 'What does “Listing” mean?',
    answer:
      'Listing means putting your NFT for sale at a chosen price and currency so other users can buy it on the marketplace.',
  },
  {
    id: 'need-gas',
    category: 'fees',
    question: 'Do I need tokens to use the app?',
    answer:
      'Yes. You need the network’s native token to pay gas fees (e.g., ETH on Ethereum). If you list in an ERC-20 currency, you will also need that token to set allowances.',
  },
  {
    id: 'approvals',
    category: 'listing',
    question: 'Why am I asked to “approve” before listing?',
    answer:
      'Approval lets the marketplace transfer your NFT only when a sale happens. It’s required once per collection and can be revoked later if needed.',
  },
  {
    id: 'buying',
    category: 'buying',
    question: 'How do I buy a listed NFT?',
    answer:
      'Open the item, click Buy on a listing. If using a token (not native), your wallet may ask to approve the token spend before the purchase.',
  },
  {
    id: 'insufficient-funds',
    category: 'troubleshooting',
    question: 'I get “insufficient funds for gas” – what should I do?',
    answer:
      'Add the network’s native token to your wallet for gas. For token-denominated listings, ensure you also hold enough of that token to cover the price.',
  },
];

// Listing guide: shown inside a Dialog/Modal on collection pages.
// Keep steps short. Focus on the specific flow used by this app.
export type ListingGuideStep = {
  title: string; // short step title
  details: string; // one or two lines of guidance
  tip?: string; // optional short tip
};

export const LISTING_GUIDE = {
  // Optional: short title and intro used by the dialog header/body
  title: 'How to Create a Listing',
  intro:
    'Follow these quick steps to list your NFT so others can buy it on this marketplace.',
  // Pre-requisites shown as bullets
  prerequisites: [
    'Connect your wallet on the top-right.',
    'Switch to the collection’s network if prompted.',
    'Have the network’s native token for gas fees.',
  ],
  // Steps rendered as a numbered list
  steps: [
    {
      title: 'Open the NFT page',
      details:
        'Navigate to the NFT you own (from Profile or the Collection). Ensure you are connected with the owner wallet.',
    },
    {
      title: 'Click “List”',
      details:
        'On the NFT page, use the List action. For ERC-1155, choose the quantity you want to sell.',
      tip: 'You can only list what you own. For ERC-721, quantity is always 1.',
    },
    {
      title: 'Set price and currency',
      details:
        'Enter a price and select currency (native or supported ERC-20). Prices are per item.',
      tip: 'Lower prices sell faster; check the current floor to stay competitive.',
    },
    {
      title: 'Approve marketplace (first time only)',
      details:
        'Your wallet will ask to approve the marketplace to transfer your NFT when sold. Confirm to continue.',
      tip: 'Approval is per collection and does not transfer ownership by itself.',
    },
    {
      title: 'Confirm the listing transaction',
      details:
        'Submit the listing transaction in your wallet. After confirmation, your NFT appears under Listings.',
    },
  ] as ListingGuideStep[],
  notes: [
    'To cancel a listing you created, open the NFT and use “Cancel” on your listing.',
    'If using a token currency, your wallet may ask for token approval before purchases.',
  ],
  // Developer note: Update links if routes change.
  links: [
    { label: 'Your Profile', href: '/profile' },
    { label: 'See Drops', href: '/drop' },
  ],
};

// Developer notes:
// - Keep content brief and focused on this app’s actual flow.
// - If you add a new route, surface it in links where helpful.
// - Prefer neutral terms: “mint/claim”, “list”, “buy” to reduce confusion.
// - When changing marketplace behavior, review approvals and token notes here.

