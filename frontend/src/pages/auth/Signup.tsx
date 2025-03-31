import React, { useState } from "react";
import XSvg from "../../components/X";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { signInWithGoogle } from "../../utils/firebase/firebase.ts";

interface FormInput {
  username: string;
  email: string;
  password: string;
  fullname: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormInput>({
    username: "",
    email: "",
    password: "",
    fullname: "",
  });

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullname, password }: FormInput) => {
      try {
        const res = await axios.post(
          "/api/auth/signup",
          {
            email,
            username,
            fullname,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Account created successfully");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        return res.data;
      } catch (error) {
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

  const { mutate: googleSignupMutation, isPending: isGooglePending } =
    useMutation({
      mutationFn: async () => {
        try {
          const userData = await signInWithGoogle();
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          return userData;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const errorMsg =
              error.response?.data?.message || "Failed to sign up with Google";
            toast.error(errorMsg);
          } else {
            console.error(error);
            toast.error("An unexpected error occurred during Google sign-up");
          }
          throw error;
        }
      },
      onSuccess: () => {
        toast.success("Successfully signed up with Google");
        navigate("/");
      },
      onError: (error) => {
        console.error("Google sign-up error:", error);
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGoogleSignup = () => {
    googleSignupMutation();
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Join the Tweetwave community today
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

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
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    required
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                    placeholder="Enter your full name"
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
                    placeholder="Create a password"
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Password should be at least 8 characters
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>

              {isError && (
                <div className="bg-red-900/20 border border-red-700 rounded-md p-3 text-sm text-red-400">
                  {error.message || "An error occurred during sign up."}
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
                  onClick={handleGoogleSignup}
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
