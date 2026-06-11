# Invitations Ledger

Append-only audit trail of personal invitations. Rows are NEVER edited or deleted.

Lifecycle states tracked:
- `redeemed` — bot-appended automatically when invitee completes redemption.
- `revoked` — admin-appended manually (PR) to invalidate an unredeemed token.

Pending (minted-but-not-yet-redeemed) tokens are stateless and NOT in this ledger.
Expired tokens are not recorded; expiry is `Issued At + 7 days`.

| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |
|---|---|---|---|---|---|---|---|
| 9a7d92df-cc1b-4509-9fb4-46635701cdec | revoked |  |  |  |  |  | revoked by anton1rsod (admin revoke (meeting invite)) |
| 9904ad48-d43c-49e0-9b3c-6048a8d6823c | redeemed |  | @anton1rsod |  | 2026-06-11T18:16:46.388Z | @archimed3s |  |
