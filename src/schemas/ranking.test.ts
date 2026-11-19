import { describe, expect, it } from 'vitest'

import rankingMe from '@/schemas/__fixtures__/ranking-me.json'
import schoolRanking from '@/schemas/__fixtures__/ranking-schools.json'
import ranking from '@/schemas/__fixtures__/ranking.json'
import schools from '@/schemas/__fixtures__/schools.json'
import {
  myRankSchema,
  publicSchoolsSchema,
  schoolRankingPageSchema,
  studentRankingPageSchema,
} from '@/schemas/ranking'

describe('ranking schemas', () => {
  it('parse the real payloads', () => {
    expect(studentRankingPageSchema.parse(ranking)).toEqual(ranking)
    expect(schoolRankingPageSchema.parse(schoolRanking)).toEqual(schoolRanking)
    expect(myRankSchema.parse(rankingMe)).toEqual(rankingMe)
    expect(publicSchoolsSchema.parse(schools)).toEqual(schools)
  })

  it('rejects a public row that still carries identity fields', () => {
    const leaky = { items: [{ ...ranking.items[0], username: 'hs_an' }], total: 1 }
    expect(studentRankingPageSchema.safeParse(leaky).success).toBe(false)
  })
})
