export function getCmsAdminToken() {
  return process.env.CMS_ADMIN_TOKEN?.trim() ?? "";
}

export function isCmsAdminTokenConfigured() {
  return Boolean(getCmsAdminToken());
}

export function isCmsAdminTokenValid(token: string | null | undefined) {
  const expected = getCmsAdminToken();
  return Boolean(expected && token && token === expected);
}

export function requireCmsAdminToken(token: string | null | undefined) {
  if (!isCmsAdminTokenValid(token)) {
    throw new Error("Invalid CMS admin token");
  }
}
