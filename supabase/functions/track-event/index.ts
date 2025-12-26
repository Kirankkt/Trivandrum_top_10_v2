// Supabase Edge Function: track-event
// Secure analytics endpoint with validation and rate limiting

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit: max requests per session per minute
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

// Valid event types and names (whitelist)
const VALID_EVENT_TYPES = ['page_view', 'interaction', 'search', 'locality_view']
const VALID_EVENT_NAMES = [
  'view_page', 'marker_clicked', 'card_clicked', 'search_performed',
  'filter_applied', 'locality_viewed', 'share_clicked', 'direction_clicked',
  'weight_adjusted', 'category_selected', 'map_interaction'
]

// Valid localities (prevent arbitrary data injection)
const VALID_LOCALITIES = [
  'Sreekaryam', 'Statue', 'Kazhakuttom', 'Enchakkal', 'Pattom',
  'Kesavadasapuram', 'PMG', 'Sasthamangalam', 'Jagathy', 'Vellayambalam',
  'Kowdiar', 'Peroorkada', 'Ulloor', 'Vazhuthacaud', 'Medical College',
  'Kuravankonam', 'Ambalamukku', 'Poojapura', 'Kovalam', 'Varkala',
  'Technopark', 'Thampanoor', 'East Fort', 'Palayam'
]

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { type, data } = body

    // Validate request structure
    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing type or data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate session_id exists
    if (!data.session_id || typeof data.session_id !== 'string' || data.session_id.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid session_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check rate limit
    const rateLimitKey = `${data.session_id}:${type}`
    const { data: rateData, error: rateError } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('session_id', data.session_id)
      .eq('endpoint', type)
      .single()

    const now = new Date()

    if (rateData) {
      const windowStart = new Date(rateData.window_start)
      const windowElapsed = now.getTime() - windowStart.getTime()

      if (windowElapsed < RATE_LIMIT_WINDOW_MS) {
        // Within rate limit window
        if (rateData.request_count >= RATE_LIMIT_MAX) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        // Increment counter
        await supabase
          .from('rate_limits')
          .update({ request_count: rateData.request_count + 1 })
          .eq('session_id', data.session_id)
          .eq('endpoint', type)
      } else {
        // Window expired, reset
        await supabase
          .from('rate_limits')
          .update({ request_count: 1, window_start: now.toISOString() })
          .eq('session_id', data.session_id)
          .eq('endpoint', type)
      }
    } else {
      // First request from this session
      await supabase
        .from('rate_limits')
        .insert({ session_id: data.session_id, endpoint: type, request_count: 1 })
    }

    // Handle different event types
    let result

    if (type === 'site_event') {
      // Validate event_type
      if (!VALID_EVENT_TYPES.includes(data.event_type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid event_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate event_name (if provided)
      if (data.event_name && !VALID_EVENT_NAMES.includes(data.event_name)) {
        return new Response(
          JSON.stringify({ error: 'Invalid event_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Sanitize metadata (limit size)
      let sanitizedMetadata = null
      if (data.metadata) {
        const metadataStr = JSON.stringify(data.metadata)
        if (metadataStr.length > 2000) {
          return new Response(
            JSON.stringify({ error: 'Metadata too large' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        sanitizedMetadata = data.metadata
      }

      // Insert into site_events
      const { error } = await supabase
        .from('site_events')
        .insert({
          event_type: data.event_type,
          event_name: data.event_name || 'unknown',
          page_path: data.page_path?.substring(0, 200) || null,
          session_id: data.session_id,
          metadata: sanitizedMetadata,
          user_agent: data.user_agent?.substring(0, 500) || null
        })

      if (error) throw error
      result = { success: true, type: 'site_event' }

    } else if (type === 'locality_view') {
      // Validate locality name
      if (!data.locality_name || !VALID_LOCALITIES.includes(data.locality_name)) {
        return new Response(
          JSON.stringify({ error: 'Invalid locality_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Insert into locality_views
      const { error } = await supabase
        .from('locality_views')
        .insert({
          locality_name: data.locality_name,
          session_id: data.session_id
        })

      if (error) throw error
      result = { success: true, type: 'locality_view' }

    } else {
      return new Response(
        JSON.stringify({ error: 'Unknown event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
