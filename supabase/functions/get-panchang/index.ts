import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tithi names (30 tithis in a lunar month)
const tithiNames = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

// Nakshatra names (27 nakshatras)
const nakshatraNames = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Yoga names (27 yogas)
const yogaNames = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

// Karana names (11 karanas, some repeat)
const karanaNames = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Vara (weekday) names
const varaNames = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];

// Hindu month names
const masaNames = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'
];

// Calculate Julian Day Number
function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Calculate Sun's longitude
function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180) +
            0.000289 * Math.sin(3 * M * Math.PI / 180);
  let sunLong = L0 + C;
  sunLong = sunLong % 360;
  if (sunLong < 0) sunLong += 360;
  return sunLong;
}

// Calculate Moon's longitude
function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
  
  let moonLong = Lp + 6.289 * Math.sin(Mp * Math.PI / 180);
  moonLong = moonLong % 360;
  if (moonLong < 0) moonLong += 360;
  return moonLong;
}

// Calculate sunrise/sunset times (approximate)
function getSunTimes(date: Date, latitude: number, longitude: number) {
  const jd = getJulianDay(date);
  const n = jd - 2451545.0 + 0.0008;
  const Jstar = n - longitude / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C = 1.9148 * Math.sin(M * Math.PI / 180) + 0.02 * Math.sin(2 * M * Math.PI / 180);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const delta = Math.asin(Math.sin(lambda * Math.PI / 180) * Math.sin(23.44 * Math.PI / 180)) * 180 / Math.PI;
  
  const cosH = (Math.sin(-0.833 * Math.PI / 180) - Math.sin(latitude * Math.PI / 180) * Math.sin(delta * Math.PI / 180)) /
               (Math.cos(latitude * Math.PI / 180) * Math.cos(delta * Math.PI / 180));
  
  if (cosH > 1 || cosH < -1) {
    return { sunrise: '6:00 AM', sunset: '6:00 PM' };
  }
  
  const H = Math.acos(cosH) * 180 / Math.PI;
  const Jrise = 2451545.0 + Jstar + ((-H - longitude) / 360) + 0.0008;
  const Jset = 2451545.0 + Jstar + ((H - longitude) / 360) + 0.0008;
  
  const sunriseHour = ((Jrise - jd) * 24 + 12 + longitude / 15) % 24;
  const sunsetHour = ((Jset - jd) * 24 + 12 + longitude / 15) % 24;
  
  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return {
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour)
  };
}

// Calculate Rahukaal
function getRahukaal(dayOfWeek: number, sunrise: string, sunset: string) {
  const rahukaalPeriods = [
    { start: 4.5, duration: 1.5 }, // Sunday
    { start: 1, duration: 1.5 },   // Monday
    { start: 3, duration: 1.5 },   // Tuesday
    { start: 5, duration: 1.5 },   // Wednesday
    { start: 4, duration: 1.5 },   // Thursday
    { start: 2, duration: 1.5 },   // Friday
    { start: 0, duration: 1.5 }    // Saturday
  ];
  
  const period = rahukaalPeriods[dayOfWeek];
  const sunriseHour = parseTimeToHours(sunrise);
  const startHour = sunriseHour + period.start;
  const endHour = startHour + period.duration;
  
  return `${formatHoursToTime(startHour)} - ${formatHoursToTime(endHour)}`;
}

function parseTimeToHours(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 6;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours + minutes / 60;
}

