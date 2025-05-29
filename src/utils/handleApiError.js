// API 에러를 일관되게 처리하는 함수
export default function handleApiError(error) {
  let message = "알 수 없는 에러가 발생했습니다.";

  if (error.response) {
    // 서버가 응답한 에러
    message = error.response.data?.message || `오류 코드: ${error.response.status}`;
  } else if (error.request) {
    // 요청은 됐으나 응답이 없음
    message = "서버로부터 응답이 없습니다.";
  } else if (error.message) {
    // 기타 에러
    message = error.message;
  }

  // 콘솔에 에러 전체 출력 (개발용)
  console.error(error);

  // 사용자에게 알림 (alert 또는 toast 등으로 대체 가능)
  alert(message);

  // 필요시 에러 메시지 반환
  return message;
} 