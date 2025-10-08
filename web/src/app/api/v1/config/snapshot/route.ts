export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'
import { createHash } from 'crypto'
import type { PoolClient } from 'pg'

type ThresholdsPoly = { a0?: number; a1?: number; a2?: number; a3?: number }

function stableStringify(value: unknown): string {
  const seen = new WeakSet()
  const helper = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v
    if (seen.has(v as object)) return null
    seen.add(v as object)
    if (Array.isArray(v)) {
      return (v as unknown[]).map(helper)
    }
    const obj = v as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj).sort()) {
      out[k] = helper(obj[k])
    }
    return out
  }
  return JSON.stringify(helper(value))
}

function sha256Hex(input: string): string { return createHash('sha256').update(input).digest('hex') }

export async function GET() {
  try {
    const payload = await withClient(async (c: PoolClient) => {
      // game_config keys
      const cfgKeys = [
        'coins_per_tap',
        'thresholds_poly',
        'ingest',
        'tap_agg',
        'level_bonus_policy',
        'ad_ttl_seconds',
        'claim_ttl_seconds',
      ]
      const cfgRes = await c.query('select key, value from game_config where key = any($1::text[])', [cfgKeys])
      const cfgMap = new Map<string, unknown>()
      for (const r of cfgRes.rows as Array<{ key: string; value: unknown }>) cfgMap.set(r.key as string, r.value)

      // Level reward templates: active only, pick latest per level
      const tplRes = await c.query(
        `select distinct on (level) level, payload, template_id, updated_at
         from level_reward_templates
         where active is true
         order by level, updated_at desc`
      )
      type TemplateRow = { level: number | string; payload: Record<string, unknown> }
      const levelRewardTemplates = ((tplRes.rows || []) as TemplateRow[])
        .map((r) => ({ level: Number(r.level || 0), payload: r.payload || {} }))
        .sort((a, b) => a.level - b.level)

      // Offer schedule: active only (free_trial or future partners)
      const schRes = await c.query(
        `select level, active, skip_base_reward, coalesce(partner_key,'free_trial') as partner_key, payload, task_id
         from level_offer_schedule
         where active is true`
      )
      type ScheduleRow = {
        level: number | string
        active: boolean | null
        skip_base_reward: boolean | null
        partner_key: string | null
        payload: Record<string, unknown> | null
        task_id: string | null
      }
      const levelOfferSchedule = ((schRes.rows || []) as ScheduleRow[])
        .map((r) => ({
          level: Number(r.level || 0),
          active: Boolean(r.active ?? true),
          skip_base_reward: Boolean(r.skip_base_reward ?? true),
          partner: String(r.partner_key || 'free_trial'),
          payload: (r.payload || {}) as Record<string, unknown>,
          taskId: r.task_id ? String(r.task_id) : undefined,
        }))
        .sort((a, b) => a.level - b.level)

      const coinsPerTap = Number((cfgMap.get('coins_per_tap') as unknown) ?? 1)
      const thresholdsPoly = (cfgMap.get('thresholds_poly') as ThresholdsPoly) || {}
      const ingest = (cfgMap.get('ingest') as Record<string, unknown>) || {}
      const tapAgg = (cfgMap.get('tap_agg') as Record<string, unknown>) || {}
      const levelBonusPolicy = (cfgMap.get('level_bonus_policy') as Record<string, unknown>) || {}
      const adTtlSeconds = Number((cfgMap.get('ad_ttl_seconds') as unknown) ?? 180)
      const claimTtlSeconds = Number((cfgMap.get('claim_ttl_seconds') as unknown) ?? 180)

      const base = {
        coinsPerTap,
        thresholdsPoly,
        levelRewardTemplates,
        levelOfferSchedule,
        ingest,
        tapAgg,
        policy: { levelBonus: levelBonusPolicy, ad_ttl_seconds: adTtlSeconds, claim_ttl_seconds: claimTtlSeconds },
      }
      const configVersion = sha256Hex(stableStringify(base))
      return { configVersion, ...base }
    })
    return NextResponse.json(payload)
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    try { console.error(JSON.stringify({ event: 'config_snapshot_error', msg })) } catch {}
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}


