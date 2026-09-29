// Rate limiting and brute force protection for login/OTP

import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MINUTES = 15;

// Key prefixes for storage
export const RATE_LIMIT_KEY = 'login_attempts_';
export const LOCKOUT_KEY = 'lockout_';

export interface RateLimitState {
  attempts: number;
  timestamp: number;
  locked: boolean;
  remainingTimeMinutes: number;
}

/**
 * Check if the current attempt is rate limited or locked out
 * Returns whether the attempt should be allowed and the current state
 */
export async function checkRateLimit(
  identifier: string,
  pb: any
): Promise<{ 
  allowed: boolean; 
  state: RateLimitState; 
  lockoutRemaining: number 
}> {
  // ═══ RREGULL TESTI (jo i sigurt për prodhim) ═══
  // Bypass i rate-limit për numrin e testuesit. Zgjidhja e sigurt do të ishte
  // kontrolli i rolit nga serveri/PocketBase, jo krahasim i string-ut.
  // Për prodhim: hiq TË GJITHË këtë bllok.
  if (__DEV__ && process.env.EXPO_PUBLIC_BYPASS_RATELIMIT === '1' && identifier.includes('697788899')) {
    return {
      allowed: true,
      state: { attempts: 0, timestamp: Date.now(), locked: false, remainingTimeMinutes: 0 },
      lockoutRemaining: 0
    };
  }

  try {
    const attemptsKey = `${RATE_LIMIT_KEY}${identifier}`;
    const lockedKey = `${LOCKOUT_KEY}${identifier}`;
    
    const data = await AsyncStorage.getItem(attemptsKey);
    const lockedData = await AsyncStorage.getItem(lockedKey);
    const now = Date.now();
    
    let attempts = 1;
    let locked = false;
    let lockoutEndTime = 0;
    let parsed: any = null;
    
    // Check if currently locked out
    if (lockedData) {
      parsed = JSON.parse(lockedData);
      lockoutEndTime = parsed.endTime;
      
      if (now > lockoutEndTime) {
        // Lockout period has passed, reset
        await AsyncStorage.removeItem(lockedKey);
        locked = false;
        attempts = 1;
      } else {
        locked = true;
        attempts = parsed.attempts || 1;
        // Return locked state with remaining time
        const elapsedMinutes = (now - parsed.timestamp) / (1000 * 60);
        const remainingMinutes = LOCKOUT_TIME_MINUTES - Math.round(elapsedMinutes);
        return {
          allowed: false,
          state: {
            attempts,
            timestamp: parsed.timestamp,
            locked: true,
            remainingTimeMinutes: remainingMinutes > 0 ? remainingMinutes : 0
          },
          lockoutRemaining: remainingMinutes
        };
      }
    }
    
    // Check attempts counter
    if (data) {
      parsed = JSON.parse(data);
      const elapsedMinutes = (now - parsed.timestamp) / (1000 * 60);
      
      // Reset counter if lockout period has passed
      if (elapsedMinutes > LOCKOUT_TIME_MINUTES) {
        attempts = 1;
      } else {
        attempts = parsed.attempts + 1;
      }
    }
    
    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS && !locked) {
      // Lock the account
      const lockoutEnd = now + (LOCKOUT_TIME_MINUTES * 60 * 1000);
      await AsyncStorage.setItem(lockedKey, JSON.stringify({
        attempts,
        timestamp: now,
        endTime: lockoutEnd
      }));
      
      const remainingMinutes = LOCKOUT_TIME_MINUTES - Math.round((now - (parsed?.timestamp || now)) / (1000 * 60));
      
      return {
        allowed: false,
        state: {
          attempts,
          timestamp: now,
          locked: true,
          remainingTimeMinutes: remainingMinutes > 0 ? remainingMinutes : 0
        },
        lockoutRemaining: remainingMinutes
      };
    }
    
    // Save attempt counter
    await AsyncStorage.setItem(attemptsKey, JSON.stringify({
      attempts,
      timestamp: now
    }));
    
    return {
      allowed: true,
      state: {
        attempts,
        timestamp: now,
        locked: false,
        remainingTimeMinutes: 0
      },
      lockoutRemaining: 0
    };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow the attempt on error
    return {
      allowed: true,
      state: {
        attempts: 1,
        timestamp: Date.now(),
        locked: false,
        remainingTimeMinutes: 0
      },
      lockoutRemaining: 0
    };
  }
}

/**
 * Reset the rate limit/lockout state for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${RATE_LIMIT_KEY}${identifier}`);
    await AsyncStorage.removeItem(`${LOCKOUT_KEY}${identifier}`);
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}

/**
 * Get the current rate limit state without making a new check
 */
export async function getRateLimitState(identifier: string): Promise<RateLimitState> {
  try {
    const data = await AsyncStorage.getItem(`${RATE_LIMIT_KEY}${identifier}`);
    const now = Date.now();
    
    if (data) {
      const parsed = JSON.parse(data);
      const elapsedMinutes = (now - parsed.timestamp) / (1000 * 60);
      
      if (elapsedMinutes > LOCKOUT_TIME_MINUTES) {
        return {
          attempts: 1,
          timestamp: now,
          locked: false,
          remainingTimeMinutes: 0
        };
      }
      
      return {
        attempts: parsed.attempts || 1,
        timestamp: parsed.timestamp,
        locked: false,
        remainingTimeMinutes: 0
      };
    }
    
    return {
      attempts: 1,
      timestamp: now,
      locked: false,
      remainingTimeMinutes: 0
    };
  } catch (error) {
    console.error('Get rate limit state error:', error);
    return {
      attempts: 1,
      timestamp: Date.now(),
      locked: false,
      remainingTimeMinutes: 0
    };
  }
}