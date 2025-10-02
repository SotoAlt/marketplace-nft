# Security Notes - Console Log Cleanup

## Console Logs to Remove (Later)

The following console.log statements should be removed from production code:

### High Priority - Sensitive Information

1. **src/hooks/useNftDropContext.tsx:298**
   ```typescript
   console.log('DROP CONTRACT METADATA >>>', {
     claimConditions,
     activeClaimCondition,
   });
   ```
   - Exposes: Merkle roots, prices, supplies, timestamps
   - Risk: Reveals allowlist data and drop configuration

2. **src/components/token-page/BuyFromListingButton.tsx:69**
   ```typescript
   console.log(transaction);
   ```
   - Exposes: Transaction object, listing ID, buyer address
   - Risk: Reveals user wallet addresses

3. **src/components/drop-page/DropClaim.tsx:583**
   ```typescript
   console.log('claim conditions props', {
     claimConditions,
     phaseDeadlines,
     activeStartTs,
   });
   ```
   - Exposes: All claim conditions, deadlines
   - Risk: Reveals drop strategy

### Low Priority - UI State

4. **src/components/collection-page/AllNftsGrid.tsx:44**
   ```typescript
   console.log({ pages, currentPageIndex, length: pages.length });
   ```
   - Exposes: Pagination state only
   - Risk: Minimal

### Keep for Error Handling

5. **src/components/token-page/CreateListing.tsx:244**
   ```typescript
   console.error(err);
   ```
   - This is in a catch block for error handling
   - Should be kept or replaced with proper error logging

## Remediation

To fix these issues, create a branch and remove the console.log statements:

```bash
git checkout -b fix/remove-console-logs
# Remove the console.log lines from files 1-4
# Keep console.error in file 5
```

Note: While pricing/supply info is publicly announced, it's best practice to remove debug logs from production.