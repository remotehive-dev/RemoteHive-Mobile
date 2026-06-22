import Constants from 'expo-constants';

const RAPIDAPI_KEY = Constants.expoConfig?.extra?.rapidapiKey || "";
const DJANGO_API_URL = Constants.expoConfig?.extra?.djangoApiUrl || "https://admin.remotehive.in";

export async function validatePhone(phone: string, countryCode: string = "IN"): Promise<{ valid: boolean; message?: string }> {
  try {
    const res = await fetch(`https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp?number=${phone}&country=${countryCode}`, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'phonenumbervalidatefree.p.rapidapi.com',
      },
    });
    const data = await res.json();
    if (data.valid !== undefined) return { valid: data.valid === true || data.valid === 'true' };
    return { valid: true };
  } catch {
    return { valid: true };
  }
}

export async function sendOtp(phone: string, countryCode: string, otp: string): Promise<boolean> {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
