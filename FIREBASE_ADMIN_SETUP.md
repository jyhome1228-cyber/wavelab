# AESOST 관리자 계정 설정

관리자 페이지는 별도 관리 코드를 사용하지 않습니다.
Firebase Authentication의 `planus253@naver.com` 계정만 AESOST 관리자 대시보드에 접근할 수 있습니다.

## 관리자 계정 조건

Firestore의 `users/{uid}` 문서가 아래 값을 가져야 합니다.

```text
email: planus253@naver.com
role: admin
status: active
```

클라이언트 화면과 Firestore 보안 규칙 모두 로그인 이메일을 `planus253@naver.com`으로 제한합니다. 다른 계정에 실수로 `role: admin`을 설정해도 회원 목록 전체 조회 권한이 부여되지 않습니다.

## 최초 1회 설정

1. AESOST에서 `planus253@naver.com`으로 회원가입하거나 로그인합니다.
2. Firebase Console → Firestore → 데이터로 이동합니다.
3. `users` 컬렉션에서 해당 이메일의 문서를 찾습니다.
4. `role` 값을 `admin`으로 변경합니다.
5. `status` 값이 `active`인지 확인합니다.
6. Firebase Console → Firestore → 규칙에서 저장소의 최신 `firestore.rules` 내용을 전체 붙여넣고 게시합니다.

## 관리자 접속

```text
https://wavelab.my/admin/
```

로그인되지 않은 상태에서는 기존 로그인 페이지로 이동합니다. 로그인 이메일이 `planus253@naver.com`이고 회원 문서의 역할과 상태가 올바를 때만 대시보드가 열립니다.

## 보안 구조

- 관리자 이메일은 `planus253@naver.com` 한 개로 고정합니다.
- 일반 회원은 자신의 `users/{uid}` 문서만 읽고 수정할 수 있습니다.
- 일반 회원은 자신의 `role`과 `status`를 변경할 수 없습니다.
- 지정된 관리자 계정만 `users` 컬렉션 전체 목록을 조회할 수 있습니다.
- Cloud Functions, Secret Manager, 별도 관리 코드는 사용하지 않습니다.
