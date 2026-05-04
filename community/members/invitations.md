# Invitations Ledger

Append-only audit trail of personal invitations. Rows are NEVER edited or deleted.

Lifecycle states tracked:
- `redeemed` — bot-appended automatically when invitee completes redemption.
- `revoked` — admin-appended manually (PR) to invalidate an unredeemed token.

Pending (minted-but-not-yet-redeemed) tokens are stateless and NOT in this ledger.
Expired tokens are not recorded; expiry is `Issued At + 7 days`.

| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |
|---|---|---|---|---|---|---|---|
