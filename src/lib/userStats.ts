import { supabase } from './supabaseClient'

export interface UserStatsBreakdown {
  reviewLikes: number;
  commentLikes: number;
}

export interface UserStats {
  reviewsPosted: number;
  photosPosted: number;
  helpfulReceived: number;
  breakdown: UserStatsBreakdown;
}

const EMPTY_STATS: UserStats = {
  reviewsPosted: 0,
  photosPosted: 0,
  helpfulReceived: 0,
  breakdown: {
    reviewLikes: 0,
    commentLikes: 0,
  },
}

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  ensureClient()
  if (!userId) {
    throw new Error('Missing user id')
  }

  const [reviewsSel, photosSel, reviewsIdsSel] = await Promise.all([
    supabase!.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase!
      .from('review_images')
      .select('id, reviews!inner(user_id)', { count: 'exact', head: true })
      .eq('reviews.user_id', userId),
    supabase!.from('reviews').select('id').eq('user_id', userId),
  ])

  const reviewCount = reviewsSel.count ?? 0
  const photoCount = photosSel.count ?? 0
  const reviewIds = (reviewsIdsSel.data as { id: string }[] | null)?.map((r) => r.id) ?? []

  let reviewLikesCount = 0
  if (reviewIds.length > 0) {
    const { count } = await supabase!
      .from('review_likes')
      .select('review_id', { count: 'exact', head: true })
      .in('review_id', reviewIds)
    reviewLikesCount = count ?? 0
  }

  const { count: commentLikesCount } = await supabase!
    .from('review_comment_likes')
    .select('comment_id, review_comments!inner(user_id)', { count: 'exact', head: true })
    .eq('review_comments.user_id', userId)

  const helpfulTotal = (reviewLikesCount ?? 0) + (commentLikesCount ?? 0)

  return {
    reviewsPosted: reviewCount ?? 0,
    photosPosted: photoCount ?? 0,
    helpfulReceived: helpfulTotal,
    breakdown: {
      reviewLikes: reviewLikesCount ?? 0,
      commentLikes: commentLikesCount ?? 0,
    },
  }
}

export async function getMyStats(): Promise<UserStats> {
  ensureClient()
  const { data, error } = await supabase!.auth.getUser()
  if (error) throw error
  if (!data?.user) throw new Error('Not signed in')
  return getUserStats(data.user.id)
}

export function getEmptyStats(): UserStats {
  if (typeof structuredClone === 'function') {
    return structuredClone(EMPTY_STATS)
  }
  return JSON.parse(JSON.stringify(EMPTY_STATS))
}

