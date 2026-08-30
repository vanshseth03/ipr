export function createApiError(error = {}) {
  return {
    status: error.status ?? null,
    code: error.code ?? null,
    message: error.message ?? 'An unexpected error occurred.',
    details: error.details ?? null,
  };
}

export function isApiSuccess(response) {
  return Boolean(response) && (
    response.success === true ||
    (typeof response.status === 'number' &&
      response.status >= 200 &&
      response.status < 300)
  );
}
