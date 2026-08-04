const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

initializeApp();

const ADMIN_ACCESS_CODE = defineSecret('AESOST_ADMIN_ACCESS_CODE');
const REGION = 'asia-northeast3';
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 5 * 60 * 1000;

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

exports.createAdminSession = onCall(
  {
    region: REGION,
    secrets: [ADMIN_ACCESS_CODE],
    timeoutSeconds: 15,
    memory: '256MiB',
    maxInstances: 5
  },
  async request => {
    const code = String(request.data?.code || '');
    if (!code || code.length > 120) {
      throw new HttpsError('invalid-argument', '관리 코드를 확인해 주세요.');
    }

    const ip = request.rawRequest?.ip || request.rawRequest?.headers?.['x-forwarded-for'] || 'unknown';
    const attemptRef = getFirestore().collection('_adminRateLimits').doc(hash(ip).slice(0, 64));
    const now = Date.now();
    const valid = safeEqual(code, ADMIN_ACCESS_CODE.value());

    await getFirestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(attemptRef);
      const current = snapshot.exists ? snapshot.data() : {};
      const blockedUntil = Number(current.blockedUntil || 0);

      if (blockedUntil > now) {
        throw new HttpsError('resource-exhausted', '잠시 후 다시 시도해 주세요.');
      }

      if (valid) {
        transaction.delete(attemptRef);
        return;
      }

      const windowStartedAt = Number(current.windowStartedAt || 0);
      const withinWindow = windowStartedAt && now - windowStartedAt < ATTEMPT_WINDOW_MS;
      const attempts = withinWindow ? Number(current.attempts || 0) + 1 : 1;
      const shouldBlock = attempts >= MAX_ATTEMPTS;

      transaction.set(attemptRef, {
        attempts: shouldBlock ? 0 : attempts,
        windowStartedAt: withinWindow ? windowStartedAt : now,
        blockedUntil: shouldBlock ? now + BLOCK_MS : 0,
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    if (!valid) {
      throw new HttpsError('permission-denied', '관리 코드가 올바르지 않습니다.');
    }

    const token = await getAuth().createCustomToken('aesost-member-dashboard-admin', {
      memberDashboard: true,
      adminSession: 'aesost'
    });

    return { token };
  }
);
