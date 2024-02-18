import { ClientError } from "~/application/errors";
import { getAuthUser } from "~/server/auth";

export const authenticateAdminUser = async () => {
  const user = await getAuthUser();
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    throw ClientError.NotAuthenticated();
  } else if (!user.isAdmin) {
    throw ClientError.Forbidden();
  }
  return user;
};
