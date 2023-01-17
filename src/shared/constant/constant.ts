export const Constants = {
  JWT_TOKEN_VALIDITY: '24h',
  JWT_REFRESH_TOKEN_VALIDITY: '24h',
  USER: 'user',
  ADMIN: 'admin',
  CLIENT: 'client'
};

export const csrfExcludeRoutes = ['/api/v1/user/logout', '/api/v1/user', '/api/v1/admin/login'];
