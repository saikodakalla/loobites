import { supabase } from './supabaseClient'

const EMPTY_STATS = {
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

export async function getUserStats(userId) {
  ensureClient()
  if (!userId) {
    throw new Error('Missing user id')
  }

  const [{ count: reviewCount, error: reviewsError }, { count: photoCount, error: photosError }, { data: reviewIdsData, error: reviewsFetchError }] =
    await Promise.all([
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase
        .from('review_images')
        .select('id, reviews!inner(user_id)', { count: 'exact', head: true })
        .eq('reviews.user_id', userId),
      supabase.from('reviews').select('id').eq('user_id', userId),
    ])

  let reviewLikesCount = 0
  let reviewLikesError = null

  const reviewIds = reviewIdsData?.map((row) => row.id) ?? []
  if (reviewIds.length > 0) {
    const { count, error } = await supabase
      .from('review_likes')
      .select('review_id', { count: 'exact', head: true })
      .in('review_id', reviewIds)
    reviewLikesCount = count ?? 0
    reviewLikesError = error || null
  }

  const { count: commentLikesCount, error: commentLikesError } = await supabase
    .from('review_comment_likes')
    .select('comment_id, review_comments!inner(user_id)', { count: 'exact', head: true })
    .eq('review_comments.user_id', userId)

  const errors = [reviewsError, photosError, reviewsFetchError, reviewLikesError, commentLikesError].filter(Boolean)
  if (errors.length) {
    throw new Error(errors.map((err) => err.message || String(err)).join(' | '))
  }

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

export async function getMyStats() {
  ensureClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    throw error
  }
  if (!user) {
    throw new Error('Not signed in')
  }
  return getUserStats(user.id)
}

export function getEmptyStats() {
  if (typeof structuredClone === 'function') {
    return structuredClone(EMPTY_STATS)
  }
  return JSON.parse(JSON.stringify(EMPTY_STATS))
}
