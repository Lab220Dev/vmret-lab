import axios from 'axios';

//http://vmretnew.sgilab220.com.br/api
//http://localhost:3000/api
const instance = axios.create({
  baseURL: 'http://localhost:3000/api', 
});
// Interceptor de Requisição para adicionar o token Bearer
// instance.interceptors.request.use(config => {
//   const token = localStorage.getItem('token'); // Obtenha o token do localStorage ou de onde estiver armazenado
//   if (token) {
//     config.headers['Authorization'] = `Bearer ${token}`;
//   }
//   return config;
// });


export default instance;
