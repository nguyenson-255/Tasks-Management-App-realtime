import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = axios.create({
    baseURL: `http://${process.env.BASE_URL ?? 'localhost'}:3001`,
    headers: {
      "Content-Type": "application/json",
    },
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response
  },
  function (error) {
    let navigate = useNavigate();
    
    const originalRequest = error.config

    if (
      error.response.status === 401 &&
      originalRequest.url === `http://${process.env.BASE_URL}:3001/api/users/login`
    ) {
      navigate('/login');
      return Promise.reject(error)
    }

    // if (error.response.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true
    //   const refreshToken = localStorageService.getRefreshToken()
    //   return axios
    //     .post('/auth/token', {
    //       refresh_token: refreshToken
    //     })
    //     .then(res => {
    //       if (res.status === 201) {
    //         localStorageService.setToken(res.data)
    //         axios.defaults.headers.common['Authorization'] =
    //           'Bearer ' + localStorageService.getAccessToken()
    //         return axios(originalRequest)
    //       }
    //     })
    // }
    return Promise.reject(error)
  }
)

export default api;
