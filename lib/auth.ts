import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";

// TODO: add the real volunteer email list once confirmed, then set
// ALLOWED_VOLUNTEER_EMAILS in .env.local as a comma-separated list, e.g.
// ALLOWED_VOLUNTEER_EMAILS="alice@example.com,bob@example.com"
// Individual exceptions (e.g. a volunteer using a personal Gmail instead of
// their club email) live here, alongside the domain-based check below.
const allowedEmails = (process.env.ALLOWED_VOLUNTEER_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// ALLOWED_EMAIL_DOMAIN is a comma-separated list of domains, e.g.
// ALLOWED_EMAIL_DOMAIN="roboroos.org.au,students.roboroos.org.au"
const allowedEmailDomains = (process.env.ALLOWED_EMAIL_DOMAIN ?? "")
  .split(",")
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
  .filter(Boolean);

function isAllowedEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (allowedEmails.includes(normalized)) return true;

  const domain = normalized.split("@")[1];
  return domain ? allowedEmailDomains.includes(domain) : false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return isAllowedEmail(user.email);
    },
  },
};

/**
 * Throws if there is no signed-in, allowlisted session. Use at the top of
 * every server action so mutations are never reachable without a valid
 * session, even if a route slips past the proxy matcher.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Not signed in");
  }
  return session;
}
