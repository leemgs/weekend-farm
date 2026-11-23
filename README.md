# 주말농장 아지트 (Weekend Farm Retreat)

흙을 만지고 계절을 기록하는 우리만의 주말농장 아지트 — 텃밭 캘린더, 대시보드,
사진첩, 자격증·교육센터·기후위기 등 귀촌/전원생활 정보 공간입니다.
정적 사이트로 `docs/` 폴더에서 GitHub Pages로 서비스됩니다.

사이트: <https://leemgs.github.io/weekend-farm/>

## 디렉터리 구조

```
docs/
├── index.html, dashboard.html, calendar.html, gallery.html, …   # 페이지
├── styles.css, i18n.js, app.js, dashboard.js, admin.js          # 공통 리소스
├── assets/
│   └── site.js          # 접속 코드 게이트 (initAuth / unlock)
└── config/
    └── access.json      # 접속 코드의 SHA-256 해시만 저장
```

## 접속 코드 게이트 (간단한 접근 제한)

이 사이트는 **초대받은 사용자를 위한 정보 공간**입니다. 방문자는 페이지 진입 시
접속 코드를 입력해야 하며, 동작 방식은 다음과 같습니다.

1. `docs/assets/site.js`의 `initAuth()`가 페이지 로드 시 실행됩니다. 이미 허용된
   상태(`sessionStorage`)가 아니면 전체 화면 게이트를 띄우고
   `docs/config/access.json`의 `digest`를 읽어 둡니다.
2. 사용자가 코드를 입력하면 `unlock()`이 그 코드를 **브라우저에서 SHA-256으로
   해시**한 뒤 `access.json`의 `digests` 목록과 비교합니다.
3. 목록 중 하나와 일치하면 `sessionStorage`에 접근 허용 상태를 기록하고 게이트를
   닫습니다. (같은 탭 세션 동안 유지되며, 평문 비밀번호는 어디에도 저장하지 않습니다.)

여러 개의 접속 코드를 둘 수 있습니다. 기본 코드는 **`hjoon0510`**, **`guest2848`**
두 가지입니다.

> ⚠️ **보안 경고**: 이것은 정적 사이트의 **간단한 접근 제한**이며, 민감정보 보호
> 목적이 아닙니다. 접속 코드의 해시가 클라이언트(`access.json`)에 그대로 노출되고
> 모든 검증이 브라우저에서 이뤄지므로, **진짜 보안 경계로 사용하지 마세요.**

## 접속 코드 변경 방법

1. 새 코드를 정합니다.
2. SHA-256 해시를 계산합니다.

   ```bash
   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('새코드').digest('hex'))"
   ```

3. `docs/config/access.json`의 `digest` 값을 교체하고 `version`을 올립니다.
   접속 코드를 여러 개 두려면 `digests` 배열에 각 코드의 해시를 나열합니다.

   ```json
   {
     "version": 2,
     "digests": [
       "<코드1의 해시값>",
       "<코드2의 해시값>"
     ]
   }
   ```

> 코드 입력 시 브라우저는 `TextEncoder`(UTF-8)로 인코딩해 해시하므로, 위 Node.js
> 명령도 UTF-8 기준으로 동일한 값을 만듭니다. 한글 코드도 사용할 수 있습니다.

## 로컬 미리보기

```bash
cd docs
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

> 접속 코드 게이트는 `crypto.subtle`을 사용하므로 **https 또는 localhost**
> (보안 컨텍스트)에서만 동작합니다.
