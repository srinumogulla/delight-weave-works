import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    const ASTROLOGY_API_USER_ID = Deno.env.get('ASTROLOGY_API_USER_ID');
    const ASTROLOGY_API_KEY = Deno.env.get('ASTROLOGY_API_KEY');

    if (!ASTROLOGY_API_USER_ID || !ASTROLOGY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Astrology API credentials not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = 'Basic ' + btoa(`${ASTROLOGY_API_USER_ID}:${ASTROLOGY_API_KEY}`);

    if (action === 'kundali') {
      const { date_of_birth, time_of_birth, birth_place_name, gender } = params;
      
      // Get coordinates for birth place
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(birth_place_name)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      const location = geoData.results?.[0];
      
      if (!location) {
        return new Response(
          JSON.stringify({ error: 'Could not find coordinates for birth place' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const [year, month, day] = date_of_birth.split('-').map(Number);
      const [hour, min] = time_of_birth.split(':').map(Number);

      const payload = {
        year, month, day,
        hour, min, lat: location.latitude, lon: location.longitude,
        tzone: location.timezone ? 5.5 : 5.5,
        gender: gender === 'female' ? 'female' : 'male',
      };

      // Try AstrologyAPI.com
      const res = await fetch('https://json.astrologyapi.com/v1/planets', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Astrology API error:', errText);
        return new Response(
          JSON.stringify({ error: `Astrology API error: ${res.status}` }),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'kundali-matching') {
      const { person_a, person_b } = params;

      const getCoords = async (place: string) => {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
        const d = await r.json();
        return d.results?.[0];
      };

      const [locA, locB] = await Promise.all([
        getCoords(person_a.birth_place_name),
        getCoords(person_b.birth_place_name),
      ]);

      const makePayload = (p: any, loc: any) => {
        const [year, month, day] = p.date_of_birth.split('-').map(Number);
        const [hour, min] = p.time_of_birth.split(':').map(Number);
        return { year, month, day, hour, min, lat: loc?.latitude || 20.5, lon: loc?.longitude || 78.9, tzone: 5.5, gender: p.gender };
      };

      const res = await fetch('https://json.astrologyapi.com/v1/match_making_report', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          m_details: makePayload(person_a, locA),
          f_details: makePayload(person_b, locB),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Astrology API matching error:', errText);
        return new Response(
          JSON.stringify({ error: `Astrology API error: ${res.status}` }),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Astrology function error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
