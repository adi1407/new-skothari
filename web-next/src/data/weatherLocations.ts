/** Preset coordinates for Open-Meteo (no API key). Labels are editorial, not third-party marks. */

export type WeatherLocation = {
  id: string;
  labelEn: string;
  labelHi: string;
  lat: number;
  lon: number;
  region: "india" | "world";
};

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  /* India — state/UT seats (representative coordinates) */
  { id: "in-ap", labelEn: "Amaravati (AP)", labelHi: "अमरावती (आंध्र)", lat: 16.5747, lon: 80.359, region: "india" },
  { id: "in-ar", labelEn: "Itanagar (Arunachal)", labelHi: "ईटानगर", lat: 27.0844, lon: 93.6053, region: "india" },
  { id: "in-as", labelEn: "Dispur (Assam)", labelHi: "दिसपुर", lat: 26.1433, lon: 91.7898, region: "india" },
  { id: "in-br", labelEn: "Patna (Bihar)", labelHi: "पटना", lat: 25.5941, lon: 85.1376, region: "india" },
  { id: "in-cg", labelEn: "Raipur (Chhattisgarh)", labelHi: "रायपुर", lat: 21.2514, lon: 81.6296, region: "india" },
  { id: "in-ga", labelEn: "Panaji (Goa)", labelHi: "पणजी", lat: 15.4989, lon: 73.8278, region: "india" },
  { id: "in-gj", labelEn: "Gandhinagar (Gujarat)", labelHi: "गांधीनगर", lat: 23.2156, lon: 72.6369, region: "india" },
  { id: "in-hr", labelEn: "Chandigarh (Haryana seat)", labelHi: "चंडीगढ़", lat: 30.7333, lon: 76.7794, region: "india" },
  { id: "in-hp", labelEn: "Shimla (HP)", labelHi: "शिमला", lat: 31.1048, lon: 77.1734, region: "india" },
  { id: "in-jh", labelEn: "Ranchi (Jharkhand)", labelHi: "रांची", lat: 23.3441, lon: 85.3096, region: "india" },
  { id: "in-ka", labelEn: "Bengaluru (Karnataka)", labelHi: "बेंगलुरु", lat: 12.9716, lon: 77.5946, region: "india" },
  { id: "in-kl", labelEn: "Thiruvananthapuram (Kerala)", labelHi: "तिरुवनंतपुरम", lat: 8.5241, lon: 76.9366, region: "india" },
  { id: "in-mp", labelEn: "Bhopal (MP)", labelHi: "भोपाल", lat: 23.2599, lon: 77.4126, region: "india" },
  { id: "in-mh", labelEn: "Mumbai (Maharashtra)", labelHi: "मुंबई", lat: 19.076, lon: 72.8777, region: "india" },
  { id: "in-mn", labelEn: "Imphal (Manipur)", labelHi: "इंफाल", lat: 24.817, lon: 93.9368, region: "india" },
  { id: "in-ml", labelEn: "Shillong (Meghalaya)", labelHi: "शिलांग", lat: 25.5788, lon: 91.8933, region: "india" },
  { id: "in-mz", labelEn: "Aizawl (Mizoram)", labelHi: "ऐज़ोल", lat: 23.7271, lon: 92.7176, region: "india" },
  { id: "in-nl", labelEn: "Kohima (Nagaland)", labelHi: "कोहिमा", lat: 25.6747, lon: 94.1086, region: "india" },
  { id: "in-or", labelEn: "Bhubaneswar (Odisha)", labelHi: "भुवनेश्वर", lat: 20.2961, lon: 85.8245, region: "india" },
  { id: "in-pb", labelEn: "Chandigarh (Punjab seat)", labelHi: "चंडीगढ़ (पंजाब)", lat: 30.7333, lon: 76.7794, region: "india" },
  { id: "in-rj", labelEn: "Jaipur (Rajasthan)", labelHi: "जयपुर", lat: 26.9124, lon: 75.7873, region: "india" },
  { id: "in-sk", labelEn: "Gangtok (Sikkim)", labelHi: "गंगटोक", lat: 27.3389, lon: 88.6065, region: "india" },
  { id: "in-tn", labelEn: "Chennai (Tamil Nadu)", labelHi: "चेन्नई", lat: 13.0827, lon: 80.2707, region: "india" },
  { id: "in-ts", labelEn: "Hyderabad (Telangana)", labelHi: "हैदराबाद", lat: 17.385, lon: 78.4867, region: "india" },
  { id: "in-tr", labelEn: "Agartala (Tripura)", labelHi: "अगरतला", lat: 23.8315, lon: 91.2868, region: "india" },
  { id: "in-up", labelEn: "Lucknow (UP)", labelHi: "लखनऊ", lat: 26.8467, lon: 80.9462, region: "india" },
  { id: "in-uk", labelEn: "Dehradun (Uttarakhand)", labelHi: "देहरादून", lat: 30.3165, lon: 78.0322, region: "india" },
  { id: "in-wb", labelEn: "Kolkata (West Bengal)", labelHi: "कोलकाता", lat: 22.5726, lon: 88.3639, region: "india" },
  { id: "in-an", labelEn: "Port Blair (A&N)", labelHi: "पोर्ट ब्लेयर", lat: 11.6234, lon: 92.7265, region: "india" },
  { id: "in-ch", labelEn: "Chandigarh (UT)", labelHi: "चंडीगढ़ (केंद्र)", lat: 30.7333, lon: 76.7794, region: "india" },
  { id: "in-dn", labelEn: "Daman (DNH&DD)", labelHi: "दमन", lat: 20.3974, lon: 72.8328, region: "india" },
  { id: "in-ld", labelEn: "Kavaratti (Lakshadweep)", labelHi: "कवरत्ती", lat: 10.5667, lon: 72.6417, region: "india" },
  { id: "in-dl", labelEn: "New Delhi (NCT)", labelHi: "नई दिल्ली", lat: 28.6139, lon: 77.209, region: "india" },
  { id: "in-jk", labelEn: "Srinagar (J&K)", labelHi: "श्रीनगर", lat: 34.0837, lon: 74.7973, region: "india" },
  { id: "in-la", labelEn: "Leh (Ladakh)", labelHi: "लेह", lat: 34.1526, lon: 77.5771, region: "india" },
  { id: "in-py", labelEn: "Puducherry", labelHi: "पुदुच्चेरी", lat: 11.9416, lon: 79.8083, region: "india" },

  /* World — major hubs */
  { id: "w-dhaka", labelEn: "Dhaka", labelHi: "ढाका", lat: 23.8103, lon: 90.4125, region: "world" },
  { id: "w-kathmandu", labelEn: "Kathmandu", labelHi: "काठमांडू", lat: 27.7172, lon: 85.324, region: "world" },
  { id: "w-islamabad", labelEn: "Islamabad", labelHi: "इस्लामाबाद", lat: 33.6844, lon: 73.0479, region: "world" },
  { id: "w-colombo", labelEn: "Colombo", labelHi: "कोलंबो", lat: 6.9271, lon: 79.8612, region: "world" },
  { id: "w-beijing", labelEn: "Beijing", labelHi: "बीजिंग", lat: 39.9042, lon: 116.4074, region: "world" },
  { id: "w-tokyo", labelEn: "Tokyo", labelHi: "टोक्यो", lat: 35.6762, lon: 139.6503, region: "world" },
  { id: "w-singapore", labelEn: "Singapore", labelHi: "सिंगापुर", lat: 1.3521, lon: 103.8198, region: "world" },
  { id: "w-bangkok", labelEn: "Bangkok", labelHi: "बैंकॉक", lat: 13.7563, lon: 100.5018, region: "world" },
  { id: "w-jakarta", labelEn: "Jakarta", labelHi: "जकार्ता", lat: -6.2088, lon: 106.8456, region: "world" },
  { id: "w-sydney", labelEn: "Sydney", labelHi: "सिडनी", lat: -33.8688, lon: 151.2093, region: "world" },
  { id: "w-london", labelEn: "London", labelHi: "लंदन", lat: 51.5074, lon: -0.1278, region: "world" },
  { id: "w-paris", labelEn: "Paris", labelHi: "पेरिस", lat: 48.8566, lon: 2.3522, region: "world" },
  { id: "w-berlin", labelEn: "Berlin", labelHi: "बर्लिन", lat: 52.52, lon: 13.405, region: "world" },
  { id: "w-moscow", labelEn: "Moscow", labelHi: "मास्को", lat: 55.7558, lon: 37.6173, region: "world" },
  { id: "w-nyc", labelEn: "New York", labelHi: "न्यूयॉर्क", lat: 40.7128, lon: -74.006, region: "world" },
  { id: "w-dc", labelEn: "Washington DC", labelHi: "वाशिंगटन", lat: 38.9072, lon: -77.0369, region: "world" },
  { id: "w-toronto", labelEn: "Toronto", labelHi: "टोरंटो", lat: 43.6532, lon: -79.3832, region: "world" },
  { id: "w-mexico", labelEn: "Mexico City", labelHi: "मेक्सिको सिटी", lat: 19.4326, lon: -99.1332, region: "world" },
  { id: "w-saopaulo", labelEn: "São Paulo", labelHi: "साओ पाउलो", lat: -23.5505, lon: -46.6333, region: "world" },
  { id: "w-nairobi", labelEn: "Nairobi", labelHi: "नैरोबी", lat: -1.2921, lon: 36.8219, region: "world" },
  { id: "w-cairo", labelEn: "Cairo", labelHi: "काहिरा", lat: 30.0444, lon: 31.2357, region: "world" },
  { id: "w-lagos", labelEn: "Lagos", labelHi: "लागोस", lat: 6.5244, lon: 3.3792, region: "world" },
  { id: "w-johannesburg", labelEn: "Johannesburg", labelHi: "जोहान्सबर्ग", lat: -26.2041, lon: 28.0473, region: "world" },
  { id: "w-dubai", labelEn: "Dubai", labelHi: "दुबई", lat: 25.2048, lon: 55.2708, region: "world" },
  { id: "w-riyadh", labelEn: "Riyadh", labelHi: "रियाद", lat: 24.7136, lon: 46.6753, region: "world" },
  { id: "w-telaviv", labelEn: "Tel Aviv", labelHi: "तेल अवीव", lat: 32.0853, lon: 34.7818, region: "world" },
];
