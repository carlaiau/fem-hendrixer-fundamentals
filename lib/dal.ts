import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { issues, users } from '@/db/schema'
import { mockDelay } from './utils'
// Current user
export const getCurrentUser = cache(async () => {
  console.log('DAL getCurrentUser')
  await mockDelay(1000)

  const session = await getSession()
  if (!session) return null

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    return result[0] || null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
})

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getIssues() {
  'use cache'
  cacheTag('issues')
  await mockDelay(1000)
  try {
    const result = await db.query.issues.findMany({
      with: {
        user: true,
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })
    return result
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw new Error('Failed to fetch issues')
  }
}

export async function getIssue(id: number) {
  try {
    // Security check - ensure user is authenticated
    await mockDelay(700)
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Delete issue
    const foundIssue = await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        user: true,
      },
    })
    return foundIssue
  } catch (error) {
    console.error('Error finding issue:', error)
    return null
  }
}
