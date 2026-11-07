---
title: Inline backtick fence fixture
---

A line whose backtick fence info string contains a backtick is NOT a code
fence (CommonMark 0.30 §4.5); the backtick runs form an inline code span:

``` %history [-n] [range [range ...]] ```

The line after the span stays ordinary paragraph text, and a real fence still
opens and closes normally:

```ts
export const ok = true;
```
