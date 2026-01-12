import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the JSON data from the frontend
    const body = await request.json()
    
    console.log('Forwarding request to n8n webhook:', {
      url: 'https://n8n-xzythodg.ap-southeast-1.clawcloudrun.com/webhook-test/d27ef1ce-4b63-4b45-8a2e-06b178b31e18',
      dataKeys: Object.keys(body),
      dataType: Array.isArray(body.data) ? 'array' : typeof body.data
    })

    // Forward the request to n8n webhook
    const response = await fetch('https://n8n-xzythodg.ap-southeast-1.clawcloudrun.com/webhook-test/d27ef1ce-4b63-4b45-8a2e-06b178b31e18', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Proxy'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      })
      return NextResponse.json(
        { 
          error: 'n8n webhook failed', 
          status: response.status,
          message: errorText 
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('n8n webhook success:', result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
