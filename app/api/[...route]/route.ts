import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../../../lib/auth";
import { cors } from "hono/cors";

export const config = {
  runtime: "edge",
};

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath("/api");

app.use("*", async (c, next) => {
  const origin = c.req.header("expo-origin");
  console.log("Origen de la petición:", origin);
  await next();
});

app.use(
  "/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: ["http://192.168.1.60:8081"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/session", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

export const GET = handle(app);
export const POST = handle(app);
