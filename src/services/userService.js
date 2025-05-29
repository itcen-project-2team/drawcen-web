import api from "../utils/api";
import handleApiError from "../utils/handleApiError";

// 사용자 정보 가져오기 예시
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// 사용자 정보 수정 예시
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// 회원가입 예시
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
}; 