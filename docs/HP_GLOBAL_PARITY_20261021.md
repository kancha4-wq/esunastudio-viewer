# 66-language homepage catalogue parity
The Japanese catalogue shell and functions are shared by the 65 other locale introduction pages. Existing native introduction copy, country links and published 1.0.17 release notes are retained; the obsolete Japanese/English-only notice is removed.

A locale adapter reuses existing app/HP translations and adds 212 UI labels, notes and fragments per non-Japanese locale. Product titles, authors, publisher names, original source names and user input remain source data. The shared product catalogue, IDs, store links, publication dates, affiliate configuration, GA4 ID G-BPNR6MTZP3 and analytics.js are unchanged.

Validation: all 65 dictionaries have all 212 keys, no empty values or replacement characters. PC isolated Chrome checks the library, Narou/Kakuyomu 2025–2027 year/season controls, Kobo covers and links, Amazon source links, dynamic labels, accessible labels, RTL, widths 1440/768/390 and 200% text. Source and outgoing link preservation are checked. GA4 requests are blocked during tests.

Native-speaker proofreading, translation of book bodies, foreign purchasing eligibility and unsupported external images are not verified by these UI tests.

Deployment uses the existing combined-site Cloudflare Pages Direct Upload. Git push has no configured automatic deployment. Only the viewer subtree belongs to this repository; unrelated combined-site content is excluded. Local evidence and deployment IDs are recorded in the task handoff.

Production deployment: 77e79b8e-a04c-4646-a61f-281ad272aad0

Content commit: 5410555a06c3ab7836accd606d2fbd64e273f214

Public checks: 134 HTTP byte matches; Japanese plus six representative locales in PC Chrome; GA4 test sends zero. Full local checks cover all 65 changed locales. Native-speaker proofreading remains unperformed.
