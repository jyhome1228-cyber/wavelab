# AESOST 관리자 대시보드 Firebase 배포

관리자 페이지는 회원 이메일과 가입 정보를 다루기 때문에 Firestore `users` 컬렉션을 공개 읽기로 열지 않습니다.
관리 코드 확인은 Cloud Functions에서 처리하고, 성공한 세션에만 `memberDashboard` 권한이 포함된 Firebase Custom Token을 발급합니다.

## 최초 1회 준비

1. Firebase 프로젝트 `wavelab-5aa38`을 Blaze 요금제로 전환합니다.
2. 로컬에 Firebase CLI를 설치하고 로그인합니다.

```bash
npm install -g firebase-tools
firebase login
firebase use wavelab-5aa38
```

3. 관리자 코드를 Secret Manager에 저장합니다.

```bash
firebase functions:secrets:set AESOST_ADMIN_ACCESS_CODE
```

명령 실행 후 관리자 페이지에서 사용할 코드를 입력합니다. 코드는 저장소나 자바스크립트 파일에 작성하지 않습니다.

## 규칙과 함수 배포

프로젝트 루트에서 아래 명령을 실행합니다.

```bash
firebase deploy --only firestore:rules,functions:createAdminSession
```

배포가 완료되면 아래 주소에서 관리 코드를 입력합니다.

```text
https://wavelab.my/admin/
```

## 코드 변경

관리 코드를 바꿀 때는 새 값을 Secret Manager에 저장한 뒤 함수만 다시 배포합니다.

```bash
firebase functions:secrets:set AESOST_ADMIN_ACCESS_CODE
firebase deploy --only functions:createAdminSession
```

## 보안 구조

- `users` 전체 목록은 일반 방문자와 일반 회원에게 공개되지 않습니다.
- 코드 검증은 브라우저가 아니라 Cloud Functions에서 수행합니다.
- 성공한 관리자 세션에만 `memberDashboard: true` 커스텀 클레임이 발급됩니다.
- 해당 클레임은 `users` 컬렉션 조회에만 사용되며 다른 관리자 쓰기 권한을 부여하지 않습니다.
- 코드 입력 실패는 IP 기준으로 제한됩니다.
