import Cookies from "js-cookie";

/**
 * Checks if a given user object has an authenticated role.
 * Handles various backend shapes (string role, Strapi role object, roles array, etc.)
 */
export const isAdminUser = (user: any): boolean => {
  if (!user) return false;

  // Check direct string role
  if (typeof user.role === "string") {
    const r = user.role.trim().toLowerCase();
    if (r === "authenticated" || r === "administrator") return true;
  }

  // Check object role (e.g. Strapi standard { id, name, type })
  if (typeof user.role === "object" && user.role !== null) {
    const name = String(user.role.name || "")
      .trim()
      .toLowerCase();
    const type = String(user.role.type || "")
      .trim()
      .toLowerCase();
    if (
      name === "authenticated" ||
      type === "authenticated" ||
      name === "administrator"
    ) {
      return true;
    }
  }

  // Check roles array if present
  if (Array.isArray(user.roles)) {
    const hasAdmin = user.roles.some((r: any) => {
      if (typeof r === "string") {
        return r.trim().toLowerCase() === "authenticated";
      }
      if (typeof r === "object" && r !== null) {
        return (
          String(r.name || "")
            .trim()
            .toLowerCase() === "authenticated" ||
          String(r.type || "")
            .trim()
            .toLowerCase() === "authenticated"
        );
      }
      return false;
    });
    if (hasAdmin) return true;
  }

  // Check auxiliary role properties
  if (
    typeof user.roleName === "string" &&
    user.roleName.toLowerCase() === "authenticated"
  ) {
    return true;
  }
  if (
    typeof user.userRole === "string" &&
    user.userRole.toLowerCase() === "authenticated"
  ) {
    return true;
  }
  if (user.isAdmin === true || user.is_admin === true) {
    return true;
  }

  return false;
};

/**
 * Specifically checks if user has the Admin role (excluding regular Authenticated role)
 */
export const hasAdminRole = (user: any): boolean => {
  if (!user) return false;

  if (user.isAdmin === true || user.is_admin === true) {
    return true;
  }

  if (typeof user.role === "string") {
    const r = user.role.trim().toLowerCase();
    if (r === "admin" || r === "administrator") return true;
  }

  if (typeof user.role === "object" && user.role !== null) {
    const name = String(user.role.name || "")
      .trim()
      .toLowerCase();
    const type = String(user.role.type || "")
      .trim()
      .toLowerCase();
    if (
      name === "admin" ||
      type === "admin" ||
      name === "administrator" ||
      type === "administrator"
    ) {
      return true;
    }
  }

  if (Array.isArray(user.roles)) {
    const hasAdmin = user.roles.some((r: any) => {
      if (typeof r === "string") {
        const str = r.trim().toLowerCase();
        return str === "admin" || str === "administrator";
      }
      if (typeof r === "object" && r !== null) {
        const name = String(r.name || "")
          .trim()
          .toLowerCase();
        const type = String(r.type || "")
          .trim()
          .toLowerCase();
        return (
          name === "admin" ||
          type === "admin" ||
          name === "administrator" ||
          type === "administrator"
        );
      }
      return false;
    });
    if (hasAdmin) return true;
  }

  if (typeof user.roleName === "string") {
    const r = user.roleName.toLowerCase();
    if (r === "admin" || r === "administrator") return true;
  }

  if (typeof user.userRole === "string") {
    const r = user.userRole.toLowerCase();
    if (r === "admin" || r === "administrator") return true;
  }

  return false;
};

/**
 * Retrieves the currently stored user from cookies or localStorage
 */
export const getStoredUser = (): any => {
  try {
    const userCookie = Cookies.get("username");
    if (userCookie) {
      return JSON.parse(userCookie);
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    }
  } catch {
    // Return raw cookie string if not valid JSON
    return Cookies.get("username") || null;
  }
  return null;
};
