# Firestore Security Specification & Invariants

## 1. System Invariants
1. **Transaction Integrity**:
   - Only authenticated platform users can create or modify invoices and transaction records.
   - `amount` must be a positive number.
   - `customerName` and `invoiceId` must not exceed length limits and must not be empty.
   - Deleted records require verified admin privileges.
2. **User & Identity Security**:
   - Users can read all team directory members when authenticated.
   - Profile self-updates are restricted to personal data; users cannot elevate their own role to Owner without admin privileges.
   - User document IDs must match the user UID or be validated team member records.
3. **KPI & Analytics Aggregation**:
   - Read access is allowed for authenticated dashboard viewers.
   - Writes to system aggregates are restricted to authenticated operators.
4. **Notifications & Audits**:
   - Notifications can be marked as read by authenticated users.
   - Audits are immutable once written.

## 2. The Dirty Dozen Threat Payloads
1. **Ghost Field Poisoning**: Inserting `__admin: true` or `bypassed: true` into a transaction payload. (Rejected by schema check).
2. **Negative Amount Exploit**: Creating a transaction with `amount: -99999.00`. (Rejected by positive amount constraint).
3. **Huge ID Injection Attack**: Target ID > 128 characters junk string. (Rejected by `isValidId()`).
4. **Unauthenticated Read of Financial Records**: Anonymous / guest read without auth. (Rejected by `isSignedIn()`).
5. **PII Harvester**: Modifying another user's email or identity record. (Rejected by authorization check).
6. **Immutable Field Tampering**: Attempting to alter `createdAt` or original `createdBy` field during update. (Rejected by immutability check).
7. **Malformed Enum Injection**: Submitting status `status: 'HACKED'`. (Rejected by status enum check).
8. **Unbounded Payload Flood**: Submitting a 50KB string into `customerName`. (Rejected by `.size() <= 128`).
9. **Fake Email Invariant**: Registering with invalid email strings. (Rejected by string size/pattern constraints).
10. **State Skipping Attack**: Marking a rejected transaction directly as verified without proper audit. (Rejected by state rules).
11. **Client Claim Spoofing**: Supplying fake role tokens. (Rules check database or request.auth directly).
12. **Blanket Collection Deletion**: Attempting to delete `kpi_metrics` without admin authorization. (Rejected by delete guard).
