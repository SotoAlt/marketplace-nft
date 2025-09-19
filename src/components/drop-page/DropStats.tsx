'use client';

import {
  Card,
  CardBody,
  Flex,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';

export function DropStats({
  totalClaimed,
  totalUnclaimed,
  isLoading,
  startsInSeconds,
  isDropReady,
  priceDisplay,
  currencySymbol,
}: {
  totalClaimed?: bigint;
  totalUnclaimed?: bigint;
  isLoading: boolean;
  startsInSeconds: number | null;
  isDropReady: boolean;
  priceDisplay: string;
  currencySymbol: string;
}) {
  const totalSupply =
    totalClaimed !== undefined && totalUnclaimed !== undefined
      ? totalClaimed + totalUnclaimed
      : undefined;

  return (
    <Card borderWidth="1px" variant="outline">
      <CardBody>
        <Flex direction={{ base: 'column', md: 'row' }} justifyContent="space-between" gap={6}>
          <Skeleton isLoaded={!isLoading} minW="160px">
            <Stat>
              <StatLabel>Total Minted</StatLabel>
              <StatNumber>
                {totalClaimed !== undefined ? totalClaimed.toString() : '-'}
                {totalSupply !== undefined ? ` / ${totalSupply.toString()}` : ''}
              </StatNumber>
            </Stat>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} minW="160px">
            <Stat>
              <StatLabel>Price</StatLabel>
              <StatNumber>
                {priceDisplay} {priceDisplay !== 'Free' ? currencySymbol : ''}
              </StatNumber>
            </Stat>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} minW="160px">
            <Stat>
              <StatLabel>Status</StatLabel>
              <StatNumber>{buildStatusLabel({ isDropReady, startsInSeconds })}</StatNumber>
            </Stat>
          </Skeleton>
        </Flex>
      </CardBody>
    </Card>
  );
}

function buildStatusLabel({
  isDropReady,
  startsInSeconds,
}: {
  isDropReady: boolean;
  startsInSeconds: number | null;
}) {
  if (isDropReady) {
    return 'Live';
  }
  if (startsInSeconds === null) {
    return 'Pending';
  }
  if (startsInSeconds <= 0) {
    return 'Live';
  }
  return `Starts in ${formatCountdown(startsInSeconds)}`;
}

function formatCountdown(seconds: number) {
  const clamped = Math.max(seconds, 0);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
