import { createThirdwebClient } from 'thirdweb';

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_ID as string,
});

export const NFT_PLACEHOLDER_IMAGE =
  'https://h9i7tclo5s.ufs.sh/f/2nNJfjqEWHsSR9kh1uJ1cj80RqQVbPyg7X2m5EAhUxDNYvru';
