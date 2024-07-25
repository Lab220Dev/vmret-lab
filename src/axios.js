import axios from 'axios';

//http://vmretnew.sgilab220.com.br/api
const instance = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

export default instance;
