# Security

Report vulnerabilities privately to the repository owner rather than opening a public issue with exploit details.

LumiStage treats imported archives and model output as untrusted. Archive paths, sizes, expansion budgets, codecs, and collisions are validated before permanent uploads; detector IDs are validated against the active catalog; user writes use revision checks and per-record queues; permanent media deletion requires both zero saved references and confirmed LumiStage ownership.

Diagnostic exports intentionally omit chat transcript text and raw provider responses.

