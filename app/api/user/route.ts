import { NextResponse, NextRequest } from 'next/server'

export const GET = (req: NextRequest) => {
  return NextResponse.json({
    message: 'Hello from the user route',
    time: new Date().toISOString(),
  })
}
