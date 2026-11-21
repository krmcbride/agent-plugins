# Test Behavior, Not Implementation

A test is a claim about what the code does for its users. Behavior is what those users can observe through the interface they use: return values, errors, state they can read back, and effects on systems outside the code. Implementation is what they cannot observe: private helpers, internal call order, and intermediate data.

Judge each test against two imagined edits:

- **Break the behavior.** Make the code return a wrong value, skip an effect, or do the effect twice. If the test still passes, it proves nothing. Usual causes: an assertion looser than the contract, an expected value computed by the code under test, and an assertion on data the test built itself.
- **Change the internals.** Keep every observable result the same and restructure the code underneath. If the test now fails, it is pinned to the implementation.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. To write one that does both, drive the code through its users' interface with a concrete input, and derive the expected value from the requirement.

When "an empty cart never charges" is the promise, asserting the payment client got no call is behavior; pair it with a case where the charge happens, so the test shows it can see a call. The payload a mocked external service receives is behavior, because that service observes it. A call to an internal helper is implementation. An exact error message pins wording no caller reads; the error type callers branch on is the contract.

Prefer no new test over a bad one: a test that mostly exercises mocks, encodes current implementation details, depends on timing or unrelated global state, or needs expensive infrastructure for a small fix.
