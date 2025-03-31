import React, { useState } from "react";
import XSvg from "../../components/X";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { signInWithGoogle } from "../../utils/firebase/firebase.ts";

interface FormInputs {
  username: string;
  password: string;
}

function Login() {
  const [formData, setFormData] = useState<FormInputs>({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }: FormInputs) => {
      try {
        const res = await axios.post(
          "/api/auth/login",
          {
            username,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        return res.data;
      } catch (error) {
        console.log(error);

        if (axios.isAxiosError(error)) {
          const errorMsg = isAxiosError(error)
            ? error.response?.data?.message
            : "Server is not responding";
          toast.error(errorMsg);
        } else {
          console.error(error);
          toast.error("An unexpected error occurred");
        }
        return;
      }
    },
  });

  const { mutate: googleLoginMutation, isPending: isGooglePending } =
    useMutation({
      mutationFn: async () => {
        try {
          const userData = await signInWithGoogle();
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          return userData;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const errorMsg =
              error.response?.data?.message || "Failed to sign in with Google";
            toast.error(errorMsg);
          } else {
            console.error(error);
            toast.error("An unexpected error occurred during Google sign-in");
          }
          throw error;
        }
      },
      onSuccess: () => {
        toast.success("Successfully signed in with Google");
        navigate("/");
      },
      onError: (error) => {
        console.error("Google sign-in error:", error);
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGoogleLogin = () => {
    googleLoginMutation();
  };

  return (
    <div className="w-full h-screen flex bg-black text-white">
      {/* Left Panel with Logo - Hidden on mobile, 50% on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <XSvg className="w-2/3 fill-zinc-800" />
      </div>

      {/* Right Panel - Full width on mobile, 50% on desktop */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center lg:items-start">
            <XSvg className="w-12 h-12 lg:hidden fill-white mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Continue your journey in the Tweetwave community
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-zinc-400 hover:text-white"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all duration-200"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              {isError && (
                <div className="bg-red-900/20 border border-red-700 rounded-md p-3 text-sm text-red-400">
                  {error.message || "An error occurred during sign in."}
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black px-2 text-zinc-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGooglePending}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all duration-200"
                >
                  {isGooglePending ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <FcGoogle className="h-5 w-5" />
                      <span>Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-white hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
