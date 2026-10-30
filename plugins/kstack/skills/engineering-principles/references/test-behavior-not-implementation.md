# Test Behavior, Not Implementation

A test is a claim about what the code does for its users: a caller, an end user, or another service. Behavior is what those users can observe through the interface they use: return values, errors, state they can read back, and effects on systems outside the code, such as a request sent, a row written, or a message emitted. Implementation is what they cannot observe: private helpers, internal call order, intermediate data, and which internal collaborator did the work.

Judge each test against two imagined edits:

- **Break the behavior.** Make the code return a wrong value, skip an effect, or do the effect twice. If the test still passes, it proves nothing. Usual causes: an assertion looser than the contract, an expected value computed by the code under test, a restated constant that never runs the code that reads it, and an assertion on data the test built itself.
- **Change the internals.** Keep every observable result the same and restructure the code underneath. If the test now fails, it is pinned to the implementation; it will need a rewrite on every refactor and still catches no bug.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. To write one that does both, drive the code through its users' interface with a concrete input, derive the expected value from the requirement rather than from a run of the code, and assert what the contract promises, no less and no more.

The contract decides, not the shape of the assertion. When "an empty cart never charges" is the promise, asserting the payment client got no call is behavior; pair it with a case where the charge happens, so the test shows it can see a call. The payload a mocked external service receives is behavior, because that service observes it. A call to an internal helper is implementation. An empty list is the exact answer when no record matches, and a hollow check when the test only needs some result. An exact error message pins wording no caller reads; the error type callers branch on is the contract.

A test can pin an invariant instead of a call, such as a key that must exist in two tables or a compile-time type check. The invariant is the behavior.

Prefer no new test over a bad one: a test that mostly exercises mocks, encodes current implementation details, depends on timing or unrelated global state, or needs expensive infrastructure for a small fix.
