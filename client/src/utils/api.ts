// Use proxy routes to avoid mixed content errors (HTTPS -> HTTP)
const API_BASE_URL = '/api/proxy';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: string;
  preferred_language?: string;
  gender?: string;
  location?: string;
  user_relation?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface RegisterResponse {
  status: string;
  user_id: string;
  access_token?: string;
  token_type?: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    phone_number?: string;
    role: string;
    preferred_language: string;
    gender?: string;
    location?: string;
    user_relation?: string;
    profile_picture?: string;
    auth_provider?: string;
  };
}

export interface LoginResponse {
  status: string;
  user_id: string;
  access_token?: string;
  token_type?: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    phone_number?: string;
    role: string;
    preferred_language: string;
    gender?: string;
    location?: string;
    user_relation?: string;
    profile_picture?: string;
    auth_provider?: string;
  };
}

export interface ChatResponse {
  reply: string;
  mode?: string;
  language?: string;
  youtube_link?: string;
  infographic_url?: string;
  route?: string;
  intent?: string;
}

export interface OnboardingStepRequest {
  parent_profile_id: string;
  relationship_type: string;
  current_step: number;
  answers_json: Record<string, any>;
}

export interface OnboardingStepResponse {
  completed: boolean;
  question?: {
    id: number;
    question: string;
    type: string;
    field_name: string;
    options?: string[];
    optional?: boolean;
  };
  total_steps?: number;
  parent_profile_id?: string;
  relationship_type?: string;
  answers_json?: Record<string, any>;
}

export interface OnboardingCompleteRequest {
  user_id: string;              // REQUIRED - Must be snake_case
  relationship_type: string;    // REQUIRED - Must be snake_case (herself, himself, father, mother, father_in_law, mother_in_law, sibling)
  answers_json: Record<string, any>; // REQUIRED - Must be snake_case
  target_user_id?: string;      // OPTIONAL - Can be null
  parent_profile_id?: string;   // OPTIONAL - Only for updates, can be null
}

export async function registerUser(data: RegisterUserData): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      phone_number: data.phone_number || null,
      role: data.role || 'USER',
      preferred_language: data.preferred_language || 'en',
      gender: data.gender || null,
      location: data.location || null,
      user_relation: data.user_relation || null,
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
    }
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    throw new Error(result.detail || result.error || result.message || 'Registration failed');
  }

  return result;
}

export async function loginUser(data: LoginUserData): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
    }
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    throw new Error(result.detail || result.error || result.message || 'Login failed');
  }

  return result;
}

export async function sendChatMessage(
  userId: string,
  message: string,
  language: string = 'en',
  mode: string = 'pre_care',
  treatmentContext?: any,
  sessionId?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/sakhi/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'x-session-id': sessionId } : {}),
    },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      language: language,
      lang: language,
      mode: mode,
      treatmentContext: treatmentContext,
      sessionId: sessionId,
    }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Chat request failed');
  }

  return await response.json();
}

export async function checkInstantAnswer(
  userId: string, 
  message: string
): Promise<{ 
  found: boolean; 
  answer?: string; 
  youtube_link?: string | null; 
  infographic_url?: string | null; 
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/sakhi/check-instant-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        message: message,
      }),
    });

    if (!response.ok) {
      return { found: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking instant answer:', error);
    return { found: false };
  }
}

export async function getOnboardingStep(data: OnboardingStepRequest): Promise<OnboardingStepResponse> {
  const response = await fetch(`${API_BASE_URL}/onboarding/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parent_profile_id: data.parent_profile_id,
      relationship_type: data.relationship_type,
      current_step: data.current_step,
      answers_json: data.answers_json,
    }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to get onboarding step');
  }

  return await response.json();
}

export async function completeOnboarding(data: OnboardingCompleteRequest): Promise<void> {
  // Normalize relationship_type: convert hyphens to underscores for backend compatibility
  const normalizedRelationshipType = data.relationship_type.replace(/-/g, '_');

  const requestBody: Record<string, any> = {
    user_id: data.user_id,                    // REQUIRED
    relationship_type: normalizedRelationshipType, // REQUIRED - normalized to snake_case
    answers_json: data.answers_json,          // REQUIRED
  };

  // Only include optional fields if they have values
  if (data.target_user_id) {
    requestBody.target_user_id = data.target_user_id;
  }
  if (data.parent_profile_id) {
    requestBody.parent_profile_id = data.parent_profile_id;
  }

  console.log('📤 Sending onboarding complete request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${API_BASE_URL}/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const result = await response.json();
    console.error('❌ Onboarding complete failed:', result);
    throw new Error(result.detail || result.error || 'Failed to complete onboarding');
  }

  console.log('✅ Onboarding completed successfully');
}

export interface JourneyRequest {
  user_id: string;
  stage: string;       // 'TTC', 'PREGNANT', 'PARENT'
  date?: string;       // ISO date string
  date_type?: string;  // 'LMP', 'DUE_DATE', 'BIRTH_DATE'
}

export async function saveUserJourney(data: JourneyRequest): Promise<void> {
  console.log('📤 Saving user journey:', data);
  const response = await fetch(`${API_BASE_URL}/user/journey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    console.error('❌ Failed to save journey:', result);
    // Don't throw error to avoid blocking UI, just log it
  } else {
    console.log('✅ Journey saved successfully');
  }
}

export async function deleteUserJourney(userId: string): Promise<void> {
  console.log('📤 Deleting user journey:', userId);
  const response = await fetch(`${API_BASE_URL}/user/journey/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const result = await response.json();
    console.error('❌ Failed to delete journey:', result);
    throw new Error('Failed to delete journey');
  } else {
    console.log('✅ Journey deleted successfully');
  }
}

export interface JourneyResponse {
  stage: string;
  date?: string;
  date_type?: string;
}

export async function fetchUserJourney(userId: string): Promise<JourneyResponse | null> {
  try {
    console.log('📥 Fetching user journey for:', userId);
    const response = await fetch(`${API_BASE_URL}/user/journey/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.log('ℹ️ No journey found on server');
      return null;
    }

    const data = await response.json();
    
    // The backend may return { journey: null } or { stage: '...', date: '...' }
    if (data.journey === null) {
      console.log('ℹ️ No journey stored for this user');
      return null;
    }

    // Handle both response shapes: { stage, date } or { journey: { stage, date } }
    const journey = data.journey || data;
    if (!journey.stage) {
      return null;
    }

    console.log('✅ Journey fetched:', journey);
    return journey as JourneyResponse;
  } catch (error) {
    console.error('Error fetching user journey:', error);
    return null;
  }
}

export interface ToolUsageData {
  user_id: string;
  tool_name: string;
  tool_data?: Record<string, any>;
}

export async function saveToolUsage(data: ToolUsageData): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/tool-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error('❌ Failed to save tool usage');
    } else {
      console.log('✅ Tool usage saved');
    }
  } catch (e) {
    console.error('Error saving tool usage:', e);
  }
}

/** Save tool usage locally when user is not logged in */
export function saveToolUsageOffline(tool_name: string, tool_data: Record<string, any>) {
  try {
    const raw = localStorage.getItem('tool_usage_offline');
    const existing = raw ? JSON.parse(raw) : [];
    existing.push({ tool_name, tool_data, timestamp: new Date().toISOString() });
    // Keep only last 50 entries to avoid bloat
    if (existing.length > 50) existing.splice(0, existing.length - 50);
    localStorage.setItem('tool_usage_offline', JSON.stringify(existing));
  } catch { /* silent */ }
}

export { API_BASE_URL };
