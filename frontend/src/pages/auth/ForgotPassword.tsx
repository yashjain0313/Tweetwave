import { useState } from "react";
import { Link } from "react-router-dom";
import XSvg from "../../components/X";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";

interface ForgotPasswordState {
  email: string;
  submitted: boolean;
}

const ForgotPassword = () => {
  const [formData, setFormData] = useState<ForgotPasswordState>({
    email: "",
    submitted: false,
  });

  const { mutate: forgotPasswordMutation, isPending } = useMutation({
    mutationFn: async (email: string) => {
      try {
        const res = await axios.post(
          "/api/auth/forgot-password",
          { email },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return res.data;
      } catch (error) {
        if (isAxiosError(error)) {
          const errorMsg =
            error.response?.data?.message || "Failed to send OTP";
          toast.error(errorMsg);
        } else {
          console.error(error);
          toast.error("An unexpected error occurred");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("OTP sent to your email");
      // Update state to indicate submission success and store email for next step
      setFormData((prev) => ({ ...prev, submitted: true }));
      // Store email in session storage for the verify OTP page
      sessionStorage.setItem("resetEmail", formData.email);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    forgotPasswordMutation(formData.email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              {formData.submitted ? "Check your email" : "Reset your password"}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {formData.submitted
                ? `We've sent an OTP code to ${formData.email}`
                : "Enter your email to receive a password reset code"}
            </p>
          </div>

          <div className="mt-8">
            {!formData.submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-400"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 bg-zinc-900 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:outline-none sm:text-sm sm:leading-6"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-zinc-400 hover:text-white"
                  >
                    Back to login
                  </Link>
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
                        Sending OTP...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <p className="text-zinc-400">
                  Please check your email and click the link below to enter the
                  verification code.
                </p>
                <Link
                  to="/verify-otp"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  Enter verification code
                </Link>
                <p className="text-sm text-center text-zinc-500">
                  Didn't receive the email?{" "}
                  <button
                    className="text-blue-500 hover:text-blue-400"
                    onClick={() => forgotPasswordMutation(formData.email)}
                    disabled={isPending}
                  >
                    {isPending ? "Sending..." : "Resend OTP"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
