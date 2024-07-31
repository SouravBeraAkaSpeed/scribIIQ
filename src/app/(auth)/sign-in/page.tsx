"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
} from "next-auth/react";
import { Boxes } from "@/components/background-box";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/input";
import { BuiltInProviderType } from "next-auth/providers/index";
import { toast } from "@/components/ui/use-toast";
import { Session } from "next-auth";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { signUp } from "next-auth-sanity/client";
import { client } from "@/lib/sanity_client";
import Loader2 from "@/components/Loader2";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const searchParams = useSearchParams();




  const [providers, setproviders] = useState<Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
        const data = await sessionRes.json();
        if (data.user) {
          setSession({
            user: data.user,
            expires: data.expires,
          });
        }
      } else {
        setSession(null);
      }
    };
    getSession();
    const getProvider = async () => {
      const providers = await getProviders();
      setproviders(providers);
      console.log(providers);
    };

    getProvider();
  }, []);

  useEffect(() => {
    if (session) {
      const redirect_url = searchParams.get("redirect_url")
      console.log("url", redirect_url)
      if (redirect_url) {
        router.push(`${redirect_url}`)
      } else {

        router.push("/");
      }
    }
  }, [session]);

  interface JwtPayload {
    id: string;
    email: string;
    name: string;
    jti: string;
  }

  const handleoAuthSignIn = async (token: string | undefined) => {
    try {
      setIsLoading(true);
      if (token) {
        const decoded = jwtDecode(token) as JwtPayload;

        if (decoded.email && decoded.jti) {
          const query = `*[_type == "user" && email == "${decoded.email}"]`;
          const users = await client.fetch(query);

          if (users.length === 0) {
            await signUp({
              email: decoded.email,
              password: decoded.jti,
              name: decoded.name,
              role: "user",
            }).then(async (value) => {
              const response = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                  email: decoded.email,
                  key: "0e345fd7e4a97271dffa991f5a893cd16b8e0827",
                }),
                headers: { "Content-Type": "application/json" },
              });

              const data = await response.json();

              if (data.success) {
                // Save session token to local storage
                localStorage.setItem("sessionToken", data.token);

                // Fetch session details

                toast({
                  title: `Signing In!!`,
                  description: "You are successfully signed in",
                  variant: "default",
                });

                // Redirect after successful sign-in
              } else {
                toast({
                  title: `Sign In Failed`,
                  variant: "destructive",
                });
              }
              toast({
                title: `Signing In!!`,
                description: "You are successfuly signed In",
                variant: "default",
              });

              const redirect_url = searchParams.get("redirect_url")
              console.log("url", redirect_url)
              if (redirect_url) {
                router.push(`${redirect_url}`)
              } else {

                router.push("/");
              }
            });
          } else {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              body: JSON.stringify({
                email: decoded.email,
                key: "0e345fd7e4a97271dffa991f5a893cd16b8e0827",
              }),
              headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (data.success) {
              // Save session token to local storage
              localStorage.setItem("sessionToken", data.token);

              // Fetch session details

              toast({
                title: `Signing In!!`,
                description: "You are successfully signed in",
                variant: "default",
              });

              // Redirect after successful sign-in
            } else {
              toast({
                title: `Sign In Failed`,
                variant: "destructive",
              });
            }
            toast({
              title: `Signing In!!`,
              description: "You are successfuly signed In",
              variant: "default",
            });

            const redirect_url = searchParams.get("redirect_url")
            console.log("url", redirect_url)
            if (redirect_url) {
              router.push(`${redirect_url}`)
            } else {

              router.push("/");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({
        title: `Unknown error occurred`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          key: "0e345fd7e4a97271dffa991f5a893cd16b8e0827",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        // Save session token to local storage
        localStorage.setItem("sessionToken", data.token);

        // Fetch session details
        const sessionRes = await fetch(
          `/api/auth/getSession?token=${data.token}`,
        );
        const sessionData = await sessionRes.json();

        if (sessionData.user) {
          toast({
            title: `Signing In!!`,
            description: "You are successfully signed in",
            variant: "default",
          });

          // Redirect after successful sign-in
          const redirect_url = searchParams.get("redirect_url")
          console.log("url", redirect_url)
          if (redirect_url) {
            router.push(`${redirect_url}`)
          } else {

            router.push("/");
          }
        } else {
          toast({
            title: `Session retrieval failed`,
            description: sessionData.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: `Sign In Failed`,
          description: data.error,
          variant: "destructive",
        });
      }
      toast({
        title: `Signing In!!`,
        description: "You are successfuly signed In",
        variant: "default",
      });
      setIsLoading(false);
      const redirect_url = searchParams.get("redirect_url")
      console.log("url", redirect_url)
      if (redirect_url) {
        router.push(`${redirect_url}`)
      } else {

        router.push("/");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({
        title: `Unknown error occurred`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center overflow-hidden  bg-black">
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full bg-black [mask-image:radial-gradient(transparent,white)]" />

      <Boxes />
      <div className="z-50 my-2 flex h-fit max-w-md flex-col items-center justify-center text-white">
        <h2 className=" text-left text-2xl font-bold">
          Welcome Back 
        </h2>
        <h4 className="text-md my-2 text-left">
          Empowering human growth through innovation
        </h4>
      </div>
      <div className="z-50 flex h-fit md:w-[32%] w-[90%] flex-col text-white items-center justify-center rounded-[14px] bg-black shadow-input ">
        <form onSubmit={handleSignIn} className="w-full    p-6 ">
          <div className="my-4">
            <Label className="my-2 font-bold">Email</Label>
            <Input
              type="email"
              placeholder="projectweb@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="my-4">
            <Label className="my-2 font-bold">Password</Label>
            <Input
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          {isLoading && (
            <div className="fixed inset-0 m-auto z-100  bg-white w-full h-full flex  flex-col  flex-1 items-center justify-center text-white">
              <Loader2 />
              Loading
            </div>
          )}
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >

            Sign In &rarr;

            <BottomGradient />
          </button>
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <button
            type="button"
            onClick={() => router.push("/sign-up")}
            className=" w-full rounded-[15px] border-2 border-purple-600 py-2 text-white hover:bg-purple-800"
          >
            Sign Up
            <BottomGradient />
          </button>

          <div className="my-4  flex h-[50px] w-full items-center justify-center space-x-2 rounded-full bg-white">
            <GoogleLogin
              useOneTap
              auto_select
              containerProps={{ style: { backgroundColor: "white" } }}
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
                handleoAuthSignIn(credentialResponse.credential);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
