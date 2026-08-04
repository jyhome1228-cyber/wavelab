# AESOST 관리자 계정 설정

관리자 페이지는 별도 관리 코드를 사용하지 않습니다.
기존 AESOST 회원 계정으로 로그인한 뒤, Firestore `users/{uid}` 문서의 `role` 값이 `admin`인 계정만 `/admin/`에 접근할 수 있습니다.

## 최초 1회 설정

1. AESOST에서 관리자용 계정으로 회원가입하거나 로그인합니다.
2. Firebase Console → Firestore → 데이터로 이동합니다.
3. `users` 컬렉션에서 해당 계정 문서를 찾습니다.
4. 해당 문서의 `role` 값을 `member`에서 `admin`으로 변경합니다.
5. `status` 값이 `active`인지 확인합니다.
6. Firebase Console → Firestore → 규칙에서 저장소의 `firestore.rules` 내용을 붙여넣고 게시합니다.

## 관리자 접속

```text
https://wavelab.my/admin/
```

로그인되지 않은 상태에서는 기존 로그인 페이지로 이동합니다.
로그인 후 현재 계정의 `users/{uid}.role`이 `admin`이고 `status`가 `active`일 때만 회원 현황 대시보드가 열립니다.

## 보안 구조

- 일반 회원은 자신의 `users/{uid}` 문서만 읽고 수정할 수 있습니다.
- 일반 회원은 자신의 `role`과 `status`를 변경할 수 없습니다.
- 관리자 계정만 `users` 컬렉션 전체 목록을 조회할 수 있습니다.
- 관리자 권한은 Firebase Console에서 직접 지정한 계정에만 부여합니다.
- Cloud Functions, Secret Manager, 별도 관리 코드는 사용하지 않습니다.
