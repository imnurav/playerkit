# @nurav/shared

Shared utilities shared across the KGS HLS Player monorepo. Currently provides a single time formatting utility.

## Public API

```ts
import { formatDuration } from "@nurav/shared";

formatDuration(0); // "0:00"
formatDuration(65); // "1:05"
formatDuration(3661); // "1:01:01"
formatDuration(-1); // "0:00"
formatDuration(Infinity); // "0:00"
```

## formatDuration

```ts
function formatDuration(seconds: number): string;
```

Formats a duration in seconds into a human-readable time string.

| Input          | Output      |
| -------------- | ----------- |
| 0              | `"0:00"`    |
| 59             | `"0:59"`    |
| 60             | `"1:00"`    |
| 90             | `"1:30"`    |
| 3600           | `"1:00:00"` |
| 3661           | `"1:01:01"` |
| negative       | `"0:00"`    |
| NaN / Infinity | `"0:00"`    |

Returns `"0:00"` for any non-finite or negative input.
