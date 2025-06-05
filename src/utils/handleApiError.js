// API 에러를 일관되게 처리하는 함수
const handleApiError = (error) => {
  if (error.response) {
    // 서버가 응답했지만 오류 상태 코드
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // 인증 오류 - 로그인 페이지로 리다이렉트
        break;
      case 403:
        // 권한 없음
        break;
      case 404:
        // 리소스를 찾을 수 없음
        break;
      case 500:
        // 서버 내부 오류
        break;
      default:
        // 기타 오류
        break;
    }
  } else if (error.request) {
    // 요청이 만들어졌지만 응답을 받지 못함 (네트워크 오류)
  } else {
    // 요청을 설정하는 중에 오류가 발생
  }
};

export default handleApiError; 