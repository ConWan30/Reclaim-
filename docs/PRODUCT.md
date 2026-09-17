# ReClaim Product Charter

## Mission
ReClaim is verified recycling infrastructure that lets people identify and pre-register recyclable containers, understand applicable incentives, and receive credit only after physical recovery is verified.

## Core invariant
A barcode scan is identification, not proof of recycling and not money.

The canonical lifecycle is:

`SCAN -> IDENTIFIED -> ELIGIBILITY_CHECKED -> PENDING -> PHYSICALLY_VERIFIED -> REWARDED`

Any failure or uncertainty remains pending, rejected, or requires review. The system never silently promotes an unverified claim.

## MVP
The first pilot targets glass beverage containers and is designed around Morehouse Parish, Louisiana. The MVP includes:

- mobile-first barcode scanning
- product/GTIN registry
- jurisdiction and incentive rules
- pending collection wallet
- collection manifests
- recycler/operator verification
- verified recovery receipts
- verified reward balance
- administrative pilot dashboard

## Deposit vs local incentive
Printed container deposit markings are metadata, not a promise that the marked amount is redeemable in the user's current jurisdiction. ReClaim must distinguish statutory deposit/refund value from private, municipal, sponsor-funded, or recycler-funded incentives.

## Evidence model
A scan can establish product identity with a stated confidence/source. A recovery event establishes physical acceptance. Rewards may only derive from a valid recovery event under an active incentive program.

## Fail-closed rules
1. No scan directly creates spendable value.
2. Unknown product, jurisdiction, program, or eligibility never defaults to eligible.
3. A printed deposit marking never establishes local entitlement by itself.
4. Recovery verification must be attributable to an authorized facility/operator or approved automated verifier.
5. Every reward must reference a verified recovery event and incentive rule.
6. Closed/redeemed claims cannot be rewarded twice.
7. Administrative overrides must be explicit and auditable.
8. Estimated/pending value must remain visually and semantically distinct from verified value.

## Initial domain objects
- `products`
- `jurisdictions`
- `deposit_markings`
- `incentive_programs`
- `facilities`
- `container_claims`
- `collection_manifests`
- `manifest_items`
- `recovery_events`
- `recovery_receipts`
- `reward_ledger`
- `audit_events`

## Pilot principle
Morehouse Parish is the launch environment, not a hard-coded jurisdiction. Jurisdiction and incentive policy must be data-driven so the platform can expand without rewriting the evidence model.

## Explicit non-goals for v1
- cryptocurrency or tokenization
- speculative environmental credits
- automatic payment based only on a barcode scan
- universal assertion that a printed 5-cent/10-cent marking is locally redeemable
- unsupported automated claims that physical recycling occurred
