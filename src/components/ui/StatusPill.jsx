'use client';

import { C } from '@/src/theme/tokens.js';
import Badge from '@/src/components/ui/Badge.jsx';
import { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { upper } from '@/src/lib/format.js';

/**
 * A status pill coloured from the shared StatusEnum map. Extracted because more than
 * one viewer renders statuses now — and because an unmapped status should look the same
 * (violet) everywhere, so a new backend status case is visibly new rather than quietly
 * miscoloured in one table and not another.
 */
export default function StatusPill({ status }) {
  const color = STATUS_COLOR[status] || C.violet;

  return <Badge color={color} bg={color + '14'} dot>{upper(status)}</Badge>;
}
