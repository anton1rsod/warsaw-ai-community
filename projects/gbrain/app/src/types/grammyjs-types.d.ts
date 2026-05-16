// Ambient module shim for @grammyjs/types — the package.json declares
// `"types": "mod.d.ts"` but the .d.ts file is not included in the published
// tarball as of v3.26.0 (the package is Deno-targeted: its "prepare" script
// runs `deno task build`). With noImplicitAny=true, next build fails the type
// check on `import type { ReactionTypeEmoji } from "@grammyjs/types"` in
// src/telegram/client.ts.
//
// Minimal surface: only what we import. Remove this file once @grammyjs/types
// ships proper types again.
declare module "@grammyjs/types" {
  export type ReactionTypeEmoji = { type: "emoji"; emoji: string };
}
