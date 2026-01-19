# SQLMaker
SQL 만들어주는 웹 프로젝트

MyBatis 기반 SQL 쿼리를 쉽게 생성할 수 있는 웹 애플리케이션입니다.

## 기능

- **SELECT 쿼리 생성**: 테이블과 칼럼을 선택하여 SELECT 문 생성
- **INSERT 쿼리 생성**: INSERT 문과 VALUES 자동 생성
- **UPDATE 쿼리 생성**: SET 절과 WHERE 조건을 포함한 UPDATE 문 생성
- **DELETE 쿼리 생성**: WHERE 조건을 포함한 DELETE 문 생성
- **WHERE 조건 설정**: 여러 조건을 동적으로 추가 가능
- **MyBatis XML 형식**: 생성된 쿼리는 MyBatis XML mapper 형식
- **클립보드 복사**: 생성된 쿼리를 원클릭으로 복사

## 사용 방법

1. `index.html` 파일을 브라우저에서 열기
2. 쿼리 타입 선택 (SELECT, INSERT, UPDATE, DELETE)
3. 테이블 명 입력
4. 칼럼 명 입력 (쉼표로 구분)
5. WHERE 조건 설정 (필요시)
6. MyBatis Statement ID 입력
7. "쿼리 생성" 버튼 클릭
8. 생성된 쿼리를 "복사하기" 버튼으로 클립보드에 복사

## 로컬 실행

웹 브라우저에서 직접 `index.html` 파일을 열거나, 로컬 웹 서버를 실행하세요:

```bash
# Python 3 사용
python3 -m http.server 8080

# 브라우저에서 http://localhost:8080 접속
```

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript (프레임워크 없음)
- MyBatis XML Mapper 형식