function formatHoursToTime(hours: number): string {
  const h = Math.floor(hours) % 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date: dateStr, latitude = 28.6139, longitude = 77.2090 } = await req.json();
    
    const date = dateStr ? new Date(dateStr) : new Date();
    const jd = getJulianDay(date);
    
    // Calculate astronomical positions
    const sunLong = getSunLongitude(jd);
    const moonLong = getMoonLongitude(jd);
    
    // Calculate tithi (lunar day)
    let tithiAngle = moonLong - sunLong;
    if (tithiAngle < 0) tithiAngle += 360;
    const tithiIndex = Math.floor(tithiAngle / 12);
    const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
    const tithiName = tithiNames[tithiIndex];
    
    // Calculate nakshatra
    const nakshatraIndex = Math.floor(moonLong / (360 / 27));
    const nakshatra = nakshatraNames[nakshatraIndex];
    
    // Calculate yoga
    const yogaAngle = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(yogaAngle / (360 / 27));
    const yoga = yogaNames[yogaIndex];
    
    // Calculate karana
    const karanaIndex = Math.floor((tithiAngle / 6) % 11);
    const karana = karanaNames[karanaIndex];
    
    // Get weekday
    const dayOfWeek = date.getDay();
    const vara = varaNames[dayOfWeek];
    
    // Get Hindu month (approximate)
    const masaIndex = Math.floor(sunLong / 30);
    const masa = masaNames[masaIndex];
    
    // Calculate sunrise/sunset
    const sunTimes = getSunTimes(date, latitude, longitude);
    
    // Calculate Rahukaal
    const rahukaal = getRahukaal(dayOfWeek, sunTimes.sunrise, sunTimes.sunset);
    
    // Calculate other periods
    const yamagandamPeriods = [3, 4.5, 3, 1.5, 0, 4.5, 1.5]; // Start hours after sunrise
    const gulikaPeriods = [6, 4.5, 3, 1.5, 0, 3, 4.5];
    
    const sunriseHour = parseTimeToHours(sunTimes.sunrise);
    const yamagandamStart = sunriseHour + yamagandamPeriods[dayOfWeek];
    const gulikaStart = sunriseHour + gulikaPeriods[dayOfWeek];
    
    // Calculate moonrise/moonset (approximate)
    const moonriseHour = (sunriseHour + (tithiIndex * 0.8)) % 24;
    const moonsetHour = (moonriseHour + 12) % 24;
    
    const panchang = {
      date: date.toISOString().split('T')[0],
      hinduDate: `${paksha} ${tithiName}, ${masa}`,
      tithi: {
        name: tithiName,
        paksha,
        endTime: formatHoursToTime(sunriseHour + 24 * (1 - (tithiAngle % 12) / 12))
      },
      nakshatra: {
        name: nakshatra,
        endTime: formatHoursToTime(sunriseHour + 24 * (1 - (moonLong % (360/27)) / (360/27)))
      },
      yoga: {
        name: yoga,
        endTime: formatHoursToTime(sunriseHour + 18)
      },
      karana: {
        name: karana
      },
      vara: vara,
      masa: masa,
      timings: {
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
        moonrise: formatHoursToTime(moonriseHour),
        moonset: formatHoursToTime(moonsetHour),
        rahukaal,
        yamagandam: `${formatHoursToTime(yamagandamStart)} - ${formatHoursToTime(yamagandamStart + 1.5)}`,
        gulika: `${formatHoursToTime(gulikaStart)} - ${formatHoursToTime(gulikaStart + 1.5)}`
      },
      auspicious: [
        tithiIndex === 10 || tithiIndex === 25 ? 'Ekadashi Vrat' : null,
        nakshatra === 'Pushya' || nakshatra === 'Rohini' || nakshatra === 'Ashwini' ? 'Auspicious for new beginnings' : null,
        dayOfWeek === 4 ? 'Guruvar - auspicious for learning' : null,
        dayOfWeek === 5 ? 'Shukravar - auspicious for Lakshmi puja' : null
      ].filter(Boolean),
      inauspicious: [
        'Avoid important work during Rahukaal',
        tithiIndex === 3 || tithiIndex === 18 ? 'Chaturthi - avoid travel' : null,
        tithiIndex === 8 || tithiIndex === 23 ? 'Ashtami - avoid auspicious ceremonies' : null
      ].filter(Boolean)
    };

    console.log('Panchang calculated for:', date.toISOString(), 'Location:', latitude, longitude);

    return new Response(JSON.stringify(panchang), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error calculating panchang:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});