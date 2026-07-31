export const ADMIN_EMAILS = [
  // 관리자 Firebase 로그인 이메일을 여기에 추가하세요.
  // 'name@example.com'
];

export function isAdminUser(user) {
  const email = user?.email?.toLowerCase();
  return Boolean(email && ADMIN_EMAILS.map(item => item.toLowerCase()).includes(email));
}
